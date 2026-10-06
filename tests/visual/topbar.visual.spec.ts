import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "@playwright/test";
// Playwright's TSX transform creates component-test objects; SSR uses built React elements.
import { CmTopbar } from "../../dist/components/ui/topbar.js";

const stylesDirectory = join(process.cwd(), "src", "styles");
const css = readdirSync(stylesDirectory)
  .filter((name) => name.endsWith(".css"))
  .sort()
  .map((name) => readFileSync(join(stylesDirectory, name), "utf8"))
  .join("\n");

for (const skin of ["classic", "horizonte"]) {
  for (const width of [320, 390, 1440]) {
    for (const withSearch of [false, true]) {
      test(`52px topbar pins its end with${withSearch ? "" : "out"} a center in ${skin} at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        const markup = renderToStaticMarkup(
          createElement(CmTopbar, {
            height: 52,
            density: "compact",
            layout: withSearch ? "start" : "balanced",
            mobileLayout: "inline",
            centerAlign: "stretch",
            start: createElement("button", { "aria-label": "Menu" }, "☰"),
            center: withSearch
              ? createElement("input", { "aria-label": "Buscar documentação" })
              : undefined,
            end: createElement("button", { "aria-label": "Selecionar tema" }, "◐"),
          }),
        );
        await page.setContent(`<!doctype html><html ${skin === "horizonte" ? 'data-cm-skin="horizonte" data-theme="cm-v4-light"' : 'data-theme="cm-v4-light"'}><head><style>${css}
          .cm-topbar button { width: 32px; height: 36px; }
          .cm-topbar input { width: 100%; min-width: 0; height: 36px; }
        </style></head><body>${markup}</body></html>`);

        const header = page.getByRole("banner");
        await expect(header).toHaveCSS("min-height", "52px");
        expect((await header.boundingBox())!.height).toBe(52);
        const paddingRight = await header.evaluate((element) =>
          parseFloat(getComputedStyle(element).paddingRight),
        );
        const theme = (await page.getByRole("button", { name: "Selecionar tema" }).boundingBox())!;
        expect(theme.x + theme.width).toBeCloseTo(width - paddingRight, 1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        if (withSearch) {
          const menu = (await page.getByRole("button", { name: "Menu" }).boundingBox())!;
          const search = (await page.getByRole("textbox").boundingBox())!;
          expect(search.x).toBeGreaterThan(menu.x + menu.width);
          expect(search.x + search.width).toBeLessThan(theme.x);
          expect(search.width).toBeGreaterThan(width > 640 ? 1000 : 160);
        }
      });
    }
  }
}

test("mobile stack keeps all slots in a single column", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const markup = renderToStaticMarkup(
    createElement(CmTopbar, {
      height: 52,
      start: createElement("button", {}, "Menu"),
      center: createElement("input", { "aria-label": "Buscar" }),
      end: createElement("button", {}, "Tema"),
    }),
  );
  await page.setContent(`<style>${css}</style>${markup}`);
  const menu = (await page.getByRole("button", { name: "Menu" }).boundingBox())!;
  const search = (await page.getByRole("textbox").boundingBox())!;
  const theme = (await page.getByRole("button", { name: "Tema" }).boundingBox())!;
  expect(search.y).toBeGreaterThan(menu.y + menu.height);
  expect(theme.y).toBeGreaterThan(search.y + search.height);
  expect(menu.x).toBe(search.x);
  expect(menu.x).toBe(theme.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
