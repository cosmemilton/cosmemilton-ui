import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmUserMenu } from "./user-menu.js";

const user = {
  title: "Ana Beatriz",
  subtitle: "Administradora",
  email: "ana@example.test",
  initials: "AB",
};

const items = [{ id: "account", label: "Minha conta" }];

afterEach(cleanup);

describe("CmUserMenu", () => {
  it("preserves the default pill trigger and avatar header", async () => {
    const actor = userEvent.setup();
    render(<CmUserMenu user={user} items={items} menuHeader="always" />);
    const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });

    expect(trigger).toHaveClass("cm-button--shape-pill", "cm-button--ghost");
    expect(within(trigger).getByText("Ana Beatriz")).toBeInTheDocument();
    expect(within(trigger).getByText("Administradora")).toBeInTheDocument();
    expect(trigger.querySelector(".cm-user-menu__trigger-chevron")).toBeNull();
    await actor.click(trigger);
    expect(screen.getByRole("menu").querySelector(".cm-avatar")).not.toBeNull();
  });

  it("preserves compact defaults with hidden trigger text and visible header", async () => {
    const actor = userEvent.setup();
    render(<CmUserMenu user={user} items={items} presentation="compact" />);
    const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });

    expect(trigger).toHaveClass("cm-user-menu__trigger--compact", "cm-button--surface");
    expect(trigger.querySelector(".cm-user-menu__trigger-text")).toBeNull();
    await actor.click(trigger);
    expect(
      screen.getByRole("menu").querySelector(".cm-user-menu__menu-header--visible"),
    ).not.toBeNull();
  });

  it("renders slim as a single accessible button with a decorative chevron", async () => {
    const actor = userEvent.setup();
    render(<CmUserMenu user={user} items={items} presentation="slim" />);
    const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });

    expect(trigger).toHaveClass("cm-user-menu__trigger--slim", "cm-button--plain");
    expect(trigger).not.toHaveClass("cm-button--shape-pill");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.querySelectorAll("button")).toHaveLength(0);
    expect(trigger.querySelector(".cm-user-menu__trigger-chevron")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(within(trigger).getByText("Ana Beatriz")).toBeInTheDocument();
    expect(within(trigger).getByText("Administradora")).toBeInTheDocument();

    await actor.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu").parentElement).toHaveClass("cm-user-menu__popover--slim");
  });

  it("honors explicit sizes, visibility and custom class props in slim", async () => {
    const actor = userEvent.setup();
    render(
      <CmUserMenu
        user={user}
        items={items}
        presentation="slim"
        size="lg"
        avatarSize="xl"
        showTitle={false}
        showSubtitle={false}
        showChevron={false}
        menuHeader="never"
        triggerClassName="custom-trigger"
        menuClassName="custom-menu"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });

    expect(trigger).toHaveClass(
      "cm-button--lg",
      "custom-trigger",
      "cm-user-menu__trigger--slim-no-chevron",
    );
    expect(trigger).not.toHaveClass("cm-user-menu__trigger--slim-avatar-auto");
    expect(trigger.querySelector(".cm-avatar")).toHaveClass("cm-avatar--xl");
    expect(trigger.querySelector(".cm-user-menu__trigger-chevron")).toBeNull();
    expect(trigger.querySelector(".cm-user-menu__trigger-text")).toBeNull();
    await actor.click(trigger);
    expect(screen.getByRole("menu").parentElement).toHaveClass("custom-menu");
    expect(screen.getByRole("menu").querySelector(".cm-user-menu__menu-header")).toBeNull();
  });

  it("shows compact identity text and an icon without duplicating the avatar in slim headers", async () => {
    const actor = userEvent.setup();
    render(<CmUserMenu user={user} items={items} presentation="slim" menuHeader="always" />);
    await actor.click(screen.getByRole("button", { name: "Ana Beatriz, Administradora" }));
    const menu = screen.getByRole("menu");

    expect(menu.querySelector(".cm-avatar")).toBeNull();
    expect(menu.querySelector(".cm-user-menu__menu-header-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(within(menu).getByText("Ana Beatriz")).toBeInTheDocument();
    expect(within(menu).getByText("Administradora")).toBeInTheDocument();
    expect(within(menu).getByText("ana@example.test")).toBeInTheDocument();
  });

  it("selects an enabled item and closes, while disabled items remain inert", async () => {
    const actor = userEvent.setup();
    const select = vi.fn();
    const disabledSelect = vi.fn();
    render(
      <CmUserMenu
        user={user}
        presentation="slim"
        items={[
          { id: "disabled", label: "Indisponível", disabled: true, onSelect: disabledSelect },
          { id: "account", label: "Minha conta", onSelect: select },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });
    await actor.click(trigger);
    await actor.click(screen.getByRole("menuitem", { name: "Indisponível" }));
    expect(disabledSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await actor.click(screen.getByRole("menuitem", { name: "Minha conta" }));
    expect(select).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it.each(["default", "compact", "slim"] as const)(
    "moves focus into the %s menu and restores focus on Escape",
    async (presentation) => {
      const actor = userEvent.setup();
      render(<CmUserMenu user={user} items={items} presentation={presentation} />);
      const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });
      trigger.focus();
      await actor.keyboard("{Enter}");
      expect(screen.getByRole("menuitem", { name: "Minha conta" })).toHaveFocus();
      await actor.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).toBeNull();
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    },
  );

  it("opens with ArrowDown and moves among enabled items with arrows, Home and End", async () => {
    const actor = userEvent.setup();
    render(
      <CmUserMenu
        user={user}
        items={[
          { id: "unavailable", label: "Indisponível", disabled: true },
          ...items,
          { type: "separator", id: "separator" },
          { id: "logout", label: "Sair" },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });
    trigger.focus();
    await actor.keyboard("{ArrowDown}");
    const first = screen.getByRole("menuitem", { name: "Minha conta" });
    const last = screen.getByRole("menuitem", { name: "Sair" });
    expect(first).toHaveFocus();
    await actor.keyboard("{ArrowUp}");
    expect(last).toHaveFocus();
    await actor.keyboard("{ArrowDown}");
    expect(first).toHaveFocus();
    await actor.keyboard("{End}");
    expect(last).toHaveFocus();
    await actor.keyboard("{Home}");
    expect(first).toHaveFocus();
  });

  it.each([false, true])(
    "closes on Tab with shiftKey=%s and lets native traversal continue from the trigger",
    async (shiftKey) => {
      const actor = userEvent.setup();
      render(<CmUserMenu user={user} items={items} />);
      const trigger = screen.getByRole("button", { name: "Ana Beatriz, Administradora" });
      await actor.click(trigger);
      const account = screen.getByRole("menuitem", { name: "Minha conta" });
      expect(account).toHaveFocus();
      expect(fireEvent.keyDown(account, { key: "Tab", shiftKey })).toBe(true);
      expect(screen.queryByRole("menu")).toBeNull();
      expect(trigger).toHaveFocus();
    },
  );

  it("restores trigger focus before selecting and preserves focus set by the action", async () => {
    const actor = userEvent.setup();
    const select = vi.fn(() => {
      expect(screen.getByRole("button", { name: "Ana Beatriz, Administradora" })).toHaveFocus();
      screen.getByRole("textbox", { name: "Nome" }).focus();
    });
    render(
      <>
        <CmUserMenu user={user} items={[{ ...items[0], onSelect: select }]} />
        <input aria-label="Nome" />
      </>,
    );
    await actor.click(screen.getByRole("button", { name: "Ana Beatriz, Administradora" }));
    await actor.keyboard("{Enter}");
    expect(select).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveFocus();
  });

  it("closes slim on an outside click without selecting an item", async () => {
    const actor = userEvent.setup();
    const select = vi.fn();
    render(
      <>
        <button type="button">Fora do menu</button>
        <CmUserMenu
          user={user}
          items={[{ id: "account", label: "Minha conta", onSelect: select }]}
          presentation="slim"
        />
      </>,
    );
    await actor.click(screen.getByRole("button", { name: "Ana Beatriz, Administradora" }));
    await actor.click(screen.getByRole("button", { name: "Fora do menu" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(select).not.toHaveBeenCalled();
  });
});
