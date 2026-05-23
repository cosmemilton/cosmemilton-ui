export type CmDensity = "default" | "comfortable" | "compact";

export type CmResponsiveBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

export type CmResponsiveValue<T> =
  | T
  | Partial<Record<CmResponsiveBreakpoint, T>>;

export type CmResponsiveNumber = CmResponsiveValue<number>;

export type CmTone =
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type CmStatusTone = Extract<
  CmTone,
  "success" | "warning" | "danger" | "info"
>;

export type CmFeedbackTone = "default" | CmStatusTone;

export type CmSize = "xs" | "sm" | "md" | "lg" | "xl";

export type CmDialogSize = "sm" | "md" | "lg" | "xl" | "2xl";

export type CmSpacing = "none" | "xs" | "sm" | "md" | "lg";

export type CmRadius = "none" | "sm" | "md" | "lg" | "full";

export type CmMaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "full"
  | string
  | number;

export function cmDensityClass(density?: CmDensity) {
  return density && density !== "default" ? `cm-density-${density}` : undefined;
}

const breakpoints: CmResponsiveBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

function isResponsiveRecord<T>(
  value: CmResponsiveValue<T> | undefined,
): value is Partial<Record<CmResponsiveBreakpoint, T>> {
  return value !== undefined && typeof value === "object";
}

export function resolveResponsiveValue<T>(
  value: CmResponsiveValue<T> | undefined,
  fallback: T,
) {
  const resolved = {} as Record<CmResponsiveBreakpoint, T>;

  if (value !== undefined && !isResponsiveRecord(value)) {
    for (const breakpoint of breakpoints) resolved[breakpoint] = value;
    return resolved;
  }

  const responsiveValue = isResponsiveRecord(value) ? value : undefined;
  let current = responsiveValue?.base ?? fallback;
  for (const breakpoint of breakpoints) {
    current = responsiveValue?.[breakpoint] ?? current;
    resolved[breakpoint] = current;
  }

  return resolved;
}

export function resolveResponsiveNumber(
  value: CmResponsiveNumber | undefined,
  fallback: number,
) {
  return resolveResponsiveValue(value, fallback);
}

export function cmSizeValue(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}
