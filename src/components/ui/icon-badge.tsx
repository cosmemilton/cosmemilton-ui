import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type IconBadgeTone = "default" | "primary" | "success" | "warning" | "danger" | "info";
type IconBadgeSize = "xs" | "sm" | "md";

export type CmIconBadgeProps = {
  icon: ReactNode;
  tone?: IconBadgeTone;
  size?: IconBadgeSize;
  className?: string;
};

export function CmIconBadge({
  icon,
  tone = "default",
  size = "sm",
  className,
}: CmIconBadgeProps) {
  return (
    <span
      className={cn(
        "cm-icon-badge",
        `cm-icon-badge--${size}`,
        `cm-icon-badge--tone-${tone}`,
        className,
      )}
    >
      {icon}
    </span>
  );
}
