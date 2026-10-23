import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => vi.restoreAllMocks());

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
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-neutral");
  });

  it("applies and removes the opted-in skin at the document root, covering portals", () => {
    function Appearance() {
      return <span>{useCmTheme().skin}</span>;
    }
    const { rerender } = render(
      <CmThemeProvider skin="horizonte" defaultThemeName="cm-horizonte-light">
        <Appearance />
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "horizonte");
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-horizonte-light");
    expect(screen.getByText("horizonte")).toBeInTheDocument();
    rerender(
      <CmThemeProvider skin="classic">
        <Appearance />
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "classic");
    expect(screen.getByText("classic")).toBeInTheDocument();
  });

  it("switches Horizonte palettes without changing the selected skin", async () => {
    const user = userEvent.setup();
    render(
      <CmThemeProvider skin="horizonte" defaultThemeName="cm-horizonte-light" chrome="inverted">
        <ThemeSwitcher to="cm-horizonte-dark" />
      </CmThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-cm-chrome", "inverted");
    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-horizonte-dark");
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "horizonte");
    expect(document.documentElement).toHaveAttribute("data-cm-chrome", "surface");
    expect(window.localStorage.getItem("cm-theme")).toBe("cm-horizonte-dark");
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
    expect(document.documentElement.getAttribute("data-theme")).toBe("cm-neutral");
    // Inline custom properties on <html> would outrank consumer stylesheets.
    expect(document.documentElement.style.getPropertyValue("--color-background")).toBe("");
    expect(document.documentElement.style.length).toBe(0);
  });

  it("switches themes by flipping the attribute and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <CmThemeProvider>
        <ThemeSwitcher to="cm-dark" />
      </CmThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("cm-dark");
    expect(window.localStorage.getItem("cm-theme")).toBe("cm-dark");
    expect(document.documentElement.style.length).toBe(0);
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
    window.localStorage.setItem("cm-theme", "cm-midnight");
    render(
      <CmThemeProvider>
        <span>app</span>
      </CmThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("cm-midnight");
  });
});

function Preferences() {
  const theme = useCmTheme();
  return (
    <>
      <output>{theme.theme.name + ":" + theme.density + ":" + theme.chrome}</output>
      <button onClick={() => theme.setThemeByName("cm-dark")}>dark</button>
      <button onClick={() => theme.setDensity("compact")}>compact</button>
      <button onClick={() => theme.setChrome("inverted")}>invert</button>
    </>
  );
}

describe("appearance storage namespaces", () => {
  it("isolates all four appearance keys and preserves existing unprefixed choices", async () => {
    const user = userEvent.setup();
    localStorage.setItem("cm-theme", "cm-midnight");
    const { unmount } = render(
      <CmThemeProvider storagePrefix="client-a:">
        <Preferences />
      </CmThemeProvider>,
    );
    await user.click(screen.getByText("compact"));
    await user.click(screen.getByText("invert"));
    await user.click(screen.getByText("dark"));
    expect(localStorage.getItem("client-a:cm-theme")).toBe("cm-dark");
    expect(localStorage.getItem("client-a:cm-density")).toBe("compact");
    expect(localStorage.getItem("client-a:cm-chrome")).toBe("inverted");
    expect(localStorage.getItem("client-a:cm-invert-header")).toBe("true");
    expect(localStorage.getItem("cm-theme")).toBe("cm-midnight");
    unmount();
    render(
      <CmThemeProvider storagePrefix="client-b:">
        <Preferences />
      </CmThemeProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("cm-neutral:default:surface");
    expect(localStorage.getItem("client-b:cm-density")).toBeNull();
    expect(localStorage.getItem("client-a:cm-theme")).toBe("cm-dark");
  });

  it("reloads a changed prefix without ever copying the previous theme into it", () => {
    localStorage.setItem("client-a:cm-theme", "cm-dark");
    localStorage.setItem("client-a:cm-density", "compact");
    localStorage.setItem("client-a:cm-chrome", "inverted");
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { rerender } = render(
      <CmThemeProvider storagePrefix="client-a:">
        <Preferences />
      </CmThemeProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("cm-dark:compact:surface");
    rerender(
      <CmThemeProvider storagePrefix="client-b:">
        <Preferences />
      </CmThemeProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("cm-neutral:default:surface");
    expect(
      write.mock.calls.some(([key, value]) => key === "client-b:cm-theme" && value === "cm-dark"),
    ).toBe(false);
    expect(localStorage.getItem("client-a:cm-theme")).toBe("cm-dark");
  });

  it("restores preferences only from the requested namespace", () => {
    localStorage.setItem("client-b:cm-theme", "cm-horizonte-light");
    localStorage.setItem("client-b:cm-density", "comfortable");
    localStorage.setItem("client-b:cm-invert-header", "true");
    render(
      <CmThemeProvider storagePrefix="client-b:">
        <Preferences />
      </CmThemeProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("cm-horizonte-light:comfortable:inverted");
  });

  it("remains usable when storage access is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();
    render(
      <CmThemeProvider storagePrefix="client-a:">
        <Preferences />
      </CmThemeProvider>,
    );
    await user.click(screen.getByText("dark"));
    await user.click(screen.getByText("compact"));
    expect(screen.getByRole("status")).toHaveTextContent("cm-dark:compact:surface");
  });
});
