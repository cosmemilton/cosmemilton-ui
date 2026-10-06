import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type AnchorHTMLAttributes } from "react";
import axe from "axe-core";
import { CmMegaMenuSearch } from "./mega-menu-search.js";
import type { CmMegaMenuGroup } from "./mega-menu.js";

afterEach(cleanup);

const groups: CmMegaMenuGroup[] = [
  {
    id: "components",
    label: "Componentes",
    items: [
      { id: "archived", label: "Arquivado", disabled: true },
      { id: "icons", label: "Ícones", description: "Símbolos SVG", keywords: ["pictogramas"] },
      { id: "card", label: "Card", description: "Blocos de conteúdo" },
    ],
  },
  {
    id: "resources",
    label: "Recursos",
    items: [{ id: "themes", label: "Temas", description: "Cores e paletas" }],
  },
];

function expectActive(input: HTMLElement, name: string) {
  const option = screen.getByRole("option", { name, exact: true });
  expect(input).toHaveAttribute("aria-activedescendant", option.id);
  expect(option).toHaveAttribute("aria-selected", "true");
}

describe("CmMegaMenuSearch", () => {
  it("forwards a real input ref/attributes and opens grouped non-modal results in a portal", async () => {
    const actor = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const nativeChange = vi.fn();
    const { container } = render(
      <CmMegaMenuSearch
        ref={ref}
        groups={groups}
        aria-label="Buscar biblioteca"
        name="search"
        data-testid="search"
        onChange={nativeChange}
        columns={3}
        panelWidth="60rem"
        footer={<button type="button">Ajuda da busca</button>}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Buscar biblioteca" });
    expect(ref.current).toBe(input);
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("name", "search");
    expect(input).toHaveAttribute("data-testid", "search");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-controls");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    await actor.click(input);
    const listbox = screen.getByRole("listbox");
    await waitFor(() =>
      expect(listbox.closest(".cm-mega-panel")).toHaveAttribute("data-positioned", "true"),
    );
    expect(container.contains(listbox)).toBe(false);
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getByRole("region", { name: "Resultados de Buscar" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(within(listbox).getByRole("group", { name: "Componentes" })).toBeInTheDocument();
    expect(within(listbox).getByRole("group", { name: "Recursos" })).toBeInTheDocument();
    expect(listbox.contains(screen.getByRole("button", { name: "Ajuda da busca" }))).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    fireEvent.change(input, { target: { value: "svg" } });
    expect(nativeChange).toHaveBeenCalledOnce();
    expect(input).toHaveValue("svg");
    expectActive(input, "Ícones");
  });

  it("matches every accent-insensitive token across label, description, group and keywords", async () => {
    const actor = userEvent.setup();
    render(<CmMegaMenuSearch groups={groups} />);
    const input = screen.getByRole("combobox", { name: "Buscar" });
    await actor.click(input);
    fireEvent.change(input, { target: { value: "  COMPONENTES icones   SVG pictogramas " } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expectActive(input, "Ícones");
    expect(screen.getByRole("status")).toHaveTextContent("1 resultado");
    fireEvent.change(input, { target: { value: "recur palet" } });
    expectActive(input, "Temas");
    fireEvent.change(input, { target: { value: "xyz" } });
    expect(screen.getByRole("option", { name: "Nenhum resultado." })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum resultado.");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("limits suggestions across groups and reports the full match count", async () => {
    const actor = userEvent.setup();
    const view = render(<CmMegaMenuSearch groups={groups} maxResults={2} />);
    const input = screen.getByRole("combobox");
    await actor.click(input);
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("2 resultados de 4");
    view.rerender(<CmMegaMenuSearch groups={groups} maxResults={Infinity} />);
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveTextContent("4 resultados");
  });

  it("skips disabled results, uses DOM order for arrows/Home/End and selects exactly once", async () => {
    const actor = userEvent.setup();
    const action = vi.fn();
    const disabledAction = vi.fn();
    const notify = vi.fn();
    const items = groups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        onSelect: item.disabled ? disabledAction : action,
      })),
    }));
    render(<CmMegaMenuSearch groups={items} onSelect={notify} />);
    const input = screen.getByRole("combobox");
    await actor.click(input);
    expectActive(input, "Ícones");
    await actor.keyboard("{ArrowDown}");
    expectActive(input, "Card");
    await actor.keyboard("{End}");
    expectActive(input, "Temas");
    await actor.keyboard("{ArrowDown}");
    expectActive(input, "Ícones");
    await actor.keyboard("{ArrowUp}");
    expectActive(input, "Temas");
    await actor.keyboard("{Home}{ArrowDown}{Enter}");
    expect(action).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledExactlyOnceWith(items[0].items[2]);
    expect(disabledAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("opens the last enabled result with ArrowUp after Escape without losing the query", async () => {
    const actor = userEvent.setup();
    render(<CmMegaMenuSearch groups={groups} defaultQuery="" />);
    const input = screen.getByRole("combobox");
    await actor.click(input);
    await actor.keyboard("{Escape}");
    await actor.keyboard("{ArrowUp}");
    expectActive(input, "Temas");
    fireEvent.change(input, { target: { value: "ícones" } });
    await actor.keyboard("{Escape}");
    expect(input).toHaveValue("ícones");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input).toHaveFocus();
  });

  it("keeps keyboard selection during scrolling until the pointer actually moves", async () => {
    const actor = userEvent.setup();
    render(<CmMegaMenuSearch groups={groups} />);
    const input = screen.getByRole("combobox");
    await actor.click(input);
    const card = screen.getByRole("option", { name: "Card" });
    fireEvent.mouseMove(card, { clientX: 80, clientY: 120 });
    expectActive(input, "Card");
    await actor.keyboard("{End}");
    expectActive(input, "Temas");
    fireEvent.mouseEnter(card, { clientX: 80, clientY: 120 });
    fireEvent.mouseMove(card, { clientX: 80, clientY: 120 });
    expectActive(input, "Temas");
    fireEvent.mouseMove(card, { clientX: 81, clientY: 120 });
    expectActive(input, "Card");
  });

  it.each(["ctrlKey", "metaKey"])(
    "focuses the real input and opens with %s without a dialog",
    (modifier) => {
      render(<CmMegaMenuSearch groups={groups} keyboardShortcut="k" />);
      const input = screen.getByRole("combobox");
      fireEvent.keyDown(window, { key: "K", [modifier]: true });
      expect(input).toHaveFocus();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).toBeNull();
      fireEvent.keyDown(input, { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(input).toHaveFocus();
    },
  );

  it("lets Tab leave, closes on outside click and returns footer Escape focus without reopening", async () => {
    const actor = userEvent.setup();
    render(
      <>
        <CmMegaMenuSearch groups={groups} footer={<button type="button">Ajuda</button>} />
        <button type="button">Próxima ação</button>
      </>,
    );
    const input = screen.getByRole("combobox");
    const next = screen.getByRole("button", { name: "Próxima ação" });
    await actor.click(input);
    await actor.tab();
    expect(next).toHaveFocus();
    expect(screen.queryByRole("listbox")).toBeNull();
    await actor.click(input);
    const region = screen.getByRole("region", { name: "Resultados de Buscar" });
    region.focus();
    expect(region).toHaveFocus();
    await actor.keyboard("{Escape}");
    expect(input).toHaveFocus();
    expect(screen.queryByRole("listbox")).toBeNull();
    await actor.click(input);
    await actor.click(screen.getByRole("button", { name: "Ajuda" }));
    await actor.keyboard("{Escape}");
    expect(input).toHaveFocus();
    expect(screen.queryByRole("listbox")).toBeNull();
    await actor.click(input);
    await actor.click(next);
    expect(next).toHaveFocus();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("requests controlled changes while keeping the consumer's query/open authoritative", () => {
    const queryChange = vi.fn();
    const openChange = vi.fn();
    const view = render(
      <CmMegaMenuSearch
        groups={groups}
        query=""
        open={false}
        onQueryChange={queryChange}
        onOpenChange={openChange}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "svg" } });
    expect(queryChange).toHaveBeenCalledExactlyOnceWith("svg");
    expect(openChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox")).toBeNull();
    view.rerender(
      <CmMegaMenuSearch
        groups={groups}
        query="svg"
        open={true}
        onQueryChange={queryChange}
        onOpenChange={openChange}
      />,
    );
    expectActive(input, "Ícones");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(openChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input).toHaveValue("svg");
  });

  it("ignores Enter during IME composition", async () => {
    const actor = userEvent.setup();
    const select = vi.fn();
    render(
      <CmMegaMenuSearch
        groups={[
          { id: "one", label: "Ações", items: [{ id: "card", label: "Card", onSelect: select }] },
        ]}
      />,
    );
    const input = screen.getByRole("combobox");
    await actor.click(input);
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    expect(select).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).toHaveBeenCalledOnce();
  });

  it("keeps adapted links native and prevents duplicate href navigation for callback actions", async () => {
    const actor = userEvent.setup();
    const action = vi.fn();
    const notify = vi.fn();
    function LinkAdapter({
      children,
      ...props
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
      return (
        <a {...props} data-adapter="true">
          {children}
        </a>
      );
    }
    render(
      <CmMegaMenuSearch
        linkComponent={LinkAdapter}
        onSelect={notify}
        groups={[
          {
            id: "links",
            label: "Links",
            items: [
              { id: "native", label: "Destino nativo", href: "#native", target: "_blank" },
              { id: "callback", label: "Destino por ação", href: "#ignored", onSelect: action },
              {
                id: "disabled",
                label: "Indisponível",
                href: "#disabled",
                disabled: true,
                onSelect: action,
              },
            ],
          },
        ]}
      />,
    );
    const input = screen.getByRole("combobox");
    await actor.click(input);
    const native = screen.getByRole("option", { name: "Destino nativo" });
    expect(native.tagName).toBe("A");
    expect(native).toHaveAttribute("href", "#native");
    expect(native).toHaveAttribute("target", "_blank");
    expect(native).toHaveAttribute("rel", "noopener noreferrer");
    expect(native).toHaveAttribute("data-adapter", "true");
    expect(fireEvent.click(native)).toBe(true);
    expect(action).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledOnce();
    await actor.click(input);
    expect(fireEvent.click(screen.getByRole("option", { name: "Destino por ação" }))).toBe(false);
    expect(action).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledTimes(2);
    await actor.click(input);
    await actor.click(screen.getByRole("option", { name: "Indisponível" }));
    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("passes all supported axe rules with grouped matches and an empty query result", async () => {
    const actor = userEvent.setup();
    render(
      <main>
        <CmMegaMenuSearch groups={groups} />
      </main>,
    );
    const input = screen.getByRole("combobox");
    await actor.click(input);
    for (const query of ["", "zzzz"]) {
      fireEvent.change(input, { target: { value: query } });
      const result = await axe.run(document.body, {
        rules: {
          // jsdom has no layout/canvas; all contrast checks run in the browser suite.
          "color-contrast": { enabled: false },
        },
      });
      expect(
        result.violations.flatMap(({ id, nodes }) => nodes.map(({ html }) => `${id}: ${html}`)),
      ).toEqual([]);
    }
  });
});
