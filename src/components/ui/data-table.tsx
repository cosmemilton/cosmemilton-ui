"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils.js";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { useTablePreference } from "../../hooks/use-table-preference.js";
import { CmDialog } from "./dialog.js";
import { CmButton } from "./button.js";
import { CmCheckbox } from "./checkbox.js";
import { CmPagination } from "./pagination.js";

export type CmDataTableColumn<T> = {
  /** Identificador estável da coluna. Sem render, também é usado para ler row[key]. */
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date;
  hideable?: boolean; // default true — false para colunas que nunca devem ser ocultadas (ex: ações)
  defaultHidden?: boolean; // se true, a coluna começa oculta (padrão antes de preferência do usuário)
};

export type CmDataTableActionsProps = HTMLAttributes<HTMLDivElement>;

export function CmDataTableActions({
  className,
  ...props
}: CmDataTableActionsProps) {
  return <div className={cn("cm-data-table__actions", className)} {...props} />;
}

export type CmSortDirection = "asc" | "desc";

export type CmDataTableProps<T> = {
  columns: CmDataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  zebra?: boolean;
  className?: string;
  pagination?: boolean;
  defaultRowsPerPage?: number;
  emptyMessage?: string;
  selectedRowKey?: string;
  onRowClick?: (row: T) => void;
  defaultSortKey?: string;
  defaultSortDirection?: CmSortDirection;
  tableKey?: string; // chave para persistir preferências de colunas do usuário
  detailPanelEnabled?: boolean;
  renderSelectedRowDetail?: (row: T) => ReactNode;
  detailPanelWidth?: string | number;
  detailPanelClassName?: string;
  detailBridge?: boolean;
  detailEmptyMessage?: ReactNode;
};

