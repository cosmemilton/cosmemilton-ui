import { describe, expect, it } from "vitest";
import { customThemeCSS, themeSelector, themeToCSSBlock, themeToCSSVars } from "./theme-to-css.js";
import { darkTheme, defaultTheme, extendThemes, themes } from "./themes.js";
import type { ThemeConfig } from "./types.js";

const customTheme: ThemeConfig = {
  ...defaultTheme,
  name: "acme-brand",
  colors: { ...defaultTheme.colors, primary: "#ff0000" },
};

describe("themeToCSSBlock", () => {
  it("renders every token of the theme under the data-theme selector", () => {
    const block = themeToCSSBlock(defaultTheme);
    expect(block).toContain(':root[data-theme="cm-neutral"] {');
    for (const [token, value] of Object.entries(themeToCSSVars(defaultTheme))) {
      expect(block).toContain(`${token}: ${value};`);
    }
  });

  it("emits color-scheme when the theme declares one", () => {
    expect(themeToCSSBlock(darkTheme)).toContain("color-scheme: dark;");
    expect(themeToCSSBlock(defaultTheme)).not.toContain("color-scheme");
  });

  it("accepts a custom selector (used for the bare :root default block)", () => {
    expect(themeToCSSBlock(defaultTheme, ":root")).toMatch(/^:root \{/);
  });

  it("escapes quotes in theme names so the selector cannot break out", () => {
    const hostile: ThemeConfig = { ...defaultTheme, name: 'x"]{}body{display:none}' };
    expect(themeSelector(hostile)).toBe(':root[data-theme="x\\"]{}body{display:none}"]');
  });
});

describe("customThemeCSS", () => {
  it("returns empty for the stock registry", () => {
    expect(customThemeCSS(themes)).toBe("");
    expect(customThemeCSS(extendThemes())).toBe("");
  });

  it("renders only consumer themes, with a higher-specificity selector", () => {
    const css = customThemeCSS(extendThemes([customTheme]));
    expect(css).toContain(':root[data-theme="acme-brand"][data-theme] {');
    expect(css).toContain("--color-primary: #ff0000;");
    expect(css).not.toContain('[data-theme="cm-neutral"]');
  });

  it("includes consumer overrides of built-in theme names", () => {
    const override: ThemeConfig = {
      ...darkTheme,
      colors: { ...darkTheme.colors, primary: "#123456" },
    };
    const css = customThemeCSS(extendThemes([override]));
    expect(css).toContain(':root[data-theme="cm-dark"][data-theme] {');
    expect(css).toContain("--color-primary: #123456;");
  });
});
