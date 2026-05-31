export interface CmTreeNode {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  icon?: string;
  children?: CmTreeNode[];
  parentId?: string | null;
  order?: number;
  active?: boolean;
  description?: string;
  // Novo: para modo de seleção com checkbox
  permissionId?: number;
}
