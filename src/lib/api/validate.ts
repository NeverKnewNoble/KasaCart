/**
 * Tiny, dependency-free validation helpers for request bodies.
 *
 * We don't pull in zod for this app — these cover the shapes the API needs and
 * throw `ApiError(400, …)` with a clear message when input is wrong.
 */
import { ApiError } from "./http";

type Body = Record<string, unknown>;

/** Required non-empty string. */
export function str(body: Body, key: string): string {
  const v = body[key];
  if (typeof v !== "string" || v.trim() === "") {
    throw ApiError.badRequest(`"${key}" is required and must be a non-empty string`);
  }
  return v.trim();
}

/** Optional string → trimmed string | undefined (null/"" → undefined). */
export function optStr(body: Body, key: string): string | undefined {
  const v = body[key];
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v !== "string") throw ApiError.badRequest(`"${key}" must be a string`);
  return v.trim();
}

/**
 * Tri-state optional string: distinguishes "clear this field" from "leave it".
 *   absent / undefined → undefined  (don't touch the column)
 *   null / ""          → null       (clear the column)
 *   string             → trimmed value
 * Use for nullable columns the UI can explicitly empty (e.g. logoUrl, bannerUrl).
 */
export function nullableStr(body: Body, key: string): string | null | undefined {
  if (!(key in body) || body[key] === undefined) return undefined;
  const v = body[key];
  if (v === null || v === "") return null;
  if (typeof v !== "string") throw ApiError.badRequest(`"${key}" must be a string or null`);
  return v.trim();
}

/** Required integer (optionally bounded). */
export function int(body: Body, key: string, opts: { min?: number; max?: number } = {}): number {
  const v = body[key];
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isInteger(n)) throw ApiError.badRequest(`"${key}" must be an integer`);
  if (opts.min !== undefined && n < opts.min)
    throw ApiError.badRequest(`"${key}" must be ≥ ${opts.min}`);
  if (opts.max !== undefined && n > opts.max)
    throw ApiError.badRequest(`"${key}" must be ≤ ${opts.max}`);
  return n;
}

/** Optional integer → number | undefined. */
export function optInt(
  body: Body,
  key: string,
  opts: { min?: number; max?: number } = {}
): number | undefined {
  if (body[key] === undefined || body[key] === null) return undefined;
  return int(body, key, opts);
}

/** Optional boolean → boolean | undefined. */
export function optBool(body: Body, key: string): boolean | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "boolean") throw ApiError.badRequest(`"${key}" must be a boolean`);
  return v;
}

/**
 * Optional enum value: must be one of the Prisma enum object's values.
 * Pass the generated enum object, e.g. `enumVal(body, "status", OrderStatus)`.
 */
export function optEnum<T extends Record<string, string>>(
  body: Body,
  key: string,
  enumObj: T
): T[keyof T] | undefined {
  const v = body[key];
  if (v === undefined || v === null || v === "") return undefined;
  const allowed = Object.values(enumObj);
  if (typeof v !== "string" || !allowed.includes(v)) {
    throw ApiError.badRequest(`"${key}" must be one of: ${allowed.join(", ")}`);
  }
  return v as T[keyof T];
}

/** Required enum value. */
export function enumVal<T extends Record<string, string>>(
  body: Body,
  key: string,
  enumObj: T
): T[keyof T] {
  const v = optEnum(body, key, enumObj);
  if (v === undefined) {
    throw ApiError.badRequest(`"${key}" is required and must be one of: ${Object.values(enumObj).join(", ")}`);
  }
  return v;
}

/** Require that `body[key]` is a non-empty array; returns it typed as unknown[]. */
export function arr(body: Body, key: string, opts: { min?: number } = {}): unknown[] {
  const v = body[key];
  if (!Array.isArray(v)) throw ApiError.badRequest(`"${key}" must be an array`);
  if (opts.min !== undefined && v.length < opts.min)
    throw ApiError.badRequest(`"${key}" must have at least ${opts.min} item(s)`);
  return v;
}

/** Optional hex colour (#rrggbb) validator. */
export function optHexColor(body: Body, key: string): string | undefined {
  const v = optStr(body, key);
  if (v === undefined) return undefined;
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) throw ApiError.badRequest(`"${key}" must be a #rrggbb hex colour`);
  return v;
}
