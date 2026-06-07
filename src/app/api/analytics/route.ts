/**
 * /api/analytics — the Analytics page payload.
 *
 *   GET → revenue / orders / AOV KPIs, sales by channel, order-status breakdown,
 *         top products, and a 12-month revenue trend.
 *
 * These mirror the analytics views in docs/database-schema.md §6, computed here
 * with Prisma aggregates (+ one raw query for the monthly buckets) so the route
 * works whether or not the SQL views have been installed. Money is in pesewas.
 */
import { handle, ok } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { topProducts } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { store } = await requireStore();
  const storeId = store.id;

  // Start of the current month (for "new customers this month").
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesAgg, newCustomers, channelRows, statusRows, top, monthly] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId, status: { not: "cancelled" } },
      _sum: { totalPesewas: true },
      _avg: { totalPesewas: true },
      _count: true,
    }),
    prisma.customer.count({ where: { storeId, createdAt: { gte: monthStart } } }),
    prisma.order.groupBy({
      by: ["channel"],
      where: { storeId },
      _count: true,
      _sum: { totalPesewas: true },
    }),
    prisma.order.groupBy({ by: ["status"], where: { storeId }, _count: true }),
    topProducts(storeId, 5),
    // Monthly revenue for the last 12 months — needs date_trunc, so raw SQL.
    prisma.$queryRaw<{ month: Date; revenue_pesewas: number }[]>`
      SELECT date_trunc('month', placed_at) AS month,
             COALESCE(SUM(total_pesewas), 0)::int AS revenue_pesewas
      FROM orders
      WHERE store_id = ${storeId}::uuid
        AND status <> 'cancelled'
        AND placed_at >= (date_trunc('month', now()) - interval '11 months')
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  return ok({
    kpis: {
      revenuePesewas: salesAgg._sum.totalPesewas ?? 0,
      ordersCount: salesAgg._count,
      avgOrderValuePesewas: Math.round(salesAgg._avg.totalPesewas ?? 0),
      newCustomersThisMonth: newCustomers,
    },
    salesByChannel: channelRows.map((r) => ({
      channel: r.channel,
      ordersCount: r._count,
      revenuePesewas: r._sum.totalPesewas ?? 0,
    })),
    statusBreakdown: statusRows.map((r) => ({ status: r.status, ordersCount: r._count })),
    topProducts: top,
    monthlyRevenue: monthly.map((m) => ({
      month: m.month,
      revenuePesewas: Number(m.revenue_pesewas),
    })),
  });
});
