import Skeleton from "./Skeleton";

/**
 * Loading placeholder for a data table (Orders, Customers, …). Renders a header
 * strip plus `rows` rows, each with an avatar, a two-line primary cell, and
 * `columns - 1` trailing cells (hidden on mobile to match the responsive tables).
 */
export default function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  const widths = ["w-20", "w-16", "w-24", "w-12", "w-20"];
  const trailing = Math.max(0, columns - 1);

  return (
    <div className="surface overflow-hidden rounded-2xl" aria-busy="true">
      {/* header */}
      <div className="flex items-center gap-4 border-b border-brand/10 px-5 py-3.5">
        <Skeleton className="h-2.5 w-24 flex-1 rounded" />
        {Array.from({ length: trailing }).map((_, i) => (
          <Skeleton key={i} className={`hidden h-2.5 rounded sm:block ${widths[i % widths.length]}`} />
        ))}
      </div>

      {/* rows */}
      <div className="divide-y divide-brand/8">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40 max-w-full rounded" />
              <Skeleton className="h-2.5 w-24 rounded" />
            </div>
            {Array.from({ length: trailing }).map((_, c) => (
              <Skeleton key={c} className={`hidden h-3.5 rounded sm:block ${widths[c % widths.length]}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
