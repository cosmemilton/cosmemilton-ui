// Generate src/styles/00a-theme-tokens.generated.css from the theme registry,
// so every built-in theme ships as static CSS inside dist/styles.css and the
// library works with a plain stylesheet import — no runtime JS required to
// resolve design tokens.
//
// Bundles the TypeScript registry directly so the generator also works in a
// clean checkout where dist/ does not exist yet. Runs before build-styles.mjs,
// which concatenates src/styles/*.css lexically, so the "00a-" prefix lands
// right after the 00 reset partial.
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(root, "src", "styles", "00a-theme-tokens.generated.css");

const themeBundle = await build({
  entryPoints: [join(root, "src", "lib", "theme", "index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: ["node18"],
  write: false,
});
const themeModule = themeBundle.outputFiles[0]?.text;

if (!themeModule) {
  throw new Error("generate-theme-css: esbuild did not emit the theme registry");
}

const { defaultTheme, themes, themeToCSSBlock } = await import(
  `data:text/javascript;base64,${Buffer.from(themeModule).toString("base64")}`
);

const banner = [
  "/*",
  " * GENERATED FILE — DO NOT EDIT.",
  " * Source: src/lib/theme/themes.ts · Generator: scripts/generate-theme-css.mjs",
  " * Regenerate with: npm run build",
  " */",
].join("\n");

// Bare :root carries the default theme so markup without data-theme (or with
// JavaScript disabled) still renders fully styled. The per-theme blocks use
// :root[data-theme="…"] (0,2,0), which beats :root (0,1,0) regardless of order.
const blocks = [
  themeToCSSBlock(defaultTheme, ":root"),
  ...Object.values(themes).map((theme) => themeToCSSBlock(theme)),
];

await writeFile(target, `${banner}\n${blocks.join("\n")}\n`);
console.log(`generate-theme-css: wrote ${blocks.length} theme blocks to ${target}`);
