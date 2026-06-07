/**
 * Small domain helpers shared by the API routes — the server-side equivalents of
 * the derived values the schema doc models as SQL views (docs/database-schema.md §6).
 * We compute them in code so the routes work even before the views are installed.
 */
import { prisma } from "@/lib/prisma";

type VariantLike = { pricePesewas: number };
type ProductLike = { basePricePesewas: number | null; variants?: VariantLike[] };

/**
 * Min/max sticker price for a product (the "₵120 – ₵150" label, in pesewas).
 * Cheapest/dearest variant when sized, else the base price. Equivalent to the
 * `product_price_range` view.
 */
export function priceRange(p: ProductLike): {
  minPricePesewas: number | null;
  maxPricePesewas: number | null;
} {
  const prices = (p.variants ?? []).map((v) => v.pricePesewas);
  if (prices.length > 0) {
    return { minPricePesewas: Math.min(...prices), maxPricePesewas: Math.max(...prices) };
  }
  return { minPricePesewas: p.basePricePesewas, maxPricePesewas: p.basePricePesewas };
}

/**
 * The order "item" string, e.g. "Blue Summer Dress ×2, Gold Earrings".
 * Equivalent to the `order_item_summary` view.
 */
export function itemSummary(items: { productName: string; quantity: number }[]): string {
  return items
    .map((i) => (i.quantity > 1 ? `${i.productName} ×${i.quantity}` : i.productName))
    .join(", ");
}

/**
 * Best-selling products for a store by revenue (the `top_products` view).
 * Aggregates order_items across non-cancelled orders. Returns units + revenue
 * in pesewas, highest revenue first.
 */
export async function topProducts(storeId: string, limit = 5) {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: { order: { storeId, status: { not: "cancelled" } } },
    _sum: { quantity: true, lineTotalPesewas: true },
    orderBy: { _sum: { lineTotalPesewas: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    unitsSold: r._sum.quantity ?? 0,
    revenuePesewas: r._sum.lineTotalPesewas ?? 0,
  }));
}

/**
 * Next sequential order number for a store, e.g. "KC-2049".
 * Reads the highest existing numeric suffix; starts the series at KC-2049.
 */
export async function nextOrderNumber(storeId: string): Promise<string> {
  const orders = await prisma.order.findMany({
    where: { storeId },
    select: { orderNumber: true },
  });
  const max = orders.reduce((m, o) => {
    const n = parseInt(o.orderNumber.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 2048);
  return `KC-${max + 1}`;
}
