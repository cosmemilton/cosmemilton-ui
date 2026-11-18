import type { ReactNode } from "react";
import {
  CmChartFrame,
  cmChartColor,
  type CmChartFrameProps,
  type CmChartTone,
} from "./chart-frame.js";

export type CmDonutChartSegment = {
  id: string;
  label: string;
  value: number;
  tone?: CmChartTone;
  color?: string;
};

export type CmDonutChartProps = Omit<
  CmChartFrameProps,
  "children" | "legend" | "table" | "empty"
> & {
  data: readonly CmDonutChartSegment[];
  /** Segmented displays a gap and rounded ends between positive slices. */
  variant?: "continuous" | "segmented";
  totalLabel?: string;
  valueFormat?: (value: number) => string;
  accessibleTableLabel?: ReactNode;
};

const number = new Intl.NumberFormat("pt-BR");
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const tones: CmChartTone[] = ["primary", "info", "success", "warning", "accent", "secondary"];
const radius = 42;
const circumference = 2 * Math.PI * radius;

function sliceStroke(start: number, fraction: number, segmented: boolean) {
  const length = fraction * 100;
  if (!segmented) {
    return {
      strokeWidth: 10,
      strokeDashoffset: -start * 100,
      strokeDasharray: `${length} ${(1 - fraction) * 100}`,
    };
  }
  // Reserve both round caps inside the slice. Tiny slices get smaller caps and gaps.
  const arcLength = fraction * circumference;
  const width = Math.min(10, arcLength * 0.65);
  const gap = Math.min(3, arcLength * 0.25);
  const trim = ((width + gap) / circumference) * 100;
  const dash = length - trim;
  return {
    strokeWidth: width,
    strokeLinecap: "round" as const,
    strokeDashoffset: -(start * 100 + trim / 2),
    strokeDasharray: `${dash} ${100 - dash}`,
  };
}

/** Mostra partes de um total. Valores negativos ou não finitos não participam da distribuição. */
export function CmDonutChart({
  data,
  variant = "continuous",
  totalLabel = "Total",
  valueFormat = number.format,
  accessibleTableLabel,
  ...frame
}: CmDonutChartProps) {
  const segments = data.filter((segment) => Number.isFinite(segment.value) && segment.value >= 0);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 0;
  const slices = segments.map((segment, index) => {
    const fraction = total > 0 ? segment.value / total : 0;
    const start = offset;
    offset += fraction;
    return {
      ...segment,
      fraction,
      start,
      amount: valueFormat(segment.value),
      share: percent.format(fraction),
      color: segment.color ?? cmChartColor(segment.tone ?? tones[index % tones.length]),
    };
  });
  const positive = slices.filter((slice) => slice.fraction > 0);

  return (
    <CmChartFrame
      {...frame}
      empty={total === 0}
      legend={slices.map((slice) => ({
        id: slice.id,
        label: slice.label,
        value: slice.share,
        color: slice.color,
      }))}
      table={{
        caption: accessibleTableLabel ?? frame.title ?? "Distribuição por categoria",
        columns: [
          { key: "label", header: "Categoria" },
          { key: "amount", header: "Valor" },
          { key: "share", header: "Percentual" },
        ],
        rows: slices.map(({ label, amount, share }) => ({ label, amount, share })),
      }}
    >
      <div className="cm-donut-chart" data-variant={variant}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {positive.map((slice) => (
            <circle
              key={slice.id}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={slice.color}
              pathLength="100"
              transform="rotate(-90 50 50)"
              {...sliceStroke(
                slice.start,
                slice.fraction,
                variant === "segmented" && positive.length > 1,
              )}
            >
              <title>{`${slice.label} · ${slice.amount} · ${slice.share}`}</title>
            </circle>
          ))}
        </svg>
        <div className="cm-donut-chart__center">
          <strong>{valueFormat(total)}</strong>
          <span>{totalLabel}</span>
        </div>
      </div>
    </CmChartFrame>
  );
}
CmDonutChart.displayName = "CmDonutChart";
