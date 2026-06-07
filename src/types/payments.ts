import type { PlanTier, SubscriptionStatus } from "./api";

/* ------------------------------------------------------------------ */
/* Payments page API shapes — used by src/services/payments.ts.       */
/* Money is in pesewas.                                               */
/* ------------------------------------------------------------------ */

export type SubscriptionDTO = {
  id: string;
  storeId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  pricePesewas: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceDTO = {
  id: string;
  storeId: string;
  subscriptionId: string | null;
  amountPesewas: number;
  currencyCode: string;
  status: string;
  issuedAt: string;
  paidAt: string | null;
};

export type BillingData = {
  subscription: SubscriptionDTO;
  invoices: InvoiceDTO[];
};
