import { afterEach, describe, expect, it, vi } from "vitest";
import { createRef } from "react";

import { useClickOutside } from "./use-click-outside.js";
import { renderHook } from "@testing-library/react";

afterEach(() => {
  document.body.innerHTML = "";
});

function pressOn(node: Node) {
  node.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
}

describe("useClickOutside", () => {
  it("fires when a press lands outside every ref", () => {
    const panel = document.createElement("div");
    const outside = document.createElement("div");
    document.body.append(panel, outside);

    const ref = createRef<HTMLDivElement>();
    ref.current = panel as HTMLDivElement;

    const handler = vi.fn();
    renderHook(() => useClickOutside(ref, handler));

    pressOn(outside);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores presses inside any provided ref (e.g. trigger)", () => {
    const panel = document.createElement("div");
    const trigger = document.createElement("button");
    document.body.append(panel, trigger);

    const panelRef = createRef<HTMLDivElement>();
    panelRef.current = panel as HTMLDivElement;
    const triggerRef = createRef<HTMLButtonElement>();
    triggerRef.current = trigger as HTMLButtonElement;

    const handler = vi.fn();
    renderHook(() => useClickOutside([panelRef, triggerRef], handler));

    pressOn(panel);
    pressOn(trigger);
    expect(handler).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const outside = document.createElement("div");
    document.body.append(outside);
    const ref = createRef<HTMLDivElement>();

    const handler = vi.fn();
    renderHook(() => useClickOutside(ref, handler, false));

    pressOn(outside);
    expect(handler).not.toHaveBeenCalled();
  });
});
