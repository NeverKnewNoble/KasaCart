"use client";

import { Trash2 } from "lucide-react";
import type { ConfirmDeleteModalProps } from "@/types/common";
import Modal from "./Modal";

/**
 * Reusable delete-confirmation dialog. Use everywhere the system needs to
 * confirm a destructive delete:
 *
 *   <ConfirmDeleteModal
 *     open={!!target}
 *     onClose={() => setTarget(null)}
 *     onConfirm={handleDelete}
 *     title="Delete product"
 *     confirmLabel="Delete product"
 *   >
 *     Are you sure you want to delete <b>{target?.name}</b>?
 *   </ConfirmDeleteModal>
 */
export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Delete",
  confirmLabel = "Delete",
  children,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand/15 bg-surface px-5 py-2.5 text-sm font-semibold text-fg/70 transition-colors hover:text-brand"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-600">
          <Trash2 className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="text-sm leading-relaxed text-fg/65">{children}</div>
      </div>
    </Modal>
  );
}
