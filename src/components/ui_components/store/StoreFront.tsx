"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Wallet,
  Search,
  Check,
  Truck,
  ShieldCheck,
  ArrowRight,
  X,
  MapPin,
} from "lucide-react";
import Modal from "@/components/modals/Modal";
import StoreService from "@/services/store";
import { formatCedis, startingPrice } from "@/utils/productUtils";
import { toCedis } from "@/utils/mappers";
import { toast } from "sonner";
import type {
  CartItem,
  CheckoutCustomer,
  PlacedOrder,
  StorefrontData,
  PublicProduct,
} from "@/types/storefront";

/** Storefront product carrying the ids checkout needs (product + per-size variant). */
type StoreProduct = {
  id: string;
  name: string;
  price: string;
  stock: number;
  sold: number;
  category?: string;
  color?: string;
  image?: string;
  variants?: { id: string; size: string; price: number }[];
};

/** Brand fields the storefront chrome renders. */
type ViewStore = {
  name: string;
  tagline: string;
  accent: string;
  logo: string | null;
  banner: string | null;
  phone: string;
  location: string;
};

const waLink = (phone: string, text: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

/** Map an API product → the storefront product (pesewas → cedis, keep ids). */
function toStoreProduct(p: PublicProduct): StoreProduct {
  const { minPricePesewas: min, maxPricePesewas: max } = p;
  const price =
    min == null
      ? "₵0"
      : min === max
        ? formatCedis(toCedis(min))
        : `${formatCedis(toCedis(min))} – ${formatCedis(toCedis(max ?? min))}`;
  return {
    id: p.id,
    name: p.name,
    price,
    stock: p.stock,
    sold: p.sold,
    category: p.categoryName ?? undefined,
    color: p.color ?? undefined,
    image: p.imageUrl ?? undefined,
    variants: p.variants.length
      ? p.variants.map((v) => ({ id: v.id, size: v.size, price: toCedis(v.pricePesewas) }))
      : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Storefront                                                          */
/* ------------------------------------------------------------------ */

export default function StoreFront({ handle }: { handle: string }) {
  const [data, setData] = useState<StorefrontData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");
  const [placing, setPlacing] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<StoreProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Load the published storefront by handle.
  useEffect(() => {
    let active = true;
    (async () => {
      const res = await StoreService.getStorefront(handle);
      if (!active) return;
      if (!res) setStatus("notfound");
      else {
        setData(res);
        setStatus("ready");
      }
    })();
    return () => {
      active = false;
    };
  }, [handle]);

  // Lock background scroll while the cart drawer is open.
  useEffect(() => {
    if (!cartOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const products = useMemo<StoreProduct[]>(
    () => (data?.products ?? []).map(toStoreProduct),
    [data]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const inCat = category === "All" || p.category === category;
      const inQuery = !q || p.name.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [products, category, query]);

  const count = cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = cart.reduce((n, i) => n + i.unitPrice * i.qty, 0);

  /* ---- cart ops ---- */
  const addToCart = (
    p: StoreProduct,
    size: string | undefined,
    variantId: string | undefined,
    unitPrice: number,
    qty = 1
  ) => {
    const key = `${p.id}__${variantId ?? ""}`;
    setCart((list) => {
      const found = list.find((i) => i.key === key);
      if (found) return list.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [
        ...list,
        {
          key,
          productId: p.id,
          variantId,
          name: p.name,
          size,
          unitPrice,
          qty,
          image: p.image,
          color: p.color,
        },
      ];
    });
    setCartOpen(true);
  };

  const changeQty = (key: string, delta: number) =>
    setCart((list) =>
      list
        .map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );

  const removeLine = (key: string) => setCart((list) => list.filter((i) => i.key !== key));

  const quickAdd = (p: StoreProduct) => {
    if (p.stock === 0) return;
    if (p.variants && p.variants.length > 0) {
      setDetail(p); // needs a size choice
    } else {
      addToCart(p, undefined, undefined, startingPrice(p));
    }
  };

  const placeOrder = async (customer: CheckoutCustomer, payment: string) => {
    const items = cart;
    const orderTotal = subtotal;
    setPlacing(true);
    const res = await StoreService.checkout(handle, {
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email || undefined,
        address: customer.address,
        city: customer.city,
        region: customer.region,
      },
      paymentMethod: payment === "Mobile Money" ? "mobile_money" : "cash_on_delivery",
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.qty,
      })),
    });
    setPlacing(false);
    if (!res) {
      toast.error("We couldn't place your order. Please try again.");
      return;
    }
    setPlaced({ ref: res.ref, items, total: orderTotal, customer, payment });
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    toast.success("Order placed!");
  };

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-fg/55">
        <p className="text-sm">Loading store…</p>
      </div>
    );
  }

  if (status === "notfound" || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>
          <p className="font-display text-2xl font-extrabold text-fg">Store not found</p>
          <p className="mt-2 text-sm text-fg/55">
            This store doesn&apos;t exist or isn&apos;t open right now.
          </p>
        </div>
      </div>
    );
  }

  const store: ViewStore = {
    name: data.store.name,
    tagline: data.store.tagline ?? "",
    accent: data.store.accentColor,
    logo: data.store.logoUrl,
    banner: data.store.bannerUrl,
    phone: data.store.whatsappPhone ?? "",
    location: data.store.location ?? "",
  };
  const accent = store.accent;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---------------- top nav ---------------- */}
      <header className="sticky top-0 z-30 border-b border-brand/10 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl font-display text-sm font-extrabold text-white"
              style={{ background: store.logo ? undefined : accent }}
            >
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logo} alt="" className="h-full w-full object-contain" />
              ) : (
                (store.name.trim()[0] ?? "S").toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold text-fg">{store.name}</p>
              <p className="truncate text-[0.7rem] text-fg/50">@{handle}</p>
            </div>
          </div>

          {/* search (desktop) */}
          <div className="relative ml-auto hidden w-full max-w-xs sm:block">
            <input
              className="input pl-10"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="relative ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-raised text-fg/75 transition-colors hover:text-fg sm:ml-0"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            {count > 0 && (
              <span
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.65rem] font-bold text-white ring-2 ring-surface"
                style={{ background: accent }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden border-b border-brand/10">
        {store.banner ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.banner} alt="" className="h-56 w-full object-cover sm:h-72" />
            <span className="absolute inset-0 bg-linear-to-t from-ink/65 to-ink/15" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-7 sm:px-6">
              <HeroCopy name={store.name} tagline={store.tagline} location={store.location} onLight />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: `color-mix(in oklab, ${accent} 12%, transparent)`, color: accent }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              Open for orders
            </span>
            <HeroCopy name={store.name} tagline={store.tagline} location={store.location} />
          </div>
        )}
      </section>

      {/* ---------------- trust strip ---------------- */}
      <div className="border-b border-brand/10 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 text-xs font-medium text-fg/60 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={1.8} />
            Pay on delivery
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" strokeWidth={1.8} /> Fast delivery
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} /> Secure checkout
          </span>
        </div>
      </div>

      {/* ---------------- catalogue ---------------- */}
      <main id="products" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* mobile search */}
        <div className="relative mb-5 sm:hidden">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/35" />
          <input
            className="input pl-10"
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* category pills */}
        <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-transparent text-white"
                    : "border-brand/15 bg-surface text-fg/70 hover:text-fg"
                }`}
                style={active ? { background: accent } : undefined}
              >
                {c}
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/8 text-brand">
              <Search className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <p className="mt-4 font-display text-base font-bold text-fg">No products found</p>
            <p className="mt-1 text-sm text-fg/55">Try another category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                accent={accent}
                onOpen={() => setDetail(p)}
                onAdd={() => quickAdd(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ---------------- footer ---------------- */}
      <footer className="border-t border-brand/10 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <p className="font-display text-base font-bold text-fg">{store.name}</p>
          <p className="text-sm text-fg/55">{store.tagline}</p>
          <p className="mt-2 text-xs text-fg/40">
            Powered by <span className="font-semibold text-brand">KasaCart</span>
          </p>
        </div>
      </footer>

      {/* ---------------- product detail ---------------- */}
      <ProductDetail
        product={detail}
        accent={accent}
        onClose={() => setDetail(null)}
        onAdd={(size, unitPrice, qty, variantId) => {
          if (detail) addToCart(detail, size, variantId, unitPrice, qty);
          setDetail(null);
        }}
      />

      {/* ---------------- cart drawer ---------------- */}
      <CartDrawer
        open={cartOpen}
        accent={accent}
        items={cart}
        subtotal={subtotal}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onRemove={removeLine}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* ---------------- checkout ---------------- */}
      <Checkout
        open={checkoutOpen}
        accent={accent}
        items={cart}
        subtotal={subtotal}
        placing={placing}
        onClose={() => setCheckoutOpen(false)}
        onPlace={placeOrder}
      />

      {/* ---------------- success ---------------- */}
      <OrderSuccess
        order={placed}
        accent={accent}
        store={store}
        onClose={() => setPlaced(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero copy                                                           */
/* ------------------------------------------------------------------ */

function HeroCopy({
  name,
  tagline,
  location,
  onLight = false,
}: {
  name: string;
  tagline: string;
  location: string;
  onLight?: boolean;
}) {
  return (
    <div className={onLight ? "text-white" : ""}>
      <h1
        className={`mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl ${
          onLight ? "text-white drop-shadow" : "text-fg"
        }`}
      >
        {name}
      </h1>
      <p className={`mt-2 max-w-xl text-sm sm:text-base ${onLight ? "text-white/85" : "text-fg/60"}`}>
        {tagline}
      </p>
      <p
        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${
          onLight ? "text-white/80" : "text-fg/50"
        }`}
      >
        <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
        {location}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({
  product,
  accent,
  onOpen,
  onAdd,
}: {
  product: StoreProduct;
  accent: string;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const soldOut = product.stock === 0;
  const from = product.variants && product.variants.length > 1;

  return (
    <div className="group overflow-hidden rounded-2xl border border-brand/8 bg-surface shadow-[0_6px_18px_-14px_rgba(10,28,77,0.5)] transition-shadow hover:shadow-[0_16px_30px_-18px_rgba(10,28,77,0.55)]">
      <button
        onClick={onOpen}
        className="relative block aspect-4/5 w-full"
        style={{ background: product.image ? undefined : product.color ?? "#1d4ed8" }}
        aria-label={`View ${product.name}`}
      >
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        )}
        {soldOut && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/75 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
            Sold out
          </span>
        )}
      </button>

      <div className="flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{product.name}</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-fg">
            {from && <span className="mr-1 text-[0.7rem] font-medium text-fg/45">from</span>}
            {formatCedis(startingPrice(product))}
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={soldOut}
          aria-label={`Add ${product.name} to cart`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: accent }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product detail modal                                                */
