import { expect, test, type Locator } from "@playwright/test";
import { auroraTheme, darkTheme, lightTheme } from "../../src/lib/theme/themes.js";

const themes = [lightTheme, darkTheme, auroraTheme];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

function overflow(locator: Locator) {
  return locator.evaluate((element) => element.scrollWidth - element.clientWidth);
}

function focusStyle(locator: Locator) {
  return locator.evaluate((element) => {
    const { boxShadow, outlineColor, outlineStyle, outlineWidth } = getComputedStyle(element);
    return { boxShadow, outlineColor, outlineStyle, outlineWidth };
  });
}

for (const theme of themes) {
  const name = theme.name.replace("cm-v4-", "");
  for (const viewport of viewports) {
    test(`Aurora Ops retains ${name} tokens and keyboard access on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/aurora-ops?theme=${name}`);

      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-theme", theme.name);
      await expect(html).toHaveAttribute("data-cm-skin", "aurora-ops");
      await expect(html).toHaveCSS("color-scheme", theme.colorScheme ?? "light");
      await expect(html).toHaveCSS("--color-primary", theme.colors.primary);
      await expect(page.getByTestId("aurora-ops-fixture")).toHaveAttribute(
        "data-fixture-skin",
        "aurora-ops",
      );
      await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Receita em junho" })).toBeVisible();
      await expect(page.getByRole("progressbar", { name: "Receita acumulada" })).toHaveAttribute(
        "value",
        "184620",
      );
      await expect(page.locator(".cm-metric-card").first()).toHaveCSS("border-radius", "14px");

      const main = page.getByRole("main");
      expect(await overflow(html)).toBeLessThanOrEqual(1);
      expect(await overflow(main)).toBeLessThanOrEqual(1);

      const action = page.getByRole("button", { name: "Relatório mensal" });
      const initialStyle = await focusStyle(action);
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Ir para o conteúdo" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(main).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(action).toBeFocused();
      await expect.poll(() => focusStyle(action)).not.toEqual(initialStyle);

      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "Relatório mensal" });
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate((element) => element.closest("#root"))).toBeNull();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();

      const period = page.getByRole("button", { name: "14 dias", exact: true });
      await period.press("Enter");
      await expect(period).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.getByRole("table", { name: "Receita dos últimos 14 dias de junho" }),
      ).toHaveCount(1);

      const search = page.getByRole("combobox", { name: "Buscar no dashboard" });
      const searchWidth = (await search.boundingBox())?.width ?? 0;
      expect(searchWidth).toBeGreaterThanOrEqual(
        viewport.name === "mobile" ? viewport.width - 36 : 500,
      );
      await page.keyboard.press("Control+k");
      await expect(search).toBeFocused();
      await search.fill("ped");
      await expect(page.getByRole("option")).toHaveCount(1);
      await expect(page.getByRole("option", { name: "Pedidos", exact: true })).toBeVisible();
      await search.press("Enter");
      await expect(search).toHaveAttribute("aria-expanded", "false");
      await expect(page).toHaveURL(/#pedidos$/);

      const profile = page.getByRole("button", { name: /Camila Ribeiro/ });
      const userMenu = page.getByRole("menu");
      const account = userMenu.getByRole("menuitem", { name: "Minha conta" });
      await profile.press("Enter");
      await expect(account).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(userMenu.getByRole("menuitem", { name: /^Usar tema/ })).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expect(account).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(userMenu).toBeHidden();
      await expect(profile).toBeFocused();

      await profile.press("Enter");
      await expect(account).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(userMenu).toBeHidden();
      await expect(action).toBeFocused();

      await profile.press("ArrowDown");
      await expect(account).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(userMenu).toBeHidden();
      await expect(search).toBeFocused();
      await search.press("Escape");

      await profile.click();
      await account.click();
      const profileDialog = page.getByRole("dialog", { name: "Minha conta" });
      await expect(profileDialog.getByText("camila@aurora.example")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(profileDialog).toBeHidden();

      const table = page.getByRole("region", { name: "Detalhes dos pedidos recentes" });
      const menu = page.getByRole("button", { name: "Abrir menu", exact: true });
      if (viewport.name === "mobile") {
        expect(await overflow(table)).toBeGreaterThan(0);
        await table.focus();
        await page.keyboard.press("ArrowRight");
        await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

        await menu.press("Enter");
        const drawer = page.getByRole("dialog", { name: "Menu", exact: true });
        await expect(drawer.getByRole("link", { name: "Pedidos", exact: true })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(drawer).toBeHidden();

        await page.setViewportSize({ width: 320, height: viewport.height });
        expect(await overflow(html)).toBeLessThanOrEqual(1);
        expect(await overflow(main)).toBeLessThanOrEqual(1);
      } else {
        expect(await overflow(table)).toBeLessThanOrEqual(1);
        await expect(menu).toBeHidden();
        await expect(
          page
            .getByRole("navigation", { name: "Seções do dashboard" })
            .getByRole("link", { name: "Pedidos", exact: true }),
        ).toHaveAttribute("aria-current", "page");
      }
    });
  }
}
