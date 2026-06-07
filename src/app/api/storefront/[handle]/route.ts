/**
 * /api/storefront/[handle] — PUBLIC storefront data (no auth).
 *
 *   GET → the published store's brand + active products (with variants and
 *         derived price range) + categories. This is what the shopper-facing
 *         /store/[handle] page reads.
 *
 * Public reads are limited to published stores and active products
 * (docs/database-schema.md §8). Only safe brand fields are exposed — never the
 * owner or internal ids beyond what the storefront needs.
 */
import { handle as wrap, ok, ApiError } from "@/lib/api/http";
import { priceRange } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ handle: string }> };

export const GET = wrap<{ handle: string }>(async (_req, ctx: Ctx) => {
  const { handle } = await ctx.params;

  const store = await prisma.store.findUnique({
    where: { handle },
    include: {
      categories: { orderBy: [{ position: "asc" }, { name: "asc" }] },
      products: {
        where: { isActive: true },
        include: { variants: { orderBy: { position: "asc" } }, category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store || !store.isPublished) throw ApiError.notFound("Store not found");

  // Expose only the public brand fields (omit owner_id, timestamps, etc.).
  return ok({
    store: {
      name: store.name,
      handle: store.handle,
      tagline: store.tagline,
      accentColor: store.accentColor,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      whatsappPhone: store.whatsappPhone,
      location: store.location,
      currencyCode: store.currencyCode,
    },
    categories: store.categories.map((c) => ({ id: c.id, name: c.name })),
    products: store.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      categoryName: p.category?.name ?? null,
      basePricePesewas: p.basePricePesewas,
      stock: p.stock,
      sold: p.sold,
      color: p.color,
      imageUrl: p.imageUrl,
      variants: p.variants.map((v) => ({ id: v.id, size: v.size, pricePesewas: v.pricePesewas })),
      ...priceRange(p),
    })),
  });
});
