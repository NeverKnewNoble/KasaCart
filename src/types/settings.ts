/* ------------------------------------------------------------------ */
/* Settings page API shapes — used by src/services/settings.ts.       */
/* (Store details reuse StoreDTO/StoreUpdate from ./storefront.)       */
/* ------------------------------------------------------------------ */

export type NotificationPreferencesDTO = {
  storeId: string;
  newOrder: boolean;
  lowStock: boolean;
  newCustomer: boolean;
  weeklySummary: boolean;
  lowStockThreshold: number;
  updatedAt: string;
};

export type NotificationPreferencesInput = {
  newOrder?: boolean;
  lowStock?: boolean;
  newCustomer?: boolean;
  weeklySummary?: boolean;
  lowStockThreshold?: number;
};
