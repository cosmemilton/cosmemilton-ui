import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { CmMegaMenu, type CmMegaMenuAnchorProps, type CmMegaMenuItem } from "./mega-menu.js";

afterEach(cleanup);

const makeItems = (select = vi.fn()): CmMegaMenuItem[] => [
  {
    id: "products",
    label: "Produtos",
    icon: <svg data-testid="product-icon" />,
    groups: [
      {
        id: "platform",
        label: "Plataforma",
        items: [
          { id: "disabled", label: "Em breve", href: "/soon", disabled: true, onSelect: select },
          {
            id: "projects",
            label: "Projetos",
            href: "/projects",
            description: "Organize o trabalho",
            badge: "Novo",
          },
          { id: "action", label: "Criar projeto", onSelect: select },
        ],
      },
      {
        id: "team",
        label: "Equipe",
        items: [
          { id: "members", label: "Membros", href: "/members", target: "_blank" },
          { id: "settings", label: "Configurações", onSelect: select },
        ],
      },
    ],
  },
  { id: "disabled-root", label: "Indisponível", href: "/unavailable", disabled: true },
  { id: "about", label: "Sobre", href: "/about" },
  {
    id: "help",
    label: "Ajuda",
    groups: [
      {
        id: "support",
        label: "Suporte",
        items: [{ id: "contact", label: "Contato", onSelect: select }],
      },
    ],
  },
];

const getPanel = () => document.querySelector<HTMLElement>(".cm-mega-panel");

