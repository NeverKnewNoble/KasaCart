/**
 * /api/orders/[id] — a single order.
 *
 *   GET    → order with items, status timeline and linked customer.
 *   PATCH  → update status / paid flag / payment method / channel / delivery /
 *            notes. Changing `status` also appends an `order_status_events` row
 *            (the fulfilment timeline that powers "avg. fulfilment time").
 *   DELETE → remove the order (items + status events cascade).
 *
 * Note: editing line items isn't supported here — recreate the order for that.
 */
import { handle, ok, noContent, readJson, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { optStr, optBool, optEnum } from "@/lib/api/validate";
import { itemSummary } from "@/lib/api/domain";
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

type Ctx = { params: Promise<{ id: string }> };

async function ownedOrder(storeId: string, id: string) {
  const order = await prisma.order.findFirst({ where: { id, storeId } });
  if (!order) throw ApiError.notFound("Order not found");
  return order;
}

export const GET = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  const order = await prisma.order.findFirst({
    where: { id, storeId: store.id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      statusEvents: { orderBy: { changedAt: "asc" } },
      customer: true,
    },
  });
  if (!order) throw ApiError.notFound("Order not found");
  return ok({ ...order, itemSummary: itemSummary(order.items) });
});

export const PATCH = handle<{ id: string }>(async (req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  const existing = await ownedOrder(store.id, id);
  const body = await readJson(req);

  const paid = optBool(body, "paid"); // convenience flag → payment_status
  const nextStatus = optEnum(body, "status", OrderStatus);

  const data: Prisma.OrderUncheckedUpdateInput = {
    status: nextStatus,
    channel: optEnum(body, "channel", SalesChannel),
    paymentMethod: optEnum(body, "paymentMethod", PaymentMethod),
    paymentStatus:
      optEnum(body, "paymentStatus", PaymentStatus) ??
      (paid === undefined ? undefined : paid ? PaymentStatus.paid : PaymentStatus.unpaid),
    customerName: optStr(body, "customerName"),
    customerPhone: optStr(body, "customerPhone"),
    customerEmail: optStr(body, "customerEmail"),
    deliveryAddress: optStr(body, "deliveryAddress"),
    deliveryCity: optStr(body, "deliveryCity"),
    deliveryRegion: optStr(body, "deliveryRegion"),
    notes: optStr(body, "notes"),
  };

  const statusChanged = nextStatus !== undefined && nextStatus !== existing.status;

  const order = await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data });
    if (statusChanged) {
      await tx.orderStatusEvent.create({
        data: { orderId: id, status: nextStatus, note: optStr(body, "statusNote") ?? null },
      });
    }
    return tx.order.findUniqueOrThrow({
      where: { id },
      include: {
        items: { orderBy: { createdAt: "asc" } },
        statusEvents: { orderBy: { changedAt: "asc" } },
      },
    });
  });

  return ok({ ...order, itemSummary: itemSummary(order.items) });
});

export const DELETE = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedOrder(store.id, id);
  await prisma.order.delete({ where: { id } });
  return noContent();
});
