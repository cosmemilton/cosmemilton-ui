import type { ThemeConfig } from "./types";

type ThemeKV = [string, string];

/** Converts camelCase → kebab-case (e.g. mutedForeground → muted-foreground) */
const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const colorEntries = (
  prefix: string,
  entries: Record<string, string>,
): ThemeKV[] =>
  Object.entries(entries).map(([token, value]) => [
    `--${prefix}-${camelToKebab(token)}`,
    value,
  ]);

export const themeToCSSVars = (theme: ThemeConfig): Record<string, string> => {
  const entries: ThemeKV[] = [
    ...colorEntries("color", theme.colors),
    ["--font-family", theme.typography.fontFamily],
    ["--font-mono", theme.typography.monospaceFamily],
    ["--font-base", theme.typography.baseSize],
    ["--font-scale", theme.typography.scaleRatio.toString()],
    ...Object.entries(theme.radii).map<ThemeKV>(([token, value]) => [
      `--radius-${token}`,
      value,
    ]),
    ...Object.entries(theme.shadows).map<ThemeKV>(([token, value]) => [
      `--shadow-${token}`,
      value,
    ]),
  ];

  return Object.fromEntries(entries);
};
