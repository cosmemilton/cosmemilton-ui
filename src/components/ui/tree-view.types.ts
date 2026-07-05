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

/** Posição de um item em relação ao alvo de um drop. */
export type CmTreeDropPosition = "before" | "inside" | "after";

/**
 * Estratégia das zonas de drop.
 *
 * - `before`: preserva o comportamento original e sempre insere antes do alvo.
 * - `auto`: usa o topo, centro e rodapé do alvo para inserir antes, dentro ou depois.
 */
export type CmTreeDropMode = "before" | "auto";

/** Contexto completo entregue a `canDrop` e ao quarto argumento de `onMove`. */
export interface CmTreeMoveDetails {
  draggedNode: CmTreeNode;
  targetNode: CmTreeNode;
  position: CmTreeDropPosition;
  oldParentId: string | null;
  oldOrder: number;
  newParentId: string | null;
  newOrder: number;
}

/** Ação customizada por nó (ex.: "clonar"), renderizada ao lado de editar/remover. */
export interface CmTreeNodeAction {
  /** Identifica a ação na lista; usado como React key. */
  key: string;
  icon: ReactNode;
  /** Usado como aria-label e title do botão. */
  label: string;
  onClick: (node: CmTreeNode) => void;
  /** Classe extra no botão, para tingir o ícone com uma cor própria. */
  className?: string;
}
