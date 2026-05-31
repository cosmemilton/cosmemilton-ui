"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue } from "./types.js";
import type { CSSProperties } from "react";

type ChartDatum = {
  label: string;
  value: number;
  color?: string;
};

type ChartProps = {
  data: ChartDatum[];
  maxValue?: number;
  height?: string | number;
  className?: string;
};

type ChartStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export function CmChart({ data, maxValue, height, className }: ChartProps) {
  const safeMax = maxValue ?? Math.max(...data.map((item) => item.value), 1);
  const chartStyle: ChartStyle | undefined = height
    ? { "--cm-chart-height": cmSizeValue(height) }
    : undefined;

  return (
    <div className={cn("cm-chart", className)} style={chartStyle}>
      <div className="cm-chart__bars">
        {data.map((item) => {
          const height = Math.round((item.value / safeMax) * 100);
          const color = item.color ?? "var(--color-primary)";
          return (
            <div key={item.label} className="cm-chart__item">
              <Bar heightPercentage={height} color={color} label={`${item.label}: ${item.value}`} />
              <span className="cm-chart__label">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Bar({ heightPercentage, color, label }: { heightPercentage: number; color: string; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty("height", `${heightPercentage}%`);
      ref.current.style.setProperty("background-color", color);
    }
  }, [heightPercentage, color]);

  return (
    <div
      ref={ref}
      aria-label={label}
      className="cm-chart__bar"
    />
  );
}
CmChart.displayName = "CmChart";
