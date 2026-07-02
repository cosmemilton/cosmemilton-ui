import type { HTMLAttributes, ReactNode } from "react";
import type { CmDensity } from "./types.js";

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

export type CmSortDirection = "asc" | "desc";

/** Estado de ordenação emitido por `onSortChange` no modo server-side. */
export type CmDataTableSort = { key: string | null; direction: CmSortDirection };

export type CmDataTableProps<T> = {
  columns: CmDataTableColumn<T>[];
  data: T[];
  /**
   * Chave estável de cada linha: nome de uma propriedade de `row` (o valor é
   * convertido com `String(...)`) ou função `(row, index) => string`. A forma
   * string é serializável e pode ser passada de Server para Client Components.
   */
  rowKey: (keyof T & string) | ((row: T, index: number) => string);
  zebra?: boolean;
  className?: string;
  tableClassName?: string;
  density?: CmDensity;
  fullWidth?: boolean;
  pagination?: boolean;
  defaultRowsPerPage?: number;
  /** Opções do seletor "linhas por página". Padrão `[5, 10, 20, 25, 50]`. */
  rowsPerPageOptions?: number[];
  /**
   * Server-side: a ordenação é tratada pelo backend. A tabela não reordena
   * `data`; apenas alterna asc/desc e emite `onSortChange`.
   */
  manualSorting?: boolean;
  /**
   * Server-side: a paginação é tratada pelo backend. `data` já contém apenas as
   * linhas da página atual; informe `totalRows` para o total real.
   */
  manualPagination?: boolean;
  /** Total de registros (necessário com `manualPagination`). */
  totalRows?: number;
  /** Página atual controlada (base 1). Use com `onPageChange`. */
  page?: number;
  onPageChange?: (page: number) => void;
  /** Linhas por página controlada. Use com `onRowsPerPageChange`. */
  rowsPerPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Coluna ordenada controlada. Use com `onSortChange`. */
  sortKey?: string | null;
  /** Direção ordenada controlada. Use com `onSortChange`. */
  sortDirection?: CmSortDirection;
  onSortChange?: (sort: CmDataTableSort) => void;
  /** Exibe estado de carregamento (atenua as linhas e marca `aria-busy`). */
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  header?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  toolbar?: ReactNode;
  actions?: ReactNode;
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
