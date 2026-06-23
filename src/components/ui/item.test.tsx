import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmItem } from "./item.js";

describe("CmItem", () => {
  it("renders title, description and meta", () => {
    render(<CmItem title="Projeto" description="ativo" meta="99%" />);
    expect(screen.getByText("Projeto")).toHaveClass("cm-item__title");
    expect(screen.getByText("ativo")).toHaveClass("cm-item__description");
    expect(screen.getByText("99%")).toHaveClass("cm-item__meta");
  });

  it("accepts a ReactNode title (icon + text), not just a string", () => {
    render(
      <CmItem
        title={
          <>
            <svg data-testid="icon" />
            <span>Cerebro</span>
          </>
        }
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Cerebro")).toBeInTheDocument();
  });

  it("renders as a div by default and a button when interactive", () => {
    const onClick = vi.fn();
    const { rerender } = render(<CmItem title="A" />);
    expect(screen.getByText("A").closest(".cm-item")?.tagName).toBe("DIV");

    rerender(<CmItem title="A" onClick={onClick} />);
    expect(screen.getByRole("button")).toHaveClass("cm-item--interactive");
  });

  it("forwards className and native props to the root", () => {
    render(<CmItem title="A" className="extra" data-testid="it" />);
    expect(screen.getByTestId("it")).toHaveClass("cm-item", "extra");
  });
});
