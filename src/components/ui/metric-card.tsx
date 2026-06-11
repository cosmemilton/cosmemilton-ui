import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity, type CmTone } from "./types.js";

export type CmMetricCardAccent = "none" | "left" | "top";

export type CmMetricCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  tone?: CmTone;
  accent?: CmMetricCardAccent;
  density?: CmDensity;
  interactive?: boolean;
  loading?: boolean;
  /** Indicador de variação (delta). `value` em %, sinal define cor/seta. */
  trend?: {
    value: number;
    label: string;
  };
};

export const CmMetricCard = forwardRef<HTMLDivElement, CmMetricCardProps>(function CmMetricCard(
  {
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
    trend,
    value,
    ...props
  },
  ref,
) {
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
      ref={ref}
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
      tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
      aria-busy={loading || undefined}
      onClick={onClick}
      // Só anexa handlers quando há interação — mantém o componente
      // renderizável em Server Components (RSC não aceita props de função).
      onKeyDown={onClick || onKeyDown ? handleKeyDown : undefined}
      {...props}
    >
      <div className="cm-metric-card__header">
        <span className="cm-metric-card__title">{title}</span>
        {icon ? <span className="cm-metric-card__icon">{icon}</span> : null}
      </div>
      <div className="cm-metric-card__body">
        <span className="cm-metric-card__value">{loading ? "..." : value}</span>
        {description ? <span className="cm-metric-card__description">{description}</span> : null}
      </div>
      {trend ? (
        <div className="cm-metric-card__trend">
          <span
            className={cn(
              "cm-metric-card__trend-value",
              trend.value > 0 && "cm-metric-card__trend-value--positive",
              trend.value < 0 && "cm-metric-card__trend-value--negative",
            )}
          >
            {trend.value > 0 ? "↑ " : trend.value < 0 ? "↓ " : ""}
            {Math.abs(trend.value)}%
          </span>
          <span className="cm-metric-card__trend-label">{trend.label}</span>
        </div>
      ) : null}
      {meta || footer ? (
        <div className="cm-metric-card__footer">
          {meta ? <span className="cm-metric-card__meta">{meta}</span> : null}
          {footer}
        </div>
      ) : null}
    </div>
  );
});
CmMetricCard.displayName = "CmMetricCard";
