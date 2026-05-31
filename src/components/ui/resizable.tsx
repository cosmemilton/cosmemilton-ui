"use client";

import {
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useRef,
  useState,
  type CSSProperties,
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
  const isDragging = useRef(false);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const newWidth = Math.min(
      Math.max(event.clientX - containerRef.current.getBoundingClientRect().left, minWidth),
      maxWidth,
    );
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const clampWidth = (value: number) => Math.min(Math.max(value, minWidth), maxWidth);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setWidth((current) => clampWidth(current - KEYBOARD_STEP));
        break;
      case "ArrowRight":
        event.preventDefault();
        setWidth((current) => clampWidth(current + KEYBOARD_STEP));
        break;
      case "Home":
        event.preventDefault();
        setWidth(minWidth);
        break;
      case "End":
        event.preventDefault();
        setWidth(maxWidth);
        break;
    }
  };

  const resizableStyle: ResizableStyle = {
    "--cm-resizable-width": `${width}px`,
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
        aria-valuenow={Math.round(width)}
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        className="cm-resizable-handle"
      />
    </div>
  );
}
CmResizable.displayName = "CmResizable";
