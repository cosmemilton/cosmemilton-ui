import { expect, test, type Locator, type Page } from "@playwright/test";

async function controlRects(row: Locator) {
  return row.locator(".cm-floating-field__control").evaluateAll((controls) =>
    controls.map((control) => {
      const rect = control.getBoundingClientRect();
      return {
        height: Number(rect.height.toFixed(2)),
        top: Number(rect.top.toFixed(2)),
      };
    }),
  );
}

async function fieldHeights(fields: Locator) {
  return fields.evaluateAll((elements) =>
    elements.map((field) => Number(field.getBoundingClientRect().height.toFixed(2))),
  );
}

function expectAligned(heights: number[], expectedCount: number) {
  expect(heights).toHaveLength(expectedCount);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(0.5);
}

async function centerY(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return Number((rect.top + rect.height / 2).toFixed(2));
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

async function messageColors(row: Locator) {
  return row
    .locator(".cm-floating-field__message")
    .evaluateAll((messages) => messages.map((message) => getComputedStyle(message).color));
}

async function switchColors(switchLocator: Locator) {
  return switchLocator.evaluate((element) => {
    const thumb = element.querySelector<HTMLElement>(".cm-switch__thumb");
    if (!thumb) throw new Error("Switch thumb not found");

    return {
      thumb: getComputedStyle(thumb).backgroundColor,
      track: getComputedStyle(element).backgroundColor,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("controls-fixture")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("body")).toHaveCSS("font-family", /CmVisualTestInter/);
  expect(await page.evaluate(() => document.fonts.check('16px "CmVisualTestInter"'))).toBe(true);
});

test("form controls preserve equal heights across adornment and helper states", async ({
  page,
}) => {
  const allControlHeights: number[] = [];
  const rows = [
    ["plain", 3],
    ["start", 5],
    ["end", 5],
    ["helper", 4],
    ["success", 4],
    ["error", 4],
  ] as const;

  for (const [id, expectedCount] of rows) {
    const row = page.locator(`[data-control-row="${id}"]`);
    const rects = await controlRects(row);
    const heights = rects.map(({ height }) => height);
    const tops = rects.map(({ top }) => top);
    expectAligned(heights, expectedCount);
    expectAligned(tops, expectedCount);
    allControlHeights.push(...heights);
  }

  expect(Math.max(...allControlHeights) - Math.min(...allControlHeights)).toBeLessThanOrEqual(0.5);

  for (const id of ["helper", "success", "error"]) {
    const feedbackFields = page
      .locator(`[data-control-row="${id}"] .visual-control-cell:not(:first-child)`)
      .locator(".cm-floating-field");
    expectAligned(await fieldHeights(feedbackFields), 3);
  }

  for (const position of ["start", "end"] as const) {
    const iconInput = page.locator(`.visual-input--${position}-icon`);
    const buttonInput = page.locator(`.visual-input--${position}-button`);
    const iconCenter = await centerY(iconInput.locator(".cm-icon"));
    const buttonCenter = await centerY(buttonInput.locator(".cm-button"));
    const iconControlCenter = await centerY(iconInput.locator(".cm-input__control"));
    const buttonControlCenter = await centerY(buttonInput.locator(".cm-input__control"));

    expect(Math.abs(iconCenter - iconControlCenter)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(buttonCenter - buttonControlCenter)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(iconCenter - buttonCenter)).toBeLessThanOrEqual(0.5);
  }

  const expectedColors = {
    helper: await resolvedColor(page, "--color-muted-foreground"),
    success: await resolvedColor(page, "--color-success"),
    error: await resolvedColor(page, "--color-danger"),
  };

  for (const [id, expectedColor] of Object.entries(expectedColors)) {
    const colors = await messageColors(page.locator(`[data-control-row="${id}"]`));
    expect(colors).toHaveLength(3);
    expect(new Set(colors)).toEqual(new Set([expectedColor]));
  }

  await expect(page.getByTestId("controls-fixture")).toHaveScreenshot("form-controls.png");
});

test("switch remains distinguishable on normal and inverted surfaces", async ({ page }) => {
  const normalPanel = page.getByTestId("normal-panel");
  const invertedPanel = page.getByTestId("inverted-panel");
  const invertedPanelBackground = await invertedPanel.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  const normalOff = await switchColors(page.getByTestId("switch-normal-off"));
  const normalOn = await switchColors(page.getByTestId("switch-normal-on"));
  const invertedOff = await switchColors(page.getByTestId("switch-inverted-off"));
  const invertedOn = await switchColors(page.getByTestId("switch-inverted-on"));

  expect(normalOff.track).not.toBe(normalOn.track);
  expect(normalOff.thumb).not.toBe(normalOff.track);
  expect(normalOn.thumb).not.toBe(normalOn.track);
  expect(invertedOff.track).not.toBe(invertedOn.track);
  expect(invertedOff.thumb).not.toBe(invertedOff.track);
  expect(invertedOn.track).not.toBe(invertedPanelBackground);
  expect(invertedOn.thumb).not.toBe(invertedOn.track);

  await expect(normalPanel).toBeVisible();
  await expect(page.getByTestId("switch-fixture")).toHaveScreenshot("switch-surfaces.png");
});
