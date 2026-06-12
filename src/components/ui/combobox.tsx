"use client";

import {
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { CmPortal } from "./portal.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useListboxKeyboard } from "../../hooks/use-listbox-keyboard.js";
import { cmFieldWidthStyle } from "./types.js";

export type CmComboboxItem = {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
  disabled?: boolean;
};

export type CmComboboxProps = {
  items: CmComboboxItem[];
  onChange?: (item: CmComboboxItem | null) => void;
  onSearch?: (query: string) => void;
  name?: string;
  value?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  form?: string;
  placeholder?: string;
  emptyState?: ReactNode;
  emptyMessage?: ReactNode;
  className?: string;
  /** Largura fixa do campo (número → px). Aplica width + flex: 0 0 na raiz, dispensando wrappers em linhas flex. */
  width?: string | number;
  initialValue?: string;
  disabled?: boolean;
  dropdownSizing?: "input" | "content";
  selectedDisplay?: "full" | "label";
};

type PortalThemeStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

const portalThemeVars = [
  "--color-popover",
  "--color-popover-foreground",
  "--color-background",
  "--color-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-border",
  "--color-primary",
  "--color-primary-foreground",
];

function readPortalThemeStyle(element: HTMLElement): PortalThemeStyle {
  const styles = window.getComputedStyle(element);
  const themeStyle = portalThemeVars.reduce<PortalThemeStyle>((style, variable) => {
    style[variable as `--${string}`] = styles.getPropertyValue(variable);
    return style;
  }, {});

  if (!themeStyle["--color-popover"]) {
    themeStyle["--color-popover"] =
      styles.getPropertyValue("--color-card") || styles.getPropertyValue("--color-background");
  }
  if (!themeStyle["--color-popover-foreground"]) {
    themeStyle["--color-popover-foreground"] = styles.getPropertyValue("--color-foreground");
  }

  return themeStyle;
}

export function CmCombobox({
  items,
  onChange,
  onSearch,
  name,
  value,
  label,
  required,
  error,
  helperText,
  form,
  placeholder = "Selecionar...",
  emptyState,
  emptyMessage = "Nada encontrado.",
  className,
  width,
  initialValue,
  disabled,
  dropdownSizing = "input",
  selectedDisplay = "full",
}: CmComboboxProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CmComboboxItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("bottom");
  const [dropdownStyle, setDropdownStyle] = useState<{
    top?: number;
    left?: number;
    right?: number;
    width?: number;
    maxWidth?: number;
  }>({});
  const [portalThemeStyle, setPortalThemeStyle] = useState<PortalThemeStyle>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const selectingRef = useRef(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedValue = value ?? active?.value ?? "";
  const selectedInitialValue = value ?? initialValue ?? "";
  const hasValue = Boolean(query || selectedValue);
  const hasInstruction = Boolean(helperText || placeholder);
  const isFloating = isFocused || isOpen || hasValue || hasInstruction;

  const getDisplayValue = useCallback(
    (item: CmComboboxItem): string => {
      if (selectedDisplay === "label") return item.label;
      return item.description ? `${item.label} - ${item.description}` : item.label;
    },
    [selectedDisplay],
  );

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.description?.toLowerCase().includes(normalized) ||
        item.keywords?.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  const debouncedSearch = useCallback(
    (nextQuery: string) => {
      if (!onSearch) return;
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        onSearch(nextQuery);
      }, 300);
    },
    [onSearch],
  );

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const position = rect.top / viewportHeight > 0.5 ? "top" : "bottom";
    setDropdownPosition(position);

    if (dropdownSizing === "content") {
      const spaceOnRight = window.innerWidth - rect.left - 8;
      const spaceOnLeft = rect.right - 8;

      if (spaceOnLeft > spaceOnRight) {
        setDropdownStyle({
          top: position === "bottom" ? rect.bottom + 4 : undefined,
          left: undefined,
          right: window.innerWidth - rect.right,
          width: undefined,
          maxWidth: spaceOnLeft,
        });
        return;
      }

      setDropdownStyle({
        top: position === "bottom" ? rect.bottom + 4 : undefined,
        left: rect.left,
        right: undefined,
        width: undefined,
        maxWidth: spaceOnRight,
      });
      return;
    }

    setDropdownStyle({
      top: position === "bottom" ? rect.bottom + 4 : undefined,
      left: rect.left,
      right: undefined,
      width: rect.width,
      maxWidth: undefined,
    });
  }, [dropdownSizing]);

  useEffect(() => {
    if (isFocused) return;
    if (selectedInitialValue) {
      const item = items.find((candidate) => candidate.value === selectedInitialValue);
      if (item) {
        setActive(item);
        setQuery(getDisplayValue(item));
        return;
      }

      if (value !== undefined) {
        setActive(null);
        setQuery(selectedInitialValue);
      }
      return;
    }

    setActive(null);
    setQuery("");
  }, [getDisplayValue, isFocused, items, selectedInitialValue, value]);

  useEffect(() => {
    if (isFocused) return;
    if (!selectedInitialValue || active?.value === selectedInitialValue) return;
    const item = items.find((candidate) => candidate.value === selectedInitialValue);
    if (!item) return;

    setActive(item);
    setQuery(getDisplayValue(item));
  }, [active?.value, getDisplayValue, isFocused, items, selectedInitialValue]);

  const {
    activeIndex,
    setActiveIndex,
    listboxId,
    getOptionProps,
    triggerProps: keyboardProps,
  } = useListboxKeyboard({
    open: isOpen,
    setOpen: setIsOpen,
    itemCount: filtered.length,
    onActivate: (index) => {
      const item = filtered[index];
      if (item && !item.disabled) handleSelect(item);
    },
    initialIndex: filtered.findIndex((item) => item.value === (value ?? active?.value)),
    textInput: true,
    disabled,
  });

  // Typing changes the filter; highlight follows the first match.
  useEffect(() => {
    if (isOpen) setActiveIndex(filtered.length > 0 ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useClickOutside([containerRef, panelRef], () => setIsOpen(false));

  useEscapeKey(isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;
    const handleWindowChange = () => updateDropdownPosition();
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);
    return () => {
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    setPortalThemeStyle(readPortalThemeStyle(containerRef.current));
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;

    if (active) {
      setActive(null);
    }

    setQuery(nextQuery);
    setIsOpen(true);
    debouncedSearch(nextQuery);
  }

  function handleFocus() {
    setIsFocused(true);
    setIsOpen(true);

    if (active) {
      setQuery(active.label);
    }

    updateDropdownPosition();
  }

  function handleBlur() {
    setIsFocused(false);

    if (selectingRef.current) {
      selectingRef.current = false;
      return;
    }

    if (active) {
      setQuery(getDisplayValue(active));
    }
  }

  function handleSelect(item: CmComboboxItem) {
    selectingRef.current = true;
    setActive(item);
    setQuery(getDisplayValue(item));
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
    onChange?.(item);
  }

  function handleClear() {
    setActive(null);
    setQuery("");
    setIsOpen(false);
    onChange?.(null);
  }

  const getBorderColor = () => {
    if (error) return "cm-floating-field--error";
    if (isFocused) return "cm-floating-field--focused";
    return "";
  };

  const getLabelColor = () => {
    if (error) return "cm-floating-field__label--error";
    if (isFocused || isOpen) return "cm-floating-field__label--focused";
    return "";
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "cm-combobox cm-floating-field",
        !label && "cm-floating-field--unlabeled",
        className,
      )}
      style={cmFieldWidthStyle(width)}
    >
      {name ? (
        <input
          type="hidden"
          name={name}
          value={selectedValue}
          required={required}
          disabled={disabled}
          form={form}
        />
      ) : null}

      <div className={cn("cm-floating-field__control", getBorderColor())}>
        {label ? (
          <label
            className={cn(
              "cm-floating-field__label",
              getLabelColor(),
              isFloating
                ? "cm-floating-field__label--floating"
                : "cm-floating-field__label--resting",
            )}
          >
            {label}
          </label>
        ) : null}

        <div className="cm-floating-field__input-wrap">
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            data-ui-input="true"
            className="cm-combobox__input"
            {...keyboardProps}
            aria-controls={listboxId}
          />
        </div>

        {active ? (
          <CmButton
            unstyled
            type="button"
            onClick={handleClear}
            className="cm-combobox__clear"
            title="Limpar seleção"
          >
            <X size={14} />
          </CmButton>
        ) : null}

        <ChevronDown className="cm-combobox__chevron" />
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

      {isOpen ? (
        <CmPortal>
          <div
            ref={(node) => {
              panelRef.current = node;
            }}
            style={{
              position: "fixed",
              top: dropdownPosition === "bottom" ? dropdownStyle.top : undefined,
              bottom:
                dropdownPosition === "top"
                  ? window.innerHeight - (inputRef.current?.getBoundingClientRect().top ?? 0) + 4
                  : undefined,
              left: dropdownStyle.left,
              right: dropdownStyle.right,
              width: dropdownSizing === "content" ? "max-content" : dropdownStyle.width,
              minWidth: inputRef.current?.getBoundingClientRect().width ?? 0,
              maxWidth: dropdownStyle.maxWidth ?? "calc(100vw - 16px)",
              zIndex: 9999,
              ...portalThemeStyle,
            }}
            id={listboxId}
            role="listbox"
            className="cm-combobox__popover"
          >
            {filtered.length === 0
              ? (emptyState ?? <div className="cm-combobox__empty">{emptyMessage}</div>)
              : filtered.map((item, index) => (
                  <CmButton
                    unstyled
                    key={item.value}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={active?.value === item.value}
                    disabled={item.disabled}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      if (!item.disabled) handleSelect(item);
                    }}
                    className={cn(
                      "cm-combobox__option",
                      index === activeIndex && "cm-combobox__option--active",
                      item.disabled
                        ? "cm-combobox__option--disabled"
                        : active?.value === item.value
                          ? "cm-combobox__option--selected"
                          : "",
                    )}
                    {...getOptionProps(index)}
                  >
                    <span className="cm-combobox__option-label">{item.label}</span>
                    {item.description ? (
                      <span
                        className={cn(
                          "cm-combobox__description",
                          active?.value === item.value ? "cm-combobox__description--selected" : "",
                        )}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </CmButton>
                ))}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
CmCombobox.displayName = "CmCombobox";
