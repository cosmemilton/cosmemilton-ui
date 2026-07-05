"use client";

import { useState, type CSSProperties, type DragEvent, type FC, type ReactNode } from "react";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  File,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { CmButton } from "./button.js";
import { CmCheckbox } from "./checkbox.js";
import { cn } from "../../lib/utils.js";
import type { CmTreeDropPosition, CmTreeNode, CmTreeNodeAction } from "./tree-view.types.js";

export interface SortableTreeItemProps {
  node: CmTreeNode;
  level: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  isDragging?: boolean;
  dropPosition?: CmTreeDropPosition;
  onToggle: () => void;
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
  dragSourceEnabled?: boolean;
  maxDepth?: number;
  // Modo de seleção com checkbox (novo)
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (permissionId: number, checked: boolean) => void;
  // Ícones customizáveis (opcionais; default mantém Folder/FolderOpen/File)
  branchIcon?: ReactNode;
  branchOpenIcon?: ReactNode;
  leafIcon?: ReactNode;
}

export const SortableTreeItem: FC<SortableTreeItemProps> = ({
  node,
  level,
  isExpanded,
  isHighlighted,
  isDragging = false,
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
  draggable = true,
  dragSourceEnabled = draggable,
  maxDepth,
  selectionMode = false,
  selectedIds,
  onSelectionChange,
  branchIcon,
  branchOpenIcon,
  leafIcon,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isDropTarget = dropPosition !== undefined;
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
  const customActions = nodeActions?.(node) ?? [];

  // Ícone do nó. Precedência: ícone próprio do nó > override por tipo/estado
  // (branch/branchOpen/leaf) > default (Folder/FolderOpen/File).
  let nodeIcon: ReactNode;
  if (node.icon != null) {
    nodeIcon = node.icon;
  } else if (hasChildren) {
    nodeIcon = isExpanded
      ? (branchOpenIcon ?? <FolderOpen className="cm-tree-view__node-svg" />)
      : (branchIcon ?? <Folder className="cm-tree-view__node-svg" />);
  } else {
    nodeIcon = leafIcon ?? <File className="cm-tree-view__node-svg" />;
  }

  return (
    <div
      style={style}
      className={cn(
        "cm-tree-view__item",
        isDragging && "cm-tree-view__item--dragging",
        isDropTarget && "cm-tree-view__item--drop-target",
        dropPosition && `cm-tree-view__item--drop-${dropPosition}`,
        !node.active && "cm-tree-view__item--inactive",
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
          dropPosition === "inside" && "cm-tree-view__node--drop-target",
        )}
        style={
          {
            paddingLeft: `${level * 24 + 12}px`,
            "--tv-level": level,
          } as CSSProperties
        }
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
        {!selectionMode && dragSourceEnabled && (
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
        <div className={cn("cm-tree-view__node-icon", colorClass)}>{nodeIcon}</div>

        {/* Name */}
        <CmButton
          unstyled
          type="button"
          onClick={() =>
            selectionMode && isLeaf && node.permissionId !== undefined
              ? onSelectionChange?.(node.permissionId, !selectedIds?.has(node.permissionId))
              : onSelect?.(node)
          }
          className="cm-tree-view__node-name"
        >
          {node.name}
        </CmButton>

        {/* Code/Slug CmBadge */}
        {node.code && <span className="cm-tree-view__badge">{node.code}</span>}

        {/* Actions (ocultar no modo de seleção) */}
        {!selectionMode && (
          <div
            className={cn(
              "cm-tree-view__actions",
              showActions ? "cm-tree-view__actions--visible" : "",
            )}
          >
            {onAdd && (!maxDepth || level < maxDepth - 1) && (
              <CmButton
                unstyled
                type="button"
                onClick={() => onAdd(node.id)}
                className="cm-tree-view__action-button cm-tree-view__action-button--add"
                aria-label="Add Subcategory"
                title="Add Subcategory"
              >
                <Plus className="cm-tree-view__small-icon" />
              </CmButton>
            )}
            {onEdit && (
              <CmButton
                unstyled
                type="button"
                onClick={() => onEdit(node)}
                className="cm-tree-view__action-button cm-tree-view__action-button--edit"
                aria-label="Edit"
                title="Edit"
              >
                <Pencil className="cm-tree-view__small-icon" />
              </CmButton>
            )}
            {customActions.map((action) => (
              <CmButton
                key={action.key}
                unstyled
                type="button"
                onClick={() => action.onClick(node)}
                className={cn(
                  "cm-tree-view__action-button",
                  "cm-tree-view__action-button--custom",
                  action.className,
                )}
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </CmButton>
            ))}
            {onDelete && (
              <CmButton
                unstyled
                type="button"
                onClick={() => onDelete(node)}
                className="cm-tree-view__action-button cm-tree-view__action-button--delete"
                aria-label="Delete"
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
SortableTreeItem.displayName = "SortableTreeItem";
