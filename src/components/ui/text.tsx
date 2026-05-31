import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmVariants } from "../../lib/variants.js";
import type { CmSize } from "./types.js";

type TextSize = Exclude<CmSize, "xl">;
type TextTone = "default" | "muted" | "danger" | "success" | "warning" | "primary" | "inverse";
type TextWeight = "normal" | "medium" | "semibold";
type TextVariant = "default" | "modalTabDescription";
type TextSpacing = "none" | "compact" | "normal" | "relaxed";

export type CmTextProps<TElement extends ElementType = "p"> = {
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
} & Omit<HTMLAttributes<HTMLElement>, "as" | "children" | "className">;

const textVariants = cmVariants({
  base: "cm-text",
  variants: {
    size: {
      xs: "cm-text--xs",
      sm: "cm-text--sm",
      md: "cm-text--md",
      lg: "cm-text--lg",
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
    },
    spacing: {
      none: undefined,
      compact: "cm-text--spacing-compact",
      normal: "cm-text--spacing-normal",
      relaxed: "cm-text--spacing-relaxed",
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
  ...props
}: CmTextProps<TElement>) {
  const Component: ElementType = as ?? (inline ? "span" : "p");

  return (
    <Component
      className={cn(
        textVariants({ size, tone, weight, spacing }),
        truncate && "cm-text--truncate",
        variant === "modalTabDescription" && "cm-text--modal-tab-description",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
CmText.displayName = "CmText";
