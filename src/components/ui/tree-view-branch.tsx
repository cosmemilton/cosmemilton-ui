"use client";

import { Fragment, type DragEvent, type FC } from "react";
import { SortableTreeItem } from "./tree-view-item.js";
import type { CmTreeNode } from "./tree-view.types.js";

export interface TreeBranchProps {
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
}

export const TreeBranch: FC<TreeBranchProps> = ({
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
        <Fragment key={node.id}>
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
        </Fragment>
      ))}
    </>
  );
};
TreeBranch.displayName = "TreeBranch";
