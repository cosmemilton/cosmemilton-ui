import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmButton } from "./button.js";

describe("CmButton", () => {
  it("renders its children as an accessible button", () => {
    render(<CmButton>Save</CmButton>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("defaults to type=button", () => {
    render(<CmButton>Save</CmButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("forwards a ref to the underlying button element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<CmButton ref={ref}>Save</CmButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("calls onClick when activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CmButton onClick={onClick}>Save</CmButton>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and busy while loading", () => {
    render(<CmButton loading>Save</CmButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("merges a custom className alongside the base classes", () => {
    render(<CmButton className="my-class">Save</CmButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("my-class");
    expect(button).toHaveClass("cm-button");
  });

  it("spreads native attributes onto the root element", () => {
    render(<CmButton data-testid="cta">Save</CmButton>);
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });
});
