"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  Download,
  Plus,
  ShoppingBag,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import EmptyState from "@/components/ui_components/EmptyState";
import TableSkeleton from "@/components/ui_components/TableSkeleton";
import CreateOrderModal from "@/components/modals/CreateOrderModal";
import FilterOrdersModal from "@/components/modals/FilterOrdersModal";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import { orderStatusStyle as statusStyle } from "@/utils/SampleDate";
import Orders from "@/services/orders";
import type { Order, OrderFilters, OrderInput, OrderUpdate } from "@/types/orders";
import { initials } from "@/utils/general";
import { filterOrders, countActiveFilters, emptyOrderFilters } from "@/utils/ordersUtils";
import { orderToRow, labelToPayment, type OrderRow } from "@/utils/mappers";
import { toastResult } from "@/utils/notify";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>(emptyOrderFilters);


  // ** QUERY CLIENT FOR REFRESHING DATA !!!!!!!!!!!!!!!!!!!!!!
  const { data: orders = [] , isLoading: loading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const list = await Orders.listOrders();
      if(!list) {
        toast.error("Couldn't load your orders.");
        return [] as OrderRow[];
      }
      return list.map(orderToRow);
    }
  })

  const visibleOrders = filterOrders(orders, filters, search) as OrderRow[];
  const activeFilterCount = countActiveFilters(filters);


  // *** MUTATIONS — each invalidates the orders query on success so the list refetches.
  // Services return the entity on success / undefined on failure, so `toastResult`
  // reports the outcome and we only invalidate when it actually succeeded.
  const createOrder = useMutation({
    mutationFn: (payload: OrderInput) => Orders.createOrder(payload),
    onSuccess: (res) => {
      if (toastResult(res, "Order created")) queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, update }: { id: string; update: OrderUpdate }) =>
      Orders.updateOrder(id, update),
    onSuccess: (res) => {
      if (toastResult(res, "Order updated")) queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: (id: string) => Orders.deleteOrder(id),
    onSuccess: (res) => {
      if (toastResult(res, "Order deleted")) queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });


  // *** FUNCTIONS FOR MODALS AND ACTIONS !!!!!!!!!!!!!!!!!!!!!!
  const openCreate = () => {
    setEditing(null);
    setMode("create");
    setModalOpen(true);
  };

  const openEdit = (o: OrderRow) => {
    setEditing(o);
    setMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = (_data: Order, payload: OrderInput) => {
    if (mode === "edit" && editing) {
      // The API doesn't edit line items — update the order's fields only.
      const update: OrderUpdate = {
        status: payload.status,
        paid: payload.paymentStatus === "paid",
        paymentMethod: labelToPayment(_data.payment),
        channel: payload.channel,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        deliveryAddress: payload.deliveryAddress,
        deliveryCity: payload.deliveryCity,
        deliveryRegion: payload.deliveryRegion,
        notes: payload.notes,
      };
      updateOrder.mutate({ id: editing.dbId, update });
    } else {
      createOrder.mutate(payload);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteOrder.mutate(deleteTarget.dbId);
    setDeleteTarget(null);
  };







  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Track and fulfil every order from new to delivered."
        action={
          <>
            <button className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-4 py-2.5 text-sm font-semibold text-fg/80 transition-colors hover:border-brand/40 hover:text-brand">
              <Download className="h-4 w-4" strokeWidth={1.8} />
              Export
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Add new order
            </button>
          </>
        }
      />

      {/* toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            className="input"
            placeholder="Search by order, customer or product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeFilterCount > 0
              ? "border-brand/40 bg-brand/5 text-brand"
              : "border-brand/12 bg-surface text-fg/70 hover:text-brand"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
          Filters
          {activeFilterCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* table / states */}
      {loading ? (
        <TableSkeleton columns={6} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Orders from your storefront — and ones you add here — will show up in this list."
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Add new order
            </button>
          }
        />
      ) : (
        <div className="surface overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead>
                <tr className="border-b border-brand/10 text-xs uppercase tracking-wide text-fg/40">
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Channel</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/8">
                {visibleOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-fg/45">
                      No orders match your search or filters.
                    </td>
                  </tr>
                )}
                {visibleOrders.map((o) => (
                  <tr key={o.dbId} className="transition-colors hover:bg-raised/40">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-fg">#{o.id}</p>
                      <p className="text-xs text-fg/40">{o.date}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand-700">
                          {initials(o.customer)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-fg">{o.customer}</p>
                          <p className="truncate text-xs text-fg/45">{o.item}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-fg/65">{o.channel}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-fg">{o.total}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${o.paid ? "text-emerald-600" : "text-amber-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${o.paid ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {o.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setMenu((m) =>
                            m?.id === o.dbId ? null : { id: o.dbId, x: r.right, y: r.bottom + 6 }
                          );
                        }}
                        aria-label="Order actions"
                        className="grid h-8 w-8 place-items-center rounded-lg text-fg/40 transition-colors hover:bg-brand/8 hover:text-brand"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* row actions dropdown (fixed so it isn't clipped by the table) */}
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
                const o = orders.find((x) => x.dbId === menu.id);
                setMenu(null);
                if (o) openEdit(o);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-fg/80 transition-colors hover:bg-brand/8 hover:text-brand"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.8} />
              Edit order
            </button>
            <button
              onClick={() => {
                const o = orders.find((x) => x.dbId === menu.id);
                setMenu(null);
                if (o) setDeleteTarget(o);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              Delete order
            </button>
          </div>
        </>
      )}

      {/* filters modal */}
      <FilterOrdersModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onApply={setFilters}
      />

      {/* create / edit modal */}
      <CreateOrderModal
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
        title="Delete order"
        confirmLabel="Delete order"
      >
        Are you sure you want to delete order{" "}
        <span className="font-mono font-semibold text-fg">#{deleteTarget?.id}</span> from{" "}
        <span className="font-semibold text-fg">{deleteTarget?.customer}</span>? This
        can&apos;t be undone.
      </ConfirmDeleteModal>
    </div>
  );
}
