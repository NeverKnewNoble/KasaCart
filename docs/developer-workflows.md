# Developer Workflows — setup, scripts & the "how do I…" playbook

Getting the project running, the env vars it needs, the scripts you'll use, and a task-oriented
index for the most common changes.

---

## 1. First-time setup

```bash
# 1. install deps (also runs `prisma generate` via postinstall)
yarn install

# 2. create env files (see §2) — they're git-ignored

# 3. (optional, to use a real DB) migrate + seed
yarn db:migrate --name init
psql "$DIRECT_URL" -f prisma/sql/extras.sql   # views + optional trigger
yarn db:seed

# 4. run
yarn dev          # http://localhost:3000
```

The app **runs without a database** today (the UI uses mock data), but it **does** need Clerk
keys for the auth gate and sign-in/up pages to work.

Package manager is **Yarn 1.22** (see `packageManager` in `package.json`).

---

## 2. Environment variables

All env vars live in a **single git-ignored `.env`** file, read by both Next.js (the app) and
the Prisma CLI (`prisma.config.ts` loads it via `dotenv/config`).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client key (public). Required for auth UI. |
| `CLERK_SECRET_KEY` | Clerk server key. Required by the middleware/`auth()`. |
| `DATABASE_URL` | **Pooled** Neon connection — used by the app at runtime (`src/lib/prisma.ts`) and, as a fallback, by migrations. Host contains `-pooler`. |
| `DIRECT_URL` | **Direct** Neon connection for migrations/introspection via `prisma.config.ts` (no `-pooler`). Optional — currently commented out, so the CLI falls back to `DATABASE_URL`. |
| `NEXT_PUBLIC_SITE_HOST` | Optional fallback host for `domain.tsx` link-building during SSR (defaults to `kasacart.com`). |

> `.env*` is git-ignored, so it's safe to keep secrets in `.env`. Never commit real keys. See
> [prisma-setup.md §1](./prisma-setup.md) for where to copy the Neon strings from.
>
> **Why one file?** The Prisma CLI's `dotenv/config` only reads `.env` (not `.env.local`), while
> Next.js reads both. Keeping everything in `.env` means both tools see the same values with no
> risk of the two files drifting apart.

---

## 3. Scripts (`package.json`)

| Command | Does |
| --- | --- |
| `yarn dev` | Start the dev server (`next dev`). |
| `yarn build` | `prisma generate && next build`. |
| `yarn start` | Run the production build. |
| `yarn db:migrate` | `prisma migrate dev` — create + apply a migration (interactive). |
| `yarn db:deploy` | `prisma migrate deploy` — apply migrations (CI/prod, non-interactive). |
| `yarn db:push` | `prisma db push` — sync schema to DB without a migration history (prototyping). |
| `yarn db:seed` | Run `prisma/seed.ts` (seeds "Adwoa's Closet"). |
| `yarn db:studio` | Open Prisma Studio to browse data. |
| `yarn db:generate` | Regenerate the Prisma client into `src/generated/prisma`. |

`prisma generate` also runs on `postinstall` and before `build`, so the generated client is
always fresh.

---

## 4. "How do I…?" — task playbook

### …add a new dashboard page?
1. Create `src/app/(portal)/<name>/page.tsx` (start it `"use client"` if it needs state).
2. Open with `<PageHeader title=… subtitle=… />`.
3. Add a nav entry to the `nav` array in `src/components/ui_components/portal/Sidebar.tsx`
   (`{ label, href: "/<name>", icon: SomeLucideIcon }`).
   The page is automatically auth-gated by `(portal)/layout.tsx`.

### …add a field to a product / order?
1. Update the UI type in `src/types/products.ts` / `orders.ts`.
2. Add the input to the relevant modal (`CreateProductModal` / `CreateOrderModal`) and include
   it in the object passed to `onSubmit`.
3. Render it where the list/detail shows.
4. (When DB-backed) add the column to `prisma/schema.prisma`, migrate, and map it in the query.

