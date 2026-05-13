"use client";

import {
  ChevronLeft,
  ChevronRight,
  PanelLeft,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";

export type CmSidebarItem = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  onSelect?: (item: CmSidebarItem) => void;
};

export type CmSidebarGroup = {
  id: string;
  label: string;
  icon?: ReactNode;
  items: CmSidebarItem[];
  active?: boolean;
  defaultOpen?: boolean;
  direct?: boolean;
};

export type CmSidebarBrand = {
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  fallbackTitle?: string;
  iconLabel?: string;
};

export type CmSidebarProps = {
  groups: CmSidebarGroup[];
  brand?: CmSidebarBrand;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  navLabel?: string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  openGroupId?: string | null;
  defaultOpenGroupId?: string | null;
  onOpenGroupChange?: (groupId: string | null) => void;
  autoCollapse?: boolean;
  autoCollapseBelow?: number;
};

const defaultAutoCollapseBelow = 1180;
const previewCloseDelay = 700;
const selectionCloseDelay = 1300;

function getInitial(label: ReactNode, fallback = "M") {
  return typeof label === "string" && label.trim()
    ? label.trim().charAt(0).toUpperCase()
    : fallback;
}

function useAutoCollapsed(enabled: boolean, breakpoint: number) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setMatches(false);
      return;
    }

    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setMatches(query.matches);

    update();

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }

    query.addListener(update);
    return () => query.removeListener(update);
  }, [breakpoint, enabled]);

  return matches;
}

function renderIcon(icon: ReactNode, label: ReactNode, className?: string) {
  return (
    <span className={cn("cm-sidebar__nav-icon", !icon && "cm-sidebar__nav-icon--fallback", className)} aria-hidden="true">
      {icon ?? getInitial(label)}
    </span>
  );
}

