import type { ThemeConfig, ThemeRegistry } from "./types.js";

const sansStack = "var(--font-geist-sans, 'Inter', sans-serif)";
const monoStack = "var(--font-geist-mono, 'JetBrains Mono', monospace)";

export const defaultTheme: ThemeConfig = {
  name: "cm-neutral",
  colors: {
    background: "#f8fafc",
    foreground: "#20242a",
    muted: "#eef1f4",
    mutedForeground: "#69717d",
    card: "#ffffff",
    cardForeground: "#20242a",
    popover: "#ffffff",
    popoverForeground: "#20242a",
    primary: "#334155",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#a9afb8",
    secondary: "#d9e0e8",
    secondaryForeground: "#20242a",
    accent: "#0f766e",
    accentForeground: "#ffffff",
    success: "#2f855a",
    successForeground: "#ffffff",
    warning: "#b7791f",
    warningForeground: "#1f2933",
    danger: "#c2413a",
    dangerForeground: "#ffffff",
    info: "#2563a8",
    infoForeground: "#ffffff",
    border: "#d8dee6",
    input: "#cfd6df",
    ring: "#475569",
    selection: "#dbeafe",
    selectionForeground: "#1e293b",
    overlay: "rgba(32, 36, 42, 0.48)",
  },
  typography: {
    fontFamily: sansStack,
    monospaceFamily: monoStack,
    baseSize: "16px",
    scaleRatio: 1.18,
  },
  radii: {
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.625rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
    sm: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
    md: "0 8px 24px -18px rgba(15, 23, 42, 0.28)",
    lg: "0 18px 44px -28px rgba(15, 23, 42, 0.32)",
    xl: "0 28px 70px -38px rgba(15, 23, 42, 0.38)",
  },
};

export const schoolTheme: ThemeConfig = {
  name: "cm-school",
  colors: {
    background: "#f7f1e7",
    foreground: "#17231f",
    muted: "#efe5d5",
    mutedForeground: "#6d756e",
    card: "#fffaf0",
    cardForeground: "#17231f",
    popover: "#fffaf0",
    popoverForeground: "#17231f",
    primary: "#1f3d35",
    primaryForeground: "#f7f1e7",
    primaryMutedForeground: "#9da69d",
    secondary: "#587b57",
    secondaryForeground: "#f7f1e7",
    accent: "#d35d3f",
    accentForeground: "#fffaf0",
    success: "#386a45",
    successForeground: "#f7f1e7",
    warning: "#c78b2d",
    warningForeground: "#17231f",
    danger: "#9f382e",
    dangerForeground: "#ffffff",
    info: "#3d6f82",
    infoForeground: "#f7f1e7",
    border: "#d8cdbd",
    input: "#d8cdbd",
    ring: "#1f3d35",
    selection: "#d9e8e5",
    selectionForeground: "#17231f",
    overlay: "rgba(49, 38, 23, 0.45)",
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Gill Sans", sans-serif',
    monospaceFamily: '"Cascadia Mono", "Courier New", monospace',
    baseSize: "16px",
    scaleRatio: 1.2,
  },
  radii: {
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.5rem",
    xl: "0.5rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(49, 38, 23, 0.08)",
    sm: "0 1px 3px 0 rgba(49, 38, 23, 0.10)",
    md: "0 18px 60px rgba(49, 38, 23, 0.12)",
    lg: "0 24px 72px rgba(49, 38, 23, 0.16)",
    xl: "0 30px 90px rgba(49, 38, 23, 0.2)",
  },
};

