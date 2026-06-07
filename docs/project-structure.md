# Project Structure — file-by-file map

Use this to find things fast. Every directory and significant file, what it holds, and where
to go for more. Path alias: **`@/` = `src/`**.

```
kasacart/
├── AGENTS.md / CLAUDE.md      # ⚠️ "This is NOT the Next.js you know" — read node_modules/next/dist/docs before framework code
├── README.md                  # default create-next-app readme (not project docs — these docs are it)
├── next.config.ts             # Next config — { reactCompiler: true }
├── tsconfig.json              # TS strict; path alias @/* → ./src/*
├── postcss.config.mjs         # Tailwind v4 PostCSS plugin
├── prisma.config.ts           # Prisma 7 CLI config (schema path, seed cmd, DIRECT_URL)
├── package.json               # deps + db:* scripts
├── .env                       # secrets (git-ignored): DB url, Clerk keys, NEXT_PUBLIC_SITE_HOST. Read by both Next.js and the Prisma CLI
├── docs/                      # ← you are here (developer handbook)
├── prisma/                    # database schema, seed, raw SQL
├── public/                    # static assets
└── src/                       # all application code
```

---

## `src/app/` — routes (Next.js App Router)

Each folder is a route segment; `page.tsx` is the page, `layout.tsx` wraps its subtree.

| Path | Type | What it is |
| --- | --- | --- |
| `layout.tsx` | server | **Root layout.** `<html>`, the three Google fonts as CSS vars, metadata, and `<ClerkProvider>` (sign-in/up URLs, after-sign-out). |
| `page.tsx` | server | **Marketing home** (`/`). Composes Hero + Features + Convincing + Footer. |
| `globals.css` | — | **Design system.** Tailwind import, theme tokens, `.surface`/`.input`, dark mode, marquee. See [frontend-guide.md](./frontend-guide.md). |
| `icon.svg` / `favicon.ico` | — | App icons. |
| `(portal)/layout.tsx` | server | **Auth gate** (`auth()` → redirect) + `<PortalShell>`. Wraps all 8 dashboard pages. |
| `(portal)/dashboard/page.tsx` | client | KPIs, weekly revenue, order pipeline, recent orders, top products. Read-only. |
| `(portal)/orders/page.tsx` | client | Orders table: search, filters, create/edit/delete (local state). |
| `(portal)/products/page.tsx` | client | Product grid: search, create/edit/delete (local state). |
| `(portal)/customers/page.tsx` | client | Customer table + summary tiles. Read-only. |
| `(portal)/storefront/page.tsx` | client | Brand/theme editor + live laptop & phone preview. **Currently open in your IDE.** |
| `(portal)/payments/page.tsx` | client | Billing & plan; Pro plan is "coming soon" (blurred). |
| `(portal)/analytics/page.tsx` | client | Charts/breakdowns wrapped in `<ComingSoon>` (hidden). |
| `(portal)/settings/page.tsx` | client | Store details, notification toggles, danger zone (buttons inert). |
| `auth/login/[[...rest]]/page.tsx` | client | Clerk `<SignIn>` (catch-all so Clerk owns sub-routes). |
| `auth/signup/[[...rest]]/page.tsx` | client | Clerk `<SignUp>`. |
| `store/[handle]/page.tsx` | client | **Public storefront.** Resolves `params.handle` and renders `<StoreFront>`. |

> Why `(portal)` is parenthesised: it's a **route group** — shared layout/auth without a
> `/portal` URL prefix. Why `[[...rest]]`: Clerk needs a catch-all to host its auth flows.

---

## `src/components/` — React components

### `modals/` — dialog UIs
| File | What it does |
| --- | --- |
| `Modal.tsx` | **Generic modal shell.** Overlay + centered panel, header/body/footer, closes on ESC/overlay/X, locks body scroll. `size` = `sm`/`md`/`lg`. Everything else builds on this. |
| `CreateProductModal.tsx` | Create/edit a product: name, base price, stock, category, **size variants with per-size pricing**, image upload (data URL), live preview. |
| `CreateOrderModal.tsx` | Create/edit an order: customer + delivery fields, searchable product picker, line-items table, channel/status/payment/paid. |
| `FilterOrdersModal.tsx` | Orders filter: order id, customer autocomplete, paid, status, channel. "Clear all" resets. |
| `ConfirmDeleteModal.tsx` | Reusable delete confirmation (title, confirm label, message via children). Used by Orders & Products. |

