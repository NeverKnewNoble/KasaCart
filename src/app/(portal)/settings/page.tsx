"use client";

import { useEffect, useState } from "react";
import { Building2, Bell, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import Settings from "@/services/settings";
import { currencies } from "@/utils/settingsUtils";
import { toastResult } from "@/utils/notify";
import { toast } from "sonner";

/** Controlled switch (matches the look of utils/settingsUtils Toggle). */
function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="h-6 w-11 rounded-full bg-fg/15 transition-colors peer-checked:bg-brand" />
      <span className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

const NOTIF_FIELDS = [
  { key: "newOrder", label: "New order placed", desc: "Get notified the moment a customer checks out" },
  { key: "lowStock", label: "Low stock alerts", desc: "When a product drops below your threshold" },
  { key: "newCustomer", label: "New customer", desc: "When someone orders from your store for the first time" },
  { key: "weeklySummary", label: "Weekly summary", desc: "A recap of your sales every Monday" },
] as const;

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [location, setLocation] = useState("");
  const [notif, setNotif] = useState({
    newOrder: true,
    lowStock: true,
    newCustomer: false,
    weeklySummary: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [store, prefs] = await Promise.all([
        Settings.getStore(),
        Settings.getNotifications(),
      ]);
      if (store) {
        setName(store.name);
        setSupportPhone(store.supportPhone ?? "");
        setCurrency(store.currencyCode);
        setLocation(store.location ?? "");
      } else {
        toast.error("Couldn't load your settings.");
      }
      if (prefs) {
        setNotif({
          newOrder: prefs.newOrder,
          lowStock: prefs.lowStock,
          newCustomer: prefs.newCustomer,
          weeklySummary: prefs.weeklySummary,
        });
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const [storeRes] = await Promise.all([
      Settings.updateStore({ name, supportPhone, currencyCode: currency, location }),
      Settings.updateNotifications(notif),
    ]);
    setSaving(false);
    toastResult(storeRes, "Settings saved");
  };

  const closeStore = async () => {
    const res = await Settings.updateStore({ isPublished: false });
    toastResult(res, "Your store is now closed");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your store and account preferences." />

      {/* store details */}
      <div className="surface rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-brand" strokeWidth={1.8} />
          <h2 className="font-display text-lg font-bold text-fg">Store details</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Store name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Support phone</label>
            <input className="input" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">Currency</label>
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg/70">City</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
      </div>

      {/* notifications */}
      <div className="surface rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand" strokeWidth={1.8} />
          <h2 className="font-display text-lg font-bold text-fg">Notifications</h2>
        </div>
        <ul className="mt-5 divide-y divide-brand/8">
          {NOTIF_FIELDS.map((n) => (
            <li key={n.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-fg">{n.label}</p>
                <p className="text-xs text-fg/50">{n.desc}</p>
              </div>
              <Switch
                checked={notif[n.key]}
                onChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* danger zone */}
      <div className="rounded-2xl border border-rose-300/60 bg-rose-500/5 p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
          <h2 className="font-display text-lg font-bold text-fg">Danger zone</h2>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg/60">Closing your store hides it from customers and stops new orders.</p>
          <button
            onClick={closeStore}
            className="shrink-0 rounded-full border border-rose-400/60 bg-surface px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/10"
          >
            Close store
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2.5">
        <button className="rounded-full border border-brand/15 bg-surface px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
