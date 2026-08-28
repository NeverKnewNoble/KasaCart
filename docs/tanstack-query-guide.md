# TanStack Query & Caching — implementation guide

How to move KasaCart's data fetching from hand-rolled `useEffect` + `useState`
onto **TanStack Query (React Query v5)**, and how caching works once you do.

For the services this replaces, see [services.md](./services.md); for how the UI
consumes data today, see [data-layer.md](./data-layer.md).

> TanStack Query is **already installed** (`@tanstack/react-query` in `package.json`).
> Nothing to add to use it. The Devtools package in Phase 3 is the only new install.

---

## Why bother? (what you get)

Today every page does the same dance: a `useEffect` that calls a service, a
`useState` for the data, another `useState` for `loading`, and a manual
`refresh()` you have to remember to call after every create/edit/delete. See
[products/page.tsx](../src/app/(portal)/products/page.tsx) for the pattern.

TanStack Query replaces all of that with one hook and gives you, for free:

- **Caching** — visit Products, leave, come back → data shows *instantly* from
  cache while it quietly refetches in the background.
- **No more `loading` state** — the hook hands you `isLoading` / `isError`.
- **Automatic refetch** — on window focus, on reconnect, on demand.
- **One source of truth** — invalidate a "query key" after a mutation and every
  component using that data updates itself. No more manual `refresh()`.

### The two meanings of "cache"

1. **TanStack Query cache** — lives in the browser, per session. This is what
   this guide is about. Configured by `staleTime` / `gcTime` (Phase 3).
2. **Next.js server cache** — `revalidate` / `unstable_cache` on the server.
   Different thing. Barely relevant here because our data is auth-scoped and
   fetched client-side. Covered briefly in Phase 4.

---

## Core mental model (read this once)

Three concepts. That's the whole library.

| Concept | What it is | Hook |
| --- | --- | --- |
| **Query** | A *read*. Identified by a **query key**. Cached. | `useQuery` |
| **Mutation** | A *write* (create/update/delete). Not cached. | `useMutation` |
| **Query key** | A unique array that names cached data, e.g. `["products"]` or `["product", id]` | — |

The flow:

```
useQuery(["products"]) ──► reads from cache, refetches if "stale"
        │
        ▼  (user edits a product)
useMutation(...) ──► on success ──► invalidateQueries(["products"])
                                          │
                                          ▼
                          the ["products"] query refetches automatically
                          → the grid updates itself, no refresh() call
```

**staleTime vs gcTime** (the two knobs people confuse):

- **`staleTime`** — how long data is considered *fresh*. While fresh, revisiting
  the page uses cache with **no** refetch. After it, the next use triggers a
  background refetch. Default `0` (always refetch on remount).
- **`gcTime`** (garbage-collection time) — once *no component* is using a query,
  how long its data lingers in memory before being dropped. Default 5 min.

---

## ⚠️ Blocker to fix first: services swallow errors

Our services (e.g. [services/products.ts](../src/services/products.ts)) do this:

```ts
static async listProducts() {
  try {
    const response = await axios.get(...);
    return response.data.data;
  } catch (err) {
    console.error("...", err);   // ← swallows the error, returns undefined
  }
}
```

TanStack Query decides a request **failed** by whether the query function
**throws**. Because our `catch` swallows the error and returns `undefined`, a
failed request looks like a *successful* one with no data — `isError` will never
fire.

**Fix:** in each service method you wire up, let the error propagate. Either
delete the `try/catch`, or `throw err` inside it:

```ts
static async listProducts() {
  const response = await axios.get<{ data: ProductDTO[] }>(`${backendUrl}/products`);
  return response.data.data;          // axios throws on non-2xx by itself
}
```

Do this per-method as you convert each page — no need to change them all upfront.

---

## Phase 0 — Foundation (do once)

Unblocks every page. ~15 minutes.

- [ ] **Create the provider** — `src/components/providers/QueryProvider.tsx`
      (`"use client"`). One `QueryClient`, kept in `useState` so it survives
      re-renders, with app-wide defaults:

  ```tsx
  "use client";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { useState } from "react";

  export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 30_000,        // 30s fresh before background refetch
              retry: 1,                 // retry a failed request once
              refetchOnWindowFocus: true,
            },
          },
        })
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  ```

- [ ] **Mount it** in [src/app/layout.tsx](../src/app/layout.tsx) — wrap
      `{children}`, alongside the existing `AuthSessionProvider`:

  ```tsx
  <AuthSessionProvider>
    <QueryProvider>{children}</QueryProvider>
  </AuthSessionProvider>
  ```

- [ ] **Fix error-swallowing** in the services you're about to use (see the
      blocker section above).

- [ ] **(Optional) Central key registry** — `src/lib/queryKeys.ts` so keys
      aren't retyped as loose strings across files:

  ```ts
  export const keys = {
    products: ["products"] as const,
    product: (id: string) => ["product", id] as const,
    categories: ["categories"] as const,
    orders: ["orders"] as const,
    // …add as you go
  };
  ```

---

## Phase 1 — Convert reads (`useQuery`)

One page at a time. The before/after for Products:

**Before** ([products/page.tsx](../src/app/(portal)/products/page.tsx)):

