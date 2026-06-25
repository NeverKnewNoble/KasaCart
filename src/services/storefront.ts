import axios from "axios";
import { toast } from "sonner";
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
      // A 409 here means the chosen store handle is taken by another seller.
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error("That store handle is already taken — please pick another.");
      } else {
        console.error("Unable to connect to server", err);
        toast.error("Couldn't save your storefront. Please try again.");
      }
    }
  }

  /**
   * * Upload a store image (logo or banner) to Vercel Blob.
   * The caller should downscale the file first (see src/utils/image.ts).
   * @returns the public URL to store on the `logoUrl` / `bannerUrl` field.
   */
  static async uploadImage(file: File, kind: "logo" | "banner") {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);

      const response = await axios.post<{ data: { url: string } }>(
        `${backendUrl}/upload`,
        form
      );

      return response.data?.data?.url;
    } catch (err) {
      console.error("Image upload failed", err);
    }
  }
}
