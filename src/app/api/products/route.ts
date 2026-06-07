/**
 * /api/products — the seller's catalogue (Products page + Create Product modal).
 *
 *   GET  → list products (with variants, category, and derived price range).
 *   POST → create a product and its size variants in one transaction.
 *
 * Maps to `products` + `product_variants` + `categories` (§4.6–4.8).
 *
 * Money is in **pesewas** at this boundary (see docs/data-layer.md). The UI's
 * "₵120 – ₵150" label is derived, not stored — we return `minPricePesewas` /
 * `maxPricePesewas` for it (the `product_price_range` view, computed in code).
 */
import { handle, ok, created, readJson, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { str, optStr, int, optInt, optBool, arr } from "@/lib/api/validate";
import { priceRange } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Parse + validate the `variants` array from a request body. */
function parseVariants(body: Record<string, unknown>) {
  if (body.variants === undefined || body.variants === null) return [];
  const raw = arr(body, "variants");
  return raw.map((v, i) => {
    if (typeof v !== "object" || v === null) throw ApiError.badRequest(`variants[${i}] must be an object`);
    const vb = v as Record<string, unknown>;
    return {
      size: str(vb, "size"),
      pricePesewas: int(vb, "pricePesewas", { min: 0 }),
      position: optInt(vb, "position", { min: 0 }) ?? i,
    };
  });
}

export const GET = handle(async () => {
  const { store } = await requireStore();
  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: { variants: { orderBy: { position: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
  // attach the derived price range to each product
  const withRange = products.map((p) => ({ ...p, ...priceRange(p) }));
  return ok(withRange);
});

export const POST = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);

  const variants = parseVariants(body);
  const basePricePesewas = optInt(body, "basePricePesewas", { min: 0 });

  // A product must be priced: either a base price or at least one priced variant.
  if (basePricePesewas === undefined && variants.length === 0) {
    throw ApiError.badRequest("Provide a basePricePesewas or at least one variant");
  }

  const data = {
    storeId: store.id,
    name: str(body, "name"),
    description: optStr(body, "description"),
    categoryId: optStr(body, "categoryId"),
    basePricePesewas,
    stock: optInt(body, "stock", { min: 0 }) ?? 0,
    sold: optInt(body, "sold", { min: 0 }) ?? 0,
    color: optStr(body, "color"),
    imageUrl: optStr(body, "imageUrl"),
    isActive: optBool(body, "isActive") ?? true,
    variants: { create: variants },
  };

  const product = await prisma.product.create({
    data,
    include: { variants: { orderBy: { position: "asc" } }, category: true },
  });
  return created({ ...product, ...priceRange(product) });
});
