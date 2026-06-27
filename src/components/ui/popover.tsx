"use client";

import { CSSProperties, ReactNode, useCallback, useRef } from "react";
import { CmPortal } from "./portal.js";
import { cmSizeValue } from "./types.js";
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
  /** Largura do painel (número → px). Por padrão acompanha o conteúdo. */
  width?: string | number;
  /** Largura máxima do painel (número → px). Padrão: 22rem, limitada ao viewport. */
  maxWidth?: string | number;
};

export function CmPopover({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = "center",
  className,
  width,
  maxWidth,
}: CmPopoverProps) {
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

  const placement = align === "center" ? "bottom" : align === "end" ? "bottom-end" : "bottom-start";
  useFloating(triggerRef, panelRef, { enabled: open, placement, offset: 8 });

  const panelStyle = {
    ...(width !== undefined ? { "--cm-popover-width": cmSizeValue(width) } : {}),
    ...(maxWidth !== undefined ? { "--cm-popover-max-width": cmSizeValue(maxWidth) } : {}),
  } as CSSProperties;

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
          <div ref={panelRef} className={cn("cm-popover__panel", className)} style={panelStyle}>
            {typeof children === "function" ? children({ close }) : children}
          </div>
        </CmPortal>
      ) : null}
    </>
  );
}
CmPopover.displayName = "CmPopover";
