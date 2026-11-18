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
  totalLabel?: string;
  valueFormat?: (value: number) => string;
  accessibleTableLabel?: ReactNode;
};

const number = new Intl.NumberFormat("pt-BR");
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const tones: CmChartTone[] = ["primary", "info", "success", "warning", "accent", "secondary"];

/** Mostra partes de um total. Valores negativos ou não finitos não participam da distribuição. */
export function CmDonutChart({
  data,
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
      <div className="cm-donut-chart">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {slices
            .filter((slice) => slice.fraction > 0)
            .map((slice) => (
              <circle
                key={slice.id}
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={slice.color}
                strokeWidth="10"
                pathLength="100"
                transform="rotate(-90 50 50)"
                strokeDashoffset={-slice.start * 100}
                strokeDasharray={`${slice.fraction * 100} ${(1 - slice.fraction) * 100}`}
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
