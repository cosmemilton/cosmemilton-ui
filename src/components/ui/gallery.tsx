"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useControllableState } from "../../hooks/use-controllable-state.js";
import { useEscapeKey } from "../../hooks/use-escape-key.js";
import { useScrollLock } from "../../hooks/use-scroll-lock.js";
import { useFocusTrap } from "../../hooks/use-focus-trap.js";
import { CmButton } from "./button.js";
import { CmPortal } from "./portal.js";
import {
  cmSpacingValue,
  resolveResponsiveNumber,
  type CmRadius,
  type CmResponsiveNumber,
  type CmSpacing,
} from "./types.js";

export type CmGalleryItem = {
  /** Identificador estável. Sem ele, o índice é usado como chave. */
  id?: string;
  /** Imagem em tamanho cheio mostrada no lightbox. */
  src: string;
  alt?: string;
  /** Miniatura opcional; quando ausente usa `src`. */
  thumbnailSrc?: string;
  /** Legenda exibida sob a imagem no lightbox. */
  caption?: ReactNode;
};

const radiusVar: Record<CmRadius, string> = {
  none: "0",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  full: "var(--radius-full)",
};

type GalleryStyle = CSSProperties & Record<`--${string}`, string | number>;

function itemKey(item: CmGalleryItem, index: number) {
  return item.id ?? `${item.src}-${index}`;
}

function clampIndex(index: number, length: number, loop: boolean) {
  if (length === 0) return 0;
  if (loop) return ((index % length) + length) % length;
  return Math.min(Math.max(index, 0), length - 1);
}

/* ------------------------------------------------------------------ */
/* CmLightbox — visualizador em tela cheia (controlado)                */
/* ------------------------------------------------------------------ */

export type CmLightboxProps = {
  items: CmGalleryItem[];
  open: boolean;
  onClose: () => void;
  /** Índice atual (controlado). */
  index?: number;
  /** Índice inicial enquanto não controlado. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Volta ao início depois do último item (e vice-versa). Padrão `true`. */
  loop?: boolean;
  showThumbnails?: boolean;
  showCounter?: boolean;
  closeLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
};

