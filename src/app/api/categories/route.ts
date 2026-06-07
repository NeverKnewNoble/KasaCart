/**
 * /api/categories — per-store product categories (Create Product modal list).
 *
 *   GET  → list categories (with product counts), ordered for display.
 *   POST → create a category.
 *
 * Maps to `categories` (§4.6). Unique per store by name.
 */
import { handle, ok, created, readJson } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { str, optInt } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { store } = await requireStore();
  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return ok(categories);
});

export const POST = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);
  const category = await prisma.category.create({
    data: {
      storeId: store.id,
      name: str(body, "name"),
      position: optInt(body, "position", { min: 0 }) ?? 0,
    },
  });
  return created(category);
});
