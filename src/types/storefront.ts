import type { PaymentMethod } from "./api";

export type StoreBrand = {
  name: string;
  tagline: string;
  accent: string;
  logo: string | null;
  banner: string | null;
};

/** A single line in the storefront shopping cart. */
export type CartItem = {
  key: string; // productId + variantId, unique per cart line
  productId: string;
  variantId?: string;
  name: string;
  size?: string;
  unitPrice: number;
  qty: number;
  image?: string;
  color?: string;
};

/** The shopper's details captured at checkout. */
export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
};

/** A completed storefront order, shown on the confirmation screen. */
export type PlacedOrder = {
  ref: string;
  items: CartItem[];
  total: number;
  customer: CheckoutCustomer;
  payment: string;
};

/* ------------------------------------------------------------------ */
/* API / database shapes. Money is in pesewas.                        */
/* ------------------------------------------------------------------ */

/** The seller's store row (Storefront editor + Settings) — src/services/storefront.ts. */
export type StoreDTO = {
  id: string;
  ownerId: string;
  name: string;
  handle: string;
  tagline: string | null;
  accentColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  whatsappPhone: string | null;
  supportPhone: string | null;
  location: string | null;
  currencyCode: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Any subset of editable store fields (Storefront editor + Settings). */
export type StoreUpdate = {
  name?: string;
  handle?: string;
  tagline?: string;
  accentColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappPhone?: string;
  supportPhone?: string;
  location?: string;
  currencyCode?: string;
  isPublished?: boolean;
};

/* ---- public storefront page (/store/[handle]) — src/services/store.ts ---- */

export type PublicStore = {
  name: string;
  handle: string;
  tagline: string | null;
  accentColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  whatsappPhone: string | null;
  location: string | null;
  currencyCode: string;
};

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  basePricePesewas: number | null;
  stock: number;
  sold: number;
  color: string | null;
  imageUrl: string | null;
  variants: { id: string; size: string; pricePesewas: number }[];
  minPricePesewas: number | null;
  maxPricePesewas: number | null;
};

export type StorefrontData = {
  store: PublicStore;
  categories: { id: string; name: string }[];
  products: PublicProduct[];
};

/** Body for the public checkout (server re-derives prices). */
export type CheckoutInput = {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    region: string;
  };
  paymentMethod?: PaymentMethod;
  items: { productId: string; variantId?: string; quantity: number }[];
};

export type CheckoutResult = {
  ref: string;
  totalPesewas: number;
  itemSummary: string;
  whatsappPhone: string | null;
};