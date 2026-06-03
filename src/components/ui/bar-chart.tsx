"use client";

import { useMemo } from "react";
import { cn } from "../../lib/utils.js";

type BarChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

export type CmBarChartProps = {
  data: BarChartDataPoint[];
  height?: number;
  orientation?: "vertical" | "horizontal";
  showValues?: boolean;
  showGrid?: boolean;
  className?: string;
};

export function CmBarChart({
  data,
  height = 300,
  orientation = "vertical",
  showValues = true,
  showGrid = true,
  className,
}: CmBarChartProps) {
  const { bars } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);

    return {
      bars: data.map((d) => ({
        ...d,
        percentage: (d.value / max) * 100,
      })),
    };
  }, [data]);

  if (orientation === "horizontal") {
    return (
      <div className={cn("cm-bar-chart cm-bar-chart--horizontal", className)}>
        {bars.map((bar, i) => (
          <div key={i} className="cm-bar-chart__row">
            <div className="cm-bar-chart__row-header">
              <span className="cm-bar-chart__label">{bar.label}</span>
              {showValues && (
                <span className="cm-bar-chart__value">{bar.value.toLocaleString("pt-BR")}</span>
              )}
            </div>
            <div className="cm-bar-chart__track">
              <div
                className="cm-bar-chart__fill cm-bar-chart__fill--horizontal"
                style={{
                  width: `${bar.percentage}%`,
                  backgroundColor: bar.color || "var(--color-primary)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("cm-bar-chart cm-bar-chart--vertical", className)}
      style={{ height: `${height}px` }}
    >
      {showGrid && (
        <div className="cm-bar-chart__grid" aria-hidden="true">
          {[0, 0.25, 0.5, 0.75, 1].map((_, i) => (
            <div key={i} className="cm-bar-chart__grid-line" />
          ))}
        </div>
      )}

      <div className="cm-bar-chart__plot">
        {bars.map((bar, i) => (
          <div key={i} className="cm-bar-chart__column">
            <div className="cm-bar-chart__column-inner">
              {showValues && (
                <span className="cm-bar-chart__value cm-bar-chart__value--above">
                  {bar.value.toLocaleString("pt-BR")}
                </span>
              )}
              <div
                className="cm-bar-chart__fill cm-bar-chart__fill--vertical"
                style={{
                  height: `${(bar.percentage / 100) * (height - 60)}px`,
                  backgroundColor: bar.color || "var(--color-primary)",
                }}
              />
            </div>
            <span className="cm-bar-chart__label cm-bar-chart__label--axis">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
CmBarChart.displayName = "CmBarChart";