export const darkTheme: ThemeConfig = {
  name: "cm-dark",
  colorScheme: "dark",
  colors: {
    background: "#020617",
    foreground: "#f8fafc",
    muted: "#111827",
    mutedForeground: "#9ca3af",
    card: "#0f172a",
    cardForeground: "#e2e8f0",
    popover: "#1e293b",
    popoverForeground: "#e0f2fe",
    primary: "#3b82f6",
    primaryForeground: "#0f172a",
    primaryMutedForeground: "#101a30",
    secondary: "#8b5cf6",
    secondaryForeground: "#f5f3ff",
    accent: "#22d3ee",
    accentForeground: "#083344",
    success: "#34d399",
    successForeground: "#022c22",
    warning: "#fbbf24",
    warningForeground: "#422006",
    danger: "#f87171",
    dangerForeground: "#ffffff",
    info: "#0ea5e9",
    infoForeground: "#082f49",
    border: "#27354d",
    input: "#3a4a63",
    ring: "#3b82f6",
    selection: "#1d4ed8",
    selectionForeground: "#e0f2fe",
    overlay: "rgba(2, 6, 23, 0.65)",
  },
  typography: {
    fontFamily: sansStack,
    monospaceFamily: monoStack,
    baseSize: "16px",
    scaleRatio: 1.18,
  },
  radii: {
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  // Sombras escuras nítidas: profundidade vem de preto + anel de 1px,
  // sem glow colorido que deixa as superfícies com aparência borrada.
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.45)",
    sm: "0 2px 4px -1px rgba(0, 0, 0, 0.5)",
    md: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 6px 16px -8px rgba(0, 0, 0, 0.55)",
    lg: "0 0 0 1px rgba(148, 163, 184, 0.09), 0 12px 28px -12px rgba(0, 0, 0, 0.6)",
    xl: "0 0 0 1px rgba(148, 163, 184, 0.1), 0 20px 48px -16px rgba(0, 0, 0, 0.65)",
  },
};

export const orangeTheme: ThemeConfig = {
  name: "cm-orange",
  colors: {
    // Base neutra warm — fundo areia suave, cards brancas
    background: "#f7f5f3",
    foreground: "#1c1917",
    muted: "#eae7e3",
    mutedForeground: "#57534e",
    card: "#ffffff",
    cardForeground: "#1c1917",
    popover: "#ffffff",
    popoverForeground: "#1c1917",
    // Orange brand — laranja queimado premium
    primary: "#cd4014",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#fefbfa",
    // Secondary dark — marrom escuro para contraste
    secondary: "#3e2723",
    secondaryForeground: "#f7f5f3",
    // Accent — teal como complementar fria
    accent: "#00838f",
    accentForeground: "#ffffff",
    // Status colors
    success: "#2e7d32",
    successForeground: "#ffffff",
    warning: "#f9a825",
    warningForeground: "#1c1917",
    danger: "#c62828",
    dangerForeground: "#ffffff",
    info: "#1565c0",
    infoForeground: "#ffffff",
    // Estruturais neutros
    border: "#d6d3d1",
    input: "#d6d3d1",
    ring: "#cd4014",
    selection: "#ffccbc",
    selectionForeground: "#1c1917",
    overlay: "rgba(28, 25, 23, 0.55)",
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    monospaceFamily: monoStack,
    baseSize: "16px",
    scaleRatio: 1.22,
  },
  radii: {
    xs: "0.1875rem",
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem",
    xl: "1.125rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(124, 45, 18, 0.10)",
    sm: "0 2px 5px 0 rgba(124, 45, 18, 0.14)",
    md: "0 14px 32px -20px rgba(194, 65, 12, 0.42)",
    lg: "0 24px 56px -30px rgba(194, 65, 12, 0.44)",
    xl: "0 36px 84px -42px rgba(124, 45, 18, 0.48)",
  },
};

