"use client";

import { ReactNode, useId, useState } from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";

export type CmCollapsibleProps = {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function CmCollapsible({
  trigger,
  children,
  defaultOpen = false,
  className,
}: CmCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={cn("cm-collapsible", className)}>
      <CmButton
        unstyled
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? "open" : "closed"}
        onClick={() => setOpen((prev) => !prev)}
        className="cm-collapsible__trigger"
      >
        {trigger}
        <span className="cm-collapsible__indicator">{open ? "Ocultar" : "Mostrar"}</span>
      </CmButton>
      {open ? (
        <div id={contentId} className="cm-collapsible__content">
          {children}
        </div>
      ) : null}
    </div>
  );
}
CmCollapsible.displayName = "CmCollapsible";
