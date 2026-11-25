import { expect, test, type Page } from "@playwright/test";

async function expectNoOverflow(page: Page) {
  expect(await page.locator("body").evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [1440, 390]) {
    test(`customer workspace in ${theme} at ${width}px`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: width === 390 ? 900 : 820 });
      await page.goto(`/customer-workspace?theme=${theme}`);
      await expect(page.getByRole("heading", { name: "Editar cliente" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Histórico de alterações" })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Limite" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Norte Serviços" })).toHaveCount(0);
      await expect(page.locator("main")).toContainText("R$ 500,00");
      await expect(page.locator("main")).toContainText("R$ 800,00");
      await expect(page.locator("[data-theme='cm-v4-" + theme + "']").last()).toBeAttached();
      await expect(page.locator(".workspace-demo__amount").first()).toHaveCSS(
        "white-space",
        "nowrap",
      );
      await expectNoOverflow(page);
      const editor = (await page.getByRole("form", { name: "Cadastro do cliente" }).boundingBox())!;
      const history = (await page
        .getByRole("complementary", { name: "Auditoria do cadastro" })
        .boundingBox())!;
      if (width === 390) expect(history.y).toBeGreaterThanOrEqual(editor.y + editor.height);
      else expect(history.x).toBeGreaterThanOrEqual(editor.x + editor.width);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: testInfo.outputPath("customer-workspace.png"),
        fullPage: true,
        animations: "disabled",
      });
      expect(errors).toEqual([]);
    });
  }
}

test("restores a whole saved view and records a change inside the form", async ({ page }) => {
  await page.goto("/customer-workspace");
  await page.getByRole("checkbox", { name: "Em revisão" }).uncheck();
  await page.getByRole("checkbox", { name: "Mostrar limite" }).uncheck();
  await page.getByRole("button", { name: "Maior limite" }).click();
  await expect(page.getByRole("button", { name: "Norte Serviços" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Limite" })).toHaveCount(0);
  const select = page.getByRole("combobox", { name: "Visões salvas" });
  await select.selectOption({ label: "Visão padrão" });
  await select.selectOption({ label: "Crédito em revisão" });
  await expect(page.getByRole("checkbox", { name: "Em revisão" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Maior limite" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("columnheader", { name: "Limite" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Norte Serviços" })).toHaveCount(0);
  await page.getByRole("spinbutton", { name: "Limite de crédito (R$)" }).fill("950");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  const history = page.getByRole("complementary", { name: "Auditoria do cadastro" });
  await expect(history).toContainText("Você");
  await expect(history).toContainText("R$ 950,00");
});
