"use client";

import { Lock } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmSignalBars } from "./signal-bars.js";

export type CmSignalListItem = {
  /** Identificador estável — é o que volta no `onChange`. */
  id: string;
  /** Nome da entrada (SSID, nome do espelho…). */
  label: ReactNode;
  /** Intensidade de 0 a 100. `undefined` esconde as barras. */
  signal?: number;
  /** Desenha o cadeado e anuncia "protegida". */
  locked?: boolean;
  description?: ReactNode;
  /** Slot à direita, antes das barras: "conhecida", "12,4 MB/s". */
  meta?: ReactNode;
  disabled?: boolean;
};

export type CmSignalListProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  items: CmSignalListItem[];
  /** `id` selecionado. */
  value?: string | null;
  onChange?: (id: string, item: CmSignalListItem) => void;
  /** `name` dos rádios. Padrão `cm-signal-list`. */
  name?: string;
  /** Nome acessível da lista. */
  label?: string;
  /** O que mostrar quando `items` está vazio (varredura sem resultado). */
  emptyState?: ReactNode;
  /** Texto só-leitor do cadeado. Padrão "protegida". */
  lockedLabel?: string;
  /** Texto só-leitor das barras. Recebe a intensidade de 0 a 100. */
  signalLabel?: (signal: number, item: CmSignalListItem) => string;
  disabled?: boolean;
};

/* A lista é de rádios nativos, não de `role="option"`: seleção única com
   navegação por setas é exatamente o que o rádio já faz, e reimplementar o
   roving tabindex de um listbox aqui seria escrever (e manter) teclado que o
   navegador entrega de graça. O estado visual da linha selecionada sai do CSS
   (`:has(:checked)`), pelo mesmo motivo do CmChoiceCard. */
export const CmSignalList = forwardRef<HTMLDivElement, CmSignalListProps>(function CmSignalList(
  {
    className,
    disabled,
    emptyState,
    items,
    label,
    lockedLabel = "protegida",
    name = "cm-signal-list",
    onChange,
    signalLabel,
    value,
    ...rest
  },
  ref,
) {
  if (items.length === 0 && emptyState) {
    return (
      <div ref={ref} className={cn("cm-signal-list", className)} {...rest}>
        <div className="cm-signal-list__empty">{emptyState}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={cn("cm-signal-list", className)}
      {...rest}
    >
      {items.map((item) => (
        <label
          key={item.id}
          className="cm-signal-list__item"
          data-disabled={disabled || item.disabled ? "" : undefined}
        >
          <input
            type="radio"
            className="cm-signal-list__input"
            name={name}
            value={item.id}
            checked={value === item.id}
            disabled={disabled || item.disabled}
            onChange={() => onChange?.(item.id, item)}
          />
          <span className="cm-signal-list__body">
            <span className="cm-signal-list__label">
              {item.label}
              {item.locked ? (
                <>
                  <Lock size={12} aria-hidden="true" className="cm-signal-list__lock" />
                  <span className="cm-sr-only"> ({lockedLabel})</span>
                </>
              ) : null}
            </span>
            {item.description ? (
              <span className="cm-signal-list__description">{item.description}</span>
            ) : null}
          </span>
          {item.meta ? <span className="cm-signal-list__meta">{item.meta}</span> : null}
          {item.signal !== undefined ? (
            <CmSignalBars
              value={item.signal}
              label={signalLabel?.(item.signal, item)}
              className="cm-signal-list__signal"
            />
          ) : null}
        </label>
      ))}
    </div>
  );
});
CmSignalList.displayName = "CmSignalList";
