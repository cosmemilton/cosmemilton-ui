import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Horizonte ${theme} aligns action headers with their button groups`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/horizonte?fixture=data-table&theme=${theme}`);
    const fixture = page.getByTestId("data-table-fixture");
    await expect(fixture).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", `cm-horizonte-${theme}`);
    await page.evaluate(() => document.fonts.ready);

    for (const [align, label] of [
      ["left", "Esquerda"],
      ["center", "Ações"],
      ["right", "Direita"],
    ] as const) {
      const header = page
        .getByRole("columnheader", { name: label })
        .locator(".cm-data-table__header-content");
      const group = page.getByTestId(`actions-${align}`);
      const buttons = group.getByRole("button");
      await expect(buttons).toHaveCount(4);
      const headerRect = (await header.boundingBox())!;
      const first = (await buttons.first().boundingBox())!;
      const last = (await buttons.last().boundingBox())!;
      const headerAnchor =
        align === "left"
          ? headerRect.x
          : align === "center"
            ? headerRect.x + headerRect.width / 2
            : headerRect.x + headerRect.width;
      const groupAnchor =
        align === "left"
          ? first.x
          : align === "center"
            ? (first.x + last.x + last.width) / 2
            : last.x + last.width;
      expect(Math.abs(headerAnchor - groupAnchor)).toBeLessThanOrEqual(1);
    }

    await expect(page.locator(".cm-data-table__head tr")).toHaveCSS("height", "42px");
    await expect(page.locator(".cm-data-table__body")).toHaveCSS("font-size", "13px");
    await expect(page.locator(".cm-data-table__body")).toHaveCSS("font-weight", "400");
    await expect(page.getByRole("columnheader", { name: "Cliente", exact: true })).toHaveCSS(
      "font-size",
      "10px",
    );
    await expect(page.getByRole("columnheader", { name: "Cliente", exact: true })).toHaveCSS(
      "font-weight",
      "500",
    );
    await expect(page.getByText("Ana Beatriz", { exact: true })).toHaveCSS("font-weight", "550");
    await expect(page.getByText("Recife · PE", { exact: true })).toHaveCSS(
      "color",
      theme === "light" ? "rgb(104, 122, 145)" : "rgb(184, 199, 219)",
    );
    await expect(fixture).toHaveScreenshot(`data-table-actions-${theme}.png`);

    await page
      .getByTestId("actions-center")
      .getByRole("button", { name: "Editar", exact: true })
      .click();
    await expect(page.getByRole("status")).toHaveText("center: Editar");
    expect(errors).toEqual([]);
  });
}
