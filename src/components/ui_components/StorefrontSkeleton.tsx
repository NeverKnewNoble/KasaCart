import Skeleton from "@/components/ui_components/Skeleton";

/**
 * Loading skeleton for the portal Storefront editor — mirrors the page
 * layout (header, store-link card, settings cards, actions, live preview)
 * while the seller's store loads.
 */
export default function StorefrontSkeleton() {
  return (
    <div className="space-y-6">
      {/* page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>

      {/* store link */}
      <div className="surface flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-44 rounded-full" />
          <Skeleton className="h-4 w-56 rounded" />
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>

      {/* settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* store details */}
        <div className="surface space-y-5 rounded-2xl p-6">
          <Skeleton className="h-6 w-32 rounded-lg" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* brand & theme */}
        <div className="surface space-y-5 rounded-2xl p-6">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="flex flex-wrap items-center gap-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-full" />
            ))}
            <Skeleton className="h-9 w-48 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>

      {/* actions */}
      <div className="flex justify-end gap-2.5">
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>

      {/* live preview */}
      <div className="surface rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <div className="mt-6 flex flex-col items-stretch gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <div className="mx-auto w-full max-w-65 shrink-0 space-y-3 lg:mx-0">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="aspect-393/852 w-full rounded-[2.6rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}
