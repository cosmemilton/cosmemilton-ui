"use client";

import { useEffect, type RefObject } from "react";
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from "@floating-ui/react";

type UseFloatingOptions = {
  enabled?: boolean;
  /** Anchor placement, e.g. "bottom-start" | "bottom" | "bottom-end". */
  placement?: Placement;
  /** Gap in pixels between reference and floating element. */
  offset?: number;
  /** Give the floating element at least the reference's width (dropdowns). */
  matchWidth?: boolean;
  /** Viewport padding preserved by flip/shift collision handling. */
  padding?: number;
};

/**
 * Positions `floatingRef` against `referenceRef` using Floating UI — the same
 * engine MUI Popper and Radix build on. Writes a fixed-strategy `top`/`left`
 * (and optional `min-width`) directly onto the floating element, matching the
 * `position: fixed` panels these components already ship, and keeps it in sync
 * on scroll/resize/reflow via `autoUpdate`.
 *
 * Replaces the bespoke `getBoundingClientRect` positioning effects in popover,
 * select, combobox, multi-select and split-button with consistent
 * flip/shift/collision behaviour.
 */
export function useFloating(
  referenceRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  {
    enabled = true,
    placement = "bottom-start",
    offset: offsetPx = 4,
    matchWidth = false,
    padding = 8,
  }: UseFloatingOptions = {},
): void {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let animationFrame: number | null = null;
    let cleanupAutoUpdate: (() => void) | undefined;

    const clearPendingFrame = () => {
      if (animationFrame === null) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    };

    const startFloating = () => {
      animationFrame = null;
      if (cancelled || cleanupAutoUpdate) return;

      const reference = referenceRef.current;
      const floating = floatingRef.current;

      if (!reference || !floating) {
        animationFrame = window.requestAnimationFrame(startFloating);
        return;
      }

      const middleware = [offset(offsetPx), flip({ padding }), shift({ padding })];
      if (matchWidth) {
        middleware.push(
          size({
            padding,
            apply({ rects, elements }) {
              elements.floating.style.minWidth = `${rects.reference.width}px`;
            },
          }),
        );
      }

      const update = () => {
        computePosition(reference, floating, {
          strategy: "fixed",
          placement,
          middleware,
        }).then(({ x, y }) => {
          if (cancelled || floatingRef.current !== floating) return;
          Object.assign(floating.style, {
            position: "fixed",
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      };

      cleanupAutoUpdate = autoUpdate(reference, floating, update);
    };

    startFloating();

    return () => {
      cancelled = true;
      clearPendingFrame();
      cleanupAutoUpdate?.();
    };
  }, [enabled, placement, offsetPx, matchWidth, padding, referenceRef, floatingRef]);
}
