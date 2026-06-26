import type { CSSProperties, FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmSpacingValue,
  resolveResponsiveNumber,
  resolveResponsiveValue,
  type CmResponsiveNumber,
  type CmResponsiveValue,
} from "./types.js";

type GridStyle = CSSProperties & Record<`--${string}`, string | number>;
type GridContainerVariant = "default" | "actions";
type GridPreset = "default" | "filters" | "metrics" | "form";
type GridSpace = string | number;
type GridTrackSize = string | number;
type GridSize = number | "auto" | "grow";
type GridSizeMode = "span" | "auto" | "grow";
type ResponsiveGridSpace = CmResponsiveValue<GridSpace>;
type ResponsiveGridTrackSize = CmResponsiveValue<GridTrackSize>;
type ResponsiveGridTemplate = CmResponsiveValue<string>;
type ResponsiveGridSize = CmResponsiveValue<GridSize>;

type GridContainerBaseProps = {
  children?: ReactNode;
  columns?: CmResponsiveNumber;
  gap?: ResponsiveGridSpace;
  spacing?: ResponsiveGridSpace;
  rowGap?: ResponsiveGridSpace;
  rowSpacing?: ResponsiveGridSpace;
  columnGap?: ResponsiveGridSpace;
  columnSpacing?: ResponsiveGridSpace;
  minColumnWidth?: ResponsiveGridTrackSize;
  autoFit?: boolean;
  autoFill?: boolean;
  row?: boolean;
  templateColumns?: ResponsiveGridTemplate;
  preset?: GridPreset;
  variant?: GridContainerVariant;
};

export type CmGridContainerProps =
  | (GridContainerBaseProps & HTMLAttributes<HTMLDivElement> & { as?: "div" })
  | (GridContainerBaseProps &
      HTMLAttributes<HTMLElement> & { as: "section" | "article" | "footer" })
  | (GridContainerBaseProps & FormHTMLAttributes<HTMLFormElement> & { as: "form" });

export type CmGridProps = HTMLAttributes<HTMLDivElement> & {
  container?: boolean;
  columns?: CmResponsiveNumber;
  gap?: ResponsiveGridSpace;
  spacing?: ResponsiveGridSpace;
  rowGap?: ResponsiveGridSpace;
  rowSpacing?: ResponsiveGridSpace;
  columnGap?: ResponsiveGridSpace;
  columnSpacing?: ResponsiveGridSpace;
  minColumnWidth?: ResponsiveGridTrackSize;
  autoFit?: boolean;
  autoFill?: boolean;
  row?: boolean;
  templateColumns?: ResponsiveGridTemplate;
  preset?: GridPreset;
  variant?: GridContainerVariant;
  span?: CmResponsiveNumber;
  size?: ResponsiveGridSize;
};

const breakpointSuffixes = ["base", "sm", "md", "lg", "xl"] as const;

function spacingValue(value: GridSpace | undefined, fallback: string) {
  return cmSpacingValue(value) ?? fallback;
}

function trackSizeValue(value: GridTrackSize | undefined, fallback: string) {
  return cmSpacingValue(value) ?? fallback;
}

function presetMinColumnWidth(preset: GridPreset | undefined) {
  switch (preset) {
    case "filters":
      return "12rem";
    case "metrics":
      return "14rem";
    case "form":
      return "16rem";
    default:
      return undefined;
  }
}

function responsiveSpacingStyle({
  columnGap,
  columnSpacing,
  gap,
  rowGap,
  rowSpacing,
  spacing,
}: Pick<
  GridContainerBaseProps,
  "columnGap" | "columnSpacing" | "gap" | "rowGap" | "rowSpacing" | "spacing"
>) {
  const resolvedGap = resolveResponsiveValue<GridSpace>(spacing ?? gap, "1rem");
  const resolvedRowGap =
    rowSpacing !== undefined || rowGap !== undefined
      ? resolveResponsiveValue<GridSpace>(rowSpacing ?? rowGap, resolvedGap.base)
      : resolvedGap;
  const resolvedColumnGap =
    columnSpacing !== undefined || columnGap !== undefined
      ? resolveResponsiveValue<GridSpace>(columnSpacing ?? columnGap, resolvedGap.base)
      : resolvedGap;

  return {
    "--grid-row-gap": spacingValue(resolvedRowGap.base, "1rem"),
    "--grid-row-gap-sm": spacingValue(resolvedRowGap.sm, "1rem"),
    "--grid-row-gap-md": spacingValue(resolvedRowGap.md, "1rem"),
    "--grid-row-gap-lg": spacingValue(resolvedRowGap.lg, "1rem"),
    "--grid-row-gap-xl": spacingValue(resolvedRowGap.xl, "1rem"),
    "--grid-column-gap": spacingValue(resolvedColumnGap.base, "1rem"),
    "--grid-column-gap-sm": spacingValue(resolvedColumnGap.sm, "1rem"),
    "--grid-column-gap-md": spacingValue(resolvedColumnGap.md, "1rem"),
    "--grid-column-gap-lg": spacingValue(resolvedColumnGap.lg, "1rem"),
    "--grid-column-gap-xl": spacingValue(resolvedColumnGap.xl, "1rem"),
  };
}

