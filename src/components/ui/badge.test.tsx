import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmBadge } from "./badge.js";

describe("CmBadge", () => {
  it("renders a span with base + default variant classes", () => {
    render(<CmBadge>New</CmBadge>);
    const el = screen.getByText("New");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("cm-badge", "cm-badge--soft", "cm-badge--default");
  });

  it("applies selected variant and tone", () => {
    render(
      <CmBadge variant="outline" tone="danger">
        Stop
      </CmBadge>,
    );
    expect(screen.getByText("Stop")).toHaveClass("cm-badge--outline", "cm-badge--danger");
  });

  it("forwards native props to the root element", () => {
    render(<CmBadge data-testid="b" aria-label="status" />);
    expect(screen.getByTestId("b")).toHaveAttribute("aria-label", "status");
  });

  it("renders onto the child element when asChild is set", () => {
    render(
      <CmBadge asChild tone="success">
        <a href="/x">Go</a>
      </CmBadge>,
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link).toHaveClass("cm-badge", "cm-badge--success");
  });
});
