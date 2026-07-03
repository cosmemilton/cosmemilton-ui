"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useControllableState } from "../../hooks/use-controllable-state.js";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import type { CmTone } from "./types.js";

export type CmSchedulerView = "day" | "week";

export type CmSchedulerEvent = {
  id: string | number;
  title: string;
  /** Início do evento — `Date` ou string ISO (serializável de Server Components). */
  start: Date | string;
  /** Fim do evento — `Date` ou string ISO. */
  end: Date | string;
  /** Tom do evento, mapeado para os tokens de cor do tema. Padrão `primary`. */
  tone?: CmTone;
  /** Cor explícita (ex.: cor por vistoriador). Tem precedência sobre `tone`. */
  color?: string;
  /** Linha secundária exibida sob o título quando há espaço. */
  description?: string;
  /** Dados livres do consumidor; devolvidos intactos nos callbacks. */
  data?: unknown;
};

export type CmSchedulerSlot = {
  start: Date;
  end: Date;
};

export type CmSchedulerProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  /** Eventos exibidos na grade. Eventos fora da janela visível são recortados. */
  events?: CmSchedulerEvent[];
  /** Visão controlada. Use `defaultView` para o modo não-controlado. */
  view?: CmSchedulerView;
  /** Visão inicial no modo não-controlado. Padrão `week`. */
  defaultView?: CmSchedulerView;
  onViewChange?: (view: CmSchedulerView) => void;
  /** Data de referência controlada (`Date` ou string ISO). */
  date?: Date | string;
  /** Data de referência inicial no modo não-controlado. Padrão: hoje. */
  defaultDate?: Date | string;
  onDateChange?: (date: Date) => void;
  /** Primeira hora visível (0–23). Padrão `7`. */
  startHour?: number;
  /** Hora final visível (1–24, exclusiva — `19` mostra até 19:00). Padrão `19`. */
  endHour?: number;
  /** Granularidade dos slots clicáveis e das linhas-guia, em minutos. Padrão `30`. */
  slotMinutes?: number;
  /** Altura de uma hora, em px. Padrão `48`. */
  hourHeight?: number;
  /** Primeiro dia da semana: `0` (domingo, padrão — igual ao CmCalendar) ou `1` (segunda). */
  weekStartsOn?: 0 | 1;
  /** Oculta sábado e domingo na visão semanal. Padrão `false`. */
  hideWeekends?: boolean;
  /** Linha do horário atual no dia de hoje. Padrão `true`. */
  showNowIndicator?: boolean;
  /** Toolbar com navegação (anterior/hoje/próximo), título e troca de visão. Padrão `true`. */
  showHeader?: boolean;
  onEventClick?: (event: CmSchedulerEvent) => void;
  /** Clique em um slot vazio; recebe o intervalo do slot. Habilita os slots como botões. */
  onSlotClick?: (slot: CmSchedulerSlot) => void;
  /** Substitui o conteúdo interno do evento (horário/título/descrição). */
  renderEvent?: (event: CmSchedulerEvent) => ReactNode;
};

