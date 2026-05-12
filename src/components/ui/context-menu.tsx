"use client";

import { MouseEvent as ReactMouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { CmPortal } from "./portal";
import { cn } from "../../lib/utils";

type ContextMenuItem = {
  id: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
};

type ContextMenuProps = {
  target: ReactNode;
  items: ContextMenuItem[];
  className?: string;
};

type Position = { x: number; y: number };

export function CmContextMenu({ target, items, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("click", close);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;

    const updatePosition = () => {
      const panel = panelRef.current;
      if (!panel) return;

      const gap = 8;
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

    requestAnimationFrame(updatePosition);
  }, [open, position.x, position.y]);

  return (
    <div onContextMenu={handleContextMenu} className="cm-context-menu">
      {target}
      {open ? (
        <CmPortal>
          <div
            ref={panelRef}
            role="menu"
            className={cn(
              "cm-context-menu__panel",
              className,
            )}
          >
            {items.map((item) => (
              <button
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
              </button>
            ))}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
