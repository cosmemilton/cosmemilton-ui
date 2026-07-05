"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type DragEvent,
  type ReactNode,
} from "react";
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
import type {
  CmTreeDropMode,
  CmTreeDropPosition,
  CmTreeMoveDetails,
  CmTreeNode,
  CmTreeNodeAction,
} from "./tree-view.types.js";
import { TreeBranch } from "./tree-view-branch.js";
import {
  collectAllNodeIds,
  collectExpandableIds,
  filterTree,
  findBreadcrumbPath,
  findNodeLevel,
  findNodesAtLevel,
  moveNodeRelativeToTarget,
  pruneToSolitaryPath,
} from "./tree-view.utils.js";

export type {
  CmTreeDropMode,
  CmTreeDropPosition,
  CmTreeMoveDetails,
  CmTreeNode,
  CmTreeNodeAction,
} from "./tree-view.types.js";

export interface CmTreeViewProps {
  data: CmTreeNode[];
  onAdd?: (parentId: string | null) => void;
  onEdit?: (node: CmTreeNode) => void;
  onDelete?: (node: CmTreeNode) => void;
  /** Ações extras por nó (ex.: "clonar"), renderizadas entre editar e remover. Recebe o nó e retorna a lista de ações a exibir para ele. */
  nodeActions?: (node: CmTreeNode) => CmTreeNodeAction[];
  onMove?: (
    nodeId: string,
    newParentId: string | null,
    newOrder: number,
    details: CmTreeMoveDetails,
  ) => void;
  onReorder?: (nodes: CmTreeNode[]) => void;
  /** Valida o destino antes de exibir e efetivar o drop. */
  canDrop?: (details: CmTreeMoveDetails) => boolean;
  searchable?: boolean;
  draggable?: boolean;
  /** Permite habilitar o arraste por nó sem desativar o DnD da árvore inteira. */
  isDraggable?: (node: CmTreeNode) => boolean;
  /** `auto` habilita zonas para soltar antes, dentro ou depois do alvo. */
  dropMode?: CmTreeDropMode;
  showBreadcrumb?: boolean;
  expandedByDefault?: boolean;
  className?: string;
  // Novos props para integração com PageHeader
  showHeader?: boolean;
  showFooter?: boolean;
  showBorder?: boolean;
  /** Botões nativos de expandir/recolher tudo, ao lado do switch. Padrão: true. */
  showExpandCollapse?: boolean;
  /** Switch "Modo Solitário" na barra de controles. Padrão: true. */
  showSolitaryToggle?: boolean;
  /** Controles extras renderizados na barra (entre expandir/recolher e o switch). */
  controlsSlot?: ReactNode;
  /** Sobrescreve o ícone padrão de pasta fechada (nós com filhos, recolhidos). */
  branchIcon?: ReactNode;
  /** Sobrescreve o ícone padrão de pasta aberta (nós com filhos, expandidos). */
  branchOpenIcon?: ReactNode;
  /** Sobrescreve o ícone padrão de folha (nós sem filhos). */
  leafIcon?: ReactNode;
  headerText?: {
    expandAll?: string;
    collapseAll?: string;
    addRoot?: string;
    search?: string;
    solitaryMode?: string;
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
  nodeActions,
  onMove,
  onReorder,
  canDrop,
  searchable = true,
  draggable = true,
  isDraggable,
  dropMode = "before",
  showBreadcrumb = true,
  expandedByDefault = false,
  className,
  showHeader = true,
  showFooter = true,
  showBorder = true,
  showExpandCollapse = true,
  showSolitaryToggle = true,
  controlsSlot,
  branchIcon,
  branchOpenIcon,
  leafIcon,
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
      const all = collectExpandableIds(data);
      // Modo solitário inicial: já abre apenas um ramo.
      return solitaryMode ? pruneToSolitaryPath(data, all) : all;
    }
    return new Set<string>();
  });
  const [selectedNode, setSelectedNode] = useState<CmTreeNode | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: CmTreeDropPosition;
  } | null>(null);

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

  // Liga/desliga o modo solitário. Ao ligar, recolhe os ramos abertos
  // mantendo apenas um caminho aberto — assim o efeito é imediato.
  const handleSolitaryChange = useCallback(
    (enabled: boolean) => {
      setInternalSolitaryMode(enabled);
      onSolitaryModeChange?.(enabled);
      if (enabled && Array.isArray(data)) {
        setExpandedNodes((prev) => pruneToSolitaryPath(data, prev));
      }
    },
    [data, onSolitaryModeChange],
  );

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
    if (!draggable || selectionMode || isDraggable?.(node) === false) return;
    setActiveId(node.id);
    setDropTarget(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
  };

  const getDropPosition = (event: DragEvent<HTMLElement>): CmTreeDropPosition => {
    if (dropMode === "before") return "before";

    const { top, height } = event.currentTarget.getBoundingClientRect();
    if (height <= 0) return "inside";
    const ratio = (event.clientY - top) / height;
    if (ratio < 0.25) return "before";
    if (ratio > 0.75) return "after";
    return "inside";
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, node: CmTreeNode) => {
    if (!activeId) return;
    if (activeId === node.id) {
      setDropTarget(null);
      return;
    }
    const position = getDropPosition(event);
    const moved = moveNodeRelativeToTarget(data, activeId, node.id, position, maxDepth);
    if (!moved || canDrop?.(moved.details) === false) {
      event.dataTransfer.dropEffect = "none";
      setDropTarget(null);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget((current) =>
      current?.id === node.id && current.position === position
        ? current
        : { id: node.id, position },
    );
  };

  const handleDrop = (event: DragEvent<HTMLElement>, node: CmTreeNode) => {
    event.preventDefault();
    const draggedId = activeId ?? event.dataTransfer.getData("text/plain");
    const position = dropTarget?.id === node.id ? dropTarget.position : getDropPosition(event);
    setActiveId(null);
    setDropTarget(null);

    if (!draggedId || draggedId === node.id) return;

    const moved = moveNodeRelativeToTarget(data, draggedId, node.id, position, maxDepth);
    if (!moved || canDrop?.(moved.details) === false) return;

    onMove?.(draggedId, moved.parentId, moved.order, moved.details);
    if (position === "inside") {
      setExpandedNodes((current) => new Set(current).add(node.id));
    }
    onReorder?.(moved.nodes);
  };

  const handleDragEnd = () => {
    setActiveId(null);
    setDropTarget(null);
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
    solitaryMode: headerText.solitaryMode || "Modo Solitário",
  };

  // Cluster de controles exibido na barra (ao lado do switch).
  const hasBarControls = showExpandCollapse || controlsSlot != null || showSolitaryToggle;
  const treeControls = hasBarControls ? (
    <div className="cm-tree-view__bar-controls">
      {showSolitaryToggle && (
        <div className="cm-tree-view__mode">
          <span className="cm-tree-view__mode-label">{texts.solitaryMode}</span>
          <CmSwitch
            aria-label={texts.solitaryMode}
            checked={internalSolitaryMode}
            onCheckedChange={handleSolitaryChange}
          />
        </div>
      )}
      {showExpandCollapse && (
        <div className="cm-tree-view__icon-controls">
          <CmButton
            unstyled
            type="button"
            onClick={expandAll}
            className="cm-tree-view__control-icon"
            title={texts.expandAll}
            aria-label={texts.expandAll}
          >
            <ChevronsDown className="cm-tree-view__small-icon" />
          </CmButton>
          <CmButton
            unstyled
            type="button"
            onClick={collapseAll}
            className="cm-tree-view__control-icon"
            title={texts.collapseAll}
            aria-label={texts.collapseAll}
          >
            <ChevronsUp className="cm-tree-view__small-icon" />
          </CmButton>
        </div>
      )}
      {controlsSlot}
    </div>
  ) : null;

  return (
    <div className={cn("cm-tree-view", className)}>
      {/* Header - Só mostra se não estiver usando busca externa */}
      {showHeader && !onExternalSearchChange && (searchable || onAdd) && (
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

          {onAdd && (
            <div className="cm-tree-view__controls">
              <CmButton onClick={() => onAdd(null)} className="cm-tree-view__control-button">
                <Plus className="cm-tree-view__button-icon" />
                {texts.addRoot}
              </CmButton>
            </div>
          )}
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
          {treeControls}
        </div>
      )}

      {/* Barra de controles (quando não há breadcrumb) */}
      {!showBreadcrumb && treeControls && (
        <div className="cm-tree-view__controls-bar">{treeControls}</div>
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
              dropTargetId={dropTarget?.id ?? null}
              dropPosition={dropTarget?.position}
              onToggle={toggleNode}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              nodeActions={nodeActions}
              onSelect={setSelectedNode}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              draggable={draggable}
              isDraggable={isDraggable}
              maxDepth={maxDepth}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
              branchIcon={branchIcon}
              branchOpenIcon={branchOpenIcon}
              leafIcon={leafIcon}
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
