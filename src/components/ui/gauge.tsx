import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmGaugeTone = CmTone;

export type CmGaugeValueContext = {
  value: number;
  min: number;
  max: number;
  /** Fração preenchida, já normalizada para 0–1. */
  fraction: number;
  /** Percentual inteiro (0–100) derivado de `fraction`. */
  percent: number;
};

type CmGaugeStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export type CmGaugeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Valor atual. */
  value: number;
  /** Limite inferior do intervalo. Padrão `0`. */
  min?: number;
  /** Limite superior do intervalo. Padrão `100`. */
  max?: number;
  /** Diâmetro do gauge em px. Padrão `128`. */
  size?: number;
  /** Espessura do anel em px. Padrão ~10% do tamanho. */
  thickness?: number;
  /** Graus visíveis do trilho: `360` = donut completo, `<360` = gauge com folga embaixo. Padrão `360`. */
  arc?: number;
  /** Ângulo inicial do trilho (graus). Padrão automático (topo para donut, base simétrica para gauge). */
  startAngle?: number;
  /** Tom do preenchimento, mapeado para os tokens de cor. Padrão `primary`. */
  tone?: CmGaugeTone;
  /** Cor explícita do preenchimento (sobrescreve `tone`). */
  color?: string;
  /** Cor do trilho de fundo. Padrão `var(--color-muted)`. */
  trackColor?: string;
  /** Pontas arredondadas no preenchimento. Padrão `true`. */
  rounded?: boolean;
  /** Exibe o percentual no centro. Padrão `true`. Ignorado se `children` for passado. */
  showValue?: boolean;
  /** Texto secundário abaixo do valor central. */
  label?: ReactNode;
  /** Customiza o conteúdo central derivado do valor. */
  valueFormat?: (context: CmGaugeValueContext) => ReactNode;
  /** Tamanho base (máximo) da fonte do valor central em px. Padrão ~22% do tamanho. */
  valueFontSize?: number;
  /** Menor fonte aceita pelo autoajuste, em px. Padrão ~55% de `valueFontSize`. */
  minValueFontSize?: number;
  /**
   * Reduz a fonte do valor até ele caber no anel; ao chegar em `minValueFontSize`
   * o excedente vira reticências. Só vale para valores textuais — `valueFormat`
   * devolvendo JSX (e `children`) mantém a fonte base. Padrão `true`.
   */
  autoFitValue?: boolean;
  /** Conteúdo central totalmente customizado (sobrescreve valor/label). */
  children?: ReactNode;
};

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

// Larguras de avanço aproximadas, em `em`, por caractere/classe. Estimar em vez
// de medir no DOM mantém o CmGauge sem hooks (server-safe) e sem salto visual
// entre o HTML do servidor e a hidratação. Como a fonte varia por tema, os
// valores ficam na ponta larga das grotescas usadas: o erro cai para o lado de
// encolher um pouco além do necessário, nunca de estourar o anel.
const GLYPH_WIDTHS: Record<string, number> = {
  " ": 0.35,
  ".": 0.38,
  ",": 0.38,
  ":": 0.4,
  ";": 0.4,
  "'": 0.31,
  "!": 0.46,
  "|": 0.37,
  "(": 0.46,
  ")": 0.46,
  "/": 0.46,
  "\\": 0.46,
  "-": 0.42,
  "–": 0.6,
  "+": 0.84,
  "×": 0.84,
  "°": 0.5,
  "%": 1,
};
const DIGIT_WIDTH = 0.7;
const LOWERCASE_WIDTH = 0.66;
const UPPERCASE_WIDTH = 0.78;
const WIDE_WIDTH = 1;

/** Ideogramas, formas fullwidth e emoji ocupam ~1em, não a largura latina. */
const isWideCodePoint = (code: number) =>
  (code >= 0x1100 && code <= 0x115f) ||
  (code >= 0x2e80 && code <= 0xa4cf) ||
  (code >= 0xac00 && code <= 0xd7a3) ||
  (code >= 0xf900 && code <= 0xfaff) ||
  (code >= 0xfe30 && code <= 0xfe6f) ||
  (code >= 0xff00 && code <= 0xff60) ||
  code >= 0x1f000;

/** Largura estimada do texto, em múltiplos do `font-size`. */
const estimateTextWidth = (text: string) => {
  let total = 0;
  for (const char of text) {
    const known = GLYPH_WIDTHS[char];
    if (known !== undefined) total += known;
    else if (char >= "0" && char <= "9") total += DIGIT_WIDTH;
    else if (isWideCodePoint(char.codePointAt(0) ?? 0)) total += WIDE_WIDTH;
    else if (char === char.toUpperCase() && char !== char.toLowerCase()) total += UPPERCASE_WIDTH;
    else total += LOWERCASE_WIDTH;
  }
  return total;
};

