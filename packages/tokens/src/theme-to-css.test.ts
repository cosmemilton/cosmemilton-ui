import { describe, expect, it } from "vitest";
import { customThemeCSS, themeSelector, themeToCSSBlock, themeToCSSVars } from "./theme-to-css.js";
import {
  darkTheme,
  defaultTheme,
  extendThemes,
  auroraTheme,
  lightTheme,
  themes,
} from "./themes.js";
import type { ThemeConfig } from "./types.js";

const customTheme: ThemeConfig = {
  ...defaultTheme,
  name: "acme-brand",
  colors: { ...defaultTheme.colors, primary: "#ff0000" },
};

describe("themeToCSSBlock", () => {
  it("ships only the three independently authored V4 palettes", () => {
    expect(Object.keys(themes)).toEqual(["cm-v4-light", "cm-v4-dark", "cm-v4-aurora"]);
    expect(themes["cm-v4-light"]).toBe(lightTheme);
    expect(themes["cm-v4-dark"]).toBe(darkTheme);
    expect(themes["cm-v4-aurora"]).toBe(auroraTheme);
    expect(defaultTheme).toBe(lightTheme);
    for (const theme of Object.values(themes)) {
      expect(themeToCSSVars(theme)["--font-family"]).toContain("CM UI Sans");
      expect(themeToCSSVars(theme)["--font-family-heading"]).toContain("CM UI Display");
      expect(theme.surfaces).toBeDefined();
      expect(theme.layers).toBeDefined();
      expect(theme.density).toBeDefined();
    }
    expect(themeToCSSBlock(lightTheme)).toContain("color-scheme: light;");
    expect(themeToCSSBlock(darkTheme)).toContain("color-scheme: dark;");
    expect(customThemeCSS(extendThemes())).toBe("");
  });

  it("preserves the body family for themes that omit a heading family", () => {
    const withoutHeading = {
      ...defaultTheme,
      typography: { ...defaultTheme.typography, fontFamilyHeading: undefined },
    };
    expect(themeToCSSVars(withoutHeading)["--font-family-heading"]).toBe(
      defaultTheme.typography.fontFamily,
    );
  });

  it("renders every token of the theme under the data-theme selector", () => {
    const block = themeToCSSBlock(defaultTheme);
    expect(block).toContain(':root[data-theme="cm-v4-light"] {');
    for (const [token, value] of Object.entries(themeToCSSVars(defaultTheme))) {
      expect(block).toContain(`${token}: ${value};`);
    }
  });

  it("emits color-scheme when the theme declares one", () => {
    expect(themeToCSSBlock(darkTheme)).toContain("color-scheme: dark;");
    expect(themeToCSSBlock(defaultTheme)).toContain("color-scheme: light;");
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
    const vars = themeToCSSVars({ ...defaultTheme, surfaces: undefined });
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
    const vars = themeToCSSVars({
      ...defaultTheme,
      radii: { ...defaultTheme.radii, button: undefined },
    });
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
    expect(css).not.toContain('[data-theme="cm-v4-light"]');
  });

  it("includes consumer overrides of built-in theme names", () => {
    const override: ThemeConfig = {
      ...darkTheme,
      colors: { ...darkTheme.colors, primary: "#123456" },
    };
    const css = customThemeCSS(extendThemes([override]));
    expect(css).toContain(':root[data-theme="cm-v4-dark"][data-theme] {');
    expect(css).toContain("--color-primary: #123456;");
  });
});
