import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CmCommand } from "./command.js";
import { CmThemeProvider } from "../theme/theme-provider.js";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CmThemeProvider storageKey={false}>{children}</CmThemeProvider>
);

describe("CmCommand keyboard shortcut", () => {
  it.each(["ctrlKey", "metaKey"])("opens with %s and closes with Escape", (modifier) => {
    render(
      <CmCommand
        keyboardShortcut="k"
        title="Buscar documentação"
        items={[{ id: "card", label: "Card" }]}
        trigger={(open) => <button onClick={open}>Buscar</button>}
      />,
      { wrapper },
    );
    fireEvent.keyDown(window, { key: "K", [modifier]: true });
    expect(screen.getByRole("dialog", { name: "Buscar documentação" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("respects another component handling the keyboard event", () => {
    render(
      <CmCommand
        keyboardShortcut="k"
        items={[]}
        trigger={(open) => <button onClick={open}>Buscar</button>}
      />,
      { wrapper },
    );
    const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true });
    event.preventDefault();
    fireEvent(window, event);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("finds Portuguese labels without requiring accents", () => {
    render(
      <CmCommand
        keyboardShortcut="k"
        items={[{ id: "icons", label: "Ícones" }]}
        trigger={(open) => <button onClick={open}>Buscar</button>}
      />,
      { wrapper },
    );
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "icones" } });
    expect(screen.getByRole("option", { name: "Ícones" })).toBeInTheDocument();
  });

  it("offers an input-like semantic button and focuses the real input in a portal", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CmCommand
        title="Buscar documentação"
        placeholder="Pesquisar componentes"
        triggerAppearance="input"
        triggerPlaceholder="Buscar na biblioteca…"
        size="sm"
        items={[{ id: "card", label: "Card" }]}
      />,
      { wrapper },
    );
    const trigger = screen.getByRole("button", { name: "Buscar documentação" });
    expect(trigger).toHaveTextContent("Buscar na biblioteca…");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(container.contains(dialog)).toBe(false);
    expect(screen.getByRole("textbox", { name: "Pesquisar componentes" })).toHaveFocus();
    screen.getByRole("option", { name: "Card" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
