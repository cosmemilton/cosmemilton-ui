import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";

type SignalBarsStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export type CmSignalBarsProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Intensidade de 0 a 100. Convertida em barras acesas. */
  value?: number;
  /** Barras acesas direto (0 a `bars`) — ignora `value`. */
  level?: number;
  /** Quantidade de barras. Padrão `4`. */
  bars?: number;
  /** Altura das barras (número → px). Padrão `1rem`. */
  size?: string | number;
  /**
   * Texto para leitor de tela. Sem ele o indicador é decorativo — o normal,
   * porque o nome da rede já está do lado.
   */
  label?: string;
};

/**
 * Converte 0–100 em barras acesas. O piso é 1 para qualquer sinal recebido:
 * "uma barra" e "sem sinal" são coisas diferentes, e arredondar 12% para zero
 * mostra uma rede que aparece na lista com o ícone de rede inexistente.
 */
export function cmSignalLevel(value: number, bars = 4) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const normalized = Math.min(Math.max(value, 0), 100) / 100;
  return Math.min(bars, Math.max(1, Math.ceil(normalized * bars)));
}

export const CmSignalBars = forwardRef<HTMLSpanElement, CmSignalBarsProps>(function CmSignalBars(
  { bars = 4, className, label, level, size, style, value = 0, ...rest },
  ref,
) {
  const active = level ?? cmSignalLevel(value, bars);
  const rootStyle: SignalBarsStyle = {
    ...(size !== undefined
      ? { "--cm-signal-bars-size": typeof size === "number" ? `${size}px` : size }
      : {}),
    ...style,
  };

  return (
    <span
      ref={ref}
      className={cn("cm-signal-bars", className)}
      style={rootStyle}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-level={active}
      {...rest}
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          className={cn("cm-signal-bars__bar", index < active && "cm-signal-bars__bar--on")}
          style={{ height: `${((index + 1) / bars) * 100}%` }}
        />
      ))}
    </span>
  );
});
CmSignalBars.displayName = "CmSignalBars";
