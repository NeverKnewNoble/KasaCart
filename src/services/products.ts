import axios from "axios";
import { backendUrl } from "@/services/main";
import type {
  ProductDTO,
  ProductInput,
  CategoryDTO,
  CategoryInput,
} from "@/types/products";

/**
 * Products page services → /api/products + /api/categories.
 * The Products grid + Create/Edit Product modal. Money is in pesewas.
 */
export default class Products {
  /**
   * * Function to list all of the store's products
   * @returns ProductDTO[]
   */
  static async listProducts() {
    try {
      const response = await axios.get<{ data: ProductDTO[] }>(`${backendUrl}/products`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to get a single product by id
   * @params id
   * @returns ProductDTO
   */
  static async getProduct(id: string) {
    try {
      const response = await axios.get<{ data: ProductDTO }>(`${backendUrl}/products/${id}`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to create a product (with optional size variants)
   * @params productDetails
   * @returns ProductDTO
   */
  static async createProduct(productDetails: ProductInput) {
    try {
      const response = await axios.post<{ data: ProductDTO }>(
        `${backendUrl}/products`,
        productDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`product ${productDetails.name} created successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to update a product. Sending `variants` replaces the whole set.
   * @params id, productDetails
   * @returns ProductDTO
   */
  static async updateProduct(id: string, productDetails: Partial<ProductInput>) {
    try {
      const response = await axios.patch<{ data: ProductDTO }>(
        `${backendUrl}/products/${id}`,
        productDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`product ${id} updated successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to delete a product by id
   * @params id
   * @returns
   */
  static async deleteProduct(id: string) {
    try {
      await axios.delete(`${backendUrl}/products/${id}`);
      console.log(`product ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /* ---- categories (used by the Create Product modal) ---- */

  /**
   * * Function to list the store's product categories
   * @returns CategoryDTO[]
   */
  static async listCategories() {
    try {
      const response = await axios.get<{ data: CategoryDTO[] }>(`${backendUrl}/categories`);

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      return response.data.data;
    } catch (err) {
      console.error("Unable to establish connection with server", err);
    }
  }

  /**
   * * Function to create a category
   * @params categoryDetails
   * @returns CategoryDTO
   */
  static async createCategory(categoryDetails: CategoryInput) {
    try {
      const response = await axios.post<{ data: CategoryDTO }>(
        `${backendUrl}/categories`,
        categoryDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`category ${categoryDetails.name} created successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to update a category by id
   * @params id, categoryDetails
   * @returns CategoryDTO
   */
  static async updateCategory(id: string, categoryDetails: Partial<CategoryInput>) {
    try {
      const response = await axios.patch<{ data: CategoryDTO }>(
        `${backendUrl}/categories/${id}`,
        categoryDetails
      );

      if (!response || !response.data) {
        return console.log("Failed to get a response");
      }

      console.log(`category ${id} updated successfully`);
      return response.data.data;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }

  /**
   * * Function to delete a category by id
   * @params id
   * @returns
   */
  static async deleteCategory(id: string) {
    try {
      await axios.delete(`${backendUrl}/categories/${id}`);
      console.log(`category ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Unable to connect to server", err);
    }
  }
}
