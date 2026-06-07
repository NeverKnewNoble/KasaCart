import type { OrderStatus, SalesChannel } from "./api";

/* ------------------------------------------------------------------ */
/* Analytics page API shape — used by src/services/analytics.ts.      */
/* Money is in pesewas.                                               */
/* ------------------------------------------------------------------ */

export type AnalyticsData = {
  kpis: {
    revenuePesewas: number;
    ordersCount: number;
    avgOrderValuePesewas: number;
    newCustomersThisMonth: number;
  };
  salesByChannel: { channel: SalesChannel; ordersCount: number; revenuePesewas: number }[];
  statusBreakdown: { status: OrderStatus; ordersCount: number }[];
  topProducts: {
    productId: string | null;
    productName: string;
    unitsSold: number;
    revenuePesewas: number;
  }[];
  monthlyRevenue: { month: string; revenuePesewas: number }[];
};
