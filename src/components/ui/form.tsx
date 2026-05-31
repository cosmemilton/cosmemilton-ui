import { forwardRef, type CSSProperties, type FormHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import {
  cmDensityClass,
  cmSpacingValue,
  resolveResponsiveNumber,
  type CmDensity,
  type CmResponsiveNumber,
} from "./types.js";

export type CmFormProps = FormHTMLAttributes<HTMLFormElement> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  layout?: "stack" | "grid";
  columns?: CmResponsiveNumber;
  gap?: string | number;
  density?: CmDensity;
  actionsAlign?: "start" | "end" | "between" | "stretch";
};

type CmFormStyle = CSSProperties & Partial<Record<`--${string}`, string | number>>;

function spacingValue(value: string | number | undefined, fallback: string) {
  return cmSpacingValue(value) ?? fallback;
}

export const CmForm = forwardRef<HTMLFormElement, CmFormProps>(function CmForm(
  {
    actions,
    actionsAlign = "end",
    children,
    className,
    columns = { base: 1, md: 2 },
    density,
    description,
    gap,
    layout = "stack",
    style,
    title,
    ...props
  },
  ref,
) {
  const resolvedColumns = resolveResponsiveNumber(columns, 1);
  const formStyle: CmFormStyle = {
    "--cm-form-columns-base": resolvedColumns.base,
    "--cm-form-columns-sm": resolvedColumns.sm,
    "--cm-form-columns-md": resolvedColumns.md,
    "--cm-form-columns-lg": resolvedColumns.lg,
    "--cm-form-columns-xl": resolvedColumns.xl,
    "--cm-form-gap": spacingValue(gap, "1rem"),
    ...style,
  };

  return (
    <form
      ref={ref}
      className={cn(
        "cm-form",
        `cm-form--layout-${layout}`,
        `cm-form--actions-${actionsAlign}`,
        cmDensityClass(density),
        className,
      )}
      style={formStyle}
      {...props}
    >
      {(title || description) && (
        <header className="cm-form__header">
          {title ? <h2 className="cm-form__title">{title}</h2> : null}
          {description ? <p className="cm-form__description">{description}</p> : null}
        </header>
      )}
      <div className="cm-form__body">{children}</div>
      {actions ? <footer className="cm-form__actions">{actions}</footer> : null}
    </form>
  );
});
CmForm.displayName = "CmForm";
