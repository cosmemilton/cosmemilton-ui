import { describe, expect, it } from "vitest";
import { cmVariants } from "./variants.js";

const badge = cmVariants({
  base: "cm-badge",
  variants: {
    tone: { default: "cm-badge--default", danger: "cm-badge--danger" },
    size: { sm: "cm-badge--sm", md: "cm-badge--md" },
  },
  defaultVariants: { tone: "default", size: "md" },
});

describe("cmVariants", () => {
  it("applies base + default variants when nothing is passed", () => {
    expect(badge()).toBe("cm-badge cm-badge--default cm-badge--md");
  });

  it("overrides defaults with selected options", () => {
    expect(badge({ tone: "danger", size: "sm" })).toBe("cm-badge cm-badge--danger cm-badge--sm");
  });

  it("appends an extra className last", () => {
    expect(badge({ className: "extra" })).toBe("cm-badge cm-badge--default cm-badge--md extra");
  });

  it("skips groups whose option has no class", () => {
    const v = cmVariants({
      base: "x",
      variants: { spacing: { none: undefined, md: "x--md" } },
      defaultVariants: { spacing: "none" },
    });
    expect(v()).toBe("x");
    expect(v({ spacing: "md" })).toBe("x x--md");
  });
});
