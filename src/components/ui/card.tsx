import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardVariant = "surface" | "soft" | "outline" | "ghost";
type CardTone =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  elevated?: boolean;
  variant?: CardVariant;
  tone?: CardTone;
  interactive?: boolean;
  accent?: "none" | "top" | "left";
  cover?: boolean | ReactNode;
  coverHeight?: string;
};

const paddingMap: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "cm-card--padding-none",
  sm: "cm-card--padding-sm",
  md: "cm-card--padding-md",
  lg: "cm-card--padding-lg",
};

const toneMap: Record<CardTone, string> = {
  default: "cm-card--tone-default",
  primary: "cm-card--tone-primary",
  secondary: "cm-card--tone-secondary",
  success: "cm-card--tone-success",
  warning: "cm-card--tone-warning",
  danger: "cm-card--tone-danger",
  info: "cm-card--tone-info",
};

export function CmCard({
  children,
  className,
  padding = "md",
  elevated = false,
  variant = "surface",
  tone = "default",
  interactive = false,
  accent = "none",
  cover = false,
  coverHeight,
  style,
  ...props
}: CardProps) {
  const hasCover = Boolean(cover);

  return (
    <div
      className={cn(
        "cm-card",
        `cm-card--${variant}`,
        toneMap[tone],
        elevated ? "cm-card--elevated" : "cm-card--flat",
        interactive && "cm-card--interactive",
        accent !== "none" && `cm-card--accent-${accent}`,
        !hasCover && paddingMap[padding],
        className,
      )}
      style={{
        ...style,
        ...(coverHeight ? { "--cm-card-cover-height": coverHeight } : {}),
      } as CSSProperties}
      {...props}
    >
      {hasCover ? (
        <>
          <div className="cm-card__cover">
            {cover === true ? null : cover}
          </div>
          <div className={paddingMap[padding]}>{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
