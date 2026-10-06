import { expect, test, type Locator } from "@playwright/test";

async function contrast(button: Locator) {
  return button.evaluate((element) => {
    const css = getComputedStyle(element);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const channels = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const rgba = [...context.getImageData(0, 0, 1, 1).data];
      if (rgba[3] !== 255) throw new Error(`Expected an opaque button color: ${color}`);
      return rgba.slice(0, 3).map((channel) => channel / 255);
    };
    const luminance = (rgb: number[]) =>
      rgb
        .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = luminance(channels(css.color));
    const background = luminance(channels(css.backgroundColor));
    return {
      foreground: css.color,
      background: css.backgroundColor,
      ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
    };
  });
}

for (const skin of ["classic", "horizonte"]) {
  for (const theme of ["cm-v4-light", "cm-v4-dark", "cm-v4-aurora"]) {
    test(`soft button ink stays readable at rest, hover, press and selected hover in ${skin} ${theme}`, async ({
      page,
    }) => {
      await page.goto(`/button-tones?theme=${theme}&skin=${skin}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      for (const tone of [
        "default",
        "primary",
        "secondary",
        "accent",
        "info",
        "success",
        "warning",
        "danger",
      ]) {
        const rest = page.locator(`button[data-tone="${tone}"][data-state="rest"]`);
        const selected = page.locator(`button[data-tone="${tone}"][data-state="selected"]`);
        await page.mouse.move(0, 0);
        await expect.poll(async () => (await contrast(rest)).ratio).toBeGreaterThanOrEqual(4.5);
        const restColor = await contrast(rest);
        const selectedColor = await contrast(selected);
        expect(selectedColor.ratio).toBeGreaterThanOrEqual(4.5);
        await rest.hover();
        await expect
          .poll(async () => (await contrast(rest)).background)
          .not.toEqual(restColor.background);
        await expect.poll(async () => (await contrast(rest)).ratio).toBeGreaterThanOrEqual(4.5);
        await page.mouse.down();
        await expect.poll(async () => (await contrast(rest)).ratio).toBeGreaterThanOrEqual(4.5);
        await page.mouse.up();
        await selected.hover();
        await expect.poll(() => contrast(selected)).toEqual(selectedColor);
        expect((await contrast(selected)).ratio).toBeGreaterThanOrEqual(4.5);
      }
      await page.screenshot({ path: test.info().outputPath(`soft-${skin}-${theme}.png`) });
    });
  }
}
