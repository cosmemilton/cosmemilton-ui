import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmGauge } from "./gauge.js";

describe("CmGauge", () => {
  it("renders a progressbar with range + tone class and default percent", () => {
    render(<CmGauge value={72} aria-label="Saude" />);
    const el = screen.getByRole("progressbar", { name: "Saude" });
    expect(el).toHaveClass("cm-gauge", "cm-gauge--tone-primary");
    expect(el).toHaveAttribute("aria-valuenow", "72");
    expect(el).toHaveAttribute("aria-valuemin", "0");
    expect(el).toHaveAttribute("aria-valuemax", "100");
    expect(el).toHaveAttribute("aria-valuetext", "72%");
    expect(screen.getByText("72%")).toHaveClass("cm-gauge__value");
  });

  it("normalizes value against a custom min/max for the percent", () => {
    render(<CmGauge value={75} min={50} max={100} aria-label="Range" />);
    // (75 - 50) / (100 - 50) = 0.5 → 50%
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("clamps the fill but keeps the raw value in aria-valuenow", () => {
    render(<CmGauge value={140} aria-label="Over" />);
    const el = screen.getByRole("progressbar", { name: "Over" });
    expect(el).toHaveAttribute("aria-valuenow", "140");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("omits the progress arc at zero but keeps the track", () => {
    const { container } = render(<CmGauge value={0} aria-label="Empty" />);
    expect(container.querySelector(".cm-gauge__track")).toBeInTheDocument();
    expect(container.querySelector(".cm-gauge__progress")).toBeNull();
  });

  it("applies the selected tone", () => {
    render(<CmGauge value={40} tone="success" aria-label="Ok" />);
    expect(screen.getByRole("progressbar", { name: "Ok" })).toHaveClass("cm-gauge--tone-success");
  });

  it("supports a custom value formatter and drops the default aria-valuetext", () => {
    render(
      <CmGauge
        value={350}
        max={500}
        valueFormat={({ value, max }) => `${value}/${max}`}
        aria-label="Quota"
      />,
    );
    expect(screen.getByText("350/500")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Quota" })).not.toHaveAttribute("aria-valuetext");
  });

  it("renders custom center content instead of the value", () => {
    render(
      <CmGauge value={90} aria-label="Custom">
        <span data-testid="center">9/10</span>
      </CmGauge>,
    );
    expect(screen.getByTestId("center")).toBeInTheDocument();
    expect(screen.queryByText("90%")).toBeNull();
  });

  it("exposes color and track overrides through CSS variables", () => {
    render(<CmGauge value={50} color="#ff0000" trackColor="#222222" aria-label="Colored" />);
    const el = screen.getByRole("progressbar", { name: "Colored" });
    expect(el.style.getPropertyValue("--cm-gauge-color")).toBe("#ff0000");
    expect(el.style.getPropertyValue("--cm-gauge-track")).toBe("#222222");
  });

  it("forwards native props to the root element", () => {
    render(<CmGauge value={10} data-testid="g" />);
    expect(screen.getByTestId("g")).toHaveClass("cm-gauge");
  });

  it("exposes the content inset so the text clears the ring", () => {
    render(<CmGauge value={50} size={200} thickness={30} data-testid="g" />);
    // strokeWidth + 4% do tamanho = 30 + 8
    expect(screen.getByTestId("g").style.getPropertyValue("--cm-gauge-inset")).toBe("38px");
  });

  // Nos tamanhos padrão (size 128): traço 13, folga 18 de cada lado → 92px úteis,
  // fonte base 28px e piso 15px.
  it("keeps the base font size while the value fits", () => {
    render(<CmGauge value={72} aria-label="Fits" />);
    expect(screen.getByText("72%")).toHaveStyle({ fontSize: "28px" });
  });

  it("shrinks the value font until the text fits the ring", () => {
    render(<CmGauge value={350} max={500} valueFormat={({ value, max }) => `${value}/${max}`} />);
    const el = screen.getByText("350/500");
    const fontSize = Number.parseInt(el.style.fontSize, 10);
    expect(fontSize).toBeLessThan(28);
    expect(fontSize).toBeGreaterThanOrEqual(15);
  });

  it("never shrinks the value past the minimum font size", () => {
    render(<CmGauge value={72} valueFormat={() => "9".repeat(40)} />);
    // 55% de 28, arredondado
    expect(screen.getByText("9".repeat(40))).toHaveStyle({ fontSize: "15px" });
  });

  it("honors an explicit minValueFontSize", () => {
    render(<CmGauge value={72} minValueFontSize={22} valueFormat={() => "9".repeat(40)} />);
    expect(screen.getByText("9".repeat(40))).toHaveStyle({ fontSize: "22px" });
  });

  it("keeps the base font size when autoFitValue is off", () => {
    render(<CmGauge value={72} autoFitValue={false} valueFormat={() => "9".repeat(40)} />);
    expect(screen.getByText("9".repeat(40))).toHaveStyle({ fontSize: "28px" });
  });

  it("uses valueFontSize as a ceiling, never as a floor", () => {
    // Num gauge grande o texto curto cabe folgado e mantém a fonte pedida...
    const { rerender } = render(<CmGauge value={72} size={220} valueFontSize={40} />);
    expect(screen.getByText("72%")).toHaveStyle({ fontSize: "40px" });
    // ...mas no tamanho padrão 40px não caberia, então o autoajuste reduz.
    rerender(<CmGauge value={72} valueFontSize={40} />);
    expect(Number.parseInt(screen.getByText("72%").style.fontSize, 10)).toBeLessThan(40);
  });

  it("gives more room to the text when the ring is thin", () => {
    const { rerender } = render(<CmGauge value={9} valueFormat={() => "1.284.930"} />);
    const thick = Number.parseInt(screen.getByText("1.284.930").style.fontSize, 10);
    rerender(<CmGauge value={9} thickness={4} valueFormat={() => "1.284.930"} />);
    expect(Number.parseInt(screen.getByText("1.284.930").style.fontSize, 10)).toBeGreaterThan(thick);
  });

  it("falls back to the base font size for JSX values it cannot measure", () => {
    render(<CmGauge value={72} valueFormat={() => <b data-testid="jsx">350/500</b>} />);
    expect(screen.getByTestId("jsx").parentElement).toHaveStyle({ fontSize: "28px" });
  });
});
