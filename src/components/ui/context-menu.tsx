"use client";

import { MouseEvent as ReactMouseEvent, ReactNode, useEffect, useRef, useState } from "react";
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
  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setOpen(true);
  };

  useEscapeKey(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
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
