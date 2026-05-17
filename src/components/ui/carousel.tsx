"use client";

import { type CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CmButton } from "./button.js";
import { cn } from "../../lib/utils.js";

type CarouselItem = {
  id: string;
  content?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  media?: ReactNode;
  action?: ReactNode;
};

type CarouselProps = {
  items: CarouselItem[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showDots?: boolean;
  height?: string;
  mediaPadding?: "none" | "sm" | "md" | "lg" | string | number;
  variant?: "card" | "bleed";
};

function carouselPaddingValue(value: CarouselProps["mediaPadding"]) {
  if (value === undefined || value === "none") return undefined;
  if (typeof value === "number") return `${value}px`;
  const preset: Record<string, string> = {
    sm: "0.75rem",
    md: "1.25rem",
    lg: "2rem",
  };
  return preset[value] ?? value;
}

export function CmCarousel({
  items,
  className,
  autoPlay = false,
  interval = 6000,
  showControls = true,
  showDots = true,
  height,
  mediaPadding,
  variant = "card",
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const length = items.length;

  useEffect(() => {
    if (!autoPlay || length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, interval, length]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.setProperty(
        "transform",
        `translateX(-${index * 100}%)`,
      );
    }
  }, [index]);

  const goTo = (next: number) => {
    if (length === 0) return;
    if (next < 0) {
      setIndex(length - 1);
    } else {
      setIndex(next % length);
    }
  };

  if (length === 0) {
    return null;
  }

  const carouselStyle = {
    ...(height ? { "--cm-carousel-height": height } : {}),
    ...(mediaPadding ? { "--cm-carousel-media-padding": carouselPaddingValue(mediaPadding) } : {}),
  } as CSSProperties;

  return (
    <div
      className={cn(
        "cm-carousel",
        `cm-carousel--${variant}`,
        className,
      )}
      style={height || mediaPadding ? carouselStyle : undefined}
    >
      <div ref={trackRef} className="cm-carousel__track">
        {items.map((item) => (
          <div key={item.id} className="cm-carousel__slide">
            {item.content ?? (
              <div className="cm-carousel__panel">
                {item.media ? (
                  <div className="cm-carousel__media">{item.media}</div>
                ) : null}
                <div className="cm-carousel__content">
                  {item.eyebrow ? (
                    <div className="cm-carousel__eyebrow">{item.eyebrow}</div>
                  ) : null}
                  {item.title ? (
                    <h3 className="cm-carousel__title">{item.title}</h3>
                  ) : null}
                  {item.description ? (
                    <p className="cm-carousel__description">{item.description}</p>
                  ) : null}
                  {item.action ? (
                    <div className="cm-carousel__action">{item.action}</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {showDots && length > 1 ? (
      <div className="cm-carousel__dots">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "cm-carousel__dot",
              idx === index
                ? "cm-carousel__dot--active"
                : "cm-carousel__dot--idle",
            )}
            onClick={() => goTo(idx)}
            aria-label={`Ir para item ${idx + 1}`}
          />
        ))}
      </div>
      ) : null}
      {showControls && length > 1 ? (
      <div className="cm-carousel__controls">
        <CmButton
          aria-label="Slide anterior"
          icon={<ChevronLeft size={18} aria-hidden="true" />}
          iconOnly
          shape="square"
          size="sm"
          variant="surface"
          className="cm-carousel__control"
          onClick={() => goTo(index - 1)}
        />
        <CmButton
          aria-label="Próximo slide"
          icon={<ChevronRight size={18} aria-hidden="true" />}
          iconOnly
          shape="square"
          size="sm"
          variant="surface"
          className="cm-carousel__control"
          onClick={() => goTo(index + 1)}
        />
      </div>
      ) : null}
    </div>
  );
}
