"use client";

import { ReactNode, useCallback, useRef } from "react";
import { CmPortal } from "./portal.js";
import { cn } from "../../lib/utils.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useControllableState } from "../../hooks/use-controllable-state.js";
import { useFloating } from "../../hooks/use-floating.js";

type PopoverTriggerControls = {
  open: boolean;
  close: () => void;
  toggle: () => void;
  ref: (element: HTMLButtonElement | null) => void;
};

export type CmPopoverProps = {
  trigger: (controls: PopoverTriggerControls) => ReactNode;
  children: ReactNode | ((controls: { close: () => void }) => ReactNode);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  className?: string;
};

export function CmPopover({ trigger, children, open: controlledOpen, onOpenChange, align = "center", className }: CmPopoverProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  useClickOutside([panelRef, triggerRef], close, open);

  const placement =
    align === "center" ? "bottom" : align === "end" ? "bottom-end" : "bottom-start";
  useFloating(triggerRef, panelRef, { enabled: open, placement, offset: 8 });

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
CmPopover.displayName = "CmPopover";
