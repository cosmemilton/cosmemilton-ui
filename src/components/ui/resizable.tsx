"use client";

import { MouseEvent as ReactMouseEvent, ReactNode, useRef, useState, type CSSProperties } from "react";
import { cn } from "../../lib/utils.js";

type ResizableProps = {
  minWidth?: number;
  maxWidth?: number;
  initialWidth?: number;
  className?: string;
  children: ReactNode;
};

type ResizableStyle = CSSProperties & Record<`--${string}`, string | number>;

export function CmResizable({ minWidth = 240, maxWidth = 640, initialWidth = 320, className, children }: ResizableProps) {
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
    const newWidth = Math.min(Math.max(event.clientX - containerRef.current.getBoundingClientRect().left, minWidth), maxWidth);
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resizableStyle: ResizableStyle = {
    "--cm-resizable-width": `${width}px`,
  };

  return (
    <div ref={containerRef} className={cn("cm-resizable", className)} style={resizableStyle}>
      <div className="cm-resizable-content">
        {children}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        onMouseDown={handleMouseDown}
        className="cm-resizable-handle"
      />
    </div>
  );
}
