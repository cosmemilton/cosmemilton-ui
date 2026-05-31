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
  children: ReactNode;
};

export const CmField = forwardRef<HTMLDivElement, CmFieldProps>(function CmField(
  { label, labelHint, description, error, required, density, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn("cm-field", cmDensityClass(density), className)} {...rest}>
      {(label || labelHint) ? (
        <div className="cm-field__header">
          <div className="cm-field__label-row">
            {label ? <div className="cm-field__label">{label}{required && <span className="cm-field__required">*</span>}</div> : null}
            {labelHint ? <div className="cm-field__label-hint">{labelHint}</div> : null}
          </div>
        </div>
      ) : null}
      {children}
      {description ? (
        <p className="cm-field__description">{description}</p>
      ) : null}
      {error ? (
        <p className="cm-field__error">{error}</p>
      ) : null}
    </div>
  );
});
CmField.displayName = "CmField";
