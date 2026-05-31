import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cmVariants, type CmVariantProps } from "../../lib/variants.js";
import type { CmTone } from "./types.js";

export type CmIconBadgeTone = CmTone;

const iconBadgeVariants = cmVariants({
  base: "cm-icon-badge",
  variants: {
    size: {
      xs: "cm-icon-badge--xs",
      sm: "cm-icon-badge--sm",
      md: "cm-icon-badge--md",
    },
    tone: {
      default: "cm-icon-badge--tone-default",
      primary: "cm-icon-badge--tone-primary",
      secondary: "cm-icon-badge--tone-secondary",
      accent: "cm-icon-badge--tone-accent",
      success: "cm-icon-badge--tone-success",
      warning: "cm-icon-badge--tone-warning",
      danger: "cm-icon-badge--tone-danger",
      info: "cm-icon-badge--tone-info",
    },
  },
  defaultVariants: { size: "sm", tone: "default" },
});

export type CmIconBadgeProps = HTMLAttributes<HTMLSpanElement> &
  CmVariantProps<typeof iconBadgeVariants> & {
    icon: ReactNode;
  };

export const CmIconBadge = forwardRef<HTMLSpanElement, CmIconBadgeProps>(
  function CmIconBadge({ icon, tone, size, className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        className={iconBadgeVariants({ size, tone, className })}
        {...rest}
      >
        {icon}
      </span>
    );
  },
);
CmIconBadge.displayName = "CmIconBadge";
