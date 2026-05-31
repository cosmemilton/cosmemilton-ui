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

export type CmDataTableProps<T> = {
  columns: CmDataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  zebra?: boolean;
  className?: string;
  tableClassName?: string;
  density?: CmDensity;
  fullWidth?: boolean;
  pagination?: boolean;
  defaultRowsPerPage?: number;
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
