"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmRadius, CmTone } from "./types.js";

type AspectRatioSurface = "none" | CmTone;

export type CmAspectRatioProps = HTMLAttributes<HTMLDivElement> & {
  ratio?: number;
  center?: boolean;
  children?: ReactNode;
  radius?: CmRadius;
  surface?: AspectRatioSurface;
};

export const CmAspectRatio = forwardRef<HTMLDivElement, CmAspectRatioProps>(
  function CmAspectRatio(
    { ratio = 16 / 9, className, center = false, children, radius = "lg", surface = "none", style, ...rest },
    ref,
  ) {
  return (
    <div
      ref={ref}
      className={cn(
        "cm-aspect-ratio",
        center && "cm-aspect-ratio--center",
        radius !== "lg" && `cm-aspect-ratio--radius-${radius}`,
        surface !== "none" && `cm-aspect-ratio--surface-${surface}`,
        className,
      )}
      style={{ "--cm-aspect-ratio": `${ratio}`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
});
CmAspectRatio.displayName = "CmAspectRatio";
