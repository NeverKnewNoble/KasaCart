"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

const sizes = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

/**
 * Generic, accessible modal shell — overlay + centered panel with a header,
 * scrollable body and optional sticky footer. Closes on ESC, overlay click
 * and the X button, and locks body scroll while open.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof sizes;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-brand/10 bg-surface shadow-[0_40px_90px_-30px_rgba(10,28,77,0.55)] sm:rounded-3xl ${sizes[size]}`}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-brand/10 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold text-fg">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-fg/55">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-fg/50 transition-colors hover:bg-brand/8 hover:text-fg"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-brand/10 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
