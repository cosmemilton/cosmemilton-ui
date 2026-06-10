// Build the published CSS bundles from the partials in src/styles/.
//
// Layers: everything ships inside @layer cm.* (reset → tokens → components),
// so plain unlayered consumer CSS always wins over the library — overriding a
// token or a component style never needs a specificity war.
//
// Bundles:
//   dist/styles.css      global reboot + scoped reboot + tokens + components —
//                        for apps owned end-to-end by the library.
//   dist/components.css  scoped reboot only — for incremental adoption inside
//                        an existing app (page-level styles stay untouched).
// Both are also emitted minified (.min.css). Autoprefixer targets the
// .browserslistrc baseline; it also validates the partials parse cleanly.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcss from "postcss";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stylesDir = join(root, "src", "styles");
const distDir = join(root, "dist");

const GLOBAL_REBOOT = "00-reboot.css";
const THEME_TOKENS = "00a-theme-tokens.generated.css";
const SCOPED_REBOOT = "00b-scoped-reboot.css";

// Partials are numbered (NN-*.css) so a lexical sort preserves cascade order.
const allPartials = (await readdir(stylesDir)).filter((name) => name.endsWith(".css")).sort();
const componentPartials = allPartials.filter(
  (name) => ![GLOBAL_REBOOT, THEME_TOKENS, SCOPED_REBOOT].includes(name),
);

const concat = async (names) =>
  (await Promise.all(names.map((name) => readFile(join(stylesDir, name), "utf8")))).join("");

const layer = (name, css) => `@layer ${name} {\n${css}}\n`;

const bundle = async (resetFiles) =>
  "@layer cm.reset, cm.tokens, cm.components;\n" +
  layer("cm.reset", await concat(resetFiles)) +
  layer("cm.tokens", await concat([THEME_TOKENS])) +
  layer("cm.components", await concat(componentPartials));

const prettyPipeline = postcss([autoprefixer]);
const minPipeline = postcss([autoprefixer, cssnano]);

const emit = async (name, css) => {
  const pretty = await prettyPipeline.process(css, { from: undefined });
  await writeFile(join(distDir, `${name}.css`), pretty.css);
  const min = await minPipeline.process(css, { from: undefined });
  await writeFile(join(distDir, `${name}.min.css`), min.css);
  console.log(
    `build-styles: ${name}.css ${(pretty.css.length / 1024).toFixed(1)}kB · ` +
      `${name}.min.css ${(min.css.length / 1024).toFixed(1)}kB`,
  );
};

await mkdir(distDir, { recursive: true });
await emit("styles", await bundle([GLOBAL_REBOOT, SCOPED_REBOOT]));
await emit("components", await bundle([SCOPED_REBOOT]));
