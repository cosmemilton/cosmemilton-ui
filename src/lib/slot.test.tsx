import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slot } from "./slot.js";

describe("Slot", () => {
  it("renders the child element and merges className", () => {
    render(
      <Slot className="owner">
        <a href="/x" className="child">
          link
        </a>
      </Slot>,
    );
    const el = screen.getByRole("link", { name: "link" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveClass("owner", "child");
    expect(el).toHaveAttribute("href", "/x");
  });

  it("merges style, child winning on conflicts", () => {
    render(
      <Slot style={{ color: "red", margin: 0 }}>
        <span style={{ color: "blue" }}>x</span>
      </Slot>,
    );
    const el = screen.getByText("x");
    expect(el.style.color).toBe("blue");
    expect(el.style.margin).toBe("0px");
  });

  it("composes event handlers from both owner and child", async () => {
    const user = userEvent.setup();
    const ownerClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Slot onClick={ownerClick}>
        <button onClick={childClick}>go</button>
      </Slot>,
    );
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(ownerClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("forwards a ref to the child DOM node", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Slot ref={ref as never}>
        <button>go</button>
      </Slot>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
