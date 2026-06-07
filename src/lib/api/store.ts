/**
 * Resolve the *current seller's store* from the Clerk session.
 *
 * KasaCart is multi-tenant: every dashboard API is scoped to exactly one store.
 * This helper turns the Clerk identity into our `stores` row, **bootstrapping**
 * the `users` (+ `stores`, `subscriptions`, `notification_preferences`) rows on
 * first call — i.e. the "upsert on first login" the schema doc calls for
 * (see docs/database-schema.md §4.1 / §8).
 *
 * Use it at the top of every authed route:
 *   const { store } = await requireStore();
 *   // ...then filter all queries by `store.id`.
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "./http";
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
 * The signed-in seller's user + store, creating them if this is their first
 * request. Throws `ApiError(401)` if there's no Clerk session.
 */
export async function requireStore(): Promise<CurrentStore> {
  const { userId } = await auth();
  if (!userId) throw ApiError.unauthorized();

  // 1. Ensure the `users` row exists (linked to the Clerk identity).
  let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    const cu = await currentUser();
    const email =
      cu?.primaryEmailAddress?.emailAddress ?? `${userId}@users.kasacart.local`;
    user = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email,
        fullName: cu?.fullName ?? null,
        avatarUrl: cu?.imageUrl ?? null,
      },
    });
  }

  // 2. Ensure the seller has a store (one per seller today). New stores come
  //    with a free subscription and default notification preferences.
  let store = await prisma.store.findFirst({ where: { ownerId: user.id } });
  if (!store) {
    const handleBase = slugify(user.fullName ?? user.email);
    const handle = await uniqueHandle(handleBase);
    store = await prisma.store.create({
      data: {
        ownerId: user.id,
        name: user.fullName ? `${user.fullName}'s store` : "My store",
        handle,
        subscription: { create: {} },
        notificationPreferences: { create: {} },
      },
    });
  }

  return { userId, user, store };
}
