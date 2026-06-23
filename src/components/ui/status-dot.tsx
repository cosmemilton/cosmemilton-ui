import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmStatusDotTone = CmTone;

export type CmStatusDotSize = "sm" | "md" | "lg";

export type CmStatusDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Tom do indicador, mapeado para os tokens de cor. Padrão `default` (cinza/neutro). */
  tone?: CmStatusDotTone;
  /** Tamanho do ponto. Padrão `md`. */
  size?: CmStatusDotSize;
  /** Anima um halo pulsante (ex.: "ao vivo"/processando). Respeita `prefers-reduced-motion`. */
  pulse?: boolean;
  /**
   * Nome acessível do estado (ex.: "Online"). Renderizado como texto só para
   * leitores de tela. Sem ele, o ponto é puramente decorativo — a cor sozinha
   * não comunica nada à tecnologia assistiva, então rotule quando for semântico.
   */
  label?: string;
};

export const CmStatusDot = forwardRef<HTMLSpanElement, CmStatusDotProps>(function CmStatusDot(
  { className, label, pulse = false, size = "md", tone = "default", ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "cm-status-dot",
        `cm-status-dot--tone-${tone}`,
        `cm-status-dot--${size}`,
        pulse && "cm-status-dot--pulse",
        className,
      )}
      {...rest}
    >
      {label ? <span className="cm-sr-only">{label}</span> : null}
    </span>
  );
});
CmStatusDot.displayName = "CmStatusDot";
