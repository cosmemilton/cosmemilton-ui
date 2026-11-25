"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bookmark, Ellipsis, Plus, Save, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { CmDropdownMenu, type CmDropdownMenuItem } from "./dropdown-menu.js";
import { CmField } from "./field.js";

export type CmSavedViewSnapshot<T> = {
  label: string;
  snapshot: T;
};

export type CmSavedView<T> = CmSavedViewSnapshot<T> & {
  /** Unique non-empty identifier within this collection. */
  id: string;
};

const defaultLabels = {
  label: "Visões salvas",
  defaultView: "Visão padrão",
  saveView: "Salvar visão",
  manageView: "Gerenciar visão",
  updateView: "Atualizar visão",
  deleteView: "Excluir visão",
  viewName: "Nome da visão",
  unsaved: "Alterações não salvas",
  cancel: "Cancelar",
  save: "Salvar",
  update: "Atualizar",
  remove: "Excluir",
  duplicateName: "Já existe uma visão com esse nome.",
  operationError: "Não foi possível concluir a operação. Tente novamente.",
  confirmDelete: (label: string) => "Excluir a visão “" + label + "”?",
};

export type CmSavedViewsLabels = typeof defaultLabels;

export type CmSavedViewsProps<T> = {
  views: readonly CmSavedView<T>[];
  activeViewId: string | null;
  /** The app's current filters, ordering, columns, or other immutable view state. */
  currentSnapshot: T;
  /** The app applies the entire snapshot. A null view means restore app defaults. */
  onApply: (view: CmSavedView<T> | null) => void;
  onCreate?: (view: CmSavedViewSnapshot<T>) => void | Promise<void>;
  onUpdate?: (id: string, view: CmSavedViewSnapshot<T>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  /** Set when the current configuration differs from the active view. */
  dirty?: boolean;
  disabled?: boolean;
  className?: string;
  labels?: Partial<CmSavedViewsLabels>;
};

type Operation =
  | { kind: "create" }
  | { kind: "update" | "delete"; id: string; originalLabel: string };

/** Controlled view selector and optional mutations; state and persistence belong to the app. */
export function CmSavedViews<T>({
  views,
  activeViewId,
  currentSnapshot,
  onApply,
  onCreate,
  onUpdate,
  onDelete,
  dirty = false,
  disabled = false,
  className,
  labels,
}: CmSavedViewsProps<T>) {
  const copy = { ...defaultLabels, ...labels };
  const selectId = useId();
  const statusId = useId();
  const editorTitleId = useId();
  const nameId = useId();
  const busyRef = useRef(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const activeView = views.find((view) => view.id === activeViewId);
  const editedView =
    operation && operation.kind !== "create"
      ? views.find((view) => view.id === operation.id)
      : undefined;
  const normalizedName = name.trim();
  const duplicateName =
    Boolean(normalizedName) &&
    views.some(
      (view) =>
        view.id !== editedView?.id &&
        view.label.trim().toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
    );
  const deleteOperation = operation?.kind === "delete";
  const operationAvailable =
    operation?.kind === "create"
      ? Boolean(onCreate)
      : operation?.kind === "update"
        ? Boolean(onUpdate && editedView)
        : Boolean(onDelete && editedView);

  useEffect(() => {
    if (operation) (operation.kind === "delete" ? cancelRef : nameRef).current?.focus();
  }, [operation]);

  function openEditor(next: Operation) {
    setName(next.kind === "update" ? next.originalLabel : "");
    setFailed(false);
    setOperation(next);
  }

  function closeEditor(restoreFocus: boolean) {
    if (restoreFocus && operation) {
      const ref = operation.kind === "create" ? saveRef : selectRef;
      // Wait for pending/disabled attributes to be removed before restoring focus.
      ref.current?.ownerDocument.defaultView?.requestAnimationFrame(() => ref.current?.focus());
    }
    setOperation(null);
    setFailed(false);
  }

  async function submit() {
    if (
      !operation ||
      disabled ||
      busyRef.current ||
      !operationAvailable ||
      (operation.kind !== "delete" &&
        (!normalizedName || duplicateName || normalizedName.length > 100))
    ) {
      return;
    }

    busyRef.current = true;
    setPending(true);
    setFailed(false);
    try {
      const view = { label: normalizedName, snapshot: currentSnapshot };
      if (operation.kind === "create") await onCreate?.(view);
      else if (operation.kind === "update") await onUpdate?.(operation.id, view);
      else await onDelete?.(operation.id);
      closeEditor(true);
    } catch {
      setFailed(true);
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  const items: CmDropdownMenuItem[] = [];
  if (activeView && onUpdate) {
    items.push({
      id: "update",
      label: copy.updateView,
      icon: <Save size={16} aria-hidden="true" />,
      onSelect: () =>
        openEditor({ kind: "update", id: activeView.id, originalLabel: activeView.label }),
    });
  }
  if (activeView && onDelete) {
    items.push({
      id: "delete",
      label: copy.deleteView,
      icon: <Trash2 size={16} aria-hidden="true" />,
      danger: true,
      onSelect: () =>
        openEditor({ kind: "delete", id: activeView.id, originalLabel: activeView.label }),
    });
  }

  return (
    <div className={cn("cm-saved-views", className)}>
      <div className="cm-saved-views__toolbar">
        <CmField
          className="cm-saved-views__selector"
          control="native"
          htmlFor={selectId}
          label={
            <span className="cm-saved-views__label">
              <Bookmark size={14} aria-hidden="true" /> {copy.label}
            </span>
          }
        >
          <select
            id={selectId}
            ref={selectRef}
            value={activeView?.id ?? ""}
            disabled={disabled || pending}
            aria-describedby={dirty ? statusId : undefined}
            onChange={(event) => {
              const id = event.currentTarget.value;
              closeEditor(false);
              onApply(views.find((view) => view.id === id) ?? null);
            }}
          >
            <option value="">{copy.defaultView}</option>
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.label}
              </option>
            ))}
          </select>
        </CmField>
        {onCreate || items.length > 0 ? (
          <div className="cm-saved-views__actions">
            {onCreate ? (
              <CmButton
                ref={saveRef}
                size="sm"
                variant="outline"
                tone="primary"
                disabled={disabled || pending}
                icon={<Plus size={16} aria-hidden="true" />}
                onClick={() => openEditor({ kind: "create" })}
              >
                {copy.saveView}
              </CmButton>
            ) : null}
            {items.length > 0 ? (
              <CmDropdownMenu
                align="end"
                keyboardNavigation
                items={items}
                trigger={({ open, toggle, ref, onKeyDown }) => (
                  <CmButton
                    ref={ref}
                    size="sm"
                    variant="ghost"
                    iconOnly
                    icon={<Ellipsis size={18} aria-hidden="true" />}
                    aria-label={copy.manageView}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    disabled={disabled || pending}
                    onClick={toggle}
                    onKeyDown={onKeyDown}
                  />
                )}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      <div id={statusId} className="cm-saved-views__status" role="status">
        {dirty ? copy.unsaved : null}
      </div>

      {operation ? (
        <div
          className="cm-saved-views__editor"
          role="group"
          aria-labelledby={editorTitleId}
          aria-busy={pending || undefined}
        >
          <p id={editorTitleId} className="cm-saved-views__editor-title">
            {operation.kind === "create"
              ? copy.saveView
              : operation.kind === "update"
                ? copy.updateView
                : copy.confirmDelete(editedView?.label ?? operation.originalLabel)}
          </p>
          {!deleteOperation ? (
            <CmField
              control="native"
              label={copy.viewName}
              htmlFor={nameId}
              error={duplicateName ? copy.duplicateName : undefined}
            >
              <input
                id={nameId}
                ref={nameRef}
                value={name}
                maxLength={100}
                aria-invalid={duplicateName || undefined}
                disabled={disabled || pending}
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  setFailed(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    event.stopPropagation();
                    void submit();
                  }
                }}
              />
            </CmField>
          ) : null}
          {failed || !operationAvailable ? (
            <p className="cm-saved-views__error" role="alert">
              {copy.operationError}
            </p>
          ) : null}
          <div className="cm-saved-views__editor-actions">
            <CmButton
              ref={cancelRef}
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => closeEditor(true)}
            >
              {copy.cancel}
            </CmButton>
            <CmButton
              size="sm"
              tone={deleteOperation ? "danger" : "primary"}
              loading={pending}
              disabled={
                disabled ||
                !operationAvailable ||
                (!deleteOperation && (!normalizedName || duplicateName))
              }
              onClick={() => void submit()}
            >
              {deleteOperation
                ? copy.remove
                : operation.kind === "update"
                  ? copy.update
                  : copy.save}
            </CmButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

CmSavedViews.displayName = "CmSavedViews";
