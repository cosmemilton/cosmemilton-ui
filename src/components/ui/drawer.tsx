"use client";

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CmPortal } from "./portal.js";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";

type DrawerSide = "left" | "right" | "bottom" | "top";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  children: ReactNode;
  className?: string;
  title?: string;
};

const sideClass: Record<DrawerSide, string> = {
  left: "cm-drawer__panel--left",
  right: "cm-drawer__panel--right",
  bottom: "cm-drawer__panel--bottom",
  top: "cm-drawer__panel--top",
};

type DrawerPortalStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

const drawerPortalThemeVars = [
  "--color-card",
  "--color-card-foreground",
  "--color-background",
  "--color-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-border",
  "--color-ring",
  "--color-overlay",
  "--radius-full",
  "--radius-md",
  "--shadow-xl",
];

function readDrawerPortalTheme(element: HTMLElement): DrawerPortalStyle {
  const styles = window.getComputedStyle(element);

  return drawerPortalThemeVars.reduce<DrawerPortalStyle>((themeStyle, variable) => {
    const value = styles.getPropertyValue(variable);
    if (value.trim()) {
      themeStyle[variable as `--${string}`] = value;
    }
    return themeStyle;
  }, {});
}

export function CmDrawer({ open, onClose, side = "right", children, className, title }: DrawerProps) {
  const sourceRef = useRef<HTMLSpanElement>(null);
  const [portalStyle, setPortalStyle] = useState<DrawerPortalStyle>({});

  useEffect(() => {
    if (!open) return;
    if (sourceRef.current) {
      setPortalStyle(readDrawerPortalTheme(sourceRef.current));
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return <span ref={sourceRef} hidden />;

  return (
    <>
      <span ref={sourceRef} hidden />
      <CmPortal>
        <div className="cm-drawer__portal-scope" style={portalStyle}>
          <div
            className="cm-drawer__overlay"
            role="presentation"
            onClick={onClose}
          />
          <div
            className={cn(
              "cm-drawer__panel",
              sideClass[side],
              className,
            )}
          >
            <div className="cm-drawer__header">
              {title ? (
                <h2 className="cm-drawer__title">{title}</h2>
              ) : null}
              <CmButton
                unstyled
                type="button"
                onClick={onClose}
                className="cm-drawer__close"
              >
                Fechar
              </CmButton>
            </div>
            <div className="cm-drawer__body">
              {children}
            </div>
          </div>
        </div>
      </CmPortal>
    </>
  );
}
