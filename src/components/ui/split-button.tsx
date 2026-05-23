"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { CmButton } from "./button.js";
import type { CmButtonTone, CmButtonVariant } from "./button.js";
import { CmPortal } from "./portal.js";

export interface CmSplitButtonOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface CmSplitButtonProps {
  /** Opções do dropdown */
  options: CmSplitButtonOption[];
  /** Opção selecionada (value) */
  selected?: string;
  /** Callback quando uma opção é selecionada */
  onSelect?: (value: string) => void;
  /** CmLabel quando nenhuma opção está selecionada */
  placeholder?: string;
  /** Variante do botão */
  variant?: CmButtonVariant;
  /** Tom/cor do botão */
  tone?: CmButtonTone;
  /** Desabilitar botão */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Split CmButton - Botão com dropdown de opções
 *
 * Combina um botão principal com um menu dropdown de opções.
 * Útil para filtros, seleção de ações, etc.
 *
 * @example
 * ```tsx
 * <CmSplitButton
 *   options={[
 *     { label: "Todos", value: "all" },
 *     { label: "Saída", value: "output" },
 *     { label: "Entrada", value: "input" }
 *   ]}
 *   selected="all"
 *   onSelect={(value) => console.log(value)}
 * />
 * ```
 */
export function CmSplitButton({
  options,
  selected,
  onSelect,
  placeholder = "Selecione",
  variant = "outline",
  tone = "default",
  disabled = false,
  className,
}: CmSplitButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  // Encontrar opção selecionada
  const selectedOption = options.find((opt) => opt.value === selected);
  const displayLabel = selectedOption?.label || placeholder;
  const displayIcon = selectedOption?.icon;

  // Calcular posição do dropdown
  const updateDropdownPosition = React.useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Abrir/fechar dropdown
  const toggleDropdown = React.useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (!prev) {
        updateDropdownPosition();
      }
      return !prev;
    });
  }, [disabled, updateDropdownPosition]);

  // Fechar ao clicar fora
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Atualizar posição ao redimensionar
  React.useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      updateDropdownPosition();
    };

    const handleScroll = () => {
      updateDropdownPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, updateDropdownPosition]);

  // Selecionar opção
  const handleSelect = (value: string) => {
    onSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className="cm-split-button">
      <CmButton
        ref={buttonRef}
        variant={variant}
        tone={tone}
        disabled={disabled}
        onClick={toggleDropdown}
        className={className}
      >
        <span className="cm-split-button__content">
          {displayIcon && <span className="cm-split-button__icon">{displayIcon}</span>}
          <span>{displayLabel}</span>
        </span>
        <ChevronDown
          className={`cm-split-button__chevron ${
            isOpen ? "cm-split-button__chevron--open" : ""
          }`}
        />
      </CmButton>

      {isOpen && (
        <CmPortal>
          <div
            ref={dropdownRef}
            className="cm-split-button__menu"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${dropdownPosition.width}px`,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === selected;

              return (
                <CmButton
                  unstyled
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`cm-split-button__option ${
                    isSelected
                      ? "cm-split-button__option--selected"
                      : ""
                  }`}
                >
                  {option.icon && (
                    <span className="cm-split-button__icon">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </CmButton>
              );
            })}
          </div>
        </CmPortal>
      )}
    </div>
  );
}
