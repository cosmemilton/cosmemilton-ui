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

export type ThemeConfig = {
  name: string;
  colors: ThemeColorScale;
  typography: ThemeTypography;
  radii: ThemeRadius;
  shadows: ThemeShadows;
};

export type ThemeRegistry = Record<string, ThemeConfig>;
