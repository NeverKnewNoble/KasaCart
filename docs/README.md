# KasaCart — Developer Documentation

This folder is the **developer handbook** for KasaCart. Start here, then jump to the
guide you need. Every file is written so you can answer "where is X and how does it
work?" without re-reading the whole codebase.

## What KasaCart is

KasaCart is a **multi-tenant SaaS for social sellers** (people who sell on WhatsApp,
Instagram, TikTok, etc.). A seller signs up, gets a branded **storefront** at a shareable
link, and runs everything from one **dashboard** — orders, products, customers, analytics,
storefront branding, billing and settings. Shoppers visit the public storefront, add to a
cart and check out; the order flows back into the seller's dashboard.

It is a **Next.js 16 (App Router) + React 19** app, styled with **Tailwind CSS v4**,
authenticated with **Clerk**, and backed by **Postgres (Neon) via Prisma 7**.

> ⚠️ **Read this first — current state of the codebase.** The UI is fully built and runs on
> **mock data** from [`src/utils/SampleDate.tsx`](../src/utils/SampleDate.tsx). The database
> layer (Prisma schema, migrations, seed, views) is fully set up but **not yet wired into the
> pages**. All create/edit/delete in the dashboard happens in **local React state only** and
> resets on refresh. Connecting the UI to the database is the main outstanding work. See
> [architecture.md](./architecture.md#5-current-state-mock-data-vs-database) for the full picture.

> ⚠️ **This is a customised Next.js.** Per [`AGENTS.md`](../AGENTS.md), this version may have
> breaking changes vs. what you (or an AI) remember. **Before writing framework-level code,
> read the relevant guide in `node_modules/next/dist/docs/`.**

## The docs

| File | Read it when you want to… |
| --- | --- |
| [architecture.md](./architecture.md) | Understand the system design: routing, auth, the mock-vs-DB split, request flow, and the key design decisions ("why this way"). |
| [project-structure.md](./project-structure.md) | Find a file. A directory-by-directory, file-by-file map of the whole repo. |
| [frontend-guide.md](./frontend-guide.md) | Work on UI: the design system (CSS tokens, `.surface`, `.input`), the portal shell, pages, modals and the state patterns they share. |
| [data-layer.md](./data-layer.md) | Understand the data: the TypeScript types, the `SampleDate` mock data, and every utility function. |
| [developer-workflows.md](./developer-workflows.md) | Set up the project, run scripts, manage env vars, and follow the "how do I…" playbook for common tasks. |
| [api-reference.md](./api-reference.md) | The REST API: every endpoint, its body/response, auth, and the pesewas/enum conventions. |
| [services.md](./services.md) | The browser service layer (`src/services/`): every class, method, params and return type, with usage. |
| [prisma-setup.md](./prisma-setup.md) | Set up Prisma + Neon, run migrations, seed data, and use the client. |
| [database-schema.md](./database-schema.md) | Understand every table, column, enum, view and the reasoning behind the schema. |

## 60-second mental model

```
                    ┌─────────────────────────────────────────────┐
   Marketing site   │  /            → Hero, Features, Convincing   │  public, no auth
   (public)         │  /store/[handle] → public storefront + cart │
                    └─────────────────────────────────────────────┘
                                      │  Clerk sign-in
                                      ▼
                    ┌─────────────────────────────────────────────┐
   Seller portal    │  (portal) route group, auth-gated:          │  Clerk-protected
   (auth-gated)     │  /dashboard /orders /products /customers    │
                    │  /storefront /payments /analytics /settings │
                    └─────────────────────────────────────────────┘
                                      │  (today) reads from SampleDate.tsx
                                      │  (next)   should read/write via Prisma
                                      ▼
                    ┌─────────────────────────────────────────────┐
   Data layer       │  Prisma 7  →  Neon Postgres                 │  ready, not yet wired
                    │  12 tables, 7 enums, 7 analytics views      │
                    └─────────────────────────────────────────────┘
```

Money is stored as **integer pesewas** (1 GHS ₵ = 100 pesewas) in the DB; the UI shows whole
cedis. The default currency is **GHS** and the demo store is **"Adwoa's Closet"**
(`/store/adwoascloset`).
