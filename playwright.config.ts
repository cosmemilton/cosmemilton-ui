import { defineConfig, devices } from "@playwright/test";

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
