/** A size / measurement option for a product, with its own price. */
export type ProductVariant = {
  size: string;/** e.g. "M", "42", "500ml", "Large". */
  price: number; /** Price in cedis for this size. */
};

/** A product shown on the Products page. */
export type Product = {
  name: string;
  price: string;
  stock: number;
  sold: number;
  category?: string;
  color?: string;   /** Fallback background (legacy seed data) used when no image is set. */
  image?: string; /** Uploaded product image as a data URL. */
  variants?: ProductVariant[]; /** Optional per-size / per-measurement pricing. */
};

/** Props for the create/edit product modal. */
export type CreateProductModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: Product | null;
  onSubmit: (product: Product) => void;
};

/* ------------------------------------------------------------------ */
/* API / database shapes — used by src/services/products.ts.          */
/* Money is in pesewas; the price label is derived from the range.    */
/* ------------------------------------------------------------------ */

export type ProductVariantDTO = {
  id: string;
  productId: string;
  size: string;
  pricePesewas: number;
  position: number;
  createdAt: string;
};

export type CategoryDTO = {
  id: string;
  storeId: string;
  name: string;
  position: number;
  createdAt: string;
  _count?: { products: number };
};

export type ProductDTO = {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  basePricePesewas: number | null;
  stock: number;
  sold: number;
  color: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantDTO[];
  category: CategoryDTO | null;
  /** Derived price range (cheapest/dearest variant, else base price). */
  minPricePesewas: number | null;
  maxPricePesewas: number | null;
};

/** Body for creating a product. Provide a base price OR ≥1 priced variant. */
export type ProductInput = {
  name: string;
  description?: string;
  categoryId?: string | null;
  basePricePesewas?: number | null;
  stock?: number;
  sold?: number;
  color?: string;
  imageUrl?: string;
  isActive?: boolean;
  variants?: { size: string; pricePesewas: number; position?: number }[];
};

/** Body for creating/updating a category. */
export type CategoryInput = {
  name: string;
  position?: number;
};
