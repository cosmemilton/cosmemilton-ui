import {
  defaultTheme,
  extendThemes,
  themeToCSSVars,
  type CustomThemeInput,
} from "../../lib/theme/index.js";

const LOCAL_STORAGE_KEY = "cm-theme";

export type CmThemeScriptProps = {
  customThemes?: CustomThemeInput;
  defaultThemeName?: string;
};

export function CmThemeScript({
  customThemes,
  defaultThemeName = defaultTheme.name,
}: CmThemeScriptProps = {}) {
  const themeRegistry = extendThemes(customThemes);
  const fallbackTheme = themeRegistry[defaultThemeName] ?? defaultTheme;
  const fallbackThemeName = JSON.stringify(fallbackTheme.name);

  const script = `(() => {
    try {
      const registry = ${JSON.stringify(themeToCSSVars(fallbackTheme))};
      const stored = window.localStorage.getItem('${LOCAL_STORAGE_KEY}');
      const preferredThemeName = stored || ${fallbackThemeName};
      const themes = ${JSON.stringify(
        Object.fromEntries(
          Object.entries(themeRegistry).map(([name, theme]) => [name, themeToCSSVars(theme)]),
        ),
      )};
      const themeName = themes[preferredThemeName] ? preferredThemeName : ${fallbackThemeName};
      document.documentElement.setAttribute('data-theme', themeName);
      const vars = themes[themeName] || registry;
      for (const key in vars) {
        document.documentElement.style.setProperty(key, vars[key]);
      }
    } catch (err) {
      console.error('Failed to hydrate theme', err);
    }
  })();`;

  return (
    <script
      id="cm-theme-script"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
