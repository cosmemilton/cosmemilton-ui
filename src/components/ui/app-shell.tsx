"use client";

import { Menu, X } from "lucide-react";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import {
  cmDensityClass,
  cmSizeValue,
  cmSpacingValue,
  type CmDensity,
  type CmSpacing,
} from "./types.js";

export type CmAppShellChrome = "surface" | "inverted";

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
};

function renderSlot(slot: CmAppShellSlot | undefined, controls: CmAppShellControls) {
  return typeof slot === "function" ? slot(controls) : slot;
}

export function CmAppShell({
  children,
  chrome = "surface",
  className,
  collapsedSidebarWidth,
  contentClassName,
  contentPadding,
  defaultMobileSidebarOpen = false,
  density,
  height,
  mainClassName,
  mobileCloseLabel = "Fechar menu",
  mobileMenuLabel = "Abrir menu",
  mobileSidebarOpen,
  onMobileSidebarOpenChange,
  sidebar,
  sidebarWidth,
  style,
  topbar,
  ...props
}: CmAppShellProps) {
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(defaultMobileSidebarOpen);
  const isMobileOpen = mobileSidebarOpen ?? uncontrolledMobileOpen;
  const hasSidebar = Boolean(sidebar);

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

  const mobileMenuButton = hasSidebar ? (
    <CmButton
      unstyled
      type="button"
      className="cm-app-shell__mobile-menu-button"
      aria-label={mobileMenuLabel}
      aria-expanded={isMobileOpen}
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
      {hasSidebar ? (
        <aside className="cm-app-shell__sidebar">{renderSidebarContent()}</aside>
      ) : null}

      {hasSidebar ? (
        <div className="cm-app-shell__mobile-layer" aria-hidden={!isMobileOpen}>
          <CmButton
            unstyled
            type="button"
            className="cm-app-shell__mobile-backdrop"
            aria-label={mobileCloseLabel}
            onClick={closeMobileSidebar}
          />
          <aside className="cm-app-shell__mobile-drawer" aria-label="Menu">
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

      <div className={cn("cm-app-shell__main", mainClassName)}>
        {topbar ? (
          <div className="cm-app-shell__topbar">{renderSlot(topbar, controls)}</div>
        ) : hasSidebar ? (
          <div className="cm-app-shell__mobile-topbar">{mobileMenuButton}</div>
        ) : null}
        <main className={cn("cm-app-shell__content", contentClassName)}>{children}</main>
      </div>
    </div>
  );
}
CmAppShell.displayName = "CmAppShell";
