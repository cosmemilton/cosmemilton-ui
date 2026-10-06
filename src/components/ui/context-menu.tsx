"use client";

import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CmPortal } from "./portal.js";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";

type ContextMenuItem = {
  id: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
};

export type CmContextMenuProps = {
  target: ReactNode;
  items: ContextMenuItem[];
  className?: string;
};

type Position = { x: number; y: number };

export function CmContextMenu({ target, items, className }: CmContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setPosition({ x: event.clientX, y: event.clientY });
    setOpen(true);
  };

  useEscapeKey(open, () => {
    setOpen(false);
    returnFocusRef.current?.focus({ preventScroll: true });
  });

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const closeOnScroll = (event: Event) => {
      if (event.target instanceof Node && panel?.contains(event.target)) return;
      close();
    };
    document.addEventListener("click", close);
    document.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open, panel]);

  useLayoutEffect(() => {
    if (!open || !panel) return;

    const updatePosition = () => {
      const gap = 8;
      panel.style.minWidth = `${Math.min(180, Math.max(0, window.innerWidth - gap * 2))}px`;
      panel.style.maxWidth = `${Math.max(0, window.innerWidth - gap * 2)}px`;
      panel.style.maxHeight = `${Math.max(0, window.innerHeight - gap * 2)}px`;
      panel.style.overflowY = "auto";
      panel.style.overflowWrap = "anywhere";
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const maxLeft = Math.max(gap, viewportWidth - panelWidth - gap);
      const maxTop = Math.max(gap, viewportHeight - panelHeight - gap);
      const left = Math.min(Math.max(position.x, gap), maxLeft);
      const top = Math.min(Math.max(position.y, gap), maxTop);

      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    };

    updatePosition();
    panel
      .querySelector<HTMLButtonElement>("button:not([disabled])")
      ?.focus({ preventScroll: true });
    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updatePosition);
    observer?.observe(panel);
    window.addEventListener("resize", updatePosition);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, panel, position.x, position.y]);

  return (
    <div onContextMenu={handleContextMenu} className="cm-context-menu">
      {target}
      {open ? (
        <CmPortal>
          <div
            ref={setPanel}
            role="menu"
            tabIndex={-1}
            className={cn("cm-context-menu__panel", className)}
            onKeyDown={(event) => {
              const buttons = [
                ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button:not([disabled])",
                ),
              ];
              const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
              let next: number;
              if (event.key === "ArrowDown") next = (current + 1) % buttons.length;
              else if (event.key === "ArrowUp")
                next = (current - 1 + buttons.length) % buttons.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = buttons.length - 1;
              else if (event.key === "Tab") {
                setOpen(false);
                return;
              } else return;
              if (buttons.length) {
                event.preventDefault();
                buttons[next]?.focus();
              }
            }}
          >
            {items.map((item) => (
              <CmButton
                unstyled
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onSelect?.();
                    setOpen(false);
                  }
                }}
                className={cn(
                  "cm-context-menu__item",
                  item.disabled
                    ? "cm-context-menu__item--disabled"
                    : "cm-context-menu__item--active",
                )}
              >
                {item.label}
              </CmButton>
            ))}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
CmContextMenu.displayName = "CmContextMenu";
