import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmBarChart } from "./bar-chart.js";

const data = [
  { label: "Janeiro", value: 120, tone: "success" as const },
  { label: "Fevereiro", value: 80, color: "#f00" },
];

describe("CmBarChart", () => {
  it("renders through the shared chart frame with legend and accessible table", () => {
    render(
      <CmBarChart
        data={data}
        title="Vendas"
        legend
        accessibleTableLabel="Dados do gráfico de barras"
        valueFormat={(value) => `R$ ${value}`}
      />,
    );

    expect(screen.getByText("Vendas")).toBeInTheDocument();
    expect(screen.getAllByText("Janeiro").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Fevereiro").length).toBeGreaterThan(1);
    expect(screen.getAllByText("R$ 120").length).toBeGreaterThan(0);
    expect(screen.getByText("Dados do gráfico de barras")).toBeInTheDocument();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<CmBarChart data={[]} loading loadingMessage="Carregando" />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");

    rerender(<CmBarChart data={[]} emptyMessage="Sem vendas" />);
    expect(screen.getByText("Sem vendas")).toBeInTheDocument();
  });

  it("sizes the horizontal tracks independently of the frame and data values", () => {
    const { container, rerender } = render(
      <CmBarChart data={data} orientation="horizontal" height={200} barThickness="xs" />,
    );
    const tracks = container.querySelectorAll<HTMLElement>(".cm-bar-chart__track");
    expect(tracks).toHaveLength(data.length);
    for (const track of tracks) expect(track).toHaveStyle({ height: "4px" });
    expect(container.querySelector(".cm-chart-frame")).toHaveStyle({
      "--cm-chart-frame-height": "200px",
    });
    expect(container.querySelector(".cm-bar-chart__fill")).toHaveStyle({ width: "100%" });

    rerender(<CmBarChart data={data} orientation="horizontal" barThickness={6.5} />);
    expect(tracks[0]).toHaveStyle({ height: "6.5px" });

    rerender(<CmBarChart data={data} orientation="horizontal" />);
    expect(tracks[0].style.height).toBe("");
  });

  it("preserves the vertical chart dimensions when barThickness is supplied", () => {
    const { container } = render(<CmBarChart data={data} height={200} barThickness="xs" />);
    expect(container.querySelector(".cm-bar-chart--vertical")).toHaveStyle({ height: "200px" });
    expect(container.querySelector(".cm-bar-chart__fill--vertical")).toHaveStyle({
      height: "100%",
    });
  });

  it("keeps className on the chart element and frameClassName on the frame", () => {
    const { container } = render(
      <CmBarChart data={data} className="chart-extra" frameClassName="frame-extra" />,
    );

    expect(container.querySelector(".cm-chart-frame")).toHaveClass("frame-extra");
    expect(container.querySelector(".cm-bar-chart")).toHaveClass("chart-extra");
  });
});
