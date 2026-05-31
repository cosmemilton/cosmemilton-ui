import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import { Slot } from "../../lib/slot.js";

export type CmKbdProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  /** Render onto the provided child element instead of a `<kbd>`. */
  asChild?: boolean;
};

export const CmKbd = forwardRef<HTMLElement, CmKbdProps>(function CmKbd(
  { asChild = false, children, className, ...rest },
  ref,
) {
  const Comp: ElementType = asChild ? Slot : "kbd";
  return (
    <Comp ref={ref} className={cn("cm-kbd", className)} {...rest}>
      {children}
    </Comp>
  );
});
CmKbd.displayName = "CmKbd";
