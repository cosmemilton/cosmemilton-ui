import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CmThemeScript } from "./theme-script.js";
import { defaultTheme } from "../../lib/theme/index.js";
import type { ThemeConfig } from "../../lib/theme/index.js";

const customTheme: ThemeConfig = {
  ...defaultTheme,
  name: "acme-brand",
  colors: { ...defaultTheme.colors, primary: "#ff0000" },
};

describe("CmThemeScript", () => {
  it("emits only the data-theme bootstrap, not serialized theme tokens", () => {
    const { container } = render(<CmThemeScript />);
    const script = container.querySelector("#cm-theme-script");
    expect(script).not.toBeNull();
    const code = script!.innerHTML;
    expect(code).toContain("data-theme");
    expect(code).toContain('"cm-neutral"');
    // Tokens live in the static stylesheet now — the script must not inline them.
    expect(code).not.toContain("--color-background");
    expect(code).not.toContain("setProperty");
    expect(code.length).toBeLessThan(1000);
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
    expect(script!.innerHTML).toContain('const fallback = "cm-neutral"');
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
});
