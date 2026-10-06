"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type AnchorHTMLAttributes,
  type ComponentType,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useControllableState } from "../../hooks/use-controllable-state.js";
import { useMegaPanel } from "../../hooks/use-mega-panel.js";
import { CmButton } from "./button.js";
import { MegaMenuPanel } from "./mega-menu-panel.js";
import { CmPortal } from "./portal.js";

export type CmMegaMenuLink = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  badge?: ReactNode;
  target?: string;
  /** Additional terms used by CmMegaMenuSearch. */
  keywords?: string[];
};

export type CmMegaMenuGroup = {
  id: string;
  label: string;
  icon?: ReactNode;
  items: CmMegaMenuLink[];
};

export type CmMegaMenuItem = CmMegaMenuLink & {
  groups?: CmMegaMenuGroup[];
};

export type CmMegaMenuAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type CmMegaMenuProps = HTMLAttributes<HTMLElement> & {
  items: CmMegaMenuItem[];
  orientation?: "horizontal" | "vertical";
  variant?: "surface" | "ghost" | "glass";
  columns?: 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  panelWidth?: number | string;
  align?: "start" | "center" | "end";
  openItem?: string | null;
  defaultOpenItem?: string | null;
  onOpenChange?: (itemId: string | null) => void;
  activeHref?: string;
  linkComponent?: ComponentType<CmMegaMenuAnchorProps>;
  start?: ReactNode;
  end?: ReactNode;
  panelHeader?: ReactNode;
  panelFooter?: ReactNode;
};

const focusableSelector =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';

function focusableElements(root: ParentNode | null): HTMLElement[] {
  return root
    ? Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => {
          if (element.tabIndex < 0 || element.closest('[hidden],[inert],[aria-disabled="true"]'))
            return false;
          for (
            let ancestor: HTMLElement | null = element;
            ancestor;
            ancestor = ancestor.parentElement
          ) {
            const style = getComputedStyle(ancestor);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.visibility === "collapse"
            )
              return false;
          }
          return true;
        })
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    : [];
}

