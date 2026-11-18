"use client";

import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { chartLinePath, type CmLineChartCurve } from "./chart-line-path.js";
import {
  CmChartFrame,
  cmChartColor,
  type CmChartFrameProps,
  type CmChartTone,
} from "./chart-frame.js";

export type CmComparisonLinePoint = {
  id: string;
  /** Rótulo curto exibido no eixo horizontal. */
  label: string;
  /** Data ou categoria por extenso para consulta e leitura assistiva. */
  description?: string;
  left: number | null;
  right: number | null;
};

export type CmComparisonLineAxis = {
  label: string;
  tone?: CmChartTone;
  color?: string;
  valueFormat?: (value: number) => string;
  tickFormat?: (value: number) => string;
  /** Desired bounds. The range expands to include zero and all finite observations. */
  domain?: readonly [number, number];
  /** Fills this series down to its own zero line. */
  area?: boolean;
};

export type CmComparisonLineChartProps = Omit<
  CmChartFrameProps,
  "children" | "legend" | "table" | "empty" | "height"
> & {
  data: readonly CmComparisonLinePoint[];
  leftAxis: CmComparisonLineAxis;
  rightAxis: CmComparisonLineAxis;
  curve?: CmLineChartCurve;
  /** Shows up to eight original labels when the chart has room. */
  xLabels?: "compact" | "responsive";
  height?: number;
  accessibleTableLabel?: ReactNode;
};

const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const ticks = [1, 0.75, 0.5, 0.25, 0];

