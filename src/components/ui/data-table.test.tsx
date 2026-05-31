import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmDataTable, type CmDataTableColumn } from "./data-table.js";

type Person = { id: string; name: string; age: number };

const data: Person[] = [
  { id: "1", name: "Charlie", age: 30 },
  { id: "2", name: "Alice", age: 25 },
  { id: "3", name: "Bob", age: 35 },
];

const columns: CmDataTableColumn<Person>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "age", header: "Age", render: (row) => `${row.age} yrs` },
];

function renderTable(props: Partial<Parameters<typeof CmDataTable<Person>>[0]> = {}) {
  return render(
    <CmDataTable
      columns={columns}
      data={data}
      rowKey={(row) => row.id}
      pagination={false}
      {...props}
    />,
  );
}

function bodyRowNames(): string[] {
  const [, body] = screen.getAllByRole("rowgroup"); // [thead, tbody]
  return within(body)
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell")[0].textContent);
}

afterEach(cleanup);

describe("CmDataTable", () => {
  it("renders the column headers", () => {
    renderTable();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Age/ })).toBeInTheDocument();
  });

  it("renders raw values and custom cell renderers", () => {
    renderTable();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("30 yrs")).toBeInTheDocument();
  });

  it("shows the empty state when there is no data", () => {
    renderTable({ data: [] });
    expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
  });

  it("invokes onRowClick with the clicked row", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderTable({ onRowClick });

    await user.click(screen.getByText("Alice"));

    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ name: "Alice" }));
  });

  it("sorts ascending then descending on a sortable header", async () => {
    const user = userEvent.setup();
    renderTable();

    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });

    await user.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(bodyRowNames()).toEqual(["Alice", "Bob", "Charlie"]);

    await user.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(bodyRowNames()).toEqual(["Charlie", "Bob", "Alice"]);
  });
});
