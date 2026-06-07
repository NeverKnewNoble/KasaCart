/**
 * /api/dashboard — the Dashboard landing page payload.
 *
 *   GET → KPIs, the order pipeline (counts by status), the most recent orders,
 *         and top products — everything the dashboard renders, computed from
 *         `orders` / `order_items` / `products` (docs/database-schema.md §6–7).
 *
 * All values are store-scoped and money is in pesewas.
 */
import { handle, ok } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { itemSummary, topProducts } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { store } = await requireStore();
  const storeId = store.id;

  const [awaitingFulfilment, productsLive, revenueAgg, pipelineRows, recent, top] =
    await Promise.all([
      prisma.order.count({
        where: { storeId, status: { in: ["pending", "confirmed", "packed"] } },
      }),
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.order.aggregate({
        where: { storeId, status: { not: "cancelled" } },
        _sum: { totalPesewas: true },
        _count: true,
      }),
      prisma.order.groupBy({ by: ["status"], where: { storeId }, _count: true }),
      prisma.order.findMany({
        where: { storeId },
        orderBy: { placedAt: "desc" },
        take: 5,
        include: { items: { orderBy: { createdAt: "asc" } } },
      }),
      topProducts(storeId, 5),
    ]);

  const pipeline = pipelineRows.map((r) => ({ status: r.status, count: r._count }));
  const recentOrders = recent.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    status: o.status,
    totalPesewas: o.totalPesewas,
    placedAt: o.placedAt,
    itemSummary: itemSummary(o.items),
  }));

  return ok({
    kpis: {
      awaitingFulfilment,
      productsLive,
      revenuePesewas: revenueAgg._sum.totalPesewas ?? 0,
      ordersCount: revenueAgg._count,
    },
    pipeline,
    recentOrders,
    topProducts: top,
  });
});
