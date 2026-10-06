"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ElementType,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useClickOutside } from "../../hooks/use-click-outside.js";
import { useControllableState } from "../../hooks/use-controllable-state.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useMegaPanel } from "../../hooks/use-mega-panel.js";
import { CmButton } from "./button.js";
import { MegaMenuPanel } from "./mega-menu-panel.js";
import { CmPortal } from "./portal.js";
import type { CmMegaMenuGroup, CmMegaMenuLink } from "./mega-menu.js";

export type CmMegaMenuSearchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "defaultValue" | "onSelect" | "size" | "type" | "value"
> & {
  groups: CmMegaMenuGroup[];
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Notification after selection. An item's onSelect action takes precedence over its href. */
  onSelect?: (item: CmMegaMenuLink) => void;
  /** Accessible search name when aria-label or aria-labelledby is not supplied. */
  title?: string;
  emptyMessage?: ReactNode;
  keyboardShortcut?: string;
  size?: "sm" | "md" | "lg";
  columns?: 1 | 2 | 3 | 4;
  panelWidth?: string | number;
  align?: "start" | "center" | "end";
  /** Limits the displayed results across groups. Infinity displays every match. */
  maxResults?: number;
  footer?: ReactNode;
  inputClassName?: string;
  panelClassName?: string;
  type?: "search" | "text";
  linkComponent?: ElementType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
};

type SearchResult = { item: CmMegaMenuLink; optionId: string };
type SearchGroup = { group: CmMegaMenuGroup; groupId: string; results: SearchResult[] };

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

