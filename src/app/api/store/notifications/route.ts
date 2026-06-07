/**
 * /api/store/notifications — Settings → Notifications toggles.
 *
 *   GET → the store's notification preferences (created with the store).
 *   PUT → update the four toggles + low-stock threshold.
 *
 * Maps to `notification_preferences` (docs/database-schema.md §4.3).
 */
import { handle, ok, readJson } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { optBool, optInt } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { store } = await requireStore();
  const prefs = await prisma.notificationPreferences.upsert({
    where: { storeId: store.id },
    update: {},
    create: { storeId: store.id },
  });
  return ok(prefs);
});

export const PUT = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);
  const data = {
    newOrder: optBool(body, "newOrder"),
    lowStock: optBool(body, "lowStock"),
    newCustomer: optBool(body, "newCustomer"),
    weeklySummary: optBool(body, "weeklySummary"),
    lowStockThreshold: optInt(body, "lowStockThreshold", { min: 0 }),
  };
  const prefs = await prisma.notificationPreferences.upsert({
    where: { storeId: store.id },
    update: data,
    create: { storeId: store.id, ...data },
  });
  return ok(prefs);
});
