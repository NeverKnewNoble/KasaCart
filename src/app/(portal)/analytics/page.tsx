import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import ComingSoon from "@/components/ui_components/ComingSoon";
import {
  analyticsKpis as kpis,
  analyticsSecondary as secondary,
  analyticsMonths as months,
  salesChannels as channels,
  orderStatusBreakdown as statusBreakdown,
  analyticsTopProducts as topProducts,
} from "@/utils/SampleDate";
import { sumBy, maxBy } from "@/utils/general";

const statusTotal = sumBy(statusBreakdown, (x) => x.count);
const maxSold = maxBy(topProducts, (p) => p.sold);

export default function AnalyticsPage() {
  return (
    <ComingSoon
      title="Analytics"
      message="We're putting the finishing touches on your store insights. Check back shortly."
    >
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="How your store is performing across channels."
        action={
          <button className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-4 py-2.5 text-sm font-semibold text-fg/80 transition-colors hover:border-brand/40 hover:text-brand">
            Last 12 months
            <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
          </button>
        }
      />

      {/* primary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface rounded-2xl p-5">
            <p className="text-sm text-fg/55">{k.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-fg">{k.value}</p>
            <p className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${k.up ? "text-emerald-600" : "text-rose-500"}`}>
              {k.up ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />}
              {k.delta} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* secondary metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {secondary.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface flex items-center gap-4 rounded-2xl p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/8 text-brand">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold text-fg">{value}</p>
              <p className="text-sm text-fg/55">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* revenue + channels */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-fg">Revenue</h2>
              <p className="text-sm text-fg/50">Monthly, last 12 months</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> +18%
            </span>
          </div>
          <div className="mt-8 flex items-end justify-between gap-1.5" style={{ height: "180px" }}>
            {months.map((d) => (
              <div key={d.m} className="group flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-brand/15 transition-colors group-hover:bg-brand/25"
                    style={{ height: `${d.v}%` }}
                  >
                    <div className="h-full w-full rounded-t-md bg-brand" style={{ opacity: 0.25 + (d.v / 100) * 0.75 }} />
                  </div>
                </div>
                <span className="text-[0.65rem] font-medium text-fg/40">{d.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-fg">Sales by channel</h2>
          <p className="text-sm text-fg/50">Where your orders come from</p>
          <ul className="mt-6 space-y-5">
            {channels.map((c) => (
              <li key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-fg">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-fg">{c.pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand/8">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* top products + orders by status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface rounded-2xl p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-fg">Best sellers</h2>
          <p className="text-sm text-fg/50">By units sold, this period</p>
          <ul className="mt-6 space-y-5">
            {topProducts.map((p, i) => (
              <li key={p.name}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand/8 font-mono text-xs font-bold text-brand">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-fg">{p.name}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-fg">{p.revenue}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 pl-8.5">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand/8">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(p.sold / maxSold) * 100}%` }} />
                  </div>
                  <span className="shrink-0 text-xs text-fg/45">{p.sold} sold</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-fg">Orders by status</h2>
          <p className="text-sm text-fg/50">{statusTotal} orders total</p>
          <ul className="mt-6 space-y-4">
            {statusBreakdown.map((s) => (
              <li key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-fg">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-semibold text-fg">{s.count}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand/8">
                  <div className="h-full rounded-full" style={{ width: `${(s.count / statusTotal) * 100}%`, background: s.color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </ComingSoon>
  );
}
