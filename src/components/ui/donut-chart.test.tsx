import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CmDonutChart } from "./donut-chart.js";

describe("CmDonutChart", () => {
  it("separa fatias minúsculas sem alterar os percentuais nem abrir um anel de 100%", () => {
    const data = [
      { id: "s", label: "Busca", value: 999 },
      { id: "d", label: "Direto", value: 1 },
      { id: "z", label: "Outros", value: 0 },
    ];
    const { container, rerender } = render(
      <CmDonutChart data={data} variant="segmented" legendLayout="list" />,
    );
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    expect(circles[1]).toHaveAttribute("stroke-linecap", "round");
    const tinyDash = Number(circles[1].getAttribute("stroke-dasharray")!.split(" ")[0]);
    expect(tinyDash).toBeGreaterThan(0);
    expect(tinyDash).toBeLessThan(0.1);
    expect(Number(circles[1].getAttribute("stroke-width"))).toBeLessThan(10);
    const list = screen.getByRole("list", { name: "Legenda" });
    expect(list).toHaveAttribute("data-layout", "list");
    expect(within(list).getByText("0,1%")).toBeInTheDocument();
    rerender(<CmDonutChart data={[data[0], data[2]]} variant="segmented" legendPosition="none" />);
    expect(container.querySelector("circle")).toHaveAttribute("stroke-dasharray", "100 0");
    expect(screen.queryByRole("list", { name: "Legenda" })).toBeNull();
    expect(within(screen.getByRole("table")).getByText("100%")).toBeInTheDocument();
    rerender(<CmDonutChart data={[data[2]]} variant="segmented" />);
    expect(screen.getByText("Nenhum dado para exibir")).toBeInTheDocument();
  });

  it("deriva o total, a geometria e os percentuais dos mesmos valores", () => {
    const { container } = render(
      <CmDonutChart
        accessibleTableLabel="Origem"
        totalLabel="sessões"
        data={[
          { id: "s", label: "Busca", value: 75 },
          { id: "d", label: "Direto", value: 25 },
          { id: "z", label: "Outros", value: 0 },
          { id: "x", label: "Inválido", value: -20 },
        ]}
      />,
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("sessões")).toBeInTheDocument();
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveAttribute("stroke-dasharray", "75 25");
    expect(circles[1]).toHaveAttribute("stroke-dashoffset", "-75");
    const table = screen.getByRole("table", { name: "Origem" });
    expect(within(table).getByText("75%")).toBeInTheDocument();
    expect(within(table).getByText("Outros")).toBeInTheDocument();
    expect(screen.queryByText("Inválido")).toBeNull();
  });
  it("exibe um estado vazio quando não há partes positivas finitas", () => {
    render(
      <CmDonutChart emptyMessage="Sem sessões" data={[{ id: "0", label: "Busca", value: 0 }]} />,
    );
    expect(screen.getByText("Sem sessões")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
