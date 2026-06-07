"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Order, OrderLineItem, CreateOrderModalProps } from "@/types/orders";
import Products from "@/services/products";
import { searchByPrefix } from "@/utils/general";
import { startingPrice } from "@/utils/productUtils";
import { orderToInput, productToRow } from "@/utils/mappers";
import Modal from "./Modal";

/** A product the order picker can add (name + unit price in cedis). */
type PickerItem = { name: string; price: number; color?: string };

const CHANNELS = ["WhatsApp", "Instagram", "TikTok", "Facebook", "Snapchat"];
const STATUSES: Order["status"][] = ["Pending", "Confirmed", "Packed", "Delivered"];
const PAYMENT_METHODS: NonNullable<Order["payment"]>[] = ["Cash on delivery", "Mobile Money"];
const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

const parsePrice = (s: string) => parseInt(s.replace(/[^\d]/g, ""), 10) || 0;

/** Rebuild line items from an existing order's "item" string (edit flow). */
function buildLines(o: Order | null | undefined, catalog: PickerItem[]): OrderLineItem[] {
  if (!o) return [];
  const segs = o.item.split(",").map((s) => s.trim()).filter(Boolean);
  const lines = segs.map((seg) => {
    const m = seg.match(/^(.*?)(?:\s*×\s*(\d+))?$/);
    const name = m?.[1]?.trim() || seg;
    const qty = parseInt(m?.[2] || "1", 10) || 1;
    const prod = catalog.find((p) => p.name.toLowerCase() === name.toLowerCase());
    return { name, qty, price: prod ? prod.price : 0 };
  });
  // single unknown product → derive its unit price from the order total
  if (lines.length === 1 && lines[0].price === 0) {
    lines[0].price = Math.round(parsePrice(o.total) / (lines[0].qty || 1));
  }
  return lines;
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

export default function CreateOrderModal({
  open,
  onClose,
  mode = "create",
  initialData,
  onSubmit,
}: CreateOrderModalProps) {
  const isEdit = mode === "edit";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [channel, setChannel] = useState("WhatsApp");
  const [payment, setPayment] = useState<NonNullable<Order["payment"]>>("Cash on delivery");
  const [status, setStatus] = useState<Order["status"]>("Pending");
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLineItem[]>([]);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  // The store's real catalogue (loaded the first time the modal opens). A ref
  // mirrors it so the form-seed effect can read it without re-seeding on load.
  const [catalog, setCatalog] = useState<PickerItem[]>([]);
  const catalogRef = useRef<PickerItem[]>([]);
  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    if (!open || catalog.length) return;
    (async () => {
      const list = await Products.listProducts();
      if (!list) return;
      setCatalog(
        list.map((dto) => ({
          name: dto.name,
          price: startingPrice(productToRow(dto)),
          color: dto.color ?? undefined,
        }))
      );
    })();
  }, [open, catalog.length]);

  // (re)seed the form whenever the modal opens
  useEffect(() => {
    if (!open) return;
    const o = initialData;
    const [first, ...rest] = (o?.customer || "").split(" ");
    setFirstName(first || "");
    setLastName(rest.join(" "));
    setEmail("");
    setPhone("");
    setAddress(o?.address || "");
    setCity(o?.city || "");
    setRegion(o?.region || "");
    setChannel(o?.channel || "WhatsApp");
    setPayment(o?.payment || "Cash on delivery");
    setStatus(o?.status || "Pending");
    setPaid(o?.paid ?? false);
    setNotes("");
    setLines(buildLines(o, catalogRef.current));
    setQuery("");
    setPickerOpen(false);
  }, [open, initialData]);

  const available = catalog.filter((p) => !lines.some((l) => l.name === p.name));
  const filtered = searchByPrefix(available, query, (p) => p.name);

  const addProduct = (p: PickerItem) => {
    setLines((ls) =>
      ls.some((l) => l.name === p.name)
        ? ls
        : [...ls, { name: p.name, price: p.price, qty: 1 }]
    );
    setQuery("");
    setPickerOpen(false);
  };

  const setQty = (i: number, v: string) =>
    setLines((ls) =>
      ls.map((l, idx) => (idx === i ? { ...l, qty: Math.max(1, parseInt(v, 10) || 1) } : l))
    );

  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const canSubmit = firstName.trim().length > 0 && lines.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const item = lines.map((l) => (l.qty > 1 ? `${l.name} ×${l.qty}` : l.name)).join(", ");
    const customer = `${firstName.trim()} ${lastName.trim()}`.trim();
    // UI order (for optimistic display) + the structured payload the API needs.
    const order: Order = {
      id: initialData?.id ?? "",
      customer,
      item,
      channel,
      total: `₵${total.toLocaleString()}`,
      paid,
      payment,
      status,
      date: initialData?.date ?? "",
      address: address.trim(),
      city: city.trim(),
      region,
    };
    const payload = orderToInput({
      lines,
      customerName: customer,
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      channel,
      status,
      payment,
      paid,
      address: address.trim(),
      city: city.trim(),
      region,
      notes: notes.trim(),
    });
    onSubmit(order, payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit order" : "Create new order"}
      subtitle={
        isEdit
          ? "Update the details of this order."
          : "Add an order to your dashboard manually."
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
            form="create-order-form"
            disabled={!canSubmit}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isEdit ? "Save changes" : "Create order"}
          </button>
        </>
      }
    >
      <form id="create-order-form" onSubmit={handleSubmit} className="space-y-5">
        {/* customer name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              className="input"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Ama"
            />
          </Field>
          <Field label="Last name">
            <input
              className="input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Mensah"
            />
          </Field>
        </div>

        {/* contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ama@gmail.com"
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +233 24 555 0142"
            />
          </Field>
        </div>

        {/* delivery address */}
        <Field label="Street address">
          <input
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 12 Oxford Street, Osu"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Accra"
            />
          </Field>
          <Field label="Region">
            <select
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Select region…</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* preferred payment method */}
        <Field label="Preferred payment method">
          <select
            className="input"
            value={payment}
            onChange={(e) => setPayment(e.target.value as NonNullable<Order["payment"]>)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        {/* products */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg/70">Products</label>

          {/* searchable picker */}
          <div className="relative">
            <input
              className="input"
              placeholder="Search products to add…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPickerOpen(true);
              }}
              onFocus={() => setPickerOpen(true)}
              onBlur={() => setTimeout(() => setPickerOpen(false), 120)}
            />
            {pickerOpen && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-brand/12 bg-surface py-1 shadow-[0_20px_45px_-20px_rgba(10,28,77,0.5)]">
                {filtered.length === 0 ? (
                  <p className="px-3.5 py-3 text-sm text-fg/45">No matching products</p>
                ) : (
                  filtered.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => addProduct(p)}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-colors hover:bg-brand/8"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-6 w-6 shrink-0 rounded-md"
                          style={{ background: p.color ?? "#1d4ed8" }}
                        />
                        <span className="font-medium text-fg">{p.name}</span>
                      </span>
                      <span className="font-mono text-xs text-fg/55">₵{p.price}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* line items */}
          <div className="mt-3 overflow-hidden rounded-xl border border-brand/10">
            {lines.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-fg/45">
                No products added yet. Search above to add one.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand/10 text-xs uppercase tracking-wide text-fg/40">
                    <th className="px-4 py-2.5 font-semibold">Product</th>
                    <th className="px-4 py-2.5 font-semibold">Price</th>
                    <th className="px-4 py-2.5 font-semibold">Qty</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                    <th className="w-10 px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/8">
                  {lines.map((l, i) => (
                    <tr key={l.name}>
                      <td className="px-4 py-2.5 font-medium text-fg">{l.name}</td>
                      <td className="px-4 py-2.5 font-mono text-fg/70">₵{l.price}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={1}
                          value={l.qty}
                          onChange={(e) => setQty(i, e.target.value)}
                          className="input h-9 w-16 px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-fg">
                        ₵{(l.price * l.qty).toLocaleString()}
                      </td>
                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          aria-label={`Remove ${l.name}`}
                          className="grid h-7 w-7 place-items-center rounded-lg text-fg/40 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* channel / status / payment */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Sales channel">
            <select
              className="input"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order status">
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as Order["status"])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payment">
            <select
              className="input"
              value={paid ? "paid" : "unpaid"}
              onChange={(e) => setPaid(e.target.value === "paid")}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
        </div>

        <Field label="Notes (optional)">
          <textarea
            className="input min-h-20 resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Size, colour, special instructions…"
          />
        </Field>

        {/* total summary */}
        <div className="flex items-center justify-between rounded-xl bg-raised/60 px-4 py-3">
          <span className="text-sm font-medium text-fg/60">Order total</span>
          <span className="font-display text-xl font-extrabold text-fg">
            ₵{total.toLocaleString()}
          </span>
        </div>
      </form>
    </Modal>
  );
}