function gridSizeMode(value: GridSize): GridSizeMode {
  return typeof value === "number" ? "span" : value;
}

function gridSizeSpan(value: GridSize): number {
  return typeof value === "number" ? value : 1;
}

function gridContainerClassName({
  auto,
  className,
  preset,
  row,
  template,
  variant,
}: {
  auto: boolean;
  className?: string;
  preset: GridPreset;
  row: boolean;
  template: boolean;
  variant: GridContainerVariant;
}) {
  return cn(
    "cm-grid-container",
    variant === "actions" && "cm-grid-container-actions",
    preset !== "default" && `cm-grid-container--preset-${preset}`,
    auto && "cm-grid-container--auto",
    row && "cm-grid-container--row",
    template && "cm-grid-container--template",
    className,
  );
}

function resolveGridContainer({
  className,
  columnGap,
  columnSpacing,
  columns,
  defaultColumns,
  gap,
  minColumnWidth,
  autoFit = false,
  autoFill = false,
  preset = "default",
  row = false,
  rowGap,
  rowSpacing,
  spacing,
  style,
  templateColumns,
  variant = "default",
}: Pick<
  GridContainerBaseProps,
  | "autoFill"
  | "autoFit"
  | "columnGap"
  | "columnSpacing"
  | "columns"
  | "gap"
  | "minColumnWidth"
  | "preset"
  | "row"
  | "rowGap"
  | "rowSpacing"
  | "spacing"
  | "templateColumns"
  | "variant"
> & {
  className?: string;
  defaultColumns: CmResponsiveNumber;
  style?: CSSProperties;
}) {
  const resolvedColumns = resolveResponsiveNumber(columns ?? defaultColumns, 1);
  const presetWidth = presetMinColumnWidth(preset);
  const usesTemplate = templateColumns !== undefined;
  const usesAuto = !usesTemplate && (autoFit || autoFill || minColumnWidth !== undefined || presetWidth !== undefined);
  const autoMode = autoFill ? "auto-fill" : "auto-fit";
  const resolvedMinColumnWidth = usesAuto
    ? resolveResponsiveValue<GridTrackSize>(minColumnWidth, presetWidth ?? "16rem")
    : undefined;
  const resolvedTemplateColumns = usesTemplate
    ? resolveResponsiveValue<string>(templateColumns, "minmax(0, 1fr)")
    : undefined;

  const gridStyle: GridStyle = {
    "--grid-columns-base": resolvedColumns.base,
    "--grid-columns-sm": resolvedColumns.sm,
    "--grid-columns-md": resolvedColumns.md,
    "--grid-columns-lg": resolvedColumns.lg,
    "--grid-columns-xl": resolvedColumns.xl,
    ...responsiveSpacingStyle({ columnGap, columnSpacing, gap, rowGap, rowSpacing, spacing }),
    ...(usesAuto
      ? {
          "--grid-auto-mode": autoMode,
          "--grid-min-column-width-base": trackSizeValue(resolvedMinColumnWidth?.base, "16rem"),
          "--grid-min-column-width-sm": trackSizeValue(resolvedMinColumnWidth?.sm, "16rem"),
          "--grid-min-column-width-md": trackSizeValue(resolvedMinColumnWidth?.md, "16rem"),
          "--grid-min-column-width-lg": trackSizeValue(resolvedMinColumnWidth?.lg, "16rem"),
          "--grid-min-column-width-xl": trackSizeValue(resolvedMinColumnWidth?.xl, "16rem"),
        }
      : {}),
    ...(usesTemplate
      ? {
          "--grid-template-columns-base": resolvedTemplateColumns?.base ?? "minmax(0, 1fr)",
          "--grid-template-columns-sm": resolvedTemplateColumns?.sm ?? "minmax(0, 1fr)",
          "--grid-template-columns-md": resolvedTemplateColumns?.md ?? "minmax(0, 1fr)",
          "--grid-template-columns-lg": resolvedTemplateColumns?.lg ?? "minmax(0, 1fr)",
          "--grid-template-columns-xl": resolvedTemplateColumns?.xl ?? "minmax(0, 1fr)",
        }
      : {}),
    ...style,
  };

  return {
    className: gridContainerClassName({
      auto: usesAuto,
      className,
      preset,
      row,
      template: usesTemplate,
      variant,
    }),
    style: gridStyle,
  };
}

