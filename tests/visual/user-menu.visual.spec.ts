import { expect, test, type Locator, type Page } from "@playwright/test";

async function openFixture(page: Page, theme: "light" | "dark") {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/horizonte?fixture=user-menu&theme=${theme}`);
  await expect(page.getByTestId("user-menu-fixture")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", `cm-horizonte-${theme}`);
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

function trigger(page: Page, presentation = "slim") {
  return page.getByTestId(`user-menu-${presentation}`).getByRole("button", {
    name: "Milton Andrade, Administrador",
    exact: true,
  });
}

async function visualState(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      border: style.borderColor,
      color: style.color,
      shadow: style.boxShadow,
    };
  });
}

async function expectWithinViewport(page: Page, locator: Locator) {
  const rect = await locator.boundingBox();
  expect(rect).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(viewport.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const theme of ["light", "dark"] as const) {
  test(`slim ${theme} preserves the small profile, visible chevron and single menu surface`, async ({ page }) => {
    const errors = await openFixture(page, theme);
    const profile = trigger(page);
    const chevron = profile.locator(".cm-user-menu__trigger-chevron");

    await expect(profile).toHaveClass(/cm-user-menu__trigger--slim/);
    await expect(profile).toHaveAttribute("aria-expanded", "false");
    await expect(profile.locator("button")).toHaveCount(0);
    const height = (await profile.boundingBox())!.height;
    expect(height).toBeGreaterThanOrEqual(36);
    expect(height).toBeLessThanOrEqual(38);
    await expect(profile.locator(".cm-avatar")).toHaveCSS("width", "34px");
    await expect(profile.locator(".cm-avatar")).toHaveCSS("height", "34px");
    await expect(chevron).toBeVisible();
    await expect(chevron).toHaveCSS("width", "32px");
    await expect(chevron).toHaveCSS("height", "32px");
    await expect(profile.locator(".cm-user-menu__trigger-title")).toHaveCSS("font-size", "11px");
    await expect(profile.locator(".cm-user-menu__trigger-subtitle")).toHaveCSS("font-size", "10px");
    const resting = await visualState(chevron);
    await profile.hover();
    await expect.poll(() => visualState(chevron)).not.toEqual(resting);
    await expect(page.getByTestId("user-menu-slim")).toHaveScreenshot(`slim-${theme}-hover.png`);

    await profile.click();
    const menu = page.getByRole("menu");
    const surface = page.locator(".cm-user-menu__popover--slim");
    await expect(menu).toBeVisible();
    await expect(profile).toHaveAttribute("aria-expanded", "true");
    await expect(chevron).toBeVisible();
    const popup = (await surface.boundingBox())!;
    expect(popup.width).toBeGreaterThanOrEqual(190);
    expect(popup.width).toBeLessThanOrEqual(210);
    await expect(surface.locator(".cm-user-menu__menu-header--slim")).toBeVisible();
    await expect(surface.locator(".cm-user-menu__menu-header .cm-avatar")).toHaveCount(0);
    await expect(menu.getByText("Milton Andrade", { exact: true })).toBeVisible();
    await expect(menu.getByText("Administrador", { exact: true })).toBeVisible();
    await expect(menu).toHaveCSS("border-top-width", "0px");
    await expect(menu).toHaveCSS("box-shadow", "none");
    await expect(menu.getByRole("menuitem", { name: "Meus produtos", exact: true })).toHaveCSS("font-size", "12px");
    await expect(menu.getByRole("menuitem", { name: "Preferências", exact: true })).toBeDisabled();
    await expectWithinViewport(page, surface);
    await expect(page.getByTestId("user-menu-slim")).toHaveScreenshot(`slim-${theme}-open.png`);
    expect(errors).toEqual([]);
  });

  test(`slim ${theme} closes on Escape with focus return, outside click and item actions`, async ({ page }) => {
    const errors = await openFixture(page, theme);
    const profile = trigger(page);
    await profile.focus();
    await profile.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("menuitem", { name: "Meus produtos", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(profile).toHaveAttribute("aria-expanded", "false");
    await expect(profile).toBeFocused();

    await profile.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByTestId("user-menu-outside").click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByTestId("user-menu-outside")).toBeFocused();
    await expect(page.getByTestId("user-menu-event")).toHaveText("Nenhuma ação");

    await profile.click();
    await page.getByRole("menuitem", { name: "Meus produtos", exact: true }).click();
    await expect(page.getByTestId("user-menu-event")).toHaveText("slim: produtos");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await profile.click();
    await page.getByRole("menuitem", { name: "Sair", exact: true }).click();
    await expect(page.getByTestId("user-menu-event")).toHaveText("slim: sair");
    await expect(page.getByRole("menu")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test(`slim ${theme} keeps its chevron and popup usable on a small screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = await openFixture(page, theme);
    const profile = trigger(page);
    await expect(profile.locator(".cm-user-menu__trigger-chevron")).toBeVisible();
    await expect(profile.locator(".cm-user-menu__trigger-chevron")).toHaveCSS("width", "32px");
    await expectWithinViewport(page, profile);
    await profile.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expectWithinViewport(page, page.locator(".cm-user-menu__popover--slim"));
    await expect(page.getByTestId("user-menu-slim")).toHaveScreenshot(`slim-${theme}-mobile-open.png`);
    await page.getByRole("menuitem", { name: "Sair", exact: true }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByTestId("user-menu-event")).toHaveText("slim: sair");
    expect(errors).toEqual([]);
  });

  test(`slim is opt-in and keeps default and compact presentations in ${theme}`, async ({ page }) => {
    const errors = await openFixture(page, theme);
    const defaultProfile = trigger(page, "default");
    const compactProfile = trigger(page, "compact");
    await expect(defaultProfile).not.toHaveClass(/trigger--slim|trigger--compact/);
    await expect(defaultProfile.locator(".cm-user-menu__trigger-title")).toBeVisible();
    await expect(defaultProfile.locator(".cm-user-menu__trigger-subtitle")).toBeVisible();
    await expect(compactProfile).toHaveClass(/trigger--compact/);
    await expect(compactProfile).not.toHaveClass(/trigger--slim/);
    await expect(compactProfile.locator(".cm-user-menu__trigger-text")).toHaveCount(0);
    await expect(page.getByTestId("user-menu-fixture")).toHaveScreenshot(`user-menu-presentations-${theme}.png`);

    await defaultProfile.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.locator(".cm-user-menu__popover--slim")).toHaveCount(0);
    await expect(page.locator(".cm-user-menu__menu-header")).toBeHidden();
    await page.getByRole("menuitem", { name: "Meus produtos", exact: true }).click();
    await expect(page.getByTestId("user-menu-event")).toHaveText("default: produtos");
    await expect(page.getByRole("menu")).toHaveCount(0);

    await compactProfile.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.locator(".cm-user-menu__menu-header .cm-avatar")).toHaveCount(1);
    await expect(page.locator(".cm-user-menu__menu-header")).toBeVisible();
    await page.getByRole("menuitem", { name: "Sair", exact: true }).click();
    await expect(page.getByTestId("user-menu-event")).toHaveText("compact: sair");
    await expect(page.getByRole("menu")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
