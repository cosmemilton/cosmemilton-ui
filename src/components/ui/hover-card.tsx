"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CmPortal } from "./portal.js";
import { cn } from "../../lib/utils.js";

type HoverCardProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function CmHoverCard({ trigger, children, className }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [panelElement, setPanelElement] = useState<HTMLDivElement | null>(null);

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const handleOpen = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    return clearCloseTimer;
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !panelElement) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panel = panelElement;
    const top = triggerRect.bottom + 8;
    const left = triggerRect.left + triggerRect.width / 2 - panel.offsetWidth / 2;
    panel.style.setProperty("top", `${top}px`);
    panel.style.setProperty("left", `${left}px`);
  }, [panelElement]);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  return (
    <div
      ref={triggerRef}
      onBlur={handleClose}
      onFocus={handleOpen}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      className="cm-hover-card"
    >
      {trigger}
      {open ? (
        <CmPortal>
          <div
            ref={setPanelElement}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            className={cn(
              "cm-hover-card__panel",
              className,
            )}
          >
            {children}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
