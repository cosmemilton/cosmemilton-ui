import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Ancorado ao diretório do pacote para que `vitest run -c packages/tokens/...`
    // funcione a partir da raiz do repo sem capturar os testes de src/.
    root: dirname(fileURLToPath(import.meta.url)),
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
