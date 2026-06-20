"use client";

import { ReactNode, useRef } from "react";
import { CmPortal } from "./portal.js";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useScrollLock } from "../../hooks/use-scroll-lock.js";
import { useFocusTrap } from "../../hooks/use-focus-trap.js";

type DrawerSide = "left" | "right" | "bottom" | "top";

export type CmDrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  children: ReactNode;
  className?: string;
  title?: string;
};

const sideClass: Record<DrawerSide, string> = {
  left: "cm-drawer__panel--left",
  right: "cm-drawer__panel--right",
  bottom: "cm-drawer__panel--bottom",
  top: "cm-drawer__panel--top",
};


export function CmDrawer({
  open,
  onClose,
  side = "right",
  children,
  className,
  title,
}: CmDrawerProps) {
  const sourceRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);


  useScrollLock(open);
  useEscapeKey(open, onClose);
  useFocusTrap(panelRef, { enabled: open });


  if (!open) return <span ref={sourceRef} hidden />;

  return (
    <>
      <span ref={sourceRef} hidden />
      <CmPortal>
        <div className="cm-drawer__portal-scope">
          <div className="cm-drawer__overlay" role="presentation" onClick={onClose} />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-label={title}
            className={cn("cm-drawer__panel", sideClass[side], className)}
          >
            <div className="cm-drawer__header">
              {title ? <h2 className="cm-drawer__title">{title}</h2> : null}
              <CmButton unstyled type="button" onClick={onClose} className="cm-drawer__close">
                Fechar
              </CmButton>
            </div>
            <div className="cm-drawer__body">{children}</div>
          </div>
        </div>
      </CmPortal>
    </>
  );
}
CmDrawer.displayName = "CmDrawer";
