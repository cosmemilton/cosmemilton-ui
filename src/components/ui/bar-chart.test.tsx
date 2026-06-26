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

  it("keeps className on the chart element and frameClassName on the frame", () => {
    const { container } = render(
      <CmBarChart data={data} className="chart-extra" frameClassName="frame-extra" />,
    );

    expect(container.querySelector(".cm-chart-frame")).toHaveClass("frame-extra");
    expect(container.querySelector(".cm-bar-chart")).toHaveClass("chart-extra");
  });
});
