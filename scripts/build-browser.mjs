import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import React from "react";
import * as ReactDOM from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist");
const entry = join(distDir, "browser.js");
const jsxRuntime = join(root, "scripts", "browser-jsx-runtime.js");

function globalModuleSource(globalName, moduleExports) {
  const names = Object.keys(moduleExports).filter(
    (name) => name !== "default" && /^[A-Za-z_$][\w$]*$/.test(name),
  );
  return [
    `const api = globalThis.${globalName};`,
    `if (!api) throw new Error("CmUI requer ${globalName} carregado antes do bundle.");`,
    "export default api;",
    ...names.map((name) => `export const ${name} = api.${name};`),
  ].join("\n");
}

const globalReactPlugin = {
  name: "cm-ui-global-react",
  setup(buildContext) {
    buildContext.onResolve({ filter: /^react\/jsx(?:-dev)?-runtime$/ }, () => ({
      path: jsxRuntime,
    }));
    buildContext.onResolve({ filter: /^react$/ }, () => ({
      path: "react",
      namespace: "cm-ui-global",
    }));
    buildContext.onResolve({ filter: /^react-dom$/ }, () => ({
      path: "react-dom",
      namespace: "cm-ui-global",
    }));
    buildContext.onLoad({ filter: /.*/, namespace: "cm-ui-global" }, ({ path }) => ({
      contents:
        path === "react"
          ? globalModuleSource("React", React)
          : globalModuleSource("ReactDOM", ReactDOM),
      loader: "js",
    }));
  },
};

async function emit(fileName, minify) {
  await build({
    entryPoints: [entry],
    outfile: join(distDir, fileName),
    bundle: true,
    format: "iife",
    globalName: "CmUI",
    target: "es2020",
    minify,
    sourcemap: true,
    legalComments: "inline",
    plugins: [globalReactPlugin],
    logLevel: "warning",
  });
}

await emit("cm-ui.js", false);
await emit("cm-ui.min.js", true);

// Smoke test do artefato real: o IIFE deve executar somente com os dois globals
// documentados e publicar os componentes em globalThis.CmUI.
const minifiedPath = join(distDir, "cm-ui.min.js");
const code = await readFile(minifiedPath, "utf8");
const context = vm.createContext({
  React,
  ReactDOM,
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: (callback) => setTimeout(callback, 0),
  cancelAnimationFrame: clearTimeout,
});
vm.runInContext(code, context, { filename: "cm-ui.min.js" });

const api = context.CmUI;
const requiredExports = ["CmButton", "CmDialog", "CmTreeView", "CmThemeProvider"];
if (!api || requiredExports.some((name) => api[name] == null)) {
  throw new Error("O bundle global não publicou a API esperada em globalThis.CmUI.");
}
const renderedButton = renderToStaticMarkup(React.createElement(api.CmButton, null, "Salvar"));
if (!renderedButton.includes("<button") || !renderedButton.includes("Salvar")) {
  throw new Error("O bundle global não renderizou um componente com o React externo.");
}

const [{ size: prettySize }, { size: minifiedSize }] = await Promise.all([
  stat(join(distDir, "cm-ui.js")),
  stat(minifiedPath),
]);
console.log(
  `build-browser: cm-ui.js ${(prettySize / 1024).toFixed(1)}kB · ` +
    `cm-ui.min.js ${(minifiedSize / 1024).toFixed(1)}kB · global CmUI validado`,
);
