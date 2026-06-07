"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App toaster (shadcn-style wrapper around sonner). Mounted once in the root
 * layout; fire toasts anywhere with `import { toast } from "sonner"`.
 *
 * Themed to the KasaCart design (rounded, brand-ish). The app's dark mode is a
 * `.dark` class on a nested div, while toasts portal to <body>, so we keep the
 * toaster light here.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-brand/10",
        },
      }}
      {...props}
    />
  );
}
