# Data Layer — types, mock data & utilities

The shapes the UI works with today, where the demo data lives, and every helper function.
For the **database** shapes see [database-schema.md](./database-schema.md); for how the UI
shapes will map to the DB see [architecture.md §5](./architecture.md#5-current-state-mock-data-vs-database).

---

## 1. Two type systems (don't confuse them)

There are **two** sets of "models" and they are deliberately different:

| | UI types (`src/types/*`) | DB models (`prisma/schema.prisma`) |
| --- | --- | --- |
| Money | strings/cedis (`"₵120 – ₵150"`, `total: "₵240"`) | integer **pesewas** (`totalPesewas`) |
| Ids | often **none** (products keyed by `name`) | `uuid` PKs everywhere |
| Status | display labels (`"Pending"`, `"New"`) | enums (`pending`, `confirmed`, …) |
| Derived fields | stored inline (e.g. `Order.item` string) | computed by **views** |
| Purpose | what components render today | the persistence target |

When you wire the DB, you'll translate at the boundary (e.g. `totalPesewas / 100 → "₵" + …`).
Keep UI types for the view layer; don't leak pesewas into components.

---

## 2. UI types (`src/types/`)

### `products.ts`
```ts
ProductVariant = { size: string; price: number }          // price in cedis
Product = {
  name: string; price: string;                            // label, e.g. "₵120 – ₵150"
  stock: number; sold: number;
  category?: string; color?: string; image?: string;      // image = data URL
  variants?: ProductVariant[];
}
CreateProductModalProps = { open, onClose, mode?, initialData?, onSubmit }
```

### `orders.ts`
```ts
Order = {
  id: string;                                              // "KC-2048"
  customer: string; item: string;                          // item = derived summary string
  channel: string; total: string; paid: boolean;
  status: "Pending" | "Confirmed" | "Packed" | "Delivered";
  date: string;
  address?: string; city?: string; region?: string;
  payment?: "Cash on delivery" | "Mobile Money";
}
OrderLineItem = { name: string; price: number; qty: number }
OrderFilters  = { orderId; customer; paid: "all"|"paid"|"unpaid"; status: "all"|Order["status"]; channel }
```

### Others
| Type | Shape (summary) |
| --- | --- |
| `customers.ts` → `Customer` | `name, contact, via: "phone"|"email", orders, spent, last, color` |
| `dashboard.ts` → `RecentOrder` | `id, customer, item, total, status: "New"|…, time, color` |
| `storefront.ts` | `StoreBrand`, `CartItem` (keyed by name+size), `CheckoutCustomer`, `PlacedOrder` |
| `portal.ts` → `NavItem` | `label, href, icon: LucideIcon` (sidebar) |
| `home.ts` → `Feature` | `title, body, icon: LucideIcon` |
| `common.ts` → `ConfirmDeleteModalProps` | `open, onClose, onConfirm, title?, confirmLabel?, children` |

> **Note the dashboard vs orders status mismatch:** the Dashboard calls the first stage
> `"New"`; the Orders page calls it `"Pending"`. Both map to the DB enum `pending`. Keep this
> in mind when reconciling the two.

---

## 3. Mock data (`src/utils/SampleDate.tsx`)

The demo-data module. Most dashboard pages **no longer** import it — they load from the
service layer now (§5). It still backs the marketing site, the **Analytics** page (not yet
wired), and a handful of illustrative bits (dashboard weekly bars, Payments features, the
Storefront editor's preset themes & preview). Shapes are matched to the schema/seed, so it
remains a useful contract for the UI.

| Area | Exports |
| --- | --- |
| Marketing nav/hero | `navLinks`, `heroPlatforms`, `heroAvatars` |
| Features / value | `features`, `convincingStats`, `convincingWithout`, `convincingWithKasa` |
| Footer | `footerColumns`, `footerSocials` |
| Dashboard | `orderStatusStyle`, `dashboardWeek`, `dashboardKpis`, `orderPipeline`, `recentOrders` |
| Products | `products`, `topProducts`, `previewProducts` |
| Store identity | `storeProfile` (`name, tagline, handle, accent, phone, location, logo, banner`) |
| Customers | `customerSummary`, `customers` |
| Analytics | `analyticsKpis`, `analyticsSecondary`, `analyticsMonths`, `salesChannels`, `orderStatusBreakdown`, `analyticsTopProducts` |
| Billing | `freeFeatures`, `proFeatures` |
| Storefront editor | `storefrontThemes` (preset accent hexes) |

The data describes the demo store **"Adwoa's Closet"** (`/store/adwoascloset`) — 6 products,
6 customers, 6 orders — and is shape-matched to the Prisma seed (`prisma/seed.ts`) so the demo
looks identical whether served from mock data or the seeded DB.

> Filename is `SampleDate.tsx` (not "SampleData") — match the existing spelling in imports.

---

## 4. Utility functions

### `general.tsx` — generic helpers
| Function | Signature | What / why |
| --- | --- | --- |
| `initials` | `(name) => string` | First two name initials for avatar chips. |
| `sumBy` | `(items, fn) => number` | Sum a mapped field (e.g. total status counts). |
| `maxBy` | `(items, fn) => number` | Largest mapped value — used to scale relative bars (`width = v / maxBy`). |
| `binarySearch` | `(sorted, target, key) => index` | O(log n) exact, case-insensitive lookup over a key-sorted list. |
| `searchByPrefix` | `(items, query, key) => items` | Sorts by key, binary-searches the lower bound, returns the contiguous **prefix** matches. Powers product/customer pickers. **Prefix, not substring** — "men" finds "Mensah" but not "Ama Mensah". Empty query → all (sorted). |

### `productUtils.tsx`
| Function | What |
| --- | --- |
| `stockBadge(stock)` | `{label, cls}` — Out of stock (0) / Low · N left (≤6) / N in stock. |
| `formatCedis(amount)` | `1500 → "₵1,500"` (rounds, locale-groups). **Use this for all money display.** |
| `priceValue(price)` | First integer in a price string: `"₵120 – ₵150" → 120`. |
| `startingPrice(product)` | Cheapest variant price, else `priceValue(base)`. Drives "from ₵X" + quick-add. |

### `ordersUtils.tsx`
| Export | What |
| --- | --- |
| `ORDER_CHANNELS` | `["WhatsApp","Instagram","TikTok","Facebook","Snapchat"]`. |
| `emptyOrderFilters` | Blank `OrderFilters` (everything = "all"). |
| `filterOrders(list, filters, search?)` | Applies the filter modal **and** the toolbar search. |
| `countActiveFilters(filters)` | Active-filter count for the toolbar badge. |
| `nextId(list)` | Next sequential order id from existing ids (`KC-2049`); defaults from 2048. |
| `newOrderDate()` | `"Today, 2:14 PM"` timestamp for a freshly created order. |

### `settingsUtils.tsx`
`currencies` (GHS/USD/GBP), `notifications` (the 4 toggle definitions), and the `<Toggle>`
switch component (pure CSS peer-checked switch).

### `domain.tsx` — shareable store links
Builds the public store URL against **whatever host the app runs on**, because there's no
custom domain yet.

| Function | Behaviour |
| --- | --- |
| `getCurrentHost()` | `window.location.host` in the browser; `NEXT_PUBLIC_SITE_HOST` (or `"kasacart.com"`) on the server. |
| `getCurrentOrigin()` | Full origin incl. protocol. |
| `buildStoreUrl(handle, host?)` | localhost / `*.vercel.app` → **path** `…/store/<handle>`; real domain → **subdomain** `<handle>.<host>`. |
| `storeDisplayUrl(handle, host?)` | Same, without protocol (for display). |
| `useCurrentHost()` | Client hook: starts with the SSR fallback (matching the server render), updates to the real host after mount — **avoids hydration mismatch**. Use this in components, not `getCurrentHost()` during render. |

> **Why a hook instead of reading `window` inline?** Reading `window.location` during render
> differs between server and client and causes hydration errors. `useCurrentHost` renders the
> stable fallback first, then swaps post-mount.

---

## 5. How the data flows (now wired)

Pages call the service layer → the API → Postgres, mapping shapes at the boundary:

```
Page (client)  ──▶  src/services/* (axios class)  ──▶  /api/** route  ──▶  Prisma / Neon
   ▲  map DTO → UI (utils/mappers.ts) for render;  map UI input → API Input for writes
   └─ toast the outcome (utils/notify.ts → sonner)
```

Two helpers make this uniform:

| Helper | Role |
| --- | --- |
| `utils/mappers.ts` | DTO↔UI adapters: `toPesewas`/`toCedis`, `productToRow`/`productToInput`, `orderToRow`/`orderToInput`, `customerToRow`, plus the enum↔label maps. UI "rows" carry a `dbId` (the uuid) so handlers can call `update`/`delete`. |
| `utils/notify.ts` | `toastResult(result, success, error?)` — services return the entity (or `true` for deletes) on success and `undefined` on failure, so this one call toasts the outcome **and** narrows the value. |

So the old advice still holds — translate **pesewas↔cedis** and **enum↔label** at the boundary,
reusing `formatCedis`/`startingPrice` on the view side — it's just centralised in `mappers.ts`
now. Only the **Analytics** page still reads `SampleDate` directly (it's behind `ComingSoon`).
