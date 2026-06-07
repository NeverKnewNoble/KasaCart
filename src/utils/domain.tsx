"use client";

/**
 * Domain helpers — build shareable store links against whatever host the app is
 * actually running on, instead of hard-coding "kasacart.com".
 *
 * This matters while we don't own a custom domain yet: in dev we're on
 * `localhost:3000`, on Vercel we're on something like `kasacart-xyz.vercel.app`,
 * and once a domain is bought we'll be on `kasacart.com`. These helpers read the
 * live host so every "your store is live" link points at the right place.
 */

import { useEffect, useState } from "react";

/** Used during SSR / build, before the browser can tell us the real host. */
const FALLBACK_HOST = process.env.NEXT_PUBLIC_SITE_HOST ?? "kasacart.com";

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/**
 * The host the app is currently served from, e.g. `localhost:3000`,
 * `kasacart-xyz.vercel.app` or `kasacart.com`. Reads `window.location` in the
 * browser and falls back to `NEXT_PUBLIC_SITE_HOST` (or the constant) on the
 * server where `window` doesn't exist.
 */
export function getCurrentHost(): string {
  if (typeof window !== "undefined") return window.location.host;
  return stripProtocol(FALLBACK_HOST);
}

/** Full origin including protocol, e.g. `https://kasacart.com`. */
export function getCurrentOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const host = stripProtocol(FALLBACK_HOST);
  return `https://${host}`;
}

function isLocalHost(host: string): boolean {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

/**
 * A shareable store URL for a given handle on the current domain.
 *
 * On a real domain we use a subdomain (`adwoascloset.kasacart.com`). On
 * `localhost` and `*.vercel.app` — where wildcard subdomains aren't wired up —
 * we fall back to a path (`localhost:3000/store/adwoascloset`).
 *
 * Pass an explicit `host` (e.g. from {@link useCurrentHost}) to keep server and
 * client renders in sync and avoid hydration mismatches.
 */
export function buildStoreUrl(handle: string, host: string = getCurrentHost()): string {
  const local = isLocalHost(host);
  const isVercel = host.endsWith(".vercel.app");
  const protocol = local ? "http" : "https";

  if (local || isVercel) {
    return `${protocol}://${host}/store/${handle}`;
  }
  return `${protocol}://${handle}.${host}`;
}

/** Same as {@link buildStoreUrl} but without the protocol — for display. */
export function storeDisplayUrl(handle: string, host: string = getCurrentHost()): string {
  return stripProtocol(buildStoreUrl(handle, host));
}

/**
 * Client hook returning the live host. Starts with the SSR fallback so the
 * first client render matches the server, then updates to the real host after
 * mount. Use this in client components instead of calling {@link getCurrentHost}
 * directly during render.
 */
export function useCurrentHost(): string {
  const [host, setHost] = useState<string>(() => stripProtocol(FALLBACK_HOST));
  useEffect(() => {
    setHost(getCurrentHost());
  }, []);
  return host;
}
