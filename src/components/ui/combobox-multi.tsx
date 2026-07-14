"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { CmPortal } from "./portal.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useFloating } from "../../hooks/use-floating.js";
import { useListboxKeyboard } from "../../hooks/use-listbox-keyboard.js";
import { type CmComboboxItem } from "./combobox.js";
import { cmFieldWidthStyle } from "./types.js";

export type CmComboboxMultiProps = {
  items: CmComboboxItem[];
  /** Valores selecionados (controlado, como no CmMultiSelect). */
  value: string[];
  onChange: (value: string[]) => void;
  /** Busca externa (debounce de 300ms), para carregar itens do servidor. */
  onSearch?: (query: string) => void;
  name?: string;
  label?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
  form?: string;
  placeholder?: string;
  emptyState?: ReactNode;
  emptyMessage?: ReactNode;
  className?: string;
  /** Largura fixa do campo (número → px). Aplica width + flex: 0 0 na raiz, dispensando wrappers em linhas flex. */
  width?: string | number;
  disabled?: boolean;
};

/**
 * Combobox de seleção múltipla: o mesmo campo de texto com filtro digitado do
 * `CmCombobox`, mas alternando itens com checkbox sem fechar a lista, como o
 * `CmMultiSelect`. Fora do foco, o campo exibe o resumo da seleção.
 */
export function CmComboboxMulti({
  items,
  value,
  onChange,
  onSearch,
  name,
  label,
  required,
  error,
  success,
  helperText,
  form,
  placeholder = "Selecionar...",
  emptyState,
  emptyMessage = "Nada encontrado.",
  className,
  width,
  disabled,
}: CmComboboxMultiProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = useMemo(() => new Set(value), [value]);
  const selectedItems = items.filter((item) => selected.has(item.value));
  const summary =
    selectedItems.length === 0
      ? ""
      : selectedItems.length <= 2
        ? selectedItems.map((item) => item.label).join(", ")
        : `${selectedItems.length} selecionados`;

  const hasInstruction = Boolean(helperText || placeholder);
  const isFloating = isFocused || isOpen || selectedItems.length > 0 || hasInstruction;

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

  const toggleValue = useCallback(
    (nextValue: string) => {
      const next = new Set(value);
      if (next.has(nextValue)) next.delete(nextValue);
      else next.add(nextValue);
      onChange([...next]);
    },
    [onChange, value],
  );

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
      if (item && !item.disabled) toggleValue(item.value);
    },
    initialIndex: filtered.findIndex((item) => selected.has(item.value)),
    closeOnActivate: false,
    textInput: true,
    disabled,
  });

  // Typing changes the filter; highlight follows the first match.
  useEffect(() => {
    if (isOpen) setActiveIndex(filtered.length > 0 ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useClickOutside([containerRef, panelRef], () => setIsOpen(false), isOpen);

  useFloating(controlRef, panelRef, { enabled: isOpen, matchWidth: true });

  useEscapeKey(isOpen, () => setIsOpen(false));

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setIsOpen(true);
    debouncedSearch(nextQuery);
  }

  function handleFocus() {
    setIsFocused(true);
    setIsOpen(true);
    setQuery("");
  }

  function handleBlur() {
    setIsFocused(false);
  }

  function handleClear() {
    setQuery("");
    onChange([]);
    inputRef.current?.focus();
  }

  const getBorderColor = () => {
    if (error) return "cm-floating-field--error";
    if (success) return "cm-floating-field--success";
    if (isFocused) return "cm-floating-field--focused";
    return "";
  };

  const getLabelColor = () => {
    if (error) return "cm-floating-field__label--error";
    if (success) return "cm-floating-field__label--success";
    if (isFocused || isOpen) return "cm-floating-field__label--focused";
    return "";
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "cm-combobox-multi cm-floating-field",
        !label && "cm-floating-field--unlabeled",
        className,
      )}
      style={cmFieldWidthStyle(width)}
    >
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value.join(",")}
          required={required}
          disabled={disabled}
          form={form}
        />
      ) : null}

      <div ref={controlRef} className={cn("cm-floating-field__control", getBorderColor())}>
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
            value={isFocused ? query : summary}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={() => {
              // Reopens when the input is clicked while already focused
              // (e.g. right after Escape closed the popup).
              if (!disabled) setIsOpen(true);
            }}
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

        {selectedItems.length > 0 && !disabled ? (
          <CmButton
            unstyled
            type="button"
            onMouseDown={(event) => {
              // Keeps focus (and the popup) on the input while clearing.
              event.preventDefault();
              handleClear();
            }}
            className="cm-combobox__clear"
            title="Limpar seleção"
          >
            <X size={14} />
          </CmButton>
        ) : null}

        <ChevronDown
          className={cn("cm-multi-select__chevron", isOpen && "cm-multi-select__chevron--open")}
        />
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

      {isOpen ? (
        <CmPortal>
          <div
            ref={panelRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="cm-multi-select__popover"
          >
            {filtered.length === 0
              ? (emptyState ?? <div className="cm-combobox__empty">{emptyMessage}</div>)
              : filtered.map((item, index) => {
                  const checked = selected.has(item.value);
                  return (
                    <CmButton
                      unstyled
                      key={item.value}
                      type="button"
                      role="option"
                      tabIndex={-1}
                      aria-selected={checked}
                      disabled={item.disabled}
                      onMouseDown={(event) => {
                        // Keeps focus on the input so the popup stays open.
                        event.preventDefault();
                        if (!item.disabled) toggleValue(item.value);
                      }}
                      className={cn(
                        "cm-multi-select__option",
                        checked && "cm-multi-select__option--selected",
                        index === activeIndex && "cm-multi-select__option--active",
                        item.disabled && "cm-combobox__option--disabled",
                      )}
                      {...getOptionProps(index)}
                    >
                      <span
                        className={cn(
                          "cm-multi-select__check",
                          checked && "cm-multi-select__check--selected",
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="cm-combobox-multi__option-text">
                        <span className="cm-multi-select__option-label">{item.label}</span>
                        {item.description ? (
                          <span className="cm-combobox__description">{item.description}</span>
                        ) : null}
                      </span>
                    </CmButton>
                  );
                })}
          </div>
        </CmPortal>
      ) : null}
    </div>
  );
}
CmComboboxMulti.displayName = "CmComboboxMulti";
