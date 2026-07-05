"use client";

import { Fragment, type DragEvent, type FC, type ReactNode } from "react";
import { SortableTreeItem } from "./tree-view-item.js";
import type { CmTreeDropPosition, CmTreeNode, CmTreeNodeAction } from "./tree-view.types.js";

export interface TreeBranchProps {
  nodes: CmTreeNode[];
  level: number;
  expandedNodes: Set<string>;
  highlightedNode: string | null;
  activeId: string | null;
  dropTargetId: string | null;
  dropPosition?: CmTreeDropPosition;
  onToggle: (nodeId: string) => void;
  onAdd?: (parentId: string | null) => void;
  onEdit?: (node: CmTreeNode) => void;
  onDelete?: (node: CmTreeNode) => void;
  nodeActions?: (node: CmTreeNode) => CmTreeNodeAction[];
  onSelect?: (node: CmTreeNode) => void;
  onDragStart?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDragOver?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDrop?: (event: DragEvent<HTMLElement>, node: CmTreeNode) => void;
  onDragEnd?: () => void;
  draggable?: boolean;
  isDraggable?: (node: CmTreeNode) => boolean;
  maxDepth?: number;
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (permissionId: number, checked: boolean) => void;
  branchIcon?: ReactNode;
  branchOpenIcon?: ReactNode;
  leafIcon?: ReactNode;
}

export const TreeBranch: FC<TreeBranchProps> = ({
  nodes,
  level,
  expandedNodes,
  highlightedNode,
  activeId,
  dropTargetId,
  dropPosition,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  nodeActions,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggable,
  isDraggable,
  maxDepth,
  selectionMode,
  selectedIds,
  onSelectionChange,
  branchIcon,
  branchOpenIcon,
  leafIcon,
}) => {
  return (
    <>
      {nodes.map((node) => (
        <Fragment key={node.id}>
          <SortableTreeItem
            node={node}
            level={level}
            isExpanded={expandedNodes.has(node.id)}
            isHighlighted={highlightedNode === node.id}
            isDragging={activeId === node.id}
            dropPosition={
              dropTargetId === node.id && activeId !== node.id ? dropPosition : undefined
            }
            onToggle={() => onToggle(node.id)}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            nodeActions={nodeActions}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            draggable={draggable}
            dragSourceEnabled={draggable && (isDraggable?.(node) ?? true)}
            maxDepth={maxDepth}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            branchIcon={branchIcon}
            branchOpenIcon={branchOpenIcon}
            leafIcon={leafIcon}
          />
          {expandedNodes.has(node.id) && node.children && node.children.length > 0 && (
            <TreeBranch
              nodes={node.children}
              level={level + 1}
              expandedNodes={expandedNodes}
              highlightedNode={highlightedNode}
              activeId={activeId}
              dropTargetId={dropTargetId}
              dropPosition={dropPosition}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              nodeActions={nodeActions}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
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
          )}
        </Fragment>
      ))}
    </>
  );
};
TreeBranch.displayName = "TreeBranch";
