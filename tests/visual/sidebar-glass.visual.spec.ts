import { expect, test } from "@playwright/test";

test("glass covers the sidebar preview while the main content stays in place", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/aurora-ops?skin=classic&chrome=glass");

  const glass = page.locator(".cm-app-shell__sidebar");
  const sidebar = glass.getByRole("complementary", { name: "Seções do dashboard" });
  const main = page.locator(".cm-app-shell__main");
  const mainLeft = () => main.evaluate((element) => element.getBoundingClientRect().left);
  const collapsedWidth = 64;
  const expandedWidth = 232;

  await glass.getByRole("button", { name: "Recolher menu lateral" }).click();
  await page.getByRole("heading", { name: "Visão geral" }).hover();
  await expect(glass).toHaveCSS("width", `${collapsedWidth}px`);
  await expect.poll(mainLeft).toBe(collapsedWidth);

  const brand = glass.getByRole("button", { name: "Abrir menu lateral" });
  for (const interaction of ["hover", "focus"] as const) {
    await brand[interaction]();
    await expect(sidebar).toHaveCSS("width", `${expandedWidth}px`);
    await expect(glass).toHaveCSS("width", `${expandedWidth}px`);
    await expect(glass).toHaveCSS("backdrop-filter", /blur\(/);
    expect(await mainLeft()).toBe(collapsedWidth);

    await page.getByRole("heading", { name: "Visão geral" }).hover();
    await page.getByRole("combobox", { name: "Buscar no dashboard" }).focus();
    await expect(glass).toHaveCSS("width", `${collapsedWidth}px`);
  }
});
