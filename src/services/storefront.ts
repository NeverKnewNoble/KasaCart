import axios from "axios";
import { backendUrl } from "@/services/main";
import type { StoreDTO, StoreUpdate } from "@/types/storefront";

/**
 * Storefront page service → /api/store.
 * The brand/theme editor (name, tagline, handle, accent, logo, banner).
 */
export default class Storefront {
  /**
   * * Function to get the current seller's store
   * @returns StoreDTO
   */
  static async getStore() {
    try {
      const response = await axios.get<{ data: StoreDTO }>(`${backendUrl}/store`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to update the store's brand / settings fields
   * @params storeDetails
   * @returns StoreDTO
   */
  static async updateStore(storeDetails: StoreUpdate) {
    try {
      const response = await axios.patch<{ data: StoreDTO }>(`${backendUrl}/store`, storeDetails);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log("store updated successfully");
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
