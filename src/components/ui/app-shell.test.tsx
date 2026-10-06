import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLayoutEffect } from "react";
import { CmAppShell } from "./app-shell.js";

describe("CmAppShell", () => {
  afterEach(() => vi.restoreAllMocks());
  it("renders sidebar, topbar and content slots", () => {
    render(
      <CmAppShell sidebar={<nav>menu</nav>} topbar={<header>top</header>}>
        <p>conteúdo</p>
      </CmAppShell>,
    );
    // The sidebar slot renders twice: desktop aside and mobile drawer.
    expect(screen.getAllByText("menu")).not.toHaveLength(0);
    expect(screen.getByText("top")).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("publishes density as data-density so it cascades to descendants", () => {
    const { container } = render(<CmAppShell density="compact">conteúdo</CmAppShell>);
    const shell = container.querySelector(".cm-app-shell");
    expect(shell).toHaveAttribute("data-density", "compact");
    expect(shell).toHaveClass("cm-density-compact");
  });

  it("omits data-density without an explicit density", () => {
    const { container } = render(<CmAppShell>conteúdo</CmAppShell>);
    expect(container.querySelector(".cm-app-shell")).not.toHaveAttribute("data-density");
  });

  it("omits data-density for the default density", () => {
    const { container } = render(<CmAppShell density="default">conteúdo</CmAppShell>);
    expect(container.querySelector(".cm-app-shell")).not.toHaveAttribute("data-density");
  });

  it("does not set the content padding variable without contentPadding", () => {
    const { container } = render(<CmAppShell>conteúdo</CmAppShell>);
    const shell = container.querySelector<HTMLElement>(".cm-app-shell");
    expect(shell?.style.getPropertyValue("--cm-app-shell-content-padding")).toBe("");
  });

  it("resolves a contentPadding token to the matching spacing variable", () => {
    const { container } = render(<CmAppShell contentPadding="md">conteúdo</CmAppShell>);
    const shell = container.querySelector<HTMLElement>(".cm-app-shell");
    expect(shell?.style.getPropertyValue("--cm-app-shell-content-padding")).toBe(
      "var(--space-md, 1rem)",
    );
  });

  it("treats a numeric contentPadding as px", () => {
    const { container } = render(<CmAppShell contentPadding={24}>conteúdo</CmAppShell>);
    const shell = container.querySelector<HTMLElement>(".cm-app-shell");
    expect(shell?.style.getPropertyValue("--cm-app-shell-content-padding")).toBe("24px");
  });

  it("moves keyboard focus to the main content through its skip link", async () => {
    render(
      <CmAppShell contentId="content" skipLinkLabel="Pular para conteúdo">
        <p>Content</p>
      </CmAppShell>,
    );
    await userEvent.click(screen.getByRole("link", { name: "Pular para conteúdo" }));
    expect(screen.getByRole("main")).toHaveFocus();
    expect(screen.getByRole("main")).toHaveAttribute("id", "content");
  });

  it("traps mobile menu focus, closes with Escape and restores the trigger", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => true,
    }));
    render(
      <CmAppShell
        sidebar={
          <nav>
            <a href="/one">One</a>
            <a href="/two">Two</a>
          </nav>
        }
      >
        <button>Content action</button>
      </CmAppShell>,
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("button", { name: "Fechar menu" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole("link", { name: "Two" })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Fechar menu" })).toHaveFocus();
    expect(screen.getByRole("main").parentElement).toHaveAttribute("inert");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("main").parentElement).not.toHaveAttribute("inert");
  });

  it("keeps a controlled closed mobile menu inert", () => {
    const { container } = render(
      <CmAppShell mobileSidebarOpen={false} sidebar={<a href="/">Home</a>}>
        Content
      </CmAppShell>,
    );
    expect(container.querySelector(".cm-app-shell__mobile-layer")).toHaveAttribute("inert");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves restored scroll on mount and resets it only when the route key changes", () => {
    function RestoredShell({ route }: { route: string }) {
      useLayoutEffect(() => {
        // Browser restoration or a user click can scroll server-rendered content before hydration effects.
        screen.getByRole("main").scrollTop = 240;
      }, []);
      return <CmAppShell contentKey={route}>{route}</CmAppShell>;
    }
    const { rerender } = render(<RestoredShell route="one" />);
    expect(screen.getByRole("main").scrollTop).toBe(240);
    rerender(<RestoredShell route="two" />);
    expect(screen.getByRole("main").scrollTop).toBe(0);
  });
});
