// Browser/global bundle entry — superfície COMPLETA da API pública num único
// objeto `window.CmUI` (sem bundler). É a união de `client` + `server` + `theme`.
//
// Os entry points ESM (client/server/theme) continuam sendo a forma recomendada
// num app com bundler/RSC; este arquivo existe só para o build IIFE global
// (scripts/build-browser.mjs), onde não há separação client/server.
//
// `client` já reexporta os módulos compartilhados (box.js, chart-frame.js,
// field.js, form.js, layout.js, text.js, topbar.js), então aqui repetimos o
// conteúdo de `server` MENOS esses módulos para evitar `export *` ambíguo.
export * from "./client.js";

// --- adições server-safe (server.ts, menos os módulos compartilhados acima) ---
export * from "./components/theme/theme-script.js";
export * from "./components/ui/badge.js";
export * from "./components/ui/breadcrumb.js";
export * from "./components/ui/button-group.js";
export * from "./components/ui/card.js";
export * from "./components/ui/gauge.js";
export * from "./components/ui/grid.js";
export * from "./components/ui/icon.js";
export * from "./components/ui/icon-badge.js";
export * from "./components/ui/input-group.js";
export * from "./components/ui/item.js";
export * from "./components/ui/kbd.js";
export * from "./components/ui/label.js";
export * from "./components/ui/link.js";
export * from "./components/ui/metric-card.js";
export * from "./components/ui/page.js";
export * from "./components/ui/page-header.js";
export * from "./components/ui/section-header.js";
export * from "./components/ui/separator.js";
export * from "./components/ui/status-dot.js";
export * from "./components/ui/timeline.js";
export * from "./components/ui/toolbar.js";
export * from "./components/ui/types.js";
export * from "./lib/theme/index.js";
export * from "./lib/utils.js";
