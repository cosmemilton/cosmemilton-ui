"use client";

import { ReactNode, useState } from "react";
import { CmDialog } from "./dialog";
import { CmButton } from "./button";

type AlertDialogProps = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  tone?: "danger" | "warning" | "info";
  trigger: (open: () => void) => ReactNode;
};

const toneToButtonTone = {
  info: "primary",
  warning: "warning",
  danger: "danger",
} as const;

export function CmAlertDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  tone = "info",
  trigger,
}: AlertDialogProps) {
  const [open, setOpen] = useState(false);

  const dialogToneMap: Record<
    NonNullable<AlertDialogProps["tone"]>,
    "danger" | "warning" | "default"
  > = {
    danger: "danger",
    warning: "warning",
    info: "default",
  };

  return (
    <>
      {trigger(() => setOpen(true))}
      <CmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        tone={dialogToneMap[tone]}
        portal
        footer={
          <>
            <CmButton variant="ghost" onClick={() => setOpen(false)}>
              {cancelLabel}
            </CmButton>
            <CmButton
              tone={toneToButtonTone[tone]}
              onClick={() => {
                onConfirm?.();
                setOpen(false);
              }}
            >
              {confirmLabel}
            </CmButton>
          </>
        }
      />
    </>
  );
}
