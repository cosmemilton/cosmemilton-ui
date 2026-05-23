import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmDensityClass,
  cmSizeValue,
  type CmDensity,
  type CmMaxWidth,
  type CmSpacing,
} from "./types.js";

type CmPageElement = "div" | "main" | "section" | "article";
type CmPagePadding = CmSpacing | string | number;
type CmPageMaxWidth = CmMaxWidth;
type CmPageStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export type CmPageProps = HTMLAttributes<HTMLElement> & {
  as?: CmPageElement;
  children?: ReactNode;
  density?: CmDensity;
  gap?: string | number;
  maxWidth?: CmPageMaxWidth;
  fullWidth?: boolean;
  padding?: CmPagePadding;
  scrollable?: boolean;
};

function spacingValue(value: string | number | undefined, fallback: string) {
  return cmSizeValue(value) ?? fallback;
}

function maxWidthValue(value: CmPageMaxWidth | undefined, fullWidth: boolean) {
  if (fullWidth) return "100%";
  if (value === undefined) return "72rem";
  if (typeof value === "number") return cmSizeValue(value);

  const preset: Record<string, string> = {
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    xl: "72rem",
    "2xl": "80rem",
    full: "100%",
  };

  return preset[value] ?? value;
}

function paddingValue(value: CmPagePadding | undefined) {
  if (value === undefined) return "clamp(1rem, 2.5vw, 1.75rem)";
  if (typeof value === "number") return cmSizeValue(value);

  const preset: Record<string, string> = {
    none: "0",
    xs: "clamp(0.5rem, 1.5vw, 0.75rem)",
    sm: "clamp(0.75rem, 1.8vw, 1rem)",
    md: "clamp(1rem, 2.5vw, 1.75rem)",
    lg: "clamp(1.25rem, 3vw, 2.5rem)",
  };

  return preset[value] ?? value;
}

export function CmPage({
  as = "main",
  children,
  className,
  density,
  fullWidth = false,
  gap,
  maxWidth,
  padding,
  scrollable = false,
  style,
  ...props
}: CmPageProps) {
  const pageStyle: CmPageStyle = {
    "--cm-page-gap": spacingValue(gap, "1rem"),
    "--cm-page-max-width": maxWidthValue(maxWidth, fullWidth),
    "--cm-page-padding": paddingValue(padding),
    ...style,
  };

  return createElement(as, {
    className: cn(
      "cm-page",
      fullWidth && "cm-page--full-width",
      scrollable && "cm-page--scrollable",
      cmDensityClass(density),
      className,
    ),
    style: pageStyle,
    ...props,
    children,
  });
}
