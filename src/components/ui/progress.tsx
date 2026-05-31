"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";

export type CmProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  label?: string;
};

export const CmProgress = forwardRef<HTMLDivElement, CmProgressProps>(
  function CmProgress({ value, max = 100, className, label, ...rest }, ref) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const hasVisibleLabel = Boolean(label?.trim());
  const progressLabel = hasVisibleLabel ? label : "Progresso";

  return (
    <div ref={ref} className={cn("cm-progress", className)} {...rest}>
      {hasVisibleLabel ? (
        <span className="cm-progress__label">{label}</span>
      ) : null}
      <progress
        value={safeValue}
        max={max}
        aria-label={progressLabel}
        className="cm-progress__bar"
      />
    </div>
  );
});
CmProgress.displayName = "CmProgress";
