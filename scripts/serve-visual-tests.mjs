import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, "tmp", "visual-tests");
const host = "127.0.0.1";
const port = 4178;

await import("./sync-tokens.mjs");
await import("./generate-theme-css.mjs");
await import("./build-styles.mjs");
await mkdir(outputDir, { recursive: true });

await build({
  entryPoints: [
    join(root, "tests", "visual", "fixture.tsx"),
    join(root, "tests", "visual", "horizonte.fixture.tsx"),
    join(root, "tests", "visual", "responsive-feedback.fixture.tsx"),
    join(root, "tests", "visual", "command.fixture.tsx"),
    join(root, "tests", "visual", "button-tones.fixture.tsx"),
    join(root, "tests", "visual", "mega-menu.fixture.tsx"),
  ],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  outdir: outputDir,
  platform: "browser",
  target: ["chrome120"],
  sourcemap: true,
});

const indexHtml = `<!doctype html>
<html lang="pt-BR" data-theme="cm-v4-light">
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

const horizonteHtml = indexHtml
  .replace("/fixture.css", "/horizonte.fixture.css")
  .replace("/fixture.js", "/horizonte.fixture.js");

const responsiveHtml = indexHtml
  .replace("/fixture.css", "/responsive-feedback.fixture.css")
  .replace("/fixture.js", "/responsive-feedback.fixture.js");

const commandHtml = indexHtml
  .replace('<link rel="stylesheet" href="/fixture.css" />', "")
  .replace("/fixture.js", "/command.fixture.js");

const buttonTonesHtml = commandHtml.replace("/command.fixture.js", "/button-tones.fixture.js");
const megaMenuHtml = commandHtml.replace("/command.fixture.js", "/mega-menu.fixture.js");

const files = new Map([
  ["/mega-menu.fixture.js", join(outputDir, "mega-menu.fixture.js")],
  ["/mega-menu.fixture.js.map", join(outputDir, "mega-menu.fixture.js.map")],
  ["/button-tones.fixture.js", join(outputDir, "button-tones.fixture.js")],
  ["/button-tones.fixture.js.map", join(outputDir, "button-tones.fixture.js.map")],
  ["/command.fixture.js", join(outputDir, "command.fixture.js")],
  ["/command.fixture.js.map", join(outputDir, "command.fixture.js.map")],
  ["/fixture.js", join(outputDir, "fixture.js")],
  ["/fixture.js.map", join(outputDir, "fixture.js.map")],
  ["/horizonte.fixture.js", join(outputDir, "horizonte.fixture.js")],
  ["/horizonte.fixture.js.map", join(outputDir, "horizonte.fixture.js.map")],
  ["/horizonte.fixture.css", join(root, "tests", "visual", "horizonte.fixture.css")],
  ["/styles.css", join(root, "dist", "styles.css")],
  ["/components.css", join(root, "dist", "components.css")],
  ["/responsive-feedback.fixture.js", join(outputDir, "responsive-feedback.fixture.js")],
  [
    "/responsive-feedback.fixture.css",
    join(root, "tests", "visual", "responsive-feedback.fixture.css"),
  ],
  ["/fixture.css", join(root, "tests", "visual", "fixture.css")],
  [
    "/fonts/horizonte-inter-latin.woff2",
    join(root, "dist", "fonts", "horizonte-inter-latin.woff2"),
  ],
  [
    "/fonts/horizonte-manrope-latin.woff2",
    join(root, "dist", "fonts", "horizonte-manrope-latin.woff2"),
  ],
  [
    "/fonts/inter-variable-latin.woff2",
    join(
      root,
      "node_modules",
      "@fontsource-variable",
      "inter",
      "files",
      "inter-latin-wght-normal.woff2",
    ),
  ],
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;

  if (pathname === "/" || pathname === "/index.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(indexHtml);
    return;
  }

  if (pathname === "/horizonte") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(horizonteHtml);
    return;
  }

  if (pathname === "/command") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(commandHtml);
    return;
  }

  if (pathname === "/button-tones") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(buttonTonesHtml);
    return;
  }

  if (pathname === "/mega-menu") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(megaMenuHtml);
    return;
  }

  if (pathname === "/responsive-feedback") {
    const componentsOnly =
      new URL(request.url, `http://${host}:${port}`).searchParams.get("css") === "components";
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      componentsOnly ? responsiveHtml.replace("/styles.css", "/components.css") : responsiveHtml,
    );
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
