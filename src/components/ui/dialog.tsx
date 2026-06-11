"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { X } from "lucide-react";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useScrollLock } from "../../hooks/use-scroll-lock.js";
import { useFocusTrap } from "../../hooks/use-focus-trap.js";
import { useCmTheme } from "../theme/theme-provider.js";
import { CmButton } from "./button.js";
import { CmPortal } from "./portal.js";
import type { CmDialogSize, CmFeedbackTone } from "./types.js";

export type { CmDialogSize } from "./types.js";
export type CmDialogTone = CmFeedbackTone;
export type CmDialogPresentation = "default" | "compact";

export interface CmDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: CmDialogSize;
  className?: string;
  tone?: CmDialogTone;
  portal?: boolean;
  presentation?: CmDialogPresentation;
  dismissible?: boolean;
  showClose?: boolean;
}

const sizeClasses: Record<CmDialogSize, string> = {
  sm: "cm-dialog__positioner--sm",
  md: "cm-dialog__positioner--md",
  lg: "cm-dialog__positioner--lg",
  xl: "cm-dialog__positioner--xl",
  "2xl": "cm-dialog__positioner--2xl",
};

const toneColorMap: Record<CmDialogTone, string> = {
  default: "var(--color-primary)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
  warning: "var(--color-warning)",
  info: "var(--color-info)",
};

type DialogToneStyle = CSSProperties & {
  "--dialog-tone": string;
};

type DialogPortalStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

const dialogPortalThemeVars = [
  "--color-card",
  "--color-card-foreground",
  "--color-background",
  "--color-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-border",
  "--color-ring",
  "--color-primary",
  "--color-primary-foreground",
  "--color-secondary",
  "--color-secondary-foreground",
  "--color-accent",
  "--color-accent-foreground",
  "--color-danger",
  "--color-danger-foreground",
  "--color-warning",
  "--color-warning-foreground",
  "--color-info",
  "--color-info-foreground",
  "--color-success",
  "--color-success-foreground",
  "--color-overlay",
  "--app-bg",
  "--app-bg-soft",
  "--app-surface",
  "--app-surface-strong",
  "--app-primary",
  "--app-orange",
  "--app-green",
  "--app-blue",
  "--app-pink",
  "--app-line",
  "--app-line-strong",
  "--app-ink",
  "--app-muted",
  "--radius-md",
  "--radius-lg",
  "--shadow-xl",
];

type DialogPortalTheme = {
  style: DialogPortalStyle;
  appTheme?: string;
};

function readDialogPortalTheme(element: HTMLElement): DialogPortalTheme {
  const styles = window.getComputedStyle(element);
  const appTheme = element.closest<HTMLElement>("[data-app-theme]")?.dataset.appTheme;

  const style = dialogPortalThemeVars.reduce<DialogPortalStyle>((themeStyle, variable) => {
    themeStyle[variable as `--${string}`] = styles.getPropertyValue(variable);
    return themeStyle;
  }, {});

  const setFallbackVar = (variable: `--${string}`, value: string) => {
    if (!style[variable]?.trim()) {
      style[variable] = value;
    }
  };

  if (appTheme === "dark") {
    setFallbackVar("--app-bg", "#050816");
    setFallbackVar("--app-bg-soft", "#0a1024");
    setFallbackVar("--app-surface", "#111832");
    setFallbackVar("--app-surface-strong", "#151c3a");
    setFallbackVar("--color-background", "#020617");
    setFallbackVar("--color-card", "#0f172a");
    setFallbackVar("--color-card-foreground", "#e2e8f0");
    setFallbackVar("--color-muted", "#111827");
    setFallbackVar("--color-border", "#1e293b");
    setFallbackVar("--color-overlay", "rgba(2, 6, 23, 0.65)");
    setFallbackVar("--app-line", "rgba(191, 219, 254, 0.18)");
    setFallbackVar("--app-line-strong", "rgba(168, 85, 247, 0.48)");
    setFallbackVar("--shadow-xl", "0 30px 90px rgba(0, 0, 0, 0.5)");
  }

  return { style, appTheme };
}

