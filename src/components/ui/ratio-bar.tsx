"use client";

import {
  forwardRef,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmRatioBarSegment = {
  id?: string;
  /** Nome do bloco ("Windows", "Frevo OS"). */
  label?: ReactNode;
  /** Grandeza bruta (bytes, GB, R$…). A largura é a fração dela sobre o total. */
  value: number;
  /** O valor já formatado ("190 GB"). A lib não escolhe unidade nem separador. */
  valueLabel?: ReactNode;
  tone?: CmTone;
  /** Piso deste bloco quando a alça o move. */
  min?: number;
  /** Teto deste bloco quando a alça o move. */
  max?: number;
};

export type CmRatioBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  segments: CmRatioBarSegment[];
  /**
   * Índice do bloco à ESQUERDA da alça. Sem ele a barra é só leitura.
   * A alça move a fronteira entre `handleIndex` e `handleIndex + 1` e a soma
   * dos dois não muda — o resto da barra fica parado.
   */
  handleIndex?: number;
  /** Passo do teclado. Padrão: 1% da soma do par. */
  step?: number;
  /** Recebe os valores NOVOS de todos os blocos, na mesma ordem de `segments`. */
  onChange?: (values: number[]) => void;
  /** Nome acessível da alça. Padrão "Divisão". */
  handleLabel?: string;
  /** Texto falado do valor corrente. Sem ele, leitores anunciam o número cru. */
  valueText?: (values: number[]) => string;
  /** Trava a alça sem esconder a divisão (limite atingido, volume sujo…). */
  disabled?: boolean;
  /** Altura da barra (número → px). Padrão `2.25rem`. */
  height?: string | number;
};

type BarStyle = HTMLAttributes<HTMLDivElement>["style"] & Partial<Record<`--${string}`, string>>;

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

/** Limites efetivos do bloco da esquerda: os dele e os do vizinho, cruzados. */
function boundsFor(left: CmRatioBarSegment, right: CmRatioBarSegment) {
  const pair = left.value + right.value;
  const lower = Math.max(left.min ?? 0, pair - (right.max ?? pair));
  const upper = Math.min(left.max ?? pair, pair - (right.min ?? 0));
  // Limites que se cruzam (folga do vizinho maior que o espaço disponível)
  // significam barra TRAVADA, não barra maluca: devolvemos um intervalo de
  // largura zero e a alça para de andar, que é o que a UI precisa mostrar.
  return upper < lower ? { pair, lower, upper: lower } : { pair, lower, upper };
}

export const CmRatioBar = forwardRef<HTMLDivElement, CmRatioBarProps>(function CmRatioBar(
  {
    className,
    disabled,
    handleIndex,
    handleLabel = "Divisão",
    height,
    onChange,
    segments,
    step,
    style,
    valueText,
    ...rest
  },
  ref,
) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0);
  const left = handleIndex !== undefined ? segments[handleIndex] : undefined;
  const right = handleIndex !== undefined ? segments[handleIndex + 1] : undefined;
  const interactive = Boolean(onChange) && left !== undefined && right !== undefined;

  const bounds = left && right ? boundsFor(left, right) : undefined;
  const offsetBefore =
    handleIndex === undefined
      ? 0
      : segments
          .slice(0, handleIndex)
          .reduce((sum, segment) => sum + Math.max(segment.value, 0), 0);

  const percent = (value: number) => (total > 0 ? (value / total) * 100 : 0);

  function commit(nextLeftValue: number) {
    if (!interactive || !bounds || handleIndex === undefined) return;
    const clamped = clamp(nextLeftValue, bounds.lower, bounds.upper);
    if (clamped === left?.value) return;
    const values = segments.map((segment) => segment.value);
    values[handleIndex] = clamped;
    values[handleIndex + 1] = bounds.pair - clamped;
    onChange?.(values);
  }

  function valueFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track) return undefined;
    const rect = track.getBoundingClientRect();
    // Em jsdom (e antes do primeiro layout) o retângulo vem zerado; sem esta
    // guarda a divisão manda NaN para o onChange e a barra some.
    if (rect.width <= 0) return undefined;
    const fraction = clamp((clientX - rect.left) / rect.width, 0, 1);
    return fraction * total - offsetBefore;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!interactive || disabled) return;
    draggingRef.current = true;
    // O pointer capture mantém os eventos vindo para a alça mesmo com o cursor
    // fora dela; onde não existir, o flag em ref segura o arrasto sozinho.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* jsdom e navegadores sem pointer capture: o arrasto segue pelo ref. */
    }
    event.currentTarget.focus();
    event.preventDefault();
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || disabled) return;
    const next = valueFromClientX(event.clientX);
    if (next !== undefined) commit(next);
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* idem. */
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!interactive || disabled || !bounds || !left) return;
    const stride = step ?? Math.max(bounds.pair / 100, 1);
    const keys: Record<string, number | "min" | "max" | undefined> = {
      ArrowRight: stride,
      ArrowUp: stride,
      ArrowLeft: -stride,
      ArrowDown: -stride,
      PageUp: stride * 10,
      PageDown: -stride * 10,
      Home: "min",
      End: "max",
    };
    const delta = keys[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    if (delta === "min") commit(bounds.lower);
    else if (delta === "max") commit(bounds.upper);
    else commit(left.value + delta);
  }

  const rootStyle: BarStyle = {
    ...(height !== undefined
      ? { "--cm-ratio-bar-height": typeof height === "number" ? `${height}px` : height }
      : {}),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cn("cm-ratio-bar", className)}
      data-disabled={disabled ? "" : undefined}
      style={rootStyle}
      {...rest}
    >
      <div className="cm-ratio-bar__track" ref={trackRef}>
        {segments.map((segment, index) => (
          <div
            key={segment.id ?? index}
            className={cn(
              "cm-ratio-bar__segment",
              `cm-ratio-bar__segment--tone-${segment.tone ?? (index === 0 ? "default" : "primary")}`,
            )}
            style={{ width: `${percent(Math.max(segment.value, 0))}%` }}
          >
            {segment.label ? (
              <span className="cm-ratio-bar__segment-label">{segment.label}</span>
            ) : null}
            {segment.valueLabel ? (
              <span className="cm-ratio-bar__segment-value">{segment.valueLabel}</span>
            ) : null}
          </div>
        ))}
        {interactive && bounds && left ? (
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={handleLabel}
            aria-orientation="horizontal"
            aria-valuemin={bounds.lower}
            aria-valuemax={bounds.upper}
            aria-valuenow={left.value}
            aria-valuetext={valueText?.(segments.map((segment) => segment.value))}
            aria-disabled={disabled || undefined}
            className="cm-ratio-bar__handle"
            style={{ left: `${percent(offsetBefore + left.value)}%` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onKeyDown={handleKeyDown}
          />
        ) : null}
      </div>
    </div>
  );
});
CmRatioBar.displayName = "CmRatioBar";
