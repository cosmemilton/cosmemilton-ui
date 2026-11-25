import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmChangeHistory, type CmChangeHistoryEvent } from "./change-history.js";

const events = [
  {
    id: "limit",
    title: "Limite de crédito alterado",
    actor: "Ana Souza",
    dateTime: "2026-11-24T13:42:00Z",
    dateLabel: "24 nov · 10:42",
    tone: "primary",
    changes: [{ field: "Limite de crédito", before: "R$ 500,00", after: "R$ 800,00" }],
  },
  {
    id: "creation",
    title: "Cadastro criado",
    dateTime: "2026-11-20T12:15:00Z",
    detail: <span>Via importação</span>,
    tone: "default",
  },
] satisfies readonly CmChangeHistoryEvent[];

describe("CmChangeHistory", () => {
  it("displays a read-only history with authors, semantic dates, and changes in the input order", () => {
    const { container } = render(<CmChangeHistory events={events} />);
    const region = screen.getByRole("region", { name: "Histórico de alterações" });
    const [recent, original] = container.querySelectorAll("ol > li");
    expect(recent).toHaveTextContent(events[0].title);
    expect(original).toHaveTextContent(events[1].title);
    expect(within(region).getByText("Ana Souza")).toBeVisible();
    expect(within(region).getByText("24 nov · 10:42").tagName).toBe("TIME");
    expect(within(region).getByText("24 nov · 10:42")).toHaveAttribute(
      "datetime",
      events[0].dateTime,
    );
    expect(within(region).getByText(events[1].dateTime)).toBeVisible();
    expect(within(region).getByText("Via importação")).toBeVisible();
    expect(within(region).getByText("Antes").parentElement).toHaveTextContent("R$ 500,00");
    expect(within(region).getByText("Depois").parentElement).toHaveTextContent("R$ 800,00");
    expect(within(region).queryByRole("button")).not.toBeInTheDocument();
  });

  it("customizes labels, represents absent values, and preserves zero", () => {
    render(
      <CmChangeHistory
        events={[
          {
            ...events[0],
            changes: [
              { id: "credit", field: "Crédito", before: null, after: 0 },
              { id: "note", field: "Observação", before: "Removida", after: "" },
            ],
          },
        ]}
        beforeLabel="Anterior"
        afterLabel="Novo"
        emptyValueLabel="Vazio"
      />,
    );
    expect(screen.getAllByText("Anterior")).toHaveLength(2);
    expect(screen.getAllByText("Novo")).toHaveLength(2);
    expect(screen.getAllByText("Vazio")).toHaveLength(2);
    expect(screen.getByText("0")).toBeVisible();
  });

  it("renders configurable empty state and forwards native attributes and a ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <CmChangeHistory
        ref={ref}
        events={[]}
        title="Atividade"
        headingAs="h4"
        emptyText="Nenhum evento"
        id="history"
      />,
    );
    expect(ref.current).toBe(screen.getByRole("region", { name: "Atividade" }));
    expect(ref.current).toHaveAttribute("id", "history");
    expect(screen.getByRole("heading", { name: "Atividade", level: 4 })).toBeVisible();
    expect(screen.getByText("Nenhum evento")).toBeVisible();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders to HTML without relying on browser APIs", () => {
    const html = renderToString(<CmChangeHistory events={events} />);
    expect(html).toContain("Ana Souza");
    expect(html).toMatch(/datetime="2026-11-24T13:42:00Z"/i);
  });
});
