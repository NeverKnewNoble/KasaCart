import axios from "axios";
import { backendUrl } from "@/services/main";
import type { DashboardData } from "@/types/dashboard";

/**
 * Dashboard page service → /api/dashboard.
 * One call returns everything the Dashboard renders. Money is in pesewas.
 */
export default class Dashboard {
  /**
   * * Function to get the dashboard payload (KPIs, pipeline, recent, top products)
   * @returns DashboardData
   */
  static async getDashboard() {
    try {
      const response = await axios.get<{ data: DashboardData }>(`${backendUrl}/dashboard`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }
}
