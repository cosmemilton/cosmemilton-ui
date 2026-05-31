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

export type ThemeTypography = {
  fontFamily: string;
  monospaceFamily: string;
  baseSize: string;
  scaleRatio: number;
};

export type ThemeRadius = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
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
  colors: ThemeColorScale;
  typography: ThemeTypography;
  radii: ThemeRadius;
  shadows: ThemeShadows;
  space?: Partial<ThemeSpaceScale>;
  zIndex?: Partial<ThemeZIndexScale>;
  motion?: ThemeMotionScale;
  breakpoints?: Partial<ThemeBreakpointScale>;
  density?: ThemeDensityScale;
  layers?: Partial<ThemeLayerScale>;
};

export type ThemeRegistry = Record<string, ThemeConfig>;
