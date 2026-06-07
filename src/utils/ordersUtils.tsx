/**
 *
 * ORDERS PAGE UTILITY FUNCTIONS
 *
 */
import type { Order, OrderFilters } from "@/types/orders";

/** Sales channels available across the orders flows. */
export const ORDER_CHANNELS = ["WhatsApp", "Instagram", "TikTok", "Facebook", "Snapchat"];

/** A blank filter set (everything = "show all"). */
export const emptyOrderFilters: OrderFilters = {
  orderId: "",
  customer: "",
  paid: "all",
  status: "all",
  channel: "all",
};

/** Apply the Orders page filters (and the toolbar search) to a list of orders. */
export function filterOrders(list: Order[], f: OrderFilters, search = ""): Order[] {
  const s = search.trim().toLowerCase();
  return list.filter((o) => {
    if (f.orderId && !o.id.toLowerCase().includes(f.orderId.toLowerCase())) return false;
    if (f.customer && !o.customer.toLowerCase().includes(f.customer.toLowerCase())) return false;
    if (f.paid !== "all" && (f.paid === "paid") !== o.paid) return false;
    if (f.status !== "all" && o.status !== f.status) return false;
    if (f.channel !== "all" && o.channel !== f.channel) return false;
    if (s && !`${o.id} ${o.customer} ${o.item}`.toLowerCase().includes(s)) return false;
    return true;
  });
}

/** How many filters are currently active (for the toolbar badge). */
export function countActiveFilters(f: OrderFilters): number {
  let n = 0;
  if (f.orderId.trim()) n++;
  if (f.customer.trim()) n++;
  if (f.paid !== "all") n++;
  if (f.status !== "all") n++;
  if (f.channel !== "all") n++;
  return n;
}

/** Generate the next sequential order id (e.g. "KC-2049") from an existing list. */
export function nextId(list: Order[]) {
  const nums = list
    .map((o) => parseInt(o.id.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 2048;
  return `KC-${max + 1}`;
}

/** Human-readable timestamp for a freshly created order (e.g. "Today, 2:14 PM"). */
export function newOrderDate() {
  const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Today, ${time}`;
}
