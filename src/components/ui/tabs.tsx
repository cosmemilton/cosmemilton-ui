"use client";

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";

type TabsVariant = "default" | "modal" | "folder";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface CmTabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
}

export const CmTabs = forwardRef<HTMLDivElement, CmTabsProps>(function CmTabs(
  { value, defaultValue, onValueChange, children, className, variant = "default" },
  ref,
) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const currentValue = value ?? internal;
  const handleChange = onValueChange ?? setInternal;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange, variant }}>
      <div
        ref={ref}
        className={cn(
          "cm-tabs",
          variant === "modal" && "cm-tabs--modal",
          variant === "folder" && "cm-tabs--folder",
          className,
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
CmTabs.displayName = "CmTabs";

export interface CmTabsListProps {
  children: React.ReactNode;
  className?: string;
  /** Exibe controles laterais automaticamente quando as abas não couberem. Padrão: true. */
  showScrollButtons?: boolean;
}

export const CmTabsList = forwardRef<HTMLDivElement, CmTabsListProps>(function CmTabsList(
  { children, className, showScrollButtons = true },
  forwardedRef,
) {
  const context = useContext(TabsContext);
  const variant = context?.variant ?? "default";
  const shellRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const manualScrollRevision = useRef(0);
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    canScrollBack: false,
    canScrollForward: false,
  });

  useImperativeHandle(forwardedRef, () => listRef.current as HTMLDivElement);

  const updateScrollState = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);
    // Check against the full shell, before space is reserved for the controls.
    // Otherwise the controls themselves could keep overflow enabled after a resize.
    const borderWidth = Math.max(0, list.offsetWidth - list.clientWidth);
    const availableWidth = (shellRef.current?.clientWidth || list.clientWidth) - borderWidth;
    const nextState = {
      hasOverflow: list.scrollWidth > availableWidth + 1,
      canScrollBack: list.scrollLeft > 1,
      canScrollForward: list.scrollLeft < maxScrollLeft - 1,
    };

    setScrollState((current) =>
      current.hasOverflow === nextState.hasOverflow &&
      current.canScrollBack === nextState.canScrollBack &&
      current.canScrollForward === nextState.canScrollForward
        ? current
        : nextState,
    );
  }, []);

  const scrollListTo = useCallback(
    (left: number, behavior: ScrollBehavior = "smooth") => {
      const list = listRef.current;
      if (!list) return;

      const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);
      const nextLeft = Math.min(Math.max(0, left), maxScrollLeft);
      if (Math.abs(list.scrollLeft - nextLeft) <= 1) return;
      if (typeof list.scrollTo === "function") {
        list.scrollTo({ left: nextLeft, behavior });
      } else {
        list.scrollLeft = nextLeft;
        updateScrollState();
      }
    },
    [updateScrollState],
  );

  const ensureActiveTabVisible = useCallback(
    (behavior: ScrollBehavior = "instant") => {
      const list = listRef.current;
      const activeTab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!list || !activeTab || list.clientWidth <= 0) return;

      // The positioned list makes these offsets relative to its scrollable area.
      const tabStart = activeTab.offsetLeft;
      const tabEnd = tabStart + activeTab.offsetWidth;
      if (activeTab.offsetWidth > list.clientWidth || tabStart < list.scrollLeft) {
        scrollListTo(tabStart, behavior);
      } else if (tabEnd > list.scrollLeft + list.clientWidth) {
        scrollListTo(tabEnd - list.clientWidth, behavior);
      }
    },
    [scrollListTo],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateLayout = () => {
      updateScrollState();
      ensureActiveTabVisible();
    };
    const initialScrollRevision = manualScrollRevision.current;
    const frame = window.requestAnimationFrame(() => {
      updateScrollState();
      // Initial measurement may arrive after an arrow click. It must not undo
      // that newer scroll intent; actual resize/selection updates still reveal
      // the selected tab through their own layout handlers.
      if (manualScrollRevision.current === initialScrollRevision) ensureActiveTabVisible();
    });
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateLayout);
    resizeObserver?.observe(list);
    if (shellRef.current) resizeObserver?.observe(shellRef.current);
    const observedChildren = new Set<Element>();
    const observeChildren = () => {
      const currentChildren = new Set(Array.from(list.children));
      observedChildren.forEach((child) => {
        if (!currentChildren.has(child)) {
          resizeObserver?.unobserve(child);
          observedChildren.delete(child);
        }
      });
      currentChildren.forEach((child) => {
        if (!observedChildren.has(child)) {
          resizeObserver?.observe(child);
          observedChildren.add(child);
        }
      });
    };
    observeChildren();

    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      updateLayout();
    });
    mutationObserver.observe(list, { childList: true, subtree: true, characterData: true });

    // Scrolling with an arrow should not pull the list back to the selected tab.
    list.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateLayout);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      list.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateLayout);
    };
  }, [updateScrollState, ensureActiveTabVisible]);

  const scrollByPage = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    manualScrollRevision.current += 1;
    const distance = Math.max(160, list.clientWidth * 0.7);
    scrollListTo(list.scrollLeft + distance * direction);
  };

  useEffect(() => {
    ensureActiveTabVisible("smooth");
  }, [context?.value, ensureActiveTabVisible]);

  useEffect(() => {
    ensureActiveTabVisible();
  }, [scrollState.hasOverflow, showScrollButtons, ensureActiveTabVisible]);

  const showControls = showScrollButtons && scrollState.hasOverflow;

  return (
    <div
      ref={shellRef}
      className={cn(
        "cm-tabs-list-shell",
        variant === "modal" && "cm-tabs-list-shell--modal",
        variant === "folder" && "cm-tabs-list-shell--folder",
      )}
    >
      {showControls ? (
        <CmButton
          unstyled
          type="button"
          className="cm-tabs-scroll-button cm-tabs-scroll-button--back"
          aria-label="Rolar abas para a esquerda"
          aria-hidden={!scrollState.canScrollBack}
          disabled={!scrollState.canScrollBack}
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </CmButton>
      ) : null}

      <div
        ref={listRef}
        className={cn(
          "cm-tabs-list",
          variant === "modal" && "cm-tabs-list--modal",
          variant === "folder" && "cm-tabs-list--folder",
          className,
        )}
        role="tablist"
      >
        {children}
      </div>

      {showControls ? (
        <CmButton
          unstyled
          type="button"
          className="cm-tabs-scroll-button cm-tabs-scroll-button--forward"
          aria-label="Rolar abas para a direita"
          aria-hidden={!scrollState.canScrollForward}
          disabled={!scrollState.canScrollForward}
          onClick={() => scrollByPage(1)}
        >
          <ChevronRight aria-hidden="true" />
        </CmButton>
      ) : null}
    </div>
  );
});
CmTabsList.displayName = "CmTabsList";

