"use client";

import { Check } from "lucide-react";
import {
  forwardRef,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";

export type CmChoiceCardOption = {
  value: string;
  title: ReactNode;
  description?: ReactNode;
  /** Ícone à esquerda do texto. SVG inline — nunca emoji. */
  icon?: ReactNode;
  /** Slot à direita: badge, medida, "recomendado". */
  meta?: ReactNode;
  disabled?: boolean;
};

type ChoiceCardOwnProps = {
  /** Título do cartão — a linha em destaque, o que a pessoa está escolhendo. */
  title: ReactNode;
  /** Uma frase explicando a escolha. É o que separa este cartão de um rádio comum. */
  description?: ReactNode;
  /** Ícone à esquerda do texto. SVG inline — nunca emoji. */
  icon?: ReactNode;
  /** Slot à direita: badge, medida, "recomendado". */
  meta?: ReactNode;
  /** `true` → checkbox (escolha múltipla). Padrão: rádio (escolha única). */
  multiple?: boolean;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Atalho para quem só quer o estado marcado, sem o evento. */
  onCheckedChange?: (checked: boolean) => void;
  /** Props extras do `<input>`; a raiz (`<label>`) recebe o resto. */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "disabled" | "name" | "onChange" | "required" | "type" | "value"
  >;
};

/* `title` sai dos atributos da raiz porque o atributo HTML nativo é string e
   intersectaria para `string & ReactNode` — a mesma armadilha resolvida no
   CmItem. Aqui o título é conteúdo, não tooltip. */
export type CmChoiceCardProps = Omit<HTMLAttributes<HTMLLabelElement>, "onChange" | "title"> &
  ChoiceCardOwnProps;

/* O `<input>` continua no DOM (só visualmente escondido) e o desenho do controle
   mora no irmão `__control`: é ele que reage a `:checked`/`:focus-visible`. Com
   rádios nativos, marcar um cartão DESMARCA os irmãos sem disparar onChange
   neles — um `data-state` calculado em JS ficaria velho justamente no caso mais
   comum. Por isso o estado visual sai do CSS (`:has(:checked)`), nunca do React. */
export const CmChoiceCard = forwardRef<HTMLInputElement, CmChoiceCardProps>(function CmChoiceCard(
  {
    checked,
    className,
    defaultChecked,
    description,
    disabled,
    icon,
    inputProps,
    meta,
    multiple = false,
    name,
    onChange,
    onCheckedChange,
    required,
    title,
    value,
    ...rest
  },
  ref,
) {
  return (
    <label
      className={cn("cm-choice-card", multiple && "cm-choice-card--multiple", className)}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      <input
        {...inputProps}
        ref={ref}
        type={multiple ? "checkbox" : "radio"}
        className={cn("cm-choice-card__input", inputProps?.className)}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        required={required}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
      />
      <span className="cm-choice-card__control" aria-hidden="true">
        {multiple ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      {icon ? (
        <span className="cm-choice-card__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="cm-choice-card__body">
        <span className="cm-choice-card__title">{title}</span>
        {description ? <span className="cm-choice-card__description">{description}</span> : null}
      </span>
      {meta ? <span className="cm-choice-card__meta">{meta}</span> : null}
    </label>
  );
});
CmChoiceCard.displayName = "CmChoiceCard";

type ChoiceCardGroupBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  /** `name` dos inputs — é ele que agrupa os rádios para o teclado nativo. */
  name: string;
  options: CmChoiceCardOption[];
  /** Nome acessível do grupo. Sem ele, use `aria-labelledby`. */
  label?: string;
  /** Colunas do grid; abaixo de 40rem sempre empilha. Padrão `1`. */
  columns?: number;
  /** Desliga o grupo inteiro (a opção também pode desligar sozinha). */
  disabled?: boolean;
};

export type CmChoiceCardGroupProps =
  | (ChoiceCardGroupBaseProps & {
      multiple?: false;
      value: string | null;
      onChange: (value: string) => void;
    })
  | (ChoiceCardGroupBaseProps & {
      multiple: true;
      value: string[];
      onChange: (values: string[]) => void;
    });

type GroupStyle = HTMLAttributes<HTMLDivElement>["style"] & Partial<Record<`--${string}`, string>>;

export const CmChoiceCardGroup = forwardRef<HTMLDivElement, CmChoiceCardGroupProps>(
  function CmChoiceCardGroup(props, ref) {
    // `value`/`onChange`/`multiple` saem do `rest` de propósito: sobrando ali,
    // eles iriam parar como atributos da <div> raiz (`value` vira atributo HTML
    // e `onChange` passa a escutar o bubbling dos inputs de dentro).
    const {
      className,
      columns = 1,
      disabled,
      label,
      multiple: _multiple,
      name,
      onChange: _onChange,
      options,
      style,
      value: _value,
      ...rest
    } = props;
    const multiple = props.multiple === true;

    const rootStyle: GroupStyle = {
      ...(columns > 1 ? { "--cm-choice-card-columns": String(columns) } : {}),
      ...style,
    };

    function isSelected(optionValue: string) {
      return props.multiple ? props.value.includes(optionValue) : props.value === optionValue;
    }

    function toggle(optionValue: string, checked: boolean) {
      if (!props.multiple) {
        if (checked) props.onChange(optionValue);
        return;
      }

      // A seleção sai da ORDEM DAS OPÇÕES, não da ordem dos cliques: senão o
      // array muda de forma a cada clique e quem compara ou serializa (uma
      // receita de instalação, um filtro salvo) vê diferença onde não houve
      // mudança nenhuma.
      const next = new Set(props.value);
      if (checked) next.add(optionValue);
      else next.delete(optionValue);
      props.onChange(
        options.filter((option) => next.has(option.value)).map((option) => option.value),
      );
    }

    return (
      <div
        ref={ref}
        role={multiple ? "group" : "radiogroup"}
        aria-label={label}
        className={cn("cm-choice-card-group", className)}
        style={rootStyle}
        {...rest}
      >
        {options.map((option) => (
          <CmChoiceCard
            key={option.value}
            multiple={multiple}
            name={name}
            value={option.value}
            title={option.title}
            description={option.description}
            icon={option.icon}
            meta={option.meta}
            disabled={disabled || option.disabled}
            checked={isSelected(option.value)}
            onCheckedChange={(checked) => toggle(option.value, checked)}
          />
        ))}
      </div>
    );
  },
);
CmChoiceCardGroup.displayName = "CmChoiceCardGroup";
