import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmThemeProvider, useCmTheme } from "./theme-provider.js";
import { defaultTheme } from "../../lib/theme/index.js";
import type { ThemeConfig } from "../../lib/theme/index.js";

const customTheme: ThemeConfig = {
  ...defaultTheme,
  name: "acme-brand",
  colors: { ...defaultTheme.colors, primary: "#ff0000" },
};

function ThemeSwitcher({ to }: { to: string }) {
  const { setThemeByName } = useCmTheme();
  return (
    <button type="button" onClick={() => setThemeByName(to)}>
      switch
    </button>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-cm-skin");
  document.documentElement.removeAttribute("data-cm-chrome");
  document.documentElement.removeAttribute("style");
  document.getElementById("cm-theme-custom")?.remove();
});

describe("CmThemeProvider", () => {
  it("keeps the classic appearance unless the application explicitly opts in", () => {
    window.localStorage.setItem("cm-skin", "horizonte");
    render(
      <CmThemeProvider>
        <span>app</span>
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "classic");
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-light");
  });

  it("applies and removes the opted-in skin at the document root, covering portals", () => {
    function Appearance() {
      return <span>{useCmTheme().skin}</span>;
    }
    const { rerender } = render(
      <CmThemeProvider skin="horizonte" defaultThemeName="cm-v4-light">
        <Appearance />
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "horizonte");
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-light");
    expect(screen.getByText("horizonte")).toBeInTheDocument();
    rerender(
      <CmThemeProvider skin="classic">
        <Appearance />
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "classic");
    expect(screen.getByText("classic")).toBeInTheDocument();
  });

  it("switches V4 palettes without changing the selected skin", async () => {
    const user = userEvent.setup();
    render(
      <CmThemeProvider skin="horizonte" defaultThemeName="cm-v4-light" chrome="inverted">
        <ThemeSwitcher to="cm-v4-dark" />
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-chrome", "inverted");
    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-dark");
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "horizonte");
    expect(document.documentElement).toHaveAttribute("data-cm-chrome", "surface");
    expect(window.localStorage.getItem("cm-theme")).toBe("cm-v4-dark");
  });

  it("uses colorScheme to prevent inverted chrome on consumer dark themes", () => {
    render(
      <CmThemeProvider
        customThemes={[{ ...customTheme, colorScheme: "dark" }]}
        defaultThemeName="acme-brand"
        chrome="inverted"
      >
        <span>app</span>
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-chrome", "surface");
  });

  it("applies the theme as a data-theme attribute without inline token styles", () => {
    render(
      <CmThemeProvider>
        <span>app</span>
      </CmThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("cm-v4-light");
    // Inline custom properties on <html> would outrank consumer stylesheets.
    expect(document.documentElement.style.getPropertyValue("--color-background")).toBe("");
    expect(document.documentElement.style.length).toBe(0);
  });

  it("switches themes by flipping the attribute and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <CmThemeProvider>
        <ThemeSwitcher to="cm-v4-dark" />
      </CmThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("cm-v4-dark");
    expect(window.localStorage.getItem("cm-theme")).toBe("cm-v4-dark");
    expect(document.documentElement.style.length).toBe(0);
  });

  it("ignores persisted V3 theme names and starts with the new Claro palette", () => {
    window.localStorage.setItem("cm-theme", "cm-horizonte-dark");
    render(
      <CmThemeProvider>
        <span>V4</span>
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-light");
    expect(localStorage.getItem("cm-theme")).toBe("cm-v4-light");
  });

  it("injects custom theme tokens once as a style tag in head", async () => {
    const user = userEvent.setup();
    render(
      <CmThemeProvider customThemes={[customTheme]}>
        <ThemeSwitcher to="acme-brand" />
      </CmThemeProvider>,
    );
    const style = document.getElementById("cm-theme-custom");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain(':root[data-theme="acme-brand"][data-theme]');
    expect(style!.textContent).toContain("--color-primary: #ff0000;");

    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("acme-brand");
    expect(document.querySelectorAll("#cm-theme-custom")).toHaveLength(1);
  });

  it("restores the persisted theme on mount", () => {
    window.localStorage.setItem("cm-theme", "cm-v4-dark");
    render(
      <CmThemeProvider>
        <span>app</span>
      </CmThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("cm-v4-dark");
  });
});

it("keeps a controlled theme authoritative and reports requested changes", async () => {
  const changed = vi.fn();
  const view = render(
    <CmThemeProvider themeName="cm-v4-aurora" onThemeChange={changed} storageKey={false}>
      <ThemeSwitcher to="cm-v4-dark" />
    </CmThemeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "switch" }));
  expect(changed).toHaveBeenCalledWith("cm-v4-dark");
  expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-aurora");
  view.rerender(
    <CmThemeProvider themeName="cm-v4-dark" onThemeChange={changed} storageKey={false}>
      <ThemeSwitcher to="cm-v4-dark" />
    </CmThemeProvider>,
  );
  expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-dark");
  expect(localStorage.getItem("cm-theme")).toBeNull();
});
it("isolates application preferences without replacing another application's theme", () => {
  localStorage.setItem("cm-theme", "cm-rose");
  localStorage.setItem("app-theme", "cm-v4-aurora");
  render(
    <CmThemeProvider storageKey="app-theme">
      <span>isolated</span>
    </CmThemeProvider>,
  );
  expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-aurora");
  expect(localStorage.getItem("cm-theme")).toBe("cm-rose");
});
