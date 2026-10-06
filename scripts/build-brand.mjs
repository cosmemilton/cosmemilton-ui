import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_SYMBOL } from "../dist/lib/brand-symbol.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist");
const paths = BRAND_SYMBOL.paths.map((path) => `<path d="${path}"/>`).join("");
const symbol = `<g fill="none" stroke="currentColor" stroke-width="${BRAND_SYMBOL.strokeWidth}" stroke-linecap="${BRAND_SYMBOL.linecap}" stroke-linejoin="${BRAND_SYMBOL.linejoin}">${paths}</g>`;

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_SYMBOL.viewBox}" role="img" aria-labelledby="brand-mark-title"><title id="brand-mark-title">cosmemilton-ui</title>${symbol}</svg>\n`;
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_SYMBOL.viewBox}" role="img" aria-labelledby="brand-title"><title id="brand-title">cosmemilton-ui</title><rect width="24" height="24" rx="5" fill="#4f46e5"/><g color="#fff">${symbol}</g></svg>\n`;

await mkdir(distDir, { recursive: true });
await Promise.all([
  writeFile(join(distDir, "brand-mark.svg"), mark),
  writeFile(join(distDir, "brand.svg"), tile),
]);
console.log("build-brand: brand.svg and brand-mark.svg generated from shared CM geometry");
