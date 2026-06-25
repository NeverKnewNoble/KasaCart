"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fragment } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  Plus,
  Share2,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import { dashboardWeek as week, orderStatusStyle as statusStyle } from "@/utils/SampleDate";
import Skeleton from "@/components/ui_components/Skeleton";
import Dashboard from "@/services/dashboard";
import { initials } from "@/utils/general";
import { toCedis, shortDate } from "@/utils/mappers";
import { formatCedis } from "@/utils/productUtils";
import { toast } from "sonner";
import type { DashboardData } from "@/types/dashboard";
import type { OrderStatus } from "@/types/api";

// Pipeline stages in fulfilment order, with display labels + colours.
const STAGES: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "New", color: "#f59e0b" },
  { status: "confirmed", label: "Confirmed", color: "#1d4ed8" },
  { status: "packed", label: "Packed", color: "#7c3aed" },
  { status: "delivered", label: "Delivered", color: "#059669" },
];
// Dashboard "Recent orders" badge label (pending → "New").
const BADGE: Record<OrderStatus, "New" | "Confirmed" | "Packed" | "Delivered"> = {
  pending: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  delivered: "Delivered",
  cancelled: "New",
};
const ROW_COLORS = ["#1d4ed8", "#0ea5e9", "#7c3aed", "#db2777", "#059669"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await Dashboard.getDashboard();
      if (!d) toast.error("Couldn't load your dashboard.");
      else setData(d);
      setLoading(false);
    })();
  }, []);

  const kpis = data
    ? [
        {
          label: "Awaiting fulfilment",
          value: String(data.kpis.awaitingFulfilment),
          rub: "to pack & deliver",
          icon: Clock,
        },
        {
          label: "Products live",
          value: String(data.kpis.productsLive),
          sub: "in your storefront",
          icon: Tag,
        },
      ]
    : [];
  const pipelineCount = (s: OrderStatus) =>
    data?.pipeline.find((p) => p.status === s)?.count ?? 0;
  const topMaxUnits = Math.max(1, ...(data?.topProducts ?? []).map((p) => p.unitsSold));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-fg">
          Welcome back
        </h1>
        <p className="mt-1 text-fg/55">Here&apos;s what&apos;s happening in your store today.</p>
      </div>

      {/* ---- top bento: revenue spotlight + KPI tiles ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* spotlight */}
        <div className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white sm:p-8 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/70">Total revenue</p>
              <p className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                {data ? formatCedis(toCedis(data.kpis.revenuePesewas)) : "—"}
              </p>
              <p className="mt-2 text-sm text-white/75">
                {data ? `${data.kpis.ordersCount} orders all-time` : "Loading…"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" strokeWidth={2.2} />
              Live
            </span>
          </div>

          {/* weekly bars (illustrative) */}
          <div className="mt-7 flex items-end gap-2.5" style={{ height: "84px" }}>
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-white/25" style={{ height: `${d.value}%` }}>
                    <div
                      className="h-full w-full rounded-t-md bg-white"
                      style={{ opacity: 0.35 + (d.value / 100) * 0.65 }}
                    />
                  </div>
                </div>
                <span className="text-[0.7rem] font-medium text-white/60">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Add product
            </Link>
            <Link
              href="/storefront"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
              Share store
            </Link>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="flex flex-col gap-4">
          {(loading ? [0, 1] : kpis).map((k, i) =>
            typeof k === "number" ? (
              <Skeleton key={i} className="min-h-28 flex-1 rounded-3xl" />
            ) : (
              <div
                key={k.label}
                className="flex flex-1 flex-col justify-between rounded-3xl surface p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/8 text-brand">
                    <k.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="text-xs font-medium text-fg/45">{k.sub}</span>
                </div>
                <div className="mt-4">
                  <p className="font-display text-3xl font-extrabold tracking-tight text-fg">
                    {k.value}
                  </p>
                  <p className="mt-0.5 text-sm text-fg/55">{k.label}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ---- fulfilment pipeline ---- */}
      <div className="rounded-3xl surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-fg">Order pipeline</h2>
          <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            Manage
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {STAGES.map((p, i) => (
            <Fragment key={p.status}>
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-raised/50 px-4 py-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                <div>
                  <p className="font-display text-2xl font-extrabold leading-none text-fg">
                    {pipelineCount(p.status)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-fg/55">{p.label}</p>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <ChevronRight className="hidden h-5 w-5 shrink-0 text-fg/25 sm:block" strokeWidth={2} />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ---- recent orders + top products ---- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl surface">
            <div className="flex items-center justify-between border-b border-brand/10 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-fg">Recent orders</h2>
              <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                View all
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
            {data && data.recentOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-fg/45">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-brand/8">
                {(data?.recentOrders ?? []).map((o, i) => (
                  <li key={o.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-raised/40">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white"
                      style={{ background: ROW_COLORS[i % ROW_COLORS.length] }}
                    >
                      {initials(o.customerName ?? "—")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg">{o.customerName ?? "—"}</p>
                      <p className="truncate text-xs text-fg/50">{o.itemSummary || "—"}</p>
                    </div>
                    <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block ${statusStyle[BADGE[o.status]]}`}>
                      {BADGE[o.status]}
                    </span>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-fg">{formatCedis(toCedis(o.totalPesewas))}</p>
                      <p className="text-xs text-fg/40">{shortDate(o.placedAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* top products with relative bars */}
        <div className="rounded-3xl surface p-5">
          <h2 className="font-display text-lg font-bold text-fg">Top products</h2>
          {data && data.topProducts.length === 0 ? (
            <p className="mt-5 text-sm text-fg/45">No sales yet.</p>
          ) : (
            <ul className="mt-5 space-y-5">
              {(data?.topProducts ?? []).map((p) => (
                <li key={p.productName}>
                  <div className="flex items-center justify-between">
                    <p className="truncate pr-2 text-sm font-semibold text-fg">{p.productName}</p>
                    <p className="shrink-0 font-mono text-sm font-semibold text-fg">
                      {formatCedis(toCedis(p.revenuePesewas))}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand/8">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(p.unitsSold / topMaxUnits) * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs text-fg/45">{p.unitsSold} sold</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
