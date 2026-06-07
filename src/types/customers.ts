import type { ContactMethod } from "./api";
import type { OrderDTO } from "./orders";

/** A customer shown on the Customers page. */
export type Customer = {
  name: string;
  contact: string;
  via: "phone" | "email";
  orders: number;
  spent: string;
  last: string;
  color: string;
};

/* ------------------------------------------------------------------ */
/* API / database shapes — used by src/services/customers.ts.         */
/* ------------------------------------------------------------------ */

export type CustomerDTO = {
  id: string;
  storeId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  preferredContact: ContactMethod | null;
  address: string | null;
  city: string | null;
  region: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Customer row from the list endpoint, with derived stats. */
export type CustomerWithStats = CustomerDTO & {
  orderCount: number;
  totalSpentPesewas: number;
  lastOrderAt: string | null;
};

/** Single customer (detail) includes their orders. */
export type CustomerDetail = CustomerDTO & {
  orders: OrderDTO[];
};

export type CustomerInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  preferredContact?: ContactMethod;
  address?: string;
  city?: string;
  region?: string;
  color?: string;
};
