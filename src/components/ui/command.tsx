"use client";

import { KeyboardEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { CmButton } from "./button.js";
import { CmDialog } from "./dialog.js";
import { cn } from "../../lib/utils.js";
import type { CmDialogSize } from "./types.js";

export type CmCommandItem = {
  id: string;
  label: string;
  keywords?: string[];
  shortcut?: string;
  icon?: ReactNode;
  onSelect?: () => void;
};

export type CmCommandProps = {
  items: CmCommandItem[];
  placeholder?: string;
  title?: string;
  description?: string;
  emptyMessage?: string;
  /** Letter opened with Ctrl on Windows/Linux or Command on macOS. */
  keyboardShortcut?: string;
  /** Appearance of the built-in button. The input appearance remains a button until opened. */
  triggerAppearance?: "button" | "input";
  triggerPlaceholder?: string;
  size?: "sm" | "md" | "lg";
  dialogSize?: CmDialogSize;
  /** Custom trigger. When omitted, the built-in search button is rendered. */
  trigger?: (open: () => void) => ReactNode;
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function CmCommand({
  items,
  placeholder = "Digite um comando",
  title = "Comandos",
  description = "Pesquise e execute ações rapidamente",
  emptyMessage = "Nenhum comando encontrado.",
  keyboardShortcut,
  triggerAppearance = "button",
  triggerPlaceholder,
  size = "md",
  dialogSize = "md",
  trigger,
}: CmCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const getItemId = (item: CmCommandItem) => `${listId}-${item.id}`;

  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query).trim();
    if (!normalized) return items;
    return items.filter((item) => {
      const text = normalizeSearch([item.label, ...(item.keywords ?? [])].join(" "));
      return text.includes(normalized);
    });
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    resultsRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, filtered, open]);

  useEffect(() => {
    if (!keyboardShortcut) return;
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey) return;
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === keyboardShortcut.toLowerCase()
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [keyboardShortcut]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const handleSelect = (item: CmCommandItem) => {
    item.onSelect?.();
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % filtered.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + filtered.length) % filtered.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = filtered[activeIndex];
      if (item) handleSelect(item);
    }
  };

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <CmButton
          unstyled={triggerAppearance === "input"}
          type="button"
          variant="surface"
          size={size}
          onClick={() => setOpen(true)}
          aria-label={title}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-keyshortcuts={
            keyboardShortcut ? `Control+${keyboardShortcut} Meta+${keyboardShortcut}` : undefined
          }
          className={cn(
            "cm-command__trigger",
            triggerAppearance === "input" && "cm-command__trigger--input",
            `cm-command__trigger--${size}`,
          )}
        >
          <Search aria-hidden="true" className="cm-command__trigger-icon" />
          <span className="cm-command__trigger-label">{triggerPlaceholder ?? placeholder}</span>
          {keyboardShortcut ? (
            <kbd className="cm-command__shortcut" aria-hidden="true">
              Ctrl {keyboardShortcut.toUpperCase()}
            </kbd>
          ) : null}
        </CmButton>
      )}
      <CmDialog
        open={open}
        onClose={close}
        title={title}
        description={description}
        size={dialogSize}
        className={`cm-command-dialog cm-command-dialog--${size}`}
        initialFocusRef={inputRef}
      >
        <div className="cm-command__search">
          <Search className="cm-command__search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            className="cm-command__input"
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={placeholder}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              filtered[activeIndex] ? getItemId(filtered[activeIndex]) : undefined
            }
          />
        </div>
        <div ref={resultsRef} className="cm-command" id={listId} role="listbox" aria-label={title}>
          {filtered.length === 0 ? (
            <div className="cm-command__empty" role="status">
              {emptyMessage}
            </div>
          ) : (
            filtered.map((item, index) => (
              <CmButton
                unstyled
                key={item.id}
                id={getItemId(item)}
                type="button"
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cm-command__item${index === activeIndex ? " cm-command__item--active" : ""}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <span className="cm-command__item-main">
                  {item.icon}
                  <span className="cm-command__item-label">{item.label}</span>
                </span>
                {item.shortcut ? <kbd className="cm-command__shortcut">{item.shortcut}</kbd> : null}
              </CmButton>
            ))
          )}
        </div>
      </CmDialog>
    </>
  );
}
CmCommand.displayName = "CmCommand";
