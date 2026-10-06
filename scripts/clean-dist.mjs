import { rm } from "node:fs/promises";

// Removed components must not survive in a later npm package.
await rm(new URL("../dist/", import.meta.url), { recursive: true, force: true });
