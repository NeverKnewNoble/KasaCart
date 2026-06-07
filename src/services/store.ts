import axios from "axios";
import { backendUrl } from "@/services/main";
import type { StorefrontData, CheckoutInput, CheckoutResult } from "@/types/storefront";

/**
 * Public storefront page services → /api/storefront/[handle] (+ /checkout).
 * Powers the shopper-facing /store/[handle] page — NO auth.
 */
export default class Store {
  /**
   * * Function to load a published store's catalogue by handle
   * @params handle
   * @returns StorefrontData
   */
  static async getStorefront(handle: string) {
    try {
      const response = await axios.get<{ data: StorefrontData }>(
        `${backendUrl}/storefront/${encodeURIComponent(handle)}`
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to place an order from the storefront cart
   * @params handle, checkoutDetails
   * @returns CheckoutResult
   */
  static async checkout(handle: string, checkoutDetails: CheckoutInput) {
    try {
      const response = await axios.post<{ data: CheckoutResult }>(
        `${backendUrl}/storefront/${encodeURIComponent(handle)}/checkout`,
        checkoutDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`order ${response.data.data.ref} placed successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
