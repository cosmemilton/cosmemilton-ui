import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { CmSelect, type CmSelectProps } from "./select.js";

const options = [
  { value: "br", label: "Brasil" },
  { value: "pt", label: "Portugal" },
  { value: "us", label: "Estados Unidos" },
];

function ControlledSelect({
  initialValue = "",
  onChangeSpy,
  ...props
}: { initialValue?: string; onChangeSpy?: (value: string) => void } & Partial<CmSelectProps>) {
  const [value, setValue] = useState(initialValue);
  return (
    <CmSelect
      label="País"
      placeholder="Selecione"
      options={options}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChangeSpy?.(next);
      }}
      {...props}
    />
  );
}

afterEach(cleanup);

describe("CmSelect", () => {
  it("marks helper text with the success feedback color", () => {
    render(<ControlledSelect success helperText="Validated" />);

    expect(screen.getByText("Validated")).toHaveClass("cm-floating-field__message--success");
  });

  it("renders a collapsed combobox-style trigger", () => {
    render(<ControlledSelect />);
    const trigger = screen.getByRole("combobox", { name: "País" });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the listbox and lists every option", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    await user.click(screen.getByRole("combobox", { name: "País" }));

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("combobox", { name: "País" })).toHaveAttribute("aria-expanded", "true");
  });

  it("positions the portaled listbox after opening", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    await user.click(screen.getByRole("combobox", { name: "País" }));

    const listbox = screen.getByRole("listbox");
    await waitFor(() => {
      expect(listbox.style.position).toBe("fixed");
      expect(listbox.style.top).not.toBe("");
      expect(listbox.style.left).not.toBe("");
    });
  });

  it("selects an option, reports the value and closes", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledSelect onChangeSpy={onChangeSpy} />);

    await user.click(screen.getByRole("combobox", { name: "País" }));
    await user.click(screen.getByRole("option", { name: "Portugal" }));

    expect(onChangeSpy).toHaveBeenCalledWith("pt");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks the active option as selected", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect initialValue="us" />);

    await user.click(screen.getByRole("combobox", { name: "País" }));

    expect(screen.getByRole("option", { name: "Estados Unidos" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("closes the listbox on Escape", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    await user.click(screen.getByRole("combobox", { name: "País" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clears the current value through the clear button", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledSelect initialValue="br" clearable onChangeSpy={onChangeSpy} />);

    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));

    expect(onChangeSpy).toHaveBeenCalledWith("");
  });

  it("is fully operable by keyboard (open, navigate, select)", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledSelect onChangeSpy={onChangeSpy} />);

    const trigger = screen.getByRole("combobox", { name: "País" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Brasil" }).id,
    );

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChangeSpy).toHaveBeenCalledWith("pt");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("Portugal");
  });

  it("opens highlighting the selected option and supports typeahead", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledSelect initialValue="pt" onChangeSpy={onChangeSpy} />);

    const trigger = screen.getByRole("combobox", { name: "País" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Portugal" }).id,
    );

    await user.keyboard("e");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Estados Unidos" }).id,
    );
    await user.keyboard("{Enter}");
    expect(onChangeSpy).toHaveBeenCalledWith("us");
  });

  it("applies a fixed width with flex-basis on the field root", () => {
    const { container } = render(<ControlledSelect width="6.5rem" />);
    const root = container.querySelector<HTMLElement>(".cm-select");
    expect(root).toHaveStyle({ width: "6.5rem", minWidth: "6.5rem", flex: "0 0 6.5rem" });
  });
});
