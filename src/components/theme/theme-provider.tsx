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
import type { CmDensity } from "../ui/types.js";

export type CmThemeChrome = "surface" | "inverted";

type ThemeContextValue = {
  theme: ThemeConfig;
  themes: ThemeRegistry;
  setThemeByName: (name: string) => void;
  density: CmDensity;
  setDensity: (density: CmDensity) => void;
  chrome: CmThemeChrome;
  setChrome: (chrome: CmThemeChrome) => void;
  invertHeader: boolean;
  setInvertHeader: (value: boolean) => void;
};

const LOCAL_STORAGE_KEY = "cm-theme";
const LOCAL_STORAGE_INVERT_HEADER = "cm-invert-header";
const LOCAL_STORAGE_DENSITY = "cm-density";
const LOCAL_STORAGE_CHROME = "cm-chrome";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export type CmThemeProviderProps = {
  children: ReactNode;
  customThemes?: CustomThemeInput;
  defaultThemeName?: string;
  density?: CmDensity;
  defaultDensity?: CmDensity;
  chrome?: CmThemeChrome;
  defaultChrome?: CmThemeChrome;
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

const applyThemePreferences = (density: CmDensity, chrome: CmThemeChrome) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-density", density);
  root.setAttribute("data-cm-chrome", chrome);
};

export function CmThemeProvider({
  chrome,
  children,
  customThemes,
  defaultChrome = "surface",
  defaultDensity = "default",
  defaultThemeName = defaultTheme.name,
  density,
}: CmThemeProviderProps) {
  const themeRegistry = useMemo(
    () => extendThemes(customThemes),
    [customThemes],
  );
  const fallbackTheme = themeRegistry[defaultThemeName] ?? defaultTheme;
  const [themeName, setThemeName] = useState<string>(fallbackTheme.name);
  const [uncontrolledDensity, setUncontrolledDensity] = useState<CmDensity>(defaultDensity);
  const [uncontrolledChrome, setUncontrolledChrome] = useState<CmThemeChrome>(defaultChrome);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && themeRegistry[stored]) {
      setThemeName(stored);
    }
    const storedDensity = window.localStorage.getItem(LOCAL_STORAGE_DENSITY) as CmDensity | null;
    if (!density && (storedDensity === "default" || storedDensity === "comfortable" || storedDensity === "compact")) {
      setUncontrolledDensity(storedDensity);
    }
    const storedChrome = window.localStorage.getItem(LOCAL_STORAGE_CHROME) as CmThemeChrome | null;
    const storedInvert = window.localStorage.getItem(
      LOCAL_STORAGE_INVERT_HEADER,
    );
    if (!chrome && (storedChrome === "surface" || storedChrome === "inverted")) {
      setUncontrolledChrome(storedChrome);
    } else if (!chrome && storedInvert === "true") {
      setUncontrolledChrome("inverted");
    }
  }, [chrome, density, themeRegistry]);

  const theme = useMemo<ThemeConfig>(
    () => themeRegistry[themeName] ?? fallbackTheme,
    [fallbackTheme, themeName, themeRegistry],
  );

  // Desativar invertHeader automaticamente para temas escuros
  const requestedDensity = density ?? uncontrolledDensity;
  const requestedChrome = chrome ?? uncontrolledChrome;
  const darkThemes = ["cm-dark", "cm-midnight"];
  const effectiveChrome: CmThemeChrome = darkThemes.includes(theme.name)
    ? "surface"
    : requestedChrome;
  const effectiveInvert = effectiveChrome === "inverted";

  const setDensity = (nextDensity: CmDensity) => {
    if (density === undefined) {
      setUncontrolledDensity(nextDensity);
    }
    window.localStorage.setItem(LOCAL_STORAGE_DENSITY, nextDensity);
  };

  const setChrome = (nextChrome: CmThemeChrome) => {
    if (chrome === undefined) {
      setUncontrolledChrome(nextChrome);
    }
    window.localStorage.setItem(LOCAL_STORAGE_CHROME, nextChrome);
    window.localStorage.setItem(
      LOCAL_STORAGE_INVERT_HEADER,
      String(nextChrome === "inverted"),
    );
  };

  const setInvertHeader = (value: boolean) => {
    setChrome(value ? "inverted" : "surface");
  };

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, theme.name);
  }, [theme]);

  useEffect(() => {
    applyThemePreferences(requestedDensity, effectiveChrome);
  }, [effectiveChrome, requestedDensity]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      chrome: effectiveChrome,
      density: requestedDensity,
      theme,
      themes: themeRegistry,
      setThemeByName: (name: string) => {
        if (themeRegistry[name]) {
          setThemeName(name);
        }
      },
      setChrome,
      setDensity,
      invertHeader: effectiveInvert,
      setInvertHeader,
    }),
    [effectiveChrome, effectiveInvert, requestedDensity, theme, themeRegistry],
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

