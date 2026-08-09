"use client";

import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue } from "./types.js";

export type CmLogEntryStatus = "pending" | "running" | "done" | "failed" | "skipped";

export type CmLogEntry = {
  id?: string | number;
  /**
   * A linha. Em log de execução, o comando REAL — quem entende audita, quem não
   * entende ignora; paráfrase não serve nem para um nem para outro.
   */
  text: ReactNode;
  /** Padrão `pending`. */
  status?: CmLogEntryStatus;
  /** Detalhe à direita: duração, contador, código de saída. */
  meta?: ReactNode;
};

export type CmLogViewProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  entries: CmLogEntry[];
  /** Altura máxima antes de rolar (número → px). Sem ela, o bloco cresce. */
  maxHeight?: string | number;
  /** Rola para a última linha quando `entries` muda. Padrão `false`. */
  autoScroll?: boolean;
  /** Anuncia as linhas novas (aria-live). Padrão `false` — em log longo vira ruído. */
  live?: boolean;
  /** Legenda acima do bloco. */
  label?: ReactNode;
  /** Marcador de cada estado. O padrão é glifo, não ícone: alinha em monoespaçada. */
  statusMarkers?: Partial<Record<CmLogEntryStatus, ReactNode>>;
  /** Texto que o leitor de tela ouve no lugar do glifo. */
  statusLabels?: Partial<Record<CmLogEntryStatus, string>>;
};

const defaultMarkers: Record<CmLogEntryStatus, ReactNode> = {
  pending: "·",
  running: "▸",
  done: "✓",
  failed: "✗",
  skipped: "–",
};

const defaultLabels: Record<CmLogEntryStatus, string> = {
  pending: "pendente",
  running: "em andamento",
  done: "concluída",
  failed: "falhou",
  skipped: "pulada",
};

/* O marcador é glifo e fica `aria-hidden`; o estado vai em texto só-leitor ao
   lado. Um ✓ lido como "marca de seleção" no meio de uma linha de comando é
   pior do que silêncio, e um ícone SVG quebraria a coluna da monoespaçada. */
export const CmLogView = forwardRef<HTMLDivElement, CmLogViewProps>(function CmLogView(
  {
    autoScroll = false,
    className,
    entries,
    label,
    live = false,
    maxHeight,
    statusLabels,
    statusMarkers,
    style,
    ...rest
  },
  ref,
) {
  const scrollRef = useRef<HTMLOListElement | null>(null);
  const lastEntry = entries[entries.length - 1];

  useEffect(() => {
    if (!autoScroll) return;
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
    // Depende do tamanho e da última linha: em log que só cresce, é o que muda.
  }, [autoScroll, entries.length, lastEntry?.status]);

  return (
    <div ref={ref} className={cn("cm-log-view", className)} style={style} {...rest}>
      {label ? <div className="cm-log-view__label">{label}</div> : null}
      <ol
        ref={scrollRef}
        className="cm-log-view__list"
        style={maxHeight !== undefined ? { maxHeight: cmSizeValue(maxHeight) } : undefined}
        aria-live={live ? "polite" : undefined}
        aria-relevant={live ? "additions text" : undefined}
      >
        {entries.map((entry, index) => {
          const status = entry.status ?? "pending";
          return (
            <li
              key={entry.id ?? index}
              className={cn("cm-log-view__line", `cm-log-view__line--${status}`)}
              data-status={status}
            >
              <span className="cm-log-view__marker" aria-hidden="true">
                {statusMarkers?.[status] ?? defaultMarkers[status]}
              </span>
              <span className="cm-sr-only">
                {statusLabels?.[status] ?? defaultLabels[status]}:{" "}
              </span>
              <span className="cm-log-view__text">{entry.text}</span>
              {entry.meta ? <span className="cm-log-view__meta">{entry.meta}</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
});
CmLogView.displayName = "CmLogView";
