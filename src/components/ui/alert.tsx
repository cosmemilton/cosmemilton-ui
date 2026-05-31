"use client";

import { forwardRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import type { CmStatusTone } from "./types.js";

const toneMap: Record<CmStatusTone, { color: string }> = {
  info: {
    color: "var(--color-info)",
  },
  success: {
    color: "var(--color-success)",
  },
  warning: {
    color: "var(--color-warning)",
  },
  danger: {
    color: "var(--color-danger)",
  },
};

export type CmAlertTone = CmStatusTone;

export type CmAlertProps = {
  title: string;
  description?: string;
  tone?: CmAlertTone;
  className?: string;
  action?: ReactNode;
  dismissible?: boolean;
  closeLabel?: string;
  onDismiss?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const CmAlert = forwardRef<HTMLDivElement, CmAlertProps>(function CmAlert(
  {
    title,
    description,
    action,
    tone = "info",
    className,
    dismissible = false,
    closeLabel = "Dispensar alerta",
    onDismiss,
    open,
    defaultOpen = true,
    onOpenChange,
  },
  ref,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const palette = toneMap[tone];
  const toneStyle = { "--cm-alert-tone": palette.color } as CSSProperties;
  const visible = open ?? uncontrolledOpen;

  function dismiss() {
    if (open === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
    onDismiss?.();
  }

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={cn("cm-alert", className)}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      style={toneStyle}
    >
      <span className="cm-alert__indicator" aria-hidden="true" />
      <div className="cm-alert__body">
        <h4 className="cm-alert__title">
          {title}
        </h4>
        {description ? (
          <p className="cm-alert__description">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="cm-alert__action">{action}</div> : null}
      {dismissible ? (
        <CmButton
          unstyled
          type="button"
          className="cm-alert__close"
          aria-label={closeLabel}
          onClick={dismiss}
        >
          ×
        </CmButton>
      ) : null}
    </div>
  );
});
CmAlert.displayName = "CmAlert";
