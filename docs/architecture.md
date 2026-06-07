# Architecture & System Design

How KasaCart is put together, how a request flows through it, and **why** each major
decision was made. For a file map see [project-structure.md](./project-structure.md).

---

## 1. The stack

| Layer | Choice | Version | Why |
| --- | --- | --- | --- |
| Framework | Next.js (App Router) | 16.2.7 | File-based routing, RSC, server-side auth gating, Vercel-native. **Customised — see [`AGENTS.md`](../AGENTS.md).** |
| UI runtime | React | 19.2.4 | Latest; uses the **React Compiler** (`reactCompiler: true` in `next.config.ts`) so we rarely hand-write `useMemo`/`useCallback`. |
| Styling | Tailwind CSS | v4 | Utility-first, configured entirely in CSS (`@theme` in `globals.css`) — no `tailwind.config.js`. |
| Auth | Clerk (`@clerk/nextjs`) | ^7 | Hosted auth UI + middleware; we don't store passwords. |
| ORM | Prisma | ^7.8 | Type-safe DB access; client generated into `src/generated/prisma`. |
| Database | Postgres on Neon | — | Serverless Postgres; pooled URL for the app, direct URL for migrations. |
| Icons | `lucide-react` | ^1 | Consistent icon set used everywhere. |
| Fonts | `next/font/google` | — | Bricolage Grotesque (display), Hanken Grotesk (body), Geist Mono (mono). |

Language is **TypeScript (strict)** throughout. Path alias `@/*` → `src/*` (see
`tsconfig.json`).

---

## 2. The three surfaces

KasaCart is really three apps sharing one codebase, split by URL.

### A. Marketing site — `/`  (public)
The landing page (`src/app/page.tsx`) composed of section components in
`src/components/ui_components/home/` (Hero, Features, Convincing, Footer, plus a Navbar).
No auth. Its job is to convert visitors into sign-ups.

### B. Public storefront — `/store/[handle]`  (public)
What a shopper sees when they open a seller's shared link. Lives **outside** the `(portal)`
route group on purpose, so it has **no dashboard chrome and no auth gate** — anyone with the
link can browse and order. The whole experience (catalogue, product detail, cart drawer,
checkout, success screen) is one big client component:
`src/components/ui_components/store/StoreFront.tsx`. Checkout currently produces a local
`PlacedOrder` and offers a **WhatsApp hand-off** (`wa.me` deep link) rather than processing
payment.

### C. Seller portal — `(portal)`  (auth-gated)
The dashboard. Eight pages under the `(portal)` route group:

| Route | Page file | Purpose |
| --- | --- | --- |
| `/dashboard` | `(portal)/dashboard/page.tsx` | KPIs, order pipeline, recent orders, top products. Read-only. |
| `/orders` | `(portal)/orders/page.tsx` | Orders table with search, filters, create/edit/delete. |
| `/products` | `(portal)/products/page.tsx` | Product grid with search, create/edit/delete. |
| `/customers` | `(portal)/customers/page.tsx` | Customer table + summary tiles. Read-only. |
| `/storefront` | `(portal)/storefront/page.tsx` | Brand/theme editor with live laptop + phone preview. |
| `/payments` | `(portal)/payments/page.tsx` | Billing & plan (Free vs Pro). Pro is "coming soon". |
| `/analytics` | `(portal)/analytics/page.tsx` | Charts & breakdowns — currently behind a `ComingSoon` overlay. |
| `/settings` | `(portal)/settings/page.tsx` | Store details, notification toggles, danger zone. |

> The `(portal)` folder name is in parentheses, so it's a **Next.js route group** — it
> organises files and lets them share a layout **without** adding `/portal` to the URL.

---

## 3. Routing & layouts

```
src/app/
├── layout.tsx                 # ROOT layout — <html>, fonts, <ClerkProvider>, metadata
├── page.tsx                   # "/"  marketing home
├── (portal)/
│   ├── layout.tsx             # AUTH GATE + <PortalShell> (sidebar) for all 8 pages
│   └── <page>/page.tsx        # the eight dashboard pages
├── auth/
│   ├── login/[[...rest]]/page.tsx    # Clerk <SignIn>  (catch-all route)
│   └── signup/[[...rest]]/page.tsx   # Clerk <SignUp>
└── store/[handle]/page.tsx    # public storefront, resolves <StoreFront handle=…/>
```

