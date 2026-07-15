import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { CmComboboxMulti, type CmComboboxMultiProps } from "./combobox-multi.js";
import { type CmComboboxItem } from "./combobox.js";

const items: CmComboboxItem[] = [
  { value: "math", label: "Matemática" },
  { value: "pt", label: "Português" },
  { value: "sci", label: "Ciências" },
];

// Realistic usage: the consumer owns the value, so the selection persists.
function ControlledComboboxMulti({
  initialValue = [],
  onChangeSpy,
  ...props
}: { initialValue?: string[]; onChangeSpy?: (value: string[]) => void } & Partial<
  Omit<CmComboboxMultiProps, "value" | "onChange">
>) {
  const [value, setValue] = useState<string[]>(initialValue);
  return (
    <CmComboboxMulti
      label="Disciplinas"
      placeholder="Pesquisar"
      items={items}
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

describe("CmComboboxMulti", () => {
  it("opens on focus and toggles options without closing", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledComboboxMulti onChangeSpy={onChangeSpy} />);

    await user.click(screen.getByPlaceholderText("Pesquisar"));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");

    await user.click(screen.getByRole("option", { name: "Matemática" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith(["math"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Ciências" }));
    expect(onChangeSpy).toHaveBeenLastCalledWith(["math", "sci"]);
  });

  it("filters options as the user types and toggles with Enter", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<ControlledComboboxMulti onChangeSpy={onChangeSpy} />);

    const input = screen.getByPlaceholderText("Pesquisar");
    await user.click(input);
    await user.type(input, "ciên");

    expect(screen.getByRole("option", { name: "Ciências" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Matemática" })).not.toBeInTheDocument();
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Ciências" }).id,
    );

    await user.keyboard("{Enter}");
    expect(onChangeSpy).toHaveBeenLastCalledWith(["sci"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Enter again on the same option unchecks it.
    await user.keyboard("{Enter}");
    expect(onChangeSpy).toHaveBeenLastCalledWith([]);
  });

  it("shows the empty message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<ControlledComboboxMulti emptyMessage="Nenhuma disciplina" />);

    const input = screen.getByPlaceholderText("Pesquisar");
    await user.click(input);
    await user.type(input, "zzz");

    expect(screen.getByText("Nenhuma disciplina")).toBeInTheDocument();
  });

  it("marks checked options with aria-selected", async () => {
    const user = userEvent.setup();
    render(<ControlledComboboxMulti initialValue={["pt"]} />);

    await user.click(screen.getByPlaceholderText("Pesquisar"));
    expect(screen.getByRole("option", { name: "Português" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Matemática" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("summarizes the selection in the input when unfocused", async () => {
    const user = userEvent.setup();
    render(<ControlledComboboxMulti initialValue={["math", "sci"]} />);

    const input = screen.getByPlaceholderText("Pesquisar");
    expect(input).toHaveValue("Matemática, Ciências");

    // While focused the input is a search box; the summary comes back on blur.
    await user.click(input);
    expect(input).toHaveValue("");
    await user.click(screen.getByRole("option", { name: "Português" }));
    await user.keyboard("{Escape}");
    await user.tab();
    expect(input).toHaveValue("3 selecionados");
  });

  it("syncs the hidden input and clears the whole selection", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    const { container } = render(
      <ControlledComboboxMulti
        initialValue={["math", "pt"]}
        name="subjects"
        onChangeSpy={onChangeSpy}
      />,
    );

    const hidden = container.querySelector<HTMLInputElement>('input[name="subjects"]');
    expect(hidden).toHaveValue("math,pt");

    await user.click(screen.getByTitle("Limpar seleção"));
    expect(onChangeSpy).toHaveBeenLastCalledWith([]);
    expect(hidden).toHaveValue("");
  });

  it("closes with Escape and on click outside", async () => {
    const user = userEvent.setup();
    render(<ControlledComboboxMulti />);

    const input = screen.getByPlaceholderText("Pesquisar");
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("skips disabled items when toggling", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(
      <ControlledComboboxMulti
        items={[...items, { value: "art", label: "Artes", disabled: true }]}
        onChangeSpy={onChangeSpy}
      />,
    );

    await user.click(screen.getByPlaceholderText("Pesquisar"));
    await user.click(screen.getByRole("option", { name: "Artes" }));
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