export const redTheme: ThemeConfig = {
  name: "cm-red",
  colors: {
    // Base neutra — background cool gray, cards brancas, SEM rosa/pink
    background: "#f5f5f6",
    foreground: "#1a1a2e",
    muted: "#e8e9ec",
    mutedForeground: "#5f6368",
    card: "#ffffff",
    cardForeground: "#1a1a2e",
    popover: "#ffffff",
    popoverForeground: "#1a1a2e",
    // Red brand — vermelho profundo de alto impacto
    primary: "#c62828",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#f9e7e7",
    // Secondary dark — gera contraste dramático no gradient bar
    secondary: "#1a1a2e",
    secondaryForeground: "#f5f5f6",
    // Accent quente — âmbar/laranja dourado como complementar
    accent: "#e65100",
    accentForeground: "#ffffff",
    // Status colors — ricos e independentes do tema
    success: "#2e7d32",
    successForeground: "#ffffff",
    warning: "#f57f17",
    warningForeground: "#1a1a2e",
    danger: "#991b1b",
    dangerForeground: "#ffffff",
    info: "#1565c0",
    infoForeground: "#ffffff",
    // Estruturais — neutros, sem tom rosado
    border: "#d5d7db",
    input: "#d5d7db",
    ring: "#c62828",
    selection: "#ffcdd2",
    selectionForeground: "#1a1a2e",
    overlay: "rgba(26, 26, 46, 0.55)",
  },
  typography: {
    fontFamily: '"Arial Narrow", "Roboto Condensed", Arial, sans-serif',
    monospaceFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
    baseSize: "16px",
    scaleRatio: 1.16,
  },
  radii: {
    xs: "0.0625rem",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.375rem",
    xl: "0.5rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 1px 0 rgba(127, 29, 29, 0.10)",
    sm: "0 2px 4px 0 rgba(127, 29, 29, 0.14)",
    md: "0 10px 24px -18px rgba(185, 28, 28, 0.40)",
    lg: "0 20px 44px -28px rgba(185, 28, 28, 0.42)",
    xl: "0 30px 72px -38px rgba(127, 29, 29, 0.46)",
  },
};

export const blueTheme: ThemeConfig = {
  name: "cm-blue",
  colors: {
    // Base neutra cool — fundo cinza azulado levíssimo, cards brancas
    background: "#f4f6f8",
    foreground: "#0d1b2a",
    muted: "#e3e8ed",
    mutedForeground: "#546e7a",
    card: "#ffffff",
    cardForeground: "#0d1b2a",
    popover: "#ffffff",
    popoverForeground: "#0d1b2a",
    // Blue brand — azul royal profundo
    primary: "#1565c0",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#deeaf6",
    // Secondary dark — navy para contraste dramático
    secondary: "#0d1b2a",
    secondaryForeground: "#f4f6f8",
    // Accent — amber/dourado quente como complementar
    accent: "#ff8f00",
    accentForeground: "#ffffff",
    // Status colors
    success: "#2e7d32",
    successForeground: "#ffffff",
    warning: "#f9a825",
    warningForeground: "#0d1b2a",
    danger: "#c62828",
    dangerForeground: "#ffffff",
    info: "#0277bd",
    infoForeground: "#ffffff",
    // Estruturais neutros
    border: "#cfd8dc",
    input: "#cfd8dc",
    ring: "#1565c0",
    selection: "#bbdefb",
    selectionForeground: "#0d1b2a",
    overlay: "rgba(13, 27, 42, 0.55)",
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    monospaceFamily: '"SFMono-Regular", "Cascadia Mono", monospace',
    baseSize: "16px",
    scaleRatio: 1.2,
  },
  radii: {
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(30, 64, 175, 0.08)",
    sm: "0 1px 4px 0 rgba(30, 64, 175, 0.12)",
    md: "0 12px 30px -20px rgba(37, 99, 235, 0.36)",
    lg: "0 24px 56px -32px rgba(37, 99, 235, 0.40)",
    xl: "0 36px 86px -44px rgba(29, 78, 216, 0.44)",
  },
};

