import { expect, test } from "@playwright/test";

for (const skin of ["classic", "horizonte"] as const) {
  for (const theme of ["light", "dark", "aurora"] as const) {
    for (const width of [1440, 320]) {
      for (const state of ["populated", "empty", "loading"] as const) {
        test(`custom header uses available width in ${skin} ${theme} ${width}px ${state}`, async ({
          page,
        }) => {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(
            `/horizonte?fixture=data-table-scroll&customHeader=true&theme=${theme}&skin=${skin}&empty=${state === "empty"}&loading=${state === "loading"}`,
          );
          const dialog = page.getByRole("dialog", { name: "Relatório de produtos" });
          const form = page.getByTestId("custom-header-filters");
          await expect(form).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          const metrics = () =>
            form.evaluate((element) => {
              const slot = element.closest(".cm-data-table__header-slot")!;
              const top = slot.parentElement!;
              const style = getComputedStyle(top);
              return {
                available:
                  top.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
                slot: slot.getBoundingClientRect().width,
                form: element.getBoundingClientRect().width,
                columns: new Set(
                  [...element.children].map((child) =>
                    Math.round(child.getBoundingClientRect().left),
                  ),
                ).size,
              };
            });
          const before = await metrics();
          expect(before.slot).toBeGreaterThanOrEqual(before.available - 1);
          expect(before.form).toBeGreaterThanOrEqual(before.slot - 1);
          if (width === 1440) expect(before.columns).toBeGreaterThan(1);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(width);
          if (state === "populated") {
            const scroll = page.getByRole("region", { name: "Tabela de produtos" });
            await scroll.focus();
            await scroll.press("ArrowRight");
            await expect
              .poll(() => scroll.evaluate((element) => element.scrollLeft))
              .toBeGreaterThan(0);
            expect(await metrics()).toEqual(before);
          }
          await dialog.screenshot({
            path: test.info().outputPath("custom-header.png"),
            animations: "disabled",
          });
          await dialog.getByRole("button", { name: "Exportar", exact: true }).press("Enter");
          await expect(
            dialog.getByRole("status").filter({ hasText: "Exportação solicitada" }),
          ).toBeVisible();
          await dialog
            .getByRole("button", { name: "Fechar relatório", exact: true })
            .press("Enter");
          await expect(dialog).toBeHidden();
        });
      }
    }
  }
}
