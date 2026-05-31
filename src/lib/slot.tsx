"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";
import { cn } from "./utils.js";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref && typeof ref === "object") {
    (ref as { current: T | null }).current = value;
  }
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value: T | null) => {
    for (const ref of refs) assignRef(ref, value);
  };
}

type SlotProps = HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * Radix-style `Slot`: merges the owning component's props onto the single React
 * element it receives — `className` and `style` are merged, event handlers are
 * composed (both run), and refs are forwarded to the child. Components render
 * `<Slot>` instead of their default tag when `asChild` is set, letting
 * consumers swap the rendered element while keeping the component's styling.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  if (!isValidElement(children)) {
    Children.only(children); // throws a clear error for 0 or >1 children
    return null;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props as Record<string, unknown>;
  const slot = slotProps as Record<string, unknown>;

  const merged: Record<string, unknown> = { ...slot, ...childProps };

  merged.className = cn(
    slot.className as string | undefined,
    childProps.className as string | undefined,
  );
  merged.style = {
    ...(slot.style as CSSProperties | undefined),
    ...(childProps.style as CSSProperties | undefined),
  };

  // Compose handlers that exist on both: run the child's, then the slot's.
  for (const key in slot) {
    if (!/^on[A-Z]/.test(key)) continue;
    const slotHandler = slot[key];
    const childHandler = childProps[key];
    if (typeof slotHandler === "function" && typeof childHandler === "function") {
      merged[key] = (...args: unknown[]) => {
        (childHandler as (...a: unknown[]) => void)(...args);
        (slotHandler as (...a: unknown[]) => void)(...args);
      };
    }
  }

  const childRef =
    (childProps.ref as Ref<HTMLElement> | undefined) ??
    (child as { ref?: Ref<HTMLElement> }).ref ??
    undefined;
  merged.ref = mergeRefs(forwardedRef, childRef);

  return cloneElement(child, merged);
});
