// GENERATED FILE — DO NOT EDIT.
// Source: packages/tokens/src/theme-to-css.test.ts · Sync: scripts/sync-tokens.mjs (npm run sync:tokens)
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

describe("escalas opcionais: vidro, tracking e raio de botão", () => {
  // O ponto destas três é serem ADITIVAS. O que precisa ficar provado não é
  // que o tema novo as usa — é que os antigos continuam idênticos sem elas.
  it("dá vidro a tema que nunca ouviu falar de vidro, derivado das cores dele", () => {
    const vars = themeToCSSVars(defaultTheme);
    expect(vars["--surface-glass"]).toContain("var(--color-card)");
    expect(vars["--surface-glass-border"]).toContain("var(--color-foreground)");
    expect(vars["--surface-glass-blur"]).toBe("24px");
  });

  it("deixa o tema declarar o vidro dele, e aí o default sai de cena", () => {
    const comVidro: ThemeConfig = {
      ...defaultTheme,
      name: "acme-glass",
      surfaces: { glass: "rgba(1, 2, 3, 0.5)" },
    };
    const vars = themeToCSSVars(comVidro);
    expect(vars["--surface-glass"]).toBe("rgba(1, 2, 3, 0.5)");
    // Declarar UM campo não pode apagar os outros dois.
    expect(vars["--surface-glass-blur"]).toBe("24px");
  });

  it("tracking nasce em zero, que é o mesmo que não existir", () => {
    expect(themeToCSSVars(defaultTheme)["--tracking-normal"]).toBe("0");
  });

  it("emite --radius-button mesmo quando o tema não declara, igual ao md", () => {
    // É esta linha que garante que nenhum tema existente muda de aparência:
    // o botão lia --radius-md e passa a ler --radius-button com o mesmo valor.
    const vars = themeToCSSVars(defaultTheme);
    expect(vars["--radius-button"]).toBe(defaultTheme.radii.md);
  });

  it("um tema pode fazer da pílula o padrão da casa", () => {
    const pilula: ThemeConfig = {
      ...defaultTheme,
      name: "acme-pill",
      radii: { ...defaultTheme.radii, button: "9999px" },
    };
    expect(themeToCSSVars(pilula)["--radius-button"]).toBe("9999px");
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
