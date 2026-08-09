export type ThemeColorScale = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  /**
   * Muted text/placeholder color for use ON `primary` (inverted chrome: topbar
   * and sidebar with `tone="brand"`). Optional: when omitted, the CSS falls back
   * to a `color-mix` of `primaryForeground`. Built-in themes ship a value
   * validated to ≥4.5:1 over `primary` (see contrast.test.ts).
   */
  primaryMutedForeground?: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  danger: string;
  dangerForeground: string;
  info: string;
  infoForeground: string;
  border: string;
  input: string;
  ring: string;
  selection: string;
  selectionForeground: string;
  overlay: string;
};

/**
 * Letter-spacing scale. Optional everywhere: themes that omit it get the
 * library defaults, and no existing component applies these automatically —
 * emitting a token changes nothing until something opts in. That is deliberate:
 * silently re-tracking every heading in every consumer is a visual breaking
 * change, and this addition is meant to be additive.
 *
 * - `tight` — display/headings. Large type looks loose at 0; pulling it in is
 *   what makes a title read as one shape instead of a row of letters.
 * - `normal` — running text.
 * - `wide` — small uppercase labels, where the caps need air to stay legible.
 */
export type ThemeTrackingScale = {
  tight: string;
  normal: string;
  wide: string;
};

export type ThemeTypography = {
  fontFamily: string;
  monospaceFamily: string;
  baseSize: string;
  scaleRatio: number;
  tracking?: Partial<ThemeTrackingScale>;
};

/**
 * Translucent "glass" surface: the panel/menu/overlay tone that sits over a
 * desktop or an image and lets it show through.
 *
 * It is its own scale and not a color token because glass is three things at
 * once — a translucent fill, a hairline edge, and a backdrop blur — and a
 * single color cannot carry the blur. Every page that wanted glass before this
 * hand-rolled all three, which is exactly how two surfaces end up with
 * different alpha in the same product.
 *
 * Defaults derive from the theme's own `card` and `foreground` via `color-mix`,
 * so every existing theme gets a coherent glass for free, in its own hues.
 */
export type ThemeSurfaceScale = {
  glass: string;
  glassBorder: string;
  glassBlur: string;
};

export type ThemeRadius = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  /**
   * Radius for buttons in their default shape. Optional: falls back to `md`,
   * which is exactly what buttons used before this token existed.
   *
   * It exists so a theme can make pills the house default without every call
   * site passing `shape="pill"` — `CmButton` already accepts that prop, and
   * having to repeat it in hundreds of places is how a design system's own
   * rule ends up applied in most places instead of all of them.
   */
  button?: string;
};

export type ThemeShadows = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type ThemeSpaceScale = {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
};

export type ThemeZIndexScale = {
  base: string;
  docked: string;
  dropdown: string;
  sticky: string;
  overlay: string;
  modal: string;
  toast: string;
  tooltip: string;
};

export type ThemeMotionDurationScale = {
  fast: string;
  base: string;
  slow: string;
};

export type ThemeMotionEaseScale = {
  standard: string;
  emphasized: string;
};

export type ThemeMotionScale = {
  duration?: Partial<ThemeMotionDurationScale>;
  ease?: Partial<ThemeMotionEaseScale>;
};

export type ThemeBreakpointScale = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
};

export type ThemeDensityModeScale = {
  controlHeight: string;
  controlPaddingX: string;
  controlPaddingY: string;
  gap: string;
  iconSize: string;
};

export type ThemeDensityScale = {
  compact?: Partial<ThemeDensityModeScale>;
  default?: Partial<ThemeDensityModeScale>;
  comfortable?: Partial<ThemeDensityModeScale>;
};

export type ThemeLayerScale = {
  base: string;
  surface: string;
  elevated: string;
  floating: string;
  overlay: string;
};

export type ThemeConfig = {
  name: string;
  /**
   * Informs the browser which built-in color scheme (native form controls,
   * scrollbars) matches the theme. Emitted as `color-scheme` in the theme's
   * CSS block. Defaults to the page-level `light` when omitted.
   */
  colorScheme?: "light" | "dark";
  colors: ThemeColorScale;
  typography: ThemeTypography;
  radii: ThemeRadius;
  shadows: ThemeShadows;
  surfaces?: Partial<ThemeSurfaceScale>;
  space?: Partial<ThemeSpaceScale>;
  zIndex?: Partial<ThemeZIndexScale>;
  motion?: ThemeMotionScale;
  breakpoints?: Partial<ThemeBreakpointScale>;
  density?: ThemeDensityScale;
  layers?: Partial<ThemeLayerScale>;
};

export type ThemeRegistry = Record<string, ThemeConfig>;
