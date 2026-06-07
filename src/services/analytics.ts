import axios from "axios";
import { backendUrl } from "@/services/main";
import type { AnalyticsData } from "@/types/analytics";

/**
 * Analytics page service → /api/analytics.
 * KPIs, channel + status breakdowns, top products, monthly trend.
 */
export default class Analytics {
  /**
   * * Function to get the analytics payload
   * @returns AnalyticsData
   */
  static async getAnalytics() {
    try {
      const response = await axios.get<{ data: AnalyticsData }>(`${backendUrl}/analytics`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }
}
