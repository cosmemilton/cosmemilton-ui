import { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type FieldProps = {
  label?: ReactNode;
  labelHint?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function CmField({ label, labelHint, description, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("cm-field", className)}>
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
}
