"use client";

import { useEffect, useState } from "react";
import { Building2, Bell, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import Settings from "@/services/settings";
import { currencies, Switch, NOTIF_FIELDS} from "@/utils/settingsUtils";
import { toastResult } from "@/utils/notify";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";



export default function SettingsPage() {
  const qc = useQueryClient();
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


  // *** LOAD SETTINGS — QUERY
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const [store, prefs] = await Promise.all([
        Settings.getStore(),
        Settings.getNotifications(),
      ]);
      if (!store || !prefs) {
        throw new Error("Failed to load settings");
      }
      return { store, prefs };
    },
  });
  
  useEffect(() => {
    if (!data) return;
    const { store, prefs } = data;
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
  }, [data])

  // *** SAVE — replaces `saving` state + save() QUERY
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const [storeRes] = await Promise.all([
        Settings.updateStore({ name, supportPhone, currencyCode: currency, location }),
        Settings.updateNotifications(notif),
      ]);
      return { storeRes };
    },
    onSuccess: ({ storeRes }) => {
      toastResult(storeRes, "Settings saved");
    },
    onError: (error) => {
      toast.error("Failed to save settings", { description: error.message });
    },
  });

  // ** CLOSE STORE — its own mutation QUERY
  const { mutate: closeStore } = useMutation({
    mutationFn: () => Settings.updateStore({ isPublished: false }),
    onSuccess: (res) => {
      toastResult(res, "Your store is now closed");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });


  // *** Operational functions
  const save = async () => {
    setSaving(true);
    const [storeRes] = await Promise.all([
      Settings.updateStore({ name, supportPhone, currencyCode: currency, location }),
      Settings.updateNotifications(notif),
    ]);
    setSaving(false);
    toastResult(storeRes, "Settings saved");
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
            onClick={() => closeStore()}
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
