import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CmCard } from "./card.js";

describe("CmCard variants", () => {
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
    expect(card).not.toHaveAttribute("role");
    expect(card).toHaveTextContent("Resumo");
  });
});
