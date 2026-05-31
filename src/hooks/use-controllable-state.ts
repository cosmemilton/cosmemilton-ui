"use client";

import { useCallback, useRef, useState } from "react";

type UseControllableStateParams<T> = {
  /** Controlled value. When defined, the component is controlled. */
  value?: T;
  /** Initial value used while uncontrolled. */
  defaultValue?: T;
  /** Notified on every requested change, controlled or not. */
  onChange?: (value: T) => void;
};

/**
 * Bridges the controlled/uncontrolled props pattern (`value` / `defaultValue` /
 * `onChange`) into a single `[value, setValue]` tuple, the way Radix's
 * `useControllableState` does. When `value` is provided the component is
 * controlled and internal state is bypassed; otherwise `setValue` updates local
 * state. `onChange` fires on every requested change either way.
 *
 * `setValue` accepts a value or an updater function, mirroring `useState`.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);
  const current = (isControlled ? value : uncontrolled) as T;

  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(currentRef.current)
          : next;
      if (!isControlled) setUncontrolled(resolved);
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue];
}
