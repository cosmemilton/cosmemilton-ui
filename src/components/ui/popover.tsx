"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { CmPortal } from "./portal.js";
import { cn } from "../../lib/utils.js";

type PopoverTriggerControls = {
  open: boolean;
  close: () => void;
  toggle: () => void;
  ref: (element: HTMLButtonElement | null) => void;
};

type PopoverProps = {
  trigger: (controls: PopoverTriggerControls) => ReactNode;
  children: ReactNode | ((controls: { close: () => void }) => ReactNode);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  className?: string;
};

export function CmPopover({ trigger, children, open: controlledOpen, onOpenChange, align = "center", className }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  
  const toggle = useCallback(() => {
    setOpen(!open);
  }, [setOpen, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!panelRef.current || !triggerRef.current) {
        return;
      }
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const panel = panelRef.current;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const panelHeight = panel.offsetHeight;
      const panelWidth = panel.offsetWidth;

      let top = triggerRect.bottom + 8;
      if (top + panelHeight > viewportHeight) {
        top = triggerRect.top - panelHeight - 8;
      }

      let left: number;
      if (align === "center") {
        left = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;
      } else if (align === "end") {
        left = triggerRect.right - panelWidth;
      } else {
        left = triggerRect.left;
      }

      if (left < 0) left = 8;
      if (left + panelWidth > viewportWidth) {
        left = viewportWidth - panelWidth - 8;
      }

      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    };

    // Aguardar o próximo frame para garantir que o DOM foi atualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updatePosition();
      });
    });

    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, align]);

  return (
    <>
      {trigger({
        open,
        close,
        toggle,
        ref: (element) => {
          triggerRef.current = element;
        },
      })}
      {open ? (
        <CmPortal>
          <div
            ref={panelRef}
            className={cn(
              "cm-popover__panel",
              className,
            )}
          >
            {typeof children === "function" ? children({ close }) : children}
          </div>
        </CmPortal>
      ) : null}
    </>
  );
}
