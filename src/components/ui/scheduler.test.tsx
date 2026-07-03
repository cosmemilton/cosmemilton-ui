import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmScheduler, type CmSchedulerEvent } from "./scheduler.js";

// Quarta-feira, 1 de julho de 2026.
const reference = new Date(2026, 6, 1);

const events: CmSchedulerEvent[] = [
  {
    id: "a",
    title: "Vistoria inicial",
    start: new Date(2026, 6, 1, 9, 0),
    end: new Date(2026, 6, 1, 10, 0),
  },
  {
    id: "b",
    title: "Vistoria final",
    start: new Date(2026, 6, 1, 9, 30),
    end: new Date(2026, 6, 1, 11, 0),
    tone: "success",
  },
];

describe("CmScheduler", () => {
  it("renders a week of day headers around the reference date", () => {
    const { container } = render(<CmScheduler date={reference} events={[]} />);
    const headers = container.querySelectorAll(".cm-scheduler__day-header");
    expect(headers).toHaveLength(7);
    // Semana começa no domingo (28/06) e termina no sábado (04/07).
    const numbers = [...container.querySelectorAll(".cm-scheduler__day-number")].map(
      (el) => el.textContent,
    );
    expect(numbers).toEqual(["28", "29", "30", "1", "2", "3", "4"]);
  });

  it("hides weekends when requested", () => {
    const { container } = render(<CmScheduler date={reference} hideWeekends events={[]} />);
    expect(container.querySelectorAll(".cm-scheduler__day-header")).toHaveLength(5);
  });

  it("positions events by start/end within the visible window", () => {
    render(
      <CmScheduler date={reference} view="day" startHour={7} endHour={19} hourHeight={48} events={events} />,
    );
    // 09:00 com startHour 7 → 2h × 48px; duração 1h → 48px.
    const event = screen.getByRole("button", { name: "Vistoria inicial, 09:00 – 10:00" });
    expect(event.style.top).toBe("96px");
    expect(event.style.height).toBe("48px");
  });

  it("splits overlapping events into columns", () => {
    render(<CmScheduler date={reference} view="day" events={events} />);
    const first = screen.getByRole("button", { name: "Vistoria inicial, 09:00 – 10:00" });
    const second = screen.getByRole("button", { name: "Vistoria final, 09:30 – 11:00" });
    expect(first.style.width).toBe("calc(50% - 2px)");
    expect(first.style.left).toBe("0%");
    expect(second.style.left).toBe("50%");
    expect(second).toHaveClass("cm-scheduler__event--tone-success");
  });

  it("clamps events that cross the visible window instead of dropping them", () => {
    render(
      <CmScheduler
        date={reference}
        view="day"
        startHour={8}
        endHour={10}
        hourHeight={60}
        events={[
          { id: "x", title: "Madrugada", start: new Date(2026, 6, 1, 6, 0), end: new Date(2026, 6, 1, 9, 0) },
        ]}
      />,
    );
    const event = screen.getByRole("button", { name: /Madrugada/ });
    expect(event.style.top).toBe("0px");
    expect(event.style.height).toBe("60px");
  });

  it("omits events entirely outside the visible window", () => {
    render(
      <CmScheduler
        date={reference}
        view="day"
        startHour={8}
        endHour={10}
        events={[
          { id: "x", title: "Noite", start: new Date(2026, 6, 1, 20, 0), end: new Date(2026, 6, 1, 21, 0) },
        ]}
      />,
    );
    expect(screen.queryByRole("button", { name: /Noite/ })).toBeNull();
  });

  it("fires onEventClick with the original event", async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    render(<CmScheduler date={reference} view="day" events={events} onEventClick={onEventClick} />);
    await user.click(screen.getByRole("button", { name: "Vistoria inicial, 09:00 – 10:00" }));
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it("renders slots as buttons only when onSlotClick exists, and reports the slot range", async () => {
    const user = userEvent.setup();
    const onSlotClick = vi.fn();
    const { container, rerender } = render(
      <CmScheduler date={reference} view="day" startHour={7} endHour={9} slotMinutes={30} events={[]} />,
    );
    expect(container.querySelector("button.cm-scheduler__slot")).toBeNull();

    rerender(
      <CmScheduler
        date={reference}
        view="day"
        startHour={7}
        endHour={9}
        slotMinutes={30}
        events={[]}
        onSlotClick={onSlotClick}
      />,
    );
    const slots = container.querySelectorAll("button.cm-scheduler__slot");
    expect(slots).toHaveLength(4);
    await user.click(slots[1]);
    expect(onSlotClick).toHaveBeenCalledWith({
      start: new Date(2026, 6, 1, 7, 30),
      end: new Date(2026, 6, 1, 8, 0),
    });
  });

  it("switches the view and navigates dates from the toolbar", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const onDateChange = vi.fn();
    const { container } = render(
      <CmScheduler
        defaultDate={reference}
        defaultView="week"
        events={[]}
        onViewChange={onViewChange}
        onDateChange={onDateChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dia" }));
    expect(onViewChange).toHaveBeenCalledWith("day");
    expect(container.querySelectorAll(".cm-scheduler__day-header")).toHaveLength(1);
    expect(screen.getByText(/1 de julho de 2026/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próximo dia" }));
    expect(onDateChange).toHaveBeenCalledWith(new Date(2026, 6, 2));
    expect(screen.getByText(/2 de julho de 2026/)).toBeInTheDocument();
  });

  it("respects a controlled date without mutating it on navigation", async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(<CmScheduler date={reference} view="day" events={[]} onDateChange={onDateChange} />);
    await user.click(screen.getByRole("button", { name: "Próximo dia" }));
    expect(onDateChange).toHaveBeenCalledWith(new Date(2026, 6, 2));
    // Controlado: sem re-render do pai, o título continua no dia de referência.
    expect(screen.getByText(/1 de julho de 2026/)).toBeInTheDocument();
  });

  it("accepts ISO strings for date and events (serializable from RSC)", () => {
    render(
      <CmScheduler
        date="2026-07-01T12:00:00"
        view="day"
        events={[{ id: 1, title: "ISO", start: "2026-07-01T09:00:00", end: "2026-07-01T09:30:00" }]}
      />,
    );
    expect(screen.getByRole("button", { name: "ISO, 09:00 – 09:30" })).toBeInTheDocument();
  });

  it("renders custom event content via renderEvent", () => {
    render(
      <CmScheduler
        date={reference}
        view="day"
        events={[events[0]]}
        renderEvent={(event) => <em>{event.title.toUpperCase()}</em>}
      />,
    );
    expect(screen.getByText("VISTORIA INICIAL")).toBeInTheDocument();
  });

  it("applies an explicit event color over the tone", () => {
    render(
      <CmScheduler
        date={reference}
        view="day"
        events={[{ ...events[0], color: "#7c3aed" }]}
      />,
    );
    const event = screen.getByRole("button", { name: "Vistoria inicial, 09:00 – 10:00" });
    expect(event.style.getPropertyValue("--cm-scheduler-event-color")).toBe("#7c3aed");
    expect(event.className).not.toMatch(/--tone-/);
  });

  it("hides the toolbar with showHeader=false", () => {
    const { container } = render(<CmScheduler date={reference} events={[]} showHeader={false} />);
    expect(container.querySelector(".cm-scheduler__toolbar")).toBeNull();
  });
});
