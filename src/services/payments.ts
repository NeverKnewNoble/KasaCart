import axios from "axios";
import { backendUrl } from "@/services/main";
import type { BillingData, SubscriptionDTO } from "@/types/payments";
import type { PlanTier } from "@/types/api";

/**
 * Payments page services → /api/billing.
 * Subscription (Free/Pro) + invoice history. Money is in pesewas.
 */
export default class Payments {
  /**
   * * Function to get the store's billing data (subscription + invoices)
   * @returns BillingData
   */
  static async getBilling() {
    try {
      const response = await axios.get<{ data: BillingData }>(`${backendUrl}/billing`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to change the plan ("free" | "pro"). Pro = ₵99/mo (9900 pesewas).
   * @params plan
   * @returns SubscriptionDTO
   */
  static async updatePlan(plan: PlanTier) {
    try {
      const response = await axios.patch<{ data: SubscriptionDTO }>(`${backendUrl}/billing`, {
        plan,
      });

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`plan changed to ${plan} successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
