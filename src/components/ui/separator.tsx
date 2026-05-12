import { cn } from "../../lib/utils";

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function CmSeparator({ orientation = "horizontal", className }: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn("cm-separator cm-separator--vertical", className)}
      />
    );
  }

  return (
    <span
      role="separator"
      className={cn("cm-separator cm-separator--horizontal", className)}
    />
  );
}
