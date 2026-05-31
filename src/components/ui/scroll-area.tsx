"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  height?: number | string;
};

export const CmScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function CmScrollArea({ children, className, height = 320 }, ref) {
  const maxHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      ref={ref}
      className={cn(
        "cm-scroll-area",
        className,
      )}
      style={{ maxHeight } as CSSProperties}
    >
      {children}
    </div>
  );
});
CmScrollArea.displayName = "CmScrollArea";
