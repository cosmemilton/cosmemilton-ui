import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmOptionRow } from "./option-row.js";

describe("CmOptionRow", () => {
  it("names the switch after the row title and description", () => {
    render(
      <CmOptionRow
        title="Sincronizar o relógio pela rede"
        description="NTP ligado — o horário vem do pool brasileiro"
      />,
    );

    const control = screen.getByRole("switch", { name: "Sincronizar o relógio pela rede" });
    expect(control).toHaveAccessibleDescription("NTP ligado — o horário vem do pool brasileiro");
  });

  it("reflects and reports the checked state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <CmOptionRow
        title="Relógio do hardware em UTC"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    const control = screen.getByRole("switch");
    expect(control).toHaveAttribute("aria-checked", "false");
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("disables the control and marks the row", () => {
    render(<CmOptionRow title="Instantâneos automáticos" disabled data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveAttribute("data-disabled");
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("accepts another control and hands it the ids of the row", () => {
    render(
      <CmOptionRow
        title="Kernel"
        description="o que acorda a máquina"
        control={({ titleId, descriptionId }) => (
          <button type="button" aria-labelledby={titleId} aria-describedby={descriptionId}>
            trocar
          </button>
        )}
      />,
    );

    const button = screen.getByRole("button", { name: "Kernel" });
    expect(button).toHaveAccessibleDescription("o que acorda a máquina");
    expect(screen.queryByRole("switch")).toBeNull();
  });
});
