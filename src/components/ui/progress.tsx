"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmBarThicknessPixels, type CmBarThickness } from "./types.js";

export type { CmBarThickness } from "./types.js";

export type CmProgressValueContext = {
  value: number;
  min: number;
  max: number;
  /** Fração preenchida, já normalizada para 0–1. */
  fraction: number;
  /** Percentual inteiro (0–100) derivado de `fraction`. */
  percent: number;
};

export type CmProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Inherit the surrounding ink for the label, value and fill on colored surfaces. */
  tone?: "primary" | "inherit";
  /** Espessura da barra. Quando omitida, segue o tema. */
  barThickness?: CmBarThickness;
  /** Valor atual. */
  value: number;
  /** Limite inferior do intervalo. Padrão `0`. */
  min?: number;
  /** Limite superior do intervalo. Padrão `100`. */
  max?: number;
  /** Rótulo da barra. Vira o nome acessível e (por padrão) aparece acima da barra. */
  label?: string;
  /** Usa `label` apenas como nome acessível, sem renderizar texto visível. */
  srOnlyLabel?: boolean;
  /** Exibe o valor/percentual alinhado à direita do rótulo. Padrão `false`. */
  showValue?: boolean;
  /** Customiza o texto do valor exibido. Padrão `${percent}%`. */
  valueFormat?: (context: CmProgressValueContext) => ReactNode;
};

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

export const CmProgress = forwardRef<HTMLDivElement, CmProgressProps>(function CmProgress(
  {
    barThickness,
    className,
    label,
    max = 100,
    min = 0,
    showValue = false,
    srOnlyLabel = false,
    tone = "primary",
    value,
    valueFormat,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const span = max - min;
  const fraction = span > 0 ? clamp((value - min) / span, 0, 1) : 0;
  const percent = Math.round(fraction * 100);
  // O elemento nativo <progress> tem min implícito 0; deslocamos pelo `min`.
  const nativeMax = span > 0 ? span : max;
  const nativeValue = clamp(value - min, 0, nativeMax);

  const trimmedLabel = label?.trim() ? label : undefined;
  const showLabel = Boolean(trimmedLabel) && !srOnlyLabel;
  const accessibleName = trimmedLabel ?? ariaLabel ?? "Progresso";

  const valueText = valueFormat
    ? valueFormat({ value, min, max, fraction, percent })
    : `${percent}%`;

  const hasHeader = showLabel || showValue;

  return (
    <div
      ref={ref}
      className={cn("cm-progress", tone === "inherit" && "cm-progress--inherit", className)}
      {...rest}
    >
      {hasHeader ? (
        // O nome/valor acessível já são expostos pelo <progress>; o cabeçalho é
        // apenas a representação visual, então fica oculto para leitores de tela.
        <div className="cm-progress__header" aria-hidden="true">
          {showLabel ? <span className="cm-progress__label">{trimmedLabel}</span> : null}
          {showValue ? <span className="cm-progress__value">{valueText}</span> : null}
        </div>
      ) : null}
      <progress
        value={nativeValue}
        max={nativeMax}
        aria-label={accessibleName}
        className="cm-progress__bar"
        style={{ height: cmBarThicknessPixels(barThickness) }}
      />
    </div>
  );
});
CmProgress.displayName = "CmProgress";
