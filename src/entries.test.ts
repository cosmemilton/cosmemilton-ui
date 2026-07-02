import { describe, expect, it } from "vitest";
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
