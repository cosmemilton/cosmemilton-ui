import { Icon as IconifyIcon } from "@iconify/react";
import {
  BookOpen,
  Boxes,
  ChartColumn,
  ClipboardList,
  Library,
  MessageSquare,
  MousePointer2,
  Palette,
  PanelsTopLeft,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "../../lib/utils.js";
import { BRAND_SYMBOL } from "../../lib/brand-symbol.js";

// Common navigation icons ship with the library and render without a network request.
const bundledIcons: Record<string, LucideIcon> = {
  "lucide:library": Library,
  "lucide:boxes": Boxes,
  "lucide:book-open": BookOpen,
  "lucide:palette": Palette,
  "lucide:panels-top-left": PanelsTopLeft,
  "lucide:mouse-pointer-2": MousePointer2,
  "lucide:clipboard-list": ClipboardList,
  "lucide:message-square": MessageSquare,
  "lucide:chart-column": ChartColumn,
  "lucide:users": Users,
};

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
  size,
  color,
  style,
  title,
  "aria-hidden": ariaHidden,
}: CmIconProps) {
  const accessibilityProps = title
    ? { role: "img", "aria-label": title, "aria-hidden": ariaHidden }
    : { "aria-hidden": ariaHidden };

  if (name === "cm:ui") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={BRAND_SYMBOL.viewBox}
        className={cn("cm-icon", size === undefined && "cm-icon--default-size", className)}
        width={size}
        height={size}
        color={color}
        style={style}
        {...accessibilityProps}
      >
        <image width={BRAND_SYMBOL.width} height={BRAND_SYMBOL.height} href={BRAND_SYMBOL.href} />
      </svg>
    );
  }

  const BundledIcon = Object.prototype.hasOwnProperty.call(bundledIcons, name)
    ? bundledIcons[name]
    : undefined;
  if (BundledIcon) {
    return (
      <BundledIcon
        className={cn("cm-icon", size === undefined && "cm-icon--default-size", className)}
        width={size}
        height={size}
        color={color}
        style={style}
        {...accessibilityProps}
      />
    );
  }

  return (
    <IconifyIcon
      icon={name}
      className={cn("cm-icon", size === undefined && "cm-icon--default-size", className)}
      width={size}
      height={size}
      color={color}
      style={style}
      {...accessibilityProps}
    />
  );
}
CmIcon.displayName = "CmIcon";
