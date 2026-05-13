"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  extendThemes,
  defaultTheme,
  themeToCSSVars,
  type CustomThemeInput,
  type ThemeConfig,
  type ThemeRegistry,
} from "../../lib/theme/index.js";

type ThemeContextValue = {
  theme: ThemeConfig;
  themes: ThemeRegistry;
  setThemeByName: (name: string) => void;
  invertHeader: boolean;
  setInvertHeader: (value: boolean) => void;
};

const LOCAL_STORAGE_KEY = "cm-theme";
const LOCAL_STORAGE_INVERT_HEADER = "cm-invert-header";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export type CmThemeProviderProps = {
  children: ReactNode;
  customThemes?: CustomThemeInput;
  defaultThemeName?: string;
};

const applyTheme = (theme: ThemeConfig) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme.name);
  const variables = themeToCSSVars(theme);
  Object.entries(variables).forEach(([token, value]) => {
    if (value !== undefined && value !== null) {
      root.style.setProperty(token, String(value));
    }
  });
};

export function CmThemeProvider({
  children,
  customThemes,
  defaultThemeName = defaultTheme.name,
}: CmThemeProviderProps) {
  const themeRegistry = useMemo(
    () => extendThemes(customThemes),
    [customThemes],
  );
  const fallbackTheme = themeRegistry[defaultThemeName] ?? defaultTheme;
  const [themeName, setThemeName] = useState<string>(fallbackTheme.name);
  const [invertHeader, setInvertHeaderState] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && themeRegistry[stored]) {
      setThemeName(stored);
    }
    const storedInvert = window.localStorage.getItem(
      LOCAL_STORAGE_INVERT_HEADER,
    );
    if (storedInvert === "true") {
      setInvertHeaderState(true);
    }
  }, [themeRegistry]);

  const theme = useMemo<ThemeConfig>(
    () => themeRegistry[themeName] ?? fallbackTheme,
    [fallbackTheme, themeName, themeRegistry],
  );

  // Desativar invertHeader automaticamente para temas escuros
  const darkThemes = ["cm-dark", "cm-midnight"];
  const effectiveInvert = darkThemes.includes(theme.name)
    ? false
    : invertHeader;

  const setInvertHeader = (value: boolean) => {
    setInvertHeaderState(value);
    window.localStorage.setItem(LOCAL_STORAGE_INVERT_HEADER, String(value));
  };

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, theme.name);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themes: themeRegistry,
      setThemeByName: (name: string) => {
        if (themeRegistry[name]) {
          setThemeName(name);
        }
      },
      invertHeader: effectiveInvert,
      setInvertHeader,
    }),
    [theme, effectiveInvert, themeRegistry],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useCmTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useCmTheme must be used within CmThemeProvider");
  }

  return ctx;
}

