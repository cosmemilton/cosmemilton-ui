import { expect, test, type Locator, type Page } from "@playwright/test";

async function xEdges(locator: Locator) {
  const rect = (await locator.boundingBox())!;
  return { left: rect.x, right: rect.x + rect.width };
}

async function expectNoPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
}

for (const skin of ["classic", "horizonte"] as const) {
  for (const theme of ["light", "dark"] as const) {
    for (const width of [1440, 390]) {
      test(`wide dialog table keeps controls stationary in ${skin} ${theme} at ${width}px`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/horizonte?fixture=data-table-scroll&theme=${theme}&skin=${skin}`);
        const dialog = page.getByRole("dialog", { name: "Relatório de produtos" });
        const scroll = page.getByRole("region", { name: "Tabela de produtos" });
        const toolbar = dialog.locator(".cm-data-table__top");
        const footer = dialog.locator(".cm-data-table__foot");
        await expect(scroll).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          skin === "horizonte"
            ? `cm-horizonte-${theme}`
            : theme === "dark"
              ? "cm-dark"
              : "cm-neutral",
        );
        await expect(scroll).toHaveAttribute("tabindex", "0");
        await expectNoPageOverflow(page);
        const initialToolbar = await xEdges(toolbar);
        const initialFooter = await xEdges(footer);
        const viewport = await xEdges(scroll);

        // Tab through the toolbar to the native horizontal-scroll keyboard stop.
        await dialog.getByRole("button", { name: "Exportar", exact: true }).focus();
        await page.keyboard.press("Tab");
        await expect(scroll).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect
          .poll(() => scroll.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(0);
        await scroll.evaluate((element) => {
          element.scrollLeft = element.scrollWidth;
        });
        await expect.poll(() => xEdges(toolbar)).toEqual(initialToolbar);
        await expect.poll(() => xEdges(footer)).toEqual(initialFooter);
        const lastColumn = await xEdges(dialog.getByRole("columnheader", { name: "Gôndola" }));
        expect(lastColumn.left).toBeGreaterThanOrEqual(viewport.left - 1);
        expect(lastColumn.right).toBeLessThanOrEqual(viewport.right + 1);
        await expectNoPageOverflow(page);

        const next = dialog.getByRole("button", { name: "Próxima", exact: true });
        await next.scrollIntoViewIfNeeded();
        const nextEdges = await xEdges(next);
        expect(nextEdges.left).toBeGreaterThanOrEqual(0);
        expect(nextEdges.right).toBeLessThanOrEqual(width);
        await dialog.screenshot({ path: test.info().outputPath("table-scroll.png") });
        // A thin focus ring covers few pixels; the global tolerance can hide gaps.
        await expect(dialog).toHaveScreenshot(`data-table-scroll-${skin}-${theme}-${width}.png`, {
          maxDiffPixelRatio: 0.0001,
        });
        await next.press("Enter");
        await expect(dialog.getByText("6-10 de 12", { exact: true })).toBeVisible();
        await scroll.evaluate((element) => {
          element.scrollLeft = 0;
        });
        await expect(dialog.getByText("Café especial 006", { exact: true })).toBeVisible();

        await dialog.getByRole("button", { name: "Configurar colunas" }).click();
        const columns = page.getByRole("dialog", { name: "Colunas visíveis" });
        await expect(columns).toBeVisible();
        const ncm = columns.getByRole("checkbox", { name: /NCM/ });
        await ncm.press("Space");
        await expect(ncm).not.toBeChecked();
        await columns.getByRole("button", { name: "Restaurar padrão" }).click();
        await expect(columns).toBeHidden();
        await expect(dialog.getByRole("columnheader", { name: "NCM", exact: true })).toBeVisible();
        await dialog.getByRole("button", { name: "Exportar", exact: true }).press("Enter");
        await expect(dialog.getByRole("status")).toHaveText("Exportação solicitada");
        await dialog.getByRole("button", { name: "Fechar relatório" }).press("Enter");
        await expect(dialog).toBeHidden();
        expect(errors).toEqual([]);
      });
    }
  }
}

test("overflow keyboard stop follows a viewport resize", async ({ page }) => {
  await page.setViewportSize({ width: 2000, height: 900 });
  await page.goto("/horizonte?fixture=data-table-scroll&tableWidth=600");
  const scroll = page.locator(".cm-data-table__scroll");
  await expect(scroll).not.toHaveAttribute("tabindex", "0");
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(scroll).toHaveAttribute("tabindex", "0");
  await page.setViewportSize({ width: 2000, height: 900 });
  await expect(scroll).not.toHaveAttribute("tabindex", "0");
  await expectNoPageOverflow(page);
});

test("wide tables retain the selected detail panel while scrolling", async ({ page }) => {
  await page.goto("/horizonte?fixture=data-table-scroll&detail=true&theme=dark");
  const scroll = page.getByRole("region", { name: "Tabela de produtos" });
  const detail = page.getByRole("complementary", { name: "Detalhes da linha selecionada" });
  await expect(detail.getByText("Detalhes: Café especial 001", { exact: true })).toBeVisible();
  const initialDetail = await xEdges(detail);
  await scroll.focus();
  await expect(scroll).toBeFocused();
  await scroll.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  expect(await xEdges(detail)).toEqual(initialDetail);
  await expect(detail.getByText("Detalhes: Café especial 001", { exact: true })).toBeVisible();
  await page.getByRole("dialog", { name: "Relatório de produtos" }).screenshot({
    path: test.info().outputPath("table-scroll-detail-focus.png"),
  });
  await scroll.evaluate((element) => {
    element.scrollLeft = 0;
  });
  await page.getByText("Café especial 002", { exact: true }).click();
  await expect(detail.getByText("Detalhes: Café especial 002", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Exportar", exact: true }).focus();
  await expect(scroll).not.toBeFocused();
  await page.getByRole("dialog", { name: "Relatório de produtos" }).screenshot({
    path: test.info().outputPath("table-scroll-detail-toolbar-focus.png"),
  });
  await expectNoPageOverflow(page);
});
