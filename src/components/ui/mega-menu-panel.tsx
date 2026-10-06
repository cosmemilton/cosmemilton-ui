"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue } from "./types.js";

export type MegaMenuPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  width?: number | string;
  header?: ReactNode;
  footer?: ReactNode;
  /** Adds semantics or focus behavior to the scrollable body without changing menu defaults. */
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  /** Places listbox semantics on the results grid without including header/footer controls. */
  gridProps?: HTMLAttributes<HTMLDivElement>;
};

/** Shared, private surface for grouped navigation and grouped search results. */
export const MegaMenuPanel = forwardRef<HTMLDivElement, MegaMenuPanelProps>(function MegaMenuPanel(
  {
    bodyProps,
    children,
    className,
    columns = 4,
    footer,
    gridProps,
    header,
    style,
    width = 960,
    ...props
  },
  ref,
) {
  const panelStyle = {
    "--cm-mega-panel-columns": columns,
    "--cm-mega-panel-width": cmSizeValue(width),
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn("cm-mega-panel", className)}
      style={panelStyle}
      data-columns={columns}
      {...props}
    >
      {header ? <div className="cm-mega-panel__header">{header}</div> : null}
      <div {...bodyProps} className={cn("cm-mega-panel__body", bodyProps?.className)}>
        <div {...gridProps} className={cn("cm-mega-panel__grid", gridProps?.className)}>
          {children}
        </div>
      </div>
      {footer ? <div className="cm-mega-panel__footer">{footer}</div> : null}
    </div>
  );
});
MegaMenuPanel.displayName = "MegaMenuPanel";
