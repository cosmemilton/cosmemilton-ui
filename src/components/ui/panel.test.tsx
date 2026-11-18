import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CmPanel } from "../../server.js";

describe("CmPanel", () => {
  it("server-renders a named region with a level-two heading by default", () => {
    const html = renderToStaticMarkup(<CmPanel title="Suporte">18 chamados</CmPanel>);
    const root = document.createElement("div");
    root.innerHTML = html;

    const panel = within(root).getByRole("region", { name: "Suporte" });
    expect(within(panel).getByRole("heading", { name: "Suporte", level: 2 })).toBeDefined();
    expect(panel).toHaveTextContent("18 chamados");
    expect(panel.querySelector(".cm-card__footer")).toBeNull();
  });

  it("places the action, body and footer in reading order and hides the decorative icon", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <CmPanel
        ref={ref}
        id="vendas"
        className="dashboard-panel"
        title="Vendas"
        description="Pedidos por etapa"
        headingLevel={3}
        icon={<svg role="img" aria-label="Ícone de vendas" />}
        actions={<button>Exportar</button>}
        bodyPadding="sm"
        footer={<button>Ver pedidos</button>}
      >
        12 pedidos
      </CmPanel>,
    );

    const panel = screen.getByRole("region", { name: "Vendas" });
    expect(ref.current).toBe(panel);
    expect(panel).toHaveAttribute("id", "vendas");
    expect(panel).toHaveClass("cm-panel", "dashboard-panel");
    const [header, body, footer] = Array.from(panel.children);
    expect(header).toContainElement(screen.getByRole("heading", { name: "Vendas", level: 3 }));
    expect(header).toContainElement(screen.getByText("Pedidos por etapa"));
    expect(header).toContainElement(screen.getByRole("button", { name: "Exportar" }));
    expect(screen.queryByRole("img")).toBeNull();
    expect(body).toHaveClass("cm-card__body", "cm-card--padding-sm");
    expect(body).toHaveTextContent("12 pedidos");
    expect(footer).toHaveClass("cm-card__footer");
    expect(footer).toContainElement(screen.getByRole("button", { name: "Ver pedidos" }));
  });

  it("preserves a custom role and explicit accessible names", () => {
    render(
      <>
        <h2 id="section-name">Equipe de suporte</h2>
        <CmPanel title="Chamados" role="group" aria-labelledby="section-name" />
        <CmPanel title="Pedidos" aria-label="Pedidos desta semana" />
      </>,
    );
    const group = screen.getByRole("group", { name: "Equipe de suporte" });
    expect(group).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("region", { name: "Pedidos desta semana" })).toBeInTheDocument();
  });
});
