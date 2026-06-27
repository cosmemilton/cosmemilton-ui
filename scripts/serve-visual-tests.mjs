import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, "tmp", "visual-tests");
const host = "127.0.0.1";
const port = 4178;

await import("./generate-theme-css.mjs");
await import("./build-styles.mjs");
await mkdir(outputDir, { recursive: true });

await build({
  entryPoints: [join(root, "tests", "visual", "fixture.tsx")],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  outfile: join(outputDir, "fixture.js"),
  platform: "browser",
  target: ["chrome120"],
  sourcemap: true,
});

const indexHtml = `<!doctype html>
<html lang="pt-BR" data-theme="cm-neutral">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CosmeMilton UI — testes visuais</title>
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/fixture.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/fixture.js"></script>
  </body>
</html>`;

const files = new Map([
  ["/fixture.js", join(outputDir, "fixture.js")],
  ["/fixture.js.map", join(outputDir, "fixture.js.map")],
  ["/styles.css", join(root, "dist", "styles.css")],
  ["/fixture.css", join(root, "tests", "visual", "fixture.css")],
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;

  if (pathname === "/" || pathname === "/index.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(indexHtml);
    return;
  }

  if (pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  const path = files.get(pathname);
  if (!path) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  try {
    const body = await readFile(path);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes[extname(path)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500);
    response.end(error instanceof Error ? error.message : "Unable to read fixture asset");
  }
});

server.listen(port, host, () => {
  console.log(`visual-tests: http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