export interface CmTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const CmTabsTrigger = forwardRef<HTMLButtonElement, CmTabsTriggerProps>(
  function CmTabsTrigger({ value, children, className, disabled }, ref) {
    const context = useContext(TabsContext);
    if (!context) throw new Error("CmTabsTrigger must be used within CmTabs");

    const isActive = context.value === value;

    return (
      <CmButton
        ref={ref}
        unstyled
        type="button"
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        className={cn(
          "cm-tabs-trigger",
          isActive && "cm-tabs-trigger-active",
          context.variant === "modal" && "cm-tabs-trigger--modal",
          context.variant === "folder" && "cm-tabs-trigger--folder",
          className,
        )}
        onClick={() => context.onValueChange(value)}
      >
        {children}
      </CmButton>
    );
  },
);
CmTabsTrigger.displayName = "CmTabsTrigger";

export interface CmTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  /** When true, unmounts content when tab is inactive (default: false — keeps mounted but hidden) */
  unmountOnHide?: boolean;
}

export const CmTabsContent = forwardRef<HTMLDivElement, CmTabsContentProps>(function CmTabsContent(
  { value, children, className, unmountOnHide = false },
  ref,
) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("CmTabsContent must be used within CmTabs");

  const isActive = context.value === value;

  if (!isActive && unmountOnHide) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      hidden={!isActive}
      className={cn(
        "cm-tabs-content",
        context.variant === "modal" && "cm-tabs-content--modal",
        context.variant === "folder" && "cm-tabs-content--folder",
        className,
      )}
    >
      {children}
    </div>
  );
});
CmTabsContent.displayName = "CmTabsContent";
