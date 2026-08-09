"use client";

import {
  forwardRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmSliderMark = { value: number; label?: ReactNode };

export type CmSliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "type" | "value"
> & {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** Rótulo do controle. Vira o nome acessível e (por padrão) texto visível. */
  label?: string;
  /** Usa `label` só como nome acessível. */
  srOnlyLabel?: boolean;
  /** Mostra o valor à direita do rótulo. */
  showValue?: boolean;
  /** Formata o valor exibido e o `aria-valuetext`. Padrão: o número cru. */
  valueFormat?: (value: number) => ReactNode;
  tone?: CmTone;
  size?: "sm" | "md" | "lg";
  /** Ícone antes da trilha (ex.: volume mudo). */
  startAdornment?: ReactNode;
  /** Ícone depois da trilha (ex.: volume alto). */
  endAdornment?: ReactNode;
  /** Marcas sob a trilha. Número solto vira marca sem rótulo. */
  marks?: Array<number | CmSliderMark>;
};

type SliderStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

/* Trilha e alça são o `<input type="range">` nativo estilizado, não uma div com
   eventos de ponteiro: teclado, toque, roda do mouse, RTL e leitor de tela vêm
   de graça e corretos. O preenchimento à esquerda da alça é um gradiente
   calculado em `--cm-slider-fill` — por isso o componente acompanha o valor
   mesmo no modo não controlado. */
export const CmSlider = forwardRef<HTMLInputElement, CmSliderProps>(function CmSlider(
  {
    className,
    defaultValue,
    disabled,
    endAdornment,
    label,
    marks,
    max = 100,
    min = 0,
    onChange,
    showValue = false,
    size = "md",
    srOnlyLabel = false,
    startAdornment,
    step = 1,
    style,
    tone = "primary",
    value,
    valueFormat,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? min);
  const current = clamp(value ?? uncontrolled, min, max);
  const span = max - min;
  const fill = span > 0 ? ((current - min) / span) * 100 : 0;

  const trimmedLabel = label?.trim() ? label : undefined;
  const showLabel = Boolean(trimmedLabel) && !srOnlyLabel;
  const accessibleName = trimmedLabel ?? ariaLabel;
  const valueText = valueFormat ? valueFormat(current) : undefined;

  const normalizedMarks = marks?.map((mark) => (typeof mark === "number" ? { value: mark } : mark));

  const rootStyle: SliderStyle = { "--cm-slider-fill": `${fill}%`, ...style };

  return (
    <div
      className={cn(
        "cm-slider",
        `cm-slider--${size}`,
        `cm-slider--tone-${tone}`,
        disabled && "cm-slider--disabled",
        className,
      )}
      style={rootStyle}
    >
      {showLabel || showValue ? (
        // O nome e o valor acessíveis já saem do <input>; este cabeçalho é só a
        // representação visual, então não se repete para o leitor de tela.
        <div className="cm-slider__header" aria-hidden="true">
          {showLabel ? <span className="cm-slider__label">{trimmedLabel}</span> : null}
          {showValue ? <span className="cm-slider__value">{valueText ?? current}</span> : null}
        </div>
      ) : null}
      <div className="cm-slider__row">
        {startAdornment ? (
          <span className="cm-slider__adornment" aria-hidden="true">
            {startAdornment}
          </span>
        ) : null}
        <div className="cm-slider__track">
          <input
            {...rest}
            ref={ref}
            type="range"
            className="cm-slider__input"
            min={min}
            max={max}
            step={step}
            value={current}
            disabled={disabled}
            aria-label={accessibleName}
            aria-valuetext={typeof valueText === "string" ? valueText : undefined}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (value === undefined) setUncontrolled(next);
              onChange?.(next, event);
            }}
          />
          {normalizedMarks?.length ? (
            <div className="cm-slider__marks" aria-hidden="true">
              {normalizedMarks.map((mark) => (
                <span
                  key={mark.value}
                  className="cm-slider__mark"
                  style={{ left: span > 0 ? `${((mark.value - min) / span) * 100}%` : "0%" }}
                >
                  <span className="cm-slider__mark-tick" />
                  {mark.label ? <span className="cm-slider__mark-label">{mark.label}</span> : null}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {endAdornment ? (
          <span className="cm-slider__adornment" aria-hidden="true">
            {endAdornment}
          </span>
        ) : null}
      </div>
    </div>
  );
});
CmSlider.displayName = "CmSlider";
