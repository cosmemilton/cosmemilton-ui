import { expect, test } from "@playwright/test";
for (const theme of ["light", "dark"]) {
  test(`persistent confirmation keyboard, processing and text bounds ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`/responsive-feedback?theme=${theme}`);
    const trigger = page.getByRole("button", { name: "Abrir confirmação" });
    await trigger.click();
    const confirm = page.getByRole("button", { name: "Confirmar", exact: true });
    await expect(confirm).toBeFocused();
    const toast = page.locator(".cm-toast__item");
    await expect(toast).toHaveClass(/visible/);
    expect(
      await toast.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        const walker = document.createTreeWalker(
          el.querySelector(".cm-toast__content")!,
          NodeFilter.SHOW_TEXT,
        );
        let node;
        let contained = true;
        while ((node = walker.nextNode())) {
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects())
            contained &&= rect.left >= bounds.left && rect.right <= bounds.right;
        }
        return contained;
      }),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(toast).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await confirm.click();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Envios")).toHaveText("1");
    await page.keyboard.press("Escape");
    await expect(toast).toHaveCount(1);
  });
}
