import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmDensityClass,
  type CmComponentTone,
  type CmDensity,
} from "./types.js";

export type CmMetricCardAccent = "none" | "left" | "top";

export type CmMetricCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  tone?: CmComponentTone;
  accent?: CmMetricCardAccent;
  density?: CmDensity;
  interactive?: boolean;
  loading?: boolean;
};

export function CmMetricCard({
  accent = "none",
  className,
  density,
  description,
  footer,
  icon,
  interactive = false,
  loading = false,
  meta,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  title,
  tone = "default",
  value,
  ...props
}: CmMetricCardProps) {
  const clickable = Boolean(onClick || interactive);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (!onClick || event.defaultPrevented) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event as unknown as MouseEvent<HTMLDivElement>);
    }
  }

  return (
    <div
      className={cn(
        "cm-metric-card",
        `cm-metric-card--tone-${tone}`,
        accent !== "none" && `cm-metric-card--accent-${accent}`,
        clickable && "cm-metric-card--interactive",
        loading && "cm-metric-card--loading",
        cmDensityClass(density),
        className,
      )}
      role={onClick ? "button" : role}
      tabIndex={onClick ? tabIndex ?? 0 : tabIndex}
      aria-busy={loading || undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className="cm-metric-card__header">
        <span className="cm-metric-card__title">{title}</span>
        {icon ? <span className="cm-metric-card__icon">{icon}</span> : null}
      </div>
      <div className="cm-metric-card__body">
        <span className="cm-metric-card__value">{loading ? "..." : value}</span>
        {description ? (
          <span className="cm-metric-card__description">{description}</span>
        ) : null}
      </div>
      {(meta || footer) ? (
        <div className="cm-metric-card__footer">
          {meta ? <span className="cm-metric-card__meta">{meta}</span> : null}
          {footer}
        </div>
      ) : null}
    </div>
  );
}