export function CmDataTable<T>({
  columns,
  data,
  rowKey,
  zebra = true,
  className,
  pagination = true,
  defaultRowsPerPage = 10,
  emptyMessage = "Nenhum registro encontrado",
  selectedRowKey,
  onRowClick,
  defaultSortKey,
  defaultSortDirection = "asc",
  tableKey,
  detailPanelEnabled = false,
  renderSelectedRowDetail,
  detailPanelWidth = 280,
  detailPanelClassName,
  detailBridge = true,
  detailEmptyMessage,
}: CmDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortKey, setSortKey] = useState<string | null>(
    defaultSortKey ?? null,
  );
  const [sortDirection, setSortDirection] =
    useState<CmSortDirection>(defaultSortDirection);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const detailTableWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedRowRect, setSelectedRowRect] = useState<{
    top: number;
    height: number;
  } | null>(null);

  // Deriva os defaults de visibilidade a partir das definições de coluna
  const defaultHiddenKeys = useMemo(
    () =>
      columns
        .filter((c) => c.defaultHidden && c.hideable !== false)
        .map((c) => String(c.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depende apenas das keys/defaultHidden que são estáveis
    [columns.map((c) => `${String(c.key)}:${c.defaultHidden}`).join()],
  );

  // Gerencia preferências internamente quando tableKey é fornecido
  const { hiddenColumns, setHiddenColumns, resetToDefaults } =
    useTablePreference(tableKey ?? null, defaultHiddenKeys);

  const hasColumnToggle = !!tableKey;

  const visibleColumns = useMemo(() => {
    if (!hiddenColumns || hiddenColumns.size === 0) return columns;
    return columns.filter((c) => !hiddenColumns.has(String(c.key)));
  }, [columns, hiddenColumns]);

  const toggleColumn = (key: string) => {
    const next = new Set(hiddenColumns);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setHiddenColumns(next);
  };

  const handleSort = (column: CmDataTableColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = col.sortValue
        ? col.sortValue(a)
        : (a as Record<string, unknown>)[sortKey];
      const bVal = col.sortValue
        ? col.sortValue(b)
        : (b as Record<string, unknown>)[sortKey];

      let comparison = 0;
      if (aVal == null && bVal == null) comparison = 0;
      else if (aVal == null) comparison = -1;
      else if (bVal == null) comparison = 1;
      else if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal, "pt-BR", { sensitivity: "base" });
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = Number(aVal) - Number(bVal);
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentData = pagination
    ? sortedData.slice(indexOfFirstItem, indexOfLastItem)
    : sortedData;

  const detailPanelActive = detailPanelEnabled && !!renderSelectedRowDetail;
  const detailPanelSize =
    typeof detailPanelWidth === "number"
      ? `${detailPanelWidth}px`
      : detailPanelWidth;
  const selectedDetailRow = useMemo(() => {
    if (!detailPanelActive || selectedRowKey == null) return null;
    return currentData.find((row, rowIndex) => rowKey(row, rowIndex) === selectedRowKey) ?? null;
  }, [currentData, detailPanelActive, rowKey, selectedRowKey]);

  const measureSelectedRow = useCallback(() => {
    const wrapper = detailTableWrapperRef.current;
    if (!detailPanelActive || !selectedRowKey || !wrapper) {
      setSelectedRowRect(null);
      return;
    }

    const row = wrapper.querySelector<HTMLTableRowElement>("tr[data-selected]");
    if (!row) {
      setSelectedRowRect(null);
      return;
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    setSelectedRowRect({
      top: rowRect.top - wrapperRect.top,
      height: rowRect.height,
    });
  }, [detailPanelActive, selectedRowKey]);

  useLayoutEffect(() => {
    if (!detailPanelActive) {
      setSelectedRowRect(null);
      return;
    }

    let frameId = 0;
    const scheduleMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measureSelectedRow);
    };

    scheduleMeasure();

    const wrapper = detailTableWrapperRef.current;
    const resizeObserver =
      wrapper && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleMeasure)
        : null;

    if (wrapper && resizeObserver) {
      resizeObserver.observe(wrapper);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [
    currentData,
    detailPanelActive,
    measureSelectedRow,
    rowsPerPage,
    selectedRowKey,
    sortDirection,
    sortKey,
    visibleColumns.length,
  ]);

  const handleChangeRowsPerPage = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (sortedData.length === 0) {
    return (
      <div className={cn("cm-data-table-empty", className)}>
        <p className="cm-data-table-empty__message">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const hideableColumns = columns.filter((c) => c.hideable !== false);
  const hiddenCount = hideableColumns.filter((c) =>
    hiddenColumns?.has(String(c.key)),
  ).length;

  const table = (
    <div
      className={cn(
        "cm-data-table data-table-root",
        detailPanelActive && "cm-data-table--detail-active",
        className,
      )}
    >
      <table className="cm-data-table__table">
        <thead className="cm-data-table__head">
          <tr>
            {hasColumnToggle && (
              <th className="cm-data-table__toggle-cell">
                <button
                  type="button"
                  onClick={() => setColumnMenuOpen(true)}
                  className="cm-data-table__column-button"
                  title="Configurar colunas"
                  aria-label="Configurar colunas"
                >
                  <SlidersHorizontal className="cm-data-table__column-icon" />
                  {hiddenCount > 0 && (
                    <span className="cm-data-table__hidden-count">
                      {hiddenCount}
                    </span>
                  )}
                </button>
              </th>
            )}
            {visibleColumns.map((column, colIndex) => {
              const isSortable = !!column.sortable;
              const isActive = sortKey === column.key;
              return (
                <th
                  key={colIndex}
                  className={cn(
                    "cm-data-table__header",
                    (!column.align || column.align === "left") && "cm-data-table__cell--left",
                    column.align === "center" && "cm-data-table__cell--center",
                    column.align === "right" && "cm-data-table__cell--right",
                    isSortable && "cm-data-table__header--sortable",
                    column.headerClassName,
                  )}
                  onClick={isSortable ? () => handleSort(column) : undefined}
                  aria-sort={
                    isActive
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <span
                    className={cn(
                      "cm-data-table__header-content",
                      column.align === "center" && "cm-data-table__header-content--center",
                      column.align === "right" && "cm-data-table__header-content--right",
                    )}
                  >
                    {column.header}
                    {isSortable &&
                      (isActive ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="cm-data-table__sort-icon" />
                        ) : (
                          <ArrowDown className="cm-data-table__sort-icon" />
                        )
                      ) : (
                        <ArrowUpDown className="cm-data-table__sort-icon cm-data-table__sort-icon--inactive" />
                      ))}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="cm-data-table__body">
          {currentData.map((row, rowIndex) => {
            const key = rowKey(row, rowIndex);
            const isSelected = selectedRowKey != null && key === selectedRowKey;
            return (
              <tr
                key={key}
                data-selected={isSelected || undefined}
                className={cn(
                  "cm-data-table__row",
                  zebra &&
                    !isSelected &&
                    rowIndex % 2 === 1 &&
                    "cm-data-table__row--zebra",
                  !isSelected && "cm-data-table__row--hoverable",
                  onRowClick && "cm-data-table__row--clickable",
                  isSelected && "cm-data-table__row--selected",
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {hasColumnToggle && <td className="cm-data-table__toggle-spacer" />}
                {visibleColumns.map((column, colIndex) => (
                  <td
                    key={`${key}-${colIndex}`}
                    className={cn(
                      "cm-data-table__cell",
                      column.align === "center" && "cm-data-table__cell--center",
                      column.align === "right" && "cm-data-table__cell--right",
                      column.cellClassName,
                    )}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {pagination && sortedData.length > 0 && (
          <tfoot className="cm-data-table__foot">
            <tr>
              <td
                colSpan={visibleColumns.length + (hasColumnToggle ? 1 : 0)}
                className="cm-data-table__pagination-cell"
              >
                <div className="cm-data-table__pagination">
                  <div className="cm-data-table__pagination-group">
                    <span className="cm-data-table__pagination-text">
                      Linhas por página:
                    </span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => handleChangeRowsPerPage(e.target.value)}
                      className="cm-data-table__page-size"
                      aria-label="Linhas por página"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="cm-data-table__pagination-text">
                      {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, sortedData.length)} de{" "}
                      {sortedData.length}
                    </span>
                  </div>
                  <CmPagination
                    mode="compact"
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                    nextLabel="Próxima"
                  />
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Modal de configuração de colunas */}
      {hasColumnToggle && (
        <CmDialog
          open={columnMenuOpen}
          onClose={() => setColumnMenuOpen(false)}
          title="Colunas visíveis"
          size="md"
          portal
          presentation="compact"
          footer={
            <div className="cm-data-table__dialog-footer">
              <CmButton
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setColumnMenuOpen(false);
                }}
                variant="surface"
                tone="primary"
                size="sm"
              >
                Restaurar padrão
              </CmButton>
              <CmButton
                type="button"
                onClick={() => setColumnMenuOpen(false)}
                variant="soft"
                tone="primary"
                size="sm"
              >
                Fechar
              </CmButton>
            </div>
          }
        >
          <div className="cm-data-table__columns-grid">
            {hideableColumns.map((col) => {
              const key = String(col.key);
              return (
                <div
                  key={key}
                  className="cm-data-table__column-option"
                >
                  <CmCheckbox
                    presentation="compact"
                    checked={!(hiddenColumns?.has(key) ?? false)}
                    onChange={() => toggleColumn(key)}
                    label={col.header}
                  />
                </div>
              );
            })}
          </div>
        </CmDialog>
      )}
    </div>
  );

  if (!detailPanelActive) {
    return table;
  }

  const detailLayoutStyle = {
    "--cm-data-table-detail-panel-width": detailPanelSize,
  } as CSSProperties;
  const detailContent = selectedDetailRow
    ? renderSelectedRowDetail?.(selectedDetailRow)
    : detailEmptyMessage;

  return (
    <div
      className="cm-data-table-detail-layout"
      style={detailLayoutStyle}
    >
      <div
        ref={detailTableWrapperRef}
        className="cm-data-table-detail__table-wrap"
      >
        {table}
        {detailBridge && selectedRowRect && (
          <>
            <span
              className="cm-data-table-detail__tab"
              style={{
                top: selectedRowRect.top,
                height: selectedRowRect.height,
                width: selectedRowRect.height / 2,
                left: -(selectedRowRect.height / 2),
              }}
              aria-hidden="true"
            />
            <div
              className="cm-data-table-detail__ribbon"
              style={{
                top: selectedRowRect.top,
                height: selectedRowRect.height,
              }}
              aria-hidden="true"
            />
            <div
              className="cm-data-table-detail__bridge"
              style={{
                top: selectedRowRect.top,
                height: selectedRowRect.height,
              }}
              aria-hidden="true"
            />
          </>
        )}
      </div>
      <aside
        className={cn("cm-data-table-detail__panel", detailPanelClassName)}
        aria-label="Detalhes da linha selecionada"
      >
        {detailContent}
      </aside>
    </div>
  );
}

// ─── Column Toggle Menu ─────────────────────────────────────────────
