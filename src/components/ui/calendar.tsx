"use client";

import { Fragment, useMemo } from "react";
import { cn } from "../../lib/utils.js";

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type CmCalendarProps = {
  value?: Date;
  onSelect?: (date: Date) => void;
  month?: number;
  year?: number;
  className?: string;
};

export function CmCalendar({ value = new Date(), onSelect, month, year, className }: CmCalendarProps) {
  const reference = useMemo(() => {
    const now = new Date(value);
    if (typeof month === "number") now.setMonth(month);
    if (typeof year === "number") now.setFullYear(year);
    now.setDate(1);
    return now;
  }, [value, month, year]);

  const matrix = useMemo(() => {
    const firstDay = reference.getDay();
    const daysInMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
    const weeks: Array<Array<Date | null>> = [];
    let currentWeek: Array<Date | null> = Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(reference.getFullYear(), reference.getMonth(), day);
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [reference]);

  const isSameDay = (a: Date | undefined, b: Date | undefined) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  return (
    <div className={cn("cm-calendar", className)}>
      <header className="cm-calendar__header">
        <span>
          {reference.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
        </span>
      </header>
      <div className="cm-calendar__weekdays">
        {dayLabels.map((label) => (
          <span key={label} className="cm-calendar__weekday">
            {label}
          </span>
        ))}
      </div>
      <div className="cm-calendar__grid">
        {matrix.map((week, weekIndex) => (
          <Fragment key={weekIndex}>
            {week.map((date, index) => {
              if (!date) {
                return <span key={`${weekIndex}-${index}`} className="cm-calendar__empty" />;
              }

              const isSelected = isSameDay(date, value);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  onClick={() => onSelect?.(date)}
                  className={cn(
                    "cm-calendar__day",
                    isToday && "cm-calendar__day--today",
                    isSelected
                      ? "cm-calendar__day--selected"
                      : "cm-calendar__day--default",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
