/**
 * /api/billing — Billing & plan (Payments page).
 *
 *   GET   → the store's subscription + invoice history.
 *   PATCH → change plan ("free" | "pro"). Pro is ₵99/mo = 9900 pesewas.
 *
 * Maps to `subscriptions` (§4.4) + `invoices` (§4.5). This only records the plan
 * choice; wiring a real payment provider (and generating invoices on charge) is
 * future work — see docs/database-schema.md §8.
 */
import { handle, ok, readJson } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { enumVal } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";
import { PlanTier } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAN_PRICE_PESEWAS: Record<PlanTier, number> = {
  free: 0,
  pro: 9900,
};

export const GET = handle(async () => {
  const { store } = await requireStore();
  const [subscription, invoices] = await Promise.all([
    prisma.subscription.upsert({
      where: { storeId: store.id },
      update: {},
      create: { storeId: store.id },
    }),
    prisma.invoice.findMany({
      where: { storeId: store.id },
      orderBy: { issuedAt: "desc" },
    }),
  ]);
  return ok({ subscription, invoices });
});

export const PATCH = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);
  const plan = enumVal(body, "plan", PlanTier);

  const subscription = await prisma.subscription.upsert({
    where: { storeId: store.id },
    update: { plan, pricePesewas: PLAN_PRICE_PESEWAS[plan] },
    create: { storeId: store.id, plan, pricePesewas: PLAN_PRICE_PESEWAS[plan] },
  });
  return ok(subscription);
});
