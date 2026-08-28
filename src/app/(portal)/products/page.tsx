"use client";

import { useState } from "react";
import { Plus, Package, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import EmptyState from "@/components/ui_components/EmptyState";
import ProductGridSkeleton from "@/components/ui_components/ProductGridSkeleton";
import CreateProductModal from "@/components/modals/CreateProductModal";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import Products from "@/services/products";
import { stockBadge } from "@/utils/productUtils";
import { searchByPrefix } from "@/utils/general";
import { productToRow, productToInput, type ProductRow } from "@/utils/mappers";
import { toastResult } from "@/utils/notify";
import { toast } from "sonner";
import type { Product } from "@/types/products";
import type { CategoryDTO, ProductInput } from "@/types/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";



export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);


  // *** API FETCH QUERY !!!!!!!!!!!!!!!!!!!!!!
  // ?? `useQuery` fetches products and owns the loading/error state directly —
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const list = await Products.listProducts();
      if (!list) {
        toast.error("Couldn't load your products.");
        return [] as ProductRow[];
      }
      return list.map(productToRow);
    },
  });

  // ?? `useQuery` fetches categories and owns the loading/error state directly —
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const list = await Products.listCategories();
      if (!list) {
        toast.error("Couldn't load your categories.");
        return [] as CategoryDTO[];
      }
      return list;
    },
  });

  // *** MUTATIONS — each invalidates its query on success so the grid refetches.
  // Services return the entity on success / undefined on failure, so `toastResult`
  // reports the outcome and we only invalidate when it actually succeeded.
  const createCategory = useMutation({
    mutationFn: (name: string) => Products.createCategory({ name }),
    onSuccess: (created) => {
      if (created) queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const createProduct = useMutation({
    mutationFn: (input: ProductInput) => Products.createProduct(input),
    onSuccess: (res) => {
      if (toastResult(res, "Product created")) queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      Products.updateProduct(id, input),
    onSuccess: (res) => {
      if (toastResult(res, "Product updated")) queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => Products.deleteProduct(id),
    onSuccess: (res) => {
      if (toastResult(res, "Product deleted")) queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });


  // **** MODAL FUNCTIONS !!!!!!!!!!!!!!!!!!!!!!!!!!
  const visible = searchByPrefix(products, search, (p) => p.name);

  // ?? `openCreate` opens the modal in create mode, clearing any editing state.
  const openCreate = () => {
    setEditing(null);
    setMode("create");
    setModalOpen(true);
  };

  // ?? `openEdit` opens the modal in edit mode, setting the editing state to the selected product.
  const openEdit = (p: ProductRow) => {
    setEditing(p);
    setMode("edit");
    setModalOpen(true);
  };

  // ?? `ensureCategory` checks if a category exists, creates it if not, and returns the category ID.
  const ensureCategory = async (name?: string): Promise<string | undefined> => {
    if (!name) return undefined;
    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const created = await createCategory.mutateAsync(name);
    return created?.id;
  };

  // ?? `handleSubmit` is called by the modal when the user submits the form.
  const handleSubmit = async (data: Product) => {
    const categoryId = await ensureCategory(data.category);
    const input = productToInput(data, categoryId);
    if (mode === "edit" && editing) {
      updateProduct.mutate({ id: editing.dbId, input });
    } else {
      createProduct.mutate(input);
    }
  };

  // ?? `confirmDelete` is called by the delete confirmation modal when the user confirms deletion.
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct.mutate(deleteTarget.dbId);
    setDeleteTarget(null);
  };










  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Everything in your storefront — add, edit and keep stock honest."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Add product
          </button>
        }
      />

      {/* toolbar */}
      <div className="relative w-full sm:max-w-sm">
        <input
          className="input pl-10"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* grid */}
      {loading ? (
        <ProductGridSkeleton count={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={products.length === 0 ? "No products yet" : "No products match your search"}
          description={
            products.length === 0
              ? "Click “Add product” to put your first item on your storefront."
              : "Try a different search term."
          }
          action={
            products.length === 0 ? (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                Add product
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const badge = stockBadge(p.stock);
            return (
              <div key={p.dbId} className="surface group overflow-hidden rounded-2xl">
                <div
                  className="relative h-40"
                  style={{ background: p.image ? undefined : p.color ?? "#1d4ed8" }}
                >
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  )}
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <button
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setMenu((m) =>
                        m?.id === p.dbId ? null : { id: p.dbId, x: r.right, y: r.bottom + 6 }
                      );
                    }}
                    aria-label="Product actions"
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-fg/70 shadow-sm transition-colors hover:text-brand"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-fg">{p.name}</h3>
                    <p className="shrink-0 font-mono text-sm font-bold text-fg">{p.price}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-fg/50">
                    <Package className="h-3.5 w-3.5" strokeWidth={1.8} />
                    {p.sold} sold all-time
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* card actions dropdown (fixed so it isn't clipped) */}
      {menu && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setMenu(null)}
            aria-hidden
          />
          <div
            className="fixed z-50 w-44 overflow-hidden rounded-xl border border-brand/12 bg-surface py-1 shadow-[0_20px_45px_-20px_rgba(10,28,77,0.5)]"
            style={{ top: menu.y, left: menu.x, transform: "translateX(-100%)" }}
          >
            <button
              onClick={() => {
                const p = products.find((x) => x.dbId === menu.id);
                setMenu(null);
                if (p) openEdit(p);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-fg/80 transition-colors hover:bg-brand/8 hover:text-brand"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.8} />
              Edit product
            </button>
            <button
              onClick={() => {
                const p = products.find((x) => x.dbId === menu.id);
                setMenu(null);
                if (p) setDeleteTarget(p);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              Delete product
            </button>
          </div>
        </>
      )}

      {/* create / edit modal */}
      <CreateProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        initialData={editing}
        onSubmit={handleSubmit}
      />

      {/* delete confirmation */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete product"
        confirmLabel="Delete product"
      >
        Are you sure you want to delete{" "}
        <span className="font-semibold text-fg">{deleteTarget?.name}</span>? This can&apos;t
        be undone.
      </ConfirmDeleteModal>
    </div>
  );
}
