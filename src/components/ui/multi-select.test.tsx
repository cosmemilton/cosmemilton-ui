import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { CmMultiSelect, type CmMultiSelectProps } from "./multi-select.js";

const options = [
  { value: "math", label: "Matemática" },
  { value: "pt", label: "Português" },
  { value: "sci", label: "Ciências" },
];

function ControlledMultiSelect({
  initialValue = [],
  onChangeSpy,
  ...props
}: { initialValue?: string[]; onChangeSpy?: (value: string[]) => void } & Partial<
  Omit<CmMultiSelectProps, "value" | "onChange" | "options">
>) {
  const [value, setValue] = useState<string[]>(initialValue);
  return (
    <CmMultiSelect
      label="Disciplinas"
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

describe("CmMultiSelect", () => {
  it("opens on click and toggles options without closing", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledMultiSelect onChangeSpy={onChangeSpy} />);

    await user.click(screen.getByRole("combobox", { name: "Disciplinas" }));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");

    await user.click(screen.getByRole("option", { name: "Matemática" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith(["math"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Ciências" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith(["math", "sci"]);
  });

  it("toggles options with the keyboard and keeps the popup open", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledMultiSelect onChangeSpy={onChangeSpy} />);

    const trigger = screen.getByRole("combobox", { name: "Disciplinas" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Matemática" }).id,
    );

    await user.keyboard("{Enter}");
    expect(onChangeSpy).toHaveBeenLastCalledWith(["math"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChangeSpy).toHaveBeenLastCalledWith(["math", "sci"]);

    // Enter on an already-checked option unchecks it.
    await user.keyboard("{Home}{Enter}");
    expect(onChangeSpy).toHaveBeenLastCalledWith(["sci"]);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks checked options with aria-selected", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect initialValue={["pt"]} />);

    await user.click(screen.getByRole("combobox", { name: "Disciplinas" }));
    expect(screen.getByRole("option", { name: "Português" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Matemática" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});
