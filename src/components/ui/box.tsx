import type { ComponentPropsWithoutRef, ElementType, ReactNode, CSSProperties } from "react";
import { cn } from "../../lib/utils.js";
import { cmSpacingValue, type CmSpacing } from "./types.js";

type SurfaceTheme = "default" | "muted" | "card" | "raised" | "inverse" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "transparent";
type Radius = "none" | "sm" | "md" | "lg" | "xl" | "full";
type BorderWidth = "none" | "sm" | "md" | "lg";
type BoxStyle = CSSProperties & Partial<Record<`--${string}`, string | number | undefined>>;

type CmBoxCustomProps<TElement extends ElementType> = {
  as?: TElement;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  surface?: SurfaceTheme;
  radius?: Radius;
  border?: BorderWidth;
  borderColor?: string;
  padding?: CmSpacing | string | number;
  paddingInline?: CmSpacing | string | number;
  paddingBlock?: CmSpacing | string | number;
  margin?: CmSpacing | string | number;
  marginInline?: CmSpacing | string | number;
  marginBlock?: CmSpacing | string | number;
  fullWidth?: boolean;
};

export type CmBoxProps<TElement extends ElementType = "div"> = CmBoxCustomProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof CmBoxCustomProps<TElement>>;

function spacingValue(value: CmSpacing | string | number | undefined) {
  return cmSpacingValue(value) ?? value;
}

export function CmBox<TElement extends ElementType = "div">({
  as,
  children,
  className,
  style,
  surface,
  radius,
  border,
  borderColor,
  padding,
  paddingInline,
  paddingBlock,
  margin,
  marginInline,
  marginBlock,
  fullWidth,
  ...props
}: CmBoxProps<TElement>) {
  const Component: ElementType = as ?? "div";

  const boxStyle: BoxStyle = {
    ...style,
    "--cm-box-padding": padding !== undefined ? spacingValue(padding) : undefined,
    "--cm-box-padding-inline": paddingInline !== undefined ? spacingValue(paddingInline) : undefined,
    "--cm-box-padding-block": paddingBlock !== undefined ? spacingValue(paddingBlock) : undefined,
    "--cm-box-margin": margin !== undefined ? spacingValue(margin) : undefined,
    "--cm-box-margin-inline": marginInline !== undefined ? spacingValue(marginInline) : undefined,
    "--cm-box-margin-block": marginBlock !== undefined ? spacingValue(marginBlock) : undefined,
    "--cm-box-border-color": borderColor !== undefined ? `var(--color-${borderColor}, ${borderColor})` : undefined,
  };

  return (
    <Component
      className={cn(
        "cm-box",
        surface && `cm-box--surface-${surface}`,
        radius && `cm-box--radius-${radius}`,
        border && `cm-box--border-${border}`,
        fullWidth && "cm-box--full-width",
        className,
      )}
      style={boxStyle}
      {...(props as ComponentPropsWithoutRef<TElement>)}
    >
      {children}
    </Component>
  );
}
CmBox.displayName = "CmBox";
