import Skeleton from "./Skeleton";

/** A single placeholder card matching the real product card (image + title + price + meta). */
function ProductCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <Skeleton className="h-40 w-full" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

/** Loading placeholder for the Products grid. */
export default function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
