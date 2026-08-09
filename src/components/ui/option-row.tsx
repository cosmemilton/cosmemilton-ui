"use client";

import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmSwitch } from "./switch.js";

export type CmOptionRowProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  /** O que a opção liga/desliga, em uma linha. */
  title: ReactNode;
  /** A consequência de ligar (ou de deixar desligado). É aqui que se explica o default. */
  description?: ReactNode;
  /** Ícone à esquerda do texto. SVG inline — nunca emoji. */
  icon?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Esmaece a linha e desliga o controle — a descrição continua legível, e é ela que explica o porquê. */
  disabled?: boolean;
  /**
   * Substitui o switch por outro controle (um `CmSelect`, um botão). Quem passa
   * `control` é responsável pelo nome acessível dele — os ids do título e da
   * descrição chegam pelos argumentos.
   */
  control?: (ids: { titleId: string; descriptionId?: string }) => ReactNode;
  /** `name` do input espelho do switch, para envio em formulário. */
  name?: string;
};

/* A linha inteira NÃO é clicável de propósito: um <label> só rotula controle de
   formulário, e o CmSwitch é um <button role="switch"> — envolvê-lo num label
   não liga o clique nem o nome acessível, só dá a impressão de que liga. O que
   funciona de verdade é o que está aqui: aria-labelledby/aria-describedby
   apontando para o título e a descrição desta linha. */
export const CmOptionRow = forwardRef<HTMLDivElement, CmOptionRowProps>(function CmOptionRow(
  {
    checked,
    className,
    control,
    defaultChecked,
    description,
    disabled,
    icon,
    name,
    onCheckedChange,
    title,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;

  return (
    <div
      ref={ref}
      className={cn("cm-option-row", className)}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      {icon ? (
        <span className="cm-option-row__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="cm-option-row__body">
        <span className="cm-option-row__title" id={titleId}>
          {title}
        </span>
        {description ? (
          <span className="cm-option-row__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </div>
      <div className="cm-option-row__control">
        {control ? (
          control({ titleId, descriptionId })
        ) : (
          <CmSwitch
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            name={name}
            onCheckedChange={onCheckedChange}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          />
        )}
      </div>
    </div>
  );
});
CmOptionRow.displayName = "CmOptionRow";
