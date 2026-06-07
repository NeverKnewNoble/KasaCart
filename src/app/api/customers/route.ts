/**
 * /api/customers — the store's shoppers (Customers page).
 *
 *   GET  → list customers with computed stats (order count, total spent, last
 *          order) — the `customer_stats` view, computed in code.
 *   POST → create a customer (also used by the storefront checkout upsert).
 *
 * Maps to `customers` (§4.9). Unique per store by phone and by email (when set).
 */
import { handle, ok, created, readJson } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { optStr, optEnum, optHexColor } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";
import { ContactMethod } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { store } = await requireStore();
  const customers = await prisma.customer.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { totalPesewas: true, placedAt: true, status: true } },
    },
  });

  // Derive the stats the Customers page shows (count / spent / last order).
  const withStats = customers.map(({ orders, ...c }) => {
    const counted = orders.filter((o) => o.status !== "cancelled");
    return {
      ...c,
      orderCount: counted.length,
      totalSpentPesewas: counted.reduce((s, o) => s + o.totalPesewas, 0),
      lastOrderAt: orders.reduce<Date | null>(
        (latest, o) => (!latest || o.placedAt > latest ? o.placedAt : latest),
        null
      ),
    };
  });

  return ok(withStats);
});

export const POST = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);
  const customer = await prisma.customer.create({
    data: {
      storeId: store.id,
      firstName: optStr(body, "firstName"),
      lastName: optStr(body, "lastName"),
      email: optStr(body, "email"),
      phone: optStr(body, "phone"),
      preferredContact: optEnum(body, "preferredContact", ContactMethod),
      address: optStr(body, "address"),
      city: optStr(body, "city"),
      region: optStr(body, "region"),
      color: optHexColor(body, "color"),
    },
  });
  return created(customer);
});
