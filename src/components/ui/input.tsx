"use client";

import {
  type AnimationEvent,
  type ChangeEvent,
  type InputEvent,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { cmDensityClass, cmFieldWidthStyle, type CmDensity } from "./types.js";

/* "width" também é omitido do atributo HTML legado: aqui ele dimensiona a raiz
   do campo (cmFieldWidthStyle), não o <input>. */
export type CmInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "width"> & {
  label?: string;
  /** Largura fixa do campo (número → px). Aplica width + flex: 0 0 na raiz, dispensando wrappers em linhas flex. */
  width?: string | number;
  error?: string;
  success?: boolean;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  density?: CmDensity;
  numeric?: boolean | "integer" | "decimal";
};

const nativeMaskedInputTypes = new Set(["date", "datetime-local", "month", "time", "week"]);

function hasRenderableValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).length > 0;
}

function resolveNumericMode(
  numeric: CmInputProps["numeric"],
  inputMode: CmInputProps["inputMode"],
) {
  if (numeric === true) return "decimal";
  if (numeric) return numeric;
  if (inputMode === "numeric") return "integer";
  if (inputMode === "decimal") return "decimal";
  return undefined;
}

function sanitizeNumericValue(value: string, mode: "integer" | "decimal") {
  let sanitized = "";
  let hasDecimalSeparator = false;

  for (const character of value) {
    if (/\d/u.test(character)) {
      sanitized += character;
      continue;
    }

    if (mode === "decimal" && (character === "," || character === ".") && !hasDecimalSeparator) {
      sanitized += character;
      hasDecimalSeparator = true;
    }
  }

  return sanitized;
}

function sanitizeInputElement(input: HTMLInputElement, mode: "integer" | "decimal" | undefined) {
  if (!mode) return input.value;

  const previousValue = input.value;
  const nextValue = sanitizeNumericValue(previousValue, mode);

  if (nextValue === previousValue) return nextValue;

  const selectionStart = input.selectionStart ?? previousValue.length;
  const previousSelectionValue = previousValue.slice(0, selectionStart);
  const nextSelectionValue = sanitizeNumericValue(previousSelectionValue, mode);

  input.value = nextValue;

  try {
    input.setSelectionRange(nextSelectionValue.length, nextSelectionValue.length);
  } catch {
    // Some input types do not expose selection ranges.
  }

  return nextValue;
}

export const CmInput = forwardRef<HTMLInputElement, CmInputProps>(
  (
    {
      className,
      clearable = false,
      clearLabel = "Limpar campo",
      density,
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
      onInput,
      onAnimationStart,
      onFocus,
      onBlur,
      onClear,
      numeric,
      width,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const [detectedDomValue, setDetectedDomValue] = useState(() =>
      defaultValue === undefined || defaultValue === null ? "" : String(defaultValue),
    );

    // Prevent React warning: value prop on input should not be null
    const safeValue = value !== undefined ? (value ?? "") : undefined;
    const numericMode = resolveNumericMode(numeric, props.inputMode);
    const resolvedInputMode =
      props.inputMode ??
      (numericMode === "integer" ? "numeric" : numericMode === "decimal" ? "decimal" : undefined);

    const syncDomValue = useCallback(() => {
      const nextValue = inputRef.current?.value ?? "";
      setDetectedDomValue((previous) => (previous === nextValue ? previous : nextValue));
    }, []);

    useEffect(() => {
      syncDomValue();

      const animationFrame = window.requestAnimationFrame(syncDomValue);
      const timers = [
        window.setTimeout(syncDomValue, 0),
        window.setTimeout(syncDomValue, 120),
        window.setTimeout(syncDomValue, 500),
        window.setTimeout(syncDomValue, 1200),
      ];

      return () => {
        window.cancelAnimationFrame(animationFrame);
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }, [defaultValue, safeValue, syncDomValue]);

    const declaredValue = safeValue !== undefined ? safeValue : internalValue;
    const hasDeclaredValue = hasRenderableValue(declaredValue);
    const hasDetectedDomValue = hasRenderableValue(detectedDomValue);
    const hasValue = hasDeclaredValue || hasDetectedDomValue || Boolean(props.placeholder);
    const hasActualValue = hasDeclaredValue || hasDetectedDomValue;
    const hasNativeMask = typeof props.type === "string" && nativeMaskedInputTypes.has(props.type);
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
    const canClear = clearable && hasActualValue && !props.disabled && !props.readOnly;

    function setInputRef(node: HTMLInputElement | null) {
      inputRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    function handleClear() {
      if (props.disabled || props.readOnly) return;
      const input = inputRef.current;
      if (input) {
        input.value = "";
        setDetectedDomValue("");
        onChange?.({
          target: input,
          currentTarget: input,
        } as ChangeEvent<HTMLInputElement>);
        input.focus();
      }
      if (value === undefined) {
        setInternalValue("");
      }
      onClear?.();
    }

    return (
      <div
        className={cn(
          "cm-input cm-floating-field",
          !label && "cm-floating-field--unlabeled",
          cmDensityClass(density),
          className,
        )}
        style={cmFieldWidthStyle(width)}
      >
        <div className={cn("cm-floating-field__control", getBorderColor())}>
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

          {startIcon && <span className="cm-floating-field__adornment">{startIcon}</span>}
          {startButton && (
            <span className="cm-floating-field__adornment cm-floating-field__adornment--flush">
              {startButton}
            </span>
          )}

          <div className="cm-floating-field__input-wrap">
            <input
              {...props}
              ref={setInputRef}
              id={inputId}
              data-ui-input="true"
              inputMode={resolvedInputMode}
              value={safeValue}
              defaultValue={defaultValue}
              className="cm-input__control"
              onFocus={(e) => {
                setDetectedDomValue(e.currentTarget.value);
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setDetectedDomValue(e.currentTarget.value);
                setIsFocused(false);
                onBlur?.(e);
              }}
              onChange={(e) => {
                const nextValue = sanitizeInputElement(e.currentTarget, numericMode);
                onChange?.(e);
                setDetectedDomValue(nextValue);
                if (value === undefined) {
                  setInternalValue(nextValue);
                }
              }}
              onInput={(e: InputEvent<HTMLInputElement>) => {
                setDetectedDomValue(sanitizeInputElement(e.currentTarget, numericMode));
                onInput?.(e);
              }}
              onAnimationStart={(e: AnimationEvent<HTMLInputElement>) => {
                if (e.animationName === "cm-input-autofill-detect") {
                  setDetectedDomValue(e.currentTarget.value);
                }
                onAnimationStart?.(e);
              }}
            />
          </div>

          {endIcon && <span className="cm-floating-field__adornment">{endIcon}</span>}
          {canClear ? (
            <CmButton
              unstyled
              type="button"
              className="cm-floating-field__clear"
              aria-label={clearLabel}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
            >
              <X size={14} aria-hidden="true" />
            </CmButton>
          ) : null}
          {endButton && (
            <span className="cm-floating-field__adornment cm-floating-field__adornment--flush">
              {endButton}
            </span>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "cm-floating-field__message",
              "cm-floating-field__message--static",
              error ? "cm-floating-field__message--error" : "",
              !error && success ? "cm-floating-field__message--success" : "",
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
