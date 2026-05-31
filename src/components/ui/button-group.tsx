import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue, type CmSpacing } from "./types.js";

export type CmButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
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

function resolveGap(gap: CmButtonGroupProps["gap"]) {
  if (gap === undefined) return gapMap.none;
  if (typeof gap === "number") return cmSizeValue(gap);
  return gapMap[gap as keyof typeof gapMap] ?? gap;
}

export const CmButtonGroup = forwardRef<HTMLDivElement, CmButtonGroupProps>(function CmButtonGroup(
  {
    children,
    className,
    fullWidth = false,
    gap = "none",
    orientation = "horizontal",
    style,
    ...rest
  },
  ref,
) {
  const isVertical = orientation === "vertical";
  const resolvedGap = resolveGap(gap);
  const isJoined = resolvedGap === "0";

  return (
    <div
      ref={ref}
      role="group"
      className={cn(
        "cm-button-group",
        isVertical ? "cm-button-group--vertical" : "cm-button-group--horizontal",
        isJoined ? "cm-button-group--joined" : "cm-button-group--spaced",
        fullWidth && "cm-button-group--full-width",
        className,
      )}
      style={{ "--cm-button-group-gap": resolvedGap, ...style } as ButtonGroupStyle}
      {...rest}
    >
      {children}
    </div>
  );
});
CmButtonGroup.displayName = "CmButtonGroup";
