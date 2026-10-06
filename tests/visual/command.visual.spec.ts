import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 320, height: 650 },
  { width: 667, height: 280 },
]) {
  test(`command escapes glass header and keeps controls visible at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/command");
    const trigger = page.getByRole("button", { name: "Buscar na documentação" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Buscar na documentação" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("textbox", { name: "Pesquisar comandos" });
    await expect(input).toBeFocused();
    expect(await dialog.evaluate((element) => Boolean(element.closest(".cm-topbar")))).toBe(false);
    for (const element of [
      dialog,
      input,
      dialog.getByRole("button", { name: "Fechar", exact: true }),
    ]) {
      await expect
        .poll(async () => {
          const rect = await element.boundingBox();
          return Boolean(
            rect &&
            rect.x >= 0 &&
            rect.y >= 0 &&
            rect.x + rect.width <= viewport.width + 1 &&
            rect.y + rect.height <= viewport.height + 1,
          );
        })
        .toBe(true);
    }
    await input.press("End");
    const last = dialog.getByRole("option", { name: "Componente 80", exact: true });
    await expect(last).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() =>
        last.evaluate((element) => {
          const item = element.getBoundingClientRect();
          const list = element.closest('[role="listbox"]')!.getBoundingClientRect();
          return item.top >= list.top && item.bottom <= list.bottom;
        }),
      )
      .toBe(true);
    expect(await dialog.locator(".cm-dialog__body").evaluate((element) => element.scrollTop)).toBe(
      0,
    );
    expect(
      await dialog.getByRole("listbox").evaluate((element) => element.scrollTop),
    ).toBeGreaterThan(0);
    await input.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("status")).toHaveText("Selecionado: 79");
    await page.keyboard.press("Control+k");
    await expect(input).toBeFocused();
    await input.fill("icones");
    await expect(dialog.getByRole("option")).toHaveCount(1);
    await expect(dialog.getByRole("option", { name: "Ícones" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}
