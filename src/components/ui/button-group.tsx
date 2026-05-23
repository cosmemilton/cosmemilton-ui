import { type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue, type CmSpacing } from "./types.js";

type ButtonGroupProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  gap?: CmSpacing | string | number;
  orientation?: "horizontal" | "vertical";
};

const gapMap = {
  none: "0",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
} as const;

type ButtonGroupStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

function resolveGap(gap: ButtonGroupProps["gap"]) {
  if (gap === undefined) return gapMap.none;
  if (typeof gap === "number") return cmSizeValue(gap);
  return gapMap[gap as keyof typeof gapMap] ?? gap;
}

export function CmButtonGroup({
  children,
  className,
  fullWidth = false,
  gap = "none",
  orientation = "horizontal",
}: ButtonGroupProps) {
  const isVertical = orientation === "vertical";
  const resolvedGap = resolveGap(gap);
  const isJoined = resolvedGap === "0";

  return (
    <div
      role="group"
      className={cn(
        "cm-button-group",
        isVertical ? "cm-button-group--vertical" : "cm-button-group--horizontal",
        isJoined ? "cm-button-group--joined" : "cm-button-group--spaced",
        fullWidth && "cm-button-group--full-width",
        className,
      )}
      style={{ "--cm-button-group-gap": resolvedGap } as ButtonGroupStyle}
    >
      {children}
    </div>
  );
}
