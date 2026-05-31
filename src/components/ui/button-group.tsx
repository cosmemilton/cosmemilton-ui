import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmSpacingValue, type CmSpacing } from "./types.js";

export type CmButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  fullWidth?: boolean;
  gap?: CmSpacing | string | number;
  orientation?: "horizontal" | "vertical";
};

type ButtonGroupStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

function resolveGap(gap: CmButtonGroupProps["gap"]) {
  return cmSpacingValue(gap, "0");
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
  const isJoined = gap === undefined || gap === "none" || resolvedGap === "0";

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
