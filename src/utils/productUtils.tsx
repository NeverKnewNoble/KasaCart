import type { Product } from "@/types/products";

export function stockBadge(stock: number) {
  if (stock === 0) return { label: "Out of stock", cls: "bg-rose-50 text-rose-600" };
  if (stock <= 6) return { label: `Low · ${stock} left`, cls: "bg-amber-50 text-amber-600" };
  return { label: `${stock} in stock`, cls: "bg-emerald-50 text-emerald-600" };
}

/** Format a number of cedis for display, e.g. 1500 → "₵1,500". */
export function formatCedis(amount: number): string {
  return `₵${Math.round(amount).toLocaleString()}`;
}

/** First whole number found in a price string, e.g. "₵120 – ₵150" → 120. */
export function priceValue(price: string): number {
  return parseInt(price.match(/\d+/)?.[0] ?? "0", 10) || 0;
}

/**
 * The lowest sticker price for a product — the cheapest variant when sizes are
 * priced, otherwise the base price. Used for "from ₵X" labels and quick-add.
 */
export function startingPrice(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((v) => v.price));
  }
  return priceValue(product.price);
}