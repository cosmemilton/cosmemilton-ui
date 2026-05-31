"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  label?: string;
};

export const CmProgress = forwardRef<HTMLDivElement, ProgressProps>(
  function CmProgress({ value, max = 100, className, label }, ref) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const hasVisibleLabel = Boolean(label?.trim());
  const progressLabel = hasVisibleLabel ? label : "Progresso";

  return (
    <div ref={ref} className={cn("cm-progress", className)}>
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
