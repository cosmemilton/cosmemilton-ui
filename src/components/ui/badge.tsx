import { ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

type BadgeVariant = "solid" | "soft" | "outline";
export type CmBadgeTone = CmTone;

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
  tone?: CmBadgeTone;
};

const toneStyles: Record<CmBadgeTone, string> = {
  default: "cm-badge--default",
  primary: "cm-badge--primary",
  secondary: "cm-badge--secondary",
  accent: "cm-badge--accent",
  success: "cm-badge--success",
  warning: "cm-badge--warning",
  danger: "cm-badge--danger",
  info: "cm-badge--info",
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
  tone = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "cm-badge",
        toneStyles[tone] ?? toneStyles["default"],
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