### `ui_components/` — everything else
| File | What it does |
| --- | --- |
| `ComingSoon.tsx` | Full-panel "coming soon" placeholder. **Ignores its children** (wraps unfinished pages). |
| `EmptyState.tsx` · `NoResults.tsx` | Reusable empty states for an empty list/grid (icon + title + description + optional action). `NoResults` is the search/filter-miss preset. |
| `Skeleton.tsx` | Base shimmer block (`.skeleton` in globals.css). Compose into shaped loaders. |
| `ProductGridSkeleton.tsx` · `TableSkeleton.tsx` | Content-shaped loading placeholders for the product grid and data tables. |
| `home/Navbar.tsx` | Marketing top nav; Clerk-aware (Sign in / Get started vs Dashboard + UserButton). |
| `home/Hero.tsx` | Landing hero + the "channels → storefront → order" funnel visual. Renders the Navbar. |
| `home/Features.tsx` | 6 feature cards (`#features`). |
| `home/Convincing.tsx` | Before/after ("DMs" vs "KasaCart"), stat band, CTA (`#why`). |
| `home/Footer.tsx` | Footer: brand, 4 link columns, socials (`#footer`). |
| `portal/PortalShell.tsx` | Client shell: owns `collapsed` + `dark` state (persisted to `localStorage`), renders `<Sidebar>` + main content. |
| `portal/Sidebar.tsx` | Nav (the 8 pages), brand/collapse toggle, Home/theme/storefront buttons, Clerk account block. Desktop sidebar + mobile drawer. |
| `portal/PageHeader.tsx` | Shared page title/subtitle + optional action slot. Used atop every portal page. |
| `store/StoreFront.tsx` | **The entire public storefront** in one client component: header, hero, catalogue + search/categories, product detail modal, cart drawer, checkout (→ API), success/WhatsApp hand-off. |

Plus `src/components/ui/sonner.tsx` — the app toaster (shadcn-style wrapper around `sonner`),
mounted once in the root layout. Fire toasts anywhere with `import { toast } from "sonner"`.

---

## `src/types/` — TypeScript types

UI-facing shapes (note: these differ from the Prisma models — see
[data-layer.md](./data-layer.md)).

| File | Exports |
| --- | --- |
| `products.ts` | `Product`, `ProductVariant`, `CreateProductModalProps`. |
| `orders.ts` | `Order`, `OrderLineItem`, `OrderFilters`, modal prop types. |
| `customers.ts` | `Customer`. |
| `dashboard.ts` | `RecentOrder`. |
| `storefront.ts` | `StoreBrand`, `CartItem`, `CheckoutCustomer`, `PlacedOrder`. |
| `portal.ts` | `NavItem` (sidebar). |
| `home.ts` | `Feature` (marketing cards). |
| `common.ts` | `ConfirmDeleteModalProps`. |
| `api.ts` | **Shared API types:** the DB enum unions (`OrderStatus`, `PaymentMethod`, …) and `Serialized<T>`. |
| `analytics.ts` | `AnalyticsData` (analytics endpoint). |
| `settings.ts` | `NotificationPreferencesDTO`/`Input`. |
| `payments.ts` | `SubscriptionDTO`, `InvoiceDTO`, `BillingData`. |

> Each domain file holds **both** the UI mock-data types **and** the API DTO/Input types
> (e.g. `orders.ts` has `Order` (UI) + `OrderDTO`/`OrderInput`/`OrderListFilters` (API)).
> The API shapes use pesewas + DB enum values; the UI shapes use cedis + labels.

---

## `src/utils/` — helpers & mock data

| File | What it holds |
| --- | --- |
| `SampleDate.tsx` | **The central mock-data module.** Every demo array the UI renders (nav, hero, features, dashboard, products, customers, analytics, billing, storefront, `storeProfile`). The one file to swap out when wiring the DB. |
| `general.tsx` | Generic helpers: `initials`, `sumBy`, `maxBy`, `binarySearch`, `searchByPrefix`. |
| `productUtils.tsx` | `stockBadge`, `formatCedis`, `priceValue`, `startingPrice`. |
| `ordersUtils.tsx` | `ORDER_CHANNELS`, `emptyOrderFilters`, `filterOrders`, `countActiveFilters`, `nextId`, `newOrderDate`. |
| `settingsUtils.tsx` | `currencies`, `notifications`, and the `<Toggle>` switch component. |
| `domain.tsx` | Store-link builders (`buildStoreUrl`, `storeDisplayUrl`, `useCurrentHost`) that adapt to localhost / Vercel / real domain. |
| `mappers.ts` | DTO↔UI adapters used by the wired pages: pesewas↔cedis, enum↔label, `productToRow`/`orderToRow`/`customerToRow` (+ `*Input`). |
| `notify.ts` | `toastResult(result, success, error?)` — toasts a service call's outcome (sonner). |

