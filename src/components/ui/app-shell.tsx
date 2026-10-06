"use client";

import { Menu, X } from "lucide-react";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useFocusTrap } from "../../hooks/use-focus-trap.js";
import { useScrollLock } from "../../hooks/use-scroll-lock.js";
import { CmButton } from "./button.js";
import {
  cmDensityClass,
  cmSizeValue,
  cmSpacingValue,
  type CmDensity,
  type CmSpacing,
} from "./types.js";

export type CmAppShellChrome = "surface" | "inverted" | "glass";

// Spacing token (none|xs|sm|md|lg), raw CSS shorthand ("1rem 2rem") or a px
// number applied as padding on the scrollable content area.
export type CmAppShellContentPadding = CmSpacing | string | number;

type CmAppShellControls = {
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
  mobileMenuButton: ReactNode;
};

type CmAppShellSlot = ReactNode | ((controls: CmAppShellControls) => ReactNode);
type CmAppShellStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export type CmAppShellProps = HTMLAttributes<HTMLDivElement> & {
  sidebar?: CmAppShellSlot;
  topbar?: CmAppShellSlot;
  children?: ReactNode;
  chrome?: CmAppShellChrome;
  backdrop?: "plain" | "aurora" | "grid";
  footer?: CmAppShellSlot;
  density?: CmDensity;
  sidebarWidth?: string | number;
  collapsedSidebarWidth?: string | number;
  contentPadding?: CmAppShellContentPadding;
  height?: string | number;
  mobileSidebarOpen?: boolean;
  defaultMobileSidebarOpen?: boolean;
  onMobileSidebarOpenChange?: (open: boolean) => void;
  mobileMenuLabel?: string;
  mobileCloseLabel?: string;
  contentClassName?: string;
  mainClassName?: string;
  /** Label of the keyboard-only link that moves focus into the main content. */
  skipLinkLabel?: string;
  contentId?: string;
  /** Changing this value resets the scroll of a persistent application content area. */
  contentKey?: string;
};

function renderSlot(slot: CmAppShellSlot | undefined, controls: CmAppShellControls) {
  return typeof slot === "function" ? slot(controls) : slot;
}

