import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "./use-scroll-lock.js";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("useScrollLock", () => {
  it("locks body scroll while mounted and restores on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not lock when disabled", () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe("");
  });

  it("stays locked until the last of several consumers unmounts", () => {
    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");

    second.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores the original overflow value, not a hardcoded blank", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });
});
