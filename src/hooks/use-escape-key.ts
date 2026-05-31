"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `handler` whenever the user presses the `Escape` key while `enabled`.
 *
 * The handler is read through a ref so passing an inline function does not
 * resubscribe the listener on every render. Used by overlays/menus that should
 * dismiss on Escape (dialog, drawer, select, combobox, multi-select,
 * context-menu, split-button, command).
 */
export function useEscapeKey(enabled: boolean, handler: (event: KeyboardEvent) => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlerRef.current(event);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
