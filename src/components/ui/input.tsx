"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
  useState,
} from "react";
import { cn } from "../../lib/utils";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
};

const nativeMaskedInputTypes = new Set([
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

export const CmInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      startIcon,
      endIcon,
      startButton,
      endButton,
      id,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    // Prevent React warning: value prop on input should not be null
    const safeValue = value !== undefined ? (value ?? "") : undefined;

    const currentValue =
      (safeValue !== undefined ? safeValue : internalValue) ||
      props.placeholder;
    const hasValue = Boolean(currentValue);
    const hasNativeMask =
      typeof props.type === "string" && nativeMaskedInputTypes.has(props.type);
    const hasInstruction = Boolean(helperText);
    const isFloating = isFocused || hasValue || hasNativeMask || hasInstruction;

    const getBorderColor = () => {
      if (error) return "cm-floating-field--error";
      if (success) return "cm-floating-field--success";
      if (isFocused) return "cm-floating-field--focused";
      return "";
    };

    const getLabelColor = () => {
      if (error) return "cm-floating-field__label--error";
      if (success) return "cm-floating-field__label--success";
      if (isFocused) return "cm-floating-field__label--focused";
      return "";
    };

    const hasStartElement = Boolean(startIcon || startButton);

    return (
      <div className={cn("cm-input cm-floating-field", !label && "cm-floating-field--unlabeled", className)}>
        <div
          className={cn(
            "cm-floating-field__control",
            getBorderColor(),
          )}
        >
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "cm-floating-field__label",
                getLabelColor(),
                isFloating
                  ? "cm-floating-field__label--floating"
                  : hasStartElement
                    ? "cm-floating-field__label--resting-with-start"
                    : "cm-floating-field__label--resting",
              )}
            >
              {label}
            </label>
          )}

          {startIcon && (
            <span className="cm-floating-field__adornment">
              {startIcon}
            </span>
          )}
          {startButton && <span className="cm-floating-field__adornment">{startButton}</span>}

          <div className="cm-floating-field__input-wrap">
            <input
              {...props}
              ref={ref}
              id={inputId}
              data-ui-input="true"
              value={safeValue}
              defaultValue={defaultValue}
              className="cm-input__control"
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              onChange={(e) => {
                onChange?.(e);
                if (value === undefined) {
                  setInternalValue(e.target.value);
                }
              }}
            />
          </div>

          {endIcon && (
            <span className="cm-floating-field__adornment">
              {endIcon}
            </span>
          )}
          {endButton && (
            <span className="cm-floating-field__adornment cm-floating-field__adornment--flush">{endButton}</span>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "cm-floating-field__message",
              "cm-floating-field__message--static",
              error ? "cm-floating-field__message--error" : "",
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

CmInput.displayName = "CmInput";
