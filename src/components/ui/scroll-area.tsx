"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  height?: number | string;
};

export function CmScrollArea({ children, className, height = 320 }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const maxHeight = typeof height === "number" ? `${height}px` : height;

  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty("max-height", maxHeight);
    }
  }, [maxHeight]);

  return (
    <div
      ref={ref}
      className={cn(
        "cm-scroll-area",
        className,
      )}
    >
      {children}
    </div>
  );
}
