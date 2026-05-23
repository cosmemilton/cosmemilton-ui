import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmSizeValue,
  resolveResponsiveValue,
  type CmMaxWidth,
  type CmResponsiveValue,
  type CmSpacing,
} from "./types.js";

type LayoutElement = "div" | "section" | "article" | "header" | "footer" | "main" | "nav" | "aside";
type LayoutGap = string | number;
type LayoutAlign = "start" | "center" | "end" | "stretch" | "baseline";
type LayoutJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type StackDirection = "vertical" | "horizontal";
type ResponsiveDirection = CmResponsiveValue<StackDirection>;

type LayoutStyle = CSSProperties & Record<`--${string}`, string | number>;
type LayoutRenderProps = HTMLAttributes<HTMLElement> &
  Record<`data-${string}`, string | undefined> & {
    children?: ReactNode;
  };

type BaseLayoutProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: LayoutElement;
  children?: ReactNode;
  gap?: LayoutGap;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  fullWidth?: boolean;
};

export type CmRowProps = BaseLayoutProps & {
  wrap?: boolean;
};

export type CmColProps = BaseLayoutProps;

export type CmStackProps = BaseLayoutProps & {
  direction?: ResponsiveDirection;
  wrap?: boolean;
};

export type CmContainerProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: LayoutElement;
  children?: ReactNode;
  maxWidth?: CmMaxWidth;
  padding?: CmSpacing | string | number;
  fluid?: boolean;
};

function spacingValue(value: LayoutGap | undefined, fallback: string) {
  return cmSizeValue(value) ?? fallback;
}

function stackDirectionValue(value: StackDirection | undefined, fallback: StackDirection) {
  const direction = value ?? fallback;
  return direction === "horizontal" ? "row" : "column";
}

function resolveStackDirections(direction: ResponsiveDirection | undefined) {
  const resolved = resolveResponsiveValue<StackDirection>(direction, "vertical");

  return {
    base: stackDirectionValue(resolved.base, "vertical"),
    sm: stackDirectionValue(resolved.sm, "vertical"),
    md: stackDirectionValue(resolved.md, "vertical"),
    lg: stackDirectionValue(resolved.lg, "vertical"),
    xl: stackDirectionValue(resolved.xl, "vertical"),
  };
}

function containerWidth(value: CmContainerProps["maxWidth"]) {
  if (value === undefined) return "72rem";
  if (typeof value === "number") return `${value}px`;
  const preset: Record<string, string> = {
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    xl: "72rem",
    "2xl": "80rem",
    full: "100%",
  };
  return preset[value] ?? value;
}

function containerPadding(value: CmContainerProps["padding"]) {
  if (value === undefined) return "clamp(1rem, 3vw, 2.5rem)";
  if (typeof value === "number") return `${value}px`;
  const preset: Record<string, string> = {
    none: "0",
    xs: "clamp(0.5rem, 1.5vw, 0.75rem)",
    sm: "clamp(0.75rem, 2vw, 1.25rem)",
    md: "clamp(1rem, 3vw, 2.5rem)",
    lg: "clamp(1.5rem, 4vw, 4rem)",
  };
  return preset[value] ?? value;
}

function renderLayout(as: LayoutElement, props: LayoutRenderProps) {
  return createElement(as, props);
}

export function CmRow({
  as = "div",
  children,
  className,
  gap,
  align = "center",
  justify = "start",
  wrap = false,
  fullWidth = false,
  style,
  ...props
}: CmRowProps) {
  const layoutStyle: LayoutStyle = {
    "--cm-layout-gap": spacingValue(gap, "1rem"),
    ...style,
  };

  return renderLayout(as, {
    className: cn("cm-row", wrap && "cm-layout-wrap", fullWidth && "cm-layout-full", className),
    "data-align": align,
    "data-justify": justify,
    style: layoutStyle,
    ...props,
    children,
  });
}

export function CmCol({
  as = "div",
  children,
  className,
  gap,
  align = "stretch",
  justify = "start",
  fullWidth = false,
  style,
  ...props
}: CmColProps) {
  const layoutStyle: LayoutStyle = {
    "--cm-layout-gap": spacingValue(gap, "1rem"),
    ...style,
  };

  return renderLayout(as, {
    className: cn("cm-col", fullWidth && "cm-layout-full", className),
    "data-align": align,
    "data-justify": justify,
    style: layoutStyle,
    ...props,
    children,
  });
}

export function CmStack({
  as = "div",
  children,
  className,
  gap,
  align = "stretch",
  justify = "start",
  direction = "vertical",
  wrap = false,
  fullWidth = false,
  style,
  ...props
}: CmStackProps) {
  const directions = resolveStackDirections(direction);
  const layoutStyle: LayoutStyle = {
    "--cm-layout-gap": spacingValue(gap, "1rem"),
    "--cm-stack-direction-base": directions.base,
    "--cm-stack-direction-sm": directions.sm,
    "--cm-stack-direction-md": directions.md,
    "--cm-stack-direction-lg": directions.lg,
    "--cm-stack-direction-xl": directions.xl,
    ...style,
  };

  return renderLayout(as, {
    className: cn("cm-stack", wrap && "cm-layout-wrap", fullWidth && "cm-layout-full", className),
    "data-align": align,
    "data-justify": justify,
    style: layoutStyle,
    ...props,
    children,
  });
}

export function CmContainer({
  as = "div",
  children,
  className,
  maxWidth,
  padding,
  fluid = false,
  style,
  ...props
}: CmContainerProps) {
  const layoutStyle: LayoutStyle = {
    "--cm-container-max": fluid ? "100%" : containerWidth(maxWidth),
    "--cm-container-padding": containerPadding(padding),
    ...style,
  };

  return renderLayout(as, {
    className: cn("cm-container", className),
    style: layoutStyle,
    ...props,
    children,
  });
}
