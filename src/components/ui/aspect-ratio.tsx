"use client";

import { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils";

type AspectRatioProps = {
  ratio?: number;
  className?: string;
  children: ReactNode;
};

export function CmAspectRatio({ ratio = 16 / 9, className, children }: AspectRatioProps) {
  return (
    <div
      className={cn("cm-aspect-ratio", className)}
      style={{ "--cm-aspect-ratio": `${ratio}` } as CSSProperties}
    >
      {children}
    </div>
  );
}
