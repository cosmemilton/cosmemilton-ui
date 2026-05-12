import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "solid" | "soft" | "outline";
type BadgeTone =
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
  tone?: BadgeTone;
};

const toneStyles: Record<BadgeTone, string> = {
  neutral: "cm-badge--neutral",
  primary: "cm-badge--primary",
  secondary: "cm-badge--secondary",
  success: "cm-badge--success",
  warning: "cm-badge--warning",
  danger: "cm-badge--danger",
};

const variantStyles: Record<BadgeVariant, string> = {
  solid: "cm-badge--solid",
  soft: "cm-badge--soft",
  outline: "cm-badge--outline",
};

export function CmBadge({
  children,
  className,
  variant = "soft",
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "cm-badge",
        toneStyles[tone] ?? toneStyles["neutral"],
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
