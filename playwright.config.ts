import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// WSL/headless: o chrome-headless-shell precisa de libs do sistema (libnspr4,
// libnss3, ...) que aqui não estão instaladas — ficam vendorizadas em
// ~/.local/chromium-libs. Setamos LD_LIBRARY_PATH no processo que lança o
// browser, então funciona independente de como os testes são chamados
// (npm publish via `sh -c`, CI, direto). No-op se o diretório não existir.
const vendoredChromiumLibs = join(homedir(), ".local", "chromium-libs");
if (existsSync(vendoredChromiumLibs)) {
  process.env.LD_LIBRARY_PATH = `${vendoredChromiumLibs}:${process.env.LD_LIBRARY_PATH ?? ""}`;
}

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    locale: "pt-BR",
    timezoneId: "America/Fortaleza",
    baseURL: "http://127.0.0.1:4178",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run test:visual:serve",
    url: "http://127.0.0.1:4178",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
