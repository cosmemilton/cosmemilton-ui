import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmRatioBar, type CmRatioBarSegment } from "./ratio-bar.js";

// Os números são os do disco do mockup: 512 GB, Windows com folga mínima de
// 60 GB e o Frevo pedindo pelo menos 20 GB.
const GB = 1024 * 1024 * 1024;
const segments: CmRatioBarSegment[] = [
  { id: "windows", label: "Windows", value: 190 * GB, valueLabel: "190 GB", min: 60 * GB },
  { id: "frevo", label: "Frevo OS", value: 322 * GB, valueLabel: "322 GB", min: 20 * GB },
];

describe("CmRatioBar", () => {
  it("renders one block per segment with its label", () => {
    const { container } = render(<CmRatioBar segments={segments} />);
    expect(container.querySelectorAll(".cm-ratio-bar__segment")).toHaveLength(2);
    expect(screen.getByText("Windows")).toBeInTheDocument();
    expect(screen.getByText("322 GB")).toBeInTheDocument();
  });

  it("has no handle without handleIndex — read-only by default", () => {
    render(<CmRatioBar segments={segments} />);
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("publishes the crossed limits on the handle", () => {
    render(<CmRatioBar segments={segments} handleIndex={0} onChange={() => {}} />);

    const handle = screen.getByRole("slider");
    // O teto do bloco da esquerda é a soma do par menos o piso do vizinho:
    // é assim que a folga mínima do Frevo vira limite do Windows.
    expect(handle).toHaveAttribute("aria-valuemin", String(60 * GB));
    expect(handle).toHaveAttribute("aria-valuemax", String(492 * GB));
    expect(handle).toHaveAttribute("aria-valuenow", String(190 * GB));
  });

  it("moves the boundary with the keyboard and keeps the pair sum", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CmRatioBar segments={segments} handleIndex={0} step={GB} onChange={onChange} />);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(onChange).toHaveBeenCalledWith([191 * GB, 321 * GB]);
    const [values] = onChange.mock.calls[0];
    expect(values[0] + values[1]).toBe(512 * GB);
  });

  it("clamps at the limits — Home and End land exactly on them", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CmRatioBar segments={segments} handleIndex={0} onChange={onChange} />);

    const handle = screen.getByRole("slider");
    handle.focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith([60 * GB, 452 * GB]);

    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith([492 * GB, 20 * GB]);
  });

  it("locks the handle when the limits cross (volume without room)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tight: CmRatioBarSegment[] = [
      { label: "Windows", value: 100 * GB, min: 100 * GB },
      { label: "Frevo OS", value: 20 * GB, min: 20 * GB },
    ];
    render(<CmRatioBar segments={tight} handleIndex={0} onChange={onChange} />);

    const handle = screen.getByRole("slider");
    expect(handle).toHaveAttribute("aria-valuemin", String(100 * GB));
    expect(handle).toHaveAttribute("aria-valuemax", String(100 * GB));

    handle.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not move when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CmRatioBar segments={segments} handleIndex={0} disabled onChange={onChange} />);

    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("drags with the pointer using the track geometry", () => {
    const onChange = vi.fn();
    const { container } = render(
      <CmRatioBar segments={segments} handleIndex={0} onChange={onChange} />,
    );

    const track = container.querySelector(".cm-ratio-bar__track") as HTMLElement;
    // jsdom não faz layout: sem um retângulo, a barra não teria como converter
    // pixel em byte — e a guarda do componente precisa ser exercitada.
    track.getBoundingClientRect = () =>
      ({ left: 0, width: 512, top: 0, right: 512, bottom: 0, height: 0, x: 0, y: 0 }) as DOMRect;

    const handle = screen.getByRole("slider");
    handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, clientX: 0 }));
    handle.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 256 }));

    // Metade da trilha = metade do total (512 GB) para o bloco da esquerda.
    expect(onChange).toHaveBeenLastCalledWith([256 * GB, 256 * GB]);
  });
});
