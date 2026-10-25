import { expect, test } from "@playwright/test";

for (const [width, compact] of [
  [1024, "auto"],
  [1440, "manual"],
] as const) {
  for (const theme of ["cm-horizonte-light", "cm-horizonte-dark"]) {
    test(`compact sidebar receives a first click at ${width} / ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/modal-focus?compact=${compact}&theme=${theme}`);
      const sidebar = page.locator(".cm-app-shell__sidebar");
      await expect(sidebar.locator(".cm-sidebar-shell")).toHaveClass(/--collapsed/);
      await page.mouse.move(width - 10, 850);
      await page.waitForTimeout(800);
      const group = sidebar.getByRole("button", { name: "Outros", exact: true });
      await group.click();
      await expect(group).toHaveAttribute("aria-expanded", "true");
      await expect(
        sidebar.getByRole("button", { name: "Selecionar e fechar", exact: true }),
      ).toBeVisible();
      await page.mouse.move(width - 10, 850);
      await page.waitForTimeout(800);
      const bounds = await group.boundingBox();
      if (!bounds) throw new Error("Missing collapsed trigger");
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(250);
      await page.mouse.up();
      await expect(group).toHaveAttribute("aria-expanded", "false");
      await page.mouse.move(width - 10, 850);
      await page.waitForTimeout(800);
      await group.focus();
      await page.keyboard.press("Enter");
      await expect(group).toHaveAttribute("aria-expanded", "true");
    });
  }
}

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