```tsx
const [products, setProducts] = useState<ProductRow[]>([]);
const [loading, setLoading] = useState(true);

const refresh = async () => {
  const list = await Products.listProducts();
  if (!list) { toast.error("Couldn't load your products."); return; }
  setProducts(list.map(productToRow));
};

useEffect(() => {
  (async () => { await refresh(); setLoading(false); })();
}, []);
```

**After:**

```tsx
import { useQuery } from "@tanstack/react-query";

const { data: products = [], isLoading, isError } = useQuery({
  queryKey: ["products"],
  queryFn: Products.listProducts,
  select: (list) => list.map(productToRow),   // map DTO → row here
});
```

`isLoading` replaces your `loading` state; `isError` replaces the toast-on-null
check; the manual `refresh()` goes away (mutations invalidate instead — Phase 2).

Convert each page:

- [ ] [products/page.tsx](../src/app/(portal)/products/page.tsx) — `["products"]` + `["categories"]`
- [ ] [orders/page.tsx](../src/app/(portal)/orders/page.tsx) — `["orders"]`
- [ ] [customers/page.tsx](../src/app/(portal)/customers/page.tsx) — `["customers"]`
- [ ] [dashboard/page.tsx](../src/app/(portal)/dashboard/page.tsx) — `["dashboard"]` (longer `staleTime`)
- [ ] [analytics/page.tsx](../src/app/(portal)/analytics/page.tsx) — `["analytics"]`
- [ ] [payments/page.tsx](../src/app/(portal)/payments/page.tsx) — `["payments"]`
- [ ] [settings/page.tsx](../src/app/(portal)/settings/page.tsx) — `["settings"]`
- [ ] [storefront/page.tsx](../src/app/(portal)/storefront/page.tsx) — `["store"]`
- [ ] [store/[handle]/page.tsx](../src/app/store/[handle]/page.tsx) — `["storefront", handle]` ← **keyed by the dynamic param** so each store caches separately

---

## Phase 2 — Convert writes (`useMutation` + invalidation)

Mutations wrap your create/update/delete service calls. On success, you
**invalidate** the affected query key and the list refetches itself.

Example, in [CreateProductModal.tsx](../src/components/modals/CreateProductModal.tsx):

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const qc = useQueryClient();

const create = useMutation({
  mutationFn: (input: ProductInput) => Products.createProduct(input),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["products"] });   // refetch the grid
    toast.success("Product created");
    onClose();
  },
  onError: () => toast.error("Couldn't create the product."),
});

// in the submit handler:
create.mutate(formValues);
// create.isPending → disable the submit button while it runs
```

- [x] **Products** create/edit/delete — mutations live in
      [products/page.tsx](../src/app/(portal)/products/page.tsx) (where the service
      calls are) → invalidate `["products"]`
- [x] **Orders** create/edit/delete — mutations in
      [orders/page.tsx](../src/app/(portal)/orders/page.tsx) → invalidate `["orders"]`
- [x] **Categories** create → invalidate `["categories"]`
- [x] Keep your [toast helpers](../src/utils/notify.ts) — they live naturally in
      `onSuccess` / `onError`.

Once mutations invalidate, **delete the old `refresh()` helpers** — they're dead code.

---

## Phase 3 — Caching (the part you want to learn)

Now that queries work, tune the cache and watch it behave.

- [ ] **Set `staleTime` per query** — override the global default where it makes
      sense. Slow-changing data (settings, categories) → minutes. Live data
      (orders, dashboard) → seconds. Example: `useQuery({ queryKey: ["settings"], queryFn, staleTime: 5 * 60_000 })`.

- [ ] **Install Devtools** and watch the cache live — the single best way to
      *understand* it:

  ```bash
  yarn add -D @tanstack/react-query-devtools
  ```

  ```tsx
  // inside QueryProvider, under {children}
  import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
  // …
  <ReactQueryDevtools initialIsOpen={false} />
  ```

  Then open a page and watch queries flip **fresh → stale**, see refetches on
  focus, and inspect cached data.

- [ ] **Learn `invalidateQueries` vs `setQueryData`:**
  - `invalidateQueries(key)` — mark stale + refetch from server (safe default).
  - `setQueryData(key, updater)` — write the cache directly, no network call.
    Basis for **optimistic updates** (update the UI instantly, roll back on error).

- [ ] **(Optional) Prefetch on hover** — `queryClient.prefetchQuery({ queryKey, queryFn })`
      when a user hovers a nav link, so the page is already loaded on click.

---

## Phase 4 — Next.js server caching (optional, later)

Only relevant if you move fetching into **Server Components** or route handlers
instead of client hooks. Then Next's own cache (`revalidate`, `unstable_cache`)
comes into play — a *separate* system from TanStack Query.

> ⚠️ This project runs a **modified Next.js 16** (see [AGENTS.md](../AGENTS.md)).
> The caching APIs may differ from stock Next. **Read
> `node_modules/next/dist/docs/` before using `revalidate` / `unstable_cache`.**

For KasaCart's current all-client-side, auth-scoped fetching, you can skip this
entirely.

---

## Suggested order

1. **Phase 0** — provider + layout + fix Products' service errors.
2. **Products page, end to end** — read (Phase 1) *and* its create/edit/delete
   mutations (Phase 2). One page teaches you queries **and** mutations.
3. **Add Devtools** (Phase 3) and watch the Products cache behave.
4. **Repeat** the same pattern across the remaining pages.

Products is the ideal first page: it has a list read, a categories read, and a
full set of mutations — the whole library in one screen.