Full function-by-function reference: [data-layer.md](./data-layer.md).

---

## `src/services/` — API client per page

One module per page. Each exports a **default class** of `static async` methods (axios +
try/catch) that call the API routes and return typed DTOs (from `@/types/*`). Used by client
components in place of the `SampleDate` mock imports.

- `main.ts` — exports `backendUrl` (the `/api` base every service prefixes; override via
  `NEXT_PUBLIC_BACKEND_URL`). Each method unwraps the `{ data }` envelope (`response.data.data`)
  and logs/swallows errors in `catch`.

| File | Class | Calls | Methods |
| --- | --- | --- | --- |
| `dashboard.ts` | `Dashboard` | `/api/dashboard` | `getDashboard` |
| `orders.ts` | `Orders` | `/api/orders[/id]` | `listOrders`, `getOrder`, `createOrder`, `updateOrder`, `deleteOrder` |
| `products.ts` | `Products` | `/api/products`, `/api/categories` | product + category CRUD |
| `customers.ts` | `Customers` | `/api/customers[/id]` | customer CRUD |
| `storefront.ts` | `Storefront` | `/api/store` | `getStore`, `updateStore` |
| `settings.ts` | `Settings` | `/api/store`, `/api/store/notifications` | `getStore`, `updateStore`, `getNotifications`, `updateNotifications` |
| `payments.ts` | `Payments` | `/api/billing` | `getBilling`, `updatePlan` |
| `analytics.ts` | `Analytics` | `/api/analytics` | `getAnalytics` |
| `store.ts` | `Store` | `/api/storefront/[handle]` | `getStorefront`, `checkout` (public) |

Usage: `import Orders from "@/services/orders"; const orders = await Orders.listOrders({ status: "pending" });`

See [api-reference.md](./api-reference.md) for the endpoints these call.

---

## `src/lib/` — infrastructure
| File | What it does |
| --- | --- |
| `prisma.ts` | Shared `PrismaClient` singleton (pg adapter, pooled `DATABASE_URL`, `globalThis` cache for dev hot-reload). Import as `@/lib/prisma`. |
| `api/http.ts` | **Server** API helpers: `ok`/`created`/`noContent`, `ApiError`, `readJson`, `handle()` wrapper. |
| `api/store.ts` | `requireStore()` — resolve + bootstrap the seller's store from the Clerk session. |
| `api/validate.ts` | Server-side request-body validators. |
| `api/domain.ts` | Server-side derived values: `priceRange`, `itemSummary`, `topProducts`, `nextOrderNumber`. |

> Note: `src/lib/api/*` is **server-only** (it imports Prisma + Clerk) — used by the route
> handlers. The browser-side client is `src/utils/api.ts`; don't confuse the two.

## `src/proxy.ts` — middleware
Clerk's `clerkMiddleware()` with a `matcher` that skips static assets. **Named `proxy.ts`,
not `middleware.ts`** (a quirk of this customised Next.js).

## `src/generated/prisma/` — generated client
Output of `prisma generate`. **Git-ignored, do not edit** — rebuilt from `schema.prisma`.

---

## `prisma/` — database
| File | What it is |
| --- | --- |
| `schema.prisma` | 12 models + 7 enums. The source of truth for the DB. See [database-schema.md](./database-schema.md). |
| `seed.ts` | Seeds "Adwoa's Closet": user, store, categories, 6 products, 6 customers, 6 orders, subscription, prefs. Run `yarn db:seed`. |
| `sql/extras.sql` | 7 analytics **views** + an optional stock-keeping trigger (things Prisma can't express). Apply with `psql`. |

## `public/` — static assets
SVGs shipped by create-next-app (next.svg, vercel.svg, etc.). Replace as needed.

---

## Config files at a glance
| File | Key contents |
| --- | --- |
| `next.config.ts` | `reactCompiler: true` (auto-memoisation; avoid manual `useMemo`/`useCallback` unless needed). |
| `tsconfig.json` | strict; `@/* → ./src/*`; `jsx: react-jsx`. |
| `prisma.config.ts` | schema/migrations paths; seed = `tsx prisma/seed.ts`; uses `DIRECT_URL`. |
| `postcss.config.mjs` | `@tailwindcss/postcss` (Tailwind v4 has no JS config file). |
| `package.json` | scripts (`dev`, `build`, `db:migrate/deploy/push/seed/studio/generate`). |
