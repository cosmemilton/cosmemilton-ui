import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CmCard } from "./card.js";

describe("CmCard variants", () => {
  it.each(["orbits", "connections", "bricks", "puzzle"] as const)(
    "paints the %s pattern without adding accessible content",
    (pattern) => {
      render(
        <CmCard pattern={pattern} variant="outline" accent="top" data-testid="card">
          Total
        </CmCard>,
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass(
        "cm-card--outline",
        "cm-card--accent-top",
        `cm-card--pattern-${pattern}`,
      );
      expect(card.childElementCount).toBe(0);
    },
  );

  it("renders the body and inset panel in reading order between the existing slots", () => {
    render(
      <CmCard
        header="Relatório"
        footer="Detalhes"
        aside={<button>Ver meta</button>}
        bodyPadding="lg"
      >
        <h2>Receita</h2>
      </CmCard>,
    );
    const main = screen.getByRole("heading");
    const action = screen.getByRole("button", { name: "Ver meta" });
    expect(main.parentElement?.parentElement).toHaveClass(
      "cm-card__body--with-aside",
      "cm-card--padding-lg",
    );
    expect(main.parentElement?.nextElementSibling).toContainElement(action);
    expect(main.closest(".cm-card")).toHaveTextContent("RelatórioReceitaVer metaDetalhes");
  });

  it.each(["solid", "gradient"] as const)(
    "applies the %s variant and tone to native slots",
    (variant) => {
      render(
        <CmCard
          role="region"
          aria-label="Resumo"
          variant={variant}
          tone="primary"
          header={<h2>Visão geral</h2>}
          footer={<button type="button">Ver detalhes</button>}
        >
          Receita de R$ 100
        </CmCard>,
      );

      const card = screen.getByRole("region", { name: "Resumo" });
      expect(card).toHaveClass(`cm-card--${variant}`, "cm-card--tone-primary");
      expect(within(card).getByRole("heading", { name: "Visão geral" })).toBeInTheDocument();
      expect(within(card).getByText("Receita de R$ 100")).toBeInTheDocument();
      expect(within(card).getByRole("button", { name: "Ver detalhes" })).toBeEnabled();
    },
  );

  it("preserves the default surface and changes neither its role nor tone", () => {
    render(<CmCard data-testid="card">Resumo</CmCard>);

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("cm-card--surface", "cm-card--tone-default");
    expect(card).not.toHaveClass("cm-card--patterned", "cm-card--with-aside");
    expect(card).not.toHaveAttribute("role");
    expect(card).toHaveTextContent("Resumo");
  });
});
