import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type CmStatCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
};

export const CmStatCard = forwardRef<HTMLDivElement, CmStatCardProps>(function CmStatCard(
  { title, value, description, icon, trend, className, ...rest },
  ref,
) {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;

  return (
    <div ref={ref} className={cn("cm-stat-card", className)} {...rest}>
      <div className="cm-stat-card-header">
        <span className="cm-stat-card-title">{title}</span>
        {icon && <div className="cm-stat-card-icon">{icon}</div>}
      </div>

      <div className="cm-stat-card-body">
        <span className="cm-stat-card-value">{value}</span>
        {description && <span className="cm-stat-card-description">{description}</span>}
      </div>

      {trend && (
        <div className="cm-stat-card-trend">
          <span
            className={cn(
              "cm-stat-card-trend-value",
              isPositiveTrend && "cm-stat-card-trend-positive",
              isNegativeTrend && "cm-stat-card-trend-negative",
            )}
          >
            {isPositiveTrend && "↑"} {isNegativeTrend && "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="cm-stat-card-trend-label">{trend.label}</span>
        </div>
      )}
    </div>
  );
});
CmStatCard.displayName = "CmStatCard";
