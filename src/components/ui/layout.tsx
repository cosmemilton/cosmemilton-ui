import type { ComponentPropsWithoutRef, ElementType, CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmSpacingValue,
  resolveResponsiveValue,
  type CmMaxWidth,
  type CmResponsiveValue,
  type CmSpacing,
} from "./types.js";

type LayoutGap = string | number;
type LayoutAlign = "start" | "center" | "end" | "stretch" | "baseline";
type LayoutJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type LayoutSpace = CmSpacing | string | number;
type LayoutSurface =
  | "default"
  | "muted"
  | "card"
  | "raised"
  | "inverse"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "transparent";
type LayoutRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
type LayoutBorder = "none" | "sm" | "md" | "lg";
type StackDirection = "vertical" | "horizontal";
type ResponsiveDirection = CmResponsiveValue<StackDirection>;

type LayoutStyle = CSSProperties & Partial<Record<`--${string}`, string | number | undefined>>;

type BaseLayoutProps<TElement extends ElementType> = {
  as?: TElement;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  gap?: LayoutGap;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  fullWidth?: boolean;
  grow?: boolean | number;
  padding?: LayoutSpace;
  paddingInline?: LayoutSpace;
  paddingBlock?: LayoutSpace;
  margin?: LayoutSpace;
  marginInline?: LayoutSpace;
  marginBlock?: LayoutSpace;
  surface?: LayoutSurface;
  radius?: LayoutRadius;
  border?: LayoutBorder;
  borderColor?: string;
};

/** Resolve a prop `grow` na classe + var de peso compartilhadas pelos primitives. */
function resolveGrow(grow: boolean | number | undefined): {
  className: string | undefined;
  style: Record<`--${string}`, number> | undefined;
} {
  const hasGrow = grow === true || (typeof grow === "number" && grow > 0);
  if (!hasGrow) return { className: undefined, style: undefined };
  return {
    className: "cm-layout-grow",
    style: typeof grow === "number" ? { "--cm-layout-grow": grow } : undefined,
  };
}

export type CmRowProps<TElement extends ElementType = "div"> = BaseLayoutProps<TElement> & {
  wrap?: boolean;
} & Omit<ComponentPropsWithoutRef<TElement>, keyof BaseLayoutProps<TElement> | "wrap">;

export type CmColProps<TElement extends ElementType = "div"> = BaseLayoutProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof BaseLayoutProps<TElement>>;

export type CmStackProps<TElement extends ElementType = "div"> = BaseLayoutProps<TElement> & {
  direction?: ResponsiveDirection;
  wrap?: boolean;
} & Omit<ComponentPropsWithoutRef<TElement>, keyof BaseLayoutProps<TElement> | "direction" | "wrap">;

type BaseContainerProps<TElement extends ElementType> = {
  as?: TElement;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxWidth?: CmMaxWidth;
  padding?: CmSpacing | string | number;
  paddingInline?: CmSpacing | string | number;
  paddingBlock?: CmSpacing | string | number;
  fluid?: boolean;
};

export type CmContainerProps<TElement extends ElementType = "div"> = BaseContainerProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof BaseContainerProps<TElement>>;

function spacingValue(value: LayoutGap | undefined, fallback: string) {
  return cmSpacingValue(value) ?? fallback;
}

function optionalSpacingValue(value: LayoutSpace | undefined) {
  return cmSpacingValue(value);
}

function colorValue(value: string | undefined) {
  return value === undefined ? undefined : `var(--color-${value}, ${value})`;
}

function hasLayoutBoxProps({
  padding,
  paddingInline,
  paddingBlock,
  margin,
  marginInline,
  marginBlock,
  surface,
  radius,
  border,
  borderColor,
}: Pick<
  BaseLayoutProps<ElementType>,
  | "padding"
  | "paddingInline"
  | "paddingBlock"
  | "margin"
  | "marginInline"
  | "marginBlock"
  | "surface"
  | "radius"
  | "border"
  | "borderColor"
>) {
  return (
    padding !== undefined ||
    paddingInline !== undefined ||
    paddingBlock !== undefined ||
    margin !== undefined ||
    marginInline !== undefined ||
    marginBlock !== undefined ||
    surface !== undefined ||
    radius !== undefined ||
    border !== undefined ||
    borderColor !== undefined
  );
}

