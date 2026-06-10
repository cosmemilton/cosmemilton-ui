import { beforeEach, describe, expect, it } from "vitest";
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
  document.documentElement.removeAttribute("style");
  document.getElementById("cm-theme-custom")?.remove();
});

describe("CmThemeProvider", () => {
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
