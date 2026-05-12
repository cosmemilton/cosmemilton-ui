"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { CmPortal } from "./portal";

export type CmMultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options: CmMultiSelectOption[];
  name?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

type PortalThemeStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

const portalThemeVars = [
  "--color-card",
  "--color-background",
  "--color-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-border",
  "--color-primary",
  "--color-primary-foreground",
  "--shadow-lg",
  "--radius-md",
];

function readPortalThemeStyle(element: HTMLElement): PortalThemeStyle {
  const styles = window.getComputedStyle(element);
  const appTheme = element.closest<HTMLElement>("[data-app-theme]")?.dataset.appTheme;
  const themeStyle = portalThemeVars.reduce<PortalThemeStyle>((style, variable) => {
    style[variable as `--${string}`] = styles.getPropertyValue(variable);
    return style;
  }, {});

  if (appTheme === "dark") {
    themeStyle["--multi-select-popover-background"] = "#151c3a";
    themeStyle["--multi-select-option-hover-background"] = "#1e274f";
    themeStyle["--multi-select-option-selected-background"] = "#202a55";
  } else if (appTheme) {
    themeStyle["--multi-select-popover-background"] = "#f8fafc";
    themeStyle["--multi-select-option-hover-background"] = "#eef2ff";
    themeStyle["--multi-select-option-selected-background"] = "#ede9fe";
  }

  return themeStyle;
}

export function CmMultiSelect({
  value,
  onChange,
  options,
  name,
  label,
  placeholder = "Selecione",
  error,
  helperText,
  required,
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [portalThemeStyle, setPortalThemeStyle] = useState<PortalThemeStyle>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => new Set(value), [value]);
  const selectedOptions = options.filter((option) => selected.has(option.value));
  const hasInstruction = Boolean(helperText || placeholder);
  const isFloating = isFocused || open || selectedOptions.length > 0 || hasInstruction;

  const selectedLabel =
    selectedOptions.length === 0
      ? ""
      : selectedOptions.length <= 2
        ? selectedOptions.map((option) => option.label).join(", ")
        : `${selectedOptions.length} schools selected`;

  const toggleValue = useCallback(
    (nextValue: string) => {
      const next = new Set(value);
      if (next.has(nextValue)) next.delete(nextValue);
      else next.add(nextValue);
      onChange([...next]);
    },
    [onChange, value],
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    setPortalThemeStyle(readPortalThemeStyle(triggerRef.current));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (!panelRef.current || !triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const panel = panelRef.current;
      const viewportHeight = window.innerHeight;
      const panelHeight = panel.offsetHeight;
      let top = rect.bottom + 4;
      if (top + panelHeight > viewportHeight) top = rect.top - panelHeight - 4;
      panel.style.top = `${top}px`;
      panel.style.left = `${rect.left}px`;
      panel.style.minWidth = `${rect.width}px`;
    };

    requestAnimationFrame(() => requestAnimationFrame(updatePosition));
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const borderColor = error
    ? "cm-floating-field--error"
    : isFocused || open
      ? "cm-floating-field--focused"
      : "";
  const labelColor = error
    ? "cm-floating-field__label--error"
    : isFocused || open
      ? "cm-floating-field__label--focused"
      : "";

  return (
    <div className={cn("cm-multi-select cm-floating-field", !label && "cm-floating-field--unlabeled", className)}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value.join(",")}
          required={required}
          disabled={disabled}
        />
      ) : null}

      <div className={cn("cm-floating-field__control", borderColor)}>
        {label ? (
          <label
            className={cn(
              "cm-floating-field__label",
              labelColor,
              isFloating ? "cm-floating-field__label--floating" : "cm-floating-field__label--resting",
            )}
          >
            {label}
          </label>
        ) : null}

        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((current) => !current)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label ?? placeholder}
          className="cm-multi-select__trigger"
        >
          <span
            className={cn(
              "cm-multi-select__value",
              selectedOptions.length ? "" : "cm-multi-select__value--placeholder",
            )}
          >
            {selectedOptions.length ? selectedLabel : placeholder}
          </span>
        </button>

        <ChevronDown
          className={cn(
            "cm-multi-select__chevron",
            open && "cm-multi-select__chevron--open",
          )}
        />
      </div>

      {(error || helperText) ? (
        <p
          className={cn(
            "cm-floating-field__message",
            "cm-floating-field__message--static",
            error ? "cm-floating-field__message--error" : "",
          )}
        >
          {error || helperText}
        </p>
      ) : null}

      {open ? (
        <CmPortal>
          <div
            ref={panelRef}
            role="listbox"
            aria-multiselectable="true"
            style={portalThemeStyle}
            className="cm-multi-select__popover"
          >
            {options.map((option) => {
              const checked = selected.has(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggleValue(option.value)}
                  className={cn(
                    "cm-multi-select__option",
                    checked && "cm-multi-select__option--selected",
                  )}
                >
                  <span
                    className={cn(
                      "cm-multi-select__check",
                      checked && "cm-multi-select__check--selected",
                    )}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="cm-multi-select__option-label">{option.label}</span>
                </button>
              );
            })}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
