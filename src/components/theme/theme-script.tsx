import {
  customThemeCSS,
  defaultTheme,
  extendThemes,
  type CustomThemeInput,
} from "../../lib/theme/index.js";
import type { CmDensity } from "../ui/types.js";

const LOCAL_STORAGE_KEY = "cm-theme";
const LOCAL_STORAGE_DENSITY = "cm-density";

const densities: CmDensity[] = ["default", "comfortable", "compact"];

export type CmThemeScriptProps = {
  customThemes?: CustomThemeInput;
  defaultThemeName?: string;
  /**
   * Density applied when localStorage has no persisted value. Pass the same
   * value as CmThemeProvider's defaultDensity to avoid a density flash on
   * first paint.
   */
  defaultDensity?: CmDensity;
  /**
   * CSP nonce forwarded to the inline <script>/<style> tags, for apps whose
   * Content-Security-Policy omits 'unsafe-inline'.
   */
  nonce?: string;
};

/**
 * No-FOUC theme bootstrap for SSR. Built-in theme tokens ship statically in
 * styles.css, so all this script does is pick the persisted theme name and
 * density and set `data-theme`/`data-density` before first paint — a few
 * hundred bytes per page instead of serializing every theme's tokens. Consumer
 * custom themes (absent from the static CSS) are emitted once as a <style>
 * block alongside the script.
 */
export function CmThemeScript({
  customThemes,
  defaultDensity = "default",
  defaultThemeName = defaultTheme.name,
  nonce,
}: CmThemeScriptProps = {}) {
  const themeRegistry = extendThemes(customThemes);
  const fallbackThemeName = themeRegistry[defaultThemeName] ? defaultThemeName : defaultTheme.name;
  const fallbackDensity = densities.includes(defaultDensity) ? defaultDensity : "default";
  const customCSS = customThemeCSS(themeRegistry);

  const script = `(() => {
    const fallback = ${JSON.stringify(fallbackThemeName)};
    const fallbackDensity = ${JSON.stringify(fallbackDensity)};
    try {
      const names = ${JSON.stringify(Object.keys(themeRegistry))};
      const stored = window.localStorage.getItem('${LOCAL_STORAGE_KEY}');
      const themeName = stored && names.includes(stored) ? stored : fallback;
      document.documentElement.setAttribute('data-theme', themeName);
      const densities = ${JSON.stringify(densities)};
      const storedDensity = window.localStorage.getItem('${LOCAL_STORAGE_DENSITY}');
      const density = storedDensity && densities.includes(storedDensity) ? storedDensity : fallbackDensity;
      document.documentElement.setAttribute('data-density', density);
    } catch (err) {
      document.documentElement.setAttribute('data-theme', fallback);
      document.documentElement.setAttribute('data-density', fallbackDensity);
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
