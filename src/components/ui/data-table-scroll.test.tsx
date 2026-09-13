import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmDataTable, type CmDataTableColumn } from "./data-table.js";
import { CmThemeProvider } from "../theme/theme-provider.js";

type Product = { id: string; name: string; stock: number };
const rows: Product[] = [
  { id: "001", name: "Café", stock: 12 },
  { id: "002", name: "Arroz", stock: 8 },
  { id: "003", name: "Açúcar", stock: 4 },
];
const columns: CmDataTableColumn<Product>[] = [
  { key: "name", header: "Produto", hideable: false },
  { key: "stock", header: "Estoque" },
];

function table(props: Partial<Parameters<typeof CmDataTable<Product>>[0]> = {}) {
  return <CmDataTable columns={columns} data={rows} rowKey="id" {...props} />;
}

function observeSize() {
  const observers: Array<{
    callback: ResizeObserverCallback;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  }> = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(readonly callback: ResizeObserverCallback) {
        observers.push(this);
      }
    },
  );
  return {
    observers,
    resize(element: Element, clientWidth: number, scrollWidth: number) {
      Object.defineProperties(element, {
        clientWidth: { configurable: true, value: clientWidth },
        scrollWidth: { configurable: true, value: scrollWidth },
      });
      act(() => {
        for (const observer of observers) {
          observer.callback([], observer as unknown as ResizeObserver);
        }
      });
    },
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("CmDataTable horizontal scrolling", () => {
  it("keeps its toolbar and pagination outside the scrolling table", async () => {
    const user = userEvent.setup();
    const { container } = render(
      table({
        title: "Produtos",
        toolbar: <input aria-label="Filtrar produtos" />,
        actions: <button>Exportar</button>,
        defaultRowsPerPage: 2,
        rowsPerPageOptions: [2, 3],
      }),
    );
    const scroll = container.querySelector(".cm-data-table__scroll")!;
    expect(within(scroll as HTMLElement).getByRole("table")).toBeInTheDocument();
    expect(scroll).not.toContainElement(screen.getByRole("textbox", { name: "Filtrar produtos" }));
    expect(scroll).not.toContainElement(screen.getByRole("button", { name: "Exportar" }));
    expect(scroll).not.toContainElement(screen.getByRole("button", { name: "Próxima" }));
    expect(container.querySelector("table tfoot")).toBeNull();
    expect(screen.getByText("1-2 de 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(screen.getByText("Açúcar")).toBeInTheDocument();
    expect(screen.queryByText("Café")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Linhas por página" }), "3");
    expect(screen.getByText("1-3 de 3")).toBeInTheDocument();
    expect(screen.getByText("Café")).toBeInTheDocument();
  });

  it.each([
    { title: "Produtos", label: undefined, expected: "Produtos" },
    { title: "Produtos", label: "Itens da loja", expected: "Itens da loja" },
    { title: undefined, label: undefined, expected: "Tabela de dados" },
    { title: <strong>Produtos</strong>, label: undefined, expected: "Produtos" },
  ])("names its overflowing region as $expected", ({ title, label, expected }) => {
    const size = observeSize();
    const { container } = render(table({ title, scrollAreaLabel: label }));
    const scroll = container.querySelector(".cm-data-table__scroll")!;
    size.resize(scroll, 320, 1400);
    expect(screen.getByRole("region", { name: expected })).toHaveAttribute("tabindex", "0");
  });

  it("adds a keyboard stop only while there is horizontal overflow and disconnects on unmount", () => {
    const size = observeSize();
    const { container, unmount } = render(table({ scrollAreaLabel: "Produtos" }));
    const scroll = container.querySelector(".cm-data-table__scroll")!;
    expect(scroll).not.toHaveAttribute("tabindex", "0");
    size.resize(scroll, 320, 1400);
    expect(scroll).toHaveAttribute("tabindex", "0");
    size.resize(scroll, 1600, 1600);
    expect(scroll).not.toHaveAttribute("tabindex", "0");
    unmount();
    expect(size.observers.length).toBeGreaterThan(0);
    for (const observer of size.observers) expect(observer.disconnect).toHaveBeenCalled();
  });

  it.each([
    [1400, "1400px"],
    ["90rem", "90rem"],
  ] as const)("accepts minimum table width %s without changing tableClassName", (width, css) => {
    render(table({ tableMinWidth: width, tableClassName: "inventory-columns" }));
    const renderedTable = screen.getByRole("table");
    expect(renderedTable).toHaveClass("inventory-columns");
    expect(renderedTable).toHaveStyle({ minWidth: css });
  });

  it("preserves manual pagination, backend row order, and callbacks", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      table({ manualPagination: true, totalRows: 42, rowsPerPage: 10, page: 2, onPageChange }),
    );
    expect(screen.getByText("11-13 de 42")).toBeInTheDocument();
    expect(within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("keeps the column menu outside the scroll area and applies visibility changes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CmThemeProvider>{table({ tableKey: "unit-scroll-products" })}</CmThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Configurar colunas" }));
    const menu = screen.getByRole("dialog", { name: "Colunas visíveis" });
    expect(container.querySelector(".cm-data-table__scroll")).not.toContainElement(menu);
    await user.click(within(menu).getByRole("checkbox", { name: /Estoque/ }));
    expect(screen.queryByRole("columnheader", { name: "Estoque" })).not.toBeInTheDocument();
    await user.click(within(menu).getByRole("button", { name: "Restaurar padrão" }));
    expect(screen.getByRole("columnheader", { name: "Estoque" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Colunas visíveis" })).not.toBeInTheDocument();
  });

  it("preserves the selected row and its detail panel beside the scrolling region", () => {
    const { container, rerender } = render(
      table({
        selectedRowKey: "002",
        detailPanelEnabled: true,
        renderSelectedRowDetail: (row) => <p>Detalhes: {row.name}</p>,
        detailEmptyMessage: "Selecione um produto",
      }),
    );
    const panel = screen.getByRole("complementary", { name: "Detalhes da linha selecionada" });
    expect(within(panel).getByText("Detalhes: Arroz")).toBeInTheDocument();
    expect(container.querySelector(".cm-data-table__scroll")).not.toContainElement(panel);
    expect(screen.getByText("Arroz").closest("tr")).toHaveAttribute("data-selected");
    rerender(
      table({
        selectedRowKey: "missing",
        detailPanelEnabled: true,
        renderSelectedRowDetail: (row) => <p>Detalhes: {row.name}</p>,
        detailEmptyMessage: "Selecione um produto",
      }),
    );
    expect(within(panel).getByText("Selecione um produto")).toBeInTheDocument();
  });
});
