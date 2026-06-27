import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmSwitch } from "./switch.js";

describe("CmSwitch", () => {
  it("keeps aria and thumb state synchronized", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <CmSwitch aria-label="Estoque" onCheckedChange={onCheckedChange} />,
    );

    const control = screen.getByRole("switch", { name: "Estoque" });
    const thumb = container.querySelector(".cm-switch__thumb");
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(thumb).toHaveAttribute("data-state", "unchecked");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(thumb).toHaveAttribute("data-state", "checked");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
