import { expect, test } from "@playwright/test";

test.use({ hasTouch: true });

test("prévia standalone alcança os subitens além do trilho e preserva a rolagem", async ({
  page,
}) => {
  await page.setViewportSize({ width: 960, height: 700 });
  await page.goto("/?fixture=sidebar");
  const sidebar = page.locator(".cm-sidebar-shell");
  const brand = sidebar.getByRole("button", { name: "Abrir menu lateral" });
  const list = sidebar.locator(".cm-sidebar__group-items").first();
  const lastLink = sidebar.getByRole("link", { name: "Página 16" });
  const railWidth = 64;

  await expect(sidebar).toHaveCSS("width", `${railWidth}px`);
  await page.keyboard.press("Tab");
  await expect(brand).toBeFocused();
  await expect(sidebar.locator("aside")).toHaveCSS("width", "280px");
  await expect(sidebar).toHaveCSS("width", `${railWidth}px`);

  await expect.poll(() => list.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await lastLink.scrollIntoViewIfNeeded();
  await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      lastLink.evaluate((link, rail) => {
        const rect = link.getBoundingClientRect();
        return link.contains(
          document.elementFromPoint(rect.left + rail + 40, rect.top + rect.height / 2),
        );
      }, railWidth),
    )
    .toBe(true);
  await lastLink.click({ position: { x: 125, y: 12 } });
  await expect(page).toHaveURL(/#pagina-16$/);
  await expect(sidebar.locator("aside")).toHaveCSS("width", `${railWidth}px`);

  await brand.tap();
  await expect(brand).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar.locator("aside")).toHaveCSS("width", "280px");
  await expect(sidebar).toHaveCSS("width", `${railWidth}px`);
});

test("marca e seta reabrem a sidebar recolhida manualmente", async ({ page }) => {
  await page.goto("/?fixture=sidebar");
  const sidebar = page.locator(".cm-sidebar-shell");
  const collapse = sidebar.getByRole("button", { name: "Recolher menu lateral" });
  const brand = sidebar.getByRole("button", { name: "Abrir menu lateral" });

  await collapse.click();
  await expect(sidebar).toHaveCSS("width", "64px");
  await brand.hover();
  await expect(sidebar.locator("aside")).toHaveCSS("width", "280px");
  await expect(sidebar).toHaveCSS("width", "64px");
  await brand.click();
  await expect(collapse).toBeFocused();
  await expect(sidebar).toHaveCSS("width", "280px");

  await collapse.click();
  await brand.hover();
  await sidebar.getByRole("button", { name: "Expandir menu lateral" }).click();
  await expect(sidebar).toHaveCSS("width", "280px");
});
