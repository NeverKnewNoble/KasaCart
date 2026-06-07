/**
 * /api/categories/[id] — rename/reorder or delete a category.
 *
 *   PATCH  → update name / position.
 *   DELETE → remove it (products' category_id is set null — ON DELETE SET NULL).
 */
import { handle, ok, noContent, readJson, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { optStr, optInt } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function ownedCategory(storeId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, storeId } });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export const PATCH = handle<{ id: string }>(async (req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedCategory(store.id, id);
  const body = await readJson(req);
  const data: Prisma.CategoryUncheckedUpdateInput = {
    name: optStr(body, "name"),
    position: optInt(body, "position", { min: 0 }),
  };
  const category = await prisma.category.update({ where: { id }, data });
  return ok(category);
});

export const DELETE = handle<{ id: string }>(async (_req, ctx: Ctx) => {
  const { store } = await requireStore();
  const { id } = await ctx.params;
  await ownedCategory(store.id, id);
  await prisma.category.delete({ where: { id } });
  return noContent();
});
