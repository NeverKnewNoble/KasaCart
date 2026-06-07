import type { OrderStatus } from "./api";

/** A row in the dashboard "Recent orders" list. */
export type RecentOrder = {
  id: string;
  customer: string;
  item: string;
  total: string;
  status: "New" | "Confirmed" | "Packed" | "Delivered";
  time: string;
  color: string;
};

/* ------------------------------------------------------------------ */
/* API shape — used by src/services/dashboard.ts. Money in pesewas.   */
/* ------------------------------------------------------------------ */

export type DashboardData = {
  kpis: {
    awaitingFulfilment: number;
    productsLive: number;
    revenuePesewas: number;
    ordersCount: number;
  };
  pipeline: { status: OrderStatus; count: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string | null;
    status: OrderStatus;
    totalPesewas: number;
    placedAt: string;
    itemSummary: string;
  }[];
  topProducts: {
    productId: string | null;
    productName: string;
    unitsSold: number;
    revenuePesewas: number;
  }[];
};
