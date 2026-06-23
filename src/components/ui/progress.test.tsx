import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmProgress } from "./progress.js";

describe("CmProgress", () => {
  it("renders a progressbar with the generic accessible name by default", () => {
    render(<CmProgress value={40} />);
    const el = screen.getByRole("progressbar", { name: "Progresso" });
    expect(el).toHaveClass("cm-progress__bar");
    expect(el).toHaveAttribute("value", "40");
    expect(el).toHaveAttribute("max", "100");
  });

  it("uses the label as the accessible name and renders it visibly", () => {
    render(<CmProgress value={60} label="CPU" />);
    expect(screen.getByRole("progressbar", { name: "CPU" })).toBeInTheDocument();
    expect(screen.getByText("CPU")).toHaveClass("cm-progress__label");
  });

  it("keeps the label accessible-only when srOnlyLabel is set", () => {
    render(<CmProgress value={60} label="CPU" srOnlyLabel />);
    // Name still exposed to assistive tech…
    expect(screen.getByRole("progressbar", { name: "CPU" })).toBeInTheDocument();
    // …but no visible text is rendered.
    expect(screen.queryByText("CPU")).toBeNull();
  });

  it("renders the percentage when showValue is set", () => {
    render(<CmProgress value={42} showValue />);
    expect(screen.getByText("42%")).toHaveClass("cm-progress__value");
  });

  it("shows both label and value together", () => {
    render(<CmProgress value={75} label="Disco" showValue />);
    expect(screen.getByText("Disco")).toHaveClass("cm-progress__label");
    expect(screen.getByText("75%")).toHaveClass("cm-progress__value");
  });

  it("normalizes value and native bar against a custom min/max", () => {
    render(<CmProgress value={75} min={50} max={100} showValue aria-label="Range" />);
    // (75 - 50) / (100 - 50) = 0.5 → 50%
    expect(screen.getByText("50%")).toBeInTheDocument();
    const el = screen.getByRole("progressbar", { name: "Range" });
    expect(el).toHaveAttribute("value", "25");
    expect(el).toHaveAttribute("max", "50");
  });

  it("clamps the value to the range", () => {
    render(<CmProgress value={140} showValue />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "100");
  });

  it("supports a custom value formatter", () => {
    render(
      <CmProgress
        value={350}
        max={500}
        showValue
        valueFormat={({ value, max }) => `${value}/${max}`}
      />,
    );
    expect(screen.getByText("350/500")).toHaveClass("cm-progress__value");
  });

  it("falls back to an explicit aria-label when no label is given", () => {
    render(<CmProgress value={10} aria-label="Upload" />);
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeInTheDocument();
  });

  it("forwards native props and className to the root element", () => {
    const { container } = render(<CmProgress value={10} data-testid="p" className="extra" />);
    const root = screen.getByTestId("p");
    expect(root).toHaveClass("cm-progress", "extra");
    expect(container.querySelector(".cm-progress__bar")).toBeInTheDocument();
  });
});
