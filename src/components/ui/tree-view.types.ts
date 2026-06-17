import type { ReactNode } from "react";

export interface CmTreeNode {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  /**
   * Ícone próprio deste item (sobrescreve os ícones padrão/branchIcon/leafIcon).
   * Aceita qualquer ReactNode — um <CmIcon/>, um ícone lucide, ou até um emoji.
   */
  icon?: ReactNode;
  children?: CmTreeNode[];
  parentId?: string | null;
  order?: number;
  active?: boolean;
  description?: string;
  // Novo: para modo de seleção com checkbox
  permissionId?: number;
}
