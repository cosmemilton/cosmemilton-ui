"use client";

import React, { useState, useMemo, useEffect, type DragEvent } from "react";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
  FolderOpen,
} from "lucide-react";
import { CmInput } from "./input.js";
import { CmButton } from "./button.js";
import { CmCheckbox } from "./checkbox.js";
import { CmSwitch } from "./switch.js";
import { cn } from "../../lib/utils.js";

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

export interface CmTreeViewProps {
  data: CmTreeNode[];
  onAdd?: (parentId: string | null) => void;
  onEdit?: (node: CmTreeNode) => void;
  onDelete?: (node: CmTreeNode) => void;
  onMove?: (
    nodeId: string,
    newParentId: string | null,
    newOrder: number
  ) => void;
  onReorder?: (nodes: CmTreeNode[]) => void;
  searchable?: boolean;
  draggable?: boolean;
  showBreadcrumb?: boolean;
  expandedByDefault?: boolean;
  className?: string;
  // Novos props para integração com PageHeader
  showHeader?: boolean;
  showFooter?: boolean;
  showBorder?: boolean;
  headerText?: {
    expandAll?: string;
    collapseAll?: string;
    addRoot?: string;
    search?: string;
  };
  // Controles externos (quando usado com PageHeader)
  externalSearch?: string;
  onExternalSearchChange?: (value: string) => void;
  onTreeControlsReady?: (controls: {
    expandAll: () => void;
    collapseAll: () => void;
  }) => void;
  // Limite de níveis na hierarquia
  maxDepth?: number; // Se definido, limita quantos níveis podem ser criados
  // Modo de seleção com checkbox (novo)
  selectionMode?: boolean;
  selectedIds?: Set<number>; // IDs das permissões selecionadas
  onSelectionChange?: (permissionId: number, checked: boolean) => void;
  // Modo solitário (apenas um ramo aberto por vez)
  solitaryMode?: boolean;
  onSolitaryModeChange?: (enabled: boolean) => void;
}

interface SortableTreeItemProps {
  node: CmTreeNode;
  level: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onToggle: () => void;
  onAdd?: (parentId: string | null) => void;
  onEdit?: (node: CmTreeNode) => void;
  onDelete?: (node: CmTreeNode) => void;
  onSelect?: (node: CmTreeNode) => void;
  onDragStart?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDragOver?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDrop?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDragEnd?: () => void;
  draggable?: boolean;
  maxDepth?: number;
  // Modo de seleção com checkbox (novo)
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (permissionId: number, checked: boolean) => void;
}

