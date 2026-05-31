"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { CmButton } from "./button.js";
import type { CmButtonTone, CmButtonVariant } from "./button.js";
import { CmPortal } from "./portal.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useFloating } from "../../hooks/use-floating.js";

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

  // Encontrar opção selecionada
  const selectedOption = options.find((opt) => opt.value === selected);
  const displayLabel = selectedOption?.label || placeholder;
  const displayIcon = selectedOption?.icon;

  // Abrir/fechar dropdown
  const toggleDropdown = React.useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  // Fechar ao clicar fora ou pressionar Escape
  useClickOutside([dropdownRef, buttonRef], () => setIsOpen(false), isOpen);
  useEscapeKey(isOpen, () => setIsOpen(false));

  // Posicionar o menu (flip/shift/auto-update via Floating UI)
  useFloating(buttonRef, dropdownRef, { enabled: isOpen, matchWidth: true });

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
          className={`cm-split-button__chevron ${isOpen ? "cm-split-button__chevron--open" : ""}`}
        />
      </CmButton>

      {isOpen && (
        <CmPortal>
          <div ref={dropdownRef} className="cm-split-button__menu">
            {options.map((option) => {
              const isSelected = option.value === selected;

              return (
                <CmButton
                  unstyled
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`cm-split-button__option ${
                    isSelected ? "cm-split-button__option--selected" : ""
                  }`}
                >
                  {option.icon && <span className="cm-split-button__icon">{option.icon}</span>}
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
CmSplitButton.displayName = "CmSplitButton";
