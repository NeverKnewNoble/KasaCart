"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Receipt } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import Payments from "@/services/payments";
import { freeFeatures, proFeatures } from "@/utils/SampleDate";
import { toCedis, shortDate } from "@/utils/mappers";
import { formatCedis } from "@/utils/productUtils";
import { toast } from "sonner";
import type { BillingData } from "@/types/payments";

export default function PaymentsPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);

  useEffect(() => {
    (async () => {
      const b = await Payments.getBilling();
      if (!b) toast.error("Couldn't load your billing.");
      else setBilling(b);
    })();
  }, []);

  const plan = billing?.subscription.plan ?? "free";
  const isPro = plan === "pro";
  const invoices = billing?.invoices ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & plan"
        subtitle="Manage your KasaCart subscription. (We don't process your customers' payments — only your plan.)"
      />

      {/* current plan banner */}
      <div className="surface flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/8 text-brand">
            <Sparkles className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-lg font-bold text-fg">{isPro ? "Pro" : "Free"} plan</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {billing?.subscription.status ?? "active"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-fg/55">
              {formatCedis(toCedis(billing?.subscription.pricePesewas ?? 0))} / month
              {!isPro && " · no card required"}
            </p>
          </div>
        </div>
        <p className="text-sm text-fg/45">
          {isPro ? "Thanks for being a Pro." : "You're all set on the free plan."}
        </p>
      </div>

      {/* plans */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* free */}
        <div className="rounded-2xl border-2 border-brand bg-surface p-6 shadow-[0_14px_30px_-22px_rgba(10,28,77,0.22)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-fg">Free</h3>
            {!isPro && (
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-700">
                Current plan
              </span>
            )}
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-fg">
            ₵0<span className="text-base font-semibold text-fg/45"> / month</span>
          </p>
          <ul className="mt-5 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-fg/75">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="mt-6 w-full cursor-default rounded-full border border-brand/15 bg-surface py-2.5 text-sm font-semibold text-fg/50"
          >
            {isPro ? "Free plan" : "Your current plan"}
          </button>
        </div>

        {/* pro — coming soon (blurred) */}
        <div className="relative overflow-hidden rounded-2xl border border-brand/10 bg-surface p-6">
          <div className="pointer-events-none select-none blur-[3px]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-fg">Pro</h3>
              <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-fg">
              ₵99<span className="text-base font-semibold text-fg/45"> / month</span>
            </p>
            <ul className="mt-5 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-fg/75">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white">
              Upgrade to Pro
            </button>
          </div>
          <div className="absolute inset-0 grid place-items-center bg-surface/40">
            <span className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-lg">
              Coming soon
            </span>
          </div>
        </div>
      </div>

      {/* billing history */}
      <div className="surface overflow-hidden rounded-2xl">
        <div className="border-b border-brand/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-fg">Billing history</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/8 text-brand">
              <Receipt className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <p className="mt-4 font-display text-base font-bold text-fg">No charges yet</p>
            <p className="mt-1 max-w-sm text-sm text-fg/55">
              You&apos;re on the Free plan. When you upgrade to Pro, your monthly invoices will
              show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-brand/8">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-fg">{formatCedis(toCedis(inv.amountPesewas))}</p>
                  <p className="text-xs text-fg/45">{shortDate(inv.issuedAt)}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 capitalize">
                  {inv.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
