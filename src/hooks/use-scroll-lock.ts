"use client";

import { useEffect } from "react";

/**
 * Stackable, reference-counted lock of `document.body` scrolling.
 *
 * Multiple overlays (dialog, drawer, toast, progress-modal, portal) can request
 * the lock at once; the body's original `overflow` is captured on the first
 * lock and only restored once the last consumer releases it. This replaces the
 * per-component `document.body.style.overflow = "hidden"` writes that used to
 * fight each other when two overlays were open simultaneously.
 */
let lockCount = 0;
let previousOverflow = "";

function acquire(): void {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function release(): void {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

export function useScrollLock(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    acquire();
    return release;
  }, [enabled]);
}
