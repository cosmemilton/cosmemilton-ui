"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmSize } from "./types.js";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: CmSize;
  fallback?: ReactNode;
  className?: string;
};

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "cm-avatar--xs",
  sm: "cm-avatar--sm",
  md: "cm-avatar--md",
  lg: "cm-avatar--lg",
  xl: "cm-avatar--xl",
};

export const CmAvatar = forwardRef<HTMLDivElement, AvatarProps>(function CmAvatar(
  { src, alt, fallback, size = "md", className },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "cm-avatar",
        sizeMap[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? "CmAvatar"}
          loading="lazy"
          decoding="async"
          className="cm-avatar__image"
        />
      ) : (
        fallback ?? <span className="cm-avatar__fallback">{alt?.[0] ?? "?"}</span>
      )}
    </div>
  );
});
CmAvatar.displayName = "CmAvatar";
