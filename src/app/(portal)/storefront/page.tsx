"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, Palette, Upload, Check, Monitor, Smartphone, Image as ImageIcon, ShoppingBag, Plus, Pipette } from "lucide-react";
import PageHeader from "@/components/ui_components/portal/PageHeader";
import StorefrontSkeleton from "@/components/ui_components/StorefrontSkeleton";
import { storefrontThemes as themes, previewProducts } from "@/utils/SampleDate";
import { buildStoreUrl, storeDisplayUrl, useCurrentHost } from "@/utils/domain";
import Storefront from "@/services/storefront";
import { toastResult } from "@/utils/notify";
import { toast } from "sonner";
import type { StoreBrand } from "@/types/storefront"


export default function StorefrontPage() {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [handle, setHandle] = useState("");
  const [accent, setAccent] = useState(themes[0]);
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load the seller's store into the form.
  useEffect(() => {
    (async () => {
      try {
        const store = await Storefront.getStore();
        if (!store) {
          toast.error("Couldn't load your store.");
          return;
        }
        setName(store.name);
        setTagline(store.tagline ?? "");
        setHandle(store.handle);
        setAccent(store.accentColor);
        setLogo(store.logoUrl);
        setBanner(store.bannerUrl);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveStore = async () => {
    setSaving(true);
    const res = await Storefront.updateStore({
      name,
      tagline,
      handle,
      accentColor: accent,
      logoUrl: logo ?? undefined,
      bannerUrl: banner ?? undefined,
    });
    setSaving(false);
    toastResult(res, "Storefront saved");
  };

  const fileInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  // Links are built against the host we're actually running on (localhost,
  // *.vercel.app or a real domain later) — see @/utils/domain.
  const host = useCurrentHost();
  const storeUrl = buildStoreUrl(handle, host);
  const storeLabel = storeDisplayUrl(handle, host);

  const brand: StoreBrand = { name, tagline, accent, logo, banner };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBanner(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };


  if (loading) return <StorefrontSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Storefront"
        subtitle="Customise your shop and share the link where your customers already are."
        action={
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(29,78,216,0.9)] transition-transform hover:-translate-y-0.5"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={2} />
            Visit store
          </a>
        }
      />

      {/* store link */}
      <div className="surface flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Published
            </span>
            <span className="text-xs text-fg/45">Your store is live</span>
          </div>
          <p className="mt-2 truncate font-mono text-sm font-semibold text-fg">{storeLabel}</p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-brand/15 bg-surface px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.4} />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" strokeWidth={1.8} />
              Copy link
            </>
          )}
        </button>
      </div>

      {/* settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-fg">Store details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg/70">Store name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg/70">Tagline</label>
              <input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg/70">Store handle</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-brand/14 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/16">
                <span className="border-r border-brand/12 bg-raised/60 px-3 py-2.5 text-sm text-fg/55">{host}/</span>
                <input
                  className="flex-1 bg-surface px-3 py-2.5 text-sm text-fg outline-none"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="surface rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-fg">
            <Palette className="h-5 w-5 text-brand" strokeWidth={1.8} />
            Brand & theme
          </h2>

          <p className="mt-4 text-sm font-medium text-fg/70">Accent colour</p>
          <p className="mt-1 text-xs text-fg/50">
            Pick a preset below, or choose any shade from the colour wheel.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {themes.map((c) => {
              const active = c.toLowerCase() === accent.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={`Use accent ${c}`}
                  className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-105"
                  style={{ background: c, color: "#fff", boxShadow: active ? `0 0 0 2px var(--c-surface), 0 0 0 4px ${c}` : "none" }}
                >
                  {active && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
              );
            })}

            {/* custom colour picker — opens the OS colour wheel */}
            <label
              className="relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-brand/35 px-3.5 py-2 text-sm font-semibold text-fg/70 transition-colors hover:border-brand/55 hover:text-brand"
              title="Click to open the colour wheel and pick any colour"
            >
              <span
                className="h-5 w-5 rounded-full ring-1 ring-black/10"
                style={{ background: accent }}
              />
              <Pipette className="h-4 w-4" strokeWidth={1.8} />
              Pick from colour wheel
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                aria-label="Pick a custom accent colour from the colour wheel"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>

            <span className="font-mono text-xs uppercase text-fg/55">{accent}</span>
          </div>

          <p className="mt-6 text-sm font-medium text-fg/70">Logo</p>
          <div className="mt-3 flex items-center gap-4">
            <div
              className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl font-display text-xl font-extrabold text-white"
              style={{ background: logo ? undefined : accent }}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Store logo" className="h-full w-full object-contain" />
              ) : (
                (name.trim()[0] ?? "S").toUpperCase()
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand/25 px-4 py-2.5 text-sm font-semibold text-fg/65 transition-colors hover:border-brand/40 hover:text-brand"
              >
                <Upload className="h-4 w-4" strokeWidth={1.8} />
                {logo ? "Replace logo" : "Upload logo"}
              </button>
              {logo && (
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  className="text-sm font-semibold text-fg/45 transition-colors hover:text-brand"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handleLogo}
              className="hidden"
            />
          </div>

          <p className="mt-6 text-sm font-medium text-fg/70">Banner</p>
          <div className="mt-3">
            {banner ? (
              <div className="relative overflow-hidden rounded-2xl border border-brand/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner} alt="Store banner" className="h-32 w-full object-cover" />
                <div className="absolute right-3 top-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => bannerInput.current?.click()}
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-fg/80 shadow-sm transition-colors hover:text-brand"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setBanner(null)}
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition-colors hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerInput.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/20 bg-raised/40 text-fg/55 transition-colors hover:border-brand/40 hover:text-brand"
              >
                <ImageIcon className="h-6 w-6" strokeWidth={1.6} />
                <span className="text-sm font-semibold">Upload a banner</span>
                <span className="text-xs text-fg/45">Wide image — shown at the top of your store</span>
              </button>
            )}
            <input
              ref={bannerInput}
              type="file"
              accept="image/*"
              onChange={handleBanner}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2.5">
        <button className="rounded-full border border-brand/15 bg-surface px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand">
          Cancel
        </button>
        <button
          onClick={saveStore}
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* live preview — below, shown on laptop and on mobile */}
      <div className="surface rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold text-fg">Live preview</p>
            <p className="mt-1 text-sm text-fg/55">How your store looks on a laptop and on a phone.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-8 lg:flex-row lg:items-start">
          {/* laptop */}
          <div className="min-w-0 flex-1">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg/45">
              <Monitor className="h-4 w-4" strokeWidth={1.8} />
              Laptop
            </p>
            <div className="overflow-hidden rounded-2xl border border-brand/12 bg-surface shadow-[0_24px_50px_-30px_rgba(10,28,77,0.5)]">
              <div className="flex items-center gap-2 border-b border-brand/10 bg-raised/50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 truncate rounded-md bg-surface px-3 py-1 font-mono text-[0.7rem] text-fg/45">
                  {storeLabel}
                </span>
              </div>
              <StorePreview brand={brand} columns={3} />
            </div>
          </div>

          {/* mobile — iPhone 14 Pro proportions (393 × 852) */}
          <div className="mx-auto w-full max-w-65 shrink-0 lg:mx-0">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg/45">
              <Smartphone className="h-4 w-4" strokeWidth={1.8} />
              Mobile
            </p>
            <div className="rounded-[2.6rem] border-[7px] border-fg/90 bg-fg/90 shadow-[0_24px_50px_-30px_rgba(10,28,77,0.6)]">
              <div className="relative flex aspect-393/852 flex-col overflow-hidden rounded-[2.1rem] bg-surface">
                {/* dynamic island */}
                <span className="absolute left-1/2 top-2 z-20 h-4 w-16 -translate-x-1/2 rounded-full bg-fg" />
                {/* status bar */}
                <div className="h-7 shrink-0" />
                <div className="min-h-0 flex-1 overflow-hidden">
                  <StorePreview brand={brand} columns={2} compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared store render — used inside both the laptop and mobile frames  */
/* ------------------------------------------------------------------ */

function StorePreview({
  brand,
  columns,
  compact = false,
}: {
  brand: StoreBrand;
  columns: 2 | 3;
  compact?: boolean;
}) {
  const { name, tagline, accent, logo, banner } = brand;
  const pad = compact ? "px-3 pb-3.5" : "px-4 pb-4";
  const items = previewProducts.slice(0, columns === 3 ? 6 : 4);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* ---------- banner (clean image, optional) ---------- */}
      {banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner}
          alt=""
          className={`w-full shrink-0 object-cover ${compact ? "h-24" : "h-28"}`}
        />
      )}

      {/* ---------- store header ---------- */}
      <div className={`flex items-center gap-2.5 border-b border-brand/8 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl font-display text-sm font-extrabold text-white"
          style={{ background: logo ? undefined : accent }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-contain" />
          ) : (
            (name.trim()[0] ?? "S").toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-fg">{name || "Your store"}</p>
          <p className="truncate text-[0.7rem] text-fg/50">{tagline || "Your tagline"}</p>
        </div>
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raised text-fg/65">
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.9} />
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface"
            style={{ background: accent }}
          />
        </span>
      </div>

      {/* ---------- trust strip ---------- */}
      <div className="flex items-center justify-center gap-2.5 border-b border-brand/8 bg-raised/40 py-1.5 text-[0.58rem] font-medium text-fg/55">
        <span style={{ color: accent }}>Pay on delivery</span>
        <span className="text-fg/20">·</span>
        <span>Fast delivery</span>
        {!compact && (
          <>
            <span className="text-fg/20">·</span>
            <span>Secure checkout</span>
          </>
        )}
      </div>

      {/* ---------- products ---------- */}
      <div className={`flex items-center justify-between pt-3 ${compact ? "px-3" : "px-4"}`}>
        <p className="font-display text-[0.78rem] font-bold text-fg">Featured</p>
        <span className="text-[0.62rem] font-semibold" style={{ color: accent }}>
          View all
        </span>
      </div>

      <div className={`grid flex-1 content-start gap-2.5 pt-2.5 ${pad} ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {items.map((p) => (
          <div
            key={p.name}
            className="group overflow-hidden rounded-2xl border border-brand/8 bg-surface shadow-[0_6px_16px_-12px_rgba(10,28,77,0.5)] transition-shadow hover:shadow-[0_12px_24px_-14px_rgba(10,28,77,0.55)]"
          >
            <div className={`relative ${compact ? "aspect-square" : "aspect-4/3"}`} style={{ background: p.color }}>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className="absolute bottom-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 shadow-md transition-transform group-hover:scale-110"
                style={{ color: accent }}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate text-[0.7rem] font-semibold text-fg">{p.name}</p>
              <p className="mt-0.5 font-mono text-[0.66rem] font-semibold text-fg/70">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