export const greenTheme: ThemeConfig = {
  name: "cm-green",
  colors: {
    // Base neutra natural — fundo stone suave, cards brancas
    background: "#f5f5f4",
    foreground: "#1b2e1b",
    muted: "#e7e5e4",
    mutedForeground: "#57534e",
    card: "#ffffff",
    cardForeground: "#1b2e1b",
    popover: "#ffffff",
    popoverForeground: "#1b2e1b",
    // Green brand — verde escuro floresta
    primary: "#2e7d32",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#f1f6f1",
    // Secondary dark — verde-musgo profundo para contraste
    secondary: "#1b3a1b",
    secondaryForeground: "#f5f5f4",
    // Accent — dourado terroso como complementar quente
    accent: "#bf8c00",
    accentForeground: "#ffffff",
    // Status colors
    success: "#388e3c",
    successForeground: "#ffffff",
    warning: "#f9a825",
    warningForeground: "#1b2e1b",
    danger: "#c62828",
    dangerForeground: "#ffffff",
    info: "#1565c0",
    infoForeground: "#ffffff",
    // Estruturais neutros
    border: "#d6d3d1",
    input: "#d6d3d1",
    ring: "#2e7d32",
    selection: "#c8e6c9",
    selectionForeground: "#1b2e1b",
    overlay: "rgba(27, 46, 27, 0.55)",
  },
  typography: {
    fontFamily: '"Optima", "Trebuchet MS", sans-serif',
    monospaceFamily: '"Cascadia Mono", "Courier New", monospace',
    baseSize: "16px",
    scaleRatio: 1.19,
  },
  radii: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(20, 83, 45, 0.08)",
    sm: "0 2px 5px 0 rgba(20, 83, 45, 0.12)",
    md: "0 14px 32px -22px rgba(47, 111, 62, 0.38)",
    lg: "0 26px 58px -34px rgba(47, 111, 62, 0.40)",
    xl: "0 38px 88px -46px rgba(20, 83, 45, 0.44)",
  },
};

export const violetTheme: ThemeConfig = {
  name: "cm-violet",
  colors: {
    // Base neutra fria — fundo lavanda acinzentado, cards brancas
    background: "#f5f4f7",
    foreground: "#1a1625",
    muted: "#e8e6ed",
    mutedForeground: "#6b6478",
    card: "#ffffff",
    cardForeground: "#1a1625",
    popover: "#ffffff",
    popoverForeground: "#1a1625",
    // Violet brand — roxo profundo e vibrante
    primary: "#6a1b9a",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#caaddb",
    // Secondary dark — índigo escuro para contraste
    secondary: "#1a1040",
    secondaryForeground: "#f5f4f7",
    // Accent — turquesa como complementar vibrante
    accent: "#00897b",
    accentForeground: "#ffffff",
    // Status colors
    success: "#2e7d32",
    successForeground: "#ffffff",
    warning: "#f9a825",
    warningForeground: "#1a1625",
    danger: "#c62828",
    dangerForeground: "#ffffff",
    info: "#1565c0",
    infoForeground: "#ffffff",
    // Estruturais neutros
    border: "#d1cfd6",
    input: "#d1cfd6",
    ring: "#6a1b9a",
    selection: "#e1bee7",
    selectionForeground: "#1a1625",
    overlay: "rgba(26, 22, 37, 0.55)",
  },
  typography: {
    fontFamily: '"Gill Sans", "Avenir Next", sans-serif',
    monospaceFamily: '"JetBrains Mono", monospace',
    baseSize: "16px",
    scaleRatio: 1.24,
  },
  radii: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.875rem",
    lg: "1.25rem",
    xl: "1.5rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(88, 28, 135, 0.10)",
    sm: "0 2px 6px 0 rgba(88, 28, 135, 0.14)",
    md: "0 14px 34px -20px rgba(109, 40, 217, 0.40)",
    lg: "0 26px 64px -34px rgba(8, 145, 178, 0.34)",
    xl: "0 42px 94px -48px rgba(109, 40, 217, 0.44)",
  },
};

