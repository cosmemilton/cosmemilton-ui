"use client";

import { CSSProperties, ReactNode, useState } from "react";
import { cn } from "../../lib/utils.js";

const toneMap = {
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

export type CmAlertTone = keyof typeof toneMap;

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

export function CmAlert({
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
}: CmAlertProps) {
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
        <button
          type="button"
          className="cm-alert__close"
          aria-label={closeLabel}
          onClick={dismiss}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
