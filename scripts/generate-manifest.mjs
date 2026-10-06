import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const srcDir = path.resolve(__dirname, "../src");
async function generateManifest() {
  const manifest = {};
  const values = new Map();
  for (const entry of ["client", "server", "theme", "map"]) {
    const module = await import(`file://${path.resolve(distDir, `${entry}.js`)}`);
    for (const key of Object.keys(module)) {
      if (key === "default") continue;
      if (values.has(key) && values.get(key) !== module[key])
        throw new Error(`Conflicting duplicate export: ${key}`);
      values.set(key, module[key]);
      manifest[key] = entry;
    }
  }
  await fs.writeFile(path.resolve(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  const rootEntry = '// Generated server-safe root entry.\nexport * from "./server.js";\n';
  await fs.writeFile(path.resolve(srcDir, "index.ts"), rootEntry);
  await fs.writeFile(path.resolve(distDir, "index.js"), rootEntry);
  await fs.writeFile(path.resolve(distDir, "index.d.ts"), rootEntry);
  console.log(
    `Generated manifest with ${Object.keys(manifest).length} exports and actual server-safe root.`,
  );
}
generateManifest().catch((error) => {
  console.error(error);
  process.exit(1);
});
