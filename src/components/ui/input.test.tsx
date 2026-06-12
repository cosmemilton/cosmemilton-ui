import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { CmInput } from "./input.js";

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
});
