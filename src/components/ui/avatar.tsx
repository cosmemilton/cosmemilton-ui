"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cmVariants, type CmVariantProps } from "../../lib/variants.js";

const avatarVariants = cmVariants({
  base: "cm-avatar",
  variants: {
    size: {
      xs: "cm-avatar--xs",
      sm: "cm-avatar--sm",
      md: "cm-avatar--md",
      lg: "cm-avatar--lg",
      xl: "cm-avatar--xl",
    },
  },
  defaultVariants: { size: "md" },
});

export type CmAvatarProps = HTMLAttributes<HTMLDivElement> &
  CmVariantProps<typeof avatarVariants> & {
    src?: string;
    alt?: string;
    fallback?: ReactNode;
  };

export const CmAvatar = forwardRef<HTMLDivElement, CmAvatarProps>(function CmAvatar(
  { src, alt, fallback, size, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={avatarVariants({ size, className })} {...rest}>
      {src ? (
        <img
          src={src}
          alt={alt ?? "CmAvatar"}
          loading="lazy"
          decoding="async"
          className="cm-avatar__image"
        />
      ) : (
        (fallback ?? <span className="cm-avatar__fallback">{alt?.[0] ?? "?"}</span>)
      )}
    </div>
  );
});
CmAvatar.displayName = "CmAvatar";
