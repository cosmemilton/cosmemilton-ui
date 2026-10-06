import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type IframeHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import {
  cmDensityClass,
  cmSizeValue,
  cmSpacingValue,
  type CmDensity,
  type CmSpacing,
} from "./types.js";

type WorkbenchStyle = CSSProperties & Partial<Record<`--${string}`, string | number>>;

/** A workspace with a main surface and an optional, persistent tools panel. */
export type CmWorkbenchProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  toolbar?: ReactNode;
  inspector?: ReactNode;
  /** Hides the tools without unmounting them or losing their state. */
  inspectorOpen?: boolean;
  inspectorWidth?: number | string;
  inspectorSticky?: boolean;
  inspectorOffset?: number | string;
  inspectorMaxHeight?: number | string;
  footer?: ReactNode;
};

export const CmWorkbench = forwardRef<HTMLDivElement, CmWorkbenchProps>(function CmWorkbench(
  {
    children,
    className,
    footer,
    header,
    inspector,
    inspectorOpen = true,
    inspectorWidth = 320,
    inspectorSticky = false,
    inspectorOffset = 0,
    inspectorMaxHeight,
    style,
    toolbar,
    ...rest
  },
  ref,
) {
  const hasInspector = inspector !== undefined && inspector !== null;
  const variables: WorkbenchStyle = {
    "--cm-workbench-inspector-width": cmSizeValue(inspectorWidth),
    "--cm-workbench-inspector-offset": cmSizeValue(inspectorOffset),
    "--cm-workbench-inspector-max-height": cmSizeValue(inspectorMaxHeight),
    ...style,
  };

  return (
    <div ref={ref} className={cn("cm-workbench", className)} style={variables} {...rest}>
      {header ? <div className="cm-workbench__header">{header}</div> : null}
      <div
        className="cm-workbench__body"
        data-inspector={hasInspector && inspectorOpen ? "open" : "closed"}
      >
        <div className="cm-workbench__main">
          {toolbar ? <div className="cm-workbench__toolbar">{toolbar}</div> : null}
          {children}
        </div>
        {hasInspector ? (
          <div
            className={cn(
              "cm-workbench__inspector",
              inspectorSticky && "cm-workbench__inspector--sticky",
            )}
            hidden={!inspectorOpen}
          >
            {inspector}
          </div>
        ) : null}
      </div>
      {footer ? <div className="cm-workbench__footer">{footer}</div> : null}
    </div>
  );
});
CmWorkbench.displayName = "CmWorkbench";

/** A bounded canvas for editors, configurators, diagrams, or embedded content. */
export type CmCanvasProps = HTMLAttributes<HTMLDivElement> & {
  pattern?: "none" | "dots" | "grid";
  align?: "center" | "start";
  padding?: CmSpacing | string | number;
  minHeight?: number | string;
  contentWidth?: number | string;
  framed?: boolean;
};

export const CmCanvas = forwardRef<HTMLDivElement, CmCanvasProps>(function CmCanvas(
  {
    align = "center",
    children,
    className,
    contentWidth,
    framed = false,
    minHeight = 280,
    padding = "md",
    pattern = "dots",
    style,
    ...rest
  },
  ref,
) {
  const variables: WorkbenchStyle = {
    "--cm-canvas-content-width": cmSizeValue(contentWidth),
    "--cm-canvas-min-height": cmSizeValue(minHeight),
    "--cm-canvas-padding": cmSpacingValue(padding),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cn("cm-canvas", `cm-canvas--${pattern}`, `cm-canvas--align-${align}`, className)}
      style={variables}
      {...rest}
    >
      <div className={cn("cm-canvas__content", framed && "cm-canvas__content--framed")}>
        {children}
      </div>
    </div>
  );
});
CmCanvas.displayName = "CmCanvas";

/** Compact content grouping for settings panels, sidebars, and property editors. */
export type CmInspectorProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  density?: CmDensity;
};

export const CmInspector = forwardRef<HTMLDivElement, CmInspectorProps>(function CmInspector(
  { children, className, density = "compact", description, footer, title, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("cm-inspector", cmDensityClass(density), className)}
      data-density={density}
      {...rest}
    >
      {title || description ? (
        <div className="cm-inspector__heading">
          {title ? <h3 className="cm-inspector__title">{title}</h3> : null}
          {description ? <div className="cm-inspector__description">{description}</div> : null}
        </div>
      ) : null}
      <div className="cm-inspector__body">{children}</div>
      {footer ? <div className="cm-inspector__footer">{footer}</div> : null}
    </div>
  );
});
CmInspector.displayName = "CmInspector";

export type CmFrameProps = Omit<IframeHTMLAttributes<HTMLIFrameElement>, "children" | "title"> & {
  /** A descriptive name for assistive technologies. */
  title: string;
  framed?: boolean;
};

/** An iframe surface whose layout belongs to the design system. */
export const CmFrame = forwardRef<HTMLIFrameElement, CmFrameProps>(function CmFrame(
  { className, framed = true, height = 320, style, title, ...rest },
  ref,
) {
  const variables: WorkbenchStyle = { "--cm-frame-height": cmSizeValue(height), ...style };
  return (
    <iframe
      ref={ref}
      className={cn("cm-frame", framed && "cm-frame--framed", className)}
      height={height}
      title={title}
      style={variables}
      {...rest}
    />
  );
});
CmFrame.displayName = "CmFrame";
