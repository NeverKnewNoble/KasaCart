/**
 * /api/products/[id] — a single product.
 *
 *   GET    → one product (with variants + category + price range).
 *   PATCH  → update fields; if `variants` is provided, it REPLACES the set.
 *   DELETE → remove the product (variants cascade).
 *
 * All queries are scoped to the seller's store so one seller can't touch
 * another's rows.
 */
import { handle, ok, noContent, readJson, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { str, optStr, int, optInt, optBool, arr } from "@/lib/api/validate";
import { priceRange } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Load a product or 404, ensuring it belongs to this store. */
async function ownedProduct(storeId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, storeId } });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
}

function parseVariants(body: Record<string, unknown>) {
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

export const GET = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  const product = await prisma.product.findFirst({
    where: { id, storeId: store.id },
    include: { variants: { orderBy: { position: "asc" } }, category: true },
  });
  if (!product) throw ApiError.notFound("Product not found");
  return ok({ ...product, ...priceRange(product) });
});

export const PATCH = handle<{ id: string }>(async (req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedProduct(store.id, id);
  const body = await readJson(req);

  // Build the partial update from whichever fields were sent. Prisma treats
  // `undefined` as "leave unchanged", so omitted fields are simply skipped.
  const data: Prisma.ProductUncheckedUpdateInput = {
    name: optStr(body, "name"),
    description: optStr(body, "description"),
    categoryId: body.categoryId === null ? null : optStr(body, "categoryId"),
    basePricePesewas:
      body.basePricePesewas === null ? null : optInt(body, "basePricePesewas", { min: 0 }),
    stock: optInt(body, "stock", { min: 0 }),
    sold: optInt(body, "sold", { min: 0 }),
    color: optStr(body, "color"),
    imageUrl: optStr(body, "imageUrl"),
    isActive: optBool(body, "isActive"),
  };

  const replaceVariants = body.variants !== undefined && body.variants !== null;
  const variants = replaceVariants ? parseVariants(body) : [];

  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data });
    if (replaceVariants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({ ...v, productId: id })),
        });
      }
    }
    return tx.product.findUniqueOrThrow({
      where: { id },
      include: { variants: { orderBy: { position: "asc" } }, category: true },
    });
  });

  return ok({ ...product, ...priceRange(product) });
});

export const DELETE = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedProduct(store.id, id);
  await prisma.product.delete({ where: { id } });
  return noContent();
});