export const midnightTheme: ThemeConfig = {
  name: "cm-midnight",
  colorScheme: "dark",
  colors: {
    background: "#070d1a",
    foreground: "#e2e8f0",
    muted: "#0f1a2e",
    mutedForeground: "#94a3b8",
    card: "#0c1525",
    cardForeground: "#e2e8f0",
    popover: "#101e33",
    popoverForeground: "#e0f2fe",
    primary: "#818cf8",
    primaryForeground: "#0f172a",
    primaryMutedForeground: "#212a4b",
    secondary: "#6366f1",
    secondaryForeground: "#f5f3ff",
    accent: "#a78bfa",
    accentForeground: "#1e1b4b",
    success: "#34d399",
    successForeground: "#022c22",
    warning: "#fbbf24",
    warningForeground: "#422006",
    danger: "#f87171",
    dangerForeground: "#ffffff",
    info: "#38bdf8",
    infoForeground: "#082f49",
    border: "#1e2d45",
    input: "#1e3050",
    ring: "#818cf8",
    selection: "#3730a3",
    selectionForeground: "#e0e7ff",
    overlay: "rgba(7, 13, 26, 0.70)",
  },
  typography: {
    fontFamily: '"Segoe UI", "Inter", sans-serif',
    monospaceFamily: '"JetBrains Mono", "Cascadia Mono", monospace',
    baseSize: "16px",
    scaleRatio: 1.21,
  },
  radii: {
    xs: "0.125rem",
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem",
    xl: "1.25rem",
    full: "9999px",
  },
  // Sombras escuras nítidas: base preta-azulada com anel indigo discreto,
  // sem halos rosa/violeta que tiravam a nitidez das superfícies.
  shadows: {
    xs: "0 1px 2px 0 rgba(2, 6, 23, 0.5)",
    sm: "0 2px 5px -1px rgba(2, 6, 23, 0.55)",
    md: "0 0 0 1px rgba(129, 140, 248, 0.08), 0 8px 20px -10px rgba(2, 6, 23, 0.6)",
    lg: "0 0 0 1px rgba(129, 140, 248, 0.09), 0 14px 32px -14px rgba(2, 6, 23, 0.65)",
    xl: "0 0 0 1px rgba(129, 140, 248, 0.1), 0 22px 52px -18px rgba(2, 6, 23, 0.7)",
  },
};

export const roseTheme: ThemeConfig = {
  name: "cm-rose",
  colors: {
    // Base neutra rosada suavíssima — fundo off-white, cards brancas
    background: "#f6f4f5",
    foreground: "#2d1a24",
    muted: "#ebe7e9",
    mutedForeground: "#6d5c63",
    card: "#ffffff",
    cardForeground: "#2d1a24",
    popover: "#ffffff",
    popoverForeground: "#2d1a24",
    // Rose brand — rosa intenso elegante
    primary: "#ad1457",
    primaryForeground: "#ffffff",
    primaryMutedForeground: "#edcbda",
    // Secondary dark — burgundy profundo para contraste
    secondary: "#311b28",
    secondaryForeground: "#f6f4f5",
    // Accent — dourado rosé como complementar sofisticado
    accent: "#c6a700",
    accentForeground: "#ffffff",
    // Status colors
    success: "#2e7d32",
    successForeground: "#ffffff",
    warning: "#f9a825",
    warningForeground: "#2d1a24",
    danger: "#c62828",
    dangerForeground: "#ffffff",
    info: "#1565c0",
    infoForeground: "#ffffff",
    // Estruturais neutros
    border: "#d4d0d2",
    input: "#d4d0d2",
    ring: "#ad1457",
    selection: "#f8bbd0",
    selectionForeground: "#2d1a24",
    overlay: "rgba(45, 26, 36, 0.55)",
  },
  typography: {
    fontFamily: '"Hoefler Text", Georgia, serif',
    monospaceFamily: '"Courier New", monospace',
    baseSize: "16px",
    scaleRatio: 1.2,
  },
  radii: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(159, 18, 57, 0.08)",
    sm: "0 2px 5px 0 rgba(159, 18, 57, 0.12)",
    md: "0 14px 34px -22px rgba(190, 24, 93, 0.34)",
    lg: "0 26px 62px -36px rgba(15, 118, 110, 0.28)",
    xl: "0 40px 92px -48px rgba(190, 24, 93, 0.38)",
  },
};