/* ------------------------------------------------------------------ */

function ProductDetail({
  product,
  accent,
  onClose,
  onAdd,
}: {
  product: StoreProduct | null;
  accent: string;
  onClose: () => void;
  onAdd: (
    size: string | undefined,
    unitPrice: number,
    qty: number,
    variantId: string | undefined
  ) => void;
}) {
  const [size, setSize] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
    setSize(product?.variants?.[0]?.size);
  }, [product]);

  const variant = product?.variants?.find((v) => v.size === size);
  const soldOut = !!product && product.stock === 0;
  const unitPrice = product
    ? product.variants && product.variants.length > 0
      ? variant?.price ?? startingPrice(product)
      : startingPrice(product)
    : 0;

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      size="lg"
      title={product?.name ?? ""}
      subtitle={product?.category}
      footer={
        <>
          <div className="mr-auto font-mono text-base font-bold text-fg">
            {formatCedis(unitPrice * qty)}
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => onAdd(size, unitPrice, qty, variant?.id)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ background: accent }}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </>
      }
    >
      {product && (
        <div className="space-y-5">
          <div
            className="aspect-16/10 w-full overflow-hidden rounded-2xl"
            style={{ background: product.image ? undefined : product.color ?? "#1d4ed8" }}
          >
            {product.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>

          <p className="text-sm text-fg/60">
            {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
            {" · "}
            {product.sold} sold all-time
          </p>

          {/* size picker */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-fg/70">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const active = v.size === size;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      onClick={() => setSize(v.size)}
                      className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                        active ? "border-transparent text-white" : "border-brand/15 text-fg/75 hover:text-fg"
                      }`}
                      style={active ? { background: accent } : undefined}
                    >
                      {v.size}
                      <span className={`ml-1.5 font-mono text-xs ${active ? "text-white/80" : "text-fg/45"}`}>
                        {formatCedis(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* quantity */}
          <div>
            <p className="mb-2 text-sm font-medium text-fg/70">Quantity</p>
            <div className="inline-flex items-center gap-3 rounded-full border border-brand/15 px-2 py-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-8 w-8 place-items-center rounded-full text-fg/70 transition-colors hover:bg-brand/8"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-mono text-sm font-bold text-fg">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-8 w-8 place-items-center rounded-full text-fg/70 transition-colors hover:bg-brand/8"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Cart drawer                                                         */
/* ------------------------------------------------------------------ */

function CartDrawer({
  open,
  accent,
  items,
  subtotal,
  onClose,
  onChangeQty,
  onRemove,
  onCheckout,
}: {
  open: boolean;
  accent: string;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onChangeQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-[0_40px_90px_-30px_rgba(10,28,77,0.6)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand/10 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-fg">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            Your cart
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg/50 transition-colors hover:bg-brand/8 hover:text-fg"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/8 text-brand">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <p className="mt-4 font-display text-base font-bold text-fg">Your cart is empty</p>
            <p className="mt-1 text-sm text-fg/55">Add a few items to get started.</p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full border border-brand/15 px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((i) => (
                <div key={i.key} className="flex gap-3 rounded-2xl border border-brand/8 p-2.5">
                  <span
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"
                    style={{ background: i.image ? undefined : i.color ?? "#1d4ed8" }}
                  >
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-fg">{i.name}</p>
                        {i.size && <p className="text-xs text-fg/50">Size {i.size}</p>}
                      </div>
                      <button
                        onClick={() => onRemove(i.key)}
                        aria-label="Remove item"
                        className="shrink-0 text-fg/40 transition-colors hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 px-1.5 py-0.5">
                        <button
                          onClick={() => onChangeQty(i.key, -1)}
                          className="grid h-6 w-6 place-items-center rounded-full text-fg/70 hover:bg-brand/8"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center font-mono text-xs font-bold text-fg">{i.qty}</span>
                        <button
                          onClick={() => onChangeQty(i.key, 1)}
                          className="grid h-6 w-6 place-items-center rounded-full text-fg/70 hover:bg-brand/8"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-mono text-sm font-bold text-fg">
                        {formatCedis(i.unitPrice * i.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-brand/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg/60">Subtotal</span>
                <span className="font-mono text-lg font-bold text-fg">{formatCedis(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-fg/45">Delivery is arranged with the seller at checkout.</p>
              <button
                onClick={onCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
                style={{ background: accent }}
              >
                Checkout
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkout modal                                                      */
/* ------------------------------------------------------------------ */

const PAYMENTS = ["Cash on delivery", "Mobile Money"];

const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

function Checkout({
  open,
  accent,
  items,
  subtotal,
  placing,
  onClose,
  onPlace,
}: {
  open: boolean;
  accent: string;
  items: CartItem[];
  subtotal: number;
  placing: boolean;
  onClose: () => void;
  onPlace: (c: CheckoutCustomer, payment: string) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [payment, setPayment] = useState(PAYMENTS[0]);

  useEffect(() => {
    if (open) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCity("");
      setRegion("");
      setPayment(PAYMENTS[0]);
    }
  }, [open]);

  const canPlace =
    firstName.trim() &&
    lastName.trim() &&
    phone.trim() &&
    address.trim() &&
    city.trim() &&
    region.trim() &&
    items.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPlace) return;
    onPlace(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        region,
      },
      payment
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Checkout"
      subtitle="Enter your delivery details to place the order."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand/15 bg-surface px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand"
          >
            Back
          </button>
          <button
            type="submit"
            form="checkout-form"
            disabled={!canPlace || placing}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ background: accent }}
          >
            {placing ? "Placing…" : `Place order · ${formatCedis(subtotal)}`}
          </button>
        </>
      }
    >
      <form id="checkout-form" onSubmit={submit} className="space-y-5">
        {/* summary */}
        <div className="rounded-2xl border border-brand/10 bg-raised/40 p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg/45">Order summary</p>
          <div className="space-y-1.5">
            {items.map((i) => (
              <div key={i.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-fg/75">
                  {i.qty}× {i.name}
                  {i.size && <span className="text-fg/45"> · {i.size}</span>}
                </span>
                <span className="shrink-0 font-mono font-semibold text-fg">
                  {formatCedis(i.unitPrice * i.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-brand/10 pt-2.5">
            <span className="text-sm font-semibold text-fg">Total</span>
            <span className="font-mono text-base font-bold text-fg">{formatCedis(subtotal)}</span>
          </div>
        </div>

        {/* name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">First name</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Ama" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Last name</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Mensah" required />
          </div>
        </div>

        {/* contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. ama@gmail.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Phone number</label>
            <input type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 555 0142" required />
          </div>
        </div>

        {/* delivery address */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg/70">Delivery address</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 12 Oxford Street, Osu" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">City</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Accra" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Region</label>
            <select className="input" value={region} onChange={(e) => setRegion(e.target.value)} required>
              <option value="">Select region…</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg/70">Preferred Payment method</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENTS.map((p) => {
              const active = p === payment;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPayment(p)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "text-white" : "border-brand/15 text-fg/70 hover:text-fg"
                  }`}
                  style={active ? { background: accent, borderColor: "transparent" } : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Order success modal                                                 */
/* ------------------------------------------------------------------ */

function OrderSuccess({
  order,
  accent,
  store,
  onClose,
}: {
  order: PlacedOrder | null;
  accent: string;
  store: { name: string; phone: string };
  onClose: () => void;
}) {
  const message = order
    ? `Hello ${store.name}! I'd like to confirm my order ${order.ref}`
    : "";

  const mobileMoney = order?.payment === "Mobile Money";

  return (
    <Modal open={!!order} onClose={onClose} size="md" title="Order received 🎉">
      {order && (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <span
              className="grid h-14 w-14 place-items-center rounded-2xl text-white"
              style={{ background: accent }}
            >
              <Check className="h-7 w-7" strokeWidth={2.6} />
            </span>
            <p className="mt-4 font-display text-lg font-bold text-fg">Thank you, {order.customer.firstName}!</p>
            <p className="mt-1 text-sm text-fg/60">
              We&apos;ve received your order{" "}
              <span className="font-mono font-bold text-fg">{order.ref}</span>. We&apos;ll text you on
              WhatsApp to confirm your order and arrange delivery.
            </p>
            {mobileMoney && (
              <p className="mt-2 rounded-xl bg-raised/60 px-3 py-2 text-xs font-medium text-fg/65">
                Paying with Mobile Money? That will be handled during confirmation.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-brand/10 bg-raised/40 p-3.5">
            <div className="space-y-1.5">
              {order.items.map((i) => (
                <div key={i.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-fg/75">
                    {i.qty}× {i.name}
                    {i.size && <span className="text-fg/45"> · {i.size}</span>}
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-fg">
                    {formatCedis(i.unitPrice * i.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-brand/10 pt-2.5">
              <span className="text-sm font-semibold text-fg">Total</span>
              <span className="font-mono text-base font-bold text-fg">{formatCedis(order.total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={waLink(store.phone, message)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Message on WhatsApp
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </a>
            <button
              onClick={onClose}
              className="rounded-full border border-brand/15 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand"
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
