import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmMetricCard } from "./metric-card.js";

describe("CmMetricCard variants", () => {
  it.each(["soft", "solid", "gradient"] as const)("applies the %s variant and tone", (variant) => {
    render(
      <CmMetricCard
        data-testid="metric"
        title="Receita"
        value="R$ 100"
        variant={variant}
        tone="info"
      />,
    );

    expect(screen.getByTestId("metric")).toHaveClass(
      `cm-metric-card--${variant}`,
      "cm-metric-card--tone-info",
    );
  });

  it("retains the default markup for both implicit and explicit surface", () => {
    const { rerender } = render(
      <CmMetricCard data-testid="metric" title="Receita" value="R$ 100" />,
    );
    const card = screen.getByTestId("metric");
    expect(card).toHaveClass("cm-metric-card", "cm-metric-card--tone-default");
    expect(card).not.toHaveClass("cm-metric-card--surface");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");

    rerender(
      <CmMetricCard data-testid="metric" title="Receita" value="R$ 100" variant="surface" />,
    );
    expect(card).not.toHaveClass("cm-metric-card--surface");
  });

  it("preserves the loading state and keyboard activation on a gradient card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const props = { title: "Receita", value: "R$ 100", variant: "gradient", onClick } as const;
    const { rerender } = render(<CmMetricCard {...props} loading />);

    expect(screen.getByRole("button", { busy: true })).toHaveClass(
      "cm-metric-card--gradient",
      "cm-metric-card--loading",
    );
    expect(screen.queryByText("R$ 100")).not.toBeInTheDocument();

    rerender(<CmMetricCard {...props} />);
    const card = screen.getByRole("button", { name: /Receita/ });
    expect(card).toHaveAttribute("tabindex", "0");
    expect(card).not.toHaveAttribute("aria-busy");
    expect(screen.getByText("R$ 100")).toBeInTheDocument();
    await user.tab();
    expect(card).toHaveFocus();
    await user.keyboard("{Enter}[Space]");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

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
        variant="solid"
        tone="primary"
        trend={{ value: -0.26, formattedValue: "0,26 p.p.", label: "vs. período anterior" }}
      />,
    );

    expect(screen.getByText("↓ 0,26 p.p.")).toHaveClass("cm-metric-card__trend-value--negative");
    expect(screen.getByText("vs. período anterior")).toBeInTheDocument();
  });
});
