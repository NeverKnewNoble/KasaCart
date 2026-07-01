/* ------------------------------------------------------------------ */
/* Shared store render — used inside both the laptop and mobile frames  */
/* ------------------------------------------------------------------ */
import { StoreBrand } from "@/types/storefront";
import { previewProducts } from "@/utils/SampleDate";
import { Plus, ShoppingBag } from "lucide-react";


export function StorePreview({
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
