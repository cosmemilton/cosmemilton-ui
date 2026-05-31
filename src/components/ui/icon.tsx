import { Icon as IconifyIcon } from "@iconify/react";
import type { CSSProperties } from "react";
import { cn } from "../../lib/utils.js";

export interface CmIconProps {
  name: string;
  className?: string;
  size?: number | string;
  color?: string;
  style?: CSSProperties;
  title?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Componente universal para ícones
 * Suporta Iconify (material-symbols, mdi, ph, lucide, etc)
 *
 * Exemplos de uso:
 * <CmIcon name="material-symbols:store-outline" />
 * <CmIcon name="mdi:truck-delivery-outline" />
 * <CmIcon name="ph:address-book-fill" />
 * <CmIcon name="lucide:mail" />
 */
export function CmIcon({
  name,
  className,
  size = 20,
  color,
  style,
  title,
  "aria-hidden": ariaHidden,
}: CmIconProps) {
  const accessibilityProps = title
    ? { role: "img", "aria-label": title, "aria-hidden": ariaHidden }
    : { "aria-hidden": ariaHidden };

  return (
    <IconifyIcon
      icon={name}
      className={cn("cm-icon", className)}
      width={size}
      height={size}
      color={color}
      style={style}
      {...accessibilityProps}
    />
  );
}
CmIcon.displayName = "CmIcon";
