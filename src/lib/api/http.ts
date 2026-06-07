/**
 * Shared HTTP helpers for Route Handlers (`src/app/api/**`).
 *
 * Every API route returns JSON in a consistent envelope and surfaces errors with
 * the right status code. Routes wrap their body in `handle()` so thrown
 * `ApiError`s (and known Prisma errors) become clean responses instead of 500s.
 */
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

/** An error with an HTTP status. Throw these anywhere inside a handler. */
export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
  static badRequest(msg = "Bad request", details?: unknown) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = "Not signed in") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Already exists") {
    return new ApiError(409, msg);
  }
}

/** 200 with `{ data }`. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

/** 201 with `{ data }`. */
export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

/** 204, no body. */
export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/** Parse a JSON request body, 400ing on malformed JSON. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
    throw ApiError.badRequest("Body must be a JSON object");
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.badRequest("Invalid JSON body");
  }
}

/**
 * Wrap a route handler so thrown errors become proper responses.
 *
 * Maps `ApiError` → its status, and the two Prisma errors we hit most:
 *   P2002 (unique violation) → 409, P2025 (record not found) → 404.
 */
export function handle<P = Record<string, string>>(
  fn: (req: Request, ctx: { params: Promise<P> }) => Promise<Response>
) {
  return async (req: Request, ctx: { params: Promise<P> }) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message, details: err.details },
          { status: err.status }
        );
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          const target = (err.meta?.target as string[] | undefined)?.join(", ");
          return NextResponse.json(
            { error: target ? `Already exists (${target})` : "Already exists" },
            { status: 409 }
          );
        }
        if (err.code === "P2025") {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
      }
      console.error("[api] unhandled error:", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
