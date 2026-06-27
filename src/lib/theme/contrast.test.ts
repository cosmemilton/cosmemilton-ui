import { describe, expect, it } from "vitest";
import { themes } from "./themes.js";

// WCAG 2.x relative-luminance contrast, computed in JS because jsdom can't
// measure rendered color-contrast (axe returns it as "incomplete"). This guards
// the inverted-chrome muted token (topbar/sidebar tone="brand") per theme.
const srgbToLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);

const parseHex = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
};

const contrastRatio = (a: string, b: string): number => {
  const la = relativeLuminance(parseHex(a));
  const lb = relativeLuminance(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

const AA_NORMAL = 4.5;

describe("theme contrast — text on primary (inverted chrome)", () => {
  const builtIns = Object.values(themes);

  it.each(builtIns)("$name primaryForeground reaches AA over primary", (theme) => {
    expect(contrastRatio(theme.colors.primaryForeground, theme.colors.primary)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it.each(builtIns)("$name defines a primaryMutedForeground", (theme) => {
    expect(theme.colors.primaryMutedForeground).toBeDefined();
  });

  it.each(builtIns)("$name primaryMutedForeground reaches AA over primary", (theme) => {
    // Non-null: the assertion above guarantees every built-in defines it.
    const muted = theme.colors.primaryMutedForeground!;
    expect(contrastRatio(muted, theme.colors.primary)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});
