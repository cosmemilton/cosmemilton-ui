import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmChartTone = CmTone;

export type CmChartLegendItem = {
  id?: string;
  label: ReactNode;
  value?: ReactNode;
  tone?: CmChartTone;
  color?: string;
};

export type CmChartTableColumn = {
  key: string;
  header: ReactNode;
};

export type CmChartTableRow = Record<string, ReactNode>;

export type CmChartAccessibleTable = {
  caption?: ReactNode;
  columns: CmChartTableColumn[];
  rows: CmChartTableRow[];
};

export type CmChartFrameProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  height?: string | number;
  loading?: boolean;
  loadingMessage?: ReactNode;
  loadingState?: ReactNode;
  empty?: boolean;
  emptyMessage?: ReactNode;
  emptyState?: ReactNode;
  legend?: CmChartLegendItem[];
  table?: CmChartAccessibleTable;
  showAccessibleTable?: boolean;
};

type ChartFrameStyle = CSSProperties & Partial<Record<`--${string}`, string | number>>;

export function cmChartColor(tone: CmChartTone = "primary") {
  if (tone === "default") return "var(--color-primary)";
  return `var(--color-${tone})`;
}

function sizeValue(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function CmChartFrame({
  children,
  className,
  description,
  empty = false,
  emptyMessage = "Nenhum dado para exibir",
  emptyState,
  height,
  legend,
  loading = false,
  loadingMessage = "Carregando dados...",
  loadingState,
  showAccessibleTable = true,
  style,
  table,
  title,
  ...props
}: CmChartFrameProps) {
  const rootStyle: ChartFrameStyle = {
    "--cm-chart-frame-height": sizeValue(height),
    ...style,
  };
  const hasHeader = title !== undefined || description !== undefined;
  const hasLegend = legend !== undefined && legend.length > 0;
  const shouldRenderTable = showAccessibleTable && table && table.rows.length > 0;

  return (
    <div
      className={cn("cm-chart-frame", className)}
      style={rootStyle}
      aria-busy={loading || undefined}
      data-cm-chart-frame-height={height !== undefined ? "" : undefined}
      {...props}
    >
      {hasHeader ? (
        <div className="cm-chart-frame__header">
          {title !== undefined ? <div className="cm-chart-frame__title">{title}</div> : null}
          {description !== undefined ? (
            <div className="cm-chart-frame__description">{description}</div>
          ) : null}
        </div>
      ) : null}

      <div className="cm-chart-frame__body">
        {loading ? (
          loadingState ?? (
            <div className="cm-chart-frame__state" role="status">
              {loadingMessage}
            </div>
          )
        ) : empty ? (
          emptyState ?? <div className="cm-chart-frame__state">{emptyMessage}</div>
        ) : (
          children
        )}
      </div>

      {!loading && !empty && hasLegend ? (
        <ul className="cm-chart-frame__legend" aria-label="Legenda">
          {legend.map((item, index) => {
            const color = item.color ?? cmChartColor(item.tone);
            return (
              <li
                key={item.id ?? index}
                className="cm-chart-frame__legend-item"
                style={{ "--cm-chart-legend-color": color } as ChartFrameStyle}
              >
                <span className="cm-chart-frame__legend-swatch" aria-hidden="true" />
                <span className="cm-chart-frame__legend-label">{item.label}</span>
                {item.value !== undefined ? (
                  <span className="cm-chart-frame__legend-value">{item.value}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {!loading && !empty && shouldRenderTable ? (
        <table className="cm-sr-only cm-chart-frame__table">
          {table.caption !== undefined ? <caption>{table.caption}</caption> : null}
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.columns.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
CmChartFrame.displayName = "CmChartFrame";
