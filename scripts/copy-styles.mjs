import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "src", "styles.css");
const target = join(root, "dist", "styles.css");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
