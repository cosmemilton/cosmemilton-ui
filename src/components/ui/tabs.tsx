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
  const listRef = useRef<HTMLDivElement>(null);
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
    const nextState = {
      hasOverflow: maxScrollLeft > 1,
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

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const frame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateScrollState);
    resizeObserver?.observe(list);
    Array.from(list.children).forEach((child) => resizeObserver?.observe(child));

    const mutationObserver = new MutationObserver(updateScrollState);
    mutationObserver.observe(list, { childList: true, subtree: true, characterData: true });

    list.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      list.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children, updateScrollState]);

  const scrollListTo = useCallback(
    (left: number) => {
      const list = listRef.current;
      if (!list) return;

      const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);
      const nextLeft = Math.min(Math.max(0, left), maxScrollLeft);
      if (typeof list.scrollTo === "function") {
        list.scrollTo({ left: nextLeft, behavior: "smooth" });
      } else {
        list.scrollLeft = nextLeft;
        updateScrollState();
      }
    },
    [updateScrollState],
  );

  const scrollByPage = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    const distance = Math.max(160, list.clientWidth * 0.7);
    scrollListTo(list.scrollLeft + distance * direction);
  };

  useEffect(() => {
    const list = listRef.current;
    const activeTab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !activeTab || list.clientWidth <= 0) return;

    const tabStart = activeTab.offsetLeft;
    const tabEnd = tabStart + activeTab.offsetWidth;
    if (tabStart < list.scrollLeft) {
      scrollListTo(tabStart);
    } else if (tabEnd > list.scrollLeft + list.clientWidth) {
      scrollListTo(tabEnd - list.clientWidth);
    }
  }, [context?.value, scrollListTo]);

  const showBackButton = showScrollButtons && scrollState.hasOverflow && scrollState.canScrollBack;
  const showForwardButton =
    showScrollButtons && scrollState.hasOverflow && scrollState.canScrollForward;

  return (
    <div
      className={cn(
        "cm-tabs-list-shell",
        variant === "modal" && "cm-tabs-list-shell--modal",
        variant === "folder" && "cm-tabs-list-shell--folder",
      )}
    >
      {showBackButton ? (
        <CmButton
          unstyled
          type="button"
          className="cm-tabs-scroll-button cm-tabs-scroll-button--back"
          aria-label="Rolar abas para a esquerda"
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

      {showForwardButton ? (
        <CmButton
          unstyled
          type="button"
          className="cm-tabs-scroll-button cm-tabs-scroll-button--forward"
          aria-label="Rolar abas para a direita"
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