function toDate(value: Date | string) {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function startOfDay(date: Date) {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1) {
  const day = startOfDay(date);
  return addDays(day, -((day.getDay() - weekStartsOn + 7) % 7));
}

function formatHour(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTimeRange(start: Date, end: Date) {
  const asMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes();
  return `${formatHour(asMinutes(start))} – ${formatHour(asMinutes(end))}`;
}

function formatDayTitle(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWeekTitle(days: Date[]) {
  const first = days[0];
  const last = days[days.length - 1];
  if (first.getMonth() === last.getMonth()) {
    const rest = last.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    return `${first.getDate()} – ${rest}`;
  }
  const short = (d: Date) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  return `${short(first)} – ${short(last)} de ${last.getFullYear()}`;
}

type CmSchedulerStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

type EventSegment = {
  event: CmSchedulerEvent;
  start: Date;
  end: Date;
  /** Minutos desde o início do dia visível (já recortados à janela). */
  startMin: number;
  endMin: number;
  column: number;
  columns: number;
};

/* Empacota segmentos sobrepostos em colunas: segmentos que se cruzam no tempo
   formam um cluster; dentro dele cada um recebe a primeira coluna livre e todos
   dividem a largura pelo total de colunas do cluster. */
function layoutSegments(segments: EventSegment[]) {
  const sorted = [...segments].sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  let cluster: EventSegment[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    for (const segment of cluster) segment.columns = columnEnds.length;
    cluster = [];
    columnEnds = [];
  };

  for (const segment of sorted) {
    if (cluster.length && segment.startMin >= clusterEnd) closeCluster();
    const free = columnEnds.findIndex((end) => end <= segment.startMin);
    const column = free === -1 ? columnEnds.length : free;
    columnEnds[column] = segment.endMin;
    segment.column = column;
    cluster.push(segment);
    clusterEnd = Math.max(clusterEnd, segment.endMin);
  }
  closeCluster();

  return sorted;
}

export const CmScheduler = forwardRef<HTMLDivElement, CmSchedulerProps>(function CmScheduler(
  {
    events = [],
    view: viewProp,
    defaultView = "week",
    onViewChange,
    date: dateProp,
    defaultDate,
    onDateChange,
    startHour = 7,
    endHour = 19,
    slotMinutes = 30,
    hourHeight = 48,
    weekStartsOn = 0,
    hideWeekends = false,
    showNowIndicator = true,
    showHeader = true,
    onEventClick,
    onSlotClick,
    renderEvent,
    className,
    style,
    ...rest
  },
  ref,
) {
  const [view, setView] = useControllableState<CmSchedulerView>({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  });
  const [date, setDate] = useControllableState<Date>({
    value: dateProp === undefined ? undefined : startOfDay(toDate(dateProp)),
    defaultValue: startOfDay(defaultDate === undefined ? new Date() : toDate(defaultDate)),
    onChange: onDateChange,
  });

  /* Linha de "agora" só após montar: `new Date()` na renderização SSR e na
     hidratação divergem e o offset em px causaria mismatch. */
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!showNowIndicator) return;
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [showNowIndicator]);

  const visibleStartMin = startHour * 60;
  const visibleEndMin = endHour * 60;
  const visibleMinutes = Math.max(visibleEndMin - visibleStartMin, slotMinutes);
  const minuteHeight = hourHeight / 60;

  const days = useMemo(() => {
    if (view === "day") return [startOfDay(date)];
    const first = startOfWeek(date, weekStartsOn);
    const week = Array.from({ length: 7 }, (_, index) => addDays(first, index));
    return hideWeekends ? week.filter((day) => day.getDay() !== 0 && day.getDay() !== 6) : week;
  }, [view, date, weekStartsOn, hideWeekends]);

  const segmentsByDay = useMemo(() => {
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const windowStart = new Date(dayStart.getTime() + visibleStartMin * 60_000);
      const windowEnd = new Date(dayStart.getTime() + visibleEndMin * 60_000);
      const segments: EventSegment[] = [];

      for (const event of events) {
        const start = toDate(event.start);
        const end = toDate(event.end);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
        const clampedStart = start > windowStart ? start : windowStart;
        const clampedEnd = end < windowEnd ? end : windowEnd;
        if (clampedEnd <= clampedStart) continue;
        segments.push({
          event,
          start,
          end,
          startMin: (clampedStart.getTime() - dayStart.getTime()) / 60_000,
          endMin: (clampedEnd.getTime() - dayStart.getTime()) / 60_000,
          column: 0,
          columns: 1,
        });
      }

      return layoutSegments(segments);
    });
  }, [days, events, visibleStartMin, visibleEndMin]);

  const slotCount = Math.max(1, Math.round(visibleMinutes / slotMinutes));
  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let minute = visibleStartMin; minute < visibleEndMin; minute += 60) marks.push(minute);
    return marks;
  }, [visibleStartMin, visibleEndMin]);

  const goTo = (next: Date) => setDate(startOfDay(next));
  const step = view === "day" ? 1 : 7;
  const title = view === "day" ? formatDayTitle(date) : formatWeekTitle(days);
  const today = now ?? new Date();

  const rootStyle: CmSchedulerStyle = {
    "--cm-scheduler-hour-height": `${hourHeight}px`,
    "--cm-scheduler-slot-height": `${slotMinutes * minuteHeight}px`,
    "--cm-scheduler-days": String(days.length),
    ...style,
  };

  return (
    <div ref={ref} className={cn("cm-scheduler", className)} style={rootStyle} {...rest}>
      {showHeader ? (
        <div className="cm-scheduler__toolbar">
          <div className="cm-scheduler__nav">
            <CmButton
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<ChevronLeft aria-hidden />}
              aria-label={view === "day" ? "Dia anterior" : "Semana anterior"}
              onClick={() => goTo(addDays(date, -step))}
            />
            <CmButton type="button" variant="outline" size="sm" onClick={() => goTo(new Date())}>
              Hoje
            </CmButton>
            <CmButton
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<ChevronRight aria-hidden />}
              aria-label={view === "day" ? "Próximo dia" : "Próxima semana"}
              onClick={() => goTo(addDays(date, step))}
            />
          </div>
          <span className="cm-scheduler__title" aria-live="polite">
            {title}
          </span>
          <div className="cm-scheduler__views" role="group" aria-label="Visão da agenda">
            <CmButton
              type="button"
              size="sm"
              variant={view === "day" ? "solid" : "outline"}
              aria-pressed={view === "day"}
              onClick={() => setView("day")}
            >
              Dia
            </CmButton>
            <CmButton
              type="button"
              size="sm"
              variant={view === "week" ? "solid" : "outline"}
              aria-pressed={view === "week"}
              onClick={() => setView("week")}
            >
              Semana
            </CmButton>
          </div>
        </div>
      ) : null}

      <div className="cm-scheduler__scroll">
        <div className="cm-scheduler__grid">
          <div className="cm-scheduler__corner" aria-hidden />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "cm-scheduler__day-header",
                  isToday && "cm-scheduler__day-header--today",
                )}
              >
                <span className="cm-scheduler__day-name">
                  {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
                <span className="cm-scheduler__day-number">{day.getDate()}</span>
              </div>
            );
          })}

          <div className="cm-scheduler__gutter" aria-hidden>
            {hourMarks.map((minute) => (
              <span key={minute} className="cm-scheduler__gutter-label">
                {formatHour(minute)}
              </span>
            ))}
          </div>

          {days.map((day, dayIndex) => {
            const dayStart = startOfDay(day);
            const isToday = isSameDay(day, today);
            const nowMin =
              showNowIndicator && now && isSameDay(day, now)
                ? now.getHours() * 60 + now.getMinutes()
                : null;
            const nowOffset =
              nowMin !== null && nowMin >= visibleStartMin && nowMin < visibleEndMin
                ? (nowMin - visibleStartMin) * minuteHeight
                : null;

            return (
              <div
                key={day.toISOString()}
                className={cn("cm-scheduler__day-col", isToday && "cm-scheduler__day-col--today")}
              >
                {Array.from({ length: slotCount }, (_, index) => {
                  const slotStartMin = visibleStartMin + index * slotMinutes;
                  const isHour = slotStartMin % 60 === 0;
                  const slotClass = cn(
                    "cm-scheduler__slot",
                    !isHour && "cm-scheduler__slot--minor",
                  );
                  if (!onSlotClick) {
                    return <div key={index} className={slotClass} aria-hidden />;
                  }
                  const start = new Date(dayStart.getTime() + slotStartMin * 60_000);
                  const end = new Date(start.getTime() + slotMinutes * 60_000);
                  return (
                    <button
                      key={index}
                      type="button"
                      className={slotClass}
                      aria-label={`${formatDayTitle(day)}, ${formatHour(slotStartMin)}`}
                      onClick={() => onSlotClick({ start, end })}
                    />
                  );
                })}

                {segmentsByDay[dayIndex].map((segment) => {
                  const { event } = segment;
                  const top = (segment.startMin - visibleStartMin) * minuteHeight;
                  const height = (segment.endMin - segment.startMin) * minuteHeight;
                  const width = 100 / segment.columns;
                  const eventStyle: CmSchedulerStyle = {
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${segment.column * width}%`,
                    width: `calc(${width}% - 2px)`,
                  };
                  if (event.color) eventStyle["--cm-scheduler-event-color"] = event.color;
                  const timeRange = formatTimeRange(segment.start, segment.end);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={cn(
                        "cm-scheduler__event",
                        !event.color && `cm-scheduler__event--tone-${event.tone ?? "primary"}`,
                      )}
                      style={eventStyle}
                      aria-label={`${event.title}, ${timeRange}`}
                      onClick={onEventClick ? () => onEventClick(event) : undefined}
                    >
                      {renderEvent ? (
                        renderEvent(event)
                      ) : (
                        <>
                          <span className="cm-scheduler__event-time">{timeRange}</span>
                          <span className="cm-scheduler__event-title">{event.title}</span>
                          {event.description ? (
                            <span className="cm-scheduler__event-description">
                              {event.description}
                            </span>
                          ) : null}
                        </>
                      )}
                    </button>
                  );
                })}

                {nowOffset !== null ? (
                  <div
                    className="cm-scheduler__now"
                    style={{ top: `${nowOffset}px` }}
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
CmScheduler.displayName = "CmScheduler";
