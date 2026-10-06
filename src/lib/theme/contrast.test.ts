// GENERATED FILE — DO NOT EDIT.
// Source: packages/tokens/src/contrast.test.ts · Sync: scripts/sync-tokens.mjs (npm run sync:tokens)
import { describe, expect, it } from "vitest";
import { themes } from "./themes.js";

// WCAG 2.x contrast is calculated from actual authored tokens. jsdom cannot
// measure rendered contrast, so these checks also cover the color-mix surfaces
// used by status badges, alerts and toasts in the public components.
const channels = (hex: string) =>
  [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
const luminance = (color: number[]) =>
  color
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index]!, 0);
const contrast = (foreground: number[], background: number[]) => {
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (high! + 0.05) / (low! + 0.05);
};
const mix = (a: string, b: string, weight: number) =>
  channels(a).map((value, index) => value * weight + channels(b)[index]! * (1 - weight));

const tones = ["primary", "secondary", "accent", "success", "warning", "danger", "info"] as const;

describe("V4 themes: WCAG AA for normal text", () => {
  it.each(Object.values(themes))("$name keeps text readable on every base surface", (theme) => {
    const colors = theme.colors;
    const textPairs = [
      ["foreground", "background"],
      ["foreground", "muted"],
      ["cardForeground", "card"],
      ["popoverForeground", "popover"],
      ["selectionForeground", "selection"],
    ] as const;
    for (const [foreground, background] of textPairs) {
      expect(
        contrast(channels(colors[foreground]), channels(colors[background])),
        `${theme.name}: ${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    for (const background of ["background", "card", "popover", "muted"] as const) {
      expect(
        contrast(channels(colors.mutedForeground), channels(colors[background])),
        `${theme.name}: mutedForeground on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    for (const tone of tones) {
      for (const background of ["background", "card", "popover", "muted"] as const) {
        expect(
          contrast(channels(colors[tone]), channels(colors[background])),
          `${theme.name}: ${tone} text on ${background}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(
      contrast(channels(colors.primaryMutedForeground!), channels(colors.primary)),
      `${theme.name}: primaryMutedForeground on primary`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.values(themes))(
    "$name keeps control boundaries and focus indicators distinguishable",
    (theme) => {
      for (const background of ["background", "card", "popover", "muted"] as const) {
        for (const indicator of ["input", "ring"] as const) {
          expect(
            contrast(channels(theme.colors[indicator]), channels(theme.colors[background])),
            `${theme.name}: ${indicator} against ${background}`,
          ).toBeGreaterThanOrEqual(3);
        }
      }
    },
  );

  it.each(Object.values(themes))(
    "$name keeps filled actions and semantic states readable",
    (theme) => {
      for (const tone of tones) {
        expect(
          contrast(channels(theme.colors[`${tone}Foreground`]), channels(theme.colors[tone])),
          `${theme.name}: ${tone}Foreground on ${tone}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it.each(Object.values(themes))(
    "$name keeps semantic text readable on tinted status surfaces",
    (theme) => {
      const colors = theme.colors;
      for (const tone of tones) {
        // Library status surfaces tint the card by 8–16%; text is the semantic
        // color itself or a 70% semantic / 30% foreground blend.
        for (const weight of [0.08, 0.12, 0.14, 0.16]) {
          const background = mix(colors[tone], colors.card, weight);
          for (const foreground of [
            channels(colors[tone]),
            mix(colors[tone], colors.foreground, 0.7),
          ]) {
            expect(
              contrast(foreground, background),
              `${theme.name}: ${tone} text on ${weight * 100}% tinted card`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    },
  );
});
