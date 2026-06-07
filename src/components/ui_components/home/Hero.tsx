import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Store, ShoppingBag } from "lucide-react";
import Navbar from "./Navbar";
import { heroPlatforms as platforms, heroAvatars } from "@/utils/SampleDate";

const valueProps = ["No website needed", "Set up in minutes", "Free to start"];
const funnelChannels = platforms.slice(0, 4);

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 pb-12 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-2 lg:gap-10">
        {/* ---------- copy ---------- */}
        <div className="text-center lg:text-left">
          <h1 className="mt-7 font-display text-[2.7rem] font-extrabold leading-[0.98] tracking-tight text-ink sm:text-6xl">
            Funnel your followers into{" "}
            <span className="relative whitespace-nowrap text-brand">
              paid orders
              <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none" aria-hidden>
                <path d="M2 10C66 4 188 3 298 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-cyan" />
              </svg>
            </span>{" "}
            — through your channel of choice.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl lg:mx-0">
            Pick the channel you already love — WhatsApp, Instagram or TikTok —
            share one storefront link, and let followers order on their own while
            you track every sale from a single dashboard.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_16px_34px_-12px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
            >
              Create your free storefront
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-7 py-3.5 text-[0.95rem] font-semibold text-ink/80 transition-colors hover:border-brand/40 hover:text-brand"
            >
              See how it works
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
            {valueProps.map((v) => (
              <span key={v} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand/10 text-brand">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {v}
              </span>
            ))}
          </div>

          <div className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2.5">
              {heroAvatars.map((a) => (
                <span
                  key={a.initial}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-background font-display text-xs font-bold text-white"
                  style={{ background: a.color }}
                >
                  {a.initial}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink/55">
              Trusted by <b className="text-ink/80">2,000+</b> social sellers
            </p>
          </div>
        </div>

        {/* ---------- funnel visual ---------- */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-[0_30px_70px_-30px_rgba(10,28,77,0.45)] sm:p-7">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
              Funnel from any channel
            </p>

            {/* channels — the wide top of the funnel */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {funnelChannels.map((p) => (
                <span
                  key={p.name}
                  className="flex items-center gap-1.5 rounded-full border border-brand/10 bg-background px-3 py-1.5 text-sm font-semibold text-ink/70"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={p.color}>
                    <path d={p.path} />
                  </svg>
                  {p.name}
                </span>
              ))}
            </div>

            <div className="my-3 flex justify-center">
              <ChevronDown className="h-5 w-5 text-brand/40" strokeWidth={2.5} />
            </div>

            {/* storefront — the neck */}
            <div className="mx-auto flex w-11/12 items-center gap-3 rounded-2xl bg-brand p-4 text-white shadow-[0_14px_30px_-14px_rgba(29,78,216,0.9)]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
                <Store className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">Your storefront</p>
                <p className="truncate font-mono text-xs text-white/75">adwoascloset.kasacart.com</p>
              </div>
            </div>

            <div className="my-3 flex justify-center">
              <ChevronDown className="h-5 w-5 text-brand/40" strokeWidth={2.5} />
            </div>

            {/* orders — the output */}
            <div className="mx-auto w-9/12 rounded-2xl border border-brand/12 bg-background p-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="h-4.5 w-4.5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">New order · ₵240</p>
                  <p className="text-xs text-ink/50">Ama M. · Paid</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-semibold text-emerald-600">
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* platform auto-carousel pinned to the bottom of the screen */}
      {/* <div className="border-t border-brand/10 bg-white/60 py-7">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
          Funnel from the channels you already sell on
        </p>
        <div className="marquee-mask mt-5 overflow-hidden">
          <div className="marquee-track gap-3">
            {[...platforms, ...platforms].map((p, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2 rounded-full border border-brand/10 bg-white px-4 py-2 text-sm font-semibold text-ink/70 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={p.color}>
                  <path d={p.path} />
                </svg>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div> */}
    </section>
  );
}
