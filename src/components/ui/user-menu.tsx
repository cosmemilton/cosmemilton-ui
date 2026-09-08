"use client";

import type { ReactNode } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmAvatar } from "./avatar.js";
import { CmButton } from "./button.js";
import { CmDropdownMenu, type CmDropdownMenuItem } from "./dropdown-menu.js";
import type { CmSize } from "./types.js";

type CmUserMenuSize = CmSize;

export type CmUserMenuHeaderMode = "auto" | "always" | "never";
export type CmUserMenuPresentation = "default" | "compact" | "slim";

export type CmUserMenuUser = {
  title: string;
  subtitle?: ReactNode;
  email?: string;
  imageUrl?: string;
  initials?: ReactNode;
};

export type CmUserMenuProps = {
  user: CmUserMenuUser;
  items: CmDropdownMenuItem[];
  align?: "start" | "center" | "end";
  presentation?: CmUserMenuPresentation;
  size?: CmUserMenuSize;
  avatarSize?: CmUserMenuSize;
  variant?: "ghost" | "surface" | "plain";
  showTitle?: boolean;
  showSubtitle?: boolean;
  showChevron?: boolean;
  menuHeader?: CmUserMenuHeaderMode;
  triggerClassName?: string;
  menuClassName?: string;
};

function getInitials(title: string) {
  const parts = title.trim().split(/\s+/u).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function readableNode(value: ReactNode) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return undefined;
}

export function CmUserMenu({
  user,
  items,
  align = "end",
  presentation = "default",
  size,
  avatarSize,
  variant,
  showTitle,
  showSubtitle,
  showChevron,
  menuHeader,
  triggerClassName,
  menuClassName,
}: CmUserMenuProps) {
  const isCompact = presentation === "compact";
  const isSlim = presentation === "slim";
  const resolvedSize = size ?? "sm";
  const resolvedAvatarSize = avatarSize ?? "sm";
  const resolvedVariant = variant ?? (isCompact ? "surface" : isSlim ? "plain" : "ghost");
  const resolvedShowTitle = showTitle ?? !isCompact;
  const resolvedShowSubtitle = showSubtitle ?? !isCompact;
  const resolvedShowChevron = showChevron ?? true;
  const resolvedMenuHeader = menuHeader ?? "auto";
  const subtitleLabel = readableNode(user.subtitle);
  const triggerLabel = subtitleLabel ? `${user.title}, ${subtitleLabel}` : user.title;
  const fallback = user.initials ?? getInitials(user.title);
  const hasSubtitle = Boolean(user.subtitle);
  const hasTriggerText = resolvedShowTitle || (resolvedShowSubtitle && hasSubtitle);
  const hasHiddenTriggerText = !resolvedShowTitle || (hasSubtitle && !resolvedShowSubtitle);
  const hasHeaderContent = Boolean(user.title || user.subtitle || user.email);
  const shouldRenderHeader = resolvedMenuHeader !== "never" && hasHeaderContent;
  const autoHeaderClass =
    resolvedMenuHeader === "auto" && !hasHiddenTriggerText
      ? "cm-user-menu__menu-header--auto"
      : "cm-user-menu__menu-header--visible";

  const header = shouldRenderHeader ? (
    <div
      role="presentation"
      className={cn(
        "cm-dropdown-menu__header",
        "cm-user-menu__menu-header",
        isSlim && "cm-user-menu__menu-header--slim",
        autoHeaderClass,
      )}
    >
      {isSlim ? (
        <UserRound className="cm-user-menu__menu-header-icon" size={16} aria-hidden="true" />
      ) : (
        <CmAvatar
          src={user.imageUrl}
          alt={user.title}
          size={resolvedAvatarSize}
          fallback={fallback}
        />
      )}
      <div className="cm-user-menu__menu-header-content">
        <span className="cm-user-menu__menu-header-title">{user.title}</span>
        {user.subtitle ? (
          <span className="cm-user-menu__menu-header-subtitle">{user.subtitle}</span>
        ) : null}
        {user.email ? <span className="cm-user-menu__menu-header-email">{user.email}</span> : null}
      </div>
    </div>
  ) : undefined;

  return (
    <CmDropdownMenu
      align={align}
      className={cn(
        "cm-user-menu__popover",
        isSlim && "cm-user-menu__popover--slim",
        menuClassName,
      )}
      dismissOnEscape={isSlim}
      header={header}
      items={items}
      trigger={({ open, toggle, ref }) => (
        <CmButton
          ref={ref}
          size={resolvedSize}
          variant={resolvedVariant}
          shape={isSlim ? "default" : "pill"}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={triggerLabel}
          title={triggerLabel}
          className={cn(
            "cm-user-menu__trigger",
            isCompact && "cm-user-menu__trigger--compact",
            isSlim && "cm-user-menu__trigger--slim",
            isSlim && !avatarSize && "cm-user-menu__trigger--slim-avatar-auto",
            isSlim && !resolvedShowChevron && "cm-user-menu__trigger--slim-no-chevron",
            triggerClassName,
          )}
          trailingIcon={
            resolvedShowChevron && !isSlim ? (
              <ChevronDown aria-hidden="true" size={16} />
            ) : undefined
          }
          onClick={toggle}
        >
          <CmAvatar
            src={user.imageUrl}
            alt={user.title}
            size={resolvedAvatarSize}
            fallback={fallback}
          />
          {hasTriggerText ? (
            <span className="cm-user-menu__trigger-text">
              {resolvedShowTitle ? (
                <span className="cm-user-menu__trigger-title">{user.title}</span>
              ) : null}
              {resolvedShowSubtitle && user.subtitle ? (
                <span className="cm-user-menu__trigger-subtitle">{user.subtitle}</span>
              ) : null}
            </span>
          ) : null}
          {isSlim && resolvedShowChevron ? (
            <span className="cm-user-menu__trigger-chevron" aria-hidden="true">
              <ChevronDown size={14} />
            </span>
          ) : null}
        </CmButton>
      )}
    />
  );
}
CmUserMenu.displayName = "CmUserMenu";
