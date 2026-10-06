import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";
import { cmSizeValue } from "./types.js";
export type CmSkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
};
export function CmSkeleton({
  width,
  height = 12,
  lines = 1,
  animated = true,
  className,
  ...props
}: CmSkeletonProps) {
  const count = Math.min(20, Math.max(1, Math.floor(lines)));
  return (
    <div
      aria-hidden="true"
      className={cn("cm-skeleton", animated && "cm-skeleton--animated", className)}
      style={
        {
          "--cm-skeleton-width": width === undefined ? "100%" : cmSizeValue(width),
          "--cm-skeleton-height": cmSizeValue(height),
        } as CSSProperties
      }
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
CmSkeleton.displayName = "CmSkeleton";
