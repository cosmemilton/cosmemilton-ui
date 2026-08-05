// Vendoriza a fonte da verdade dos tokens (packages/tokens/src) em src/lib/theme,
// prefixando cada arquivo com um banner de "gerado". A cópia vendorizada existe
// para que o pipeline da lib (tsc rootDir src, vitest include src/**, eslint,
// generate-theme-css.mjs) continue intocado e o dist publicado não dependa de
// um pacote ainda não publicado no npm.
//
// A lista de arquivos vem de readdir na fonte: arquivo novo em packages/tokens/src
// entra sozinho na sincronização, e arquivo removido lá vira órfão detectado
// (apagado no modo write, erro no modo --check).
//
// Uso: node scripts/sync-tokens.mjs          → escreve a cópia (remove órfãos)
//      node scripts/sync-tokens.mjs --check  → sai com código 1 se a cópia divergir
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(root, "packages", "tokens", "src");
const targetDir = join(root, "src", "lib", "theme");

// Comparações e escrita sempre em LF, para o --check não falhar espuriamente em
// checkouts com core.autocrlf.
const normalize = (text) => text.replace(/\r\n/g, "\n");

const banner = (file) =>
  [
    "// GENERATED FILE — DO NOT EDIT.",
    `// Source: packages/tokens/src/${file} · Sync: scripts/sync-tokens.mjs (npm run sync:tokens)`,
    "",
  ].join("\n");

const listTs = async (dir) => (await readdir(dir)).filter((name) => name.endsWith(".ts")).sort();

const check = process.argv.includes("--check");
const sourceFiles = await listTs(sourceDir);
if (sourceFiles.length === 0) {
  console.error(`sync-tokens: nenhum arquivo .ts em ${sourceDir} — checkout incompleto?`);
  process.exit(1);
}

// Lê tudo antes de escrever qualquer coisa: uma fonte ilegível não pode deixar
// a vendorização pela metade.
const expected = new Map();
for (const file of sourceFiles) {
  expected.set(file, banner(file) + normalize(await readFile(join(sourceDir, file), "utf8")));
}

const orphans = (await listTs(targetDir)).filter((name) => !expected.has(name));
const stale = [];

for (const [file, content] of expected) {
  const targetPath = join(targetDir, file);
  if (check) {
    const current = await readFile(targetPath, "utf8").catch(() => null);
    if (current === null || normalize(current) !== content) stale.push(file);
  } else {
    await writeFile(targetPath, content);
  }
}

if (check) {
  if (stale.length > 0 || orphans.length > 0) {
    if (stale.length > 0) {
      console.error(
        `sync-tokens: cópia vendorizada divergente em src/lib/theme: ${stale.join(", ")}.`,
      );
    }
    if (orphans.length > 0) {
      console.error(
        `sync-tokens: órfãos em src/lib/theme sem fonte correspondente: ${orphans.join(", ")}.`,
      );
    }
    console.error("Edite packages/tokens/src e rode: npm run sync:tokens");
    process.exit(1);
  }
  console.log(`sync-tokens: cópia vendorizada em sincronia (${sourceFiles.length} arquivos)`);
} else {
  for (const orphan of orphans) {
    await rm(join(targetDir, orphan));
  }
  const removed = orphans.length > 0 ? `, ${orphans.length} órfão(s) removido(s)` : "";
  console.log(
    `sync-tokens: ${sourceFiles.length} arquivos vendorizados em src/lib/theme${removed}`,
  );
}
