import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmRow, CmCol, CmStack } from "./layout.js";

describe("layout grow", () => {
  it("does not add the grow class by default", () => {
    render(<CmCol data-testid="c">x</CmCol>);
    expect(screen.getByTestId("c")).not.toHaveClass("cm-layout-grow");
  });

  it("adds the grow class for grow (weight 1, no inline var)", () => {
    render(<CmCol grow data-testid="c">x</CmCol>);
    const el = screen.getByTestId("c");
    expect(el).toHaveClass("cm-col", "cm-layout-grow");
    expect(el.style.getPropertyValue("--cm-layout-grow")).toBe("");
  });

  it("sets the weight var for a numeric grow", () => {
    render(<CmRow grow={2} data-testid="r">x</CmRow>);
    const el = screen.getByTestId("r");
    expect(el).toHaveClass("cm-layout-grow");
    expect(el.style.getPropertyValue("--cm-layout-grow")).toBe("2");
  });

  it("treats grow={0} and grow={false} as no growth", () => {
    const { rerender } = render(<CmStack grow={0} data-testid="s">x</CmStack>);
    expect(screen.getByTestId("s")).not.toHaveClass("cm-layout-grow");
    rerender(<CmStack grow={false} data-testid="s">x</CmStack>);
    expect(screen.getByTestId("s")).not.toHaveClass("cm-layout-grow");
  });

  it("works alongside fullWidth and a custom className", () => {
    render(<CmRow grow fullWidth className="extra" data-testid="r">x</CmRow>);
    expect(screen.getByTestId("r")).toHaveClass(
      "cm-row",
      "cm-layout-grow",
      "cm-layout-full",
      "extra",
    );
  });
});
