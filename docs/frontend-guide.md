# Frontend Guide — design system, components, pages & patterns

Everything you need to build or fix UI: the styling system, the shared shell, how each page
works, the modal pattern, and the conventions they all follow.

---

## 1. Design system (`src/app/globals.css`)

Tailwind **v4**, configured **entirely in CSS** — there is no `tailwind.config.js`. Theme
tokens are declared with `@theme inline` and consumed as normal Tailwind classes
(`bg-brand`, `text-fg`, `border-brand/10`, …).

### Color tokens

**Fixed brand palette** (same in light & dark):

| Token | Hex | Use |
| --- | --- | --- |
| `brand` | `#1d4ed8` | Primary blue — CTAs, links, active nav. |
| `brand-700/600/400/200` | shades | Hover/gradient/soft variants. |
| `ink` | `#060d24` | Deepest text / dark sections. |
| `navy` | `#0a1c4d` | Dark accents. |
| `sky` | `#eff4ff` | Soft blue backgrounds/badges. |
| `cyan` | `#22d3ee` | Secondary highlight. |

**Semantic, theme-aware tokens** (flip between light `:root` and `.dark`):

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#0a0f1e` | App backdrop behind the shell. |
| `surface` | `#ffffff` | `#131b2f` | Cards, panels, inputs. |
| `raised` | `#eff4ff` | `#1a2238` | Hover/inset fills. |
| `fg` | `#060d24` | `#e8edf7` | Foreground text. |
| `--c-border` | brand 10% | white 8% | Default border tint. |
| `--c-shadow` | soft | deep | Elevation. |

Plus `background`/`foreground` for the marketing pages.

> **Why two tiers?** The brand palette never changes; the semantic tokens (`--c-*`) are what
> dark mode swaps. Components reference semantic tokens (`bg-surface`, `text-fg`) so a single
> `.dark` class on a parent re-themes everything. Opacity suffixes like `text-fg/55` and
> `border-brand/10` are used heavily for subtle hierarchy.

### Global rules
- Every element's default border color is `brand` mixed to 14% — so borders read as a faint
  brand tint without writing `border-brand/14` everywhere.
- `html { scroll-behavior: smooth }` for anchor links (`#features`, `#why`).
- `::selection` is brand blue on white.

### Component primitive classes
| Class | What it gives you |
| --- | --- |
| `.surface` | Card look: `surface` bg + brand-tinted border + elevation shadow. The portal's go-to container. |
| `.input` | Full-width rounded input: brand border, focus ring (`0 0 0 3px brand/16`), themed text/placeholder. Used by every form field and `<select>`. |
| `.marquee-track` / `.marquee-mask` | Infinite horizontal scroll (32s, pauses on hover, respects `prefers-reduced-motion`). |

