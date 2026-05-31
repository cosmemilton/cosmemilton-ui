import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cmVariants, type CmVariantProps } from "../../lib/variants.js";
import { Slot } from "../../lib/slot.js";
import type { CmTone } from "./types.js";

export type CmBadgeTone = CmTone;

const badgeVariants = cmVariants({
  base: "cm-badge",
  variants: {
    variant: {
      solid: "cm-badge--solid",
      soft: "cm-badge--soft",
      outline: "cm-badge--outline",
    },
    tone: {
      default: "cm-badge--default",
      primary: "cm-badge--primary",
      secondary: "cm-badge--secondary",
      accent: "cm-badge--accent",
      success: "cm-badge--success",
      warning: "cm-badge--warning",
      danger: "cm-badge--danger",
      info: "cm-badge--info",
    },
  },
  defaultVariants: { variant: "soft", tone: "default" },
});

export type CmBadgeProps = HTMLAttributes<HTMLSpanElement> &
  CmVariantProps<typeof badgeVariants> & {
    children?: ReactNode;
    /** Render onto the provided child element instead of a `<span>`. */
    asChild?: boolean;
  };

export const CmBadge = forwardRef<HTMLSpanElement, CmBadgeProps>(function CmBadge(
  { asChild = false, children, className, variant, tone, ...rest },
  ref,
) {
  const Comp: ElementType = asChild ? Slot : "span";
  return (
    <Comp ref={ref} className={badgeVariants({ variant, tone, className })} {...rest}>
      {children}
    </Comp>
  );
});
CmBadge.displayName = "CmBadge";
