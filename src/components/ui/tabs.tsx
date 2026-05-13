"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils.js";

type TabsVariant = "default" | "modal" | "folder";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
}

export function CmTabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
  variant = "default",
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const currentValue = value ?? internal;
  const handleChange = onValueChange ?? setInternal;

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleChange, variant }}
    >
      <div
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
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function CmTabsList({ children, className }: TabsListProps) {
  const context = useContext(TabsContext);
  const variant = context?.variant ?? "default";

  return (
    <div
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
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CmTabsTrigger({
  value,
  children,
  className,
  disabled,
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("CmTabsTrigger must be used within CmTabs");

  const isActive = context.value === value;

  return (
    <button
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
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  /** When true, unmounts content when tab is inactive (default: false — keeps mounted but hidden) */
  unmountOnHide?: boolean;
}

export function CmTabsContent({
  value,
  children,
  className,
  unmountOnHide = false,
}: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("CmTabsContent must be used within CmTabs");

  const isActive = context.value === value;

  if (!isActive && unmountOnHide) return null;

  return (
    <div
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
}
