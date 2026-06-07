/**
 * Adapters between the API **DTOs** (pesewas, DB enum values, camelCase) and the
 * **UI types** the pages/components render (cedis labels, display labels).
 *
 * Pages load DTOs → map to "*Row" (UI type + a `dbId` carrying the uuid) for
 * rendering, and map UI input → API Input for writes. Keeps the existing UI
 * components untouched. See docs/data-layer.md for the two type systems.
 */
import { formatCedis, priceValue } from "@/utils/productUtils";
import type { OrderStatus, SalesChannel, PaymentMethod } from "@/types/api";
import type { Product, ProductInput, ProductDTO } from "@/types/products";
import type { Order, OrderInput, OrderDTO } from "@/types/orders";
import type { Customer, CustomerWithStats } from "@/types/customers";

/* ---- money ---- */
export const toPesewas = (cedis: number) => Math.round(cedis * 100);
export const toCedis = (pesewas: number) => pesewas / 100;

/* ---- dates ---- */
export function shortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ============================ products ============================ */

export type ProductRow = Product & { dbId: string };

export function productToRow(d: ProductDTO): ProductRow {
  const { minPricePesewas: min, maxPricePesewas: max } = d;
  const price =
    min == null
      ? "₵0"
      : min === max
        ? formatCedis(toCedis(min))
        : `${formatCedis(toCedis(min))} – ${formatCedis(toCedis(max ?? min))}`;
  return {
    dbId: d.id,
    name: d.name,
    price,
    stock: d.stock,
    sold: d.sold,
    category: d.category?.name,
    color: d.color ?? undefined,
    image: d.imageUrl ?? undefined,
    variants: d.variants.length
      ? d.variants.map((v) => ({ size: v.size, price: toCedis(v.pricePesewas) }))
      : undefined,
  };
}

export function productToInput(p: Product, categoryId?: string | null): ProductInput {
  const variants = p.variants?.length
    ? p.variants.map((v) => ({ size: v.size, pricePesewas: toPesewas(v.price) }))
    : undefined;
  return {
    name: p.name,
    stock: p.stock,
    sold: p.sold,
    imageUrl: p.image,
    color: p.color,
    categoryId: categoryId ?? undefined,
    // priced by variants → no base price; otherwise parse the "₵120" label.
    basePricePesewas: variants ? undefined : toPesewas(priceValue(p.price)),
    variants,
  };
}

/* ============================ orders ============================ */

const STATUS_LABEL: Record<OrderStatus, Order["status"]> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  delivered: "Delivered",
  cancelled: "Pending", // UI has no "Cancelled" badge; treat as pending
};
const LABEL_STATUS: Record<Order["status"], OrderStatus> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Packed: "packed",
  Delivered: "delivered",
};

const CHANNEL_LABEL: Record<SalesChannel, string> = {
  storefront: "Storefront",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  snapchat: "Snapchat",
};
export function labelToChannel(label: string): SalesChannel {
  const hit = (Object.keys(CHANNEL_LABEL) as SalesChannel[]).find(
    (k) => CHANNEL_LABEL[k].toLowerCase() === label.toLowerCase()
  );
  return hit ?? "storefront";
}

const PAYMENT_LABEL: Partial<Record<PaymentMethod, Order["payment"]>> = {
  cash_on_delivery: "Cash on delivery",
  mobile_money: "Mobile Money",
};
export function labelToPayment(label: Order["payment"]): PaymentMethod | undefined {
  if (label === "Cash on delivery") return "cash_on_delivery";
  if (label === "Mobile Money") return "mobile_money";
  return undefined;
}

export const labelToStatus = (label: Order["status"]): OrderStatus => LABEL_STATUS[label];

export type OrderRow = Order & { dbId: string };

export function orderToRow(d: OrderDTO): OrderRow {
  return {
    dbId: d.id,
    id: d.orderNumber,
    customer: d.customerName ?? "—",
    item: d.itemSummary || "—",
    channel: CHANNEL_LABEL[d.channel],
    total: formatCedis(toCedis(d.totalPesewas)),
    paid: d.paymentStatus === "paid",
    payment: d.paymentMethod ? PAYMENT_LABEL[d.paymentMethod] : undefined,
    status: STATUS_LABEL[d.status],
    date: shortDate(d.placedAt),
    address: d.deliveryAddress ?? undefined,
    city: d.deliveryCity ?? undefined,
    region: d.deliveryRegion ?? undefined,
  };
}

/** Build the create-order payload from the modal's structured fields. */
export function orderToInput(args: {
  lines: { name: string; price: number; qty: number }[];
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  channel: string;
  status: Order["status"];
  payment: Order["payment"];
  paid: boolean;
  address?: string;
  city?: string;
  region?: string;
  notes?: string;
}): OrderInput {
  return {
    items: args.lines.map((l) => ({
      productName: l.name,
      unitPricePesewas: toPesewas(l.price),
      quantity: l.qty,
    })),
    customerName: args.customerName || undefined,
    customerPhone: args.customerPhone || undefined,
    customerEmail: args.customerEmail || undefined,
    channel: labelToChannel(args.channel),
    status: labelToStatus(args.status),
    paymentMethod: labelToPayment(args.payment),
    paymentStatus: args.paid ? "paid" : "unpaid",
    deliveryAddress: args.address || undefined,
    deliveryCity: args.city || undefined,
    deliveryRegion: args.region || undefined,
    notes: args.notes || undefined,
  };
}

/* ============================ customers ============================ */

const PALETTE = ["#1d4ed8", "#0ea5e9", "#7c3aed", "#db2777", "#059669", "#d97706"];

export function customerToRow(d: CustomerWithStats, i = 0): Customer & { dbId: string } {
  const name = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "Unknown";
  return {
    dbId: d.id,
    name,
    contact: d.phone ?? d.email ?? "—",
    via: d.preferredContact ?? (d.phone ? "phone" : "email"),
    orders: d.orderCount,
    spent: formatCedis(toCedis(d.totalSpentPesewas)),
    last: shortDate(d.lastOrderAt),
    color: d.color ?? PALETTE[i % PALETTE.length],
  };
}
