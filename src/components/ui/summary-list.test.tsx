import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmSummaryList, type CmSummaryItem } from "./summary-list.js";

const items: CmSummaryItem[] = [
  { label: "Idioma", value: "Português (Brasil) · pt_BR.UTF-8" },
  { label: "Teclado", value: "br-abnt2" },
  { label: "Disco", value: "nvme0n1 · 322 GB", tone: "danger", emphasis: true },
];

describe("CmSummaryList", () => {
  it("renders a definition list with one pair per item", () => {
    const { container } = render(<CmSummaryList items={items} />);
    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelectorAll(".cm-summary-list__item")).toHaveLength(3);
    expect(container.querySelectorAll("dt")).toHaveLength(3);
    expect(container.querySelectorAll("dd")).toHaveLength(3);
  });

  it("keeps each pair inside its own wrapper — the grid cell", () => {
    // Sem o <div> por par, duas colunas de grid separariam rótulos de valores.
    const { container } = render(<CmSummaryList items={items} columns={2} />);
    const pair = container.querySelectorAll(".cm-summary-list__item")[0];
    expect(pair.querySelector("dt")).toHaveTextContent("Idioma");
    expect(pair.querySelector("dd")).toHaveTextContent("Português (Brasil) · pt_BR.UTF-8");
  });

  it("publishes the column count as a custom property", () => {
    const { container } = render(<CmSummaryList items={items} columns={2} />);
    expect(container.querySelector("dl")).toHaveStyle({ "--cm-summary-list-columns": "2" });
  });

  it("marks the value that changes the decision", () => {
    render(<CmSummaryList items={items} />);
    const value = screen.getByText("nvme0n1 · 322 GB");
    expect(value).toHaveClass(
      "cm-summary-list__value--tone-danger",
      "cm-summary-list__value--emphasis",
    );
  });

  it("switches the layout modifier", () => {
    const { container } = render(<CmSummaryList items={items} layout="stacked" divided={false} />);
    const list = container.querySelector("dl");
    expect(list).toHaveClass("cm-summary-list--stacked");
    expect(list).not.toHaveClass("cm-summary-list--divided");
  });
});
