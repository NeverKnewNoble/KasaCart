# Services Reference — `src/services/`

The browser-side **service layer**: one class per page whose `static async` methods call the
API routes ([api-reference.md](./api-reference.md)) and return typed DTOs ([data-layer.md](./data-layer.md)).
Client components call these instead of `fetch`/`axios` directly.

---

## How they work (read once)

- **Shape:** each file `export default class X` with `static async` methods — call them as
  `Products.listProducts()`, no instance needed.
- **Base URL:** every method prefixes `backendUrl` from [`src/services/main.ts`](../src/services/main.ts)
  (`/api` by default; override with `NEXT_PUBLIC_BACKEND_URL`).
- **Transport:** `axios`. Same-origin, so the Clerk session cookie is sent automatically.
- **Envelope:** the API wraps success as `{ data: … }`, so methods return `response.data.data`
  (the payload itself). Money is in **pesewas**; enums use the **DB values** (`"pending"`, …).
- **Errors:** non-2xx responses make axios reject → caught in each method's `catch`, which
  logs and returns `undefined`. **So every method returns `T | undefined`** — callers should
  null-check (e.g. `const list = await Orders.listOrders(); if (!list) return;`).
- **Types:** params and responses are typed from `@/types/*` (DTOs) and `@/types/api` (enums).

```ts
import Orders from "@/services/orders";

const orders = await Orders.listOrders({ status: "pending" });
if (!orders) return;            // request failed (already logged)
```

---

## `main.ts`
Exports `backendUrl: string` — the base path all services prefix. Not a class.

---

## `Products` — `src/services/products.ts`
Products grid + Create/Edit Product modal, plus the category list. → `/api/products`, `/api/categories`.

| Method | Params | Returns |
| --- | --- | --- |
| `listProducts()` | — | `ProductDTO[] \| undefined` |
| `getProduct(id)` | `id: string` | `ProductDTO \| undefined` |
| `createProduct(productDetails)` | `ProductInput` | `ProductDTO \| undefined` |
| `updateProduct(id, productDetails)` | `id, Partial<ProductInput>` | `ProductDTO \| undefined` |
| `deleteProduct(id)` | `id: string` | `undefined` (204) |
| `listCategories()` | — | `CategoryDTO[] \| undefined` |
| `createCategory(categoryDetails)` | `CategoryInput` | `CategoryDTO \| undefined` |
| `updateCategory(id, categoryDetails)` | `id, Partial<CategoryInput>` | `CategoryDTO \| undefined` |
| `deleteCategory(id)` | `id: string` | `undefined` (204) |

> `updateProduct` with a `variants` array **replaces** the whole variant set. Types in
> [`@/types/products`](../src/types/products.ts).

## `Orders` — `src/services/orders.ts`
Orders table (with filters) + Create/Edit Order modal. → `/api/orders[/id]`.

| Method | Params | Returns |
| --- | --- | --- |
| `listOrders(filters?)` | `OrderListFilters` (status/channel/paymentStatus/customerId/q) | `OrderDTO[] \| undefined` |
| `getOrder(id)` | `id: string` | `OrderDTO \| undefined` (incl. items + status timeline) |
| `createOrder(orderDetails)` | `OrderInput` | `OrderDTO \| undefined` |
| `updateOrder(id, orderDetails)` | `id, OrderUpdate` | `OrderDTO \| undefined` |
| `deleteOrder(id)` | `id: string` | `undefined` (204) |

> `createOrder` snapshots line items and adjusts stock server-side; `updateOrder` appends a
> status-event when `status` changes. Types in [`@/types/orders`](../src/types/orders.ts).

## `Customers` — `src/services/customers.ts`
Customers page. → `/api/customers[/id]`.

| Method | Params | Returns |
| --- | --- | --- |
| `listCustomers()` | — | `CustomerWithStats[] \| undefined` (order count, total spent, last order) |
| `getCustomer(id)` | `id: string` | `CustomerDetail \| undefined` (incl. their orders) |
| `createCustomer(customerDetails)` | `CustomerInput` | `CustomerDTO \| undefined` |
| `updateCustomer(id, customerDetails)` | `id, Partial<CustomerInput>` | `CustomerDTO \| undefined` |
| `deleteCustomer(id)` | `id: string` | `undefined` (204) |

Types in [`@/types/customers`](../src/types/customers.ts).

## `Dashboard` — `src/services/dashboard.ts`
→ `/api/dashboard`.

| Method | Params | Returns |
| --- | --- | --- |
| `getDashboard()` | — | `DashboardData \| undefined` (KPIs, pipeline, recent orders, top products) |

## `Analytics` — `src/services/analytics.ts`
→ `/api/analytics`.

| Method | Params | Returns |
| --- | --- | --- |
| `getAnalytics()` | — | `AnalyticsData \| undefined` (KPIs, channels, status, top products, monthly) |

## `Storefront` — `src/services/storefront.ts`
Storefront brand/theme editor. → `/api/store`.

| Method | Params | Returns |
| --- | --- | --- |
| `getStore()` | — | `StoreDTO \| undefined` |
| `updateStore(storeDetails)` | `StoreUpdate` | `StoreDTO \| undefined` |

## `Settings` — `src/services/settings.ts`
Settings page (store details + notifications). → `/api/store`, `/api/store/notifications`.

| Method | Params | Returns |
| --- | --- | --- |
| `getStore()` | — | `StoreDTO \| undefined` |
| `updateStore(storeDetails)` | `StoreUpdate` | `StoreDTO \| undefined` |
| `getNotifications()` | — | `NotificationPreferencesDTO \| undefined` |
| `updateNotifications(preferences)` | `NotificationPreferencesInput` | `NotificationPreferencesDTO \| undefined` |

> `getStore`/`updateStore` hit the same `/api/store` row as the `Storefront` class — both
> pages edit different field subsets.

## `Payments` — `src/services/payments.ts`
Billing & plan. → `/api/billing`.

| Method | Params | Returns |
| --- | --- | --- |
| `getBilling()` | — | `BillingData \| undefined` (`{ subscription, invoices }`) |
| `updatePlan(plan)` | `PlanTier` (`"free"` \| `"pro"`) | `SubscriptionDTO \| undefined` |

## `Store` — `src/services/store.ts`
PUBLIC shopper-facing storefront (`/store/[handle]`) — no auth. → `/api/storefront/[handle]`.

| Method | Params | Returns |
| --- | --- | --- |
| `getStorefront(handle)` | `handle: string` | `StorefrontData \| undefined` (published store + active products) |
| `checkout(handle, checkoutDetails)` | `handle, CheckoutInput` | `CheckoutResult \| undefined` (`{ ref, totalPesewas, … }`) |

Types in [`@/types/storefront`](../src/types/storefront.ts). Checkout sends only
`{ productId, variantId?, quantity }` — the server re-derives prices.

---

## Worked example (wiring a page)

```tsx
"use client";
import { useEffect, useState } from "react";
import Products from "@/services/products";
import type { ProductDTO } from "@/types/products";

export function ProductsList() {
  const [products, setProducts] = useState<ProductDTO[]>([]);

  useEffect(() => {
    Products.listProducts().then((list) => {
      if (list) setProducts(list); // undefined = request failed (already logged)
    });
  }, []);

  // pesewas → cedis at the view boundary
  return products.map((p) => <div key={p.id}>{p.name} — ₵{(p.minPricePesewas ?? 0) / 100}</div>);
}
```

See [api-reference.md](./api-reference.md) for the endpoints behind each method and
[data-layer.md](./data-layer.md) for the DTO/enum types.
