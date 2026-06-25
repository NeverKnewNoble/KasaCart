/**
 * Resolve the *current seller's store* from the NextAuth session.
 *
 * KasaCart is multi-tenant: every dashboard API is scoped to exactly one store.
 * The signed-in user is created at sign-in by the NextAuth `jwt` callback
 * (see src/auth.ts); this helper looks them up and **bootstraps** the `stores`
 * (+ `subscriptions`, `notification_preferences`) rows on first call — the
 * "upsert on first login" the schema doc calls for (docs/database-schema.md §4.1 / §8).
 *
 * Use it at the top of every authed route:
 *   const { store } = await requireStore();
 *   // ...then filter all queries by `store.id`.
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApiError } from "./http";
import { Prisma } from "@/generated/prisma/client";
import type { Store, User } from "@/generated/prisma/client";

/** "Adwoa Owusu" / "ama@x.com" → "adwoa-owusu" / "ama". */
function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/@.*$/, "") // if it's an email, drop the domain
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "store";
}

/** Find a store handle not yet taken (appends -2, -3, … on collision). */
async function uniqueHandle(base: string): Promise<string> {
  let handle = base;
  let n = 1;
  // citext unique → compare case-insensitively via findUnique on handle.
  while (await prisma.store.findUnique({ where: { handle } })) {
    n += 1;
    handle = `${base}-${n}`;
  }
  return handle;
}

export type CurrentStore = { userId: string; user: User; store: Store };

/**
 * The signed-in seller's user + store, creating the store on first request.
 * Throws `ApiError(401)` if there's no NextAuth session.
 */
export async function requireStore(): Promise<CurrentStore> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw ApiError.unauthorized();

  // 1. The user is created at sign-in by the NextAuth jwt callback, so it
  //    should exist. Treat a missing row as an invalid session.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.unauthorized();

  // 2. Ensure the seller has a store. `owner_id` is unique (one store per
  //    seller), so this is a deterministic lookup — GET and PATCH always resolve
  //    the same row. On first request we create it (with a free subscription and
  //    default notification preferences).
  let store = await prisma.store.findUnique({ where: { ownerId: user.id } });
  if (!store) {
    const handleBase = slugify(user.fullName ?? user.email);
    const handle = await uniqueHandle(handleBase);
    try {
      store = await prisma.store.create({
        data: {
          ownerId: user.id,
          name: user.fullName ? `${user.fullName}'s store` : "My store",
          handle,
          subscription: { create: {} },
          notificationPreferences: { create: {} },
        },
      });
    } catch (err) {
      // A concurrent first request may have created it (race). The owner_id
      // unique constraint turns the loser into P2002 — just re-read the winner.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        store = await prisma.store.findUnique({ where: { ownerId: user.id } });
      }
      if (!store) throw err;
    }
  }

  return { userId, user, store };
}
