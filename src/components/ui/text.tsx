import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmVariants } from "../../lib/variants.js";
import type { CmSize } from "./types.js";

type TextSize = CmSize | "2xl" | "3xl";
type TextTone = "default" | "muted" | "danger" | "success" | "warning" | "primary" | "inverse";
type TextWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black";
type TextVariant = "default" | "modalTabDescription";
type TextSpacing = "none" | "compact" | "normal" | "relaxed";
type TextAlign = "start" | "center" | "end" | "justify";
type TextTracking = "tight" | "normal" | "wide";

type CmTextCustomProps<TElement extends ElementType> = {
  as?: TElement;
  children: ReactNode;
  className?: string;
  inline?: boolean;
  size?: TextSize;
  spacing?: TextSpacing;
  tone?: TextTone;
  truncate?: boolean;
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  tracking?: TextTracking;
};

export type CmTextProps<TElement extends ElementType = "p"> = CmTextCustomProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof CmTextCustomProps<TElement>>;

const textVariants = cmVariants({
  base: "cm-text",
  variants: {
    size: {
      xs: "cm-text--xs",
      sm: "cm-text--sm",
      md: "cm-text--md",
      lg: "cm-text--lg",
      xl: "cm-text--xl",
      "2xl": "cm-text--2xl",
      "3xl": "cm-text--3xl",
    },
    tone: {
      default: "cm-text--default",
      muted: "cm-text--muted",
      danger: "cm-text--danger",
      success: "cm-text--success",
      warning: "cm-text--warning",
      primary: "cm-text--primary",
      inverse: "cm-text--inverse",
    },
    weight: {
      normal: "cm-text--normal",
      medium: "cm-text--medium",
      semibold: "cm-text--semibold",
      bold: "cm-text--bold",
      extrabold: "cm-text--extrabold",
      black: "cm-text--black",
    },
    spacing: {
      none: undefined,
      compact: "cm-text--spacing-compact",
      normal: "cm-text--spacing-normal",
      relaxed: "cm-text--spacing-relaxed",
    },
    align: {
      start: "cm-text--align-start",
      center: "cm-text--align-center",
      end: "cm-text--align-end",
      justify: "cm-text--align-justify",
    },
    tracking: {
      tight: "cm-text--tracking-tight",
      normal: "cm-text--tracking-normal",
      wide: "cm-text--tracking-wide",
    },
  },
  defaultVariants: { size: "sm", tone: "default", weight: "normal", spacing: "none" },
});

export function CmText<TElement extends ElementType = "p">({
  as,
  children,
  className,
  inline = false,
  size = "sm",
  spacing = "none",
  tone = "default",
  truncate = false,
  variant = "default",
  weight = "normal",
  align,
  tracking = "normal",
  ...props
}: CmTextProps<TElement>) {
  const Component: ElementType = as ?? (inline ? "span" : "p");

  return (
    <Component
      className={cn(
        textVariants({ size, tone, weight, spacing, align, tracking }),
        truncate && "cm-text--truncate",
        variant === "modalTabDescription" && "cm-text--modal-tab-description",
        className,
      )}
      {...(props as ComponentPropsWithoutRef<TElement>)}
    >
      {children}
    </Component>
  );
}
CmText.displayName = "CmText";
