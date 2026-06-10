import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useListboxKeyboard } from "./use-listbox-keyboard.js";

const ITEMS = ["Apple", "Banana", "Blueberry", "Cherry"];

function Harness({
  onActivate = () => {},
  closeOnActivate = true,
  initialIndex = -1,
}: {
  onActivate?: (index: number) => void;
  closeOnActivate?: boolean;
  initialIndex?: number;
}) {
  const [open, setOpen] = useState(false);
  const { activeIndex, listboxId, getOptionProps, triggerProps } = useListboxKeyboard({
    open,
    setOpen,
    itemCount: ITEMS.length,
    onActivate,
    initialIndex,
    getLabel: (index) => ITEMS[index],
    closeOnActivate,
  });

  return (
    <div>
      <button
        type="button"
        role="combobox"
        aria-label="Fruta"
        onClick={() => setOpen((current) => !current)}
        {...triggerProps}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        trigger
      </button>
      {open ? (
        <div role="listbox" id={listboxId}>
          {ITEMS.map((item, index) => (
            <div
              key={item}
              role="option"
              aria-selected={false}
              data-active={index === activeIndex || undefined}
              {...getOptionProps(index)}
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

afterEach(cleanup);

const trigger = () => screen.getByRole("combobox", { name: "Fruta" });
const activeId = () => trigger().getAttribute("aria-activedescendant");
const optionByName = (name: string) => screen.getByRole("option", { name });

describe("useListboxKeyboard", () => {
  it("opens with ArrowDown and highlights the first item", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(activeId()).toBe(optionByName("Apple").id);
  });

  it("opens highlighting the selected item when there is one", async () => {
    const user = userEvent.setup();
    render(<Harness initialIndex={2} />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(activeId()).toBe(optionByName("Blueberry").id);
  });

  it("navigates with arrows, Home and End, clamping at the edges", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(activeId()).toBe(optionByName("Blueberry").id);
    await user.keyboard("{End}{ArrowDown}");
    expect(activeId()).toBe(optionByName("Cherry").id);
    await user.keyboard("{Home}{ArrowUp}");
    expect(activeId()).toBe(optionByName("Apple").id);
  });

  it("activates the highlighted item with Enter and closes", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} />);
    trigger().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onActivate).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps the popup open on activate when closeOnActivate is false", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} closeOnActivate={false} />);
    trigger().focus();
    await user.keyboard("{ArrowDown}{Enter}{ArrowDown}{Enter}");
    expect(onActivate).toHaveBeenNthCalledWith(1, 0);
    expect(onActivate).toHaveBeenNthCalledWith(2, 1);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("supports typeahead across items, including accumulated prefixes", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("b");
    expect(activeId()).toBe(optionByName("Banana").id);
    await user.keyboard("l");
    expect(activeId()).toBe(optionByName("Blueberry").id);
  });

  it("opens via typeahead when closed", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("c");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(activeId()).toBe(optionByName("Cherry").id);
  });

  it("closes on Tab without trapping focus", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await user.tab();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
