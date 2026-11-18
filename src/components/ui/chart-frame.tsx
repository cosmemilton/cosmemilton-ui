import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmChartTone = CmTone | "primary-soft";

export type CmChartLegendItem = {
  id?: string;
  label: ReactNode;
  value?: ReactNode;
  tone?: CmChartTone;
  color?: string;
  marker?: "dot" | "line" | "dashed";
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
  /** Controls for the chart header, such as a period selector. */
  actions?: ReactNode;
  height?: string | number;
  loading?: boolean;
  loadingMessage?: ReactNode;
  loadingState?: ReactNode;
  empty?: boolean;
  emptyMessage?: ReactNode;
  emptyState?: ReactNode;
  legend?: CmChartLegendItem[];
  legendPosition?: "header" | "footer" | "none";
  legendLayout?: "inline" | "list";
  table?: CmChartAccessibleTable;
  showAccessibleTable?: boolean;
};

type ChartFrameStyle = CSSProperties & Partial<Record<`--${string}`, string | number>>;

export function cmChartColor(tone: CmChartTone = "primary") {
  if (tone === "default") return "var(--color-primary)";
  if (tone === "primary-soft") return "var(--cm-chart-primary-soft)";
  return `var(--color-${tone})`;
}

function sizeValue(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function CmChartFrame({
  actions,
  children,
  className,
  description,
  empty = false,
  emptyMessage = "Nenhum dado para exibir",
  emptyState,
  height,
  legend,
  legendPosition = "footer",
  legendLayout = "inline",
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
  const hasHeading = title !== undefined || description !== undefined;
  const hasActions = actions != null && actions !== false;
  const hasLegend = !loading && !empty && legendPosition !== "none" && legend && legend.length > 0;
  const headerLegend = hasLegend && legendPosition === "header";
  const shouldRenderTable = showAccessibleTable && table && table.rows.length > 0;
  const heading = (
    <>
      {title !== undefined ? <div className="cm-chart-frame__title">{title}</div> : null}
      {description !== undefined ? (
        <div className="cm-chart-frame__description">{description}</div>
      ) : null}
    </>
  );
  const legendList = hasLegend ? (
    <ul className="cm-chart-frame__legend" data-layout={legendLayout} aria-label="Legenda">
      {legend.map((item, index) => (
        <li
          key={item.id ?? index}
          className="cm-chart-frame__legend-item"
          style={
            { "--cm-chart-legend-color": item.color ?? cmChartColor(item.tone) } as ChartFrameStyle
          }
        >
          <span
            className="cm-chart-frame__legend-swatch"
            data-marker={item.marker}
            aria-hidden="true"
          />
          <span className="cm-chart-frame__legend-label">{item.label}</span>
          {item.value !== undefined && (
            <span className="cm-chart-frame__legend-value">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div
      className={cn("cm-chart-frame", className)}
      style={rootStyle}
      aria-busy={loading || undefined}
      data-cm-chart-frame-height={height !== undefined ? "" : undefined}
      {...props}
    >
      {hasHeading || hasActions || headerLegend ? (
        <div
          className={cn(
            "cm-chart-frame__header",
            (hasActions || headerLegend) && "cm-chart-frame__header--with-actions",
          )}
        >
          {hasHeading && <div className="cm-chart-frame__heading">{heading}</div>}
          {headerLegend && legendList}
          {hasActions && <div className="cm-chart-frame__actions">{actions}</div>}
        </div>
      ) : null}

      <div className="cm-chart-frame__body">
        {loading
          ? (loadingState ?? (
              <div className="cm-chart-frame__state" role="status">
                {loadingMessage}
              </div>
            ))
          : empty
            ? (emptyState ?? <div className="cm-chart-frame__state">{emptyMessage}</div>)
            : children}
      </div>

      {legendPosition === "footer" && legendList}

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
