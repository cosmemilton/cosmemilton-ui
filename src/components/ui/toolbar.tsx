import {
  createElement,
  type CSSProperties,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity } from "./types.js";

type CmToolbarElement = "div" | "form" | "section" | "header" | "footer";
type CmToolbarStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

type CmToolbarBaseProps = {
  as?: CmToolbarElement;
  children?: ReactNode;
  density?: CmDensity;
  gap?: string | number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "between" | "end";
  wrap?: boolean;
  inset?: boolean;
  compact?: boolean;
};

export type CmToolbarProps =
  | (CmToolbarBaseProps & HTMLAttributes<HTMLDivElement> & { as?: "div" })
  | (CmToolbarBaseProps & FormHTMLAttributes<HTMLFormElement> & { as: "form" })
  | (CmToolbarBaseProps & HTMLAttributes<HTMLElement> & { as: "section" | "header" | "footer" });

function spacingValue(value: string | number | undefined, fallback: string) {
  if (value === undefined) return fallback;
  return typeof value === "number" ? `${value}px` : value;
}

export function CmToolbar({
  align = "end",
  as = "div",
  children,
  className,
  compact = false,
  density,
  gap,
  inset = false,
  justify = "between",
  style,
  wrap = true,
  ...props
}: CmToolbarProps) {
  const toolbarStyle: CmToolbarStyle = {
    "--cm-toolbar-gap": spacingValue(gap, "0.75rem"),
    ...style,
  };

  return createElement(
    as,
    {
      className: cn(
        "cm-toolbar",
        `cm-toolbar--align-${align}`,
        `cm-toolbar--justify-${justify}`,
        wrap && "cm-toolbar--wrap",
        inset && "cm-toolbar--inset",
        compact && "cm-toolbar--compact",
        cmDensityClass(density),
        className,
      ),
      style: toolbarStyle,
      ...props,
    },
    children,
  );
}
CmToolbar.displayName = "CmToolbar";

export type CmFilterBarProps = CmToolbarProps & {
  withinCard?: boolean;
};

export function CmFilterBar({ className, withinCard = false, ...props }: CmFilterBarProps) {
  return (
    <CmToolbar
      className={cn("cm-filter-bar", withinCard && "cm-filter-bar--within-card", className)}
      inset={withinCard}
      {...props}
    />
  );
}
CmFilterBar.displayName = "CmFilterBar";