const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  node,
  level,
  isExpanded,
  isHighlighted,
  isDragging = false,
  isDropTarget = false,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggable = true,
  maxDepth,
  selectionMode = false,
  selectedIds,
  onSelectionChange,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const [showActions, setShowActions] = useState(false);
  const isLeaf = !hasChildren; // Nó folha (sem filhos)
  const isSelected =
    selectionMode &&
    isLeaf &&
    node.permissionId !== undefined &&
    Boolean(selectedIds?.has(node.permissionId));

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  // Cores por nível
  const levelColors = [
    "cm-tree-view__node-icon--level-0",
    "cm-tree-view__node-icon--level-1",
    "cm-tree-view__node-icon--level-2",
    "cm-tree-view__node-icon--level-3",
    "cm-tree-view__node-icon--level-4",
  ];

  const colorClass = levelColors[level % levelColors.length];

  return (
    <div
      style={style}
      className={cn(
        "cm-tree-view__item",
        isDragging && "cm-tree-view__item--dragging",
        isDropTarget && "cm-tree-view__item--drop-target",
        !node.active && "cm-tree-view__item--inactive"
      )}
      onDragOver={draggable ? (event) => onDragOver?.(event, node) : undefined}
      onDrop={draggable ? (event) => onDrop?.(event, node) : undefined}
    >
      <div
        className={cn(
          "cm-tree-view__node",
          isHighlighted && "cm-tree-view__node--highlighted",
          isSelected && "cm-tree-view__node--selected",
          isDragging && "cm-tree-view__node--dragging",
          isDropTarget && "cm-tree-view__node--drop-target"
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* CmCheckbox (somente em modo de seleção e apenas para nós folha) */}
        {selectionMode && isLeaf && node.permissionId !== undefined ? (
          <CmCheckbox
            id={`perm-${node.permissionId}`}
            checked={selectedIds?.has(node.permissionId) || false}
            onChange={() => {
              const permId = node.permissionId!;
              onSelectionChange?.(permId, !selectedIds?.has(permId));
            }}
          />
        ) : null}

        {/* Drag Handle */}
        {!selectionMode && draggable && (
          <CmButton
            unstyled
            type="button"
            draggable
            className="cm-tree-view__drag-handle"
            aria-label="Drag to reorder"
            onDragStart={(event) => onDragStart?.(event, node)}
            onDragEnd={onDragEnd}
          >
            <GripVertical className="cm-tree-view__small-icon" />
          </CmButton>
        )}

        {/* Expand/Collapse */}
        {hasChildren ? (
          <CmButton
            unstyled
            type="button"
            onClick={onToggle}
            className="cm-tree-view__toggle"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="cm-tree-view__small-icon" />
            ) : (
              <ChevronRight className="cm-tree-view__small-icon" />
            )}
          </CmButton>
        ) : (
          <div className="cm-tree-view__toggle-spacer" />
        )}

        {/* CmIcon */}
        <div className={cn("cm-tree-view__node-icon", colorClass)}>
          {hasChildren ? (
            <Folder className="cm-tree-view__node-svg" />
          ) : (
            <File className="cm-tree-view__node-svg" />
          )}
        </div>

        {/* Name */}
        <CmButton
          unstyled
          type="button"
          onClick={() =>
            selectionMode && isLeaf && node.permissionId !== undefined
              ? onSelectionChange?.(
                  node.permissionId,
                  !selectedIds?.has(node.permissionId)
                )
              : onSelect?.(node)
          }
          className="cm-tree-view__node-name"
        >
          {node.name}
        </CmButton>

        {/* Code/Slug CmBadge */}
        {node.code && (
          <span className="cm-tree-view__badge">
            {node.code}
          </span>
        )}

        {/* Actions (ocultar no modo de seleção) */}
        {!selectionMode && (
          <div
            className={cn(
              "cm-tree-view__actions",
              showActions ? "cm-tree-view__actions--visible" : ""
            )}
          >
            {onAdd && (!maxDepth || level < maxDepth - 1) && (
              <CmButton
                variant="ghost"
                onClick={() => onAdd(node.id)}
                className="cm-tree-view__action-button cm-tree-view__action-button--add"
                title="Add Subcategory"
              >
                <Plus className="cm-tree-view__small-icon" />
              </CmButton>
            )}
            {onEdit && (
              <CmButton
                variant="ghost"
                onClick={() => onEdit(node)}
                className="cm-tree-view__action-button cm-tree-view__action-button--edit"
                title="Edit"
              >
                <Pencil className="cm-tree-view__small-icon" />
              </CmButton>
            )}
            {onDelete && (
              <CmButton
                variant="ghost"
                onClick={() => onDelete(node)}
                className="cm-tree-view__action-button cm-tree-view__action-button--delete"
                tone="danger"
                title="Delete"
              >
                <Trash2 className="cm-tree-view__small-icon" />
              </CmButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TreeBranch: React.FC<{
  nodes: CmTreeNode[];
  level: number;
  expandedNodes: Set<string>;
  highlightedNode: string | null;
  activeId: string | null;
  dropTargetId: string | null;
  onToggle: (nodeId: string) => void;
  onAdd?: (parentId: string | null) => void;
  onEdit?: (node: CmTreeNode) => void;
  onDelete?: (node: CmTreeNode) => void;
  onSelect?: (node: CmTreeNode) => void;
  onDragStart?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDragOver?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDrop?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDragEnd?: () => void;
  draggable?: boolean;
  maxDepth?: number;
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (permissionId: number, checked: boolean) => void;
}> = ({
  nodes,
  level,
  expandedNodes,
  highlightedNode,
  activeId,
  dropTargetId,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggable,
  maxDepth,
  selectionMode,
  selectedIds,
  onSelectionChange,
}) => {
  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          <SortableTreeItem
            node={node}
            level={level}
            isExpanded={expandedNodes.has(node.id)}
            isHighlighted={highlightedNode === node.id}
            isDragging={activeId === node.id}
            isDropTarget={dropTargetId === node.id && activeId !== node.id}
            onToggle={() => onToggle(node.id)}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            draggable={draggable}
            maxDepth={maxDepth}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
          />
          {expandedNodes.has(node.id) &&
            node.children &&
            node.children.length > 0 && (
              <TreeBranch
                nodes={node.children}
                level={level + 1}
                expandedNodes={expandedNodes}
                highlightedNode={highlightedNode}
                activeId={activeId}
                dropTargetId={dropTargetId}
                onToggle={onToggle}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelect={onSelect}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                draggable={draggable}
                maxDepth={maxDepth}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
              />
            )}
        </React.Fragment>
      ))}
    </>
  );
};

