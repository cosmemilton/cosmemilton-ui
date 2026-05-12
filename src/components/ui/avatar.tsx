"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
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

export function CmAvatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "cm-avatar",
        sizeMap[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? "CmAvatar"}
          fill
          sizes="80px"
          unoptimized
          className="cm-avatar__image"
        />
      ) : (
        fallback ?? <span className="cm-avatar__fallback">{alt?.[0] ?? "?"}</span>
      )}
    </div>
  );
}
