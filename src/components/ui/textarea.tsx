"use client";

import { forwardRef, ReactNode, TextareaHTMLAttributes, useId, useState } from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity } from "./types.js";

export type CmTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
  density?: CmDensity;
};

export const CmTextarea = forwardRef<HTMLTextAreaElement, CmTextareaProps>(
  (
    {
      className,
      density,
      label,
      error,
      success,
      helperText,
      startIcon,
      endIcon,
      startButton,
      endButton,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const messageId = `${textareaId}-message`;
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || "");

    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = Boolean(currentValue);
    const isFloating = isFocused || hasValue;

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
      <div
        className={cn(
          "cm-textarea cm-floating-field cm-floating-field--textarea",
          !label && "cm-floating-field--unlabeled",
          cmDensityClass(density),
          className,
        )}
      >
        <div className={cn("cm-floating-field__control", getBorderColor())}>
          {label && (
            <label
              htmlFor={textareaId}
              className={cn(
                "cm-floating-field__label",
                getLabelColor(),
                isFloating
                  ? "cm-floating-field__label--floating"
                  : hasStartElement
                    ? "cm-floating-field__label--textarea-with-start"
                    : "cm-floating-field__label--textarea-resting",
              )}
            >
              {label}
            </label>
          )}

          {startIcon && (
            <span className="cm-floating-field__adornment cm-floating-field__adornment--textarea">
              {startIcon}
            </span>
          )}
          {startButton && <span className="cm-floating-field__adornment">{startButton}</span>}

          <div className="cm-floating-field__input-wrap">
            <textarea
              {...props}
              ref={ref}
              id={textareaId}
              aria-invalid={props["aria-invalid"] ?? Boolean(error)}
              aria-describedby={
                [props["aria-describedby"], error || helperText ? messageId : undefined]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              value={value}
              defaultValue={defaultValue}
              className="cm-textarea__control"
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              onChange={(e) => {
                if (value === undefined) {
                  setInternalValue(e.target.value);
                }
                onChange?.(e);
              }}
            />
          </div>

          {endIcon && (
            <span className="cm-floating-field__adornment cm-floating-field__adornment--textarea">
              {endIcon}
            </span>
          )}
          {endButton && <span className="cm-floating-field__adornment">{endButton}</span>}
        </div>

        {(error || helperText) && (
          <p
            id={messageId}
            role={error ? "alert" : undefined}
            className={cn(
              "cm-floating-field__message cm-floating-field__message--static",
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

CmTextarea.displayName = "CmTextarea";
