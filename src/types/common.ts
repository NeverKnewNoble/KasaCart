import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Props for the reusable delete-confirmation modal used across the system. */
export type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string; /** Heading, e.g. "Delete order". Defaults to "Delete". */
  confirmLabel?: string; /** Confirm button label. Defaults to "Delete". */
  children: ReactNode; /** The descriptive message / warning body. */
};

/** Props for the reusable empty-state shown when a list/grid has no items. */
export type EmptyStateProps = {
  /** Icon shown in the badge (lucide). Defaults to an inbox. */
  icon?: LucideIcon;
  /** Heading, e.g. "No products yet". */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Optional call-to-action(s) — a button or link node. */
  action?: ReactNode;
  /** "card" wraps it in a bordered surface (default); "bare" is just the centred content. */
  variant?: "card" | "bare";
  /** Visual scale of the icon + spacing. Defaults to "md". */
  size?: "sm" | "md";
  /** Extra classes for the outer wrapper. */
  className?: string;
};
