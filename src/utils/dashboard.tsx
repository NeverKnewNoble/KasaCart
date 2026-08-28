import type { OrderStatus } from "@/types/api";


// Pipeline stages in fulfilment order, with display labels + colours.
export const STAGES: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "New", color: "#f59e0b" },
  { status: "confirmed", label: "Confirmed", color: "#1d4ed8" },
  { status: "packed", label: "Packed", color: "#7c3aed" },
  { status: "delivered", label: "Delivered", color: "#059669" },
];
// Dashboard "Recent orders" badge label (pending → "New").
export const BADGE: Record<OrderStatus, "New" | "Confirmed" | "Packed" | "Delivered"> = {
  pending: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  delivered: "Delivered",
  cancelled: "New",
};
export const ROW_COLORS = ["#1d4ed8", "#0ea5e9", "#7c3aed", "#db2777", "#059669"];