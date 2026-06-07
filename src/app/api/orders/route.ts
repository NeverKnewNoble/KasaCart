/**
 * /api/orders — the central transaction list (Orders page + Create Order modal).
 *
 *   GET  → list orders (filterable), each with its line items and the derived
 *          "item" summary string. Query params:
 *            ?status=pending|confirmed|packed|delivered|cancelled
 *            ?channel=storefront|whatsapp|instagram|tiktok|facebook|snapchat
 *            ?paymentStatus=unpaid|paid|refunded
 *            ?customerId=<uuid>
 *            ?q=<text>   (matches order number / customer name)
 *   POST → create an order + its items, snapshotting name/size/price, then adjust
 *          product stock/sold and record an initial status event — all in one
 *          transaction.
 *
 * Maps to `orders` + `order_items` + `order_status_events` (§4.10–4.12).
 * Money is in pesewas; status/channel/payment use the DB enum values.
 */
import { NextRequest } from "next/server";
import { handle, ok, created, readJson, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { str, optStr, int, optInt, optBool, optEnum, enumVal, arr } from "@/lib/api/validate";
import { itemSummary, nextOrderNumber } from "@/lib/api/domain";
import { prisma } from "@/lib/prisma";
import {
  OrderStatus,
  SalesChannel,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Validate the `items` array into order-item create rows (with line totals). */
function parseItems(body: Record<string, unknown>) {
  const raw = arr(body, "items", { min: 1 });
  return raw.map((it, i) => {
    if (typeof it !== "object" || it === null) throw ApiError.badRequest(`items[${i}] must be an object`);
    const ib = it as Record<string, unknown>;
    const unitPricePesewas = int(ib, "unitPricePesewas", { min: 0 });
    const quantity = int(ib, "quantity", { min: 1 });
    return {
      productId: optStr(ib, "productId") ?? null,
      variantId: optStr(ib, "variantId") ?? null,
      productName: str(ib, "productName"),
      size: optStr(ib, "size") ?? null,
      unitPricePesewas,
      quantity,
      lineTotalPesewas: unitPricePesewas * quantity, // schema: app sets this (not a Prisma generated column)
    };
  });
}

export const GET = handle(async (req) => {
  const { store } = await requireStore();
  const sp = (req as NextRequest).nextUrl.searchParams;

  const where: Prisma.OrderWhereInput = { storeId: store.id };
  const status = sp.get("status");
  if (status && status in OrderStatus) where.status = status as OrderStatus;
  const channel = sp.get("channel");
  if (channel && channel in SalesChannel) where.channel = channel as SalesChannel;
  const paymentStatus = sp.get("paymentStatus");
  if (paymentStatus && paymentStatus in PaymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
  const customerId = sp.get("customerId");
  if (customerId) where.customerId = customerId;
  const q = sp.get("q")?.trim();
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { placedAt: "desc" },
  });
  const withSummary = orders.map((o) => ({ ...o, itemSummary: itemSummary(o.items) }));
  return ok(withSummary);
});

export const POST = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);

  const items = parseItems(body);
  const subtotalPesewas = items.reduce((s, it) => s + it.lineTotalPesewas, 0);
  const deliveryFeePesewas = optInt(body, "deliveryFeePesewas", { min: 0 }) ?? 0;
  const totalPesewas = subtotalPesewas + deliveryFeePesewas;

  const status = optEnum(body, "status", OrderStatus) ?? OrderStatus.pending;
  const orderNumber = optStr(body, "orderNumber") ?? (await nextOrderNumber(store.id));

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        storeId: store.id,
        customerId: optStr(body, "customerId") ?? null,
        orderNumber,
        status,
        channel: optEnum(body, "channel", SalesChannel) ?? SalesChannel.storefront,
        paymentMethod: optEnum(body, "paymentMethod", PaymentMethod) ?? null,
        paymentStatus: optEnum(body, "paymentStatus", PaymentStatus) ?? PaymentStatus.unpaid,
        subtotalPesewas,
        deliveryFeePesewas,
        totalPesewas,
        customerName: optStr(body, "customerName"),
        customerPhone: optStr(body, "customerPhone"),
        customerEmail: optStr(body, "customerEmail"),
        deliveryAddress: optStr(body, "deliveryAddress"),
        deliveryCity: optStr(body, "deliveryCity"),
        deliveryRegion: optStr(body, "deliveryRegion"),
        notes: optStr(body, "notes"),
        items: { create: items },
        statusEvents: { create: { status, note: "Order created" } },
      },
      include: { items: { orderBy: { createdAt: "asc" } }, statusEvents: true },
    });

    // Keep stock/sold honest in app code. (The schema ships an optional DB
    // trigger for this, commented out by default — don't enable both or stock
    // double-decrements. See docs/database-schema.md §5.)
    for (const it of items) {
      if (it.productId) {
        await tx.product.update({
          where: { id: it.productId },
          data: {
            stock: { decrement: it.quantity },
            sold: { increment: it.quantity },
          },
        });
      }
    }
    return createdOrder;
  });

  return created({ ...order, itemSummary: itemSummary(order.items) });
});
