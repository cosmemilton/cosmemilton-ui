/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The labelled overflow region needs keyboard scrolling. */
import type { ReactNode, TableHTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";
import type { CmDensity } from "./types.js";
export type CmTableProps = TableHTMLAttributes<HTMLTableElement> & {
  caption?: ReactNode;
  density?: CmDensity;
  label?: string;
  scrollable?: boolean;
  /** Largura mínima da tabela, mantendo a rolagem dentro da região em telas pequenas. */
  tableMinWidth?: number | string;
};
export function CmTable({
  caption,
  density = "default",
  label = "Tabela",
  scrollable = true,
  tableMinWidth,
  style,
  className,
  children,
  ...props
}: CmTableProps) {
  const table = (
    <table
      className={cn("cm-table", className)}
      data-density={density}
      style={tableMinWidth === undefined ? style : { ...style, minWidth: tableMinWidth }}
      {...props}
    >
      {caption && <caption>{caption}</caption>}
      {children}
    </table>
  );
  return scrollable ? (
    <div className="cm-table-scroll" role="region" aria-label={label} tabIndex={0}>
      {table}
    </div>
  ) : (
    table
  );
}
CmTable.displayName = "CmTable";
