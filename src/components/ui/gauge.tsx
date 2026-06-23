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
  /** Conteúdo central totalmente customizado (sobrescreve valor/label). */
  children?: ReactNode;
};

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

export const CmGauge = forwardRef<HTMLDivElement, CmGaugeProps>(function CmGauge(
  {
    arc = 360,
    children,
    className,
    color,
    label,
    max = 100,
    min = 0,
    rounded = true,
    showValue = true,
    size = 128,
    startAngle,
    style,
    thickness,
    tone = "primary",
    trackColor,
    value,
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

  const rootStyle: CmGaugeStyle = {
    width: size,
    height: size,
    ...(color ? { "--cm-gauge-color": color } : {}),
    ...(trackColor ? { "--cm-gauge-track": trackColor } : {}),
    ...style,
  };

  const centerContent =
    children ??
    (showValue || label ? (
      <>
        {showValue ? (
          <span className="cm-gauge__value" style={{ fontSize: Math.round(size * 0.22) }}>
            {valueFormat ? valueFormat({ value, min, max, fraction, percent }) : `${percent}%`}
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
