import type { CSSProperties } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmSizeValue,
  cmSpacingValue,
  resolveResponsiveValue,
  type CmResponsiveBreakpoint,
  type CmResponsiveValue,
} from "./types.js";

type CmDimension = CmResponsiveValue<string | number>;
type CmOverflow = "visible" | "hidden" | "clip" | "auto" | "scroll";
type CmElevation = "none" | "xs" | "sm" | "md" | "lg" | "xl";
type CmLayer =
  | "base"
  | "docked"
  | "sticky"
  | "dropdown"
  | "overlay"
  | "modal"
  | "toast"
  | "tooltip";

/** Shared presentation primitives. Values are translated by the library, not consumer stylesheets. */
export type CmPresentationProps = {
  width?: CmDimension;
  minWidth?: CmDimension;
  maxWidth?: CmDimension;
  height?: CmDimension;
  minHeight?: CmDimension;
  maxHeight?: CmDimension;
  overflow?: CmOverflow;
  overflowX?: CmOverflow;
  overflowY?: CmOverflow;
  elevation?: CmElevation;
  position?: "static" | "relative" | "sticky";
  top?: string | number;
  zIndex?: CmLayer | number;
  hiddenFrom?: Exclude<CmResponsiveBreakpoint, "base">;
  visibleFrom?: Exclude<CmResponsiveBreakpoint, "base">;
};

type PresentationStyle = CSSProperties &
  Partial<Record<`--${string}`, string | number | undefined>>;
const dimensionDefaults = {
  width: "auto",
  minWidth: "0",
  maxWidth: "none",
  height: "auto",
  minHeight: "0",
  maxHeight: "none",
} as const;

export function cmPresentation({
  width,
  minWidth,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  overflow,
  overflowX,
  overflowY,
  elevation,
  position,
  top,
  zIndex,
  hiddenFrom,
  visibleFrom,
}: CmPresentationProps): { className: string; style: PresentationStyle } {
  const dimensions = { width, minWidth, maxWidth, height, minHeight, maxHeight };
  const style: PresentationStyle = {};
  for (const [key, value] of Object.entries(dimensions)) {
    if (value === undefined) continue;
    const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const values = resolveResponsiveValue(
      value,
      dimensionDefaults[key as keyof typeof dimensionDefaults],
    );
    for (const [breakpoint, size] of Object.entries(values)) {
      style[`--cm-${property}-${breakpoint}`] = cmSizeValue(size);
    }
  }
  if (top !== undefined) style["--cm-position-top"] = cmSpacingValue(top);
  if (zIndex !== undefined)
    style["--cm-position-z"] = typeof zIndex === "number" ? zIndex : `var(--z-${zIndex})`;
  return {
    className: cn(
      Object.entries(dimensions)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => `cm-size-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`)
        .join(" "),
      overflow && `cm-overflow-${overflow}`,
      overflowX && `cm-overflow-x-${overflowX}`,
      overflowY && `cm-overflow-y-${overflowY}`,
      elevation && `cm-elevation-${elevation}`,
      position && `cm-position-${position}`,
      top !== undefined && "cm-position-offset",
      zIndex !== undefined && "cm-position-layer",
      hiddenFrom && `cm-hidden-from-${hiddenFrom}`,
      visibleFrom && `cm-visible-from-${visibleFrom}`,
    ),
    style,
  };
}
