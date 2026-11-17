import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmMetricCard } from "./metric-card.js";

describe("CmMetricCard trend", () => {
  it("displays the absolute percentage and direction by default", () => {
    render(<CmMetricCard title="Receita" value="R$ 100" trend={{ value: 8.2, label: "No mês" }} />);

    expect(screen.getByText("↑ 8.2%")).toHaveClass("cm-metric-card__trend-value--positive");
    expect(screen.getByText("No mês")).toBeInTheDocument();
  });

  it("displays a formatted value while using the numeric sign for direction", () => {
    render(
      <CmMetricCard
        title="Conversão"
        value="3,64%"
        trend={{ value: -0.26, formattedValue: "0,26 p.p.", label: "vs. período anterior" }}
      />,
    );

    expect(screen.getByText("↓ 0,26 p.p.")).toHaveClass("cm-metric-card__trend-value--negative");
    expect(screen.getByText("vs. período anterior")).toBeInTheDocument();
  });
});
