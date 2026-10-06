import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_SYMBOL } from "../dist/lib/brand-symbol.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist");
const symbol = `<image width="${BRAND_SYMBOL.width}" height="${BRAND_SYMBOL.height}" href="${BRAND_SYMBOL.href}"/>`;

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_SYMBOL.viewBox}" role="img" aria-labelledby="brand-mark-title"><title id="brand-mark-title">cosmemilton-ui</title>${symbol}</svg>\n`;
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_SYMBOL.viewBox}" role="img" aria-labelledby="brand-title"><title id="brand-title">cosmemilton-ui</title>${symbol}</svg>\n`;

await mkdir(distDir, { recursive: true });
await Promise.all([
  writeFile(join(distDir, "brand-mark.svg"), mark),
  writeFile(join(distDir, "brand.svg"), tile),
  copyFile(join(root, "src/assets/brand.png"), join(distDir, "brand.png")),
]);
console.log("build-brand: PNG and self-contained SVG assets preserve the original CM/UI image");
