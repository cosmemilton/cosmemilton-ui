"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils.js";
import { cmSizeValue } from "./types.js";

export function CmPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
CmPortal.displayName = "CmPortal";

type CmPortalPanelPlacement =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

type CmPortalPanelStyle = CSSProperties & Partial<Record<`--${string}`, string | number>>;

export type CmPortalPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  offset?: string | number;
  placement?: CmPortalPanelPlacement;
  width?: string | number;
  maxWidth?: string | number;
  zIndex?: number;
};

export const CmPortalPanel = forwardRef<HTMLDivElement, CmPortalPanelProps>(
  function CmPortalPanel(
    {
      children,
      className,
      offset = "1.5rem",
      placement = "bottom-end",
      width,
      maxWidth = "22rem",
      zIndex = 999,
      style,
      ...props
    },
    ref,
  ) {
  const panelStyle: CmPortalPanelStyle = {
    "--cm-portal-panel-offset": cmSizeValue(offset),
    "--cm-portal-panel-max-width": cmSizeValue(maxWidth),
    "--cm-portal-panel-z-index": zIndex,
    ...(width ? { "--cm-portal-panel-width": cmSizeValue(width) } : {}),
    ...style,
  };

  return (
    <CmPortal>
      <div
        ref={ref}
        className={cn("cm-portal-panel", `cm-portal-panel--${placement}`, className)}
        style={panelStyle}
        {...props}
      >
        {children}
      </div>
    </CmPortal>
  );
});
CmPortalPanel.displayName = "CmPortalPanel";
