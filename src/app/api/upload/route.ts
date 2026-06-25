/**
 * /api/upload — store image uploads (logo / banner) → Vercel Blob.
 *
 *   POST  (multipart/form-data: `file`, `kind`=logo|banner)
 *         → { url } of the uploaded public blob.
 *
 * The browser downscales the image first (src/utils/image.ts), so the file that
 * reaches here is small. We upload it to Blob and hand back the URL; the
 * Storefront page then saves that URL onto the store via PATCH /api/store.
 *
 * Needs `BLOB_READ_WRITE_TOKEN` in the environment (Vercel Blob store token).
 */
import { put } from "@vercel/blob";
import { handle, ok, ApiError } from "@/lib/api/http";
import { requireStore } from "@/lib/api/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB — comfortably under the platform limit
const KINDS = new Set(["logo", "banner"]);

export const POST = handle(async (req) => {
  const { store } = await requireStore();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new ApiError(500, "Image uploads aren't configured (missing BLOB_READ_WRITE_TOKEN).");
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = String(form?.get("kind") ?? "");

  if (!(file instanceof File)) throw ApiError.badRequest('"file" is required');
  if (!KINDS.has(kind)) throw ApiError.badRequest('"kind" must be "logo" or "banner"');
  if (!file.type.startsWith("image/")) throw ApiError.badRequest("File must be an image");
  if (file.size > MAX_BYTES) throw ApiError.badRequest("Image is too large (max 4MB)");

  // Per-store path; random suffix avoids collisions and lets the CDN cache
  // immutably (each upload gets a fresh URL).
  const blob = await put(`stores/${store.id}/${kind}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return ok({ url: blob.url });
});
