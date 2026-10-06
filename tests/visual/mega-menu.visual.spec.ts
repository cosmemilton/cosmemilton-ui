import { expect, test, type Locator, type Page } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function insideViewport(page: Page, locator: Locator) {
  const viewport = page.viewportSize()!;
  await expect(locator).toBeVisible();
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      return Boolean(
        box &&
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= viewport.width + 1 &&
        box.y + box.height <= viewport.height + 1,
      );
    })
    .toBe(true);
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 320, height: 650 },
  { width: 667, height: 280 },
]) {
  test(`mega navigation and search fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto("/mega-menu");
    const trigger = page.getByRole("button", { name: "Biblioteca", exact: true });
    await trigger.click();
    const panel = page.locator(".cm-mega-panel");
    await insideViewport(page, panel);
    expect(await panel.evaluate((element) => Boolean(element.closest(".cm-topbar")))).toBe(false);
    await expect(panel.getByText("Componentes", { exact: true })).toBeVisible();
    await trigger.press("ArrowDown");
    await expect(panel.getByRole("button", { name: /Card/ })).toBeFocused();
    await panel.getByRole("button", { name: /Card/ }).press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();

    const input = page.getByRole("combobox", { name: "Buscar na biblioteca" });
    await input.fill("Explore todas");
    await insideViewport(page, panel);
    const list = page.getByRole("listbox");
    await expect(list.getByRole("option")).toHaveCount(48);
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const scrollingViolations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: typeof import("axe-core") }).axe;
      return (
        await axe.run(document, {
          runOnly: { type: "rule", values: ["scrollable-region-focusable"] },
        })
      ).violations.map(({ id }) => id);
    });
    expect(scrollingViolations).toEqual([]);
    await expect(input).toBeFocused();
    const inputBox = (await input.boundingBox())!;
    const panelBox = (await panel.boundingBox())!;
    expect(panelBox.y).toBeGreaterThanOrEqual(inputBox.y + inputBox.height);
    await input.press("End");
    await expect(list.getByRole("option").last()).toHaveAttribute("aria-selected", "true");
    await expect(list.getByRole("option").last()).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath(`mega-panel-${viewport.width}.png`) });
    await input.press("Enter");
    await expect(panel).toHaveCount(0);
    await expect(page.getByTestId("selection")).toHaveText("Componente 48");
    await expect(input).toBeFocused();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width + 1,
    );
    expect(errors).toEqual([]);
  });
}

test("portalled navigation follows logical Tab order and honors actions, disabled entries and links", async ({
  page,
}) => {
  await page.goto("/mega-menu");
  const trigger = page.getByRole("button", { name: "Biblioteca", exact: true });
  await trigger.click();
  await trigger.press("Tab");
  const panel = page.locator(".cm-mega-panel");
  const card = panel.getByRole("button", { name: /Card/ });
  await expect(card).toBeFocused();
  await card.press("Shift+Tab");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await trigger.press("Tab");
  await card.press("Enter");
  await expect(page.getByTestId("selection")).toHaveText("Card");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(panel.getByRole("button", { name: "Em breve", exact: true })).toBeDisabled();
  const footer = panel.getByRole("button", { name: "Ação do rodapé" });
  await footer.focus();
  await footer.press("Tab");
  await expect(page.getByRole("button", { name: "Conta", exact: true })).toBeFocused();
  await expect(panel).toHaveCount(0);
  await trigger.click();
  await panel.getByRole("link", { name: "Link nativo" }).click();
  await expect(page).toHaveURL(/#native-destination$/);
  await expect(panel).toHaveCount(0);
  await page.getByRole("button", { name: "Ação direta", exact: true }).click();
  await expect(page.getByTestId("selection")).toHaveText("Direta");
});

test("search filters accents and keywords, keeps typing in place, dismisses and allows Tab to leave", async ({
  page,
}) => {
  await page.goto("/mega-menu");
  const input = page.getByRole("combobox", { name: "Buscar na biblioteca" });
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await input.fill("icones");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("Ícones");
  await input.fill("simbolos");
  await expect(page.getByRole("option")).toHaveCount(1);
  await input.press("Enter");
  await expect(page.getByTestId("selection")).toHaveText("Ícones");
  await input.fill("nenhum-resultado-possivel");
  await expect(page.locator('[role="option"]:not([aria-disabled="true"])')).toHaveCount(0);
  await expect(page.getByRole("option")).toHaveAttribute("aria-disabled", "true");
  await expect(input).not.toHaveAttribute("aria-activedescendant");
  await expect(page.locator(".cm-mega-panel")).toContainText(/Nenhum/);
  await input.press("Escape");
  await expect(page.locator(".cm-mega-panel")).toHaveCount(0);
  await expect(input).toBeFocused();
  await input.fill("card");
  await input.press("Tab");
  await expect(page.getByRole("button", { name: "Depois da busca" })).toBeFocused();
  await expect(page.locator(".cm-mega-panel")).toHaveCount(0);
  await input.fill("card");
  await page.getByRole("button", { name: "Depois da busca" }).click();
  await expect(page.locator(".cm-mega-panel")).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("a menu near the viewport bottom opens upward without clipping", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 650 });
  await page.goto("/mega-menu?edge=1");
  const trigger = page.getByRole("button", { name: "Biblioteca", exact: true });
  await trigger.click();
  const panel = page.locator(".cm-mega-panel");
  await insideViewport(page, panel);
  const anchorBox = (await trigger.boundingBox())!;
  const panelBox = (await panel.boundingBox())!;
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(anchorBox.y);
  expect(panelBox.height).toBeGreaterThan(100);
});

test("Tab skips a responsive hidden header control", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 650 });
  await page.goto("/mega-menu?hidden-slot=1");
  const trigger = page.getByRole("button", { name: "Biblioteca", exact: true });
  await trigger.click();
  await trigger.press("Tab");
  await expect(page.locator(".cm-mega-panel").getByRole("button", { name: /Card/ })).toBeFocused();
  await expect(page.getByRole("button", { name: "Oculto no mobile" })).toHaveCount(0);
});

test("results region supports direct keyboard scrolling and Escape restores the input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 650 });
  await page.goto("/mega-menu");
  const input = page.getByRole("combobox", { name: "Buscar na biblioteca" });
  await input.fill("Explore todas");
  const region = page.locator(".cm-mega-panel").getByRole("region");
  await expect(region).toHaveAttribute("tabindex", "0");
  await region.focus();
  await region.press("PageDown");
  await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await region.press("Escape");
  await expect(page.locator(".cm-mega-panel")).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
});

for (const theme of ["cm-v4-light", "cm-v4-dark", "cm-v4-aurora"]) {
  test(`${theme}: icons and grouped panels pass accessibility checks`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/mega-menu?theme=${theme}`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    for (const kind of ["menu", "search", "empty"]) {
      if (kind === "menu")
        await page.getByRole("button", { name: "Biblioteca", exact: true }).click();
      else
        await page
          .getByRole("combobox", { name: "Buscar na biblioteca" })
          .fill(kind === "empty" ? "nenhum-item-existente" : "card");
      const panel = page.locator(".cm-mega-panel");
      await insideViewport(page, panel);
      if (kind !== "empty") await expect(panel.locator("svg").first()).toBeVisible();
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: typeof import("axe-core") }).axe;
        const results = await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        });
        return results.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
        }));
      });
      expect(violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${kind}.png`) });
      await page.keyboard.press("Escape");
    }
  });
}
