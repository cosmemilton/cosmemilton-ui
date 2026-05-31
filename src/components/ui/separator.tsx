import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue, type CmSpacing } from "./types.js";

type SeparatorStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export type CmSeparatorProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  orientation?: "horizontal" | "vertical";
  spacing?: CmSpacing;
  length?: string | number;
};

export const CmSeparator = forwardRef<HTMLSpanElement, CmSeparatorProps>(function CmSeparator(
  { orientation = "horizontal", spacing = "md", length, className, style, ...props },
  ref,
) {
  const spacingClass = `cm-separator--spacing-${spacing}`;
  const separatorStyle: SeparatorStyle = {
    ...(length ? { "--cm-separator-length": cmSizeValue(length) } : {}),
    ...style,
  };

  if (orientation === "vertical") {
    return (
      <span
        ref={ref}
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
      ref={ref}
      role="separator"
      className={cn("cm-separator cm-separator--horizontal", spacingClass, className)}
      style={separatorStyle}
      {...props}
    />
  );
});
CmSeparator.displayName = "CmSeparator";
