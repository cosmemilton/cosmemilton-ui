import type { CmDataTableColumn, CmSortDirection } from "./data-table.types.js";

/**
 * Ordena uma cópia de `data` pela coluna `sortKey`. Usa `column.sortValue` se
 * fornecido, senão lê `row[sortKey]`. Comparação estável por tipo: strings via
 * `localeCompare` pt-BR, datas por timestamp, demais por número; nulos vão para
 * o início. Função pura — não muta `data`. Retorna `data` intacto se não houver
 * coluna ordenável correspondente.
 */
export function sortRows<T>(
  data: T[],
  columns: CmDataTableColumn<T>[],
  sortKey: string | null,
  sortDirection: CmSortDirection,
): T[] {
  if (!sortKey) return data;
  const col = columns.find((c) => c.key === sortKey);
  if (!col?.sortable) return data;

  return [...data].sort((a, b) => {
    const aVal = col.sortValue ? col.sortValue(a) : (a as Record<string, unknown>)[sortKey];
    const bVal = col.sortValue ? col.sortValue(b) : (b as Record<string, unknown>)[sortKey];

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
}
