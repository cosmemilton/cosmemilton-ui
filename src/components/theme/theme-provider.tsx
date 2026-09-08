"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  customThemeCSS,
  extendThemes,
  defaultTheme,
  type CustomThemeInput,
  type ThemeConfig,
  type ThemeRegistry,
} from "../../lib/theme/index.js";
import type { CmDensity } from "../ui/types.js";

export type CmThemeChrome = "surface" | "inverted";
/** Component appearance. Explicit opt-in keeps existing applications unchanged. */
export type CmThemeSkin = "classic" | "horizonte";

type ThemeContextValue = {
  theme: ThemeConfig;
  themes: ThemeRegistry;
  setThemeByName: (name: string) => void;
  density: CmDensity;
  setDensity: (density: CmDensity) => void;
  chrome: CmThemeChrome;
  setChrome: (chrome: CmThemeChrome) => void;
  skin: CmThemeSkin;
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
  /** Applied to <html>, including dialogs and menus rendered through portals. */
  skin?: CmThemeSkin;
};

// Built-in theme tokens ship statically inside styles.css, so switching themes
// is just an attribute flip — no inline custom properties on <html>, which
// would outrank any consumer stylesheet and block token overrides via CSS.
const applyTheme = (theme: ThemeConfig) => {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme.name);
};

// Consumer custom themes are not part of the static CSS; inject their token
// blocks once into a shared <style> tag. Reuses the tag CmThemeScript may have
// already server-rendered (same id) to avoid duplicate rules.
const CUSTOM_THEME_STYLE_ID = "cm-theme-custom";

const ensureCustomThemeStyles = (registry: ThemeRegistry) => {
  if (typeof document === "undefined") return;

  const css = customThemeCSS(registry);
  if (!css) return;
  let styleElement = document.getElementById(CUSTOM_THEME_STYLE_ID) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = CUSTOM_THEME_STYLE_ID;
    document.head.appendChild(styleElement);
  }
  if (styleElement.textContent !== css) {
    styleElement.textContent = css;
  }
};

const applyThemePreferences = (density: CmDensity, chrome: CmThemeChrome, skin: CmThemeSkin) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-density", density);
  root.setAttribute("data-cm-chrome", chrome);
  root.setAttribute("data-cm-skin", skin);
};

export function CmThemeProvider({
  chrome,
  children,
  customThemes,
  defaultChrome = "surface",
  defaultDensity = "default",
  defaultThemeName = defaultTheme.name,
  density,
  skin = "classic",
}: CmThemeProviderProps) {
  const themeRegistry = useMemo(() => extendThemes(customThemes), [customThemes]);
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
    if (
      !density &&
      (storedDensity === "default" ||
        storedDensity === "comfortable" ||
        storedDensity === "compact")
    ) {
      setUncontrolledDensity(storedDensity);
    }
    const storedChrome = window.localStorage.getItem(LOCAL_STORAGE_CHROME) as CmThemeChrome | null;
    const storedInvert = window.localStorage.getItem(LOCAL_STORAGE_INVERT_HEADER);
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
  const effectiveChrome: CmThemeChrome = theme.colorScheme === "dark" ? "surface" : requestedChrome;
  const effectiveInvert = effectiveChrome === "inverted";

  const setDensity = useCallback(
    (nextDensity: CmDensity) => {
      if (density === undefined) {
        setUncontrolledDensity(nextDensity);
      }
      window.localStorage.setItem(LOCAL_STORAGE_DENSITY, nextDensity);
    },
    [density],
  );

  const setChrome = useCallback(
    (nextChrome: CmThemeChrome) => {
      if (chrome === undefined) {
        setUncontrolledChrome(nextChrome);
      }
      window.localStorage.setItem(LOCAL_STORAGE_CHROME, nextChrome);
      window.localStorage.setItem(LOCAL_STORAGE_INVERT_HEADER, String(nextChrome === "inverted"));
    },
    [chrome],
  );

  const setInvertHeader = useCallback(
    (value: boolean) => {
      setChrome(value ? "inverted" : "surface");
    },
    [setChrome],
  );

  useEffect(() => {
    ensureCustomThemeStyles(themeRegistry);
  }, [themeRegistry]);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, theme.name);
  }, [theme]);

  useEffect(() => {
    applyThemePreferences(requestedDensity, effectiveChrome, skin);
  }, [effectiveChrome, requestedDensity, skin]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      chrome: effectiveChrome,
      density: requestedDensity,
      skin,
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
    [
      effectiveChrome,
      effectiveInvert,
      requestedDensity,
      skin,
      theme,
      themeRegistry,
      setChrome,
      setDensity,
      setInvertHeader,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useCmTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useCmTheme must be used within CmThemeProvider");
  }

  return ctx;
}

export function useOptionalCmTheme() {
  return useContext(ThemeContext);
}
