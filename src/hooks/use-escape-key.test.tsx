import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEscapeKey } from "./use-escape-key.js";

function pressKey(key: string) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

describe("useEscapeKey", () => {
  it("calls the handler on Escape when enabled", () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(true, handler));
    pressKey("Escape");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(true, handler));
    pressKey("Enter");
    expect(handler).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(false, handler));
    pressKey("Escape");
    expect(handler).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(true, handler));
    unmount();
    pressKey("Escape");
    expect(handler).not.toHaveBeenCalled();
  });
});
