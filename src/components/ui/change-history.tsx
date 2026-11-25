/* eslint-disable jsx-a11y/no-redundant-roles -- Safari drops list semantics when CSS removes markers. */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmTimeline, type CmTimelineTone } from "./timeline.js";

export type CmChangeHistoryChange = {
  id?: string | number;
  field: string;
  before?: string | number | null;
  after?: string | number | null;
};

export type CmChangeHistoryEvent = {
  id: string | number;
  title: string;
  actor?: string;
  /** Data de máquina, em ISO 8601, usada no elemento time. */
  dateTime: string;
  /** Data/hora formatada pelo app. Sem ela, mostra dateTime como fornecido. */
  dateLabel?: string;
  detail?: ReactNode;
  tone?: CmTimelineTone;
  changes?: readonly CmChangeHistoryChange[];
};

export type CmChangeHistoryProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Eventos já ordenados pelo consumidor (normalmente do mais recente ao mais antigo). */
  events: readonly CmChangeHistoryEvent[];
  title?: string;
  headingAs?: "h2" | "h3" | "h4" | "h5" | "h6";
  emptyText?: string;
  beforeLabel?: string;
  afterLabel?: string;
  emptyValueLabel?: string;
};

export const CmChangeHistory = forwardRef<HTMLElement, CmChangeHistoryProps>(
  function CmChangeHistory(
    {
      events,
      title = "Histórico de alterações",
      headingAs: Heading = "h3",
      emptyText = "Nenhuma alteração registrada.",
      beforeLabel = "Antes",
      afterLabel = "Depois",
      emptyValueLabel = "Sem valor",
      className,
      ...props
    },
    ref,
  ) {
    function displayValue(value: CmChangeHistoryChange["before"]) {
      return value == null || value === "" ? (
        <span className="cm-change-history__empty-value">{emptyValueLabel}</span>
      ) : (
        value
      );
    }

    return (
      <section
        ref={ref}
        aria-label={title}
        className={cn("cm-change-history", className)}
        {...props}
      >
        <Heading className="cm-change-history__heading">{title}</Heading>
        {events.length === 0 ? (
          <p className="cm-change-history__empty">{emptyText}</p>
        ) : (
          <CmTimeline
            role="list"
            items={events.map((event) => ({
              id: event.id,
              tone: event.tone,
              content: (
                <>
                  <p className="cm-change-history__title">{event.title}</p>
                  <p className="cm-change-history__meta">
                    {event.actor ? (
                      <>
                        <span>{event.actor}</span>
                        <span aria-hidden="true">·</span>
                      </>
                    ) : null}
                    <time dateTime={event.dateTime}>{event.dateLabel ?? event.dateTime}</time>
                  </p>
                  {event.detail != null ? (
                    <div className="cm-change-history__detail">{event.detail}</div>
                  ) : null}
                  {event.changes?.length ? (
                    <ul className="cm-change-history__changes" role="list">
                      {event.changes.map((change, index) => (
                        <li key={change.id ?? index} className="cm-change-history__change">
                          <div className="cm-change-history__field">{change.field}</div>
                          <dl className="cm-change-history__values">
                            <div className="cm-change-history__value">
                              <dt>{beforeLabel}</dt>
                              <dd>{displayValue(change.before)}</dd>
                            </div>
                            <div className="cm-change-history__value">
                              <dt>{afterLabel}</dt>
                              <dd>{displayValue(change.after)}</dd>
                            </div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ),
            }))}
          />
        )}
      </section>
    );
  },
);
CmChangeHistory.displayName = "CmChangeHistory";
