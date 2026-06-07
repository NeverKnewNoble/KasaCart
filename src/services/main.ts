/**
 * Shared service config.
 *
 * `backendUrl` is the base path every service prefixes its requests with — the
 * KasaCart API (route handlers under /api). Override with NEXT_PUBLIC_BACKEND_URL
 * if the API is ever hosted on another origin.
 *
 * Note: the API wraps successful responses as `{ data: ... }`, so each service
 * returns `response.data.data` (the payload itself). Non-2xx responses make axios
 * reject, so they land in each method's `catch`.
 */
export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api";
