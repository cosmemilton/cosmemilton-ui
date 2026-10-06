import { describe, expect, it } from "vitest";
import * as root from "./index.js";
import * as client from "./client.js";
import * as server from "./server.js";

// Componentes server-safe exportados nos dois entries (mesma referência),
// para uso direto em Client Components sem depender de cosmemilton-ui/server.
const dualExports = [
  "CmBox",
  "CmChartFrame",
  "CmCol",
  "CmContainer",
  "CmField",
  "CmForm",
  "CmRow",
  "CmStack",
  "CmText",
  "CmTopbar",
] as const;

describe("entries client/server", () => {
  it.each(dualExports)("%s é exportado por client e server com a mesma referência", (name) => {
    const clientExport = (client as Record<string, unknown>)[name];
    const serverExport = (server as Record<string, unknown>)[name];
    expect(clientExport).toBeDefined();
    expect(serverExport).toBeDefined();
    expect(clientExport).toBe(serverExport);
  });
});

it("exposes actual server-safe root exports rather than legacy proxy functions", () => {
  expect(root.CmCard).toBe(server.CmCard);
  expect(root.CmThemeScope).toBe(server.CmThemeScope);
  expect(root.CmBox).toBe(server.CmBox);
  expect("CmButton" in root).toBe(false);
});
