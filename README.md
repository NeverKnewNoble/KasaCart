# KasaCart

A **storefront and order dashboard for social sellers**. A seller signs up, gets a branded
storefront at a shareable link, and runs everything — orders, products, customers, analytics,
billing — from one dashboard. Shoppers browse the public storefront, add to a cart, and check
out; the order flows back into the seller's dashboard.

Built for sellers on WhatsApp, Instagram and TikTok who lose track of orders in their DMs.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (configured in CSS via `@theme`) |
| Auth | Clerk (`@clerk/nextjs`) |
| Database | Postgres (Neon) via Prisma 7 |
| HTTP client | axios (service layer) |
| Toasts | sonner |
| Icons / fonts | lucide-react · Bricolage Grotesque, Hanken Grotesk, Geist Mono |

> ⚠️ **This is a customised Next.js.** Per [`AGENTS.md`](./AGENTS.md), APIs may differ from
> stock Next.js — **read `node_modules/next/dist/docs/` before writing framework-level code**.
> (Notably, the middleware lives in `src/proxy.ts`, not `middleware.ts`.)

---

## Quick start

```bash
yarn install            # also runs `prisma generate`

# create .env (see below), then — to use a real database:
yarn db:migrate --name init
psql "$DIRECT_URL" -f prisma/sql/extras.sql   # analytics views (optional)
yarn db:seed                                  # demo store "Adwoa's Closet"

yarn dev                # http://localhost:3000
```

Most dashboard pages now read/write through the API, so you'll want the database **and** a Clerk
session for them to work (the marketing site and auth pages run without a DB). See
[docs/architecture.md §5](./docs/architecture.md#5-current-state-mock-data-vs-database).

### Environment variables — single git-ignored `.env`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client key (public). |
| `CLERK_SECRET_KEY` | Clerk server key. |
| `DATABASE_URL` | Pooled Neon connection (app runtime). |
| `DIRECT_URL` | Direct Neon connection (migrations). Optional; falls back to `DATABASE_URL`. |
| `NEXT_PUBLIC_BACKEND_URL` | Optional API base for the service layer (defaults to `/api`). |

Read by both Next.js and the Prisma CLI. See [docs/prisma-setup.md](./docs/prisma-setup.md).

---

## Scripts

| Command | Does |
| --- | --- |
| `yarn dev` | Start the dev server. |
| `yarn build` | `prisma generate && next build`. |
| `yarn start` | Run the production build. |
| `yarn db:migrate` | Create + apply a migration (dev). |
| `yarn db:deploy` | Apply migrations (CI/prod). |
| `yarn db:seed` | Seed the demo store. |
| `yarn db:studio` | Open Prisma Studio. |
| `yarn db:generate` | Regenerate the Prisma client. |

---

## Project structure

```
src/
├── app/
│   ├── (portal)/        # auth-gated dashboard: dashboard, orders, products,
│   │                    #   customers, storefront, payments, analytics, settings
│   ├── api/             # REST route handlers (the backend)
│   ├── auth/            # Clerk sign-in / sign-up
│   ├── store/[handle]/  # public storefront
│   └── page.tsx         # marketing home
├── components/          # UI: modals, home, portal shell, storefront, empty/skeleton states, toaster
├── services/            # browser API client — one class per page (axios)
├── lib/                 # prisma singleton + server-side API helpers (lib/api)
├── types/               # TypeScript types (UI shapes + API DTOs + enums)
├── utils/               # helpers + the SampleDate mock data
└── generated/prisma/    # generated Prisma client (git-ignored)
prisma/                  # schema, seed, analytics views
docs/                    # 📚 the developer handbook (start here)
```

---

## Documentation

Full developer docs live in **[`docs/`](./docs/README.md)** — start there.

| Doc | What it covers |
| --- | --- |
| [docs/README.md](./docs/README.md) | Handbook index + system overview. |
| [architecture.md](./docs/architecture.md) | System design, routing, auth, the mock-vs-DB split, key decisions. |
| [project-structure.md](./docs/project-structure.md) | File-by-file map of the repo. |
| [frontend-guide.md](./docs/frontend-guide.md) | Design system, pages, modals, state patterns. |
| [data-layer.md](./docs/data-layer.md) | Types, mock data, and utility functions. |
| [api-reference.md](./docs/api-reference.md) | Every REST endpoint, body/response, conventions. |
| [services.md](./docs/services.md) | The browser service layer (classes + methods). |
| [developer-workflows.md](./docs/developer-workflows.md) | Setup, scripts, env, "how do I…" playbook. |
| [prisma-setup.md](./docs/prisma-setup.md) · [database-schema.md](./docs/database-schema.md) | Database setup + full schema reference. |

---

## Current state

The full stack is in place — Prisma schema + migrations + seed, the REST API (`src/app/api`),
the typed service layer (`src/services`), and **8 of 9 dashboard pages wired** to it with toast
feedback, skeletons and empty states. The public storefront checkout is wired end-to-end. Only
**Analytics** still renders mock data (it's behind a "coming soon" screen). Running the wired
pages needs a migrated + seeded Neon DB and a Clerk session. See
[docs/architecture.md §5](./docs/architecture.md#5-current-state-mock-data-vs-database).

---

## Conventions worth knowing

- **Money is integer pesewas** in the DB/API (1 GHS ₵ = 100); convert to cedis in the view.
- **API enums use DB values** (`pending`, `mobile_money`); the UI maps to labels.
- **Multi-tenant:** every dashboard query is scoped to the signed-in seller's store.
- **`src/lib/api/*` is server-only** (Prisma + Clerk); **`src/services/*` is browser-side** (axios).
