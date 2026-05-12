import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type KbdProps = {
  children: ReactNode;
  className?: string;
};

export function CmKbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "cm-kbd",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