- **Root layout** (`src/app/layout.tsx`) wraps everything in `<ClerkProvider>` and loads the
  three fonts as CSS variables (`--font-display`, `--font-body`, `--font-mono`). It sets
  `signInUrl="/auth/login"`, `signUpUrl="/auth/signup"`, `afterSignOutUrl="/"`.
- **Portal layout** (`src/app/(portal)/layout.tsx`) is a **server component** that calls
  `auth()` from `@clerk/nextjs/server` and `redirect("/auth/login")` if there's no `userId`.
  This is the single auth gate for the whole dashboard. It then renders `<PortalShell>`
  (the client component that owns the sidebar, collapse state and theme toggle).
- **Auth pages** use Clerk's catch-all `[[...rest]]` segment so Clerk can own its sub-routes
  (verification, factor-two, etc.). `<SignIn>`/`<SignUp>` redirect to `/dashboard` on success.

### Middleware — `src/proxy.ts`
Clerk's middleware runs via `clerkMiddleware()`. The `matcher` excludes static assets and
always runs for app routes, API/tRPC, and Clerk's auto-proxy path (`/__clerk/...`).

> **Note:** the middleware file is named **`proxy.ts`**, not the conventional `middleware.ts`
> — a detail of this customised Next.js. If you're looking for "the middleware", it's here.

---

## 4. Authentication flow (Clerk)

```
Visitor → /auth/signup (Clerk <SignUp>) → account created → redirect /dashboard
                                                   │
(portal)/layout.tsx server-side: auth() ──────────┤ has userId? ── no ──▶ redirect /auth/login
                                                   │
                                                  yes ──▶ render PortalShell + page
```

- Clerk is the **source of truth for identity**. The DB has a `users` table whose
  `clerk_user_id` links a Clerk identity to KasaCart data (see `database-schema.md` §4.1).
- The sidebar reads the live user via `useUser()` and renders Clerk's `<UserButton>` for
  account/sign-out.
- **Bootstrap:** on the first authenticated API request, `requireStore()`
  ([`src/lib/api/store.ts`](../src/lib/api/store.ts)) upserts the `users` row from the Clerk
  session and ensures a `stores` row (+ free subscription + notification prefs) exists, then
  scopes every query to it.

---

## 5. Current state: mock data vs. database

This is the **single most important thing to understand** before changing anything.

### How it works now
- The dashboard pages and the public storefront load and mutate data through the **service
  layer** ([`src/services/*`](../src/services), axios) → the **REST API** (`src/app/api/**`) →
  **Prisma/Neon**. Each page fetches on mount, maps the API DTOs to the UI shapes via
  [`src/utils/mappers.ts`](../src/utils/mappers.ts), shows a skeleton while loading / an
  `EmptyState` when empty, and toasts success/failure via **sonner**.
- **8 of 9 pages are wired:** Dashboard, Orders, Products, Customers, Storefront editor,
  Settings, Payments, and the public storefront (load + checkout). **Analytics** is the only
  page still on mock data — it sits behind `<ComingSoon>` and its charts don't map 1:1 to the
  analytics endpoint yet.
- On the **first** authenticated request, `requireStore()` bootstraps the seller's
  `users`/`stores` row (+ free subscription + notification prefs) from the Clerk session
  (see §4 and database-schema §4.1).

### What you still need to run it
- A migrated + seeded **Neon database** (`DATABASE_URL`) and a **Clerk session**. Without them
  the pages render but every request fails — you'll see the error toasts.
- `SampleDate.tsx` is still imported for **illustrative** bits the API doesn't provide (the
  dashboard's weekly bars, the Payments Pro feature list, the Storefront editor's preset themes
  & preview, status-badge styles) and for the whole **Analytics** page.

### Known limitations
- **Order edits** change fields/status only, not line items (`orders/[id]` PATCH doesn't edit
  items — recreate the order instead).
- A `cancelled` order maps to a "Pending"-style badge (the UI has no cancelled state).
- Image uploads (logo/banner/product) are still in-browser **data URLs**, persisted as text.

> **Why mock-first, then wired?** The team built and validated the entire UX on `SampleDate`
> before committing to persistence. Because the mock shapes mirror the schema, wiring was
> mechanical — the [`mappers.ts`](../src/utils/mappers.ts) adapters translate pesewas↔cedis and
> enum↔label at the boundary, so the components and modals were largely untouched
> ([database-schema.md §7](./database-schema.md) maps every UI surface to its tables).