### Dark mode
A custom variant: `@custom-variant dark (&:where(.dark, .dark *))`. `PortalShell` toggles a
`.dark` class on its root div and persists the choice to `localStorage` (`kc_theme`). Dark mode
is **portal-only** today (the marketing site and storefront don't expose the toggle).

### Fonts
Loaded in the root layout via `next/font/google`, exposed as CSS vars and used through Tailwind:
- `font-display` → **Bricolage Grotesque** (headings, wordmark).
- `font-sans`/body → **Hanken Grotesk** (default body).
- `font-mono` → **Geist Mono** (prices, ids, code-like values).

---

## 2. The portal shell

```
(portal)/layout.tsx  [server: auth gate]
   └─ PortalShell  [client: collapsed + dark state, persisted]
        ├─ Sidebar  (desktop rail + mobile drawer + top bar)
        └─ <main>   ← the page renders here (max-w-6xl, responsive padding)
```

### `PortalShell.tsx`
Owns two pieces of UI state, both hydrated from `localStorage` in a mount `useEffect` (to
avoid SSR mismatch):
- `collapsed` ↔ `kc_sidebar_collapsed` — narrow vs full sidebar (shifts main padding `md:pl-19`/`md:pl-64`).
- `dark` ↔ `kc_theme` — adds/removes `.dark`.

### `Sidebar.tsx`
- The nav list is a single `nav: NavItem[]` array (label/href/lucide icon) — **add a page by
  adding an entry here** (plus the route folder). Active state: `pathname === href || pathname.startsWith(href + "/")`.
- Three layouts share one `SidebarBody`: desktop rail, mobile slide-over drawer (`mobileOpen`),
  and a mobile top bar with a hamburger.
- `AccountBlock` uses Clerk `useUser()` + `<UserButton>`. Footer buttons: Home, theme toggle,
  View storefront.

### `PageHeader.tsx`
Every portal page starts with `<PageHeader title subtitle action />`. `action` is a slot for
page-level buttons (e.g. "Add new order"). Keeps headings consistent.

---

## 3. Portal pages — how each works

All eight are `"use client"`. The standard pattern: **load from a service on mount → map DTOs
to UI shapes via [`utils/mappers.ts`](../src/utils/mappers.ts) → render**, showing a skeleton
while loading and an `EmptyState`/`NoResults` when empty. Mutations call the service and toast
the result with `toastResult` (`utils/notify.ts` → sonner), then refetch. (Analytics is the lone
exception — still on `SampleDate`, behind `ComingSoon`.) See
[architecture.md §5](./architecture.md#5-current-state-mock-data-vs-database).

### Dashboard (`/dashboard`)
`Dashboard.getDashboard()` → KPIs, pipeline, recent orders, top products. `Skeleton` tiles while
loading. The revenue **weekly bars** are still illustrative (`dashboardWeek` from `SampleDate`).

### Orders (`/orders`) — full CRUD
`Orders` service: load → `orderToRow` (carries `dbId`). Create/edit via `CreateOrderModal`
(which emits an `OrderInput` payload), delete via `ConfirmDeleteModal`; each mutation toasts +
refetches. **Edit updates fields/status only**, not line items. `TableSkeleton` + `EmptyState`.
Search/filter still use `filterOrders`/`countActiveFilters` from `ordersUtils`.

### Products (`/products`) — full CRUD
`Products` service: load → `productToRow`, search via `searchByPrefix`, `stockBadge` for the
chip. Create/edit map UI → `productToInput`; the chosen category name is **auto-created** if
new (`ensureCategory`). `ProductGridSkeleton` + `EmptyState`.

### Customers (`/customers`)
`Customers.listCustomers()` → `customerToRow`; the summary tiles are **computed from the loaded
data** (total / repeat / new this month) and the search input is wired. `TableSkeleton`.

### Storefront (`/storefront`) — brand editor + live preview
Loads `Storefront.getStore()` into the form; **Save → `updateStore`** (toast). Logo/banner are
still read as **data URLs** via `FileReader`. Accent from `storefrontThemes` presets or the OS
color wheel. Links use `useCurrentHost()` + `buildStoreUrl()`. The `StorePreview` laptop/phone
frames render from `previewProducts` (mock).

### Payments (`/payments`)
`Payments.getBilling()` shows the **real plan + invoice history**. The Pro card stays
**blurred + "Coming soon"** and the upgrade button is inert.

### Analytics (`/analytics`) — hidden behind `ComingSoon`, still mock
The full charts (built from `SampleDate` via `sumBy`/`maxBy`) are wrapped in `<ComingSoon>`,
which renders a placeholder and ignores children. **Not yet wired** to `/api/analytics`.

### Settings (`/settings`)
Controlled form: loads `getStore()` + `getNotifications()`; **Save → `updateStore` +
`updateNotifications`**; **Close store → `updateStore({ isPublished: false })`** (danger zone).
A local controlled `Switch` replaces the uncontrolled `Toggle`.

---

## 4. The modal pattern

All dialogs compose the generic [`Modal.tsx`](../src/components/modals/Modal.tsx):

```tsx
<Modal open={open} onClose={onClose} title="…" subtitle="…" size="lg" footer={<>buttons</>}>
  {/* body */}
</Modal>
```

`Modal` handles: overlay + blur, ESC-to-close, overlay-click-to-close, body-scroll lock,
sticky footer, and `sm`/`md`/`lg` widths. It's `role="dialog" aria-modal`.

**Create/edit modals share a convention:**
- Props: `{ open, onClose, mode?: "create"|"edit", initialData?, onSubmit }`.
- A `useEffect([open])` (and/or `[initialData]`) **resets/populates** the form when the modal
  opens — so reopening never shows stale input.
- A local `Field` sub-component wraps label + `.input`.
- A `canSubmit`/`canPlace` boolean gates the submit button.
- `onSubmit` hands a fully-shaped object to the **parent**, which calls the service and toasts.
  Modals don't know about persistence. `CreateOrderModal.onSubmit` also passes an `OrderInput`
  payload (built via `orderToInput`) so the page can create the order via the API.

`ConfirmDeleteModal` is the reusable destructive-action dialog: pass the warning as `children`,
a `confirmLabel`, and an `onConfirm`. Used by Orders and Products.

---

## 5. The public storefront (`store/StoreFront.tsx`)

One large client component holding the whole shopping experience. Worth knowing its internal
parts when fixing storefront bugs:

| Internal piece | Role |
| --- | --- |
| top-level `StoreFront` | Owns `cart`, `category`, `query`, `detail`, `cartOpen`, `checkoutOpen`, `placed`. Derives `categories`, `visible` (filtered), `count`, `subtotal`. |
| `ProductCard` | Grid tile; "from ₵X" via `startingPrice`/`formatCedis`; quick-add or open detail. |
| `ProductDetail` (in `Modal`) | Size picker (variants), quantity stepper, computes `unitPrice` from chosen size. |
| `CartDrawer` | Right slide-over; qty +/- (`changeQty`), remove (`removeLine`), subtotal, checkout. |
| `Checkout` (in `Modal`) | Delivery form (name/contact/address/city/`REGIONS`), payment choice; `canPlace` gates submit. |
| `OrderSuccess` (in `Modal`) | Confirmation + **WhatsApp deep link** (`wa.me`) to the seller. |

It loads via `Store.getStorefront(handle)` (with **loading** and **"Store not found"** states),
maps each API product → a local `StoreProduct` that keeps the **product id + per-variant ids**.
Cart lines key on `productId__variantId` and carry those ids, so **checkout** calls
`Store.checkout(handle, { customer, paymentMethod, items })` — the server re-derives prices,
upserts the customer and decrements stock, then `OrderSuccess` shows the real order ref + a
WhatsApp deep-link. Success/failure are toasted; the button shows a "Placing…" state.

---

## 6. Conventions & gotchas

- **`"use client"`** at the top of any file using state, effects, refs, browser APIs, or
  Clerk client hooks. Server components (root + portal layouts) do auth and will do data
  loading. Don't import server-only code into client components.
- **React Compiler is on** (`next.config.ts`) — it auto-memoises, so you usually don't need
  `useMemo`/`useCallback`. Add them only when profiling shows a need.
- **Data + toasts:** call a class from `src/services/*`, wrap the result with `toastResult`
  (`utils/notify`), and translate shapes with `utils/mappers` (DTO↔UI). Services swallow errors
  and return `undefined` on failure (or `true` for deletes), so check the return — don't assume
  it threw.
- **Loading/empty states:** while loading render `Skeleton` / `ProductGridSkeleton` /
  `TableSkeleton`; when there's no data render `EmptyState` (or `NoResults` for a search/filter
  miss). All in `components/ui_components`.
- **Money:** display with `formatCedis()`. In the UI layer amounts are plain cedis; the DB
  layer uses pesewas (×100). Don't mix the two.
- **Prices as strings:** the mock `Product.price` is a label like `"₵120 – ₵150"`. Use
  `priceValue()`/`startingPrice()` to get a number — don't `parseInt` ad-hoc.
- **Images:** uploads become in-browser **data URLs** (logo, banner, product image). Production
  should upload to object storage and persist a URL (`logo_url`, etc.).
- **Icons:** import named icons from `lucide-react`; size with `h-4 w-4` and tune `strokeWidth`.
- **Styling:** prefer the semantic tokens (`bg-surface`, `text-fg`, `border-brand/10`) and the
  `.surface`/`.input` primitives over raw hex, so dark mode keeps working.
- **Adding a portal page:** create `src/app/(portal)/<name>/page.tsx`, add a `nav` entry in
  `Sidebar.tsx`, and start the page with `<PageHeader>`.
- **Before framework-level changes**, read `node_modules/next/dist/docs/` — this Next.js is
  customised (see [`AGENTS.md`](../AGENTS.md)). The middleware lives in `src/proxy.ts`.
