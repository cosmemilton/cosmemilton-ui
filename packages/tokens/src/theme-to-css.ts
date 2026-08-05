import type {
  ThemeBreakpointScale,
  ThemeConfig,
  ThemeDensityModeScale,
  ThemeLayerScale,
  ThemeMotionDurationScale,
  ThemeMotionEaseScale,
  ThemeRegistry,
  ThemeSpaceScale,
  ThemeZIndexScale,
} from "./types.js";
import { themes } from "./themes.js";

type ThemeKV = [string, string];
type StringScale = Record<string, string>;

/** Converts camelCase → kebab-case (e.g. mutedForeground → muted-foreground) */
const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const tokenEntries = (prefix: string, entries: Record<string, string>): ThemeKV[] =>
  Object.entries(entries).map(([token, value]) => [`--${prefix}-${camelToKebab(token)}`, value]);

const mergeScale = <T extends StringScale>(defaults: T, overrides?: Partial<T>): T => ({
  ...defaults,
  ...overrides,
});

const defaultSpace: ThemeSpaceScale = {
  none: "0",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
};

const defaultZIndex: ThemeZIndexScale = {
  base: "0",
  docked: "30",
  dropdown: "500",
  sticky: "20",
  overlay: "300",
  modal: "301",
  toast: "9999",
  tooltip: "10000",
};

const defaultMotionDuration: ThemeMotionDurationScale = {
  fast: ".15s",
  base: ".2s",
  slow: ".3s",
};

const defaultMotionEase: ThemeMotionEaseScale = {
  standard: "ease",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
};

const defaultBreakpoints: ThemeBreakpointScale = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

const defaultDensityMode: Record<"compact" | "default" | "comfortable", ThemeDensityModeScale> = {
  compact: {
    controlHeight: "2rem",
    controlPaddingX: "0.625rem",
    controlPaddingY: "0.375rem",
    gap: "0.375rem",
    iconSize: "1rem",
  },
  default: {
    controlHeight: "2.5rem",
    controlPaddingX: "0.875rem",
    controlPaddingY: "0.5rem",
    gap: "0.5rem",
    iconSize: "1.125rem",
  },
  comfortable: {
    controlHeight: "3rem",
    controlPaddingX: "1rem",
    controlPaddingY: "0.625rem",
    gap: "0.75rem",
    iconSize: "1.25rem",
  },
};

const defaultLayers: ThemeLayerScale = {
  base: "var(--color-background)",
  surface: "var(--color-card)",
  elevated: "color-mix(in srgb, var(--color-card) 96%, var(--color-background))",
  floating: "var(--color-popover)",
  overlay: "var(--color-overlay)",
};

export const themeToCSSVars = (theme: ThemeConfig): Record<string, string> => {
  const density = {
    compact: mergeScale(defaultDensityMode.compact, theme.density?.compact),
    default: mergeScale(defaultDensityMode.default, theme.density?.default),
    comfortable: mergeScale(defaultDensityMode.comfortable, theme.density?.comfortable),
  };

  const entries: ThemeKV[] = [
    ...tokenEntries("color", theme.colors),
    ["--font-family", theme.typography.fontFamily],
    ["--font-mono", theme.typography.monospaceFamily],
    ["--font-base", theme.typography.baseSize],
    ["--font-scale", theme.typography.scaleRatio.toString()],
    ...Object.entries(theme.radii).map<ThemeKV>(([token, value]) => [`--radius-${token}`, value]),
    ...Object.entries(theme.shadows).map<ThemeKV>(([token, value]) => [`--shadow-${token}`, value]),
    ...tokenEntries("space", mergeScale(defaultSpace, theme.space)),
    ...tokenEntries("z", mergeScale(defaultZIndex, theme.zIndex)),
    ...tokenEntries("motion-duration", mergeScale(defaultMotionDuration, theme.motion?.duration)),
    ...tokenEntries("motion-ease", mergeScale(defaultMotionEase, theme.motion?.ease)),
    ...tokenEntries("breakpoint", mergeScale(defaultBreakpoints, theme.breakpoints)),
    ...tokenEntries("density-compact", density.compact),
    ...tokenEntries("density-default", density.default),
    ...tokenEntries("density-comfortable", density.comfortable),
    ...tokenEntries("layer", mergeScale(defaultLayers, theme.layers)),
  ];

  return Object.fromEntries(entries);
};

/** Escapes a theme name for use inside a double-quoted CSS attribute selector. */
const escapeAttributeValue = (name: string) => name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export const themeSelector = (theme: ThemeConfig) =>
  `:root[data-theme="${escapeAttributeValue(theme.name)}"]`;

/**
 * Renders a theme as a static CSS rule: all design tokens plus `color-scheme`
 * (when the theme declares one). The build uses this to ship every built-in
 * theme inside styles.css; the runtime uses it for consumer custom themes.
 */
export const themeToCSSBlock = (theme: ThemeConfig, selector = themeSelector(theme)): string => {
  const lines = Object.entries(themeToCSSVars(theme)).map(([token, value]) => {
    return `  ${token}: ${value};`;
  });
  if (theme.colorScheme) {
    lines.push(`  color-scheme: ${theme.colorScheme};`);
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
};

/**
 * CSS for the themes in `registry` that are NOT the stock built-ins — consumer
 * custom themes and consumer overrides of a built-in name. The selector
 * repeats the attribute to reach specificity (0,3,0), one level above the
 * statically shipped blocks (0,2,0), so runtime-injected custom themes win
 * regardless of where the consumer's bundler places styles.css.
 */
export const customThemeCSS = (registry: ThemeRegistry): string =>
  Object.values(registry)
    .filter((theme) => themes[theme.name] !== theme)
    .map((theme) => themeToCSSBlock(theme, `${themeSelector(theme)}[data-theme]`))
    .join("\n");
