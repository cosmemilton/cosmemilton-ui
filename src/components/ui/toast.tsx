"use client";

import {
  createContext,
  ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import type { CmFeedbackTone } from "./types.js";

export type CmToastTone = CmFeedbackTone;

export type CmToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type CmToastOptions = {
  tone?: CmToastTone;
  /** Zero keeps the notice visible until explicitly dismissed. */
  duration?: number;
  title?: string;
  className?: string;
  action?: ReactNode;
  /** Blocks actions, dismissal and the countdown while an operation is pending. */
  processing?: boolean;
  /** Opt in to moving focus into this notice and restoring it on dismissal. */
  autoFocus?: boolean;
  onDismiss?: () => void;
  /** Call preventDefault() to keep the notice open. Escape never reaches an ancestor. */
  onEscapeKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

type ToastItem = CmToastOptions & {
  id: number;
  message: string;
  tone: CmToastTone;
  duration: number;
};

type ToastContextValue = {
  toast: (message: string, options?: CmToastOptions) => number;
  dismiss: (id: number) => void;
  update: (id: number, options: CmToastOptions) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useCmToast must be used within <CmToastProvider>");
  return ctx;
}

export function useCmToast() {
  const { toast, update, dismiss } = useToastContext();
  return { toast, update, dismiss };
}

export type CmToastNoticeProps = CmToastOptions & {
  description?: string;
};

export function CmToastNotice({ description, ...options }: CmToastNoticeProps) {
  const { toast, update, remove } = useToastContext();
  const id = useRef<number | null>(null);
  const latest = useRef(options);
  latest.current = options;
  const message = description ?? options.title;

  useEffect(() => {
    if (!message) return;
    id.current = toast(message, {
      ...latest.current,
      title: description ? latest.current.title : undefined,
      tone: latest.current.tone ?? "info",
    });
    return () => {
      if (id.current !== null) remove(id.current);
      id.current = null;
    };
  }, [message, description, toast, remove]);

  useEffect(() => {
    if (id.current !== null) {
      update(id.current, {
        ...latest.current,
        title: description ? latest.current.title : undefined,
        tone: latest.current.tone ?? "info",
      });
    }
  }, [
    update,
    description,
    options.title,
    options.tone,
    options.duration,
    options.className,
    options.action,
    options.processing,
    options.autoFocus,
    options.onDismiss,
    options.onEscapeKeyDown,
  ]);
  return null;
}
CmToastNotice.displayName = "CmToastNotice";

const toneClasses: Record<CmToastTone, string> = {
  default: "cm-toast__item--default",
  success: "cm-toast__item--success",
  warning: "cm-toast__item--warning",
  danger: "cm-toast__item--danger",
  info: "cm-toast__item--info",
};

const icons: Record<CmToastTone, string> = {
  default: "",
  success: "✓",
  warning: "⚠",
  danger: "✕",
  info: "ℹ",
};

function ToastSlot({
  item,
  onCloseStart,
  onDismiss,
}: {
  item: ToastItem;
  onCloseStart: (id: number) => void;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const remainingRef = useRef(item.duration);
  const resumedAtRef = useRef(0);
  const closingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestItem = useRef(item);
  latestItem.current = item;
  const paused = hovered || focusWithin || item.processing;

  useEffect(() => {
    if (!item.autoFocus) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = rootRef.current;
    (
      root?.querySelector<HTMLElement>("button:not([disabled]), [href], [tabindex='0']") ?? root
    )?.focus();
    return () => {
      if (
        (root?.contains(document.activeElement) || document.activeElement === document.body) &&
        previous?.isConnected
      )
        previous.focus();
    };
  }, [item.autoFocus]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleClose = useCallback(() => {
    if (closingRef.current || latestItem.current.processing) return;
    closingRef.current = true;
    onCloseStart(item.id);
    clearTimeout(timerRef.current);
    setVisible(false);
    closeTimer.current = setTimeout(() => onDismiss(item.id), 300);
  }, [item.id, onCloseStart, onDismiss]);

  useEffect(() => {
    // animate in
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    remainingRef.current = item.duration;
  }, [item.duration]);

  // Timer pausável: cada retomada agenda só o tempo restante e a pausa
  // (cleanup) desconta o que correu desde a última retomada.
  useEffect(() => {
    if (paused || closingRef.current || item.duration <= 0) return;
    resumedAtRef.current = Date.now();
    timerRef.current = setTimeout(handleClose, remainingRef.current);
    return () => {
      clearTimeout(timerRef.current);
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - resumedAtRef.current),
      );
    };
  }, [handleClose, paused, item.duration]);

  return (
    // Escape bubbles from interactive descendants; the alert itself remains non-modal.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={rootRef}
      tabIndex={-1}
      role="alert"
      aria-busy={item.processing || undefined}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        item.onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) handleClose();
      }}
      onClickCapture={(event) => {
        if (item.processing || closingRef.current) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      className={cn(
        "cm-toast__item",
        item.className,
        toneClasses[item.tone],
        visible ? "cm-toast__item--visible" : "cm-toast__item--hidden",
      )}
      data-paused={paused || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
    >
      {icons[item.tone] && <span className="cm-toast__icon">{icons[item.tone]}</span>}
      <div className="cm-toast__content">
        {item.title ? <strong className="cm-toast__title">{item.title}</strong> : null}
        <span
          className={cn("cm-toast__message", item.title ? "cm-toast__message--with-title" : "")}
        >
          {item.message}
        </span>
        {item.action != null && (
          <fieldset className="cm-toast__actions" disabled={item.processing}>
            {item.action}
          </fieldset>
        )}
      </div>
      <CmButton
        unstyled
        type="button"
        onClick={handleClose}
        className="cm-toast__close"
        aria-label="Fechar"
        disabled={item.processing}
      >
        ✕
      </CmButton>
      {item.duration > 0 && (
        <span
          className="cm-toast__progress"
          style={{ animationDuration: `${item.duration}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export type CmToastProviderProps = {
  children: ReactNode;
  /** Cantos/eixos onde a pilha de toasts é ancorada. Padrão: `"bottom-right"`. */
  position?: CmToastPosition;
};

export function CmToastProvider({ children, position = "bottom-right" }: CmToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);
  const recentToastRef = useRef<{ id: number; key: string; at: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const itemsRef = useRef<ToastItem[]>([]);
  const remove = useCallback((id: number) => {
    if (recentToastRef.current?.id === id) recentToastRef.current = null;
    itemsRef.current = itemsRef.current.filter((entry) => entry.id !== id);
    setToasts(itemsRef.current);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      remove(id);
      item?.onDismiss?.();
    },
    [remove],
  );

  const update = useCallback((id: number, options: CmToastOptions) => {
    itemsRef.current = itemsRef.current.map((item) =>
      item.id === id
        ? {
            ...item,
            ...options,
            duration: options.duration ?? item.duration,
            tone: options.tone ?? item.tone,
          }
        : item,
    );
    setToasts(itemsRef.current);
  }, []);

  const releaseRecentToast = useCallback((id: number) => {
    // Uma nova tentativa já pode notificar durante a animação de saída.
    // Fechar um toast anterior não libera a deduplicação de outro mais recente.
    if (recentToastRef.current?.id === id) recentToastRef.current = null;
  }, []);

  const toast = useCallback((message: string, options?: CmToastOptions) => {
    const key = `${options?.tone ?? "default"}|${options?.title ?? ""}|${message}`;
    const now = Date.now();
    const recent = recentToastRef.current;

    // Confirmations with different actions must never share an imperative handle.
    if (options?.action == null && recent?.key === key && now - recent.at < 1000) return recent.id;

    const id = ++nextId.current;
    recentToastRef.current = options?.action == null ? { id, key, at: now } : null;
    itemsRef.current = [
      ...itemsRef.current,
      {
        ...options,
        id,
        title: options?.title,
        message,
        tone: options?.tone ?? "default",
        duration: options?.duration ?? 5000,
      },
    ];
    setToasts(itemsRef.current);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast, update, dismiss, remove }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={cn("cm-toast__viewport", `cm-toast__viewport--${position}`)}
            data-position={position}
          >
            {toasts.map((t) => (
              <ToastSlot
                key={t.id}
                item={t}
                onCloseStart={releaseRecentToast}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
CmToastProvider.displayName = "CmToastProvider";
