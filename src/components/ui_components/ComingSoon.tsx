import { Clock, Sparkles } from "lucide-react";

/**
 * Full standalone "Coming soon" screen — a clean, centered placeholder
 * for pages that aren't ready yet. It does NOT blur or render page content;
 * anything passed as children is ignored.
 *
 * Usage:
 *   <ComingSoon title="Analytics" message="Store insights are on the way." />
 */
export default function ComingSoon({
  title = "Coming soon",
  message = "We're putting the finishing touches on this. Check back shortly.",
}: {
  children?: React.ReactNode;
  title?: string;
  message?: string;
}) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12">
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* soft brand glow behind the icon */}
        <div
          className="pointer-events-none absolute -top-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl"
          aria-hidden
        />

        {/* icon with pulsing ring */}
        <span className="relative grid h-20 w-20 place-items-center rounded-3xl bg-brand text-white shadow-[0_20px_45px_-18px_rgba(29,78,216,0.85)]">
          <span className="absolute inset-0 animate-ping rounded-3xl bg-brand/40" aria-hidden />
          <Clock className="relative h-9 w-9" strokeWidth={1.8} />
        </span>

        {/* badge */}
        <span className="mt-7 inline-flex items-center gap-1.5 rounded-full border border-brand/15 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Coming soon
        </span>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-fg/55">{message}</p>

        {/* decorative progress shimmer */}
        <div className="mt-8 h-1.5 w-44 overflow-hidden rounded-full bg-brand/10">
          <div className="h-full w-1/2 rounded-full bg-brand/70" />
        </div>
      </div>
    </div>
  );
}
