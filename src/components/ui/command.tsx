"use client";

import { KeyboardEvent, ReactNode, useEffect, useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CmButton } from "./button.js";
import { CmDialog } from "./dialog.js";

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
  trigger: (open: () => void) => ReactNode;
};

export function CmCommand({
  items,
  placeholder = "Digite um comando",
  title = "Comandos",
  description = "Pesquise e execute ações rapidamente",
  emptyMessage = "Nenhum comando encontrado.",
  trigger,
}: CmCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const getItemId = (item: CmCommandItem) => `${listId}-${item.id}`;

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return items;
    return items.filter((item) => {
      const text = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

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
    if (event.key === "Escape") {
      close();
      return;
    }

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
      handleSelect(filtered[activeIndex]);
    }
  };

  return (
    <>
      {trigger(() => setOpen(true))}
      <CmDialog
        open={open}
        onClose={close}
        title={title}
        description={description}
        size="sm"
      >
        <div className="cm-command__search">
          <Search className="cm-command__search-icon" aria-hidden="true" />
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- command palette intentionally focuses its search input when opened
            autoFocus
            className="cm-command__input"
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={placeholder}
            aria-controls={listId}
            aria-activedescendant={filtered[activeIndex] ? getItemId(filtered[activeIndex]) : undefined}
          />
        </div>
        <div className="cm-command" id={listId} role="listbox">
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
                {item.shortcut ? (
                  <kbd className="cm-command__shortcut">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </CmButton>
            ))
          )}
        </div>
      </CmDialog>
    </>
  );
}
CmCommand.displayName = "CmCommand";
