"use client";

import React, { useState, useMemo, useEffect, useCallback, type DragEvent } from "react";
import {
  GripVertical,
  ChevronRight,
  Folder,
  Plus,
  Search,
  X,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
  FolderOpen,
} from "lucide-react";
import { CmInput } from "./input.js";
import { CmButton } from "./button.js";
import { CmSwitch } from "./switch.js";
import { cn } from "../../lib/utils.js";
import type { CmTreeNode } from "./tree-view.types.js";
import { TreeBranch } from "./tree-view-branch.js";
import {
  collectAllNodeIds,
  collectExpandableIds,
  filterTree,
  findBreadcrumbPath,
  findNodeLevel,
  findNodesAtLevel,
  moveNodeBeforeTarget,
} from "./tree-view.utils.js";

export type { CmTreeNode } from "./tree-view.types.js";

export interface CmTreeViewProps {
  data: CmTreeNode[];
  onAdd?: (parentId: string | null) => void;
  onEdit?: (node: CmTreeNode) => void;
  onDelete?: (node: CmTreeNode) => void;
  onMove?: (nodeId: string, newParentId: string | null, newOrder: number) => void;
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
  onTreeControlsReady?: (controls: { expandAll: () => void; collapseAll: () => void }) => void;
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
  const [internalSolitaryMode, setInternalSolitaryMode] = useState(solitaryMode);

  // Usa busca externa se fornecida, senão usa interna
  const searchQuery = externalSearch !== undefined ? externalSearch : internalSearch;
  const setSearchQuery = onExternalSearchChange || setInternalSearch;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (expandedByDefault && Array.isArray(data)) {
      return collectExpandableIds(data);
    }
    return new Set<string>();
  });
  const [selectedNode, setSelectedNode] = useState<CmTreeNode | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Funções de controle
  const expandAll = useCallback(() => {
    if (!Array.isArray(data)) return;
    // Desligar modo solitário ao expandir tudo
    if (internalSolitaryMode) {
      setInternalSolitaryMode(false);
      onSolitaryModeChange?.(false);
    }
    setExpandedNodes(collectExpandableIds(data));
  }, [data, internalSolitaryMode, onSolitaryModeChange]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Expor controles para o componente pai
  useEffect(() => {
    if (onTreeControlsReady) {
      onTreeControlsReady({ expandAll, collapseAll });
    }
  }, [onTreeControlsReady, expandAll, collapseAll]);

  // Busca recursiva com destaque
  const { filteredData, highlightedNode } = useMemo(() => {
    const { filteredData, expandedIds, highlightedNode } = filterTree(data, searchQuery);

    // Auto-expandir os ancestrais dos nós que casam durante a busca.
    if (searchQuery.trim()) {
      setExpandedNodes((prev) => {
        const newExpanded = new Set(prev);
        expandedIds.forEach((id) => newExpanded.add(id));
        return newExpanded;
      });
    }

    return { filteredData, highlightedNode };
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

  const handleDragStart = (event: DragEvent<HTMLElement>, node: CmTreeNode) => {
    if (!draggable || selectionMode) return;
    setActiveId(node.id);
    setDropTargetId(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, node: CmTreeNode) => {
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
    return findBreadcrumbPath(data, selectedNode.id);
  }, [selectedNode, data]);

  // Flatten all nodes for sortable context
  const allNodeIds = useMemo(() => collectAllNodeIds(data), [data]);

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
              <CmButton onClick={() => onAdd(null)} className="cm-tree-view__control-button">
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
                    {index > 0 && <ChevronRight className="cm-tree-view__tiny-icon" />}
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
            <span className="cm-tree-view__mode-label">Modo Solitário</span>
            <CmSwitch
              aria-label="Modo Solitário"
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
          <span className="cm-tree-view__mode-label">Modo Solitário</span>
          <CmSwitch
            aria-label="Modo Solitário"
            checked={internalSolitaryMode}
            onCheckedChange={(checked: boolean) => {
              setInternalSolitaryMode(checked);
              onSolitaryModeChange?.(checked);
            }}
          />
        </div>
      )}

      {/* Tree */}
      <div className={cn("cm-tree-view__panel", showBorder && "cm-tree-view__panel--bordered")}>
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
                {searchQuery ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
              </p>
              {!searchQuery && onAdd && (
                <CmButton onClick={() => onAdd(null)} className="cm-tree-view__empty-button">
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
                  Total: {allNodeIds.length} {allNodeIds.length === 1 ? "categoria" : "categorias"}
                </span>
                <span>•</span>
                <span>
                  Expandidos: {expandedNodes.size} {expandedNodes.size === 1 ? "nó" : "nós"}
                </span>
              </div>
              {searchQuery && (
                <span className="cm-tree-view__footer-result">
                  {filteredData.length} {filteredData.length === 1 ? "resultado" : "resultados"}{" "}
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
CmTreeView.displayName = "CmTreeView";
