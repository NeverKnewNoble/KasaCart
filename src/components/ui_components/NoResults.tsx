import { Search } from "lucide-react";
import EmptyState from "./EmptyState";
import type { EmptyStateProps } from "@/types/common";

/**
 * Empty-state preset for when a search/filter matches nothing (as opposed to a
 * list that's empty because no data exists yet — use {@link EmptyState} for that).
 *
 * A thin wrapper over EmptyState with the Search icon and sensible defaults.
 *
 * @example
 * {visible.length === 0 && (
 *   <NoResults description="Try another category or search term." />
 * )}
 */
export default function NoResults({
  title = "No results found",
  description = "Try a different search or filter.",
  action,
  variant,
  size,
  className,
}: Omit<EmptyStateProps, "icon" | "title"> & { title?: string }) {
  return (
    <EmptyState
      icon={Search}
      title={title}
      description={description}
      action={action}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
