"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";

const KEYBOARD_STEP = 16;

export type CmResizableProps = {
  minWidth?: number;
  maxWidth?: number;
  initialWidth?: number;
  className?: string;
  children: ReactNode;
};

type ResizableStyle = CSSProperties & Record<`--${string}`, string | number>;

export function CmResizable({
  minWidth = 240,
  maxWidth = 640,
  initialWidth = 320,
  className,
  children,
}: CmResizableProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(initialWidth);
  const [availableWidth, setAvailableWidth] = useState(Infinity);
  const drag = useRef<{ pointerId: number; startX: number; width: number } | null>(null);
  const configuredMin = Math.max(0, minWidth);
  const configuredMax = Math.max(configuredMin, maxWidth);
  const effectiveMax = Math.min(configuredMax, availableWidth);
  const effectiveMin = Math.min(configuredMin, effectiveMax);
  const clampWidth = (value: number) => Math.min(Math.max(value, effectiveMin), effectiveMax);
  const renderedWidth = clampWidth(width);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const style = getComputedStyle(parent);
      const contentWidth =
        parent.clientWidth -
        parseFloat(style.paddingLeft || "0") -
        parseFloat(style.paddingRight || "0");
      // Hidden/unmeasured parents are bounded by CSS until they receive a real layout.
      setAvailableWidth(contentWidth > 0 ? contentWidth : Infinity);
    };
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    observer?.observe(parent);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    drag.current = { pointerId: event.pointerId, startX: event.clientX, width: renderedWidth };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    setWidth(clampWidth(drag.current.width + event.clientX - drag.current.startX));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setWidth(clampWidth(renderedWidth - KEYBOARD_STEP));
        break;
      case "ArrowRight":
        event.preventDefault();
        setWidth(clampWidth(renderedWidth + KEYBOARD_STEP));
        break;
      case "Home":
        event.preventDefault();
        setWidth(effectiveMin);
        break;
      case "End":
        event.preventDefault();
        setWidth(effectiveMax);
        break;
    }
  };

  const resizableStyle: ResizableStyle = {
    "--cm-resizable-width": `${renderedWidth}px`,
  };

  return (
    <div ref={containerRef} className={cn("cm-resizable", className)} style={resizableStyle}>
      <div className="cm-resizable-content">{children}</div>
      {/* A focusable separator is an ARIA "window splitter"; jsx-a11y flags it as
          non-interactive, but it has full pointer + keyboard support below. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="separator"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Redimensionar painel"
        aria-valuenow={Math.round(renderedWidth)}
        aria-valuemin={Math.round(effectiveMin)}
        aria-valuemax={Math.round(effectiveMax)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={handleKeyDown}
        className="cm-resizable-handle"
      />
    </div>
  );
}
CmResizable.displayName = "CmResizable";
