/**
 * Client-side image downscaling.
 *
 * Store logos/banners go to Vercel Blob (see src/services/storefront.ts →
 * /api/upload), but we shrink them in the browser first. This keeps uploads well
 * under the platform's server-upload limit, keeps Blob storage small, and means
 * the stored file is already a sensible size for the storefront.
 *
 * Returns a JPEG `File` (or the original file untouched if it isn't a raster
 * image we can draw, e.g. an SVG).
 */

type ResizeOptions = {
  /** Longest edge of the output, in pixels. */
  maxDim: number;
  /** JPEG quality, 0–1. */
  quality?: number;
};

/** Logos are small and square-ish; banners are wide. */
export const LOGO_RESIZE: ResizeOptions = { maxDim: 512, quality: 0.85 };
export const BANNER_RESIZE: ResizeOptions = { maxDim: 1600, quality: 0.82 };

export async function resizeImage(file: File, opts: ResizeOptions): Promise<File> {
  // SVGs (and anything non-raster) can't be drawn to a canvas meaningfully —
  // pass them through as-is.
  if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // decode failed — let the original through

  const { width, height } = bitmap;
  const scale = Math.min(1, opts.maxDim / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", opts.quality ?? 0.85)
  );
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
