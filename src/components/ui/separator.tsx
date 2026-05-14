import { cn } from "../../lib/utils.js";

type SeparatorSpacing = "none" | "xs" | "sm" | "md";

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  spacing?: SeparatorSpacing;
  className?: string;
};

export function CmSeparator({
  orientation = "horizontal",
  spacing = "md",
  className,
}: SeparatorProps) {
  const spacingClass = `cm-separator--spacing-${spacing}`;

  if (orientation === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn("cm-separator cm-separator--vertical", spacingClass, className)}
      />
    );
  }

  return (
    <span
      role="separator"
      className={cn("cm-separator cm-separator--horizontal", spacingClass, className)}
    />
  );
}