function valid(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function formatted(value: number | null, axis: CmComparisonLineAxis) {
  return valid(value) ? (axis.valueFormat ?? number.format)(value) : "—";
}

function lineSeries(
  data: readonly CmComparisonLinePoint[],
  key: "left" | "right",
  axis: CmComparisonLineAxis,
  curve: CmLineChartCurve,
) {
  let min = 0;
  let max = 0;
  if (axis.domain && axis.domain.every(Number.isFinite) && axis.domain[0] < axis.domain[1]) {
    min = Math.min(min, axis.domain[0]);
    max = Math.max(max, axis.domain[1]);
  }
  for (const point of data) {
    const value = point[key];
    if (valid(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  const range = max - min || 1;
  const color = axis.color ?? cmChartColor(axis.tone ?? (key === "left" ? "primary" : "info"));
  const baseline = 100 * (1 + min / range);
  const lines: string[] = [];
  const areas: string[] = [];
  let run: { x: number; y: number }[] = [];
  function finishRun() {
    if (!run.length) return;
    const line = chartLinePath(run, curve);
    lines.push(line);
    if (axis.area && run.length > 1) {
      areas.push(`${line} L${run[run.length - 1].x} ${baseline} L${run[0].x} ${baseline} Z`);
    }
    run = [];
  }
  data.forEach((point, index) => {
    const value = point[key];
    if (valid(value)) {
      const x = data.length > 1 ? (index * 100) / (data.length - 1) : 50;
      run.push({ x, y: 100 * (1 - (value - min) / range) });
    } else {
      finishRun();
    }
  });
  finishRun();
  const tickFormat = axis.tickFormat ?? axis.valueFormat ?? number.format;
  return {
    color,
    path: lines.join(" "),
    area: areas.join(" "),
    ticks: ticks.map((t) => tickFormat(min + range * t)),
  };
}

function xAxisLabels(data: readonly CmComparisonLinePoint[], responsive: boolean) {
  if (!data.length) return [];
  const last = data.length - 1;
  const middle = Math.floor(last / 2);
  const indices = new Set([0, middle, last]);
  if (responsive) {
    const count = Math.min(data.length, 8);
    for (let i = 1; i < count - 1; i++) {
      const index = Math.round((i * last) / (count - 1));
      // Keep one midpoint shared with the compact layout.
      indices.add(i === Math.floor((count - 1) / 2) ? middle : index);
    }
  }
  return Array.from(indices)
    .sort((a, b) => a - b)
    .map((index) => ({
      point: data[index],
      position: last ? (index / last) * 100 : 50,
      compact: index === 0 || index === middle || index === last,
    }));
}

/** Compara duas séries em unidades próprias no mesmo eixo temporal ou categórico. */
export function CmComparisonLineChart({
  data,
  leftAxis,
  rightAxis,
  curve = "linear",
  xLabels = "compact",
  height = 192,
  accessibleTableLabel,
  ...frame
}: CmComparisonLineChartProps) {
  const gradientId = useId();
  const [cursor, setCursor] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const index = Math.max(0, Math.min(data.length - 1, cursor));
  const point = data[index];
  const left = useMemo(() => lineSeries(data, "left", leftAxis, curve), [data, leftAxis, curve]);
  const right = useMemo(
    () => lineSeries(data, "right", rightAxis, curve),
    [data, rightAxis, curve],
  );
  const labels = useMemo(() => xAxisLabels(data, xLabels === "responsive"), [data, xLabels]);
  const lineMarkers = frame.legendPosition === "header";
  const rows = useMemo(
    () =>
      data.map((row) => ({
        point: row.description ?? row.label,
        left: formatted(row.left, leftAxis),
        right: formatted(row.right, rightAxis),
      })),
    [data, leftAxis, rightAxis],
  );
  const position = data.length > 1 ? (index * 100) / (data.length - 1) : 50;
  const label = `${leftAxis.label} e ${rightAxis.label}`;
  const pointText = point
    ? `${point.description ?? point.label} · ${leftAxis.label}: ${formatted(point.left, leftAxis)} · ${rightAxis.label}: ${formatted(point.right, rightAxis)}`
    : "";

  function inspectPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const fraction = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    setCursor(Math.round(fraction * (data.length - 1)));
    setInspecting(true);
  }

  function inspectKey(event: KeyboardEvent<HTMLDivElement>) {
    const last = data.length - 1;
    if (event.key === "Escape") {
      event.preventDefault();
      setInspecting(false);
      return;
    }
    const next: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    setCursor(Math.max(0, Math.min(last, next[event.key])));
    setInspecting(true);
  }

  return (
    <CmChartFrame
      {...frame}
      empty={!data.some((row) => valid(row.left) || valid(row.right))}
      legend={[
        { label: leftAxis.label, color: left.color, marker: lineMarkers ? "line" : "dot" },
        { label: rightAxis.label, color: right.color, marker: lineMarkers ? "dashed" : "dot" },
      ]}
      table={{
        caption: accessibleTableLabel ?? frame.title ?? label,
        columns: [
          { key: "point", header: "Ponto" },
          { key: "left", header: leftAxis.label },
          { key: "right", header: rightAxis.label },
        ],
        rows,
      }}
    >
      <div className="cm-comparison-chart">
        <div className="cm-comparison-chart__axis" aria-hidden="true">
          {left.ticks.map((tick, i) => (
            <span key={i}>{tick}</span>
          ))}
        </div>
        <div
          className="cm-comparison-chart__plot"
          style={{ height }}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={data.length}
          aria-valuenow={index + 1}
          aria-valuetext={pointText}
          onPointerMove={inspectPointer}
          onPointerDown={inspectPointer}
          onPointerLeave={(event) => {
            if (event.currentTarget !== document.activeElement) setInspecting(false);
          }}
          onFocus={() => setInspecting(true)}
          onBlur={() => setInspecting(false)}
          onKeyDown={inspectKey}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {[left, right].map(
              (series, i) =>
                series.area && (
                  <g key={i}>
                    <defs>
                      <linearGradient
                        id={`${gradientId}-${i}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                        gradientUnits="objectBoundingBox"
                      >
                        <stop offset="0" stopColor={series.color} stopOpacity=".22" />
                        <stop offset="1" stopColor={series.color} stopOpacity=".035" />
                      </linearGradient>
                    </defs>
                    <path d={series.area} fill={`url(#${gradientId}-${i})`} />
                  </g>
                ),
            )}
            {ticks.map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="100"
                y1={tick * 100}
                y2={tick * 100}
                className="cm-comparison-chart__grid"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={left.path}
              fill="none"
              stroke={left.color}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={right.path}
              fill="none"
              stroke={right.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="6 3"
              vectorEffect="non-scaling-stroke"
            />
            {inspecting && (
              <line
                x1={position}
                x2={position}
                y1="0"
                y2="100"
                className="cm-comparison-chart__cursor"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {inspecting && point && (
            <div
              className="cm-comparison-chart__tooltip"
              data-side={position < 50 ? "end" : "start"}
              aria-hidden="true"
            >
              <strong>{point.description ?? point.label}</strong>
              <span>
                {leftAxis.label} · {formatted(point.left, leftAxis)}
              </span>
              <span>
                {rightAxis.label} · {formatted(point.right, rightAxis)}
              </span>
            </div>
          )}
        </div>
        <div className="cm-comparison-chart__axis" aria-hidden="true">
          {right.ticks.map((tick, i) => (
            <span key={i}>{tick}</span>
          ))}
        </div>
        <div className="cm-comparison-chart__labels" aria-hidden="true">
          {labels.map(({ point, position, compact }) => (
            <span key={point.id} style={{ left: `${position}%` }} data-compact={compact}>
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </CmChartFrame>
  );
}
CmComparisonLineChart.displayName = "CmComparisonLineChart";