describe("CmMegaMenu", () => {
  it("opens grouped native navigation in a portal and forwards nav attributes/ref", async () => {
    const actor = userEvent.setup();
    const ref = createRef<HTMLElement>();
    const view = render(
      <CmMegaMenu
        ref={ref}
        items={makeItems()}
        aria-label="Biblioteca"
        data-testid="navigation"
        activeHref="/projects"
        panelHeader="Explore"
        panelFooter="Documentação"
        columns={3}
        panelWidth="60rem"
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Biblioteca" });
    expect(ref.current).toBe(nav);
    expect(nav).toHaveClass("cm-mega-menu--surface");
    const trigger = screen.getByRole("button", { name: "Produtos" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await actor.click(trigger);
    await waitFor(() => expect(getPanel()).toHaveAttribute("data-positioned", "true"));
    const panel = getPanel()!;
    expect(view.container.contains(panel)).toBe(false);
    expect(document.body.contains(panel)).toBe(true);
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("role", "group");
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    expect(panel.style.getPropertyValue("--cm-mega-panel-width")).toBe("60rem");
    expect(panel.style.getPropertyValue("--cm-mega-panel-columns")).toBe("3");
    expect(within(panel).getByRole("heading", { name: "Plataforma" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /Projetos/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(panel).getByRole("link", { name: "Membros" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(panel.querySelector(".cm-mega-panel__header")).toHaveTextContent("Explore");
    expect(panel.querySelector(".cm-mega-panel__footer")).toHaveTextContent("Documentação");
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps disabled destinations inert, selects actions once and restores trigger focus", async () => {
    const actor = userEvent.setup();
    const select = vi.fn();
    render(<CmMegaMenu items={makeItems(select)} />);
    const trigger = screen.getByRole("button", { name: "Produtos" });
    await actor.click(trigger);
    const disabled = screen.getByRole("link", { name: "Em breve" });
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled).not.toHaveAttribute("href");
    await actor.click(disabled);
    expect(select).not.toHaveBeenCalled();
    expect(getPanel()).not.toBeNull();
    await actor.click(screen.getByRole("button", { name: "Criar projeto" }));
    expect(select).toHaveBeenCalledOnce();
    expect(getPanel()).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("supports controlled openItem and swaps the active trigger without stale anchoring", async () => {
    const actor = userEvent.setup();
    const change = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState<string | null>(null);
      return (
        <CmMegaMenu
          items={makeItems()}
          openItem={open}
          onOpenChange={(next) => {
            change(next);
            setOpen(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await actor.click(screen.getByRole("button", { name: "Produtos" }));
    expect(change).toHaveBeenLastCalledWith("products");
    await actor.click(screen.getByRole("button", { name: "Ajuda" }));
    expect(change).toHaveBeenLastCalledWith("help");
    await waitFor(() => expect(getPanel()).toHaveAttribute("data-positioned", "true"));
    expect(screen.queryByRole("heading", { name: "Plataforma" })).toBeNull();
    expect(getPanel()).toHaveAttribute(
      "aria-labelledby",
      screen.getByRole("button", { name: "Ajuda" }).id,
    );
    await actor.keyboard("{Escape}");
    expect(change).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("button", { name: "Ajuda" })).toHaveFocus();
  });

  it("opens the first/last enabled item with arrows and moves between groups", async () => {
    const actor = userEvent.setup();
    render(
      <CmMegaMenu items={makeItems()} panelHeader={<button type="button">Cabeçalho</button>} />,
    );
    const trigger = screen.getByRole("button", { name: "Produtos" });
    trigger.focus();
    await actor.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("link", { name: /Projetos/ })).toHaveFocus());
    await actor.keyboard("{ArrowRight}");
    expect(screen.getByRole("link", { name: "Membros" })).toHaveFocus();
    await actor.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Configurações" })).toHaveFocus();
    await actor.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: /Projetos/ })).toHaveFocus();
    await actor.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    await actor.keyboard("{ArrowUp}");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Configurações" })).toHaveFocus(),
    );
  });

  it("bridges native Tab order across the portal including header/footer, then exits", async () => {
    const actor = userEvent.setup();
    render(
      <>
        <button type="button">Antes</button>
        <CmMegaMenu
          items={makeItems()}
          panelHeader={<button type="button">Cabeçalho</button>}
          panelFooter={<button type="button">Rodapé</button>}
        />
        <button type="button">Depois</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Produtos" });
    await actor.click(trigger);
    await waitFor(() => expect(getPanel()).toHaveAttribute("data-positioned", "true"));
    await actor.tab();
    expect(screen.getByRole("button", { name: "Cabeçalho" })).toHaveFocus();
    await actor.tab();
    expect(screen.getByRole("link", { name: /Projetos/ })).toHaveFocus();
    screen.getByRole("button", { name: "Rodapé" }).focus();
    await actor.tab();
    expect(getPanel()).toBeNull();
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveFocus();
    await actor.click(trigger);
    await actor.tab();
    await waitFor(() => expect(screen.getByRole("button", { name: "Cabeçalho" })).toHaveFocus());
    await actor.tab({ shift: true });
    expect(getPanel()).toBeNull();
    expect(trigger).toHaveFocus();
    await actor.click(trigger);
    await actor.tab({ shift: true });
    expect(getPanel()).toBeNull();
    expect(screen.getByRole("button", { name: "Antes" })).toHaveFocus();
  });

  it("honors link adapters without intercepting native navigation", async () => {
    const actor = userEvent.setup();
    const selected = vi.fn();
    const adapted = vi.fn();
    function Adapter(props: CmMegaMenuAnchorProps) {
      adapted(props.href);
      return (
        <a
          {...props}
          href={props.href}
          data-adapted="true"
          onClick={(event) => {
            event.preventDefault();
            props.onClick?.(event);
          }}
        >
          {props.children}
        </a>
      );
    }
    render(
      <CmMegaMenu
        items={[{ id: "docs", label: "Docs", href: "/docs", onSelect: selected }]}
        linkComponent={Adapter}
        variant="ghost"
      />,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-adapted", "true");
    await actor.click(link);
    expect(selected).toHaveBeenCalledOnce();
    expect(adapted).toHaveBeenCalledWith("/docs");
  });

  it("skips hidden and inert slot controls when bridging Tab through the portal", async () => {
    const actor = userEvent.setup();
    render(
      <>
        <CmMegaMenu
          items={makeItems()}
          panelHeader={
            <>
              <div style={{ display: "none" }}>
                <button type="button">Display oculto</button>
              </div>
              <div style={{ visibility: "hidden" }}>
                <button type="button">Visibilidade oculta</button>
              </div>
              <div inert>
                <button type="button">Inerte</button>
              </div>
              <button type="button">Cabeçalho visível</button>
            </>
          }
          panelFooter={
            <>
              <button type="button">Rodapé visível</button>
              <div style={{ display: "none" }}>
                <button type="button">Rodapé oculto</button>
              </div>
            </>
          }
        />
        <button type="button">Depois</button>
      </>,
    );
    await actor.click(screen.getByRole("button", { name: "Produtos" }));
    await waitFor(() => expect(getPanel()).toHaveAttribute("data-positioned", "true"));
    await actor.tab();
    expect(screen.getByRole("button", { name: "Cabeçalho visível" })).toHaveFocus();
    await actor.tab();
    expect(screen.getByRole("link", { name: /Projetos/ })).toHaveFocus();
    screen.getByRole("button", { name: "Rodapé visível" }).focus();
    await actor.tab();
    expect(getPanel()).toBeNull();
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveFocus();
  });

  it("dismisses outside without selecting and navigates the vertical root with arrows", async () => {
    const actor = userEvent.setup();
    const selected = vi.fn();
    render(
      <>
        <CmMegaMenu
          items={makeItems(selected)}
          orientation="vertical"
          variant="glass"
          size="sm"
          defaultOpenItem="products"
          start="Marca"
          end="Conta"
        />
        <button type="button">Fora</button>
      </>,
    );
    await waitFor(() => expect(getPanel()).toHaveAttribute("data-positioned", "true"));
    expect(screen.getByRole("navigation")).toHaveClass(
      "cm-mega-menu--vertical",
      "cm-mega-menu--glass",
      "cm-glass",
      "cm-mega-menu--sm",
    );
    await actor.click(screen.getByRole("button", { name: "Fora" }));
    expect(getPanel()).toBeNull();
    expect(selected).not.toHaveBeenCalled();
    screen.getByRole("button", { name: "Produtos" }).focus();
    await actor.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveFocus();
    await actor.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Ajuda" })).toHaveFocus();
    await actor.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("button", { name: "Contato" })).toHaveFocus());
  });
});
