import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmTone } from "./types.js";

export type CmSummaryItem = {
  id?: string | number;
  label: ReactNode;
  value: ReactNode;
  /** Tom do valor. Use para o item que muda a decisão (o disco que será apagado). */
  tone?: CmTone;
  /** Põe o valor em negrito, junto com o tom. */
  emphasis?: boolean;
};

export type CmSummaryListProps = Omit<HTMLAttributes<HTMLDListElement>, "children"> & {
  items: CmSummaryItem[];
  /** Colunas de pares; abaixo de 40rem sempre cai para uma. Padrão `1`. */
  columns?: number;
  /**
   * `rows` — rótulo à esquerda, valor à direita (revisão densa).
   * `stacked` — rótulo acima do valor (bom em coluna estreita).
   */
  layout?: "rows" | "stacked";
  /** Linha divisória entre os pares. Padrão `true`. */
  divided?: boolean;
};

type SummaryStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

/* Renderiza <dl> com cada par embrulhado num <div> — a única forma válida em
   HTML de ter pares como células de grid sem quebrar a associação
   rótulo/valor que os leitores de tela usam. */
export const CmSummaryList = forwardRef<HTMLDListElement, CmSummaryListProps>(
  function CmSummaryList(
    { className, columns = 1, divided = true, items, layout = "rows", style, ...rest },
    ref,
  ) {
    const rootStyle: SummaryStyle = {
      ...(columns > 1 ? { "--cm-summary-list-columns": String(columns) } : {}),
      ...style,
    };

    return (
      <dl
        ref={ref}
        className={cn(
          "cm-summary-list",
          `cm-summary-list--${layout}`,
          divided && "cm-summary-list--divided",
          className,
        )}
        style={rootStyle}
        {...rest}
      >
        {items.map((item, index) => (
          <div key={item.id ?? index} className="cm-summary-list__item">
            <dt className="cm-summary-list__label">{item.label}</dt>
            <dd
              className={cn(
                "cm-summary-list__value",
                item.tone && `cm-summary-list__value--tone-${item.tone}`,
                item.emphasis && "cm-summary-list__value--emphasis",
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  },
);
CmSummaryList.displayName = "CmSummaryList";
