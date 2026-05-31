import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmVariants } from "../../lib/variants.js";
import { cmDensityClass, type CmDensity, type CmSpacing, type CmTone } from "./types.js";

type CardVariant = "surface" | "soft" | "outline" | "ghost";
type CardPadding = Exclude<CmSpacing, "xs">;
type CardTone = CmTone;

export type CmCardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  className?: string;
  padding?: CardPadding;
  bodyPadding?: CardPadding;
  elevated?: boolean;
  variant?: CardVariant;
  tone?: CardTone;
  interactive?: boolean;
  accent?: "none" | "top" | "left";
  cover?: boolean | ReactNode;
  coverHeight?: string;
  header?: ReactNode;
  footer?: ReactNode;
  density?: CmDensity;
};

const paddingMap: Record<NonNullable<CmCardProps["padding"]>, string> = {
  none: "cm-card--padding-none",
  sm: "cm-card--padding-sm",
  md: "cm-card--padding-md",
  lg: "cm-card--padding-lg",
};

const cardVariants = cmVariants({
  base: "cm-card",
  variants: {
    variant: {
      surface: "cm-card--surface",
      soft: "cm-card--soft",
      outline: "cm-card--outline",
      ghost: "cm-card--ghost",
    },
    tone: {
      default: "cm-card--tone-default",
      primary: "cm-card--tone-primary",
      secondary: "cm-card--tone-secondary",
      accent: "cm-card--tone-accent",
      success: "cm-card--tone-success",
      warning: "cm-card--tone-warning",
      danger: "cm-card--tone-danger",
      info: "cm-card--tone-info",
    },
  },
  defaultVariants: { variant: "surface", tone: "default" },
});

export const CmCard = forwardRef<HTMLDivElement, CmCardProps>(function CmCard(
  {
    bodyPadding,
    children,
    className,
    density,
    padding = "md",
    elevated = false,
    footer,
    header,
    variant = "surface",
    tone = "default",
    interactive = false,
    accent = "none",
    cover = false,
    coverHeight,
    style,
    ...props
  },
  ref,
) {
  const hasCover = Boolean(cover);
  const hasStructuredContent = Boolean(header || footer || hasCover);
  const resolvedBodyPadding = bodyPadding ?? padding;

  return (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, tone }),
        elevated ? "cm-card--elevated" : "cm-card--flat",
        interactive && "cm-card--interactive",
        accent !== "none" && `cm-card--accent-${accent}`,
        !hasStructuredContent && paddingMap[padding],
        cmDensityClass(density),
        className,
      )}
      style={
        {
          ...style,
          ...(coverHeight ? { "--cm-card-cover-height": coverHeight } : {}),
        } as CSSProperties
      }
      {...props}
    >
      {hasStructuredContent ? (
        <>
          {hasCover ? <div className="cm-card__cover">{cover === true ? null : cover}</div> : null}
          {header ? <div className="cm-card__header">{header}</div> : null}
          {children ? (
            <div className={cn("cm-card__body", paddingMap[resolvedBodyPadding])}>{children}</div>
          ) : null}
          {footer ? <div className="cm-card__footer">{footer}</div> : null}
        </>
      ) : (
        children
      )}
    </div>
  );
});
CmCard.displayName = "CmCard";