export const auroraTheme: ThemeConfig = {
  name: "cm-aurora",
  colorScheme: "dark",
  colors: {
    background: "#11110f",
    foreground: "#fff8e6",
    muted: "#24231f",
    mutedForeground: "#bdb5a4",
    card: "#191b17",
    cardForeground: "#fff8e6",
    popover: "#20251f",
    popoverForeground: "#fff8e6",
    primary: "#ffb703",
    primaryForeground: "#1d1200",
    primaryMutedForeground: "#694901",
    secondary: "#84e6bf",
    secondaryForeground: "#082219",
    accent: "#ff6f61",
    accentForeground: "#2a0a06",
    success: "#5be49b",
    successForeground: "#052316",
    warning: "#ffd166",
    warningForeground: "#241600",
    danger: "#ff6b6b",
    dangerForeground: "#2b0707",
    info: "#7dd3fc",
    infoForeground: "#082337",
    border: "#393a30",
    input: "#4a463a",
    ring: "#ffb703",
    selection: "#6f5c2f",
    selectionForeground: "#fff8e6",
    overlay: "rgba(12, 12, 10, 0.72)",
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", "Segoe UI", sans-serif',
    monospaceFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
    baseSize: "16px",
    scaleRatio: 1.22,
  },
  radii: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    full: "9999px",
  },
  // Sombras escuras nítidas: o anel âmbar de 1px mantém a identidade aurora,
  // mas o glow difuso (0 0 NNpx) saiu — era ele que borrava os cards.
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 248, 230, 0.05)",
    sm: "0 2px 6px -2px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 248, 230, 0.06)",
    md: "0 8px 20px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 183, 3, 0.12)",
    lg: "0 14px 32px -16px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 183, 3, 0.12)",
    xl: "0 22px 52px -22px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 183, 3, 0.14)",
  },
  space: {
    none: "0",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.875rem",
    lg: "1.125rem",
    xl: "1.75rem",
    "2xl": "2.5rem",
    "3xl": "3.5rem",
  },
  zIndex: {
    base: "0",
    docked: "30",
    dropdown: "520",
    sticky: "40",
    overlay: "800",
    modal: "900",
    toast: "1100",
    tooltip: "1200",
  },
  motion: {
    duration: {
      fast: "120ms",
      base: "220ms",
      slow: "360ms",
    },
    ease: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  density: {
    compact: {
      controlHeight: "2.125rem",
      controlPaddingX: "0.625rem",
      controlPaddingY: "0.375rem",
      gap: "0.375rem",
      iconSize: "1rem",
    },
    default: {
      controlHeight: "2.625rem",
      controlPaddingX: "0.95rem",
      controlPaddingY: "0.5625rem",
      gap: "0.625rem",
      iconSize: "1.125rem",
    },
    comfortable: {
      controlHeight: "3.125rem",
      controlPaddingX: "1.25rem",
      controlPaddingY: "0.75rem",
      gap: "0.875rem",
      iconSize: "1.25rem",
    },
  },
  // Tinturas bem mais leves que antes (4–6% vs 10–18%): o degradê forte de
  // primary/secondary sobre os cards lavava o contraste do texto.
  layers: {
    base: "radial-gradient(circle at 12% 0%, rgba(255, 183, 3, 0.08), transparent 30%), radial-gradient(circle at 88% 14%, rgba(132, 230, 191, 0.07), transparent 32%), var(--color-background)",
    surface:
      "linear-gradient(145deg, color-mix(in srgb, var(--color-card) 96%, var(--color-primary) 4%), var(--color-card))",
    elevated:
      "linear-gradient(145deg, color-mix(in srgb, var(--color-card) 94%, var(--color-secondary) 6%), var(--color-card))",
    floating:
      "linear-gradient(145deg, color-mix(in srgb, var(--color-popover) 95%, var(--color-primary) 5%), var(--color-popover))",
    overlay: "rgba(12, 12, 10, 0.72)",
  },
};

export const themes: ThemeRegistry = {
  [defaultTheme.name]: defaultTheme,
  [schoolTheme.name]: schoolTheme,
  [darkTheme.name]: darkTheme,
  [orangeTheme.name]: orangeTheme,
  [redTheme.name]: redTheme,
  [blueTheme.name]: blueTheme,
  [greenTheme.name]: greenTheme,
  [violetTheme.name]: violetTheme,
  [midnightTheme.name]: midnightTheme,
  [roseTheme.name]: roseTheme,
  [auroraTheme.name]: auroraTheme,
};

export type CustomThemeInput = ThemeConfig[] | ThemeRegistry;

export const extendThemes = (customThemes?: CustomThemeInput): ThemeRegistry => {
  if (!customThemes) {
    return themes;
  }

  const customEntries = Array.isArray(customThemes)
    ? customThemes.map((theme) => [theme.name, theme] as const)
    : Object.entries(customThemes);

  return {
    ...themes,
    ...Object.fromEntries(customEntries.filter(([name, theme]) => name && theme?.name)),
  };
};