export function CmDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  tone = "default",
  portal = false,
  presentation = "default",
  dismissible = true,
  showClose = true,
}: CmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const sourceRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [portalStyle, setPortalStyle] = useState<DialogPortalStyle>({});
  const [portalAppTheme, setPortalAppTheme] = useState<string | undefined>(undefined);

  useScrollLock(open);
  useEscapeKey(open && dismissible, onClose);
  useFocusTrap(panelRef, { enabled: open });

  useEffect(() => {
    if (!open || !portal || !sourceRef.current) return;
    const portalTheme = readDialogPortalTheme(sourceRef.current);
    setPortalStyle(portalTheme.style);
    setPortalAppTheme(portalTheme.appTheme);
  }, [open, portal]);

  const { invertHeader } = useCmTheme();

  if (!open) return <span ref={sourceRef} hidden />;

  // O header tingido fica só com o título; a descrição renderiza no corpo,
  // com o fundo de body — antes os dois dividiam o mesmo bloco tingido e
  // liam como uma coisa só.
  const hasHeader = Boolean(title);
  const hasBody = Boolean(description || children);
  const dialogStyle: DialogToneStyle = {
    "--dialog-tone": toneColorMap[tone],
  };
  // Tinta chapada e sutil: o degradê diagonal anterior desvanecia justamente
  // na divisa com o corpo (e misturava --color-secondary, que em temas com
  // secondary escuro sujava o header), fazendo header e body se confundirem.
  const headerBackground = invertHeader
    ? "color-mix(in srgb, var(--dialog-tone) 12%, var(--color-card))"
    : "color-mix(in srgb, var(--dialog-tone) 7%, var(--color-card))";

  const titleClassName = cn(
    "cm-dialog__title",
    presentation === "compact" ? "cm-dialog__title--compact" : "cm-dialog__title--default",
  );

  const content = (
    <>
      <div
        className={cn(
          "cm-dialog__overlay",
          open ? "cm-dialog__overlay--open" : "cm-dialog__overlay--closed",
        )}
        style={{
          background: "var(--color-overlay, rgba(2, 6, 23, 0.58))",
        }}
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "cm-dialog__positioner",
          sizeClasses[size],
          open ? "cm-dialog__positioner--open" : "cm-dialog__positioner--closed",
          className,
        )}
      >
        <div
          className="cm-dialog__panel"
          style={{
            ...dialogStyle,
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-card) 96%, var(--color-background) 4%), var(--color-card))",
            borderColor: "var(--color-border)",
            color: "var(--color-card-foreground, var(--color-foreground))",
            boxShadow: "var(--shadow-xl, 0 30px 90px rgba(15, 23, 42, 0.22))",
          }}
        >
          <div
            className="cm-dialog__tone-bar"
            style={{
              background: "var(--dialog-tone)",
            }}
          />

          {hasHeader ? (
            <div
              className="cm-dialog__header"
              style={{
                background: headerBackground,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {showClose ? (
                <CmButton
                  unstyled
                  type="button"
                  onClick={onClose}
                  className="cm-dialog__close cm-dialog__close--header"
                  aria-label="Fechar"
                >
                  <X className="cm-dialog__close-icon" />
                </CmButton>
              ) : null}

              <div className="cm-dialog__heading">
                {title ? (
                  <h2
                    id={titleId}
                    className={titleClassName}
                    style={{
                      // Título tingido com o tom do diálogo: diferencia da
                      // descrição (muted) e reforça a semântica (ex.: danger).
                      // A base em --color-foreground preserva contraste AA em
                      // temas claros e escuros.
                      color:
                        "color-mix(in srgb, var(--dialog-tone) 55%, var(--color-foreground))",
                    }}
                  >
                    {title}
                  </h2>
                ) : null}
              </div>
            </div>
          ) : showClose ? (
            <div className="cm-dialog__headerless-actions">
              <CmButton
                unstyled
                type="button"
                onClick={onClose}
                className="cm-dialog__close"
                aria-label="Fechar"
              >
                <X className="cm-dialog__close-icon" />
              </CmButton>
            </div>
          ) : null}

          {hasBody ? (
            <div
              className="cm-dialog__body"
              style={{
                background: "color-mix(in srgb, var(--color-card) 92%, var(--color-background) 8%)",
              }}
            >
              {description ? (
                <p
                  id={descriptionId}
                  className="cm-dialog__description"
                  style={children ? { marginBottom: "0.75rem" } : undefined}
                >
                  {description}
                </p>
              ) : null}
              {children}
            </div>
          ) : null}

          {footer ? (
            <div
              className="cm-dialog__footer"
              style={{
                background:
                  "color-mix(in srgb, var(--color-card) 84%, var(--color-background) 16%)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  if (!portal) {
    return (
      <>
        <span ref={sourceRef} hidden />
        {content}
      </>
    );
  }

  return (
    <>
      <span ref={sourceRef} hidden />
      <CmPortal>
        <div className="cm-dialog-portal-scope" data-app-theme={portalAppTheme} style={portalStyle}>
          {content}
        </div>
      </CmPortal>
    </>
  );
}
CmDialog.displayName = "CmDialog";
