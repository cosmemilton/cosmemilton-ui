import { readFileSync } from "node:fs";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmDataTable, CmDataTableActions, type CmDataTableColumn } from "./data-table.js";

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

  describe("action alignment", () => {
    const stylesheet = document.createElement("style");

    beforeAll(() => {
      stylesheet.textContent = readFileSync("src/styles/14-data-table.css", "utf8");
      document.head.appendChild(stylesheet);
    });

    afterAll(() => stylesheet.remove());

    it.each([
      ["left", "flex-start"],
      ["center", "center"],
      ["right", "flex-end"],
    ] as const)("aligns the action group with its %s column", (align, justifyContent) => {
      renderTable({
        data: data.slice(0, 1),
        columns: [
          {
            key: "actions",
            header: "Actions",
            align,
            render: () => (
              <CmDataTableActions data-testid="row-actions">
                <button>Edit</button>
              </CmDataTableActions>
            ),
          },
        ],
      });

      expect(screen.getByRole("columnheader", { name: "Actions" })).toHaveClass(
        `cm-data-table__cell--${align}`,
      );
      expect(getComputedStyle(screen.getByTestId("row-actions")).justifyContent).toBe(
        justifyContent,
      );
    });

    it("keeps unaligned row actions and toolbar actions at the right", () => {
      renderTable({
        data: data.slice(0, 1),
        actions: <button>Export</button>,
        columns: [
          {
            key: "actions",
            header: "Actions",
            render: () => (
              <CmDataTableActions data-testid="row-actions">
                <button>Edit</button>
              </CmDataTableActions>
            ),
          },
        ],
      });

      expect(getComputedStyle(screen.getByTestId("row-actions")).justifyContent).toBe("flex-end");
      const toolbarActions = screen.getByRole("button", { name: "Export" }).parentElement!;
      expect(getComputedStyle(toolbarActions).justifyContent).toBe("flex-end");
    });
  });

  describe("rowKey as field name", () => {
    it("renders all rows with rowKey as a string field", () => {
      renderTable({ rowKey: "id" });
      expect(bodyRowNames()).toEqual(["Charlie", "Alice", "Bob"]);
    });

    it("matches selectedRowKey against the field value", () => {
      renderTable({ rowKey: "id", selectedRowKey: "2" });
      const aliceRow = screen.getByText("Alice").closest("tr");
      expect(aliceRow).toHaveAttribute("data-selected");
      expect(screen.getByText("Charlie").closest("tr")).not.toHaveAttribute("data-selected");
    });

    it("stringifies non-string field values", () => {
      renderTable({ rowKey: "age", selectedRowKey: "25" });
      const aliceRow = screen.getByText("Alice").closest("tr");
      expect(aliceRow).toHaveAttribute("data-selected");
    });
  });

  describe("server-side mode", () => {
    it("does not reorder rows with manualSorting, only emits onSortChange", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      renderTable({ manualSorting: true, onSortChange });

      const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
      await user.click(nameHeader);

      // order is preserved (backend would re-fetch); only the event fires
      expect(bodyRowNames()).toEqual(["Charlie", "Alice", "Bob"]);
      expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
      expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    });

    it("uses totalRows for the page count and renders data as the current page", () => {
      renderTable({
        manualPagination: true,
        pagination: true,
        totalRows: 42,
        rowsPerPage: 10,
        page: 1,
      });
      // all 3 provided rows are shown (no client slicing)
      expect(bodyRowNames()).toEqual(["Charlie", "Alice", "Bob"]);
      // range label reflects the server total
      expect(screen.getByText(/de 42/)).toBeInTheDocument();
    });

    it("emits onPageChange when navigating in controlled mode", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      renderTable({
        manualPagination: true,
        pagination: true,
        totalRows: 42,
        rowsPerPage: 10,
        page: 1,
        onPageChange,
      });

      await user.click(screen.getByRole("button", { name: /Próxima/ }));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("shows the loading message instead of the empty state", () => {
      renderTable({ data: [], loading: true, loadingMessage: "Buscando…" });
      expect(screen.getByText("Buscando…")).toBeInTheDocument();
      expect(screen.queryByText("Nenhum registro encontrado")).not.toBeInTheDocument();
    });
  });
});
