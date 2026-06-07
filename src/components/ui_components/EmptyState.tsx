import { Inbox } from "lucide-react";
import type { EmptyStateProps } from "@/types/common";

/**
 * Reusable empty-state for when a list or grid has nothing to show.
 *
 * Matches the inline empty states already used across the app (e.g. the
 * storefront's "No products found" card): a centred icon badge, a title, an
 * optional description and an optional action.
 *
 * @example
 * // truly empty (with a CTA)
 * <EmptyState
 *   icon={ShoppingBag}
 *   title="No orders yet"
 *   description="Orders from your storefront will show up here."
 *   action={<button className="btn-primary" onClick={openCreate}>Add order</button>}
 * />
 *
 * // bare variant inside an existing surface/drawer
 * <EmptyState variant="bare" icon={Tag} title="No products yet" />
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = "card",
  size = "md",
  className = "",
}: EmptyStateProps) {
  const badge = size === "sm" ? "h-12 w-12" : "h-14 w-14";
  const glyph = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const frame =
    variant === "card" ? "surface rounded-2xl px-6 py-16" : "px-6 py-10";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${frame} ${className}`}
    >
      <span
        className={`grid place-items-center rounded-2xl bg-brand/8 text-brand ${badge}`}
      >
        <Icon className={glyph} strokeWidth={1.7} />
      </span>
      <p className="mt-4 font-display text-base font-bold text-fg">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-fg/55">{description}</p>
      )}
      {action && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action}
        </div>
      )}
    </div>
  );
}
