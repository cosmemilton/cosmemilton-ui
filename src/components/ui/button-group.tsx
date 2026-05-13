import { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type ButtonGroupProps = {
  children: ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export function CmButtonGroup({ children, className, orientation = "horizontal" }: ButtonGroupProps) {
  const isVertical = orientation === "vertical";
  return (
    <div
      role="group"
      className={cn(
        "cm-button-group",
        isVertical ? "cm-button-group--vertical" : "cm-button-group--horizontal",
        className,
      )}
    >
      {children}
    </div>
  );
}