export function CmGridContainer({
  as = "div",
  children,
  className,
  columns,
  gap,
  spacing,
  rowGap,
  rowSpacing,
  columnGap,
  columnSpacing,
  minColumnWidth,
  autoFit = false,
  autoFill = false,
  row = false,
  templateColumns,
  preset = "default",
  variant = "default",
  style,
  ...props
}: CmGridContainerProps) {
  const container = resolveGridContainer({
    autoFill,
    autoFit,
    className,
    columnGap,
    columnSpacing,
    columns,
    defaultColumns: { base: 1, md: 2, xl: 4 },
    gap,
    minColumnWidth,
    preset,
    row,
    rowGap,
    rowSpacing,
    spacing,
    style,
    templateColumns,
    variant,
  });

  if (as === "form") {
    return (
      <form
        className={container.className}
        style={container.style}
        {...(props as FormHTMLAttributes<HTMLFormElement>)}
      >
        {children}
      </form>
    );
  }

  if (as === "section") {
    return (
      <section
        className={container.className}
        style={container.style}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </section>
    );
  }

  if (as === "article") {
    return (
      <article
        className={container.className}
        style={container.style}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </article>
    );
  }

  if (as === "footer") {
    return (
      <footer
        className={container.className}
        style={container.style}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </footer>
    );
  }

  return (
    <div
      className={container.className}
      style={container.style}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  );
}
CmGridContainer.displayName = "CmGridContainer";

export const CmGrid = forwardRef<HTMLDivElement, CmGridProps>(function CmGrid(
  {
    autoFill = false,
    autoFit = false,
    children,
    className,
    columnGap,
    columnSpacing,
    columns,
    container = false,
    gap,
    minColumnWidth,
    preset = "default",
    row = false,
    rowGap,
    rowSpacing,
    size,
    spacing,
    span,
    style,
    templateColumns,
    variant = "default",
    ...props
  },
  ref,
) {
  const resolvedSize = resolveResponsiveValue<GridSize>(size ?? span, 1);
  const gridStyle: GridStyle = {
    "--grid-span-base": gridSizeSpan(resolvedSize.base),
    "--grid-span-sm": gridSizeSpan(resolvedSize.sm),
    "--grid-span-md": gridSizeSpan(resolvedSize.md),
    "--grid-span-lg": gridSizeSpan(resolvedSize.lg),
    "--grid-span-xl": gridSizeSpan(resolvedSize.xl),
  };
  const sizeClassNames = breakpointSuffixes.map(
    (breakpoint) => `cm-grid--size-${gridSizeMode(resolvedSize[breakpoint])}-${breakpoint}`,
  );
  const containerResult = container
    ? resolveGridContainer({
        autoFill,
        autoFit,
        className,
        columnGap,
        columnSpacing,
        columns,
        defaultColumns: 12,
        gap,
        minColumnWidth,
        preset,
        row,
        rowGap,
        rowSpacing,
        spacing,
        style,
        templateColumns,
        variant,
      })
    : undefined;
  const rootStyle: GridStyle = {
    ...gridStyle,
    ...(containerResult?.style ?? {}),
    ...(!container ? style : undefined),
  };

  return (
    <div
      ref={ref}
      className={cn(
        "cm-grid",
        ...sizeClassNames,
        container && containerResult?.className,
        !container && className,
      )}
      style={rootStyle}
      {...props}
    >
      {children}
    </div>
  );
});
CmGrid.displayName = "CmGrid";
