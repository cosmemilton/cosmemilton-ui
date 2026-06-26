import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmChartFrame } from "./chart-frame.js";

describe("CmChartFrame", () => {
  it("renders title, description, legend and an accessible table", () => {
    render(
      <CmChartFrame
        title="Receita"
        description="Últimos meses"
        height={240}
        legend={[{ label: "Pago", tone: "success", value: "R$ 10 mil" }]}
        table={{
          caption: "Receita por mês",
          columns: [
            { key: "month", header: "Mês" },
            { key: "value", header: "Valor" },
          ],
          rows: [{ month: "Jan", value: "100" }],
        }}
      >
        <div>chart</div>
      </CmChartFrame>,
    );

    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByText("Últimos meses")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("R$ 10 mil")).toBeInTheDocument();
    expect(screen.getByText("Receita por mês")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
  });

  it("prioritizes loading state over children", () => {
    render(
      <CmChartFrame loading loadingMessage="Buscando">
        <div>chart</div>
      </CmChartFrame>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Buscando");
    expect(screen.queryByText("chart")).not.toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<CmChartFrame empty emptyMessage="Sem dados" />);
    expect(screen.getByText("Sem dados")).toBeInTheDocument();
  });
});
