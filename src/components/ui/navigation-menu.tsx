"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

type NavigationItem = {
  href: string;
  label: string;
};

type NavigationMenuProps = {
  items: NavigationItem[];
  className?: string;
};

export function CmNavigationMenu({ items, className }: NavigationMenuProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("cm-navigation-menu", className)}>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "cm-navigation-menu-item",
              isActive && "cm-navigation-menu-item-active",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
