export type CmDensity = "default" | "comfortable" | "compact";

export type CmResponsiveBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

export type CmResponsiveNumber =
  | number
  | Partial<Record<CmResponsiveBreakpoint, number>>;

export type CmComponentTone =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export function cmDensityClass(density?: CmDensity) {
  return density && density !== "default" ? `cm-density-${density}` : undefined;
}

const breakpoints: CmResponsiveBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

export function resolveResponsiveNumber(
  value: CmResponsiveNumber | undefined,
  fallback: number,
) {
  const resolved = {} as Record<CmResponsiveBreakpoint, number>;

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

export function cmSizeValue(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}
