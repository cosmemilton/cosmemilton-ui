"use client";

import type { ReactNode } from "react";
import { CmPopover } from "./popover.js";
import { CmSeparator } from "./separator.js";
import { cn } from "../../lib/utils.js";

export type CmDropdownMenuActionItem = {
  type?: "item";
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
};

export type CmDropdownMenuSeparatorItem = {
  type: "separator";
  id: string;
};

export type CmDropdownMenuItem =
  | CmDropdownMenuActionItem
  | CmDropdownMenuSeparatorItem;

export type CmDropdownMenuProps = {
  trigger: (controls: {
    open: boolean;
    toggle: () => void;
    ref: (element: HTMLButtonElement | null) => void;
  }) => ReactNode;
  items: CmDropdownMenuItem[];
  header?: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
};

export function CmDropdownMenu({ trigger, items, header, align, className }: CmDropdownMenuProps) {
  return (
    <CmPopover
      align={align}
      trigger={(controls) =>
        trigger({
          ...controls,
        })
      }
      className={cn("cm-dropdown-menu__popover", className)}
    >
      {({ close }) => (
        <div className="cm-dropdown-menu" role="menu">
          {header}
          {items.map((item) => {
            if (item.type === "separator") {
              return (
                <CmSeparator
                  key={item.id}
                  spacing="xs"
                  className="cm-dropdown-menu__separator"
                />
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                title={item.title}
                className={cn(
                  "cm-dropdown-menu__item",
                  item.danger
                    ? "cm-dropdown-menu__item--danger"
                    : "cm-dropdown-menu__item--default",
                )}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect?.();
                  close();
                }}
              >
                <span className="cm-dropdown-menu__label">
                  {item.icon}
                  {item.label}
                </span>
                {item.shortcut ? (
                  <span className="cm-dropdown-menu__shortcut">{item.shortcut}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </CmPopover>
  );
}
