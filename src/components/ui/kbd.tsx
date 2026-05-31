import { forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type KbdProps = {
  children: ReactNode;
  className?: string;
};

export const CmKbd = forwardRef<HTMLElement, KbdProps>(function CmKbd(
  { children, className },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={cn(
        "cm-kbd",
        className,
      )}
    >
      {children}
    </kbd>
  );
});
CmKbd.displayName = "CmKbd";
