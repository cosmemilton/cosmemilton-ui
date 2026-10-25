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

function isTabbable(element: HTMLElement, container: HTMLElement): boolean {
  if (element.tabIndex < 0 || element.closest('[hidden], [inert], [aria-hidden="true"]')) {
    return false;
  }
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = window.getComputedStyle(current);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse"
    ) {
      return false;
    }
    if (current === container) break;
  }
  return true;
}

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
    const previouslyFocused = document.activeElement as HTMLElement | null;
    let observer: MutationObserver | undefined;
    let detach: (() => void) | undefined;
    let attachedContainer: HTMLElement | undefined;

    const attach = () => {
      const container = containerRef.current;
      if (!container) return false;
      attachedContainer = container;
      observer?.disconnect();
      const getFocusable = () =>
        Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) =>
          isTabbable(element, container),
        );
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab" || event.defaultPrevented) return;
        const items = getFocusable();
        if (items.length === 0) {
          event.preventDefault();
          container.focus({ preventScroll: true });
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement;
        if (
          event.shiftKey
            ? active === first || !items.includes(active)
            : active === last || !items.includes(active)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus({ preventScroll: true });
        }
      };
      container.addEventListener("keydown", onKeyDown);
      detach = () => container.removeEventListener("keydown", onKeyDown);
      const active = document.activeElement;
      // A portal or nested surface may already have placed focus before this
      // deferred attachment. Preserve that explicit choice instead of stealing it.
      if (!container.contains(active) && (active === previouslyFocused || active === document.body)) {
        (getFocusable()[0] ?? container).focus({ preventScroll: true });
      }
      return true;
    };
    // CmPortal mounts after this effect. Observe that commit instead of polling.
    if (!attach()) {
      observer = new MutationObserver(attach);
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
      const initialized = Boolean(detach);
      detach?.();
      const active = document.activeElement;
      const ownsFocus = active === document.body || attachedContainer?.contains(active);
      if (initialized && returnFocus && ownsFocus && previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [enabled, containerRef, returnFocus]);
}
