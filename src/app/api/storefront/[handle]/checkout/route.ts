/**
 * /api/storefront/[handle]/checkout — PUBLIC checkout (no auth).
 *
 *   POST → place an order from the storefront cart. Upserts the customer (unique
 *          per store by phone/email), creates the order + items, and adjusts
 *          stock — all in one transaction. Maps to §4.9–4.12.
 *
 * SECURITY: prices are re-derived server-side from the product/variant ids — the
 * client only sends `{ productId, variantId?, quantity }`, never a price. This
 * stops a tampered cart from setting its own totals.
 *
 * Body:
 *   { customer: { firstName, lastName, phone, email?, address, city, region },
 *     paymentMethod?: "cash_on_delivery" | "mobile_money" | "bank_transfer",
 *     items: [{ productId, variantId?, quantity }] }
 */
import { handle as wrap, created, readJson, ApiError } from "@/lib/api/http";
import { str, optStr, int, arr, optEnum } from "@/lib/api/validate";
import { itemSummary, nextOrderNumber } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, SalesChannel } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ handle: string }> };

export const POST = wrap<{ handle: string }>(async (req, ctx: Ctx) => {
  const { handle } = await ctx.params;
  const body = await readJson(req);

  const store = await prisma.store.findUnique({ where: { handle } });
  if (!store || !store.isPublished) throw ApiError.notFound("Store not found");

  // --- customer details (the checkout form) ---
  const c = (body.customer ?? {}) as Record<string, unknown>;
  const firstName = str(c, "firstName");
  const lastName = str(c, "lastName");
  const phone = str(c, "phone");
  const email = optStr(c, "email");
  const address = str(c, "address");
  const city = str(c, "city");
  const region = str(c, "region");

  // --- resolve each cart line from the DB (authoritative price + name) ---
  const rawItems = arr(body, "items", { min: 1 });
  const resolved = await Promise.all(
    rawItems.map(async (it, i) => {
      if (typeof it !== "object" || it === null) throw ApiError.badRequest(`items[${i}] must be an object`);
      const ib = it as Record<string, unknown>;
      const productId = str(ib, "productId");
      const quantity = int(ib, "quantity", { min: 1 });
      const variantId = optStr(ib, "variantId");

      const product = await prisma.product.findFirst({
        where: { id: productId, storeId: store.id, isActive: true },
        include: { variants: true },
      });
      if (!product) throw ApiError.badRequest(`Product ${productId} is unavailable`);

      let unitPricePesewas: number | null = product.basePricePesewas;
      let size: string | null = null;
      if (variantId) {
        const variant = product.variants.find((v) => v.id === variantId);
        if (!variant) throw ApiError.badRequest(`Invalid size for ${product.name}`);
        unitPricePesewas = variant.pricePesewas;
        size = variant.size;
      } else if (product.variants.length > 0) {
        // priced entirely by variants but none chosen → cheapest as the default
        unitPricePesewas = Math.min(...product.variants.map((v) => v.pricePesewas));
      }
      if (unitPricePesewas == null) throw ApiError.badRequest(`${product.name} has no price`);

      return {
        productId: product.id,
        variantId: variantId ?? null,
        productName: product.name,
        size,
        unitPricePesewas,
        quantity,
        lineTotalPesewas: unitPricePesewas * quantity,
      };
    })
  );

  const subtotalPesewas = resolved.reduce((s, it) => s + it.lineTotalPesewas, 0);
  const orderNumber = await nextOrderNumber(store.id);
  const paymentMethod = optEnum(body, "paymentMethod", PaymentMethod) ?? null;

  const order = await prisma.$transaction(async (tx) => {
    // Upsert the customer: unique per store by phone (preferred) or email.
    const existing = await tx.customer.findFirst({
      where: {
        storeId: store.id,
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });
    const customerData = {
      firstName,
      lastName,
      phone,
      email: email ?? null,
      address,
      city,
      region,
      preferredContact: "phone" as const,
    };
    const customer = existing
      ? await tx.customer.update({ where: { id: existing.id }, data: customerData })
      : await tx.customer.create({ data: { storeId: store.id, ...customerData } });

    const createdOrder = await tx.order.create({
      data: {
        storeId: store.id,
        customerId: customer.id,
        orderNumber,
        channel: SalesChannel.storefront,
        paymentMethod,
        subtotalPesewas,
        totalPesewas: subtotalPesewas, // delivery arranged with the seller later
        customerName: `${firstName} ${lastName}`,
        customerPhone: phone,
        customerEmail: email ?? null,
        deliveryAddress: address,
        deliveryCity: city,
        deliveryRegion: region,
        items: { create: resolved },
        statusEvents: { create: { status: "pending", note: "Placed from storefront" } },
      },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });

    for (const it of resolved) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stock: { decrement: it.quantity }, sold: { increment: it.quantity } },
      });
    }
    return createdOrder;
  });

  return created({
    ref: order.orderNumber,
    totalPesewas: order.totalPesewas,
    itemSummary: itemSummary(order.items),
    whatsappPhone: store.whatsappPhone,
  });
});
