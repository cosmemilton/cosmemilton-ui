"use client";

import { forwardRef, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type NavigationItem = {
  href: string;
  label: ReactNode;
};

type CmNavigationLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export type CmNavigationMenuProps = {
  items: NavigationItem[];
  className?: string;
  activeHref?: string;
  linkComponent?: ComponentType<CmNavigationLinkProps>;
};

function getBrowserPathname() {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

export const CmNavigationMenu = forwardRef<HTMLElement, CmNavigationMenuProps>(
  function CmNavigationMenu({ items, className, activeHref, linkComponent: LinkComponent }, ref) {
    const [pathname, setPathname] = useState(() => activeHref ?? getBrowserPathname());

    useEffect(() => {
      if (activeHref !== undefined) {
        setPathname(activeHref);
        return;
      }

      const updatePathname = () => setPathname(getBrowserPathname());
      updatePathname();
      window.addEventListener("popstate", updatePathname);
      window.addEventListener("hashchange", updatePathname);

      return () => {
        window.removeEventListener("popstate", updatePathname);
        window.removeEventListener("hashchange", updatePathname);
      };
    }, [activeHref]);

    return (
      <nav ref={ref} className={cn("cm-navigation-menu", className)}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const linkClassName = cn(
            "cm-navigation-menu-item",
            isActive && "cm-navigation-menu-item-active",
          );

          return LinkComponent ? (
            <LinkComponent key={item.href} href={item.href} className={linkClassName}>
              {item.label}
            </LinkComponent>
          ) : (
            <a key={item.href} href={item.href} className={linkClassName}>
              {item.label}
            </a>
          );
        })}
      </nav>
    );
  },
);
CmNavigationMenu.displayName = "CmNavigationMenu";
