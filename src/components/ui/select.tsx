"use client";

import { ReactNode, type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { CmIcon } from "./icon.js";
import { CmPortal } from "./portal.js";
import { ChevronDown, Check, X } from "lucide-react";
import { cmDensityClass, cmFieldWidthStyle, type CmDensity } from "./types.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useFloating } from "../../hooks/use-floating.js";
import { useListboxKeyboard } from "../../hooks/use-listbox-keyboard.js";

type SelectOption = {
  value: string;
  label: string;
  icon?: string;
};

export type CmSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startButton?: ReactNode;
  endButton?: ReactNode;
  className?: string;
  /** Largura fixa do campo (número → px). Aplica width + flex: 0 0 na raiz, dispensando wrappers em linhas flex. */
  width?: string | number;
  showOptionIcons?: boolean;
  disabled?: boolean;
  form?: string;
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  density?: CmDensity;
  /** Customiza o texto exibido no gatilho após a seleção. O dropdown sempre exibe o label completo. */
  renderSelected?: (option: SelectOption) => string;
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
  "--radius-md",
  "--shadow-lg",
];

function readPortalThemeStyle(element: HTMLElement): PortalThemeStyle {
  const styles = window.getComputedStyle(element);
  const appTheme = element.closest<HTMLElement>("[data-app-theme]")?.dataset.appTheme;
  const themeStyle = portalThemeVars.reduce<PortalThemeStyle>((style, variable) => {
    style[variable as `--${string}`] = styles.getPropertyValue(variable);
    return style;
  }, {});

  if (appTheme === "dark") {
    themeStyle["--select-popover-background"] = "#151c3a";
    themeStyle["--select-option-hover-background"] = "#1e274f";
    themeStyle["--select-option-selected-background"] = "#202a55";
  } else if (appTheme) {
    themeStyle["--select-popover-background"] = "#f8fafc";
    themeStyle["--select-option-hover-background"] = "#eef2ff";
    themeStyle["--select-option-selected-background"] = "#ede9fe";
  }

  return themeStyle;
}

export function CmSelect({
  value,
  onChange,
  options,
  name,
  required,
  label,
  placeholder,
  error,
  success,
  helperText,
  startIcon,
  endIcon,
  startButton,
  endButton,
  className,
  width,
  clearable = false,
  clearLabel = "Limpar seleção",
  density,
  showOptionIcons = false,
  disabled,
  form,
  onClear,
  renderSelected,
}: CmSelectProps) {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [portalThemeStyle, setPortalThemeStyle] = useState<PortalThemeStyle>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = Boolean(value) || Boolean(selectedOption);
  const hasInstruction = Boolean(helperText || placeholder);
  const isFloating = isFocused || open || hasValue || hasInstruction;
  const hasStartElement = Boolean(startIcon || startButton);
  const selectedIcon = showOptionIcons && selectedOption?.icon;
  const canClear = clearable && Boolean(selectedOption) && !disabled;

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setOpen(false);
    },
    [onChange],
  );

  const { activeIndex, listboxId, getOptionProps, triggerProps } = useListboxKeyboard({
    open,
    setOpen,
    itemCount: options.length,
    onActivate: (index) => onChange(options[index].value),
    initialIndex: options.findIndex((opt) => opt.value === value),
    getLabel: (index) => options[index].label,
    disabled,
  });

  const handleClear = useCallback(() => {
    if (disabled) return;
    onChange("");
    onClear?.();
    setOpen(false);
    triggerRef.current?.focus();
  }, [disabled, onChange, onClear]);

  // Close on outside click
  useClickOutside([panelRef, triggerRef], () => setOpen(false), open);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    setPortalThemeStyle(readPortalThemeStyle(triggerRef.current));
  }, [open]);

  // Position the dropdown
  useFloating(triggerRef, panelRef, { enabled: open, matchWidth: true });

  // Close on Escape
  useEscapeKey(open, () => setOpen(false));

  const getBorderColor = () => {
    if (error) return "cm-floating-field--error";
    if (success) return "cm-floating-field--success";
    if (isFocused || open) return "cm-floating-field--focused";
    return "";
  };

  const getLabelColor = () => {
    if (error) return "cm-floating-field__label--error";
    if (success) return "cm-floating-field__label--success";
    if (isFocused || open) return "cm-floating-field__label--focused";
    return "";
  };

  return (
    <div
      className={cn(
        "cm-select cm-floating-field",
        !label && "cm-floating-field--unlabeled",
        cmDensityClass(density),
        className,
      )}
      style={cmFieldWidthStyle(width)}
    >
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          form={form}
        />
      ) : null}

      <div className={cn("cm-floating-field__control", getBorderColor())}>
        {label && (
          <label
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
        {startButton && <span className="cm-floating-field__adornment">{startButton}</span>}

        {selectedIcon && (
          <span className="cm-floating-field__adornment">
            <CmIcon name={selectedIcon} size={20} />
          </span>
        )}

        <CmButton
          unstyled
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label || placeholder || "CmSelect option"}
          className="cm-select__trigger"
          {...triggerProps}
        >
          <span
            className={cn(
              "cm-select__value",
              selectedOption ? "" : "cm-select__value--placeholder",
            )}
          >
            {selectedOption
              ? renderSelected
                ? renderSelected(selectedOption)
                : selectedOption.label
              : placeholder || ""}
          </span>
        </CmButton>

        <ChevronDown className={cn("cm-select__chevron", open && "cm-select__chevron--open")} />
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

        {endIcon && <span className="cm-floating-field__adornment">{endIcon}</span>}
        {endButton && <span className="cm-floating-field__adornment">{endButton}</span>}
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

      {open && (
        <CmPortal>
          <div
            ref={panelRef}
            id={listboxId}
            role="listbox"
            style={portalThemeStyle}
            className="cm-select__popover"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <CmButton
                  unstyled
                  key={option.value}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "cm-select__option",
                    isSelected && "cm-select__option--selected",
                    index === activeIndex && "cm-select__option--active",
                  )}
                  {...getOptionProps(index)}
                >
                  {showOptionIcons && option.icon && <CmIcon name={option.icon} size={16} />}
                  <span className="cm-select__option-label">{option.label}</span>
                  {isSelected && <Check className="cm-select__check" />}
                </CmButton>
              );
            })}
          </div>
        </CmPortal>
      )}
    </div>
  );
}
CmSelect.displayName = "CmSelect";
