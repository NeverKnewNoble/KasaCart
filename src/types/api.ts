/**
 * Shared API types — the cross-cutting shapes used by the service layer
 * (`src/services/*`) and the domain DTO types in `src/types/*`.
 *
 * These mirror the **database** enum values in `prisma/schema.prisma` (lowercase,
 * e.g. "pending", "mobile_money") — distinct from the UI label unions on the
 * mock-data types (e.g. `Order.status = "Pending"`). See docs/data-layer.md.
 */

/** Dates are serialised to ISO strings over the wire — map a model type to that. */
export type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K];
};

/* ---- enum unions (mirror prisma/schema.prisma) ---- */
export type OrderStatus = "pending" | "confirmed" | "packed" | "delivered" | "cancelled";
export type PaymentMethod = "cash_on_delivery" | "mobile_money" | "bank_transfer";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type SalesChannel =
  | "storefront"
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "snapchat";
export type ContactMethod = "phone" | "email";
export type PlanTier = "free" | "pro";
export type SubscriptionStatus = "active" | "past_due" | "cancelled";
