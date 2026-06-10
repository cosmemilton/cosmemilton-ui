"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export type UseListboxKeyboardOptions = {
  /** Whether the listbox popup is open. */
  open: boolean;
  setOpen: (open: boolean) => void;
  itemCount: number;
  /** Called with the index of the item activated via Enter/Space. */
  onActivate: (index: number) => void;
  /** Index highlighted when the popup opens (e.g. the selected option). */
  initialIndex?: number;
  /** Searchable label per index; enables typeahead (button triggers only). */
  getLabel?: (index: number) => string;
  /** Close the popup after activating an item. Multi-select passes false. */
  closeOnActivate?: boolean;
  /**
   * Trigger is a text input (combobox): printable keys, Home/End and Space
   * keep editing the text instead of navigating the list.
   */
  textInput?: boolean;
  disabled?: boolean;
};

export type UseListboxKeyboardReturn = {
  /** Visually highlighted item (separate from the selected one). -1 = none. */
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  /** id for the element with role="listbox" (wired via aria-controls). */
  listboxId: string;
  getOptionId: (index: number) => string;
  /** Spread on each option element: stable id + hover-follows-highlight. */
  getOptionProps: (index: number) => {
    id: string;
    onMouseEnter: () => void;
  };
  /** Spread on the trigger (button or input). */
  triggerProps: {
    onKeyDown: (event: React.KeyboardEvent) => void;
    "aria-controls": string | undefined;
    "aria-activedescendant": string | undefined;
  };
};

const TYPEAHEAD_RESET_MS = 500;

/**
 * Keyboard contract of the WAI-ARIA listbox popup patterns (select-only
 * combobox, editable combobox and multi-select listbox): DOM focus stays on
 * the trigger, the highlighted option is exposed through
 * `aria-activedescendant`, and ArrowUp/Down, Home/End, Enter/Space, Tab and
 * typeahead drive the highlight. Escape is intentionally not handled here —
 * components already close via `useEscapeKey`.
 */
export function useListboxKeyboard({
  open,
  setOpen,
  itemCount,
  onActivate,
  initialIndex = -1,
  getLabel,
  closeOnActivate = true,
  textInput = false,
  disabled = false,
}: UseListboxKeyboardOptions): UseListboxKeyboardReturn {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const wasOpenRef = useRef(false);
  // Index requested by the key that opened the popup (ArrowUp wants the last
  // item, Home the first…); consumed by the open-transition effect below.
  const pendingIndexRef = useRef<number | null>(null);
  const typeaheadRef = useRef({ query: "", at: 0 });

  const getOptionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);

  const clampedInitial = useCallback(() => {
    if (initialIndex >= 0 && initialIndex < itemCount) return initialIndex;
    return itemCount > 0 ? 0 : -1;
  }, [initialIndex, itemCount]);

  // Highlight on open, clear on close. `clampedInitial` is read only at the
  // open transition so toggling items in a multi-select does not yank the
  // highlight back to the first checked option.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open) {
      pendingIndexRef.current = null;
      setActiveIndex(-1);
      return;
    }
    if (!wasOpen) {
      const pending = pendingIndexRef.current;
      pendingIndexRef.current = null;
      setActiveIndex(pending !== null && pending < itemCount ? pending : clampedInitial());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlight in range when the list changes while open (filtering).
  useEffect(() => {
    if (!open) return;
    setActiveIndex((current) =>
      itemCount === 0 ? -1 : current >= itemCount ? itemCount - 1 : current,
    );
  }, [itemCount, open]);

  useEffect(() => {
    if (!open || activeIndex < 0 || typeof document === "undefined") return;
    document.getElementById(getOptionId(activeIndex))?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, getOptionId, open]);

  const moveTo = (index: number) => {
    if (itemCount === 0) return;
    setActiveIndex(Math.min(Math.max(index, 0), itemCount - 1));
  };

  const openAt = (index: number | null) => {
    pendingIndexRef.current = index;
    setOpen(true);
  };

  const findTypeaheadMatch = (key: string): number => {
    if (!getLabel || itemCount === 0) return -1;
    const now = Date.now();
    const state = typeaheadRef.current;
    state.query = now - state.at > TYPEAHEAD_RESET_MS ? key : state.query + key;
    state.at = now;
    const query = state.query.toLowerCase();
    const start = activeIndex >= 0 ? activeIndex + (state.query.length === 1 ? 1 : 0) : 0;
    for (let offset = 0; offset < itemCount; offset += 1) {
      const index = (start + offset) % itemCount;
      if (getLabel(index).toLowerCase().startsWith(query)) return index;
    }
    return -1;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    const { key } = event;
    const last = itemCount - 1;
    const isTypeaheadKey =
      !textInput && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp") {
        event.preventDefault();
        openAt(initialIndex >= 0 ? initialIndex : key === "ArrowDown" ? 0 : last);
        return;
      }
      if (!textInput && (key === "Enter" || key === " ")) {
        event.preventDefault();
        openAt(null);
        return;
      }
      if (!textInput && (key === "Home" || key === "End")) {
        event.preventDefault();
        openAt(key === "Home" ? 0 : last);
        return;
      }
      if (isTypeaheadKey && key !== " ") {
        const match = findTypeaheadMatch(key);
        if (match >= 0) {
          event.preventDefault();
          openAt(match);
        }
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(activeIndex < 0 ? 0 : activeIndex + 1);
        return;
      case "ArrowUp":
        event.preventDefault();
        moveTo(activeIndex < 0 ? last : activeIndex - 1);
        return;
      case "Home":
        if (textInput) return;
        event.preventDefault();
        moveTo(0);
        return;
      case "End":
        if (textInput) return;
        event.preventDefault();
        moveTo(last);
        return;
      case "Tab":
        setOpen(false);
        return;
      case " ":
        if (textInput) return;
      // fallthrough
      case "Enter":
        event.preventDefault();
        if (activeIndex >= 0) {
          onActivate(activeIndex);
          if (closeOnActivate) setOpen(false);
        }
        return;
      default:
        if (isTypeaheadKey) {
          const match = findTypeaheadMatch(key);
          if (match >= 0) {
            event.preventDefault();
            setActiveIndex(match);
          }
        }
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    listboxId,
    getOptionId,
    getOptionProps: (index: number) => ({
      id: getOptionId(index),
      onMouseEnter: () => setActiveIndex(index),
    }),
    triggerProps: {
      onKeyDown,
      "aria-controls": listboxId,
      "aria-activedescendant": open && activeIndex >= 0 ? getOptionId(activeIndex) : undefined,
    },
  };
}
