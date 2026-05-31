// Concatenate the per-section CSS partials in src/styles/ into the single
// published dist/styles.css. Partials are numbered (NN-*.css) so a lexical sort
// preserves cascade order. Keeping them separate during development tames the
// formerly 8k-line monolith without changing the shipped output.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stylesDir = join(root, "src", "styles");
const target = join(root, "dist", "styles.css");

const files = (await readdir(stylesDir))
  .filter((name) => name.endsWith(".css"))
  .sort();

const parts = await Promise.all(
  files.map((name) => readFile(join(stylesDir, name), "utf8")),
);

await mkdir(dirname(target), { recursive: true });
await writeFile(target, parts.join(""));
