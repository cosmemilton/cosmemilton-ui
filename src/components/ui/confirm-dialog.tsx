"use client";

import { ReactNode } from "react";
import { CmDialog, CmDialogTone } from "./dialog.js";
import { CmButton } from "./button.js";
import type { CmButtonTone } from "./button.js";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "info";
  submitting?: boolean;
  submittingLabel?: string;
};

const toneToDialogTone: Record<
  NonNullable<ConfirmDialogProps["tone"]>,
  CmDialogTone
> = {
  danger: "danger",
  warning: "warning",
  info: "default",
};

const toneToButtonTone: Record<
  NonNullable<ConfirmDialogProps["tone"]>,
  CmButtonTone
> = {
  danger: "danger",
  warning: "warning",
  info: "primary",
};

export function CmConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  tone = "danger",
  submitting = false,
  submittingLabel,
}: ConfirmDialogProps) {
  return (
    <CmDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      tone={toneToDialogTone[tone]}
      footer={
        <div className="cm-confirm-dialog__footer">
          <CmButton variant="outline" onClick={onClose} disabled={submitting}>
            {cancelLabel}
          </CmButton>
          <CmButton
            tone={toneToButtonTone[tone]}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? (submittingLabel ?? "Aguarde...") : confirmLabel}
          </CmButton>
        </div>
      }
    >
      {children}
    </CmDialog>
  );
}
