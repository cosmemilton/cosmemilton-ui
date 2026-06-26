"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import {
  CmChartFrame,
  cmChartColor,
  type CmChartLegendItem,
  type CmChartTone,
} from "./chart-frame.js";

export type CmBarChartDataPoint = {
  label: string;
  value: number;
  color?: string;
  tone?: CmChartTone;
};

export type CmBarChartProps = {
  data: CmBarChartDataPoint[];
  height?: number;
  orientation?: "vertical" | "horizontal";
  showValues?: boolean;
  showGrid?: boolean;
  className?: string;
  frameClassName?: string;
  title?: ReactNode;
  description?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  loadingState?: ReactNode;
  emptyMessage?: ReactNode;
  emptyState?: ReactNode;
  legend?: CmChartLegendItem[] | boolean;
  valueFormat?: (value: number, point: CmBarChartDataPoint) => ReactNode;
  tooltipFormat?: (point: CmBarChartDataPoint) => string;
  accessibleTableLabel?: ReactNode;
  showAccessibleTable?: boolean;
};

function defaultValueFormat(value: number) {
  return value.toLocaleString("pt-BR");
}

function textValue(value: ReactNode, fallback: string) {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

export function CmBarChart({
  data,
  height,
  orientation = "vertical",
  showValues = true,
  showGrid = true,
  className,
  frameClassName,
  title,
  description,
  loading = false,
  loadingMessage,
  loadingState,
  emptyMessage,
  emptyState,
  legend,
  valueFormat,
  tooltipFormat,
  accessibleTableLabel,
  showAccessibleTable,
}: CmBarChartProps) {
  const chartHeight = height ?? 300;
  const frameHeight = height ?? (orientation === "vertical" ? chartHeight : undefined);
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
  const empty = data.length === 0;
  const resolvedLegend =
    legend === true
      ? bars.map((bar) => ({
          id: bar.label,
          label: bar.label,
          color: bar.color,
          tone: bar.tone,
          value: defaultValueFormat(bar.value),
        }))
      : Array.isArray(legend)
        ? legend
        : undefined;
  const table = {
    caption: accessibleTableLabel ?? title ?? "Dados do gráfico de barras",
    columns: [
      { key: "label", header: "Categoria" },
      { key: "value", header: "Valor" },
    ],
    rows: bars.map((bar) => {
      const fallback = defaultValueFormat(bar.value);
      return {
        label: bar.label,
        value: textValue(valueFormat ? valueFormat(bar.value, bar) : fallback, fallback),
      };
    }),
  };

  function renderedValue(bar: CmBarChartDataPoint) {
    return valueFormat ? valueFormat(bar.value, bar) : defaultValueFormat(bar.value);
  }

  function barColor(bar: CmBarChartDataPoint) {
    return bar.color ?? cmChartColor(bar.tone);
  }

  if (orientation === "horizontal") {
    return (
      <CmChartFrame
        className={frameClassName}
        title={title}
        description={description}
        height={frameHeight}
        loading={loading}
        loadingMessage={loadingMessage}
        loadingState={loadingState}
        empty={empty}
        emptyMessage={emptyMessage}
        emptyState={emptyState}
        legend={resolvedLegend}
        table={table}
        showAccessibleTable={showAccessibleTable}
      >
        <div className={cn("cm-bar-chart cm-bar-chart--horizontal", className)}>
          {bars.map((bar, i) => (
            <div key={i} className="cm-bar-chart__row">
              <div className="cm-bar-chart__row-header">
                <span className="cm-bar-chart__label">{bar.label}</span>
                {showValues && <span className="cm-bar-chart__value">{renderedValue(bar)}</span>}
              </div>
              <div className="cm-bar-chart__track">
                <div
                  className="cm-bar-chart__fill cm-bar-chart__fill--horizontal"
                  title={tooltipFormat?.(bar)}
                  style={{
                    width: `${bar.percentage}%`,
                    backgroundColor: barColor(bar),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CmChartFrame>
    );
  }

  return (
    <CmChartFrame
      className={frameClassName}
      title={title}
      description={description}
      height={frameHeight}
      loading={loading}
      loadingMessage={loadingMessage}
      loadingState={loadingState}
      empty={empty}
      emptyMessage={emptyMessage}
      emptyState={emptyState}
      legend={resolvedLegend}
      table={table}
      showAccessibleTable={showAccessibleTable}
    >
      <div
        className={cn("cm-bar-chart cm-bar-chart--vertical", className)}
        style={{ height: `${chartHeight}px` }}
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
                    {renderedValue(bar)}
                  </span>
                )}
                <div
                  className="cm-bar-chart__fill cm-bar-chart__fill--vertical"
                  title={tooltipFormat?.(bar)}
                  style={{
                    height: `${(bar.percentage / 100) * (chartHeight - 60)}px`,
                    backgroundColor: barColor(bar),
                  }}
                />
              </div>
              <span className="cm-bar-chart__label cm-bar-chart__label--axis">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </CmChartFrame>
  );
}
CmBarChart.displayName = "CmBarChart";
