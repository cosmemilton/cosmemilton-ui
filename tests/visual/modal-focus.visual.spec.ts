import { expect, test } from "@playwright/test";

for (const width of [393, 1440])
  for (const theme of ["cm-horizonte-light", "cm-horizonte-dark"]) {
    for (const type of ["drawer", "dialog"]) {
      test(`${type} traps focus through collapsed sidebar groups at ${width} / ${theme}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/modal-focus?type=${type}&theme=${theme}`);
        const opener = page.getByRole("button", { name: "Abrir menu", exact: true });
        await opener.click();
        const dialog = page.getByRole("dialog", { name: "Menu de teste" });
        const close = dialog.getByRole("button", { name: "Fechar", exact: true });
        await expect(close).toBeFocused();
        await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
        const lastVisible = dialog.getByRole("button", { name: "Outros", exact: true });
        await lastVisible.focus();
        await page.keyboard.press("Tab");
        await expect(close).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(lastVisible).toBeFocused();
        await lastVisible.click();
        const lastItem = dialog.getByRole("button", { name: "Selecionar e fechar", exact: true });
        await lastItem.focus();
        await page.keyboard.press("Tab");
        await expect(close).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(opener).toBeFocused();
        await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
        await opener.click();
        await expect(close).toBeFocused();
        await dialog.getByRole("button", { name: "Outros", exact: true }).click();
        await dialog.getByRole("button", { name: "Selecionar e fechar", exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(opener).toBeFocused();
      });
    }
  }
