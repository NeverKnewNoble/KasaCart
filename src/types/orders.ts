import type { OrderStatus, SalesChannel, PaymentMethod, PaymentStatus } from "./api";

/** An order shown on the Orders page. */
export type Order = {
  id: string;
  customer: string;
  item: string;
  channel: string;
  total: string;
  paid: boolean;
  status: "Pending" | "Confirmed" | "Packed" | "Delivered";
  date: string;
  /** Delivery address — street, city and region. */
  address?: string;
  city?: string;
  region?: string;
  /** Customer's preferred payment method. */
  payment?: "Cash on delivery" | "Mobile Money";
};

/** A single product line within the create/edit order modal. */
export type OrderLineItem = {
  name: string;
  price: number;
  qty: number;
};

/** Props for the create/edit order modal. */
export type CreateOrderModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: Order | null;
  /** Receives the UI order (for optimistic display) + the API payload to persist. */
  onSubmit: (order: Order, payload: OrderInput) => void;
};

/** Filter criteria for the Orders page. */
export type OrderFilters = {
  orderId: string;
  customer: string;
  paid: "all" | "paid" | "unpaid";
  status: "all" | Order["status"];
  channel: string;
};

/** Props for the filter-orders modal. */
export type FilterOrdersModalProps = {
  open: boolean;
  onClose: () => void;
  value: OrderFilters;
  onApply: (filters: OrderFilters) => void;
};

/* ------------------------------------------------------------------ */
/* API / database shapes — used by src/services/orders.ts.            */
/* Money is in pesewas; status/channel/payment use the DB enum values. */
/* ------------------------------------------------------------------ */

export type OrderItemDTO = {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  size: string | null;
  unitPricePesewas: number;
  quantity: number;
  lineTotalPesewas: number;
  createdAt: string;
};

export type OrderStatusEventDTO = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  changedAt: string;
};

export type OrderDTO = {
  id: string;
  storeId: string;
  customerId: string | null;
  orderNumber: string;
  status: OrderStatus;
  channel: SalesChannel;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  subtotalPesewas: number;
  deliveryFeePesewas: number;
  totalPesewas: number;
  currencyCode: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryRegion: string | null;
  notes: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
  statusEvents?: OrderStatusEventDTO[];
  /** Derived "Blue Summer Dress ×2, Gold Earrings" string. */
  itemSummary: string;
};

/**
 * Query filters for the Orders list endpoint (all optional).
 * A `type` (not `interface`) so it's assignable to the request query record.
 */
export type OrderListFilters = {
  status?: OrderStatus;
  channel?: SalesChannel;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  q?: string;
};

/** A single line in the create-order body. */
export type OrderItemInput = {
  productId?: string;
  variantId?: string;
  productName: string;
  size?: string;
  unitPricePesewas: number;
  quantity: number;
};

/** Body for creating an order. */
export type OrderInput = {
  items: OrderItemInput[];
  customerId?: string;
  orderNumber?: string;
  status?: OrderStatus;
  channel?: SalesChannel;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  deliveryFeePesewas?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryRegion?: string;
  notes?: string;
};

/** Body for updating an order (a status change appends a status event). */
export type OrderUpdate = {
  status?: OrderStatus;
  /** Convenience flag → payment_status (true = paid, false = unpaid). */
  paid?: boolean;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  channel?: SalesChannel;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryRegion?: string;
  notes?: string;
  statusNote?: string;
};
