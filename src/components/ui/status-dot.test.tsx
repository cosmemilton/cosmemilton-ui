import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmStatusDot } from "./status-dot.js";

describe("CmStatusDot", () => {
  it("renders a neutral dot at md size by default", () => {
    const { container } = render(<CmStatusDot data-testid="dot" />);
    const dot = screen.getByTestId("dot");
    expect(dot).toHaveClass("cm-status-dot", "cm-status-dot--tone-default", "cm-status-dot--md");
    // Decorative by default: no text content, nothing for AT to announce.
    expect(dot).toBeEmptyDOMElement();
    expect(container.querySelector(".cm-sr-only")).toBeNull();
  });

  it("applies the selected tone and size", () => {
    render(<CmStatusDot tone="success" size="lg" data-testid="dot" />);
    expect(screen.getByTestId("dot")).toHaveClass(
      "cm-status-dot--tone-success",
      "cm-status-dot--lg",
    );
  });

  it("exposes the label as screen-reader-only text", () => {
    render(<CmStatusDot tone="success" label="Online" />);
    const sr = screen.getByText("Online");
    expect(sr).toHaveClass("cm-sr-only");
  });

  it("adds the pulse modifier when requested", () => {
    render(<CmStatusDot pulse data-testid="dot" />);
    expect(screen.getByTestId("dot")).toHaveClass("cm-status-dot--pulse");
  });

  it("forwards className and native props to the root element", () => {
    render(<CmStatusDot className="extra" data-testid="dot" title="hi" />);
    const dot = screen.getByTestId("dot");
    expect(dot).toHaveClass("cm-status-dot", "extra");
    expect(dot).toHaveAttribute("title", "hi");
  });
});
