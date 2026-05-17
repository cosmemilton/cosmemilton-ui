import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue } from "./types.js";

type SeparatorSpacing = "none" | "xs" | "sm" | "md";
type SeparatorStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

type SeparatorProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  orientation?: "horizontal" | "vertical";
  spacing?: SeparatorSpacing;
  length?: string | number;
};

export function CmSeparator({
  orientation = "horizontal",
  spacing = "md",
  length,
  className,
  style,
  ...props
}: SeparatorProps) {
  const spacingClass = `cm-separator--spacing-${spacing}`;
  const separatorStyle: SeparatorStyle = {
    ...(length ? { "--cm-separator-length": cmSizeValue(length) } : {}),
    ...style,
  };

  if (orientation === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn("cm-separator cm-separator--vertical", spacingClass, className)}
        style={separatorStyle}
        {...props}
      />
    );
  }

  return (
    <span
      role="separator"
      className={cn("cm-separator cm-separator--horizontal", spacingClass, className)}
      style={separatorStyle}
      {...props}
    />
  );
}