export function CmSidebar({
  autoCollapse = true,
  autoCollapseBelow = defaultAutoCollapseBelow,
  brand,
  children,
  className,
  collapsed,
  contentClassName,
  defaultCollapsed = false,
  defaultOpenGroupId,
  footer,
  groups,
  navLabel = "Navegação principal",
  onCollapsedChange,
  onOpenGroupChange,
  openGroupId,
  sidebarClassName,
}: CmSidebarProps) {
  const visibleGroups = useMemo(
    () => groups.filter((group) => group.items.length > 0),
    [groups],
  );
  const activeGroupId = useMemo(
    () =>
      visibleGroups.find((group) => group.active || group.items.some((item) => item.active))?.id ??
      visibleGroups.find((group) => group.defaultOpen)?.id ??
      visibleGroups[0]?.id,
    [visibleGroups],
  );
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const [uncontrolledOpenGroupId, setUncontrolledOpenGroupId] = useState<string | null | undefined>(
    defaultOpenGroupId,
  );
  const [sidebarPreviewOpen, setSidebarPreviewOpen] = useState(false);
  const previewTimerRef = useRef<number | null>(null);
  const autoCollapsed = useAutoCollapsed(autoCollapse, autoCollapseBelow);
  const manualCollapsed = collapsed ?? uncontrolledCollapsed;
  const isCollapsed = manualCollapsed || autoCollapsed;
  const controlledOpenGroup = openGroupId !== undefined;
  const currentOpenGroupId = controlledOpenGroup ? openGroupId : uncontrolledOpenGroupId;
  const visibleOpenGroupId = currentOpenGroupId === undefined ? activeGroupId : currentOpenGroupId;
  const brandTitle = brand?.title ?? brand?.fallbackTitle ?? "Menu";
  const brandSubtitle = brand?.subtitle;
  const brandIcon = brand?.icon ?? getInitial(brandTitle);

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  }, []);

  const openSidebarPreview = useCallback(() => {
    if (!isCollapsed) return;
    clearPreviewTimer();
    setSidebarPreviewOpen(true);
  }, [clearPreviewTimer, isCollapsed]);

  const closeSidebarPreview = useCallback((delay = previewCloseDelay) => {
    if (!isCollapsed) return;
    clearPreviewTimer();
    previewTimerRef.current = window.setTimeout(() => {
      setSidebarPreviewOpen(false);
      previewTimerRef.current = null;
    }, delay);
  }, [clearPreviewTimer, isCollapsed]);

  const closeSidebarPreviewAfterSelection = useCallback(() => {
    if (isCollapsed) {
      closeSidebarPreview(selectionCloseDelay);
    }
  }, [closeSidebarPreview, isCollapsed]);

  useEffect(() => () => clearPreviewTimer(), [clearPreviewTimer]);

  useEffect(() => {
    if (!isCollapsed) {
      clearPreviewTimer();
      setSidebarPreviewOpen(false);
    }
  }, [clearPreviewTimer, isCollapsed]);

  const setCollapsed = useCallback((nextCollapsed: boolean) => {
    if (collapsed === undefined) {
      setUncontrolledCollapsed(nextCollapsed);
    }
    setSidebarPreviewOpen(false);
    setUncontrolledOpenGroupId(undefined);
    onCollapsedChange?.(nextCollapsed);
  }, [collapsed, onCollapsedChange]);

  const setOpenGroup = useCallback((nextGroupId: string | null) => {
    if (!controlledOpenGroup) {
      setUncontrolledOpenGroupId(nextGroupId);
    }
    onOpenGroupChange?.(nextGroupId);
  }, [controlledOpenGroup, onOpenGroupChange]);

  function toggleSidebarState() {
    if (autoCollapsed) {
      openSidebarPreview();
      return;
    }

    setCollapsed(!manualCollapsed);
  }

  function toggleSidebarGroup(groupId: string) {
    openSidebarPreview();
    const currentGroupId = currentOpenGroupId === undefined ? activeGroupId : currentOpenGroupId;
    setOpenGroup(currentGroupId === groupId ? null : groupId);
  }

  function handleSidebarBlur(event: FocusEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      closeSidebarPreview();
    }
  }

  function handleItemClick(event: MouseEvent<HTMLElement>, item: CmSidebarItem) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    item.onSelect?.(item);
    closeSidebarPreviewAfterSelection();
  }

  const brandContent = (
    <div className="cm-sidebar__brand">
      {isCollapsed ? (
        <button
          type="button"
          className="cm-sidebar__brand-icon-button"
          aria-label={brand?.iconLabel ?? "Abrir menu lateral"}
          title={brand?.iconLabel ?? "Abrir menu lateral"}
          onClick={openSidebarPreview}
        >
          <span className="cm-sidebar__brand-icon" aria-hidden="true">
            {brandIcon}
          </span>
        </button>
      ) : (
        <span className="cm-sidebar__brand-icon" aria-hidden="true">
          {brandIcon}
        </span>
      )}
      <div className="cm-sidebar__brand-text">
        <strong title={typeof brandTitle === "string" ? brandTitle : undefined}>{brandTitle}</strong>
        {brandSubtitle ? <span>{brandSubtitle}</span> : null}
      </div>
      {!autoCollapsed && (!isCollapsed || sidebarPreviewOpen) ? (
        <button
          type="button"
          className="cm-sidebar__toggle"
          aria-label={manualCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          title={manualCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          onClick={toggleSidebarState}
        >
          {manualCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "cm-sidebar-shell",
        isCollapsed && "cm-sidebar-shell--collapsed",
        sidebarPreviewOpen && "cm-sidebar-shell--preview",
        autoCollapsed && "cm-sidebar-shell--auto-collapsed",
        className,
      )}
    >
      <aside
        className={cn("cm-sidebar", sidebarClassName)}
        aria-label={navLabel}
        onMouseEnter={openSidebarPreview}
        onMouseLeave={() => closeSidebarPreview()}
        onFocus={openSidebarPreview}
        onBlur={handleSidebarBlur}
      >
        {brandContent}
        <nav className="cm-sidebar__nav" aria-label={navLabel}>
          {visibleGroups.map((group) => {
            const groupActive = Boolean(group.active || group.items.some((item) => item.active));
            const groupOpen = visibleOpenGroupId === group.id;
            const firstItem = group.items[0];
            const direct = group.direct ?? group.items.length === 1;

            if (direct && firstItem) {
              return (
                <div
                  className={cn("cm-sidebar__group", groupActive && "cm-sidebar__group--active")}
                  key={group.id}
                >
                  <SidebarItem
                    active={groupActive || firstItem.active}
                    collapsed={isCollapsed && !sidebarPreviewOpen}
                    groupLabel={group.label}
                    icon={group.icon ?? firstItem.icon}
                    item={firstItem}
                    onClick={handleItemClick}
                  />
                </div>
              );
            }

            return (
              <div
                className={cn(
                  "cm-sidebar__group",
                  groupActive && "cm-sidebar__group--active",
                  groupOpen && "cm-sidebar__group--open",
                )}
                key={group.id}
              >
                <button
                  type="button"
                  className={cn("cm-sidebar__group-trigger", groupActive && "cm-sidebar__group-trigger--active")}
                  aria-expanded={groupOpen}
                  title={isCollapsed && !sidebarPreviewOpen ? group.label : undefined}
                  onClick={() => toggleSidebarGroup(group.id)}
                >
                  {renderIcon(group.icon, group.label)}
                  <span className="cm-sidebar__label">{group.label}</span>
                  <ChevronRight className="cm-sidebar__chevron" size={16} aria-hidden="true" />
                </button>
                <div className="cm-sidebar__group-items" aria-hidden={!groupOpen}>
                  {group.items.map((item) => (
                    <SidebarItem
                      active={item.active}
                      collapsed={isCollapsed && !sidebarPreviewOpen}
                      item={item}
                      key={item.id}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        {footer ? <div className="cm-sidebar__footer">{footer}</div> : null}
      </aside>
      <section className={cn("cm-sidebar__content", contentClassName)}>
        {children ?? (
          <div className="cm-sidebar__empty">
            <PanelLeft size={22} aria-hidden="true" />
          </div>
        )}
      </section>
    </div>
  );
}

type SidebarItemProps = {
  active?: boolean;
  collapsed: boolean;
  groupLabel?: string;
  icon?: ReactNode;
  item: CmSidebarItem;
  onClick: (event: MouseEvent<HTMLElement>, item: CmSidebarItem) => void;
};

function SidebarItem({ active, collapsed, groupLabel, icon, item, onClick }: SidebarItemProps) {
  const className = cn(
    "cm-sidebar__item",
    active && "cm-sidebar__item--active",
    item.disabled && "cm-sidebar__item--disabled",
  );
  const title = collapsed ? groupLabel ?? item.label : undefined;
  const content = (
    <>
      {renderIcon(icon ?? item.icon, groupLabel ?? item.label)}
      <span className="cm-sidebar__label">{groupLabel ?? item.label}</span>
      {item.badge ? <span className="cm-sidebar__badge">{item.badge}</span> : null}
    </>
  );

  if (item.href) {
    return (
      <a
        aria-current={active ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        className={className}
        href={item.disabled ? undefined : item.href}
        tabIndex={item.disabled ? -1 : undefined}
        title={title}
        onClick={(event) => onClick(event, item)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={className}
      disabled={item.disabled}
      title={title}
      onClick={(event) => onClick(event, item)}
    >
      {content}
    </button>
  );
}