/** Só dá para estimar a largura de conteúdo textual; JSX cai no tamanho base. */
const asPlainText = (node: ReactNode): string | null => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    const parts = node.map(asPlainText);
    return parts.some((part) => part === null) ? null : parts.join("");
  }
  return null;
};

export const CmGauge = forwardRef<HTMLDivElement, CmGaugeProps>(function CmGauge(
  {
    arc = 360,
    autoFitValue = true,
    children,
    className,
    color,
    label,
    max = 100,
    min = 0,
    minValueFontSize,
    rounded = true,
    showValue = true,
    size = 128,
    startAngle,
    style,
    thickness,
    tone = "primary",
    trackColor,
    value,
    valueFontSize,
    valueFormat,
    "aria-label": ariaLabel,
    ...props
  },
  ref,
) {
  const clampedArc = clamp(arc, 1, 360);
  const span = max - min;
  const fraction = span > 0 ? clamp((value - min) / span, 0, 1) : 0;
  const percent = Math.round(fraction * 100);

  const strokeWidth = thickness ?? Math.max(6, Math.round(size * 0.1));
  const radius = Math.max((size - strokeWidth) / 2, 0);
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const trackLength = (circumference * clampedArc) / 360;
  const progressLength = trackLength * fraction;
  // Donut completo arranca no topo; gauge parcial centra a folga embaixo.
  const rotation = startAngle ?? (clampedArc === 360 ? -90 : 90 + (360 - clampedArc) / 2);
  const transform = `rotate(${rotation} ${center} ${center})`;
  const linecap = rounded ? "round" : "butt";

  // A área útil do texto é o círculo interno menos uma folga; assim anéis
  // grossos não empurram o valor para debaixo do traço.
  const contentInset = Math.round(strokeWidth + size * 0.04);
  const availableWidth = Math.max(size - contentInset * 2, 0);

  const baseFontSize = Math.max(10, Math.round(valueFontSize ?? size * 0.22));
  const minFontSize = clamp(Math.round(minValueFontSize ?? baseFontSize * 0.55), 8, baseFontSize);

  const renderedValue = valueFormat
    ? valueFormat({ value, min, max, fraction, percent })
    : `${percent}%`;

  // Encolhe a fonte só o suficiente para o texto caber na largura útil, nunca
  // abaixo de `minFontSize` — daí em diante o corte fica com as reticências.
  const fittedFontSize = (() => {
    if (!autoFitValue || availableWidth <= 0) return baseFontSize;
    const text = asPlainText(renderedValue);
    if (!text) return baseFontSize;
    const width = estimateTextWidth(text);
    if (width <= 0) return baseFontSize;
    return clamp(Math.floor(availableWidth / width), minFontSize, baseFontSize);
  })();

  const rootStyle: CmGaugeStyle = {
    width: size,
    height: size,
    "--cm-gauge-inset": `${contentInset}px`,
    ...(color ? { "--cm-gauge-color": color } : {}),
    ...(trackColor ? { "--cm-gauge-track": trackColor } : {}),
    ...style,
  };

  const centerContent =
    children ??
    (showValue || label ? (
      <>
        {showValue ? (
          <span className="cm-gauge__value" style={{ fontSize: fittedFontSize }}>
            {renderedValue}
          </span>
        ) : null}
        {label ? <span className="cm-gauge__label">{label}</span> : null}
      </>
    ) : null);

  return (
    <div
      ref={ref}
      className={cn("cm-gauge", `cm-gauge--tone-${tone}`, className)}
      style={rootStyle}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueFormat ? undefined : `${percent}%`}
      aria-label={ariaLabel}
      {...props}
    >
      <svg
        className="cm-gauge__svg"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="cm-gauge__track"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={`${trackLength} ${circumference}`}
          strokeLinecap={linecap}
          transform={transform}
        />
        {progressLength > 0 ? (
          <circle
            className="cm-gauge__progress"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${circumference}`}
            strokeLinecap={linecap}
            transform={transform}
          />
        ) : null}
      </svg>
      {centerContent ? (
        <div className="cm-gauge__content" aria-hidden="true">
          {centerContent}
        </div>
      ) : null}
    </div>
  );
});
CmGauge.displayName = "CmGauge";
