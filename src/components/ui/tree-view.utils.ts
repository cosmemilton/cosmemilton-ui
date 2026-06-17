import type { CmTreeNode } from "./tree-view.types.js";

export type TreeNodeLocation = {
  node: CmTreeNode;
  parentId: string | null;
  index: number;
};

export function findNodeLocation(
  nodes: CmTreeNode[],
  targetId: string,
  parentId: string | null = null,
): TreeNodeLocation | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === targetId) {
      return { node, parentId, index };
    }

    if (node.children?.length) {
      const childLocation = findNodeLocation(node.children, targetId, node.id);
      if (childLocation) return childLocation;
    }
  }

  return null;
}

export function nodeContainsId(node: CmTreeNode, targetId: string): boolean {
  if (node.id === targetId) return true;
  return node.children?.some((child) => nodeContainsId(child, targetId)) ?? false;
}

export function removeNodeFromTree(
  nodes: CmTreeNode[],
  targetId: string,
): { nodes: CmTreeNode[]; removed: CmTreeNode | null } {
  let removed: CmTreeNode | null = null;
  const nextNodes: CmTreeNode[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      removed = node;
      continue;
    }

    if (node.children?.length) {
      const childResult = removeNodeFromTree(node.children, targetId);
      if (childResult.removed) {
        removed = childResult.removed;
        nextNodes.push({ ...node, children: childResult.nodes });
      } else {
        nextNodes.push(node);
      }
      continue;
    }

    nextNodes.push(node);
  }

  return { nodes: nextNodes, removed };
}

export function insertNodeIntoTree(
  nodes: CmTreeNode[],
  parentId: string | null,
  nodeToInsert: CmTreeNode,
  targetIndex: number,
): CmTreeNode[] {
  if (parentId === null) {
    const nextNodes = [...nodes];
    nextNodes.splice(targetIndex, 0, { ...nodeToInsert, parentId: null });
    return nextNodes;
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = [...(node.children ?? [])];
      children.splice(targetIndex, 0, { ...nodeToInsert, parentId });
      return { ...node, children };
    }

    if (node.children?.length) {
      return {
        ...node,
        children: insertNodeIntoTree(node.children, parentId, nodeToInsert, targetIndex),
      };
    }

    return node;
  });
}

export function moveNodeBeforeTarget(
  nodes: CmTreeNode[],
  draggedId: string,
  targetId: string,
): { nodes: CmTreeNode[]; parentId: string | null; order: number } | null {
  if (draggedId === targetId) return null;

  const source = findNodeLocation(nodes, draggedId);
  const target = findNodeLocation(nodes, targetId);
  if (!source || !target || nodeContainsId(source.node, targetId)) return null;

  const parentId = target.parentId;
  const order =
    source.parentId === parentId && source.index < target.index
      ? Math.max(0, target.index - 1)
      : target.index;
  const removal = removeNodeFromTree(nodes, draggedId);
  if (!removal.removed) return null;

  return {
    nodes: insertNodeIntoTree(removal.nodes, parentId, removal.removed, order),
    parentId,
    order,
  };
}

/** Nível (profundidade, 0-based) de um nó, ou -1 se não encontrado. */
export function findNodeLevel(nodes: CmTreeNode[], targetId: string, level = 0): number {
  for (const node of nodes) {
    if (node.id === targetId) return level;
    if (node.children) {
      const childLevel = findNodeLevel(node.children, targetId, level + 1);
      if (childLevel !== -1) return childLevel;
    }
  }
  return -1;
}

/** Ids de todos os nós num nível específico. */
export function findNodesAtLevel(
  nodes: CmTreeNode[],
  targetLevel: number,
  currentLevel = 0,
): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (currentLevel === targetLevel) {
      result.push(node.id);
    }
    if (node.children && currentLevel < targetLevel) {
      result.push(...findNodesAtLevel(node.children, targetLevel, currentLevel + 1));
    }
  }
  return result;
}

