import axios from "axios";
import { backendUrl } from "@/services/main";
import type {
  CustomerDTO,
  CustomerWithStats,
  CustomerDetail,
  CustomerInput,
} from "@/types/customers";

/**
 * Customers page services → /api/customers + /api/customers/[id].
 * The list returns computed stats (order count, total spent, last order).
 */
export default class Customers {
  /**
   * * Function to list customers (with derived order/spend stats)
   * @returns CustomerWithStats[]
   */
  static async listCustomers() {
    try {
      const response = await axios.get<{ data: CustomerWithStats[] }>(`${backendUrl}/customers`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to get a single customer (with their orders) by id
   * @params id
   * @returns CustomerDetail
   */
  static async getCustomer(id: string) {
    try {
      const response = await axios.get<{ data: CustomerDetail }>(`${backendUrl}/customers/${id}`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to create a customer
   * @params customerDetails
   * @returns CustomerDTO
   */
  static async createCustomer(customerDetails: CustomerInput) {
    try {
      const response = await axios.post<{ data: CustomerDTO }>(
        `${backendUrl}/customers`,
        customerDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log("customer created successfully");
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to update a customer by id
   * @params id, customerDetails
   * @returns CustomerDTO
   */
  static async updateCustomer(id: string, customerDetails: Partial<CustomerInput>) {
    try {
      const response = await axios.patch<{ data: CustomerDTO }>(
        `${backendUrl}/customers/${id}`,
        customerDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`customer ${id} updated successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to delete a customer by id
   * @params id
   * @returns
   */
  static async deleteCustomer(id: string) {
    try {
      await axios.delete(`${backendUrl}/customers/${id}`);
      console.log(`customer ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
