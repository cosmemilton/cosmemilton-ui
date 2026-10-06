import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectNoPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
}

async function expectSelectedTabUncovered(section: Locator) {
  const active = section.getByRole("tab", { selected: true });
  await expect
    .poll(async () =>
      active.evaluate((element) => {
        const tab = element.getBoundingClientRect();
        const list = element.closest('[role="tablist"]')!.getBoundingClientRect();
        const buttons = element
          .closest(".cm-tabs-list-shell")!
          .querySelectorAll(".cm-tabs-scroll-button");
        return {
          contained: tab.left >= list.left - 1 && tab.right <= list.right + 1,
          covered: Array.from(buttons).some((button) => {
            if (getComputedStyle(button).visibility === "hidden") return false;
            const rect = button.getBoundingClientRect();
            return Math.min(rect.right, tab.right) - Math.max(rect.left, tab.left) > 1;
          }),
        };
      }),
    )
    .toEqual({ contained: true, covered: false });
  const box = (await active.boundingBox())!;
  // Check that both ends can receive a real pointer click, including the label end.
  for (const x of [box.x + 6, box.x + box.width - 6]) {
    expect(
      await active.evaluate(
        (element, point) => element.contains(document.elementFromPoint(point.x, point.y)),
        { x, y: box.y + box.height / 2 },
      ),
    ).toBe(true);
  }
}

async function expectToastContained(page: Page) {
  const toast = page.getByRole("alert");
  await expect(toast).toHaveClass(/cm-toast__item--visible/);
  const viewportWidth = page.viewportSize()!.width;
  for (const element of [
    toast,
    toast.locator(".cm-toast__content"),
    toast.getByRole("button", { name: "Fechar" }),
  ]) {
    const box = (await element.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1);
  }
  expect((await toast.boundingBox())!.width).toBeLessThanOrEqual(384);
  // A contained card can still clip its flex child. Verify the actual text layout.
  expect(
    await toast
      .locator(".cm-toast__content")
      .evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  expect(
    await toast.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  await expectNoPageOverflow(page);
}

for (const skin of ["classic", "horizonte"] as const) {
  for (const theme of ["light", "dark", "aurora"] as const) {
    test(`selected tabs stay fully visible at 320px in ${skin} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1000 });
      await page.goto(`/responsive-feedback?theme=${theme}&skin=${skin}`);
      await page.evaluate(() => document.fonts.ready);
      const selection = page.getByLabel("Aba selecionada");
      for (const value of ["2", "0", "4", "1", "3"]) {
        await selection.selectOption(value);
        for (const variant of ["default", "modal", "folder"]) {
          const section = page.locator(`[data-variant="${variant}"]`);
          await expectSelectedTabUncovered(section);
          await section.getByRole("tab", { selected: true }).click();
          await expect(section.getByRole("tabpanel")).toContainText("Conteúdo:");
        }
        await expectNoPageOverflow(page);
      }
      await page.screenshot({ path: test.info().outputPath(`tabs-${skin}-${theme}-320.png`) });
    });
  }
}

test("tabs keep the selected item visible after resize and allow scrolling back to the first tab", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/responsive-feedback?active=4");
  for (const width of [320, 390, 1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const variant of ["default", "modal", "folder"])
      await expectSelectedTabUncovered(page.locator(`[data-variant="${variant}"]`));
    await expectNoPageOverflow(page);
  }
  const section = page.locator('[data-variant="default"]');
  const list = section.getByRole("tablist");
  expect(await list.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  for (let attempt = 0; attempt < 4; attempt++) {
    const back = section.getByRole("button", { name: "Rolar abas para a esquerda" });
    if (!(await back.isVisible())) break;
    const target = await list.evaluate((element) =>
      Math.max(0, element.scrollLeft - Math.max(160, element.clientWidth * 0.7)),
    );
    await back.click();
    // Wait for this smooth scroll to finish before requesting the next page.
    // The last arrow disappears once the list reaches the beginning.
    await expect.poll(() => list.evaluate((element) => element.scrollLeft)).toBeCloseTo(target, 0);
  }
  await expect.poll(() => list.evaluate((element) => element.scrollLeft)).toBe(0);
  await section.getByRole("tab", { name: "Visão geral", exact: true }).click();
  await expectSelectedTabUncovered(section);
});

test("tabs preserve automatic visibility with scroll buttons disabled", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto("/responsive-feedback?buttons=false&active=4");
  await expect(page.getByRole("button", { name: /Rolar abas/ })).toHaveCount(0);
  for (const value of ["4", "0", "2"]) {
    await page.getByLabel("Aba selecionada").selectOption(value);
    for (const variant of ["default", "modal", "folder"])
      await expectSelectedTabUncovered(page.locator(`[data-variant="${variant}"]`));
  }
  await expectNoPageOverflow(page);
});

for (const css of ["styles", "components"] as const) {
  for (const theme of ["light", "dark", "aurora"] as const) {
    test(`long toasts fit all six positions at 320px in ${theme} with ${css}.css`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 1000 });
      await page.goto(`/responsive-feedback?theme=${theme}&css=${css}`);
      await page.evaluate(() => document.fonts.ready);
      for (const position of [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ]) {
        await page.getByLabel("Posição do toast").selectOption(position);
        for (const message of ["Mensagem longa", "Texto sem espaços"]) {
          await page.getByRole("button", { name: message, exact: true }).click();
          await expectToastContained(page);
          await page.getByRole("alert").screenshot({
            path: test
              .info()
              .outputPath(
                `toast-${position}-${message === "Mensagem longa" ? "sentence" : "token"}.png`,
              ),
          });
          await page.getByRole("alert").getByRole("button", { name: "Fechar" }).click();
          await expect(page.getByRole("alert")).toHaveCount(0);
        }
      }
    });
  }
}

test("toast retains the desktop width limit when resizing to mobile", async ({ page }) => {
  await page.goto("/responsive-feedback");
  await page.getByRole("button", { name: "Texto sem espaços", exact: true }).click();
  for (const width of [1440, 320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expectToastContained(page);
  }
});
