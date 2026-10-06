import {
  customThemeCSS,
  defaultTheme,
  extendThemes,
  type CustomThemeInput,
} from "../../lib/theme/index.js";
import type { CmDensity } from "../ui/types.js";
import type { CmThemeSkin } from "./theme-provider.js";

const LOCAL_STORAGE_KEY = "cm-theme";
const LOCAL_STORAGE_DENSITY = "cm-density";

const densities: CmDensity[] = ["default", "comfortable", "compact"];

// JSON.stringify alone is unsafe inside an inline <script>: it leaves "</script>"
// and the JS line terminators U+2028/U+2029 intact, which let an attacker-controlled
// theme name break out of the script element. Neutralize them as unicode escapes.
const serializeForScript = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export type CmThemeScriptProps = {
  /** Unique bootstrap id; custom themes use `${id}-custom` for their style tag. */
  id?: string;
  customThemes?: CustomThemeInput;
  defaultThemeName?: string;
  storageKey?: string | false;
  /** Pass the same appearance as CmThemeProvider to avoid a first-paint flash. */
  skin?: CmThemeSkin;
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
  id = "cm-theme-script",
  nonce,
  skin = "classic",
  storageKey = LOCAL_STORAGE_KEY,
}: CmThemeScriptProps = {}) {
  const themeRegistry = extendThemes(customThemes);
  const fallbackThemeName = themeRegistry[defaultThemeName] ? defaultThemeName : defaultTheme.name;
  const fallbackDensity = densities.includes(defaultDensity) ? defaultDensity : "default";
  const customCSS = customThemeCSS(themeRegistry);
  const customStyleId = id === "cm-theme-script" ? "cm-theme-custom" : `${id}-custom`;

  const script = `(() => {
    document.documentElement.setAttribute('data-cm-skin', ${serializeForScript(skin)});
    const fallback = ${serializeForScript(fallbackThemeName)};
    const fallbackDensity = ${serializeForScript(fallbackDensity)};
    try {
      const names = ${serializeForScript(Object.keys(themeRegistry))};
      const stored = (${serializeForScript(storageKey)} === false ? null : window.localStorage.getItem(${serializeForScript(storageKey)}));
      const themeName = stored && names.includes(stored) ? stored : fallback;
      document.documentElement.setAttribute('data-theme', themeName);
      const densities = ${serializeForScript(densities)};
      const storedDensity = (${serializeForScript(storageKey)} === false ? null : window.localStorage.getItem(${serializeForScript(storageKey === false ? false : storageKey === LOCAL_STORAGE_KEY ? LOCAL_STORAGE_DENSITY : `${storageKey}-density`)}));
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
        <style id={customStyleId} nonce={nonce} dangerouslySetInnerHTML={{ __html: customCSS }} />
      ) : null}
      <script
        id={id}
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: script }}
      />
    </>
  );
}