### …change branding colors, fonts, or the dark theme?
Edit the tokens in `src/app/globals.css` (`@theme` for the brand palette, `:root`/`.dark` for
semantic surfaces). Components reference these tokens, so one change propagates. Fonts are set
in `src/app/layout.tsx`. See [frontend-guide.md §1](./frontend-guide.md#1-design-system-srcappglobalscss).

### …find or change the order/product CRUD logic?
It's **local state** in the page files: `(portal)/orders/page.tsx` and
`(portal)/products/page.tsx` (`handleSubmit`, `openCreate`, `openEdit`, `confirmDelete`).
Helpers live in `src/utils/ordersUtils.tsx` and `src/utils/productUtils.tsx`.

### …fix something on the public storefront (cart, checkout, product detail)?
Everything is in `src/components/ui_components/store/StoreFront.tsx` (cart ops, `Checkout`,
`OrderSuccess`, `ProductDetail`, `CartDrawer`). Store identity comes from `storeProfile` in
`SampleDate` (not the `handle` param yet). See [frontend-guide.md §5](./frontend-guide.md#5-the-public-storefront-storestorefronttsx).

### …work on auth?
Pages: `src/app/auth/login` and `auth/signup` (Clerk `<SignIn>`/`<SignUp>`). The gate is in
`src/app/(portal)/layout.tsx`. Middleware is `src/proxy.ts`. Provider config (URLs) is in the
root `layout.tsx`. See [architecture.md §4](./architecture.md#4-authentication-flow-clerk).

### …change the mock/demo data?
Edit `src/utils/SampleDate.tsx`. Keep shapes matching the types in `src/types/*` (and ideally
the Prisma seed) so nothing else breaks.

### …connect a page to the real database? (the big one)
1. Ensure env + migrations + seed are done (§1).
2. On first login, upsert a `users` (+ `stores`) row from the Clerk session — currently missing.
3. Convert the page (or a server-component wrapper) to query `prisma` by `storeId`.
4. Translate **pesewas → cedis** and **enum → label** at the boundary.
5. Replace local-state mutations with server actions / route handlers that write to the DB.
   See [architecture.md §5–7](./architecture.md#5-current-state-mock-data-vs-database) and
   [prisma-setup.md §5](./prisma-setup.md).

### …add or change a DB table / analytics metric?
Models → `prisma/schema.prisma` (then `yarn db:migrate`). Derived/aggregate metrics → a **view**
in `prisma/sql/extras.sql` (re-apply with `psql`). Full reasoning in
[database-schema.md](./database-schema.md).

---

## 5. Gotchas & things that look like bugs but aren't

- **Refreshing the dashboard resets your edits.** Expected — CRUD is local state, no DB writes.
- **The Analytics page shows "Coming soon".** It's wrapped in `<ComingSoon>` (which ignores its
  children). Remove the wrapper to see the charts.
- **The Pro plan and several Save/Cancel buttons do nothing.** Intentionally stubbed — see
  [architecture.md §9](./architecture.md#9-whats-intentionally-stubbed--coming-soon).
- **The middleware isn't `middleware.ts`.** It's `src/proxy.ts` (this customised Next.js).
- **Products are keyed by name**, not id, in the UI — duplicate names collide. A known limit.
- **`src/generated/prisma/` is git-ignored.** If imports from `@/generated/prisma/...` fail,
  run `yarn db:generate`.
- **Before any framework-level change, read `node_modules/next/dist/docs/`** — APIs may differ
  from stock Next.js ([`AGENTS.md`](../AGENTS.md)).

---

## 6. Where to read next
- System design & decisions → [architecture.md](./architecture.md)
- Find any file → [project-structure.md](./project-structure.md)
- UI work → [frontend-guide.md](./frontend-guide.md)
- Types, mock data, helpers → [data-layer.md](./data-layer.md)
- Database → [prisma-setup.md](./prisma-setup.md) + [database-schema.md](./database-schema.md)
