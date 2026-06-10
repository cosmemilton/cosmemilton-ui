import {
  customThemeCSS,
  defaultTheme,
  extendThemes,
  type CustomThemeInput,
} from "../../lib/theme/index.js";

const LOCAL_STORAGE_KEY = "cm-theme";

export type CmThemeScriptProps = {
  customThemes?: CustomThemeInput;
  defaultThemeName?: string;
  /**
   * CSP nonce forwarded to the inline <script>/<style> tags, for apps whose
   * Content-Security-Policy omits 'unsafe-inline'.
   */
  nonce?: string;
};

/**
 * No-FOUC theme bootstrap for SSR. Built-in theme tokens ship statically in
 * styles.css, so all this script does is pick the persisted theme name and set
 * `data-theme` before first paint — a few hundred bytes per page instead of
 * serializing every theme's tokens. Consumer custom themes (absent from the
 * static CSS) are emitted once as a <style> block alongside the script.
 */
export function CmThemeScript({
  customThemes,
  defaultThemeName = defaultTheme.name,
  nonce,
}: CmThemeScriptProps = {}) {
  const themeRegistry = extendThemes(customThemes);
  const fallbackThemeName = themeRegistry[defaultThemeName] ? defaultThemeName : defaultTheme.name;
  const customCSS = customThemeCSS(themeRegistry);

  const script = `(() => {
    const fallback = ${JSON.stringify(fallbackThemeName)};
    try {
      const names = ${JSON.stringify(Object.keys(themeRegistry))};
      const stored = window.localStorage.getItem('${LOCAL_STORAGE_KEY}');
      const themeName = stored && names.includes(stored) ? stored : fallback;
      document.documentElement.setAttribute('data-theme', themeName);
    } catch (err) {
      document.documentElement.setAttribute('data-theme', fallback);
    }
  })();`;

  return (
    <>
      {customCSS ? (
        <style id="cm-theme-custom" nonce={nonce} dangerouslySetInnerHTML={{ __html: customCSS }} />
      ) : null}
      <script
        id="cm-theme-script"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: script }}
      />
    </>
  );
}
