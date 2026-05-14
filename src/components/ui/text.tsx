import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type TextSize = "xs" | "sm" | "md" | "lg";
type TextTone = "default" | "muted" | "danger" | "success" | "warning" | "primary";
type TextWeight = "normal" | "medium" | "semibold";
type TextVariant = "default" | "modalTabDescription";
type TextSpacing = "none" | "compact" | "normal" | "relaxed";

type TextProps<TElement extends ElementType = "p"> = {
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

const sizeClass: Record<TextSize, string> = {
  xs: "cm-text--xs",
  sm: "cm-text--sm",
  md: "cm-text--md",
  lg: "cm-text--lg",
};

const toneClass: Record<TextTone, string> = {
  default: "cm-text--default",
  muted: "cm-text--muted",
  danger: "cm-text--danger",
  success: "cm-text--success",
  warning: "cm-text--warning",
  primary: "cm-text--primary",
};

const weightClass: Record<TextWeight, string> = {
  normal: "cm-text--normal",
  medium: "cm-text--medium",
  semibold: "cm-text--semibold",
};

const spacingClass: Record<TextSpacing, string | undefined> = {
  none: undefined,
  compact: "cm-text--spacing-compact",
  normal: "cm-text--spacing-normal",
  relaxed: "cm-text--spacing-relaxed",
};

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
}: TextProps<TElement>) {
  const Component: ElementType = as ?? (inline ? "span" : "p");

  return (
    <Component
      className={cn(
        "cm-text",
        sizeClass[size],
        toneClass[tone],
        weightClass[weight],
        spacingClass[spacing],
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
