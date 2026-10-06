import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CmResizable } from "./resizable.js";

let notifyResize: (() => void)[];

beforeEach(() => {
  notifyResize = [];
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function () {
    return Number(this.getAttribute("data-available-width")) || 0;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        notifyResize.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  // jsdom does not provide PointerEvent; mouse coordinates still exercise the pointer handlers.
  vi.stubGlobal("PointerEvent", MouseEvent);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup(width: number, minWidth = 240, maxWidth = 640, initialWidth = 320) {
  const view = render(
    <div data-available-width={width} style={{ padding: "12px" }}>
      <CmResizable minWidth={minWidth} maxWidth={maxWidth} initialWidth={initialWidth}>
        Conteúdo do painel
      </CmResizable>
    </div>,
  );
  return {
    ...view,
    parent: view.container.firstElementChild!,
    handle: screen.getByRole("separator"),
  };
}

describe("CmResizable", () => {
  it("fits the parent content box and uses the rendered width for keyboard steps", async () => {
    const actor = userEvent.setup();
    const { handle } = setup(268, 200);
    expect(handle).toHaveAttribute("aria-valuenow", "244");
    expect(handle).toHaveAttribute("aria-valuemin", "200");
    expect(handle).toHaveAttribute("aria-valuemax", "244");
    handle.focus();
    await actor.keyboard("{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "228");
    await actor.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "200");
    await actor.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "244");
  });

  it("preserves the requested width through parent resizes and restores configured limits", () => {
    const { handle, parent } = setup(200);
    expect(handle).toHaveAttribute("aria-valuenow", "176");
    expect(handle).toHaveAttribute("aria-valuemin", "176");
    expect(handle).toHaveAttribute("aria-valuemax", "176");
    act(() => {
      parent.setAttribute("data-available-width", "900");
      notifyResize.forEach((notify) => notify());
    });
    expect(handle).toHaveAttribute("aria-valuenow", "320");
    expect(handle).toHaveAttribute("aria-valuemin", "240");
    expect(handle).toHaveAttribute("aria-valuemax", "640");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle).toHaveAttribute("aria-valuenow", "640");
    act(() => {
      parent.setAttribute("data-available-width", "400");
      notifyResize.forEach((notify) => notify());
    });
    expect(handle).toHaveAttribute("aria-valuenow", "376");
    act(() => {
      parent.setAttribute("data-available-width", "900");
      notifyResize.forEach((notify) => notify());
    });
    expect(handle).toHaveAttribute("aria-valuenow", "640");
  });

  it("starts a drag from the rendered width and stops on pointer cancellation", () => {
    const { handle } = setup(268, 200);
    fireEvent.pointerDown(handle, { button: 0, clientX: 242 });
    expect(handle).toHaveFocus();
    fireEvent.pointerMove(handle, { clientX: 232 });
    expect(handle).toHaveAttribute("aria-valuenow", "234");
    fireEvent.pointerMove(handle, { clientX: 190 });
    expect(handle).toHaveAttribute("aria-valuenow", "200");
    fireEvent.pointerCancel(handle);
    fireEvent.pointerMove(handle, { clientX: 600 });
    expect(handle).toHaveAttribute("aria-valuenow", "200");
  });

  it("clamps an oversized initial width and ignores secondary pointer buttons", () => {
    const { handle } = setup(900, 240, 500, 800);
    expect(handle).toHaveAttribute("aria-valuenow", "500");
    fireEvent.pointerDown(handle, { button: 2, clientX: 496 });
    fireEvent.pointerMove(handle, { clientX: 300 });
    expect(handle).toHaveAttribute("aria-valuenow", "500");
  });
});
