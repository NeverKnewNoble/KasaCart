import axios from "axios";
import { backendUrl } from "@/services/main";
import type {
  OrderDTO,
  OrderListFilters,
  OrderInput,
  OrderUpdate,
} from "@/types/orders";

/**
 * Orders page services → /api/orders + /api/orders/[id].
 * The Orders table (with filters) + Create/Edit Order modal. Money is in pesewas.
 */
export default class Orders {
  /**
   * * Function to list orders, optionally filtered (status/channel/paid/search)
   * @params filters
   * @returns OrderDTO[]
   */
  static async listOrders(filters: OrderListFilters = {}) {
    try {
      const response = await axios.get<{ data: OrderDTO[] }>(`${backendUrl}/orders`, {
        params: filters,
      });

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to get a single order (with items + status timeline) by id
   * @params id
   * @returns OrderDTO
   */
  static async getOrder(id: string) {
    try {
      const response = await axios.get<{ data: OrderDTO }>(`${backendUrl}/orders/${id}`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to create an order (snapshots items, adjusts stock)
   * @params orderDetails
   * @returns OrderDTO
   */
  static async createOrder(orderDetails: OrderInput) {
    try {
      const response = await axios.post<{ data: OrderDTO }>(
        `${backendUrl}/orders`,
        orderDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`order ${response.data.data.orderNumber} created successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to update an order (a status change appends a status event)
   * @params id, orderDetails
   * @returns OrderDTO
   */
  static async updateOrder(id: string, orderDetails: OrderUpdate) {
    try {
      const response = await axios.patch<{ data: OrderDTO }>(
        `${backendUrl}/orders/${id}`,
        orderDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`order ${id} updated successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to delete an order by id
   * @params id
   * @returns
   */
  static async deleteOrder(id: string) {
    try {
      await axios.delete(`${backendUrl}/orders/${id}`);
      console.log(`order ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
