"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  presentation?: "default" | "inputSuffix" | "compact";
};

export const CmCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, presentation = "default", ...props }, ref) => {
    const isInputSuffix = presentation === "inputSuffix";
    const isCompact = presentation === "compact";

    return (
      <label
        className={cn(
          "cm-checkbox",
          isInputSuffix
            ? "cm-checkbox--suffix"
            : isCompact
              ? "cm-checkbox--compact"
              : "cm-checkbox--default",
        )}
      >
        <span
          className={cn(
            "cm-checkbox__control",
            isInputSuffix || isCompact ? "cm-checkbox__control--sm" : "cm-checkbox__control--md",
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "cm-checkbox__input",
              className,
            )}
            {...props}
          />
          <span
            className={cn(
              "cm-checkbox__box",
              isInputSuffix
                ? "cm-checkbox__box--suffix"
                : "cm-checkbox__box--default",
            )}
          >
            <Check size={isInputSuffix || isCompact ? 12 : 14} strokeWidth={3} />
            ✓
          </span>
        </span>
        {(label || description) && (
          <span className="cm-checkbox__content">
            {label ? (
              <span
                className={cn(
                  isInputSuffix
                    ? "cm-checkbox__label cm-checkbox__label--suffix"
                    : isCompact
                      ? "cm-checkbox__label cm-checkbox__label--compact"
                    : "cm-checkbox__label",
                )}
              >
                {label}
              </span>
            ) : null}
            {description ? (
              <span className="cm-checkbox__description">
                {description}
              </span>
            ) : null}
          </span>
        )}
      </label>
    );
  },
);

CmCheckbox.displayName = "CmCheckbox";
