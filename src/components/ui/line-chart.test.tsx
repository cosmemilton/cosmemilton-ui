import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmLineChart } from "./line-chart.js";

const data = [
  { label: "Jan", value: 1000 },
  { label: "Fev", value: 1500 },
  { label: "Mar", value: 900 },
];

describe("CmLineChart", () => {
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
