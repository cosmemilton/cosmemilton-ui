import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CmComparisonLineChart } from "./comparison-line-chart.js";

const axes = {
  leftAxis: { label: "Receita", valueFormat: (n: number) => `R$ ${n}` },
  rightAxis: { label: "Pedidos" },
};
const data = [
  { id: "a", label: "Jan", description: "Janeiro", left: 12000, right: 6 },
  { id: "b", label: "Fev", left: 6000, right: 3 },
];

describe("CmComparisonLineChart", () => {
  it("mantém as lacunas e os pontos isolados ao suavizar e preencher uma série", () => {
    const { container } = render(
      <CmComparisonLineChart
        {...axes}
        leftAxis={{ ...axes.leftAxis, area: true, domain: [-10, 10] }}
        curve="smooth"
        legendPosition="header"
        xLabels="responsive"
        data={[0, 10, null, -5, null, -10, 8, 4].map((left, index) => ({
          id: String(index),
          label: `Dia ${index + 1}`,
          left,
          right: null,
        }))}
      />,
    );
    const line = container.querySelector("svg path[stroke]")!.getAttribute("d")!;
    expect(line.match(/M/g)).toHaveLength(3);
    expect(line.match(/C/g)).toHaveLength(3);
    expect(line).toContain("l0 0");
    const area = container.querySelector('svg path[fill^="url"]')!.getAttribute("d")!;
    expect(area.match(/50 Z/g)).toHaveLength(2);
    expect(container.querySelector(".cm-comparison-chart__labels")!.children).toHaveLength(8);
    const legend = screen.getByRole("list", { name: "Legenda" });
    expect(legend.closest(".cm-chart-frame__header")).toBeInTheDocument();
    expect(legend.querySelector('[data-marker="dashed"]')).toBeInTheDocument();
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuetext", "Dia 8 · Receita: R$ 4 · Pedidos: —");
  });

  it("usa escalas independentes e expõe as unidades na tabela e no cursor de teclado", () => {
    const { container } = render(
      <CmComparisonLineChart {...axes} data={data} accessibleTableLabel="Comparativo" />,
    );
    const paths = container.querySelectorAll("svg path");
    expect(paths[0].getAttribute("d")).toBe(paths[1].getAttribute("d"));
    const table = screen.getByRole("table", { name: "Comparativo" });
    expect(within(table).getByText("Janeiro")).toBeInTheDocument();
    expect(within(table).getByText("R$ 6000")).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: "Receita e Pedidos" });
    fireEvent.focus(slider);
    expect(slider).toHaveAttribute("aria-valuetext", "Janeiro · Receita: R$ 12000 · Pedidos: 6");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuetext", "Fev · Receita: R$ 6000 · Pedidos: 3");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "2");
    fireEvent.keyDown(slider, { key: "Escape" });
    expect(container.querySelector(".cm-comparison-chart__tooltip")).toBeNull();
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuenow", "1");
  });

  it("distingue ausentes de zero e conserva os limites após a troca de dados", () => {
    const { container, rerender } = render(<CmComparisonLineChart {...axes} data={data} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
    rerender(
      <CmComparisonLineChart {...axes} data={[{ id: "c", label: "Mar", left: null, right: 0 }]} />,
    );
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "Mar · Receita: — · Pedidos: 0",
    );
    expect(container.querySelectorAll("svg path")[1].getAttribute("d")).toContain("l0 0");
    rerender(
      <CmComparisonLineChart
        {...axes}
        data={[{ id: "x", label: "Abr", left: NaN, right: null }]}
      />,
    );
    expect(screen.getByText("Nenhum dado para exibir")).toBeInTheDocument();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
