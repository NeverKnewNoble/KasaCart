"use client";

import { useEffect, useState } from "react";
import type { FilterOrdersModalProps, Order, OrderFilters } from "@/types/orders";
import { ORDER_CHANNELS, emptyOrderFilters } from "@/utils/ordersUtils";
import Customers from "@/services/customers";
import { customerToRow } from "@/utils/mappers";
import { initials, searchByPrefix } from "@/utils/general";
import Modal from "./Modal";

const STATUSES: Order["status"][] = ["Pending", "Confirmed", "Packed", "Delivered"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-fg/70">{label}</label>
      {children}
    </div>
  );
}

export default function FilterOrdersModal({
  open,
  onClose,
  value,
  onApply,
}: FilterOrdersModalProps) {
  const [draft, setDraft] = useState<OrderFilters>(value);
  const [custOpen, setCustOpen] = useState(false);
  const [customers, setCustomers] = useState<{ name: string; color: string }[]>([]);

  // sync the draft with the applied filters whenever the modal opens
  useEffect(() => {
    if (open) {
      setDraft(value);
      setCustOpen(false);
    }
  }, [open, value]);

  // Load the store's real customers for the autocomplete (once, on first open).
  useEffect(() => {
    if (!open || customers.length) return;
    (async () => {
      const list = await Customers.listCustomers();
      if (!list) return;
      setCustomers(
        list.map((c, i) => {
          const row = customerToRow(c, i);
          return { name: row.name, color: row.color };
        })
      );
    })();
  }, [open, customers.length]);

  const set = <K extends keyof OrderFilters>(key: K, val: OrderFilters[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const matchedCustomers = searchByPrefix(customers, draft.customer, (c) => c.name);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Filter orders"
      subtitle="Narrow the list down to the orders you're after."
      footer={
        <>
          <button
            type="button"
            onClick={() => setDraft(emptyOrderFilters)}
            className="mr-auto rounded-full px-4 py-2.5 text-sm font-semibold text-fg/60 transition-colors hover:text-brand"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand/15 bg-surface px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="filter-orders-form"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
          >
            Apply filters
          </button>
        </>
      }
    >
      <form id="filter-orders-form" onSubmit={apply} className="space-y-4">
        <Field label="Order ID">
          <input
            className="input"
            value={draft.orderId}
            onChange={(e) => set("orderId", e.target.value)}
            placeholder="e.g. KC-2048"
          />
        </Field>

        <Field label="Customer">
          <div className="relative">
            <input
              className="input"
              value={draft.customer}
              onChange={(e) => {
                set("customer", e.target.value);
                setCustOpen(true);
              }}
              onFocus={() => setCustOpen(true)}
              onBlur={() => setTimeout(() => setCustOpen(false), 120)}
              placeholder="Search customers…"
            />
            {custOpen && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-brand/12 bg-surface py-1 shadow-[0_20px_45px_-20px_rgba(10,28,77,0.5)]">
                {matchedCustomers.length === 0 ? (
                  <p className="px-3.5 py-3 text-sm text-fg/45">No matching customers</p>
                ) : (
                  matchedCustomers.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => {
                        set("customer", c.name);
                        setCustOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-brand/8"
                    >
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.6rem] font-bold text-white"
                        style={{ background: c.color }}
                      >
                        {initials(c.name)}
                      </span>
                      <span className="font-medium text-fg">{c.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </Field>

        <Field label="Payment status">
          <select
            className="input"
            value={draft.paid}
            onChange={(e) => set("paid", e.target.value as OrderFilters["paid"])}
          >
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </Field>

        <Field label="Order status">
          <select
            className="input"
            value={draft.status}
            onChange={(e) => set("status", e.target.value as OrderFilters["status"])}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sales channel">
          <select
            className="input"
            value={draft.channel}
            onChange={(e) => set("channel", e.target.value)}
          >
            <option value="all">All channels</option>
            {ORDER_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  );
}
