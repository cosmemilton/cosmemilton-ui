import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue, type CmTone } from "./types.js";

export type CmTimelineTone = CmTone;

export type CmTimelineVariant = "default" | "connected";

export type CmTimelineItem = {
  id?: string | number;
  /** Conteúdo da coluna oposta ao conteúdo — tipicamente o horário. */
  label?: ReactNode;
  /** Marcador customizado (ex.: um ícone). Sem isto, renderiza um ponto sólido. */
  marker?: ReactNode;
  /** Tom do marcador (mapeado para os tokens de cor). Herda o `tone` do `CmTimeline`. */
  tone?: CmTimelineTone;
  title?: ReactNode;
  description?: ReactNode;
  /** Conteúdo principal arbitrário — sobrescreve `title`/`description`. */
  content?: ReactNode;
  /** Slot à direita do conteúdo — tipicamente um badge/tag. */
  trailing?: ReactNode;
};

export type CmTimelineProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
  items: CmTimelineItem[];
  /** Largura fixa da coluna de label (número → px). Mantém os horários alinhados. */
  labelWidth?: string | number;
  /** Tom padrão dos marcadores. Padrão `primary`. */
  tone?: CmTimelineTone;
  /**
   * `default` — trilho discreto (borda) com marcadores maiores.
   * `connected` — trilho contínuo tingido pelo tom + marcadores compactos
   *   (visual de feed de atividade clássico).
   */
  variant?: CmTimelineVariant;
};

type TimelineStyle = HTMLAttributes<HTMLOListElement>["style"] &
  Partial<Record<`--${string}`, string>>;

export const CmTimeline = forwardRef<HTMLOListElement, CmTimelineProps>(function CmTimeline(
  { items, labelWidth, tone = "primary", variant = "default", className, style, ...props },
  ref,
) {
  const hasLabels = items.some((item) => item.label != null);
  const hasRail = items.length > 1;

  const rootStyle: TimelineStyle = {
    ...(labelWidth !== undefined
      ? { "--cm-timeline-label-width": cmSizeValue(labelWidth) as string }
      : {}),
    ...style,
  };

  return (
    <ol
      ref={ref}
      className={cn("cm-timeline", `cm-timeline--variant-${variant}`, className)}
      style={rootStyle}
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const itemTone = item.tone ?? tone;
        const key = item.id ?? index;
        const hasCustomMarker = item.marker != null;

        return (
          <li key={key} className="cm-timeline__item">
            {hasLabels ? (
              <div className="cm-timeline__label">{item.label}</div>
            ) : null}

            <div className="cm-timeline__rail" aria-hidden="true">
              {/* Linha contínua atrás do marcador; aparada no primeiro/último
                  ponto para o trilho começar e terminar exatamente nos dots. */}
              {hasRail ? (
                <span
                  className={cn(
                    "cm-timeline__connector",
                    index === 0 && "cm-timeline__connector--first",
                    isLast && "cm-timeline__connector--last",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "cm-timeline__marker",
                  `cm-timeline__marker--tone-${itemTone}`,
                  hasCustomMarker && "cm-timeline__marker--icon",
                )}
              >
                {item.marker}
              </span>
            </div>

            <div className="cm-timeline__content">
              <div className="cm-timeline__main">
                {item.content ?? (
                  <>
                    {item.title != null ? (
                      <div className="cm-timeline__title">{item.title}</div>
                    ) : null}
                    {item.description != null ? (
                      <div className="cm-timeline__description">{item.description}</div>
                    ) : null}
                  </>
                )}
              </div>
              {item.trailing != null ? (
                <div className="cm-timeline__trailing">{item.trailing}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
});
CmTimeline.displayName = "CmTimeline";
