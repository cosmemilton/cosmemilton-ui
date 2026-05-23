"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useOptionalCmTheme } from "../theme/theme-provider.js";
import { cmDensityClass, type CmDensity, type CmSize, type CmTone } from "./types.js";

export type CmButtonVariant =
  | "solid"
  | "outline"
  | "ghost"
  | "soft"
  | "surface"
  | "link"
  | "plain";
export type CmButtonTone = CmTone;

type ButtonShape = "default" | "pill" | "square";
type ButtonPresentation =
  | "default"
  | "primaryAction"
  | "secondaryAction"
  | "tableAction"
  | "modalClose"
  | "modalPrimaryAction";

export type CmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: CmButtonVariant;
  tone?: CmButtonTone;
  size?: CmSize;
  shape?: ButtonShape;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  presentation?: ButtonPresentation;
  fullWidth?: boolean;
  active?: boolean;
  density?: CmDensity;
  unstyled?: boolean;
};

const toneMap: Record<
  CmButtonTone,
  { className: string }
> = {
  default: { className: "cm-button--tone-default" },
  primary: { className: "cm-button--tone-primary" },
  secondary: { className: "cm-button--tone-secondary" },
  accent: { className: "cm-button--tone-accent" },
  danger: { className: "cm-button--tone-danger" },
  warning: { className: "cm-button--tone-warning" },
  success: { className: "cm-button--tone-success" },
  info: { className: "cm-button--tone-info" },
};

const sizeMap: Record<CmSize, string> = {
  xs: "cm-button--xs",
  sm: "cm-button--sm",
  md: "cm-button--md",
  lg: "cm-button--lg",
  xl: "cm-button--xl",
};

const iconOnlySizeMap: Record<CmSize, string> = {
  xs: "cm-button--icon-xs",
  sm: "cm-button--icon-sm",
  md: "cm-button--icon-md",
  lg: "cm-button--icon-lg",
  xl: "cm-button--icon-xl",
};

const shapeMap: Record<ButtonShape, string> = {
  default: "cm-button--shape-default",
  pill: "cm-button--shape-pill",
  square: "cm-button--shape-square",
};

const presentationMap: Record<ButtonPresentation, string | undefined> = {
  default: undefined,
  primaryAction: "cm-button--primary-action",
  secondaryAction: "cm-button--secondary-action",
  tableAction: "cm-button--table-action",
  modalClose: "cm-button--modal-close",
  modalPrimaryAction: "cm-button--modal-primary-action",
};

export const CmButton = forwardRef<HTMLButtonElement, CmButtonProps>(
  (
    {
      active,
      children,
      className,
      density,
      disabled,
      fullWidth = false,
      icon,
      iconOnly = false,
      loading = false,
      loadingLabel,
      presentation = "default",
      shape = "default",
      size = "md",
      style,
      tone = "default",
      trailingIcon,
      type = "button",
      unstyled = false,
      variant = "solid",
      ...props
    },
    ref,
  ) => {
    const theme = useOptionalCmTheme();
    const invertHeader = theme?.invertHeader ?? false;

    // Quando invertHeader ativo, botoes solid danger/warning usam primary para harmonia com o tema.
    const effectiveTone =
      invertHeader &&
      variant === "solid" &&
      (tone === "danger" || tone === "warning")
        ? "primary"
        : tone;

    const base = cn(
      "cm-button",
      `cm-button--${variant}`,
      toneMap[effectiveTone].className,
      iconOnly ? iconOnlySizeMap[size] : sizeMap[size],
      shapeMap[shape],
      fullWidth && "cm-button--full-width",
      active && "cm-button--active",
      cmDensityClass(density),
    );

    const leadingIcon = loading ? (
      <Loader2 aria-hidden="true" className="cm-button__spinner" size={16} />
    ) : (
      icon
    );
    const content = loading && loadingLabel ? loadingLabel : children;
    const iconOnlyLabel = props["aria-label"] ?? loadingLabel;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-pressed={active || undefined}
        className={
          unstyled ? className : cn(base, presentationMap[presentation], className)
        }
        style={style}
        {...props}
      >
        {leadingIcon ? <span className="cm-button__icon">{leadingIcon}</span> : null}
        {iconOnly ? <span className="cm-sr-only">{iconOnlyLabel ?? content}</span> : content}
        {!iconOnly && trailingIcon ? (
          <span className="cm-button__icon cm-button__icon--trailing">
            {trailingIcon}
          </span>
        ) : null}
      </button>
    );
  },
);

CmButton.displayName = "CmButton";
