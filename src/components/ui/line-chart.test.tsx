import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmLineChart } from "./line-chart.js";

const data = [
  { label: "Jan", value: 1000 },
  { label: "Fev", value: 1500 },
  { label: "Mar", value: 900 },
];

describe("CmLineChart", () => {
  it("permite alternar entre a curva padrão e os segmentos lineares", () => {
    const { container, rerender } = render(<CmLineChart data={data} />);
    const stroke = () => container.querySelector("path[stroke]")!.getAttribute("d");
    expect(stroke()).toContain("C");
    rerender(<CmLineChart data={data} curve="linear" />);
    expect(stroke()).toContain("L");
    expect(stroke()).not.toContain("C");
    expect(container.querySelector("path[opacity]")?.getAttribute("d")).toContain(stroke());
  });

  it("renders frame metadata, legend and accessible table", () => {
    render(
      <CmLineChart
        data={data}
        title="Receita"
        description="Trimestre"
        legend
        accessibleTableLabel="Dados do gráfico de linhas"
        valueFormat={(value) => `${value} vendas`}
      />,
    );

    expect(screen.getAllByText("Receita").length).toBeGreaterThan(1);
    expect(screen.getByText("Trimestre")).toBeInTheDocument();
    expect(screen.getByText("1000 vendas")).toBeInTheDocument();
    expect(screen.getByText("Dados do gráfico de linhas")).toBeInTheDocument();
  });

  it("renders an empty state instead of returning null", () => {
    render(<CmLineChart data={[]} emptyMessage="Sem histórico" />);
    expect(screen.getByText("Sem histórico")).toBeInTheDocument();
  });

  it("adds tooltip titles to points", () => {
    render(<CmLineChart data={data} tooltipFormat={(point) => `${point.label}: ${point.value}`} />);
    expect(screen.getByText("Jan: 1000")).toBeInTheDocument();
  });
});
