"use client";

import { CmDialog } from "./dialog.js";
import { CmButton } from "./button.js";
import { CmCheckbox } from "./checkbox.js";
import type { CmDataTableColumn } from "./data-table.types.js";

export interface DataTableColumnMenuProps<T> {
  open: boolean;
  onClose: () => void;
  /** Colunas que podem ser ocultadas (já filtradas por `hideable !== false`). */
  columns: CmDataTableColumn<T>[];
  hiddenColumns: Set<string> | undefined;
  onToggle: (key: string) => void;
  onReset: () => void;
}

/** Modal de configuração de visibilidade de colunas do `CmDataTable`. */
export function DataTableColumnMenu<T>({
  open,
  onClose,
  columns,
  hiddenColumns,
  onToggle,
  onReset,
}: DataTableColumnMenuProps<T>) {
  return (
    <CmDialog
      open={open}
      onClose={onClose}
      title="Colunas visíveis"
      size="md"
      portal
      presentation="compact"
      footer={
        <div className="cm-data-table__dialog-footer">
          <CmButton
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            variant="surface"
            tone="primary"
            size="sm"
          >
            Restaurar padrão
          </CmButton>
          <CmButton
            type="button"
            onClick={onClose}
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
        {columns.map((col) => {
          const key = String(col.key);
          return (
            <div key={key} className="cm-data-table__column-option">
              <CmCheckbox
                presentation="compact"
                checked={!(hiddenColumns?.has(key) ?? false)}
                onChange={() => onToggle(key)}
                label={col.header}
              />
            </div>
          );
        })}
      </div>
    </CmDialog>
  );
}
DataTableColumnMenu.displayName = "DataTableColumnMenu";
