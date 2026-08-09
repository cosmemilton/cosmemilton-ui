import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmSlider } from "./slider.js";

describe("CmSlider", () => {
  it("renders a native range with the accessible name from the label", () => {
    render(<CmSlider label="Volume" value={40} onChange={() => {}} />);
    const input = screen.getByRole("slider", { name: "Volume" });
    expect(input).toHaveAttribute("type", "range");
    expect(input).toHaveValue("40");
  });

  it("reports the number, not the event", () => {
    const onChange = vi.fn();
    render(<CmSlider label="Volume" value={40} onChange={onChange} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "70" } });
    expect(onChange.mock.calls[0][0]).toBe(70);
  });

  it("keeps the range native, which is what makes the keyboard work", async () => {
    // O jsdom não implementa o teclado do <input type="range">, então o que se
    // afirma aqui é o que sustenta esse teclado no navegador: o controle é o
    // elemento nativo, com min/max/step, e é ele que recebe o foco do Tab.
    const user = userEvent.setup();
    render(<CmSlider label="Volume" defaultValue={50} min={10} max={90} step={5} />);

    const input = screen.getByRole("slider", { name: "Volume" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("min", "10");
    expect(input).toHaveAttribute("max", "90");
    expect(input).toHaveAttribute("step", "5");

    await user.tab();
    expect(input).toHaveFocus();
  });

  it("follows the value when uncontrolled — the fill has to keep up", () => {
    const { container } = render(<CmSlider label="Volume" defaultValue={0} />);
    const root = container.querySelector(".cm-slider");
    expect(root).toHaveStyle({ "--cm-slider-fill": "0%" });

    fireEvent.change(screen.getByRole("slider"), { target: { value: "25" } });
    expect(root).toHaveStyle({ "--cm-slider-fill": "25%" });
  });

  it("computes the fill from min and max, not from 0 to 100", () => {
    const { container } = render(<CmSlider label="Brilho" min={20} max={60} value={40} />);
    expect(container.querySelector(".cm-slider")).toHaveStyle({ "--cm-slider-fill": "50%" });
  });

  it("clamps a value outside the range instead of overflowing the track", () => {
    const { container } = render(<CmSlider label="Volume" min={0} max={100} value={140} />);
    expect(container.querySelector(".cm-slider")).toHaveStyle({ "--cm-slider-fill": "100%" });
  });

  it("shows the formatted value and repeats it in aria-valuetext", () => {
    render(<CmSlider label="Volume" value={40} showValue valueFormat={(value) => `${value}%`} />);
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "40%");
  });

  it("hides the visual header from screen readers — the input already says it", () => {
    const { container } = render(<CmSlider label="Volume" value={40} showValue />);
    expect(container.querySelector(".cm-slider__header")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the label only as an accessible name when asked", () => {
    const { container } = render(<CmSlider label="Volume" srOnlyLabel value={40} />);
    expect(container.querySelector(".cm-slider__label")).toBeNull();
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("renders the marks it was given", () => {
    const { container } = render(
      <CmSlider label="Volume" value={50} marks={[0, { value: 50, label: "meio" }, 100]} />,
    );
    expect(container.querySelectorAll(".cm-slider__mark")).toHaveLength(3);
    expect(screen.getByText("meio")).toBeInTheDocument();
  });

  it("disables the input and the root modifier together", () => {
    const { container } = render(<CmSlider label="Volume" value={40} disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(container.querySelector(".cm-slider")).toHaveClass("cm-slider--disabled");
  });
});
