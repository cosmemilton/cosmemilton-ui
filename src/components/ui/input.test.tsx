import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { CmInput } from "./input.js";
import { CmButton } from "./button.js";

afterEach(cleanup);

describe("CmInput", () => {
  it("applies a fixed width on the field root without leaking to the input element", () => {
    const { container } = render(<CmInput label="CEP" width={120} />);
    const root = container.querySelector<HTMLElement>(".cm-input");
    expect(root).toHaveStyle({ width: "120px", minWidth: "120px", flex: "0 0 120px" });
    expect(screen.getByLabelText("CEP")).not.toHaveAttribute("width");
  });

  it("keeps the root unstyled when width is not provided", () => {
    const { container } = render(<CmInput label="Nome" />);
    const root = container.querySelector<HTMLElement>(".cm-input");
    expect(root).not.toHaveAttribute("style");
  });

  it("marks an end button as a flush control that must not increase the field height", () => {
    const { container } = render(<CmInput endButton={<CmButton size="xs">Generate</CmButton>} />);

    const adornment = container.querySelector(".cm-floating-field__adornment--flush");
    expect(adornment).toContainElement(screen.getByRole("button", { name: "Generate" }));
  });

  it("marks a start button as a flush control that must not increase the field height", () => {
    const { container } = render(<CmInput startButton={<CmButton size="xs">Search</CmButton>} />);

    const adornment = container.querySelector(".cm-floating-field__adornment--flush");
    expect(adornment).toContainElement(screen.getByRole("button", { name: "Search" }));
  });

  it("marks helper text with the success feedback color", () => {
    render(<CmInput success helperText="Validated" />);

    expect(screen.getByText("Validated")).toHaveClass("cm-floating-field__message--success");
  });
});
