import type {
  CSSProperties,
  FormHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "../../lib/utils";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
type ResponsiveNumber = number | Partial<Record<Breakpoint, number>>;
type GridStyle = CSSProperties & Record<`--${string}`, string | number>;
type GridContainerVariant = "default" | "actions";

type GridContainerBaseProps = {
  children?: ReactNode;
  columns?: ResponsiveNumber;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  variant?: GridContainerVariant;
};

type GridContainerProps =
  | (GridContainerBaseProps & HTMLAttributes<HTMLDivElement> & { as?: "div" })
  | (GridContainerBaseProps & HTMLAttributes<HTMLElement> & { as: "section" | "article" | "footer" })
  | (GridContainerBaseProps & FormHTMLAttributes<HTMLFormElement> & { as: "form" });

type GridProps = HTMLAttributes<HTMLDivElement> & {
  span?: ResponsiveNumber;
};

const breakpoints: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

function resolveResponsiveValue(value: ResponsiveNumber | undefined, fallback: number) {
  const resolved = {} as Record<Breakpoint, number>;

  if (typeof value === "number") {
    for (const breakpoint of breakpoints) resolved[breakpoint] = value;
    return resolved;
  }

  let current = value?.base ?? fallback;
  for (const breakpoint of breakpoints) {
    current = value?.[breakpoint] ?? current;
    resolved[breakpoint] = current;
  }

  return resolved;
}

function spacingValue(value: string | number | undefined, fallback: string) {
  if (value === undefined) return fallback;
  return typeof value === "number" ? `${value}px` : value;
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
}: GridContainerProps) {
  const resolvedColumns = resolveResponsiveValue(columns, 1);
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

export function CmGrid({
  children,
  className,
  span = 1,
  style,
  ...props
}: GridProps) {
  const resolvedSpan = resolveResponsiveValue(span, 1);
  const gridStyle: GridStyle = {
    "--grid-span-base": resolvedSpan.base,
    "--grid-span-sm": resolvedSpan.sm,
    "--grid-span-md": resolvedSpan.md,
    "--grid-span-lg": resolvedSpan.lg,
    "--grid-span-xl": resolvedSpan.xl,
    ...style,
  };

  return (
    <div
      className={cn("cm-grid", className)}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
}
