# Prisma + Neon — setup & usage

This implements [`database-schema.md`](./database-schema.md) with **Prisma 7** against a
**Neon** Postgres database.

## What's in the repo

| File | Purpose |
| --- | --- |
| `prisma/schema.prisma` | All 12 tables + 7 enums (the doc, as Prisma models). |
| `prisma.config.ts` | Prisma 7 CLI config; migrations use `DIRECT_URL`. |
| `prisma/seed.ts` | Seeds the demo store, products, customers, orders. |
| `prisma/sql/extras.sql` | Analytics **views** + optional stock trigger (Prisma can't express these). |
| `src/lib/prisma.ts` | Shared `PrismaClient` singleton (pg driver adapter). |
| `src/generated/prisma/` | Generated client (git-ignored; rebuilt by `prisma generate`). |

Packages: `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`, `tsx`.

## 1. Add your Neon connection strings

In the Neon dashboard → **Connection Details**, copy two strings into `.env`:

```dotenv
# Pooled (host has "-pooler") — used by the app at runtime
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
# Direct (no "-pooler") — used by migrations / introspection
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require"
```

`.env` is git-ignored. (Next.js and Prisma both read it.)

## 2. Create the tables

```bash
yarn db:migrate --name init     # creates prisma/migrations + applies to Neon
```

For non-interactive / CI deploys use `yarn db:deploy`. To prototype without a
migration history you can use `yarn db:push`.

## 3. Add the views (and optionally the stock trigger)

Prisma doesn't manage views/triggers, so apply them once after migrating:

```bash
psql "$DIRECT_URL" -f prisma/sql/extras.sql
```

(or paste the file into the Neon SQL editor). The stock-keeping trigger is commented
out — enable it **after** seeding (see the file's note).

## 4. Seed demo data

```bash
yarn db:seed
```

Open `yarn db:studio` to browse the data.

## 5. Use it in the app

```ts
import { prisma } from "@/lib/prisma";

// e.g. the public storefront loader
const store = await prisma.store.findUnique({
  where: { handle },
  include: {
    products: {
      where: { isActive: true },
      include: { variants: { orderBy: { position: "asc" } }, category: true },
    },
  },
});
```

> Money is stored as **integer pesewas** — multiply cedis by 100 on write,
> divide by 100 on display.

## Scripts

| Script | Does |
| --- | --- |
| `yarn db:migrate` | `prisma migrate dev` (create + apply a migration) |
| `yarn db:deploy` | `prisma migrate deploy` (apply migrations, CI/prod) |
| `yarn db:push` | `prisma db push` (sync schema without migrations) |
| `yarn db:seed` | run `prisma/seed.ts` |
| `yarn db:studio` | open Prisma Studio |
| `yarn db:generate` | regenerate the client |

`prisma generate` also runs automatically on `postinstall` and before `build`.

## Notes

- **Driver adapter:** Prisma 7 requires one. We use `@prisma/adapter-pg` over Neon's
  pooled endpoint (works on Node). For edge runtimes, swap to `@prisma/adapter-neon`.
- **`line_total_pesewas`:** the doc defines it as a Postgres GENERATED column; Prisma
  can't manage those, so the app sets it (`unit_price × quantity`). Convert it to a real
  generated column via raw SQL later if you want the DB to enforce it.
- **Clerk link:** `users.clerk_user_id` ties a row to the Clerk identity. On first
  login, upsert a `users` row (and its `stores`) from the Clerk webhook/session.
