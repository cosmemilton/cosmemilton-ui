import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmBox } from "./box.js";
import { CmRow, CmCol, CmStack } from "./layout.js";
import { CmText } from "./text.js";

describe("public presentation primitives", () => {
  it("inherits responsive dimensions through omitted breakpoints without leaking objects to HTML", () => {
    render(
      <CmBox
        as="iframe"
        title="Preview"
        width={{ base: "100%", md: 640, xl: 900 }}
        height={480}
        overflow="hidden"
      />,
    );
    const frame = screen.getByTitle("Preview");
    expect(frame).not.toHaveAttribute("width");
    expect(frame.style.getPropertyValue("--cm-width-base")).toBe("100%");
    expect(frame.style.getPropertyValue("--cm-width-sm")).toBe("100%");
    expect(frame.style.getPropertyValue("--cm-width-md")).toBe("640px");
    expect(frame.style.getPropertyValue("--cm-width-lg")).toBe("640px");
    expect(frame.style.getPropertyValue("--cm-width-xl")).toBe("900px");
    expect(frame.style.getPropertyValue("--cm-height-base")).toBe("480px");
  });

  it.each([CmRow, CmCol, CmStack])(
    "keeps layout sizing, surfaces and placement inside the component API",
    (Component) => {
      render(
        <Component
          data-testid="layout"
          minWidth={0}
          maxHeight={640}
          overflowY="auto"
          surface="glass"
          elevation="sm"
          position="sticky"
          top="md"
          zIndex="sticky"
          visibleFrom="md"
        >
          Tools
        </Component>,
      );
      const element = screen.getByTestId("layout");
      expect(element).not.toHaveAttribute("overflowY");
      expect(element).not.toHaveAttribute("elevation");
      expect(element).not.toHaveAttribute("position");
      expect(element.style.getPropertyValue("--cm-position-top")).toBe("var(--space-md, 1rem)");
      expect(element.style.getPropertyValue("--cm-position-z")).toBe("var(--z-sticky)");
      expect(element.style.getPropertyValue("--cm-max-height-base")).toBe("640px");
    },
  );

  it("preserves semantic heading and code elements with editorial typography", () => {
    render(
      <>
        <CmText as="h1" size="display" family="heading" wrap="balance">
          Build with components
        </CmText>
        <CmText as="code" family="mono" wrap="anywhere">
          cosmemilton-ui/server
        </CmText>
      </>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Build with components");
    expect(screen.getByText("cosmemilton-ui/server").tagName).toBe("CODE");
    expect(screen.getByRole("heading")).not.toHaveAttribute("family");
    expect(screen.getByRole("heading")).not.toHaveAttribute("wrap");
  });
});
