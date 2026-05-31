"use client";

import { type ElementType, type MouseEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { getInitial } from "./sidebar.utils.js";
import type {
  CmSidebarHrefLinkComponentProps,
  CmSidebarItem,
  CmSidebarLinkBaseProps,
  CmSidebarLinkComponent,
  CmSidebarToLinkComponentProps,
} from "./sidebar.types.js";

type SidebarIconFallback = "initial" | "marker";

/** Ícone de um item/grupo, com fallback para inicial ou marcador (bullet). */
export function renderIcon(
  icon: ReactNode,
  label: ReactNode,
  className?: string,
  fallback: SidebarIconFallback = "initial",
) {
  const showMarker = !icon && fallback === "marker";

  return (
    <span
      className={cn(
        "cm-sidebar__nav-icon",
        !icon && !showMarker && "cm-sidebar__nav-icon--fallback",
        showMarker && "cm-sidebar__nav-icon--marker",
        className,
      )}
      aria-hidden="true"
    >
      {icon ?? (showMarker ? null : getInitial(label))}
    </span>
  );
}

export type SidebarItemProps = {
  active?: boolean;
  collapsed: boolean;
  groupLabel?: string;
  icon?: ReactNode;
  item: CmSidebarItem;
  linkComponent?: CmSidebarLinkComponent;
  onClick: (event: MouseEvent<HTMLElement>, item: CmSidebarItem) => void;
};

export function SidebarItem({
  active,
  collapsed,
  groupLabel,
  icon,
  item,
  linkComponent,
  onClick,
}: SidebarItemProps) {
  const className = cn(
    "cm-sidebar__item",
    active && "cm-sidebar__item--active",
    item.disabled && "cm-sidebar__item--disabled",
  );
  const title = collapsed ? groupLabel ?? item.label : undefined;
  const linkTarget = item.href ?? item.to;
  const iconFallback = groupLabel ? "initial" : "marker";
  const content = (
    <>
      {renderIcon(icon ?? item.icon, groupLabel ?? item.label, undefined, iconFallback)}
      <span className="cm-sidebar__label">{groupLabel ?? item.label}</span>
      {item.badge ? <span className="cm-sidebar__badge">{item.badge}</span> : null}
    </>
  );

  if (linkTarget) {
    const linkProps: CmSidebarLinkBaseProps = {
      "aria-current": active ? "page" : undefined,
      "aria-disabled": item.disabled || undefined,
      className,
      tabIndex: item.disabled ? -1 : undefined,
      title,
      onClick: (event) => onClick(event, item),
    };

    if (linkComponent && !item.disabled) {
      if (item.href) {
        const LinkComponent = linkComponent as ElementType<CmSidebarHrefLinkComponentProps>;

        return (
          <LinkComponent
            {...linkProps}
            href={item.href}
            {...(item.to ? { to: item.to } : {})}
          >
            {content}
          </LinkComponent>
        );
      }

      const LinkComponent = linkComponent as ElementType<CmSidebarToLinkComponentProps>;

      return (
        <LinkComponent
          {...linkProps}
          to={item.to ?? linkTarget}
        >
          {content}
        </LinkComponent>
      );
    }

    return (
      <a
        {...linkProps}
        href={item.disabled ? undefined : linkTarget}
      >
        {content}
      </a>
    );
  }

  return (
    <CmButton
      unstyled
      type="button"
      aria-current={active ? "page" : undefined}
      className={className}
      disabled={item.disabled}
      title={title}
      onClick={(event) => onClick(event, item)}
    >
      {content}
    </CmButton>
  );
}
SidebarItem.displayName = "SidebarItem";
