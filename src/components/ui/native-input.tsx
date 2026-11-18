import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { CmField } from "./field.js";

export type CmNativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children"> & {
  label: string;
};

/** Native text, date, time or numeric control with the same field layout as CmNativeSelect. */
export const CmNativeInput = forwardRef<HTMLInputElement, CmNativeInputProps>(
  function CmNativeInput({ id, label, required, ...props }, ref) {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    return (
      <CmField label={label} htmlFor={controlId} control="native" required={required}>
        <input {...props} id={controlId} ref={ref} required={required} />
      </CmField>
    );
  },
);
CmNativeInput.displayName = "CmNativeInput";
