import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmRow, CmCol, CmStack, CmContainer } from "./layout.js";

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

describe("layout surface props", () => {
  it("applies tokenized spacing and surface classes to CmStack", () => {
    render(
      <CmStack
        padding="md"
        paddingInline="lg"
        marginBlock="sm"
        surface="card"
        radius="lg"
        border="sm"
        borderColor="primary"
        data-testid="s"
      >
        x
      </CmStack>,
    );

    const el = screen.getByTestId("s");
    expect(el).toHaveClass(
      "cm-stack",
      "cm-layout-box",
      "cm-layout-box--has-margin",
      "cm-layout-surface-card",
      "cm-layout-radius-lg",
      "cm-layout-border-sm",
    );
    expect(el.style.getPropertyValue("--cm-layout-padding")).toBe("var(--space-md, 1rem)");
    expect(el.style.getPropertyValue("--cm-layout-padding-inline")).toBe(
      "var(--space-lg, 1.5rem)",
    );
    expect(el.style.getPropertyValue("--cm-layout-margin-block")).toBe("var(--space-sm, 0.5rem)");
    expect(el.style.getPropertyValue("--cm-layout-border-color")).toBe(
      "var(--color-primary, primary)",
    );
  });

  it("allows semantic elements through polymorphic layout props", () => {
    render(
      <CmRow as="label" htmlFor="field" data-testid="label">
        Nome
      </CmRow>,
    );

    expect(screen.getByTestId("label").tagName).toBe("LABEL");
    expect(screen.getByTestId("label")).toHaveAttribute("for", "field");
  });

  it("sets container padding shorthand or axis variables", () => {
    const { rerender } = render(
      <CmContainer padding="1rem 2rem" data-testid="c">
        x
      </CmContainer>,
    );

    expect(screen.getByTestId("c").style.getPropertyValue("--cm-container-padding")).toBe(
      "1rem 2rem",
    );

    rerender(
      <CmContainer paddingInline="lg" paddingBlock="sm" data-testid="c">
        x
      </CmContainer>,
    );
    expect(screen.getByTestId("c").style.getPropertyValue("--cm-container-padding-inline")).toBe(
      "clamp(1.5rem, 4vw, 4rem)",
    );
    expect(screen.getByTestId("c").style.getPropertyValue("--cm-container-padding-block")).toBe(
      "clamp(0.75rem, 2vw, 1.25rem)",
    );
  });
});
