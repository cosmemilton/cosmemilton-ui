"use client";

import {
  createContext,
  ReactNode,
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

type ToastOptions = {
  tone?: CmToastTone;
  duration?: number;
  title?: string;
};

type ToastItem = {
  id: number;
  title?: string;
  message: string;
  tone: CmToastTone;
  duration: number;
};

type ToastContextValue = {
  toast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useCmToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useCmToast must be used within <CmToastProvider>");
  return ctx;
}

export type CmToastNoticeProps = {
  title?: string;
  description?: string;
  tone?: CmToastTone;
  duration?: number;
  className?: string;
  action?: ReactNode;
};

export function CmToastNotice({ title, description, tone = "info", duration }: CmToastNoticeProps) {
  const { toast } = useCmToast();

  useEffect(() => {
    const message = description ?? title;
    if (!message) return;

    toast(message, {
      duration,
      title: description ? title : undefined,
      tone,
    });
  }, [description, duration, title, toast, tone]);

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

function ToastSlot({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // animate in
    requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(item.id), 300);
    }, item.duration);
    return () => clearTimeout(timerRef.current);
  }, [item.id, item.duration, onDismiss]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onDismiss(item.id), 300);
  };

  return (
    <div
      role="alert"
      className={cn(
        "cm-toast__item",
        toneClasses[item.tone],
        visible ? "cm-toast__item--visible" : "cm-toast__item--hidden",
      )}
    >
      {icons[item.tone] && <span className="cm-toast__icon">{icons[item.tone]}</span>}
      <span className="cm-toast__content">
        {item.title ? <strong className="cm-toast__title">{item.title}</strong> : null}
        <span
          className={cn("cm-toast__message", item.title ? "cm-toast__message--with-title" : "")}
        >
          {item.message}
        </span>
      </span>
      <CmButton
        unstyled
        type="button"
        onClick={handleClose}
        className="cm-toast__close"
        aria-label="Fechar"
      >
        ✕
      </CmButton>
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
  const recentToastRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, options?: ToastOptions) => {
    const key = `${options?.tone ?? "default"}|${options?.title ?? ""}|${message}`;
    const now = Date.now();
    const recent = recentToastRef.current;

    if (recent?.key === key && now - recent.at < 1000) return;

    recentToastRef.current = { key, at: now };
    const id = ++nextId.current;
    setToasts((prev) => [
      ...prev,
      {
        id,
        title: options?.title,
        message,
        tone: options?.tone ?? "default",
        duration: options?.duration ?? 5000,
      },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={cn("cm-toast__viewport", `cm-toast__viewport--${position}`)}
            data-position={position}
          >
            {toasts.map((t) => (
              <ToastSlot key={t.id} item={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
CmToastProvider.displayName = "CmToastProvider";
