"use client";

import { ReactNode } from "react";
import { CmPopover } from "./popover";
import { cn } from "../../lib/utils";

type DropdownMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
};

type DropdownMenuProps = {
  trigger: (controls: { open: boolean; toggle: () => void; ref: (element: HTMLButtonElement | null) => void }) => ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "center" | "end";
  className?: string;
};

export function CmDropdownMenu({ trigger, items, align, className }: DropdownMenuProps) {
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
          {items.map((item) => (
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
          ))}
        </div>
      )}
    </CmPopover>
  );
}
