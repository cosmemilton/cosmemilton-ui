import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { CmCombobox, type CmComboboxItem } from "./combobox.js";

const items: CmComboboxItem[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

// Realistic usage: the consumer owns the value, so the selection persists.
function ControlledCombobox({
  onChangeSpy,
}: {
  onChangeSpy: (item: CmComboboxItem | null) => void;
}) {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <CmCombobox
      items={items}
      placeholder="Pick"
      value={value}
      onChange={(item) => {
        setValue(item?.value);
        onChangeSpy(item);
      }}
    />
  );
}

afterEach(cleanup);

describe("CmCombobox", () => {
  it("renders an input with the given placeholder", () => {
    render(<CmCombobox items={items} placeholder="Pick a fruit" />);
    expect(screen.getByPlaceholderText("Pick a fruit")).toBeInTheDocument();
  });

  it("opens the option list on focus", async () => {
    const user = userEvent.setup();
    render(<CmCombobox items={items} placeholder="Pick" />);

    await user.click(screen.getByPlaceholderText("Pick"));

    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument();
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(<CmCombobox items={items} placeholder="Pick" />);

    const input = screen.getByPlaceholderText("Pick");
    await user.click(input);
    await user.type(input, "ban");

    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
  });

  it("shows the empty message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<CmCombobox items={items} placeholder="Pick" emptyMessage="No fruit" />);

    const input = screen.getByPlaceholderText("Pick");
    await user.click(input);
    await user.type(input, "zzz");

    expect(screen.getByText("No fruit")).toBeInTheDocument();
  });

  it("reports the chosen item and fills the input", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledCombobox onChangeSpy={onChangeSpy} />);

    const input = screen.getByPlaceholderText("Pick");
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Cherry" }));

    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: "cherry", label: "Cherry" }),
    );
    expect(input).toHaveValue("Cherry");
  });

  it("selects the highlighted option with the keyboard while filtering", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledCombobox onChangeSpy={onChangeSpy} />);

    const input = screen.getByPlaceholderText("Pick");
    await user.click(input);
    await user.type(input, "ba");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: /Banana/ }).id,
    );

    await user.keyboard("{Enter}");
    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: "banana", label: "Banana" }),
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
