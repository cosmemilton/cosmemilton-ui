"use client";

import React, { createContext, forwardRef, useContext, useState } from "react";
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
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleChange, variant }}
    >
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
}

export const CmTabsList = forwardRef<HTMLDivElement, CmTabsListProps>(
  function CmTabsList({ children, className }, ref) {
  const context = useContext(TabsContext);
  const variant = context?.variant ?? "default";

  return (
    <div
      ref={ref}
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
});
CmTabsTrigger.displayName = "CmTabsTrigger";

export interface CmTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  /** When true, unmounts content when tab is inactive (default: false — keeps mounted but hidden) */
  unmountOnHide?: boolean;
}

export const CmTabsContent = forwardRef<HTMLDivElement, CmTabsContentProps>(
  function CmTabsContent({ value, children, className, unmountOnHide = false }, ref) {
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
