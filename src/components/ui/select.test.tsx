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

  it("renders rich options and selection while keeping the textual accessible option name", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(
      <ControlledSelect
        onChangeSpy={onChangeSpy}
        name="country"
        renderOption={(option) => (
          <>
            {option.label}
            <span>12 registros</span>
          </>
        )}
        renderSelected={(option) => (
          <>
            {option.label}
            <span>12 selecionados</span>
          </>
        )}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "País" });
    await user.click(trigger);
    const portugal = screen.getByRole("option", { name: "Portugal", exact: true });
    expect(portugal).toHaveTextContent("12 registros");
    await user.click(within(portugal).getByText("12 registros"));
    expect(onChangeSpy).toHaveBeenCalledExactlyOnceWith("pt");
    expect(trigger).toHaveTextContent("Portugal12 selecionados");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(document.querySelector('input[name="country"]')).toHaveValue("pt");
    await user.click(trigger);
    expect(screen.getByRole("option", { name: "Portugal", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps ArrowUp, ArrowDown, Enter and Escape working with custom content", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(
      <ControlledSelect
        onChangeSpy={onChangeSpy}
        renderOption={(option) => (
          <span>
            {option.label} <b>42</b>
          </span>
        )}
        renderSelected={(option) => <strong>{option.label}</strong>}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "País" });
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Estados Unidos" }).id,
    );
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{Enter}");
    expect(onChangeSpy).toHaveBeenCalledExactlyOnceWith("pt");
    expect(trigger).toHaveTextContent("Portugal");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.keyboard("{ArrowDown}{ArrowDown}{Escape}");
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveTextContent("Portugal");
    expect(trigger).toHaveFocus();
    expect(trigger).not.toHaveAttribute("aria-activedescendant");
  });

  it("searches textual labels even when renderers replace the displayed text", async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(
      <ControlledSelect
        onChangeSpy={onChangeSpy}
        renderOption={() => <span>99 itens</span>}
        renderSelected={() => (
          <span>
            Selecionado <b>99</b>
          </span>
        )}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "País" });
    trigger.focus();
    await user.keyboard("port");
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Portugal", exact: true }).id,
    );
    await user.keyboard("{Enter}");
    expect(onChangeSpy).toHaveBeenCalledExactlyOnceWith("pt");
    expect(trigger).toHaveTextContent("Selecionado 99");
    expect(trigger).toHaveFocus();
  });

  it("retains string renderSelected compatibility and honors empty ReactNode results", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ControlledSelect initialValue="br" renderSelected={(option) => option.label.slice(0, 2)} />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Br");
    rerender(
      <ControlledSelect initialValue="br" renderSelected={() => null} renderOption={() => null} />,
    );
    expect(screen.getByRole("combobox").querySelector(".cm-select__value")).toBeEmptyDOMElement();
    await user.click(screen.getByRole("combobox"));
    expect(
      screen
        .getByRole("option", { name: "Portugal", exact: true })
        .querySelector(".cm-select__option-label"),
    ).toBeEmptyDOMElement();
  });
});
