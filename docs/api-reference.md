# API Reference — Route Handlers

The REST API that backs KasaCart, implemented as Next.js **Route Handlers** under
`src/app/api/**`. It reads/writes the Prisma models described in
[database-schema.md](./database-schema.md).

> These routes exist and are type-checked, but the dashboard UI still renders mock data
> ([architecture.md §5](./architecture.md#5-current-state-mock-data-vs-database)). Wiring the
> pages to call these endpoints is the remaining step.

---

## Conventions (read once)

- **Base path:** everything lives under `/api`.
- **Auth:** dashboard routes require a Clerk session. The current seller's **store is resolved
  from the session** and **bootstrapped on first call** — the `users` + `stores` (+ free
  subscription + default notification prefs) rows are created automatically
  (`src/lib/api/store.ts → requireStore()`). Every query is scoped to that one store, so a
  seller can only ever touch their own data.
- **Public routes:** only `/api/storefront/[handle]` and its `/checkout` are public (no auth).
  They serve **published** stores and **active** products only.
- **Money is in pesewas** (integer minor units; 1 GHS ₵ = 100). The DB is authoritative; the
  frontend converts to/from cedis at the boundary. Fields end in `Pesewas`.
- **Enums use the DB values** (`pending`, `mobile_money`, `storefront`, …), not UI labels.
  See the enum lists in [database-schema.md §3](./database-schema.md).
- **Success envelope:** `{ "data": … }` with `200` (read/update) or `201` (create). `DELETE`
  returns `204` with no body.
- **Error envelope:** `{ "error": "message", "details"?: … }` with the right status —
  `400` invalid input, `401` not signed in, `404` not found, `409` duplicate (unique
  violation), `500` otherwise. Handled centrally in `src/lib/api/http.ts`.
- **Runtime:** every route is `runtime = "nodejs"` (Prisma needs Node) and `dynamic =
  "force-dynamic"` (per-request data, never cached).

---

## Dashboard / seller routes (auth required)

### Store — `/api/store`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | The current store (auto-created on first call). |
| `PATCH` | any of `name, handle, tagline, accentColor, logoUrl, bannerUrl, whatsappPhone, supportPhone, location, currencyCode, isPublished` | Updated store. |

`accentColor` must be `#rrggbb`. `handle` is normalised to `[a-z0-9-]`. Backs the **Storefront**
editor and **Settings** page (`stores`, §4.2).

### Notifications — `/api/store/notifications`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | The store's notification preferences. |
| `PUT` | any of `newOrder, lowStock, newCustomer, weeklySummary` (bool), `lowStockThreshold` (int) | Updated prefs. |

Backs **Settings → Notifications** (`notification_preferences`, §4.3).

### Billing — `/api/billing`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | `{ subscription, invoices }`. |
| `PATCH` | `plan: "free" \| "pro"` | Updated subscription (Pro = 9900 pesewas/mo). |

Backs the **Payments** page (`subscriptions`, `invoices`, §4.4–4.5). Records the plan choice
only — no payment processing yet.

### Products — `/api/products`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | All products with `variants`, `category`, and derived `minPricePesewas`/`maxPricePesewas`. |
| `POST` | `name` (req), `description?, categoryId?, basePricePesewas?, stock?, sold?, color?, imageUrl?, isActive?, variants?: [{ size, pricePesewas, position? }]` | Created product. |

Must have a `basePricePesewas` **or** ≥1 variant. Maps to `products` + `product_variants` (§4.7–4.8).

### Product — `/api/products/[id]`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | One product (+ variants, category, price range). |
| `PATCH` | any product field; `variants` (if sent) **replaces** the whole set | Updated product. |
| `DELETE` | — | `204` (variants cascade). |

### Categories — `/api/categories`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | Categories with product counts. |
| `POST` | `name` (req), `position?` | Created category. |

### Category — `/api/categories/[id]`
| Method | Body | Returns |
| --- | --- | --- |
| `PATCH` | `name?, position?` | Updated category. |
| `DELETE` | — | `204` (products' `category_id` set null). |

### Customers — `/api/customers`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | Customers with computed `orderCount`, `totalSpentPesewas`, `lastOrderAt`. |
| `POST` | `firstName?, lastName?, email?, phone?, preferredContact?, address?, city?, region?, color?` | Created customer. |

Backs the **Customers** page (`customers` + `customer_stats`, §4.9 / §6).

### Customer — `/api/customers/[id]`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | Customer + their orders. |
| `PATCH` | any customer field | Updated customer. |
| `DELETE` | — | `204` (orders keep their snapshot; `customer_id` set null). |

### Orders — `/api/orders`
| Method | Query / Body | Returns |
| --- | --- | --- |
| `GET` | query: `status, channel, paymentStatus, customerId, q` | Orders (+ items, + derived `itemSummary`). |
| `POST` | `items: [{ productId?, variantId?, productName, size?, unitPricePesewas, quantity }]` (req) + optional `customerId, orderNumber, status, channel, paymentMethod, paymentStatus, deliveryFeePesewas, customerName, customerPhone, customerEmail, deliveryAddress, deliveryCity, deliveryRegion, notes` | Created order. |

`POST` runs in a transaction: snapshots items, computes subtotal/total, generates the order
number (`KC-####`) if omitted, adjusts product `stock`/`sold`, and records the first status
event. Maps to `orders` + `order_items` + `order_status_events` (§4.10–4.12).

### Order — `/api/orders/[id]`
| Method | Body | Returns |
| --- | --- | --- |
| `GET` | — | Order + items + status timeline + customer. |
| `PATCH` | `status?, paid?` (→ payment_status), `paymentStatus?, paymentMethod?, channel?, customer*/delivery* , notes?, statusNote?` | Updated order. Changing `status` appends a status-event. |
| `DELETE` | — | `204` (items + events cascade). |

### Dashboard — `/api/dashboard`
`GET` → `{ kpis, pipeline, recentOrders, topProducts }` — everything the Dashboard renders.

### Analytics — `/api/analytics`
`GET` → `{ kpis, salesByChannel, statusBreakdown, topProducts, monthlyRevenue }` — the
analytics views (§6), computed with Prisma aggregates + one raw query for the monthly buckets.

---

## Public storefront routes (no auth)

### Storefront — `/api/storefront/[handle]`
`GET` → `{ store, categories, products }` for a **published** store. Only public brand fields
and **active** products (with variants + price range) are exposed.

### Checkout — `/api/storefront/[handle]/checkout`
`POST` → places an order from the cart.

```jsonc
{
  "customer": { "firstName": "Ama", "lastName": "Mensah", "phone": "+233…",
                "email": "…?", "address": "…", "city": "Accra", "region": "Greater Accra" },
  "paymentMethod": "cash_on_delivery",          // optional enum
  "items": [{ "productId": "…", "variantId": "…?", "quantity": 2 }]
}
```

Returns `{ ref, totalPesewas, itemSummary, whatsappPhone }`. **Prices are re-derived
server-side** from the product/variant ids (the client never sends a price), the customer is
upserted (unique per store by phone/email), stock is decremented, and an initial status event
is written — all in one transaction.

---

## Shared library (`src/lib/api/`)

| File | Role |
| --- | --- |
| `http.ts` | `ok`/`created`/`noContent`, `ApiError`, `readJson`, and the `handle()` wrapper that turns thrown errors (incl. Prisma `P2002`/`P2025`) into clean responses. |
| `store.ts` | `requireStore()` — resolve + bootstrap the current seller's store from Clerk. |
| `validate.ts` | Dependency-free body validators (`str`, `int`, `optEnum`, `arr`, `optHexColor`, …). |
| `domain.ts` | Server-side derived values: `priceRange`, `itemSummary`, `topProducts`, `nextOrderNumber`. |

---

## Quick examples

```bash
# List products (signed-in seller; cookie-based Clerk session)
curl -s localhost:3000/api/products

# Create a product with two sizes (prices in pesewas: ₵120 / ₵150)
curl -s -X POST localhost:3000/api/products \
  -H 'content-type: application/json' \
  -d '{"name":"Blue Dress","stock":14,"variants":[{"size":"S","pricePesewas":12000},{"size":"M","pricePesewas":15000}]}'

# Public: read a storefront
curl -s localhost:3000/api/storefront/adwoascloset

# Public: place an order
curl -s -X POST localhost:3000/api/storefront/adwoascloset/checkout \
  -H 'content-type: application/json' \
  -d '{"customer":{"firstName":"Ama","lastName":"Mensah","phone":"+233245550142","address":"12 Oxford St","city":"Accra","region":"Greater Accra"},"items":[{"productId":"<id>","quantity":1}]}'
```
