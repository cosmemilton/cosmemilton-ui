"use client";

import { useEffect, useRef, type RefObject } from "react";
import { autoUpdate, computePosition, offset, shift } from "@floating-ui/react";

export type UseMegaPanelOptions = {
  enabled?: boolean;
  align?: "start" | "center" | "end";
  offset?: number;
  padding?: number;
  anchorKey?: string | null;
  /** Runs once after this panel/anchor is positioned, before keyboard focus is applied. */
  onPosition?: () => void;
};

/** A non-modal panel prefers the area below its anchor, falling back above when that area is too short. */
export function useMegaPanel(
  referenceRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  {
    enabled = true,
    align = "start",
    offset: gap = 8,
    padding = 8,
    anchorKey,
    onPosition,
  }: UseMegaPanelOptions = {},
): void {
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let frame: number | undefined;
    let cleanup: (() => void) | undefined;
    let positioned = false;

    const start = () => {
      frame = undefined;
      if (cancelled) return;
      const reference = referenceRef.current;
      const panel = panelRef.current;
      if (!reference || !panel) {
        frame = requestAnimationFrame(start);
        return;
      }
      delete panel.dataset.positioned;
      const update = () => {
        const viewport = window.visualViewport;
        const viewportWidth = viewport?.width ?? window.innerWidth;
        const viewportHeight = viewport?.height ?? window.innerHeight;
        const viewportTop = viewport?.offsetTop ?? 0;
        const anchor = reference.getBoundingClientRect();
        const belowStart = Math.max(viewportTop + padding, anchor.bottom + gap);
        panel.style.setProperty(
          "--cm-mega-panel-max-width",
          `${Math.max(0, viewportWidth - padding * 2)}px`,
        );
        const below = Math.max(0, viewportTop + viewportHeight - belowStart - padding);
        const above = Math.max(
          0,
          Math.min(viewportTop + viewportHeight - padding, anchor.top - gap) -
            viewportTop -
            padding,
        );
        const body = panel.querySelector<HTMLElement>(".cm-mega-panel__body");
        const desiredHeight = body
          ? body.scrollHeight +
            (panel.querySelector<HTMLElement>(".cm-mega-panel__header")?.offsetHeight ?? 0) +
            (panel.querySelector<HTMLElement>(".cm-mega-panel__footer")?.offsetHeight ?? 0) +
            (panel.offsetHeight - panel.clientHeight)
          : panel.scrollHeight;
        const side =
          below < Math.min(desiredHeight || 144, 144) && above > below ? "top" : "bottom";
        panel.style.setProperty(
          "--cm-mega-panel-max-height",
          `${side === "top" ? above : below}px`,
        );
        void computePosition(reference, panel, {
          strategy: "fixed",
          placement: align === "center" ? side : `${side}-${align}`,
          middleware: [offset(gap), shift({ padding })],
        }).then(({ x, y }) => {
          if (cancelled || panelRef.current !== panel) return;
          Object.assign(panel.style, {
            position: "fixed",
            left: `${x}px`,
            top: `${Math.max(viewportTop + padding, y)}px`,
          });
          panel.dataset.positioned = "true";
          if (!positioned) {
            positioned = true;
            onPositionRef.current?.();
          }
        });
      };
      cleanup = autoUpdate(reference, panel, update);
      viewportListen(update);
      function viewportListen(handler: () => void) {
        const viewport = window.visualViewport;
        viewport?.addEventListener("resize", handler);
        viewport?.addEventListener("scroll", handler);
        const cleanAutoUpdate = cleanup;
        cleanup = () => {
          cleanAutoUpdate?.();
          viewport?.removeEventListener("resize", handler);
          viewport?.removeEventListener("scroll", handler);
        };
      }
    };
    start();
    return () => {
      cancelled = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [enabled, align, gap, padding, anchorKey, referenceRef, panelRef]);
}