function hasLayoutMarginProps({
  margin,
  marginInline,
  marginBlock,
}: Pick<BaseLayoutProps<ElementType>, "margin" | "marginInline" | "marginBlock">) {
  return margin !== undefined || marginInline !== undefined || marginBlock !== undefined;
}

function layoutBoxStyle({
  padding,
  paddingInline,
  paddingBlock,
  margin,
  marginInline,
  marginBlock,
  borderColor,
}: Pick<
  BaseLayoutProps<ElementType>,
  | "padding"
  | "paddingInline"
  | "paddingBlock"
  | "margin"
  | "marginInline"
  | "marginBlock"
  | "borderColor"
>): LayoutStyle {
  return {
    "--cm-layout-padding": optionalSpacingValue(padding),
    "--cm-layout-padding-inline": optionalSpacingValue(paddingInline),
    "--cm-layout-padding-block": optionalSpacingValue(paddingBlock),
    "--cm-layout-margin": optionalSpacingValue(margin),
    "--cm-layout-margin-inline": optionalSpacingValue(marginInline),
    "--cm-layout-margin-block": optionalSpacingValue(marginBlock),
    "--cm-layout-border-color": colorValue(borderColor),
  };
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

export function CmRow<TElement extends ElementType = "div">({
  as,
  children,
  className,
  gap,
  align = "center",
  justify = "start",
  wrap = false,
  fullWidth = false,
  grow,
  padding,
  paddingInline,
  paddingBlock,
  margin,
  marginInline,
  marginBlock,
  surface,
  radius,
  border,
  borderColor,
  style,
  ...props
}: CmRowProps<TElement>) {
  const Component: ElementType = as ?? "div";
  const growth = resolveGrow(grow);
  const boxProps = {
    padding,
    paddingInline,
    paddingBlock,
    margin,
    marginInline,
    marginBlock,
    surface,
    radius,
    border,
    borderColor,
  };
  const layoutStyle: LayoutStyle = {
    "--cm-layout-gap": spacingValue(gap, "1rem"),
    ...growth.style,
    ...layoutBoxStyle(boxProps),
    ...style,
  };

  return (
    <Component
      className={cn(
        "cm-row",
        wrap && "cm-layout-wrap",
        fullWidth && "cm-layout-full",
        growth.className,
        hasLayoutBoxProps(boxProps) && "cm-layout-box",
        hasLayoutMarginProps(boxProps) && "cm-layout-box--has-margin",
        surface && `cm-layout-surface-${surface}`,
        radius && `cm-layout-radius-${radius}`,
        border && `cm-layout-border-${border}`,
        className,
      )}
      data-align={align}
      data-justify={justify}
      style={layoutStyle}
      {...(props as ComponentPropsWithoutRef<TElement>)}
    >
      {children}
    </Component>
  );
}
CmRow.displayName = "CmRow";

export function CmCol<TElement extends ElementType = "div">({
  as,
  children,
  className,
  gap,
  align = "stretch",
  justify = "start",
  fullWidth = false,
  grow,
  padding,
  paddingInline,
  paddingBlock,
  margin,
  marginInline,
  marginBlock,
  surface,
  radius,
  border,
  borderColor,
  style,
  ...props
}: CmColProps<TElement>) {
  const Component: ElementType = as ?? "div";
  const growth = resolveGrow(grow);
  const boxProps = {
    padding,
    paddingInline,
    paddingBlock,
    margin,
    marginInline,
    marginBlock,
    surface,
    radius,
    border,
    borderColor,
  };
  const layoutStyle: LayoutStyle = {
    "--cm-layout-gap": spacingValue(gap, "1rem"),
    ...growth.style,
    ...layoutBoxStyle(boxProps),
    ...style,
  };

  return (
    <Component
      className={cn(
        "cm-col",
        fullWidth && "cm-layout-full",
        growth.className,
        hasLayoutBoxProps(boxProps) && "cm-layout-box",
        hasLayoutMarginProps(boxProps) && "cm-layout-box--has-margin",
        surface && `cm-layout-surface-${surface}`,
        radius && `cm-layout-radius-${radius}`,
        border && `cm-layout-border-${border}`,
        className,
      )}
      data-align={align}
      data-justify={justify}
      style={layoutStyle}
      {...(props as ComponentPropsWithoutRef<TElement>)}
    >
      {children}
    </Component>
  );
}
CmCol.displayName = "CmCol";

export function CmStack<TElement extends ElementType = "div">({
  as,
  children,
  className,
  gap,
  align = "stretch",
  justify = "start",
  direction = "vertical",
  wrap = false,
  fullWidth = false,
  grow,
  padding,
  paddingInline,
  paddingBlock,
  margin,
  marginInline,
  marginBlock,
  surface,
  radius,
  border,
  borderColor,
  style,
  ...props
}: CmStackProps<TElement>) {
  const Component: ElementType = as ?? "div";
  const directions = resolveStackDirections(direction);
  const growth = resolveGrow(grow);
  const boxProps = {
    padding,
    paddingInline,
    paddingBlock,
    margin,
    marginInline,
    marginBlock,
    surface,
    radius,
    border,
    borderColor,
  };
  const layoutStyle: LayoutStyle = {
    "--cm-layout-gap": spacingValue(gap, "1rem"),
    "--cm-stack-direction-base": directions.base,
    "--cm-stack-direction-sm": directions.sm,
    "--cm-stack-direction-md": directions.md,
    "--cm-stack-direction-lg": directions.lg,
    "--cm-stack-direction-xl": directions.xl,
    ...growth.style,
    ...layoutBoxStyle(boxProps),
    ...style,
  };

  return (
    <Component
      className={cn(
        "cm-stack",
        wrap && "cm-layout-wrap",
        fullWidth && "cm-layout-full",
        growth.className,
        hasLayoutBoxProps(boxProps) && "cm-layout-box",
        hasLayoutMarginProps(boxProps) && "cm-layout-box--has-margin",
        surface && `cm-layout-surface-${surface}`,
        radius && `cm-layout-radius-${radius}`,
        border && `cm-layout-border-${border}`,
        className,
      )}
      data-align={align}
      data-justify={justify}
      style={layoutStyle}
      {...(props as ComponentPropsWithoutRef<TElement>)}
    >
      {children}
    </Component>
  );
}
CmStack.displayName = "CmStack";

export function CmContainer<TElement extends ElementType = "div">({
  as,
  children,
  className,
  maxWidth,
  padding,
  paddingInline,
  paddingBlock,
  fluid = false,
  style,
  ...props
}: CmContainerProps<TElement>) {
  const Component: ElementType = as ?? "div";
  const hasAxisPadding = paddingInline !== undefined || paddingBlock !== undefined;
  const basePadding = padding !== undefined ? containerPadding(padding) : undefined;
  const layoutStyle: LayoutStyle = {
    "--cm-container-max": fluid ? "100%" : containerWidth(maxWidth),
    "--cm-container-padding": !hasAxisPadding ? basePadding : undefined,
    "--cm-container-padding-inline":
      paddingInline !== undefined
        ? containerPadding(paddingInline)
        : padding === undefined
          ? containerPadding(undefined)
          : basePadding,
    "--cm-container-padding-block":
      paddingBlock !== undefined ? containerPadding(paddingBlock) : padding === undefined ? "0" : basePadding,
    ...style,
  };

  return (
    <Component
      className={cn("cm-container", className)}
      style={layoutStyle}
      {...(props as ComponentPropsWithoutRef<TElement>)}
    >
      {children}
    </Component>
  );
}
CmContainer.displayName = "CmContainer";
