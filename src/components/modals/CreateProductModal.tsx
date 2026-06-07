"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Package, Plus, Ruler } from "lucide-react";
import type { CreateProductModalProps, ProductVariant } from "@/types/products";
import Modal from "./Modal";

const categories = [
  "Clothing",
  "Footwear",
  "Accessories",
  "Bags",
  "Jewelry",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Living",
  "Kitchen & Dining",
  "Furniture",
  "Electronics",
  "Phones & Tablets",
  "Computers & Laptops",
  "Gaming",
  "Toys & Games",
  "Baby & Kids",
  "Sports & Outdoors",
  "Books & Stationery",
  "Art & Crafts",
  "Food & Beverages",
  "Groceries",
  "Pet Supplies",
  "Automotive",
  "Tools & Hardware",
  "Garden & Outdoor",
  "Music & Instruments",
  "Office Supplies",
  "Other",
];
const parsePrice = (s: string) => parseInt(s.replace(/[^\d]/g, ""), 10) || 0;

// Common size presets; "Custom…" reveals a free-text field for measurements
// like "500ml", "42" or "1.5kg".
const CUSTOM = "Custom…";
const SIZE_OPTIONS = ["One Size", "XS", "S", "M", "L", "XL", "XXL", "XXXL", CUSTOM];

/** Build the price string shown in lists — a range when sizes are priced. */
function priceLabel(basePrice: string, variants: ProductVariant[]): string {
  const priced = variants.filter((v) => v.size.trim() && v.price > 0);
  if (priced.length === 0) return `₵${parsePrice(basePrice)}`;
  const prices = priced.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₵${min}` : `₵${min} – ₵${max}`;
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-fg/70">{label}</label>
      {children}
    </div>
  );
}

export default function CreateProductModal({
  open,
  onClose,
  mode = "create",
  initialData,
  onSubmit,
}: CreateProductModalProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // (re)seed the form whenever the modal opens
  useEffect(() => {
    if (!open) return;
    const p = initialData;
    setName(p?.name ?? "");
    setPrice(p ? String(parsePrice(p.price)) : "");
    setStock(p ? String(p.stock) : "");
    setImage(p?.image);
    setCategory(p?.category ?? categories[0] ?? "");
    setVariants(p?.variants ? p.variants.map((v) => ({ ...v })) : []);
  }, [open, initialData]);

  const addVariant = () => setVariants((vs) => [...vs, { size: "", price: 0 }]);

  const updateVariant = (i: number, patch: Partial<ProductVariant>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const removeVariant = (i: number) =>
    setVariants((vs) => vs.filter((_, idx) => idx !== i));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pricedVariants = variants.filter((v) => v.size.trim() && v.price > 0);
  // A base price isn't required once sizes carry their own prices.
  const canSubmit =
    name.trim().length > 0 && stock !== "" && (price !== "" || pricedVariants.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      price: priceLabel(price, variants),
      stock: Math.max(0, parseInt(stock, 10) || 0),
      sold: initialData?.sold ?? 0,
      category,
      image,
      color: initialData?.color,
      variants: pricedVariants.length > 0 ? pricedVariants : undefined,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isEdit ? "Edit product" : "Add product"}
      subtitle={
        isEdit
          ? "Update the details of this product."
          : "Add a product to your storefront."
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand/15 bg-surface px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-product-form"
            disabled={!canSubmit}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isEdit ? "Save changes" : "Add product"}
          </button>
        </>
      }
    >
      <form id="create-product-form" onSubmit={handleSubmit} className="space-y-5">
        <Field label="Product name">
          <input
            className="input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blue Summer Dress"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Base price (₵)">
            <input
              type="number"
              min={0}
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="120"
            />
          </Field>
          <Field label="Stock">
            <input
              type="number"
              min={0}
              className="input"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="14"
            />
          </Field>
        </div>

        <Field label="Category">
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        {/* sizes / measurements with their own prices */}
        <div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm font-medium text-fg/70">
              <Ruler className="h-4 w-4 text-brand" strokeWidth={1.8} />
              Sizes &amp; measurements
            </label>
            <span className="text-xs text-fg/45">Optional · per-size pricing</span>
          </div>

          {variants.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-brand/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand/10 text-xs uppercase tracking-wide text-fg/40">
                    <th className="px-3 py-2.5 font-semibold">Size / measurement</th>
                    <th className="px-3 py-2.5 font-semibold">Price (₵)</th>
                    <th className="w-10 px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/8">
                  {variants.map((v, i) => {
                    const isPreset = SIZE_OPTIONS.includes(v.size) && v.size !== CUSTOM;
                    const isCustom = !isPreset; // empty or free-text → custom mode
                    return (
                      <tr key={i}>
                        <td className="px-3 py-2.5">
                          {isCustom ? (
                            <div className="flex items-center gap-2">
                              <input
                                className="input h-9 px-2.5 py-1"
                                value={v.size}
                                autoFocus={v.size === ""}
                                onChange={(e) => updateVariant(i, { size: e.target.value })}
                                placeholder="e.g. 500ml, 42"
                              />
                              <button
                                type="button"
                                onClick={() => updateVariant(i, { size: SIZE_OPTIONS[0] })}
                                className="shrink-0 text-xs font-semibold text-fg/45 transition-colors hover:text-brand"
                              >
                                Presets
                              </button>
                            </div>
                          ) : (
                            <select
                              className="input h-9 px-2.5 py-1"
                              value={v.size}
                              onChange={(e) =>
                                updateVariant(i, {
                                  size: e.target.value === CUSTOM ? "" : e.target.value,
                                })
                              }
                            >
                              {SIZE_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            className="input h-9 w-28 px-2.5 py-1"
                            value={v.price || ""}
                            onChange={(e) =>
                              updateVariant(i, { price: Math.max(0, parseInt(e.target.value, 10) || 0) })
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="px-2 py-2.5">
                          <button
                            type="button"
                            onClick={() => removeVariant(i)}
                            aria-label="Remove size"
                            className="grid h-7 w-7 place-items-center rounded-lg text-fg/40 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={addVariant}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand/25 px-3 py-2 text-sm font-semibold text-fg/65 transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add size
          </button>
        </div>

        <Field label="Product image">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {image ? (
            <div className="relative overflow-hidden rounded-xl border border-brand/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Product preview" className="h-44 w-full object-cover" />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-fg/80 shadow-sm transition-colors hover:text-brand"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-rose-600 shadow-sm transition-colors hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/20 bg-raised/40 text-fg/55 transition-colors hover:border-brand/40 hover:text-brand"
            >
              <ImagePlus className="h-7 w-7" strokeWidth={1.6} />
              <span className="text-sm font-semibold">Upload a product photo</span>
              <span className="text-xs text-fg/45">PNG, JPG or WEBP</span>
            </button>
          )}
        </Field>

        {/* live preview */}
        <div className="flex items-center gap-3 rounded-xl border border-brand/10 bg-raised/50 p-3">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand/8 text-brand">
              <Package className="h-5 w-5" strokeWidth={1.8} />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{name || "Product name"}</p>
            <p className="font-mono text-xs text-fg/55">
              {priceLabel(price, variants)} · {parseInt(stock, 10) || 0} in stock
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
