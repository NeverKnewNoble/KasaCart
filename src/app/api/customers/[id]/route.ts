/**
 * /api/customers/[id] — a single customer.
 *
 *   GET    → the customer + their orders (most recent first).
 *   PATCH  → update contact / delivery details.
 *   DELETE → remove the customer (their orders keep the snapshot; customer_id
 *            is set null — ON DELETE SET NULL).
 */
import { handle, ok, noContent, readJson, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { optStr, optEnum, optHexColor } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";
import { ContactMethod, Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function ownedCustomer(storeId: string, id: string) {
  const customer = await prisma.customer.findFirst({ where: { id, storeId } });
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
}

export const GET = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  const customer = await prisma.customer.findFirst({
    where: { id, storeId: store.id },
    include: { orders: { orderBy: { placedAt: "desc" } } },
  });
  if (!customer) throw ApiError.notFound("Customer not found");
  return ok(customer);
});

export const PATCH = handle<{ id: string }>(async (req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedCustomer(store.id, id);
  const body = await readJson(req);
  const data: Prisma.CustomerUncheckedUpdateInput = {
    firstName: optStr(body, "firstName"),
    lastName: optStr(body, "lastName"),
    email: optStr(body, "email"),
    phone: optStr(body, "phone"),
    preferredContact: optEnum(body, "preferredContact", ContactMethod),
    address: optStr(body, "address"),
    city: optStr(body, "city"),
    region: optStr(body, "region"),
    color: optHexColor(body, "color"),
  };
  const customer = await prisma.customer.update({ where: { id }, data });
  return ok(customer);
});

export const DELETE = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedCustomer(store.id, id);
  await prisma.customer.delete({ where: { id } });
  return noContent();
});
