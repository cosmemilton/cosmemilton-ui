import type { CSSProperties } from "react";

export type CmDensity = "default" | "comfortable" | "compact";

export type CmResponsiveBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

export type CmResponsiveValue<T> = T | Partial<Record<CmResponsiveBreakpoint, T>>;

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

export type CmStatusTone = Extract<CmTone, "success" | "warning" | "danger" | "info">;

export type CmFeedbackTone = "default" | CmStatusTone;

export type CmSize = "xs" | "sm" | "md" | "lg" | "xl";

export type CmDialogSize = "sm" | "md" | "lg" | "xl" | "2xl";

export type CmSpacing = "none" | "xs" | "sm" | "md" | "lg";

export type CmRadius = "none" | "sm" | "md" | "lg" | "full";

export type CmMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full" | string | number;

export function cmDensityClass(density?: CmDensity) {
  return density && density !== "default" ? `cm-density-${density}` : undefined;
}

const breakpoints: CmResponsiveBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

function isResponsiveRecord<T>(
  value: CmResponsiveValue<T> | undefined,
): value is Partial<Record<CmResponsiveBreakpoint, T>> {
  return value !== undefined && typeof value === "object";
}

export function resolveResponsiveValue<T>(value: CmResponsiveValue<T> | undefined, fallback: T) {
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

export function resolveResponsiveNumber(value: CmResponsiveNumber | undefined, fallback: number) {
  return resolveResponsiveValue(value, fallback);
}

export function cmSizeValue(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/* Largura fixa de campos flutuantes: além de width/min-width, fixa o flex-basis
   para o campo poder viver direto num CmRow/flex sem wrapper (a raiz dos campos
   é width:100% + min-width:0, que num flex significaria "disputa o espaço"). */
export function cmFieldWidthStyle(width: string | number | undefined): CSSProperties | undefined {
  const size = cmSizeValue(width);
  if (size === undefined) return undefined;
  return { width: size, minWidth: size, flex: `0 0 ${size}` };
}

const spacingFallbacks: Record<string, string> = {
  none: "0",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
};

export function cmSpacingValue(value: string | number | undefined, fallback?: string) {
  if (value === undefined) return fallback;
  if (typeof value === "number") return `${value}px`;
  const tokenFallback = spacingFallbacks[value];
  return tokenFallback ? `var(--space-${value}, ${tokenFallback})` : value;
}
