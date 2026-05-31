"use client";

import { useEffect, useRef, type RefObject } from "react";

type AnyRef = RefObject<HTMLElement | null>;

/**
 * Calls `handler` on a pointer press that lands outside every referenced
 * element. Pass the panel ref plus any trigger refs that should count as
 * "inside" so clicking the trigger does not immediately re-close the overlay.
 *
 * Refs and handler are read through refs, so the listener only resubscribes
 * when `enabled` changes — inline ref arrays are fine. Used by popover, select,
 * combobox, multi-select and split-button.
 */
export function useClickOutside(
  refs: AnyRef | AnyRef[],
  handler: (event: MouseEvent) => void,
  enabled: boolean = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const isInside = list.some((ref) => ref.current?.contains(target));
      if (!isInside) handlerRef.current(event);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [enabled]);
}