type TreeNodeLocation = {
  node: CmTreeNode;
  parentId: string | null;
  index: number;
};

function findNodeLocation(
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

function nodeContainsId(node: CmTreeNode, targetId: string): boolean {
  if (node.id === targetId) return true;
  return node.children?.some((child) => nodeContainsId(child, targetId)) ?? false;
}

function removeNodeFromTree(
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

function insertNodeIntoTree(
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
        children: insertNodeIntoTree(
          node.children,
          parentId,
          nodeToInsert,
          targetIndex,
        ),
      };
    }

    return node;
  });
}

function moveNodeBeforeTarget(
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

export const CmTreeView: React.FC<CmTreeViewProps> = ({
  data,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onReorder,
  searchable = true,
  draggable = true,
  showBreadcrumb = true,
  expandedByDefault = false,
  className,
  showHeader = true,
  showFooter = true,
  showBorder = true,
  headerText = {},
  externalSearch,
  onExternalSearchChange,
  onTreeControlsReady,
  maxDepth,
  selectionMode = false,
  selectedIds,
  onSelectionChange,
  solitaryMode = false,
  onSolitaryModeChange,
}) => {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalSolitaryMode, setInternalSolitaryMode] =
    useState(solitaryMode);

  // Usa busca externa se fornecida, senão usa interna
  const searchQuery =
    externalSearch !== undefined ? externalSearch : internalSearch;
  const setSearchQuery = onExternalSearchChange || setInternalSearch;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (expandedByDefault && Array.isArray(data)) {
      const allIds = new Set<string>();
      const collectIds = (nodes: CmTreeNode[]) => {
        if (!Array.isArray(nodes)) return;
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            allIds.add(node.id);
            collectIds(node.children);
          }
        });
      };
      collectIds(data);
      return allIds;
    }
    return new Set<string>();
  });
  const [selectedNode, setSelectedNode] = useState<CmTreeNode | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Funções de controle
  const expandAll = () => {
    if (!Array.isArray(data)) return;
    // Desligar modo solitário ao expandir tudo
    if (internalSolitaryMode) {
      setInternalSolitaryMode(false);
      onSolitaryModeChange?.(false);
    }
    const allIds = new Set<string>();
    const collectIds = (nodes: CmTreeNode[]) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(data);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Expor controles para o componente pai
  useEffect(() => {
    if (onTreeControlsReady) {
      onTreeControlsReady({ expandAll, collapseAll });
    }
  }, [onTreeControlsReady]);

  // Busca recursiva com destaque
  const { filteredData, highlightedNode } = useMemo(() => {
    if (!Array.isArray(data) || !searchQuery.trim()) {
      return {
        filteredData: Array.isArray(data) ? data : [],
        highlightedNode: null,
      };
    }

    const query = searchQuery.toLowerCase();
    let foundNode: string | null = null;
    const expandedIds = new Set<string>();

    const searchAndExpand = (
      nodes: CmTreeNode[],
      parentIds: string[] = []
    ): CmTreeNode[] => {
      if (!Array.isArray(nodes)) return [];
      return nodes
        .map((node) => {
          const matches =
            node.name.toLowerCase().includes(query) ||
            node.code?.toLowerCase().includes(query) ||
            node.slug?.toLowerCase().includes(query);

          let filteredChildren: CmTreeNode[] = [];
          if (node.children) {
            filteredChildren = searchAndExpand(node.children, [
              ...parentIds,
              node.id,
            ]);
          }

          if (matches || filteredChildren.length > 0) {
            if (matches && !foundNode) {
              foundNode = node.id;
            }
            // Expandir pais
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

    const filtered = searchAndExpand(data);

    // Auto-expandir durante busca
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      expandedIds.forEach((id) => newExpanded.add(id));
      return newExpanded;
    });

    return { filteredData: filtered, highlightedNode: foundNode };
  }, [data, searchQuery]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        // Fechar nó
        newSet.delete(nodeId);
      } else {
        // Abrir nó
        if (internalSolitaryMode) {
          // Modo solitário: encontrar nível do nó e fechar outros no mesmo nível
          const nodeLevel = findNodeLevel(data, nodeId);
          const sameLevelNodes = findNodesAtLevel(data, nodeLevel);
          sameLevelNodes.forEach((id) => {
            if (id !== nodeId) newSet.delete(id);
          });
        }
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Função auxiliar para encontrar o nível de um nó
  const findNodeLevel = (
    nodes: CmTreeNode[],
    targetId: string,
    level = 0
  ): number => {
    for (const node of nodes) {
      if (node.id === targetId) return level;
      if (node.children) {
        const childLevel = findNodeLevel(node.children, targetId, level + 1);
        if (childLevel !== -1) return childLevel;
      }
    }
    return -1;
  };

  // Função auxiliar para encontrar todos os nós em um nível específico
  const findNodesAtLevel = (
    nodes: CmTreeNode[],
    targetLevel: number,
    currentLevel = 0
  ): string[] => {
    const result: string[] = [];
    for (const node of nodes) {
      if (currentLevel === targetLevel) {
        result.push(node.id);
      }
      if (node.children && currentLevel < targetLevel) {
        result.push(
          ...findNodesAtLevel(node.children, targetLevel, currentLevel + 1)
        );
      }
    }
    return result;
  };

  const handleDragStart = (
    event: DragEvent<HTMLElement>,
    node: CmTreeNode,
  ) => {
    if (!draggable || selectionMode) return;
    setActiveId(node.id);
    setDropTargetId(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
  };

  const handleDragOver = (
    event: DragEvent<HTMLElement>,
    node: CmTreeNode,
  ) => {
    if (!activeId || activeId === node.id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(node.id);
  };

  const handleDrop = (event: DragEvent<HTMLElement>, node: CmTreeNode) => {
    event.preventDefault();
    const draggedId = activeId ?? event.dataTransfer.getData("text/plain");
    setActiveId(null);
    setDropTargetId(null);

    if (!draggedId || draggedId === node.id) return;

    const moved = moveNodeBeforeTarget(data, draggedId, node.id);
    if (!moved) return;

    onMove?.(draggedId, moved.parentId, moved.order);
    onReorder?.(moved.nodes);
  };

  const handleDragEnd = () => {
    setActiveId(null);
    setDropTargetId(null);
  };

  // CmBreadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!selectedNode || !Array.isArray(data)) return [];

    const path: CmTreeNode[] = [];
    const findPath = (
      nodes: CmTreeNode[],
      targetId: string,
      currentPath: CmTreeNode[] = []
    ): boolean => {
      if (!Array.isArray(nodes)) return false;
      for (const node of nodes) {
        const newPath = [...currentPath, node];
        if (node.id === targetId) {
          path.push(...newPath);
          return true;
        }
        if (node.children && findPath(node.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(data, selectedNode.id);
    return path;
  }, [selectedNode, data]);

  // Flatten all nodes for sortable context
  const allNodeIds = useMemo(() => {
    const ids: string[] = [];
    const collect = (nodes: CmTreeNode[]) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        ids.push(node.id);
        if (node.children) collect(node.children);
      });
    };
    collect(data);
    return ids;
  }, [data]);

  // Textos padrão em português
  const texts = {
    expandAll: headerText.expandAll || "Expandir Tudo",
    collapseAll: headerText.collapseAll || "Recolher Tudo",
    addRoot: headerText.addRoot || "Adicionar Categoria Raiz",
    search: headerText.search || "Buscar categorias...",
  };

  return (
    <div className={cn("cm-tree-view", className)}>
      {/* Header - Só mostra se não estiver usando busca externa */}
      {showHeader && !onExternalSearchChange && (
        <div className="cm-tree-view__header">
          {searchable && (
            <div className="cm-tree-view__search">
              <Search className="cm-tree-view__search-icon" />
              <CmInput
                type="text"
                placeholder={texts.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cm-tree-view__search-input"
              />
              {searchQuery && (
                <CmButton
                  unstyled
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setSearchQuery("")}
                  className="cm-tree-view__search-clear"
                >
                  <X className="cm-tree-view__small-icon" />
                </CmButton>
              )}
            </div>
          )}

          <div className="cm-tree-view__controls">
            <CmButton
              variant="outline"
              onClick={expandAll}
              className="cm-tree-view__control-button"
            >
              <ChevronsDown className="cm-tree-view__button-icon" />
              {texts.expandAll}
            </CmButton>
            <CmButton
              variant="outline"
              onClick={collapseAll}
              className="cm-tree-view__control-button"
            >
              <ChevronsUp className="cm-tree-view__button-icon" />
              {texts.collapseAll}
            </CmButton>
            {onAdd && (
              <CmButton
                onClick={() => onAdd(null)}
                className="cm-tree-view__control-button"
              >
                <Plus className="cm-tree-view__button-icon" />
                {texts.addRoot}
              </CmButton>
            )}
          </div>
        </div>
      )}

      {/* CmBreadcrumb */}
      {showBreadcrumb && (
        <div className="cm-tree-view__breadcrumb">
          <div className="cm-tree-view__breadcrumb-path">
            <FolderTree className="cm-tree-view__small-icon" />
            {selectedNode && breadcrumbPath.length > 0 ? (
              <>
                {breadcrumbPath.map((node, index) => (
                  <React.Fragment key={node.id}>
                    {index > 0 && (
                      <ChevronRight className="cm-tree-view__tiny-icon" />
                    )}
                    <CmButton
                      unstyled
                      type="button"
                      aria-label={`Navigate to ${node.name}`}
                      onClick={() => {
                        setSelectedNode(node);
                        setExpandedNodes((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(node.id);
                          return newSet;
                        });
                      }}
                      className="cm-tree-view__breadcrumb-link"
                      title={`Navigate to ${node.name}`}
                    >
                      {node.name}
                    </CmButton>
                  </React.Fragment>
                ))}
              </>
            ) : (
              <span className="cm-tree-view__breadcrumb-empty">
                Clique em um item para ver o caminho
              </span>
            )}
          </div>
          <div className="cm-tree-view__mode">
            <span className="cm-tree-view__mode-label">
              Modo Solitário
            </span>
            <CmSwitch
              checked={internalSolitaryMode}
              onCheckedChange={(checked: boolean) => {
                setInternalSolitaryMode(checked);
                onSolitaryModeChange?.(checked);
              }}
            />
          </div>
        </div>
      )}

      {/* Modo Solitário (quando não há breadcrumb) */}
      {!showBreadcrumb && (
        <div className="cm-tree-view__mode cm-tree-view__mode--standalone">
          <span className="cm-tree-view__mode-label">
            Modo Solitário
          </span>
          <CmSwitch
            checked={internalSolitaryMode}
            onCheckedChange={(checked: boolean) => {
              setInternalSolitaryMode(checked);
              onSolitaryModeChange?.(checked);
            }}
          />
        </div>
      )}

      {/* Tree */}
      <div
        className={cn(
          "cm-tree-view__panel",
          showBorder && "cm-tree-view__panel--bordered"
        )}
      >
        <div className="cm-tree-view__scroll">
          {filteredData.length > 0 ? (
            <TreeBranch
              nodes={filteredData}
              level={0}
              expandedNodes={expandedNodes}
              highlightedNode={highlightedNode}
              activeId={activeId}
              dropTargetId={dropTargetId}
              onToggle={toggleNode}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={setSelectedNode}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              draggable={draggable}
              maxDepth={maxDepth}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
            />
          ) : (
            <div className="cm-tree-view__empty">
              <FolderOpen className="cm-tree-view__empty-icon" />
              <p className="cm-tree-view__empty-text">
                {searchQuery
                  ? "Nenhuma categoria encontrada"
                  : "Nenhuma categoria cadastrada"}
              </p>
              {!searchQuery && onAdd && (
                <CmButton
                  onClick={() => onAdd(null)}
                  className="cm-tree-view__empty-button"
                >
                  <Plus className="cm-tree-view__button-icon" />
                  Adicionar Primeira Categoria
                </CmButton>
              )}
            </div>
          )}
        </div>

        {activeId ? (
          <div className="cm-tree-view__drag-overlay" aria-hidden="true">
            <div className="cm-tree-view__drag-overlay-content">
              <GripVertical className="cm-tree-view__small-icon" />
              <Folder className="cm-tree-view__node-svg" />
              <span className="cm-tree-view__drag-text">Arrastando...</span>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {showFooter && (
          <div className="cm-tree-view__footer">
            <div className="cm-tree-view__footer-content">
              <div className="cm-tree-view__footer-stats">
                <span>
                  Total: {allNodeIds.length}{" "}
                  {allNodeIds.length === 1 ? "categoria" : "categorias"}
                </span>
                <span>•</span>
                <span>
                  Expandidos: {expandedNodes.size}{" "}
                  {expandedNodes.size === 1 ? "nó" : "nós"}
                </span>
              </div>
              {searchQuery && (
                <span className="cm-tree-view__footer-result">
                  {filteredData.length}{" "}
                  {filteredData.length === 1 ? "resultado" : "resultados"}{" "}
                  encontrados
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
