import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useControllableState } from "./use-controllable-state.js";

describe("useControllableState", () => {
  it("manages internal state when uncontrolled", () => {
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1 }));
    expect(result.current[0]).toBe(1);

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
  });

  it("supports updater functions like useState", () => {
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0 }));
    act(() => result.current[1]((prev) => prev + 5));
    expect(result.current[0]).toBe(5);
  });

  it("does not mutate internal state when controlled, but still calls onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<string>({ value: "fixed", onChange }));

    act(() => result.current[1]("ignored"));
    expect(result.current[0]).toBe("fixed");
    expect(onChange).toHaveBeenCalledWith("ignored");
  });

  it("calls onChange while uncontrolled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<boolean>({ defaultValue: false, onChange }),
    );
    act(() => result.current[1](true));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(result.current[0]).toBe(true);
  });
});