/** A real search input with grouped, non-modal results anchored below it. */
export const CmMegaMenuSearch = forwardRef<HTMLInputElement, CmMegaMenuSearchProps>(
  function CmMegaMenuSearch(
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      align = "center",
      autoComplete = "off",
      className,
      columns = 3,
      defaultOpen = false,
      defaultQuery = "",
      disabled,
      emptyMessage = "Nenhum resultado.",
      footer,
      groups,
      inputClassName,
      keyboardShortcut,
      linkComponent,
      maxResults = 32,
      onBlur,
      onChange,
      onClick,
      onCompositionEnd,
      onCompositionStart,
      onFocus,
      onKeyDown,
      onOpenChange,
      onQueryChange,
      onSelect,
      open: controlledOpen,
      panelClassName,
      panelWidth = 960,
      placeholder = "Buscar…",
      query: controlledQuery,
      size = "md",
      spellCheck = false,
      title = "Buscar",
      type = "search",
      ...inputProps
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const listId = `${generatedId}-results`;
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const isComposing = useRef(false);
    const suppressFocusOpen = useRef(false);
    const lastPointerPosition = useRef<{ x: number; y: number } | undefined>(undefined);
    const [query, setQuery] = useControllableState({
      value: controlledQuery,
      defaultValue: defaultQuery,
      onChange: onQueryChange,
    });
    const [open, setOpen] = useControllableState({
      value: controlledOpen,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const isOpen = open && !disabled;
    const [activeId, setActiveId] = useState<string | undefined>();

    const { matches, visibleGroups, visibleCount } = useMemo(() => {
      const tokens = normalizeSearch(query).trim().split(/\s+/u).filter(Boolean);
      const limit = Number.isFinite(maxResults) ? Math.max(0, Math.floor(maxResults)) : Infinity;
      let matches = 0;
      let visibleCount = 0;
      const visibleGroups: SearchGroup[] = [];
      groups.forEach((group, groupIndex) => {
        const results: SearchResult[] = [];
        group.items.forEach((item, itemIndex) => {
          const searchable = normalizeSearch(
            [group.label, item.label, item.description ?? "", ...(item.keywords ?? [])].join(" "),
          );
          if (!tokens.every((token) => searchable.includes(token))) return;
          matches += 1;
          if (visibleCount >= limit) return;
          results.push({ item, optionId: `${listId}-${groupIndex}-${itemIndex}` });
          visibleCount += 1;
        });
        if (results.length) {
          visibleGroups.push({ group, groupId: `${listId}-group-${groupIndex}`, results });
        }
      });
      return { matches, visibleGroups, visibleCount };
    }, [groups, listId, maxResults, query]);

    const enabledResults = useMemo(
      () => visibleGroups.flatMap((group) => group.results).filter(({ item }) => !item.disabled),
      [visibleGroups],
    );
    const activeResult =
      enabledResults.find((result) => result.optionId === activeId) ?? enabledResults[0];
    const resultCount = `${visibleCount} ${visibleCount === 1 ? "resultado" : "resultados"}${
      visibleCount < matches ? ` de ${matches}` : ""
    }`;

    const requestOpen = () => {
      if (!disabled && !open) {
        setActiveId(undefined);
        setOpen(true);
      }
    };
    const close = () => {
      if (open) setOpen(false);
    };
    const focusInput = () => {
      if (document.activeElement !== inputRef.current) suppressFocusOpen.current = true;
      inputRef.current?.focus({ preventScroll: true });
    };

    useMegaPanel(inputRef, panelRef, {
      enabled: isOpen,
      align,
      onPosition: () => {
        if (activeResult)
          document.getElementById(activeResult.optionId)?.scrollIntoView?.({ block: "nearest" });
      },
    });
    useClickOutside([rootRef, panelRef], close, isOpen);
    useEscapeKey(isOpen, (event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      close();
      focusInput();
    });

    useEffect(() => {
      setActiveId(undefined);
    }, [query]);

    useEffect(() => {
      if (!isOpen || !activeResult) return;
      document.getElementById(activeResult.optionId)?.scrollIntoView?.({ block: "nearest" });
    }, [activeResult, isOpen]);

    useEffect(() => {
      if (!keyboardShortcut || disabled) return;
      const handleShortcut = (event: globalThis.KeyboardEvent) => {
        if (
          event.defaultPrevented ||
          event.repeat ||
          event.altKey ||
          event.isComposing ||
          !(event.ctrlKey || event.metaKey) ||
          event.key.toLowerCase() !== keyboardShortcut.toLowerCase()
        )
          return;
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
        setOpen(true);
      };
      window.addEventListener("keydown", handleShortcut);
      return () => window.removeEventListener("keydown", handleShortcut);
    }, [disabled, keyboardShortcut, setOpen]);

    const selectResult = (item: CmMegaMenuLink, event: MouseEvent<HTMLElement>) => {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      // A callback action already owns navigation; the link's browser action must not run twice.
      if (item.onSelect) event.preventDefault();
      item.onSelect?.();
      onSelect?.(item);
      close();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        isComposing.current ||
        event.nativeEvent.isComposing ||
        event.keyCode === 229
      )
        return;
      if (event.key === "Tab") {
        close();
        return;
      }
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        close();
        return;
      }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        if (!isOpen && !event.key.startsWith("Arrow")) return;
        event.preventDefault();
        requestOpen();
        if (!enabledResults.length) return;
        const index = enabledResults.findIndex(
          (result) => result.optionId === activeResult?.optionId,
        );
        const nextIndex = !isOpen
          ? event.key === "ArrowUp"
            ? enabledResults.length - 1
            : 0
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? enabledResults.length - 1
              : event.key === "ArrowUp"
                ? (index - 1 + enabledResults.length) % enabledResults.length
                : (index + 1) % enabledResults.length;
        setActiveId(enabledResults[nextIndex].optionId);
        return;
      }
      if (event.key === "Enter" && isOpen && activeResult) {
        event.preventDefault();
        // Clicking the actual link preserves native targets and consumer routing adapters.
        document.getElementById(activeResult.optionId)?.click();
      }
    };

    return (
      <div ref={rootRef} className={cn("cm-mega-search", `cm-mega-search--${size}`, className)}>
        <Search aria-hidden="true" className="cm-mega-search__icon" />
        <input
          {...inputProps}
          ref={(element) => {
            inputRef.current = element;
            if (typeof forwardedRef === "function") forwardedRef(element);
            else if (forwardedRef) forwardedRef.current = element;
          }}
          type={type}
          role="combobox"
          className={cn("cm-mega-search__input", inputClassName)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          disabled={disabled}
          value={query}
          aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : title)}
          aria-labelledby={ariaLabelledBy}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={Boolean(isOpen)}
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={isOpen ? activeResult?.optionId : undefined}
          aria-keyshortcuts={
            keyboardShortcut ? `Control+${keyboardShortcut} Meta+${keyboardShortcut}` : undefined
          }
          onChange={(event) => {
            onChange?.(event);
            if (event.defaultPrevented) return;
            setQuery(event.target.value);
            setActiveId(undefined);
            requestOpen();
          }}
          onClick={(event) => {
            onClick?.(event);
            lastPointerPosition.current = { x: event.clientX, y: event.clientY };
            if (!event.defaultPrevented) requestOpen();
          }}
          onFocus={(event) => {
            onFocus?.(event);
            if (suppressFocusOpen.current) {
              suppressFocusOpen.current = false;
              return;
            }
            if (!event.defaultPrevented) requestOpen();
          }}
          onBlur={(event) => {
            onBlur?.(event);
            const target = event.relatedTarget as Node | null;
            if (target && !rootRef.current?.contains(target) && !panelRef.current?.contains(target))
              close();
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={(event) => {
            isComposing.current = true;
            onCompositionStart?.(event);
          }}
          onCompositionEnd={(event) => {
            isComposing.current = false;
            onCompositionEnd?.(event);
          }}
        />
        {keyboardShortcut ? (
          <kbd aria-hidden="true" className="cm-mega-search__shortcut">
            Ctrl {keyboardShortcut.toUpperCase()}
          </kbd>
        ) : null}
        <span className="cm-sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isOpen ? (matches ? resultCount : emptyMessage) : ""}
        </span>
        {isOpen ? (
          <CmPortal>
            <MegaMenuPanel
              ref={panelRef}
              width={panelWidth}
              columns={columns}
              className={cn("cm-mega-search__panel", panelClassName)}
              header={<span aria-hidden="true">{resultCount}</span>}
              footer={footer}
              bodyProps={{
                tabIndex: 0,
                role: "region",
                "aria-label": `Resultados de ${title}`,
              }}
              gridProps={{
                id: listId,
                role: "listbox",
                "aria-label": `Resultados: ${title}`,
                className: "cm-mega-search__results",
              }}
              onBlurCapture={(event) => {
                const target = event.relatedTarget as Node | null;
                if (
                  target &&
                  !rootRef.current?.contains(target) &&
                  !panelRef.current?.contains(target)
                )
                  close();
              }}
            >
              {visibleGroups.map(({ group, groupId, results }) => (
                <div
                  key={group.id}
                  className="cm-mega-panel__group"
                  role="group"
                  aria-label={group.label}
                >
                  <div id={groupId} className="cm-mega-panel__group-title" aria-hidden="true">
                    {group.icon}
                    {group.label}
                  </div>
                  {results.map(({ item, optionId }) => {
                    const content = (
                      <>
                        {item.icon ? (
                          <span className="cm-mega-panel__icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        ) : null}
                        <span className="cm-mega-panel__item-copy">
                          <span id={`${optionId}-label`} className="cm-mega-panel__label">
                            {item.label}
                          </span>
                          {item.description ? (
                            <span
                              id={`${optionId}-description`}
                              className="cm-mega-panel__description"
                            >
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                        {item.badge ? (
                          <span className="cm-mega-panel__badge">{item.badge}</span>
                        ) : null}
                      </>
                    );
                    const optionProps = {
                      id: optionId,
                      role: "option",
                      tabIndex: -1,
                      "aria-selected": activeResult?.optionId === optionId,
                      "aria-disabled": item.disabled || undefined,
                      "aria-labelledby": `${optionId}-label`,
                      "aria-describedby": item.description ? `${optionId}-description` : undefined,
                      "data-active": activeResult?.optionId === optionId ? "true" : undefined,
                      className: cn(
                        "cm-mega-panel__item",
                        activeResult?.optionId === optionId && "cm-mega-search__result--active",
                      ),
                      onMouseDown: (event: MouseEvent<HTMLElement>) => {
                        if (event.button === 0) event.preventDefault();
                      },
                      onMouseMove: (event: MouseEvent<HTMLElement>) => {
                        const previous = lastPointerPosition.current;
                        const { clientX: x, clientY: y } = event;
                        lastPointerPosition.current = { x, y };
                        // Keyboard scrolling may place a different result under a stationary pointer.
                        if (!item.disabled && (!previous || previous.x !== x || previous.y !== y))
                          setActiveId(optionId);
                      },
                      onClick: (event: MouseEvent<HTMLElement>) => selectResult(item, event),
                    };
                    if (item.href && !item.disabled) {
                      const LinkComponent: ElementType = linkComponent ?? "a";
                      return (
                        <LinkComponent
                          key={item.id}
                          {...optionProps}
                          href={item.href}
                          target={item.target}
                          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                        >
                          {content}
                        </LinkComponent>
                      );
                    }
                    return (
                      <CmButton
                        key={item.id}
                        {...optionProps}
                        unstyled
                        type="button"
                        disabled={item.disabled}
                      >
                        {content}
                      </CmButton>
                    );
                  })}
                </div>
              ))}
              {!visibleCount ? (
                <div
                  className="cm-mega-search__empty"
                  role="option"
                  aria-disabled="true"
                  aria-selected="false"
                >
                  {emptyMessage}
                </div>
              ) : null}
            </MegaMenuPanel>
          </CmPortal>
        ) : null}
      </div>
    );
  },
);
CmMegaMenuSearch.displayName = "CmMegaMenuSearch";