/**
 * Reduz um conjunto de nós expandidos a um único caminho aberto (modo solitário):
 * em cada nível mantém apenas o primeiro nó que já estava expandido, descendo
 * por ele. Usado ao ligar o modo solitário para que sobre só um ramo aberto.
 */
export function pruneToSolitaryPath(
  nodes: CmTreeNode[],
  expanded: Set<string>,
): Set<string> {
  const result = new Set<string>();
  let list: CmTreeNode[] | undefined = nodes;
  while (Array.isArray(list) && list.length > 0) {
    const open: CmTreeNode | undefined = list.find(
      (node) => expanded.has(node.id) && node.children !== undefined && node.children.length > 0,
    );
    if (!open) break;
    result.add(open.id);
    list = open.children;
  }
  return result;
}

/** Ids de todos os nós que possuem filhos (i.e. são expansíveis), recursivamente. */
export function collectExpandableIds(nodes: CmTreeNode[]): Set<string> {
  const ids = new Set<string>();
  const collect = (list: CmTreeNode[]) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      if (node.children && node.children.length > 0) {
        ids.add(node.id);
        collect(node.children);
      }
    });
  };
  collect(nodes);
  return ids;
}

/** Ids de todos os nós da árvore (flatten), na ordem de profundidade. */
export function collectAllNodeIds(nodes: CmTreeNode[]): string[] {
  const ids: string[] = [];
  const collect = (list: CmTreeNode[]) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      ids.push(node.id);
      if (node.children) collect(node.children);
    });
  };
  collect(nodes);
  return ids;
}

/** Caminho (raiz → alvo) até `targetId`, incluindo o próprio nó alvo. */
export function findBreadcrumbPath(nodes: CmTreeNode[], targetId: string): CmTreeNode[] {
  if (!Array.isArray(nodes)) return [];
  const path: CmTreeNode[] = [];
  const walk = (list: CmTreeNode[], currentPath: CmTreeNode[] = []): boolean => {
    if (!Array.isArray(list)) return false;
    for (const node of list) {
      const newPath = [...currentPath, node];
      if (node.id === targetId) {
        path.push(...newPath);
        return true;
      }
      if (node.children && walk(node.children, newPath)) {
        return true;
      }
    }
    return false;
  };
  walk(nodes);
  return path;
}

export type TreeFilterResult = {
  filteredData: CmTreeNode[];
  expandedIds: Set<string>;
  highlightedNode: string | null;
};

/**
 * Filtra a árvore por `query` (nome/code/slug), mantendo os ancestrais dos nós
 * que casam. Retorna os ids que precisam ficar expandidos e o primeiro nó
 * destacado. Função pura — a aplicação do `expandedIds` ao estado fica no
 * componente.
 */
export function filterTree(nodes: CmTreeNode[], rawQuery: string): TreeFilterResult {
  if (!Array.isArray(nodes) || !rawQuery.trim()) {
    return {
      filteredData: Array.isArray(nodes) ? nodes : [],
      expandedIds: new Set(),
      highlightedNode: null,
    };
  }

  const query = rawQuery.toLowerCase();
  let foundNode: string | null = null;
  const expandedIds = new Set<string>();

  const searchAndExpand = (list: CmTreeNode[], parentIds: string[] = []): CmTreeNode[] => {
    if (!Array.isArray(list)) return [];
    return list
      .map((node) => {
        const matches =
          node.name.toLowerCase().includes(query) ||
          node.code?.toLowerCase().includes(query) ||
          node.slug?.toLowerCase().includes(query);

        let filteredChildren: CmTreeNode[] = [];
        if (node.children) {
          filteredChildren = searchAndExpand(node.children, [...parentIds, node.id]);
        }

        if (matches || filteredChildren.length > 0) {
          if (matches && !foundNode) {
            foundNode = node.id;
          }
          parentIds.forEach((id) => expandedIds.add(id));
          if (filteredChildren.length > 0) {
            expandedIds.add(node.id);
          }
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as CmTreeNode[];
  };

  const filteredData = searchAndExpand(nodes);
  return { filteredData, expandedIds, highlightedNode: foundNode };
}
