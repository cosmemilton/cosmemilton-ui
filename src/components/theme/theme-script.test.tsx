import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { CmThemeScript } from "./theme-script.js";
import { defaultTheme } from "../../lib/theme/index.js";
import type { ThemeConfig } from "../../lib/theme/index.js";

const customTheme: ThemeConfig = {
  ...defaultTheme,
  name: "acme-brand",
  colors: { ...defaultTheme.colors, primary: "#ff0000" },
};

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-cm-skin");
});

describe("CmThemeScript", () => {
  it("emits only the data-theme bootstrap, not serialized theme tokens", () => {
    const { container } = render(<CmThemeScript />);
    const script = container.querySelector("#cm-theme-script");
    expect(script).not.toBeNull();
    const code = script!.innerHTML;
    expect(code).toContain("data-theme");
    expect(code).toContain('"cm-v4-light"');
    // Tokens live in the static stylesheet now — the script must not inline them.
    expect(code).not.toContain("--color-background");
    expect(code).not.toContain("setProperty");
    expect(code.length).toBeLessThan(1300);
  });

  it("renders no style tag when there are no custom themes", () => {
    const { container } = render(<CmThemeScript />);
    expect(container.querySelector("#cm-theme-custom")).toBeNull();
  });

  it("inlines custom theme tokens as a style block", () => {
    const { container } = render(<CmThemeScript customThemes={[customTheme]} />);
    const style = container.querySelector("#cm-theme-custom");
    expect(style).not.toBeNull();
    expect(style!.innerHTML).toContain(':root[data-theme="acme-brand"][data-theme]');
    expect(style!.innerHTML).toContain("--color-primary: #ff0000;");
    const script = container.querySelector("#cm-theme-script");
    expect(script!.innerHTML).toContain('"acme-brand"');
  });

  it("keeps two bootstrap instances and their custom theme styles distinct", () => {
    const exampleTheme: ThemeConfig = {
      ...customTheme,
      name: "example-brand",
      colors: { ...customTheme.colors, primary: "#0000ff" },
    };
    const { container } = render(
      <>
        <CmThemeScript
          id="application-theme"
          customThemes={[customTheme]}
          defaultThemeName={customTheme.name}
          defaultDensity="compact"
          storageKey={false}
        />
        <CmThemeScript
          id="example-theme"
          customThemes={[exampleTheme]}
          defaultThemeName={exampleTheme.name}
          defaultDensity="comfortable"
          storageKey={false}
        />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(ids).toEqual([
      "application-theme-custom",
      "application-theme",
      "example-theme-custom",
      "example-theme",
    ]);
    expect(new Set(ids).size).toBe(4);
    const applicationStyle = container.querySelector("#application-theme-custom")!;
    const exampleStyle = container.querySelector("#example-theme-custom")!;
    expect(applicationStyle.innerHTML).toContain("--color-primary: #ff0000;");
    expect(applicationStyle.innerHTML).not.toContain("example-brand");
    expect(exampleStyle.innerHTML).toContain("--color-primary: #0000ff;");
    expect(exampleStyle.innerHTML).not.toContain("acme-brand");

    new Function(container.querySelector("#application-theme")!.innerHTML)();
    expect(document.documentElement).toHaveAttribute("data-theme", customTheme.name);
    expect(document.documentElement).toHaveAttribute("data-density", "compact");
    new Function(container.querySelector("#example-theme")!.innerHTML)();
    expect(document.documentElement).toHaveAttribute("data-theme", exampleTheme.name);
    expect(document.documentElement).toHaveAttribute("data-density", "comfortable");
  });

  it("neutralizes </script> breakout sequences in custom theme names", () => {
    const evil: ThemeConfig = {
      ...defaultTheme,
      name: "</script><img src=x onerror=alert(1)>",
    };
    const { container } = render(
      <CmThemeScript customThemes={[evil]} defaultThemeName={evil.name} />,
    );
    const code = container.querySelector("#cm-theme-script")!.innerHTML;
    // The literal "<" must be escaped so the HTML parser can't close the script
    // tag early; the raw breakout sequence must never reach the output.
    expect(code).not.toContain("</script>");
    expect(code).not.toContain("<img");
    expect(code).toContain("\\u003c");
  });

  it("forwards a CSP nonce to the inline script and style tags", () => {
    const { container } = render(<CmThemeScript customThemes={[customTheme]} nonce="abc123" />);
    expect(container.querySelector("#cm-theme-script")).toHaveAttribute("nonce", "abc123");
    expect(container.querySelector("#cm-theme-custom")).toHaveAttribute("nonce", "abc123");
  });

  it("falls back to the default theme when defaultThemeName is unknown", () => {
    const { container } = render(<CmThemeScript defaultThemeName="does-not-exist" />);
    const script = container.querySelector("#cm-theme-script");
    expect(script!.innerHTML).toContain('const fallback = "cm-v4-light"');
  });

  it("bootstraps the persisted density alongside the theme", () => {
    const { container } = render(<CmThemeScript />);
    const code = container.querySelector("#cm-theme-script")!.innerHTML;
    expect(code).toContain("cm-density");
    expect(code).toContain("data-density");
    expect(code).toContain('const fallbackDensity = "default"');
  });

  it("uses defaultDensity as the density fallback", () => {
    const { container } = render(<CmThemeScript defaultDensity="compact" />);
    const code = container.querySelector("#cm-theme-script")!.innerHTML;
    expect(code).toContain('const fallbackDensity = "compact"');
  });

  it("sets the explicit skin before first paint and restores the dark palette", () => {
    window.localStorage.setItem("cm-theme", "cm-v4-dark");
    const { container } = render(<CmThemeScript skin="horizonte" defaultThemeName="cm-v4-light" />);
    const code = container.querySelector("#cm-theme-script")!.innerHTML;
    new Function(code)();
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "horizonte");
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-dark");
  });

  it("ignores V3 persisted names before first paint", () => {
    window.localStorage.setItem("cm-theme", "cm-horizonte-dark");
    const { container } = render(<CmThemeScript />);
    new Function(container.querySelector("#cm-theme-script")!.innerHTML)();
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-light");
  });

  it("defaults to classic and still applies skin when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    const { container } = render(<CmThemeScript />);
    new Function(container.querySelector("#cm-theme-script")!.innerHTML)();
    expect(document.documentElement).toHaveAttribute("data-cm-skin", "classic");
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-light");
    expect(document.documentElement).toHaveAttribute("data-density", "default");
  });
});
