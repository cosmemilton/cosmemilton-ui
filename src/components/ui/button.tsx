"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCmTheme } from "../theme/theme-provider";

type ButtonVariant = "solid" | "outline" | "ghost" | "soft" | "surface" | "link" | "plain";
export type CmButtonTone =
  | "default"
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "success"
  | "info";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonShape = "default" | "pill" | "square";
type ButtonPresentation =
  | "default"
  | "primaryAction"
  | "secondaryAction"
  | "tableAction"
  | "modalClose"
  | "modalPrimaryAction";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  tone?: CmButtonTone;
  size?: ButtonSize;
  shape?: ButtonShape;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  presentation?: ButtonPresentation;
  fullWidth?: boolean;
  active?: boolean;
};

const toneMap: Record<
  CmButtonTone,
  { className: string }
> = {
  default: { className: "cm-button--tone-default" },
  primary: { className: "cm-button--tone-primary" },
  secondary: { className: "cm-button--tone-secondary" },
  danger: { className: "cm-button--tone-danger" },
  warning: { className: "cm-button--tone-warning" },
  success: { className: "cm-button--tone-success" },
  info: { className: "cm-button--tone-info" },
};

const sizeMap: Record<ButtonSize, string> = {
  xs: "cm-button--xs",
  sm: "cm-button--sm",
  md: "cm-button--md",
  lg: "cm-button--lg",
  xl: "cm-button--xl",
};

const iconOnlySizeMap: Record<ButtonSize, string> = {
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

export const CmButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      active,
      children,
      className,
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
      variant = "solid",
      ...props
    },
    ref,
  ) => {
    const { invertHeader } = useCmTheme();

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
        className={cn(base, presentationMap[presentation], className)}
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
