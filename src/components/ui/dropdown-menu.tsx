"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { CmButton } from "./button.js";
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

export type CmDropdownMenuItem = CmDropdownMenuActionItem | CmDropdownMenuSeparatorItem;

export type CmDropdownMenuProps = {
  trigger: (controls: {
    open: boolean;
    toggle: () => void;
    ref: (element: HTMLButtonElement | null) => void;
    /** Passe ao botão para abrir o menu com ArrowDown quando a navegação está habilitada. */
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  }) => ReactNode;
  items: CmDropdownMenuItem[];
  header?: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  /** Fecha com Escape e devolve o foco ao trigger quando habilitado. */
  dismissOnEscape?: boolean;
  /** Gerencia foco e navegação por teclado dentro do menu. */
  keyboardNavigation?: boolean;
};

function enabledMenuItems(menu: HTMLDivElement) {
  return Array.from(
    menu.querySelectorAll<HTMLButtonElement>(':scope > button[role="menuitem"]:enabled'),
  );
}

export function CmDropdownMenu({
  trigger,
  items,
  header,
  align,
  className,
  dismissOnEscape = false,
  keyboardNavigation = false,
}: CmDropdownMenuProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const focusMenu = useCallback((menu: HTMLDivElement | null) => {
    if (menu) (enabledMenuItems(menu)[0] ?? menu).focus({ preventScroll: true });
  }, []);

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>, close: () => void) {
    if (event.defaultPrevented) return;
    if (event.key === "Tab") {
      close();
      // Move out of the portal before the browser advances sequential focus.
      triggerRef.current?.focus({ preventScroll: true });
      return;
    }

    const buttons = enabledMenuItems(event.currentTarget);
    if (!buttons.length) return;

    const current = buttons.findIndex((button) => button === event.target);
    let next: HTMLButtonElement | undefined;
    if (event.key === "Home") next = buttons[0];
    if (event.key === "End") next = buttons[buttons.length - 1];
    if (event.key === "ArrowDown") next = buttons[(current + 1) % buttons.length];
    if (event.key === "ArrowUp") next = buttons[current <= 0 ? buttons.length - 1 : current - 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return (
    <CmPopover
      align={align}
      dismissOnEscape={dismissOnEscape || keyboardNavigation}
      trigger={(controls) =>
        trigger(
          keyboardNavigation
            ? {
                ...controls,
                ref: (element) => {
                  triggerRef.current = element;
                  controls.ref(element);
                },
                onKeyDown: (event) => {
                  if (!controls.open && !event.defaultPrevented && event.key === "ArrowDown") {
                    event.preventDefault();
                    controls.toggle();
                  }
                },
              }
            : controls,
        )
      }
      className={cn("cm-dropdown-menu__popover", className)}
    >
      {({ close }) => (
        <div
          ref={keyboardNavigation ? focusMenu : undefined}
          className="cm-dropdown-menu"
          role="menu"
          tabIndex={keyboardNavigation ? -1 : undefined}
          onKeyDown={keyboardNavigation ? (event) => handleMenuKeyDown(event, close) : undefined}
        >
          {header}
          {items.map((item) => {
            if (item.type === "separator") {
              return (
                <CmSeparator key={item.id} spacing="xs" className="cm-dropdown-menu__separator" />
              );
            }

            return (
              <CmButton
                unstyled
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                tabIndex={keyboardNavigation ? -1 : undefined}
                title={item.title}
                className={cn(
                  "cm-dropdown-menu__item",
                  item.danger
                    ? "cm-dropdown-menu__item--danger"
                    : "cm-dropdown-menu__item--default",
                )}
                onClick={() => {
                  if (item.disabled) return;
                  if (keyboardNavigation) triggerRef.current?.focus({ preventScroll: true });
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
              </CmButton>
            );
          })}
        </div>
      )}
    </CmPopover>
  );
}
CmDropdownMenu.displayName = "CmDropdownMenu";
