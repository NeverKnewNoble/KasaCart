/**
 * /api/store — the signed-in seller's store (brand + settings).
 *
 *   GET   → the current store (auto-created on first call).
 *   PATCH → update brand/settings fields (Storefront page + Settings page).
 *
 * Maps to `stores` (docs/database-schema.md §4.2). Money/handles aside, this is
 * the one row that backs both the Storefront editor and the Settings page.
 */
import { handle, ok, readJson } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";
import { optStr, optBool, optHexColor, nullableStr } from "@/lib/api/validate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const { store } = await requireStore();
  return ok(store);
});

export const PATCH = handle(async (req) => {
  const { store } = await requireStore();
  const body = await readJson(req);

  // Only the editable brand/settings fields. `handle` is normalised like the UI.
  const rawHandle = optStr(body, "handle");
  const data = {
    name: optStr(body, "name"),
    handle: rawHandle?.toLowerCase().replace(/[^a-z0-9-]/g, ""),
    tagline: optStr(body, "tagline"),
    accentColor: optHexColor(body, "accentColor"),
    // Nullable so "Remove" actually clears the column (optStr would skip it).
    logoUrl: nullableStr(body, "logoUrl"),
    bannerUrl: nullableStr(body, "bannerUrl"),
    whatsappPhone: optStr(body, "whatsappPhone"),
    supportPhone: optStr(body, "supportPhone"),
    location: optStr(body, "location"),
    currencyCode: optStr(body, "currencyCode"),
    isPublished: optBool(body, "isPublished"),
  };

  const updated = await prisma.store.update({ where: { id: store.id }, data });
  return ok(updated);
});
