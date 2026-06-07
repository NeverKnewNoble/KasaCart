import axios from "axios";
import { backendUrl } from "@/services/main";
import type { StoreDTO, StoreUpdate } from "@/types/storefront";
import type {
  NotificationPreferencesDTO,
  NotificationPreferencesInput,
} from "@/types/settings";

/**
 * Settings page services → /api/store + /api/store/notifications.
 * Store details (same `stores` row as the Storefront editor) + notification toggles.
 */
export default class Settings {
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
   * * Function to update the store's details (name, support phone, currency, …)
   * @params storeDetails
   * @returns StoreDTO
   */
  static async updateStore(storeDetails: StoreUpdate) {
    try {
      const response = await axios.patch<{ data: StoreDTO }>(`${backendUrl}/store`, storeDetails);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log("store settings updated successfully");
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to get the store's notification preferences
   * @returns NotificationPreferencesDTO
   */
  static async getNotifications() {
    try {
      const response = await axios.get<{ data: NotificationPreferencesDTO }>(
        `${backendUrl}/store/notifications`
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
   * * Function to update the notification preferences (toggles + threshold)
   * @params preferences
   * @returns NotificationPreferencesDTO
   */
  static async updateNotifications(preferences: NotificationPreferencesInput) {
    try {
      const response = await axios.put<{ data: NotificationPreferencesDTO }>(
        `${backendUrl}/store/notifications`,
        preferences
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log("notification preferences updated successfully");
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
