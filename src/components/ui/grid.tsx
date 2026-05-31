import type { CSSProperties, FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
import { cmSpacingValue, resolveResponsiveNumber, type CmResponsiveNumber } from "./types.js";

type GridStyle = CSSProperties & Record<`--${string}`, string | number>;
type GridContainerVariant = "default" | "actions";

type GridContainerBaseProps = {
  children?: ReactNode;
  columns?: CmResponsiveNumber;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  variant?: GridContainerVariant;
};

export type CmGridContainerProps =
  | (GridContainerBaseProps & HTMLAttributes<HTMLDivElement> & { as?: "div" })
  | (GridContainerBaseProps &
      HTMLAttributes<HTMLElement> & { as: "section" | "article" | "footer" })
  | (GridContainerBaseProps & FormHTMLAttributes<HTMLFormElement> & { as: "form" });

export type CmGridProps = HTMLAttributes<HTMLDivElement> & {
  span?: CmResponsiveNumber;
};

function spacingValue(value: string | number | undefined, fallback: string) {
  return cmSpacingValue(value) ?? fallback;
}

function gridContainerClassName(variant: GridContainerVariant, className?: string) {
  return cn("cm-grid-container", variant === "actions" && "cm-grid-container-actions", className);
}

export function CmGridContainer({
  as = "div",
  children,
  className,
  columns = { base: 1, md: 2, xl: 4 },
  gap = "1rem",
  rowGap,
  columnGap,
  variant = "default",
  style,
  ...props
}: CmGridContainerProps) {
  const resolvedColumns = resolveResponsiveNumber(columns, 1);
  const gridStyle: GridStyle = {
    "--grid-columns-base": resolvedColumns.base,
    "--grid-columns-sm": resolvedColumns.sm,
    "--grid-columns-md": resolvedColumns.md,
    "--grid-columns-lg": resolvedColumns.lg,
    "--grid-columns-xl": resolvedColumns.xl,
    "--grid-row-gap": spacingValue(rowGap, spacingValue(gap, "1rem")),
    "--grid-column-gap": spacingValue(columnGap, spacingValue(gap, "1rem")),
    ...style,
  };
  if (as === "form") {
    return (
      <form
        className={gridContainerClassName(variant, className)}
        style={gridStyle}
        {...(props as FormHTMLAttributes<HTMLFormElement>)}
      >
        {children}
      </form>
    );
  }

  if (as === "section") {
    return (
      <section
        className={gridContainerClassName(variant, className)}
        style={gridStyle}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </section>
    );
  }

  if (as === "article") {
    return (
      <article
        className={gridContainerClassName(variant, className)}
        style={gridStyle}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </article>
    );
  }

  if (as === "footer") {
    return (
      <footer
        className={gridContainerClassName(variant, className)}
        style={gridStyle}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </footer>
    );
  }

  return (
    <div
      className={gridContainerClassName(variant, className)}
      style={gridStyle}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  );
}
CmGridContainer.displayName = "CmGridContainer";

export const CmGrid = forwardRef<HTMLDivElement, CmGridProps>(function CmGrid(
  { children, className, span = 1, style, ...props },
  ref,
) {
  const resolvedSpan = resolveResponsiveNumber(span, 1);
  const gridStyle: GridStyle = {
    "--grid-span-base": resolvedSpan.base,
    "--grid-span-sm": resolvedSpan.sm,
    "--grid-span-md": resolvedSpan.md,
    "--grid-span-lg": resolvedSpan.lg,
    "--grid-span-xl": resolvedSpan.xl,
    ...style,
  };

  return (
    <div ref={ref} className={cn("cm-grid", className)} style={gridStyle} {...props}>
      {children}
    </div>
  );
});
CmGrid.displayName = "CmGrid";
