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
import { cn } from "../../lib/utils";
import { CmPortal } from "./portal";

export type CmComboboxItem = {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
  disabled?: boolean;
};

type ComboboxProps = {
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
  className?: string;
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
    themeStyle["--color-popover"] = styles.getPropertyValue("--color-card") || styles.getPropertyValue("--color-background");
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
  className,
  initialValue,
  disabled,
  dropdownSizing = "input",
  selectedDisplay = "full",
}: ComboboxProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CmComboboxItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">(
    "bottom",
  );
  const [dropdownStyle, setDropdownStyle] = useState<{
    top?: number;
    left?: number;
    right?: number;
    width?: number;
    maxWidth?: number;
  }>({});
  const [portalThemeStyle, setPortalThemeStyle] = useState<PortalThemeStyle>(
    {},
  );
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
      return item.description
        ? `${item.label} - ${item.description}`
        : item.label;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleWindowChange = () => {
      if (isOpen) updateDropdownPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div ref={containerRef} className={cn("cm-combobox cm-floating-field", !label && "cm-floating-field--unlabeled", className)}>
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

      <div
        className={cn(
          "cm-floating-field__control",
          getBorderColor(),
        )}
      >
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
            data-ui-input="true"
            className="cm-combobox__input"
          />
        </div>

        {active ? (
          <button
            type="button"
            onClick={handleClear}
            className="cm-combobox__clear"
            title="Limpar seleção"
          >
            <X size={14} />
          </button>
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
              top:
                dropdownPosition === "bottom" ? dropdownStyle.top : undefined,
              bottom:
                dropdownPosition === "top"
                  ? window.innerHeight -
                    (inputRef.current?.getBoundingClientRect().top ?? 0) +
                    4
                  : undefined,
              left: dropdownStyle.left,
              right: dropdownStyle.right,
              width:
                dropdownSizing === "content"
                  ? "max-content"
                  : dropdownStyle.width,
              minWidth: inputRef.current?.getBoundingClientRect().width ?? 0,
              maxWidth: dropdownStyle.maxWidth ?? "calc(100vw - 16px)",
              zIndex: 9999,
              ...portalThemeStyle,
            }}
            className="cm-combobox__popover"
          >
            {filtered.length === 0
              ? (emptyState ?? (
                  <div className="cm-combobox__empty">
                    Nada encontrado.
                  </div>
                ))
              : filtered.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={item.disabled}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      if (!item.disabled) handleSelect(item);
                    }}
                    className={cn(
                      "cm-combobox__option",
                      item.disabled
                        ? "cm-combobox__option--disabled"
                        : active?.value === item.value
                          ? "cm-combobox__option--selected"
                          : "",
                    )}
                  >
                    <span className="cm-combobox__option-label">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span
                        className={cn(
                          "cm-combobox__description",
                          active?.value === item.value
                            ? "cm-combobox__description--selected"
                            : "",
                        )}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </button>
                ))}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
