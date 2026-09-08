import { expect, test, type Page } from "@playwright/test";

function field(page: Page, label: string) {
  return page.locator(".cm-floating-field").filter({
    has: page.getByRole("textbox", { name: label, exact: true }),
  });
}

function treeItem(page: Page, name: string) {
  return page.locator(".cm-tree-view__item").filter({
    has: page.getByRole("button", { name, exact: true }),
  });
}

async function resolvedColor(page: Page, token: string) {
  return page.evaluate((cssToken) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${cssToken})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/horizonte");
  await expect(page.getByTestId("horizonte-fixture")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-cm-skin", "horizonte");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "cm-horizonte-light");
  await page.evaluate(() => document.fonts.ready);
});

test("Horizonte keeps floating labels, state colors and field geometry", async ({ page }) => {
  const emptyField = field(page, "Nome vazio");
  const input = emptyField.getByRole("textbox");
  const label = emptyField.locator("label");
  const control = emptyField.locator(".cm-floating-field__control");

  await expect(control).toHaveCSS("height", "44px");
  await expect(input).toHaveCSS("font-size", "13px");
  await expect(label).toHaveCSS("font-size", "13px");
  await expect(label).not.toHaveClass(/label--floating/);
  await input.focus();
  await expect(label).toHaveClass(/label--floating/);
  await expect(label).toHaveCSS("font-size", "11px");
  await expect(control).toHaveCSS("border-color", await resolvedColor(page, "--color-ring"));
  await input.fill("Maria Oliveira");
  await page.getByRole("heading", { name: "Componentes Horizonte" }).click();
  await expect(label).toHaveClass(/label--floating/);
  await emptyField.getByRole("button", { name: "Limpar campo" }).click();
  await expect(input).toHaveValue("");
  await page.getByRole("heading", { name: "Componentes Horizonte" }).click();
  await expect(label).not.toHaveClass(/label--floating/);

  const compact = field(page, "Densidade compacta");
  await expect(compact.locator(".cm-floating-field__control")).toHaveCSS("height", "39px");
  await expect(compact.getByRole("textbox")).toHaveCSS("font-size", "13px");
  await expect(page.getByRole("textbox", { name: "Código somente leitura" })).not.toBeEditable();
  await expect(page.getByRole("textbox", { name: "Campo desabilitado" })).toBeDisabled();

  const invalidField = field(page, "Nome inválido");
  await invalidField.getByRole("textbox").hover();
  await invalidField.getByRole("textbox").focus();
  await expect(invalidField.locator(".cm-floating-field__control")).toHaveCSS(
    "border-color",
    await resolvedColor(page, "--color-danger"),
  );
  await expect(invalidField.getByText("Informe o nome completo.")).toBeVisible();
});

test("Horizonte preserves solitary expansion, native dragging and keyboard actions", async ({
  page,
}) => {
  const solitary = page.getByRole("switch", { name: "Modo Solitário" });
  await solitary.click();
  await expect(page.getByRole("button", { name: "Café especial", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Arroz integral", exact: true })).toHaveCount(0);

  const alimentos = treeItem(page, "Alimentos");
  await alimentos.getByRole("button", { name: "Expand", exact: true }).click();
  await expect(page.getByRole("button", { name: "Café especial", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Arroz integral", exact: true })).toBeVisible();
  await solitary.click();
  await page.getByRole("button", { name: "Expandir Tudo", exact: true }).click();

  const cafe = treeItem(page, "Café especial");
  await cafe.hover();
  await cafe.getByRole("button", { name: "Drag to reorder", exact: true }).dragTo(alimentos, {
    targetPosition: { x: 250, y: 23 },
  });
  await expect(page.getByRole("status")).toHaveText("cafe → alimentos; inside; 2");
  await expect(alimentos.locator(".cm-tree-view__node")).toHaveCSS("padding-left", "12px");
  await expect(cafe.locator(".cm-tree-view__node")).toHaveCSS("padding-left", "36px");
  await expect(cafe.getByRole("button", { name: "Café especial", exact: true })).toHaveCSS(
    "font-size",
    "13px",
  );

  // Collapsing the destination proves the dragged item now belongs to it.
  await alimentos.getByRole("button", { name: "Collapse", exact: true }).click();
  await expect(page.getByRole("button", { name: "Café especial", exact: true })).toHaveCount(0);
  await alimentos.getByRole("button", { name: "Expand", exact: true }).click();
  await page.getByRole("heading", { name: "Componentes Horizonte" }).hover();
  await cafe.getByRole("button", { name: "Café especial", exact: true }).focus();
  await expect(cafe.locator(".cm-tree-view__actions")).toHaveCSS("opacity", "1");
  await cafe.getByRole("button", { name: "Edit", exact: true }).press("Enter");
  await expect(page.getByRole("status")).toHaveText("Editar Café especial");
});

test("Horizonte dark loads both fonts and styles choices rendered in a portal", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Alternar tema", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "cm-horizonte-dark");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("body")).toHaveCSS("font-family", /CM Horizonte Inter/);
  await expect(page.getByRole("heading", { name: "Componentes Horizonte" })).toHaveCSS(
    "font-family",
    /CM Horizonte Manrope/,
  );
  expect(await page.evaluate(() => document.fonts.check('13px "CM Horizonte Inter"'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('30px "CM Horizonte Manrope"'))).toBe(true);

  const select = page.getByRole("combobox", { name: "Município", exact: true });
  await select.click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  // CmPortal attaches directly to body, beyond the fixture's component tree.
  expect(await listbox.evaluate((node) => node.closest("#root"))).toBeNull();
  await expect(listbox).toHaveCSS("background-color", await resolvedColor(page, "--color-popover"));
  await expect(page.getByRole("option", { name: "Recife", exact: true })).toHaveCSS(
    "font-size",
    "13px",
  );
  await page.getByRole("option", { name: "Recife", exact: true }).click();
  await expect(select).toContainText("Recife");
  await expect(listbox).toHaveCount(0);
  await expect(field(page, "Nome preenchido").getByRole("textbox")).toHaveValue("Ana Beatriz");
});
