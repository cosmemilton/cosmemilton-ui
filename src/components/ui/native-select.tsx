import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { CmField } from "./field.js";

export type CmNativeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
};

/** Labeled native select with normal form submission, validation, focus and ref semantics. */
export const CmNativeSelect = forwardRef<HTMLSelectElement, CmNativeSelectProps>(
  function CmNativeSelect({ id, label, options, required, ...props }, ref) {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    return (
      <CmField label={label} htmlFor={controlId} control="native" required={required}>
        <select {...props} id={controlId} ref={ref} required={required}>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </CmField>
    );
  },
);
CmNativeSelect.displayName = "CmNativeSelect";