export function CmLightbox({
  items,
  open,
  onClose,
  index,
  defaultIndex = 0,
  onIndexChange,
  loop = true,
  showThumbnails = true,
  showCounter = true,
  closeLabel = "Fechar",
  previousLabel = "Imagem anterior",
  nextLabel = "Próxima imagem",
  className,
}: CmLightboxProps) {
  const titleId = useId();
  const [current, setCurrent] = useControllableState<number>({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  // CmPortal mounts its children one tick late, so the trap must re-arm once the
  // panel node actually attaches — a plain ref wouldn't re-run the focus effect.
  const [panelReady, setPanelReady] = useState(false);
  const setPanelNode = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    setPanelReady(node != null);
  }, []);

  const length = items.length;
  const safeIndex = clampIndex(current ?? 0, length, false);
  const hasMultiple = length > 1;

  useScrollLock(open);
  useEscapeKey(open, onClose);
  useFocusTrap(panelRef, { enabled: open && panelReady });

  const goTo = (next: number) => {
    if (length === 0) return;
    setCurrent(clampIndex(next, length, loop));
  };

  // Arrow-key navigation at the document level so it works regardless of which
  // control inside the modal currently holds focus.
  const safeIndexRef = useRef(safeIndex);
  safeIndexRef.current = safeIndex;
  useEffect(() => {
    if (!open || !hasMultiple) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrent(clampIndex(safeIndexRef.current - 1, length, loop));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrent(clampIndex(safeIndexRef.current + 1, length, loop));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hasMultiple, length, loop, setCurrent]);

  if (!open || length === 0) return null;

  const active = items[safeIndex];

  return (
    <CmPortal>
      <div
        ref={setPanelNode}
        role="dialog"
        aria-modal="true"
        aria-label="Galeria de imagens"
        aria-describedby={active.caption ? titleId : undefined}
        tabIndex={-1}
        className={cn("cm-lightbox", className)}
      >
        <div className="cm-lightbox__backdrop" onClick={onClose} aria-hidden="true" />

        <div className="cm-lightbox__bar">
          {showCounter && hasMultiple ? (
            <span className="cm-lightbox__counter" aria-live="polite">
              {safeIndex + 1} / {length}
            </span>
          ) : (
            <span />
          )}
          <CmButton
            type="button"
            variant="surface"
            shape="square"
            size="sm"
            iconOnly
            icon={<X size={18} aria-hidden="true" />}
            aria-label={closeLabel}
            className="cm-lightbox__close"
            onClick={onClose}
          />
        </div>

        <div className="cm-lightbox__stage">
          {hasMultiple ? (
            <CmButton
              type="button"
              variant="surface"
              shape="square"
              iconOnly
              icon={<ChevronLeft size={22} aria-hidden="true" />}
              aria-label={previousLabel}
              className="cm-lightbox__nav cm-lightbox__nav--prev"
              onClick={() => goTo(safeIndex - 1)}
            />
          ) : null}

          <figure className="cm-lightbox__figure">
            <img className="cm-lightbox__image" src={active.src} alt={active.alt ?? ""} />
            {active.caption ? (
              <figcaption id={titleId} className="cm-lightbox__caption">
                {active.caption}
              </figcaption>
            ) : null}
          </figure>

          {hasMultiple ? (
            <CmButton
              type="button"
              variant="surface"
              shape="square"
              iconOnly
              icon={<ChevronRight size={22} aria-hidden="true" />}
              aria-label={nextLabel}
              className="cm-lightbox__nav cm-lightbox__nav--next"
              onClick={() => goTo(safeIndex + 1)}
            />
          ) : null}
        </div>

        {showThumbnails && hasMultiple ? (
          <div className="cm-lightbox__thumbs" role="tablist" aria-label="Miniaturas">
            {items.map((item, idx) => (
              <button
                key={itemKey(item, idx)}
                type="button"
                role="tab"
                aria-selected={idx === safeIndex}
                aria-label={item.alt ?? `Imagem ${idx + 1}`}
                className={cn(
                  "cm-lightbox__thumb",
                  idx === safeIndex && "cm-lightbox__thumb--active",
                )}
                onClick={() => goTo(idx)}
              >
                <img
                  className="cm-lightbox__thumb-image"
                  src={item.thumbnailSrc ?? item.src}
                  alt=""
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </CmPortal>
  );
}
CmLightbox.displayName = "CmLightbox";

/* ------------------------------------------------------------------ */
/* CmGallery — grade de miniaturas com lightbox embutido               */
/* ------------------------------------------------------------------ */

export type CmGalleryProps = {
  items: CmGalleryItem[];
  /** Colunas da grade, por breakpoint. Padrão `{ base: 2, sm: 3, lg: 4 }`. */
  columns?: CmResponsiveNumber;
  gap?: CmSpacing | string | number;
  /** Proporção das miniaturas (largura/altura). Padrão `1` (quadrado). */
  ratio?: number;
  radius?: CmRadius;
  /** Abre o lightbox ao clicar numa miniatura. Padrão `true`. */
  enableLightbox?: boolean;
  loop?: boolean;
  showThumbnails?: boolean;
  showCounter?: boolean;
  onItemClick?: (item: CmGalleryItem, index: number) => void;
  /** Estado de abertura do lightbox (controlado). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Índice ativo (controlado). */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  thumbnailClassName?: string;
  emptyMessage?: ReactNode;
};

export function CmGallery({
  items,
  columns = { base: 2, sm: 3, lg: 4 },
  gap = "sm",
  ratio = 1,
  radius = "md",
  enableLightbox = true,
  loop = true,
  showThumbnails = true,
  showCounter = true,
  onItemClick,
  open,
  defaultOpen = false,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  className,
  thumbnailClassName,
  emptyMessage = "Nenhuma imagem",
}: CmGalleryProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [activeIndex, setActiveIndex] = useControllableState<number>({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });

  const resolvedColumns = resolveResponsiveNumber(columns, 2);
  const galleryStyle: GalleryStyle = {
    "--cm-gallery-columns-base": resolvedColumns.base,
    "--cm-gallery-columns-sm": resolvedColumns.sm,
    "--cm-gallery-columns-md": resolvedColumns.md,
    "--cm-gallery-columns-lg": resolvedColumns.lg,
    "--cm-gallery-columns-xl": resolvedColumns.xl,
    "--cm-gallery-gap": cmSpacingValue(gap, "0.5rem") ?? "0.5rem",
    "--cm-gallery-ratio": `${ratio}`,
    "--cm-gallery-radius": radiusVar[radius],
  };

  if (items.length === 0) {
    return (
      <div className={cn("cm-gallery cm-gallery--empty", className)} style={galleryStyle}>
        <span className="cm-gallery__empty">{emptyMessage}</span>
      </div>
    );
  }

  const handleSelect = (item: CmGalleryItem, idx: number) => {
    setActiveIndex(idx);
    onItemClick?.(item, idx);
    if (enableLightbox) setIsOpen(true);
  };

  return (
    <>
      <ul className={cn("cm-gallery", className)} style={galleryStyle}>
        {items.map((item, idx) => (
          <li key={itemKey(item, idx)} className="cm-gallery__cell">
            <button
              type="button"
              className={cn("cm-gallery__item", thumbnailClassName)}
              aria-label={item.alt ?? `Abrir imagem ${idx + 1}`}
              aria-haspopup={enableLightbox ? "dialog" : undefined}
              onClick={() => handleSelect(item, idx)}
            >
              <img
                className="cm-gallery__image"
                src={item.thumbnailSrc ?? item.src}
                alt={item.alt ?? ""}
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      {enableLightbox ? (
        <CmLightbox
          items={items}
          open={isOpen ?? false}
          onClose={() => setIsOpen(false)}
          index={activeIndex ?? 0}
          onIndexChange={setActiveIndex}
          loop={loop}
          showThumbnails={showThumbnails}
          showCounter={showCounter}
        />
      ) : null}
    </>
  );
}
CmGallery.displayName = "CmGallery";