export function CmAppShell({
  children,
  chrome = "surface",
  backdrop = "plain",
  className,
  collapsedSidebarWidth,
  contentClassName,
  contentPadding,
  contentId,
  contentKey,
  defaultMobileSidebarOpen = false,
  density,
  height,
  footer,
  mainClassName,
  mobileCloseLabel = "Fechar menu",
  mobileMenuLabel = "Abrir menu",
  mobileSidebarOpen,
  onMobileSidebarOpenChange,
  sidebar,
  sidebarWidth,
  style,
  skipLinkLabel,
  topbar,
  ...props
}: CmAppShellProps) {
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(defaultMobileSidebarOpen);
  const isMobileOpen = mobileSidebarOpen ?? uncontrolledMobileOpen;
  const hasSidebar = Boolean(sidebar);
  const generatedId = useId();
  const mainId = contentId ?? `cm-main-${generatedId}`;
  const drawerId = `cm-menu-${generatedId}`;
  const drawerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousContentKey = useRef(contentKey);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (previousContentKey.current !== contentKey && contentKey !== undefined && mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    previousContentKey.current = contentKey;
  }, [contentKey]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobileViewport(media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const setMobileOpen = useCallback(
    (open: boolean) => {
      if (mobileSidebarOpen === undefined) {
        setUncontrolledMobileOpen(open);
      }
      onMobileSidebarOpenChange?.(open);
    },
    [mobileSidebarOpen, onMobileSidebarOpenChange],
  );

  const closeMobileSidebar = useCallback(() => setMobileOpen(false), [setMobileOpen]);
  const openMobileSidebar = useCallback(() => setMobileOpen(true), [setMobileOpen]);
  const toggleMobileSidebar = useCallback(
    () => setMobileOpen(!isMobileOpen),
    [isMobileOpen, setMobileOpen],
  );
  const modalOpen = hasSidebar && isMobileOpen && isMobileViewport;
  useEscapeKey(modalOpen, closeMobileSidebar);
  useFocusTrap(drawerRef, { enabled: modalOpen });
  useScrollLock(modalOpen);

  const mobileMenuButton = hasSidebar ? (
    <CmButton
      unstyled
      type="button"
      className="cm-app-shell__mobile-menu-button"
      aria-label={mobileMenuLabel}
      aria-expanded={isMobileOpen}
      aria-controls={drawerId}
      onClick={toggleMobileSidebar}
    >
      <Menu size={18} aria-hidden="true" />
    </CmButton>
  ) : null;

  const controls: CmAppShellControls = {
    closeMobileSidebar,
    mobileMenuButton,
    mobileSidebarOpen: isMobileOpen,
    openMobileSidebar,
    toggleMobileSidebar,
  };

  const shellStyle: CmAppShellStyle = {
    ...(sidebarWidth ? { "--cm-app-shell-sidebar-width": cmSizeValue(sidebarWidth) } : {}),
    ...(collapsedSidebarWidth
      ? { "--cm-app-shell-sidebar-collapsed-width": cmSizeValue(collapsedSidebarWidth) }
      : {}),
    ...(height ? { "--cm-app-shell-height": cmSizeValue(height) } : {}),
    ...(contentPadding !== undefined
      ? { "--cm-app-shell-content-padding": cmSpacingValue(contentPadding) ?? "0" }
      : {}),
    ...style,
  };

  const renderSidebarContent = () => renderSlot(sidebar, controls);

  return (
    <div
      className={cn(
        "cm-app-shell",
        `cm-app-shell--chrome-${chrome}`,
        `cm-app-shell--backdrop-${backdrop}`,
        !hasSidebar && "cm-app-shell--no-sidebar",
        isMobileOpen && "cm-app-shell--mobile-open",
        cmDensityClass(density),
        className,
      )}
      style={shellStyle}
      data-cm-chrome={chrome}
      // Density cascades to descendants through the `[data-density] .cm-*`
      // selectors — the cm-density-* class alone only styles the element it
      // sits on, so the shell also publishes the attribute.
      data-density={density === "default" ? undefined : density}
      {...props}
    >
      {skipLinkLabel ? (
        <a
          href={`#${mainId}`}
          className="cm-app-shell__skip-link"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus({ preventScroll: true });
          }}
        >
          {skipLinkLabel}
        </a>
      ) : null}
      {hasSidebar ? (
        <aside className="cm-app-shell__sidebar" inert={modalOpen}>
          {renderSidebarContent()}
        </aside>
      ) : null}

      {hasSidebar ? (
        <div className="cm-app-shell__mobile-layer" aria-hidden={!modalOpen} inert={!modalOpen}>
          <CmButton
            unstyled
            type="button"
            className="cm-app-shell__mobile-backdrop"
            aria-label={mobileCloseLabel}
            onClick={closeMobileSidebar}
          />
          <aside
            ref={drawerRef}
            id={drawerId}
            className="cm-app-shell__mobile-drawer"
            role="dialog"
            aria-modal={modalOpen || undefined}
            aria-label="Menu"
            tabIndex={-1}
          >
            <CmButton
              unstyled
              type="button"
              className="cm-app-shell__mobile-close"
              aria-label={mobileCloseLabel}
              onClick={closeMobileSidebar}
            >
              <X size={18} aria-hidden="true" />
            </CmButton>
            {renderSidebarContent()}
          </aside>
        </div>
      ) : null}

      <div className={cn("cm-app-shell__main", mainClassName)} inert={modalOpen}>
        {topbar ? (
          <div className="cm-app-shell__topbar">{renderSlot(topbar, controls)}</div>
        ) : hasSidebar ? (
          <div className="cm-app-shell__mobile-topbar">{mobileMenuButton}</div>
        ) : null}
        <main
          ref={mainRef}
          id={mainId}
          tabIndex={-1}
          className={cn("cm-app-shell__content", contentClassName)}
        >
          {children}
        </main>
        {footer ? (
          <footer className="cm-app-shell__footer">{renderSlot(footer, controls)}</footer>
        ) : null}
      </div>
    </div>
  );
}
CmAppShell.displayName = "CmAppShell";