---

## 6. Data layer design (Prisma + Neon)

See [prisma-setup.md](./prisma-setup.md) and [database-schema.md](./database-schema.md) for
the full treatment. The decisions that shape day-to-day code:

- **Singleton client** (`src/lib/prisma.ts`): one `PrismaClient` cached on `globalThis` in
  dev to survive hot-reload without exhausting connections. Import it as
  `import { prisma } from "@/lib/prisma"`.
- **Driver adapter:** Prisma 7 requires one — we use `@prisma/adapter-pg` (node-postgres) over
  Neon's **pooled** endpoint (`DATABASE_URL`). Migrations use the **direct** endpoint
  (`DIRECT_URL`) via `prisma.config.ts`.
- **Generated client is git-ignored** (`src/generated/prisma/`) and rebuilt by
  `prisma generate` (runs on `postinstall` and before `build`).
- **Money as integer pesewas** to avoid floating-point errors. Columns end in `_pesewas`.
  Multiply by 100 on write, divide on read.
- **Snapshots:** orders and order_items copy customer/product details at purchase time so
  history is immutable even if the product or customer later changes.
- **Derived data via views:** price ranges, the order "item" summary string, customer
  order-counts/spend, and all analytics are SQL **views** (`extras.sql`), not stored columns —
  one source of truth, computed on read.
- **Multi-tenancy:** every store-scoped table carries an indexed `store_id`. The schema
  recommends Postgres **Row-Level Security** keyed on `store_id` once the DB is wired up, so a
  seller can only ever touch their own rows.

---

## 7. Request/render flow (target architecture)

How a portal page *should* flow once wired to the DB (today, step 3 reads `SampleDate` instead):

```
Browser request /orders
   │
   ▼
proxy.ts (Clerk middleware) — attaches auth context
   │
   ▼
(portal)/layout.tsx  [server]  — auth() gate → redirect if signed out
   │
   ▼
orders/page.tsx  [client]  — Orders.listOrders() ──▶ /api/orders ──▶ requireStore() ──▶ Prisma
   │                          map DTO→UI (mappers), render; mutations toast + refetch
   ▼
Renders table + modals; create/edit/delete call the service again
```

The dashboard pages are `"use client"` and fetch from the **service layer** (axios) → the
**route handlers** → Prisma. The route handler is where the request is authenticated and
store-scoped (`requireStore()`), so secrets stay server-side. (An alternative would be RSC +
server actions; we went with client pages + a REST API because the same endpoints also serve
the public storefront and any future clients.)

---

## 8. Key design decisions, summarised

| Decision | Rationale |
| --- | --- |
| Route group `(portal)` with its own layout | One place to gate auth + render the sidebar shell for all 8 pages. |
| Storefront outside the group | Public, chrome-free, no auth — a shopper just needs the link. |
| Mock data centralised in one file | Build/validate the whole UX fast; swap to Prisma page-by-page later. |
| Mock shapes mirror the DB schema | Makes the eventual DB swap mechanical, not a redesign. |
| Money in integer pesewas | Exact arithmetic; no float rounding bugs on prices/totals. |
| Snapshots on orders/order_items | Reports stay correct after a product/customer is edited or deleted. |
| Views for all derived/analytics data | Single source of truth; no duplicated, drift-prone columns. |
| CSS-only Tailwind theme (`@theme`) | Semantic, theme-aware tokens (`--c-surface`, `--c-fg`) drive light/dark from one place. |
| `localStorage` for sidebar/theme prefs | Lightweight client UI state; no server round-trip needed. |
| WhatsApp hand-off at checkout | Meets sellers where their customers already transact; payment integration is future work. |

---

## 9. What's intentionally stubbed / "coming soon"

Knowing what's deliberately incomplete saves you chasing "bugs":

- **Analytics page** — entire content wrapped in `<ComingSoon>`; the charts exist but are hidden
  and still render mock data (not yet wired to `/api/analytics`).
- **Pro plan** (Payments) — card is blurred with a "Coming soon" badge and the upgrade button is
  inert. (The rest of Payments shows the real plan + invoices.)
- **Order line-item edits** — editing an order updates its fields/status, not its items.
- **Image uploads** — logo/banner/product images are stored as data URLs, not object storage.
- **Decorative buttons** — Orders "Export" and the Analytics "Last 12 months" picker are stubs.

See [frontend-guide.md](./frontend-guide.md) for per-page detail.
