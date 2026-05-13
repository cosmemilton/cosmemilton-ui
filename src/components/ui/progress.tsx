"use client";

import { cn } from "../../lib/utils.js";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  label?: string;
};

export function CmProgress({ value, max = 100, className, label }: ProgressProps) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const hasVisibleLabel = Boolean(label?.trim());
  const progressLabel = hasVisibleLabel ? label : "Progresso";

  return (
    <div className={cn("cm-progress", className)}>
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
}
