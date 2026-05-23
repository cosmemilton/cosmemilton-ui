"use client";

import { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmRadius, CmTone } from "./types.js";

type AspectRatioSurface = "none" | CmTone;

type AspectRatioProps = {
  ratio?: number;
  className?: string;
  center?: boolean;
  children: ReactNode;
  radius?: CmRadius;
  surface?: AspectRatioSurface;
};

export function CmAspectRatio({
  ratio = 16 / 9,
  className,
  center = false,
  children,
  radius = "lg",
  surface = "none",
}: AspectRatioProps) {
  return (
    <div
      className={cn(
        "cm-aspect-ratio",
        center && "cm-aspect-ratio--center",
        radius !== "lg" && `cm-aspect-ratio--radius-${radius}`,
        surface !== "none" && `cm-aspect-ratio--surface-${surface}`,
        className,
      )}
      style={{ "--cm-aspect-ratio": `${ratio}` } as CSSProperties}
    >
      {children}
    </div>
  );
}
