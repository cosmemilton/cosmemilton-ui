import { Icon as IconifyIcon } from "@iconify/react";
import { cn } from "../../lib/utils";

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
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
export function CmIcon({ name, className, size = 20 }: IconProps) {
  return (
    <IconifyIcon
      icon={name}
      className={cn("cm-icon", className)}
      width={size}
      height={size}
    />
  );
}