/** Disclosure navigation with grouped links in a wide, non-modal floating panel. */
export const CmMegaMenu = forwardRef<HTMLElement, CmMegaMenuProps>(function CmMegaMenu(
  {
    items,
    orientation = "horizontal",
    variant = "surface",
    columns = 4,
    size = "md",
    panelWidth = 960,
    align = "start",
    openItem: controlledItem,
    defaultOpenItem = null,
    onOpenChange,
    activeHref,
    linkComponent: LinkComponent,
    start,
    end,
    panelHeader,
    panelFooter,
    className,
    onKeyDown,
    "aria-label": ariaLabel = "Navegação principal",
    ...props
  },
  forwardedRef,
) {
  const menuId = useId();
  const panelId = `${menuId}-panel`;
  const navRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef<"first" | "last" | "tab-first" | null>(null);
  const [openId, setOpenId] = useControllableState<string | null>({
    value: controlledItem,
    defaultValue: defaultOpenItem,
    onChange: onOpenChange,
  });
  const openEntry = items.find(
    (item) => item.id === openId && !item.disabled && item.groups?.length,
  );
  const open = Boolean(openEntry);

  const close = useCallback(() => {
    pendingFocus.current = null;
    setOpenId(null);
  }, [setOpenId]);

  const focusPanelBoundary = useCallback((boundary: "first" | "last" | "tab-first") => {
    const targets = focusableElements(panelRef.current).filter(
      (node) => boundary === "tab-first" || node.matches(".cm-mega-panel__item"),
    );
    (boundary === "last" ? targets[targets.length - 1] : targets[0])?.focus();
  }, []);

  useMegaPanel(anchorRef, panelRef, {
    enabled: open,
    align,
    anchorKey: openEntry?.id,
    onPosition: () => {
      if (pendingFocus.current) {
        focusPanelBoundary(pendingFocus.current);
        pendingFocus.current = null;
      }
    },
  });
  useClickOutside([navRef, panelRef], close, open);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      anchorRef.current?.focus();
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Node;
      if (target !== anchorRef.current && !panelRef.current?.contains(target)) close();
    };
    document.addEventListener("keydown", onEscape);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open, close]);

  const openFromKeyboard = (item: CmMegaMenuItem, boundary: "first" | "last" | "tab-first") => {
    if (openId === item.id && panelRef.current?.dataset.positioned === "true") {
      focusPanelBoundary(boundary);
    } else {
      pendingFocus.current = boundary;
      setOpenId(item.id);
    }
  };

  const handleNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cm-mega-trigger]");
    if (!target || !navRef.current?.contains(target)) return;
    const item = items.find((entry) => entry.id === target.dataset.cmMegaTrigger);
    if (!item || item.disabled) return;
    const disclosure = Boolean(item.groups?.length);
    if (event.key === "Tab" && openEntry?.id === item.id) {
      if (event.shiftKey) {
        close();
      } else if (focusableElements(panelRef.current).length) {
        event.preventDefault();
        openFromKeyboard(item, "tab-first");
      }
      return;
    }
    if (
      disclosure &&
      (event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        (orientation === "vertical" && event.key === "ArrowRight"))
    ) {
      if (orientation === "horizontal" || event.key === "ArrowRight") {
        event.preventDefault();
        openFromKeyboard(item, event.key === "ArrowUp" ? "last" : "first");
        return;
      }
    }
    const triggers = focusableElements(navRef.current).filter((node) =>
      node.hasAttribute("data-cm-mega-trigger"),
    );
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const index = triggers.indexOf(target);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? triggers.length - 1
          : event.key === nextKey
            ? (index + 1) % triggers.length
            : event.key === previousKey
              ? (index - 1 + triggers.length) % triggers.length
              : -1;
    if (nextIndex >= 0) {
      event.preventDefault();
      triggers[nextIndex]?.focus();
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const allFocusables = focusableElements(panelRef.current);
    const target = event.target as HTMLElement;
    if (event.key === "Tab") {
      const index = allFocusables.indexOf(target);
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        close();
        anchorRef.current?.focus();
      } else if (!event.shiftKey && index === allFocusables.length - 1) {
        event.preventDefault();
        const outside = focusableElements(document).filter(
          (node) => !panelRef.current?.contains(node),
        );
        const anchorIndex = outside.indexOf(anchorRef.current!);
        close();
        (outside[anchorIndex + 1] ?? anchorRef.current)?.focus();
      }
      return;
    }
    const links = focusableElements(panelRef.current).filter((node) =>
      node.matches(".cm-mega-panel__item"),
    );
    const index = links.indexOf(target);
    if (index < 0) return;
    let next: HTMLElement | undefined;
    if (event.key === "Home") next = links[0];
    if (event.key === "End") next = links[links.length - 1];
    if (event.key === "ArrowDown") next = links[(index + 1) % links.length];
    if (event.key === "ArrowUp") next = links[(index - 1 + links.length) % links.length];
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const groups = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(".cm-mega-panel__group") ?? [],
      );
      const groupIndex = groups.findIndex((group) => group.contains(target));
      const direction = event.key === "ArrowRight" ? 1 : -1;
      for (let step = 1; step < groups.length; step++) {
        const group = groups[(groupIndex + direction * step + groups.length) % groups.length];
        next = focusableElements(group)[0];
        if (next) break;
      }
    }
    if (next) {
      event.preventDefault();
      next.focus();
      next.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
  };

  const entryContent = (entry: CmMegaMenuLink, top = false) => (
    <>
      {entry.icon ? (
        <span className="cm-mega-panel__icon" aria-hidden="true">
          {entry.icon}
        </span>
      ) : null}
      <span className="cm-mega-panel__item-copy">
        <span className={top ? undefined : "cm-mega-panel__label"}>{entry.label}</span>
        {entry.description ? (
          <span className="cm-mega-panel__description">{entry.description}</span>
        ) : null}
      </span>
      {entry.badge ? <span className="cm-mega-panel__badge">{entry.badge}</span> : null}
    </>
  );

  const renderEntry = (entry: CmMegaMenuLink, top = false) => {
    const className = top ? "cm-mega-menu__trigger" : "cm-mega-panel__item";
    const shared = {
      className,
      "aria-current": entry.href && entry.href === activeHref ? ("page" as const) : undefined,
      ...(top ? { "data-cm-mega-trigger": entry.id } : {}),
    };
    if (entry.href && entry.disabled) {
      return (
        <span {...shared} role="link" aria-disabled="true">
          {entryContent(entry, top)}
        </span>
      );
    }
    if (entry.href) {
      const linkProps: CmMegaMenuAnchorProps = {
        ...shared,
        href: entry.href,
        target: entry.target,
        rel: entry.target === "_blank" ? "noreferrer" : undefined,
        onClick: () => {
          entry.onSelect?.();
          close();
        },
        children: entryContent(entry, top),
      };
      return LinkComponent ? (
        <LinkComponent {...linkProps} />
      ) : (
        <a {...linkProps}>{linkProps.children}</a>
      );
    }
    return (
      <CmButton
        {...shared}
        unstyled
        disabled={entry.disabled}
        onClick={() => {
          entry.onSelect?.();
          close();
          if (!top) anchorRef.current?.focus();
        }}
      >
        {entryContent(entry, top)}
      </CmButton>
    );
  };

  return (
    <>
      {/* Keyboard events delegate from the native links and disclosure buttons. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <nav
        ref={(node) => {
          navRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        {...props}
        aria-label={ariaLabel}
        className={cn(
          "cm-mega-menu",
          `cm-mega-menu--${orientation}`,
          `cm-mega-menu--${variant}`,
          variant === "glass" && "cm-glass",
          `cm-mega-menu--${size}`,
          className,
        )}
        onKeyDown={handleNavKeyDown}
      >
        {start ? <div className="cm-mega-menu__start">{start}</div> : null}
        <ul className="cm-mega-menu__list">
          {items.map((item) => (
            <li key={item.id}>
              {item.groups?.length ? (
                <CmButton
                  unstyled
                  ref={(node) => {
                    if (openEntry?.id === item.id) anchorRef.current = node;
                  }}
                  id={`${menuId}-${encodeURIComponent(item.id)}`}
                  data-cm-mega-trigger={item.id}
                  disabled={item.disabled}
                  aria-expanded={openEntry?.id === item.id}
                  aria-controls={openEntry?.id === item.id ? panelId : undefined}
                  className="cm-mega-menu__trigger"
                  onClick={() => setOpenId((previous) => (previous === item.id ? null : item.id))}
                >
                  {entryContent(item, true)}
                  <ChevronDown className="cm-mega-menu__chevron" size={16} aria-hidden="true" />
                </CmButton>
              ) : (
                renderEntry(item, true)
              )}
            </li>
          ))}
        </ul>
        {end ? <div className="cm-mega-menu__end">{end}</div> : null}
      </nav>
      {openEntry ? (
        <CmPortal>
          <MegaMenuPanel
            key={openEntry.id}
            ref={panelRef}
            id={panelId}
            role="group"
            aria-labelledby={`${menuId}-${encodeURIComponent(openEntry.id)}`}
            columns={columns}
            width={panelWidth}
            header={panelHeader}
            footer={panelFooter}
            onKeyDown={handlePanelKeyDown}
          >
            {openEntry.groups!.map((group) => (
              <section
                key={group.id}
                className="cm-mega-panel__group"
                aria-labelledby={`${panelId}-${encodeURIComponent(group.id)}`}
              >
                <h3
                  id={`${panelId}-${encodeURIComponent(group.id)}`}
                  className="cm-mega-panel__group-title"
                >
                  {group.icon ? (
                    <span className="cm-mega-panel__icon" aria-hidden="true">
                      {group.icon}
                    </span>
                  ) : null}
                  {group.label}
                </h3>
                <ul className="cm-mega-panel__links">
                  {group.items.map((entry) => (
                    <li key={entry.id}>{renderEntry(entry)}</li>
                  ))}
                </ul>
              </section>
            ))}
          </MegaMenuPanel>
        </CmPortal>
      ) : null}
    </>
  );
});
CmMegaMenu.displayName = "CmMegaMenu";
