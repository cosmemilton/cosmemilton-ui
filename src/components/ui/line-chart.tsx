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

export type CmLineChartDataPoint = {
  label: string;
  value: number;
};

export type CmLineChartTone = Exclude<CmChartTone, "default">;

export type CmLineChartProps = {
  data: CmLineChartDataPoint[];
  height?: number;
  tone?: CmLineChartTone;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
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
  valueFormat?: (value: number, point?: CmLineChartDataPoint) => ReactNode;
  tooltipFormat?: (point: CmLineChartDataPoint) => string;
  accessibleTableLabel?: ReactNode;
  showAccessibleTable?: boolean;
};

function formatValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

function textValue(value: ReactNode, fallback: string) {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

export function CmLineChart({
  data,
  height = 200,
  tone = "primary",
  color,
  showGrid = true,
  showLabels = true,
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
}: CmLineChartProps) {
  // Use a consistent internal coordinate system
  const svgWidth = 400;
  const svgHeight = height;
  const padLeft = showLabels ? 50 : 10;
  const padRight = 10;
  const padTop = 10;
  const padBottom = showLabels ? 30 : 10;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;
  const resolvedColor = color ?? cmChartColor(tone);
  const empty = data.length === 0;
  const resolvedLegend =
    legend === true
      ? [
          {
            id: "line",
            label: title ?? "Série",
            color: resolvedColor,
            tone,
          },
        ]
      : Array.isArray(legend)
        ? legend
        : undefined;
  const table = {
    caption: accessibleTableLabel ?? title ?? "Dados do gráfico de linhas",
    columns: [
      { key: "label", header: "Ponto" },
      { key: "value", header: "Valor" },
    ],
    rows: data.map((point) => {
      const fallback = formatValue(point.value);
      return {
        label: point.label,
        value: textValue(valueFormat ? valueFormat(point.value, point) : fallback, fallback),
      };
    }),
  };

  const { points, gridLines } = useMemo(() => {
    if (data.length === 0) return { points: [], gridLines: [] };

    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

    const pts = data.map((d, i) => {
      const x = padLeft + (data.length > 1 ? i * stepX : chartW / 2);
      const y = padTop + chartH - ((d.value - min) / range) * chartH;
      return { x, y, value: d.value, label: d.label };
    });

    const grid = [0, 0.25, 0.5, 0.75, 1].map((percent) => ({
      y: padTop + chartH * percent,
      value: max - range * percent,
    }));

    return { points: pts, gridLines: grid };
  }, [data, chartW, chartH, padLeft, padTop]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      path += ` C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    const baseline = padTop + chartH;
    return `${pathD} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
  }, [pathD, points, padTop, chartH]);

  return (
    <CmChartFrame
      className={frameClassName}
      title={title}
      description={description}
      height={height}
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
      <div className={cn("cm-line-chart", className)}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="cm-line-chart__svg"
          style={{ height: `${height}px` }}
        >
          {/* CmGrid Lines */}
          {showGrid &&
            gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={line.y}
                  x2={svgWidth - padRight}
                  y2={line.y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="cm-line-chart__grid-line"
                />
                {showLabels && (
                  <text
                    x={padLeft - 6}
                    y={line.y + 4}
                    fontSize="10"
                    textAnchor="end"
                    fill="currentColor"
                    className="cm-line-chart__label"
                  >
                    {textValue(valueFormat ? valueFormat(line.value) : formatValue(line.value), formatValue(line.value))}
                  </text>
                )}
              </g>
            ))}

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill={resolvedColor} opacity="0.1" />}

          {/* Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={resolvedColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {points.map((point, i) => (
            <circle key={i} cx={point.x} cy={point.y} r="4" fill={resolvedColor}>
              {tooltipFormat ? <title>{tooltipFormat(point)}</title> : null}
            </circle>
          ))}

          {/* X-axis Labels inside SVG */}
          {showLabels &&
            points.map((point, i) => (
              <text
                key={i}
                x={point.x}
                y={svgHeight - 6}
                fontSize="10"
                textAnchor="middle"
                fill="currentColor"
                className="cm-line-chart__label"
              >
                {point.label}
              </text>
            ))}
        </svg>
      </div>
    </CmChartFrame>
  );
}
CmLineChart.displayName = "CmLineChart";
