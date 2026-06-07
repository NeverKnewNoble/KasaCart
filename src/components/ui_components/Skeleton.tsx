/**
 * Base skeleton block — a theme-aware shimmer (see `.skeleton` in globals.css).
 * Compose into shaped loaders; set size + rounding via `className`.
 *
 * @example <Skeleton className="h-4 w-24 rounded" />
 */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}
