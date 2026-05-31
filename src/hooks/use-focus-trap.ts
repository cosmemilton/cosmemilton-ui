"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type UseFocusTrapOptions = {
  enabled?: boolean;
  /** Restore focus to the previously focused element on teardown. */
  returnFocus?: boolean;
};

/**
 * Confines Tab/Shift+Tab focus within `containerRef` while `enabled`, focuses
 * the first focusable element (or the container itself) on mount, and returns
 * focus to the previously focused element on teardown. Intended for modal
 * surfaces (dialog, drawer) and menus.
 *
 * The container should be focusable (e.g. `tabIndex={-1}`) so focus has a home
 * when it holds no focusable children.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { enabled = true, returnFocus = true }: UseFocusTrapOptions = {},
): void {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("hidden") && el.getAttribute("aria-hidden") !== "true",
      );

    const focusables = getFocusable();
    (focusables[0] ?? container).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      if (returnFocus && typeof previouslyFocused?.focus === "function") {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [enabled, containerRef, returnFocus]);
}
