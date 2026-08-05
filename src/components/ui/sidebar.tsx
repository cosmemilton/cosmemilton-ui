"use client";

import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
} from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { cmDensityClass, cmSizeValue } from "./types.js";
import type { CmSidebarGroup, CmSidebarItem, CmSidebarProps } from "./sidebar.types.js";
import { getBrowserPathname, getInitial, normalizePathname } from "./sidebar.utils.js";
import { SidebarItem, renderIcon } from "./sidebar-item.js";

export type {
  CmSidebarItem,
  CmSidebarHrefLinkComponentProps,
  CmSidebarToLinkComponentProps,
  CmSidebarLinkComponentProps,
  CmSidebarLinkComponent,
  CmSidebarGroup,
  CmSidebarActiveContext,
  CmSidebarBrand,
  CmSidebarProps,
  CmSidebarRail,
} from "./sidebar.types.js";

const defaultAutoCollapseBelow = 1180;
const previewCloseDelay = 700;
const selectionCloseDelay = 1300;

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

export function CmSidebar({
  activePathname,
  autoCollapse = true,
  autoCollapseBelow = defaultAutoCollapseBelow,
  belowGroups,
  belowGroupsDivider = false,
  brand,
  children,
  className,
  collapsed,
  contentClassName,
  defaultCollapsed = false,
  defaultOpenGroupId,
  footer,
  groups,
  isActive,
  linkComponent,
  collapsedWidth,
  contentPadding,
  density,
  groupItemsMaxHeight,
  lastGroupItemsMaxHeight,
  minHeight,
  navLabel = "Navegação principal",
  onCollapsedChange,
  onOpenGroupChange,
  openGroupId,
  rail = "connectors",
  sidebarClassName,
  standalone = false,
  style,
  tone = "surface",
  width,
}: CmSidebarProps) {
  const visibleGroups = useMemo(() => groups.filter((group) => group.items.length > 0), [groups]);
  const [browserPathname, setBrowserPathname] = useState(
    () => activePathname ?? getBrowserPathname(),
  );
  const pathname = activePathname ?? browserPathname;

  useEffect(() => {
    if (activePathname !== undefined) {
      setBrowserPathname(activePathname);
      return;
    }

    if (typeof window === "undefined") return;

    const updatePathname = () => setBrowserPathname(getBrowserPathname());
    updatePathname();
    window.addEventListener("popstate", updatePathname);
    window.addEventListener("hashchange", updatePathname);

    return () => {
      window.removeEventListener("popstate", updatePathname);
      window.removeEventListener("hashchange", updatePathname);
    };
  }, [activePathname]);

  const getItemActive = useCallback(
    (item: CmSidebarItem, group: CmSidebarGroup) => {
      if (item.active !== undefined) return item.active;

      const context = { item, group, pathname };
      const target = item.to ?? item.href;

      return (
        item.isActive?.(context) ??
        isActive?.(context) ??
        (target ? normalizePathname(pathname) === normalizePathname(target) : false)
      );
    },
    [isActive, pathname],
  );
  const activeGroupId = useMemo(
    () =>
      visibleGroups.find(
        (group) => group.active || group.items.some((item) => getItemActive(item, group)),
      )?.id ??
      visibleGroups.find((group) => group.defaultOpen)?.id ??
      visibleGroups[0]?.id,
    [getItemActive, visibleGroups],
  );
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const [uncontrolledOpenGroupId, setUncontrolledOpenGroupId] = useState<string | null | undefined>(
    defaultOpenGroupId,
  );
  const [sidebarPreviewOpen, setSidebarPreviewOpen] = useState(false);
  const [lastGroupItemsAvailableHeight, setLastGroupItemsAvailableHeight] = useState<number | null>(
    null,
  );
  const sidebarRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const groupItemsRefs = useRef(new Map<string, HTMLDivElement>());
  const previewTimerRef = useRef<number | null>(null);
  const autoCollapsed = useAutoCollapsed(autoCollapse, autoCollapseBelow);
  const manualCollapsed = collapsed ?? uncontrolledCollapsed;
  const isCollapsed = manualCollapsed || autoCollapsed;
  const controlledOpenGroup = openGroupId !== undefined;
  const currentOpenGroupId = controlledOpenGroup ? openGroupId : uncontrolledOpenGroupId;
  const visibleOpenGroupId = currentOpenGroupId === undefined ? activeGroupId : currentOpenGroupId;
  const lastVisibleGroupId = visibleGroups[visibleGroups.length - 1]?.id;
  const hasFooter = Boolean(footer);
  const brandTitle = brand?.title ?? brand?.fallbackTitle ?? "Menu";
  const brandSubtitle = brand?.subtitle;
  const brandIcon = brand?.icon ?? getInitial(brandTitle);
  const shellStyle = {
    ...(width ? { "--cm-sidebar-expanded-width": cmSizeValue(width) } : {}),
    ...(collapsedWidth ? { "--cm-sidebar-collapsed-width": cmSizeValue(collapsedWidth) } : {}),
    ...(contentPadding ? { "--cm-sidebar-content-padding": cmSizeValue(contentPadding) } : {}),
    ...(minHeight ? { "--cm-sidebar-min-height": cmSizeValue(minHeight) } : {}),
    ...(groupItemsMaxHeight
      ? { "--cm-sidebar-group-items-max-height": cmSizeValue(groupItemsMaxHeight) }
      : {}),
    ...(lastGroupItemsMaxHeight
      ? { "--cm-sidebar-last-group-items-max-height": cmSizeValue(lastGroupItemsMaxHeight) }
      : {}),
    ...(lastGroupItemsAvailableHeight !== null
      ? { "--cm-sidebar-last-group-items-available-height": `${lastGroupItemsAvailableHeight}px` }
      : {}),
    ...style,
  } as CSSProperties;

  const updateLastGroupItemsAvailableHeight = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!visibleOpenGroupId || visibleOpenGroupId !== lastVisibleGroupId) {
      setLastGroupItemsAvailableHeight((current) => (current === null ? current : null));
      return;
    }

    const sidebarElement = sidebarRef.current;
    const navElement = navRef.current;
    const groupItemsElement = groupItemsRefs.current.get(visibleOpenGroupId);

    if (!sidebarElement || !navElement || !groupItemsElement) {
      setLastGroupItemsAvailableHeight((current) => (current === null ? current : null));
      return;
    }

    const sidebarRect = sidebarElement.getBoundingClientRect();
    const navRect = navElement.getBoundingClientRect();
    const groupItemsRect = groupItemsElement.getBoundingClientRect();
    const footerRect = footerRef.current?.getBoundingClientRect();
    const sidebarPaddingBottom = 0;
    const sidebarBottom = sidebarRect.bottom - sidebarPaddingBottom;
    const lowerBoundary = Math.min(navRect.bottom, footerRect?.top ?? sidebarBottom, sidebarBottom);
    const nextAvailableHeight = Math.max(0, Math.floor(lowerBoundary - groupItemsRect.top));

    setLastGroupItemsAvailableHeight((current) =>
      current !== null && Math.abs(current - nextAvailableHeight) < 1
        ? current
        : nextAvailableHeight,
    );
  }, [lastVisibleGroupId, visibleOpenGroupId]);

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

  const closeSidebarPreview = useCallback(
    (delay = previewCloseDelay) => {
      if (!isCollapsed) return;
      clearPreviewTimer();
      previewTimerRef.current = window.setTimeout(() => {
        setSidebarPreviewOpen(false);
        previewTimerRef.current = null;
      }, delay);
    },
    [clearPreviewTimer, isCollapsed],
  );

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId: number | null = null;

    const scheduleUpdate = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateLastGroupItemsAvailableHeight();
      });
    };

    scheduleUpdate();

    const sidebarElement = sidebarRef.current;
    const navElement = navRef.current;
    const footerElement = footerRef.current;
    const groupItemsElement = visibleOpenGroupId
      ? groupItemsRefs.current.get(visibleOpenGroupId)
      : undefined;
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(scheduleUpdate);

    window.addEventListener("resize", scheduleUpdate);
    navElement?.addEventListener("scroll", scheduleUpdate, { passive: true });

    for (const element of [sidebarElement, navElement, footerElement, groupItemsElement]) {
      if (element) {
        resizeObserver?.observe(element);
      }
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", scheduleUpdate);
      navElement?.removeEventListener("scroll", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [
    isCollapsed,
    sidebarPreviewOpen,
    updateLastGroupItemsAvailableHeight,
    hasFooter,
    visibleGroups.length,
    visibleOpenGroupId,
  ]);

  const setCollapsed = useCallback(
    (nextCollapsed: boolean) => {
      if (collapsed === undefined) {
        setUncontrolledCollapsed(nextCollapsed);
      }
      setSidebarPreviewOpen(false);
      setUncontrolledOpenGroupId(undefined);
      onCollapsedChange?.(nextCollapsed);
    },
    [collapsed, onCollapsedChange],
  );

  const setOpenGroup = useCallback(
    (nextGroupId: string | null) => {
      if (!controlledOpenGroup) {
        setUncontrolledOpenGroupId(nextGroupId);
      }
      onOpenGroupChange?.(nextGroupId);
    },
    [controlledOpenGroup, onOpenGroupChange],
  );

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
        <CmButton
          unstyled
          type="button"
          className="cm-sidebar__brand-icon-button"
          aria-label={brand?.iconLabel ?? "Abrir menu lateral"}
          title={brand?.iconLabel ?? "Abrir menu lateral"}
          onClick={openSidebarPreview}
        >
          <span className="cm-sidebar__brand-icon" aria-hidden="true">
            {brandIcon}
          </span>
        </CmButton>
      ) : (
        <span className="cm-sidebar__brand-icon" aria-hidden="true">
          {brandIcon}
        </span>
      )}
      <div className="cm-sidebar__brand-text">
        <strong title={typeof brandTitle === "string" ? brandTitle : undefined}>
          {brandTitle}
        </strong>
        {brandSubtitle ? <span>{brandSubtitle}</span> : null}
      </div>
      {!autoCollapsed && (!isCollapsed || sidebarPreviewOpen) ? (
        <CmButton
          unstyled
          type="button"
          className="cm-sidebar__toggle"
          aria-label={manualCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          title={manualCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          onClick={toggleSidebarState}
        >
          {manualCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </CmButton>
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
        standalone && "cm-sidebar-shell--standalone",
        `cm-sidebar-shell--tone-${tone}`,
        cmDensityClass(density),
        className,
      )}
      style={shellStyle}
    >
      <aside
        ref={sidebarRef}
        className={cn(
          "cm-sidebar",
          `cm-sidebar--tone-${tone}`,
          rail !== "connectors" && `cm-sidebar--rail-${rail}`,
          sidebarClassName,
        )}
        aria-label={navLabel}
        onMouseEnter={openSidebarPreview}
        onMouseLeave={() => closeSidebarPreview()}
        onFocus={openSidebarPreview}
        onBlur={handleSidebarBlur}
      >
        {brandContent}
        <nav ref={navRef} className="cm-sidebar__nav" aria-label={navLabel}>
          {visibleGroups.map((group) => {
            const groupActive = Boolean(
              group.active || group.items.some((item) => getItemActive(item, group)),
            );
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
                    active={groupActive || getItemActive(firstItem, group)}
                    collapsed={isCollapsed && !sidebarPreviewOpen}
                    groupLabel={group.label}
                    icon={group.icon ?? firstItem.icon}
                    item={firstItem}
                    linkComponent={linkComponent}
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
                <CmButton
                  unstyled
                  type="button"
                  className={cn(
                    "cm-sidebar__group-trigger",
                    groupActive && "cm-sidebar__group-trigger--active",
                  )}
                  aria-expanded={groupOpen}
                  title={isCollapsed && !sidebarPreviewOpen ? group.label : undefined}
                  onClick={() => toggleSidebarGroup(group.id)}
                >
                  {renderIcon(group.icon, group.label)}
                  <span className="cm-sidebar__label">{group.label}</span>
                  <ChevronRight className="cm-sidebar__chevron" size={16} aria-hidden="true" />
                </CmButton>
                <div
                  ref={(element) => {
                    if (element) {
                      groupItemsRefs.current.set(group.id, element);
                    } else {
                      groupItemsRefs.current.delete(group.id);
                    }
                  }}
                  className="cm-sidebar__group-items"
                  aria-hidden={!groupOpen}
                >
                  {group.items.map((item) => (
                    <SidebarItem
                      active={getItemActive(item, group)}
                      collapsed={isCollapsed && !sidebarPreviewOpen}
                      item={item}
                      key={item.id}
                      linkComponent={linkComponent}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {belowGroups && !(isCollapsed && !sidebarPreviewOpen) ? (
            <div
              className={cn(
                "cm-sidebar__below-groups",
                belowGroupsDivider && "cm-sidebar__below-groups--divided",
              )}
            >
              {belowGroups}
            </div>
          ) : null}
        </nav>
        {hasFooter ? (
          <div ref={footerRef} className="cm-sidebar__footer">
            {footer}
          </div>
        ) : null}
      </aside>
      {!standalone ? (
        <section className={cn("cm-sidebar__content", contentClassName)}>
          {children ?? (
            <div className="cm-sidebar__empty">
              <PanelLeft size={22} aria-hidden="true" />
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
CmSidebar.displayName = "CmSidebar";
