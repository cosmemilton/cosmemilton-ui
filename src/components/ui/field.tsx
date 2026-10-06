import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity } from "./types.js";

export type CmFieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  labelHint?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  density?: CmDensity;
  /** Associates the label with the nested control. */
  htmlFor?: string;
  layout?: "vertical" | "inline";
  /** Styles native input/select/textarea controls without replacing their behavior. */
  control?: "custom" | "native";
  children: ReactNode;
};

export const CmField = forwardRef<HTMLDivElement, CmFieldProps>(function CmField(
  {
    label,
    labelHint,
    description,
    error,
    required,
    density,
    htmlFor,
    layout = "vertical",
    control = "custom",
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "cm-field",
        `cm-field--${layout}`,
        control === "native" && "cm-field--native",
        cmDensityClass(density),
        className,
      )}
      {...rest}
    >
      {label || labelHint ? (
        <div className="cm-field__header">
          <div className="cm-field__label-row">
            {label ? (
              htmlFor ? (
                <label className="cm-field__label" htmlFor={htmlFor}>
                  {label}
                  {required && <span className="cm-field__required">*</span>}
                </label>
              ) : (
                <div className="cm-field__label">
                  {label}
                  {required && <span className="cm-field__required">*</span>}
                </div>
              )
            ) : null}
            {labelHint ? <div className="cm-field__label-hint">{labelHint}</div> : null}
          </div>
        </div>
      ) : null}
      <div className="cm-field__body">{children}</div>
      {description ? <p className="cm-field__description">{description}</p> : null}
      {error ? (
        <p className="cm-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
CmField.displayName = "CmField";
