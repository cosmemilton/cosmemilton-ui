"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";
import { Eraser } from "lucide-react";
import { cn } from "../../lib/utils.js";

type Point = { x: number; y: number };
type Stroke = Point[];

const STROKE_WIDTH = 2.25;
const DEFAULT_HEIGHT = 200;
const DATA_URL_PATTERN = /^data:image\//;

function resolveStrokeColor(canvas: HTMLCanvasElement, strokeColor?: string): string {
  canvas.style.color = strokeColor || "";
  return getComputedStyle(canvas).color || "#111827";
}

function configureStroke(ctx: CanvasRenderingContext2D, color: string) {
  ctx.lineWidth = STROKE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, width: number, height: number) {
  if (stroke.length === 0) return;
  if (stroke.length === 1) {
    const { x, y } = stroke[0];
    ctx.beginPath();
    ctx.arc(x * width, y * height, STROKE_WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(stroke[0].x * width, stroke[0].y * height);
  for (let i = 1; i < stroke.length; i += 1) {
    ctx.lineTo(stroke[i].x * width, stroke[i].y * height);
  }
  ctx.stroke();
}

/** Escapa texto para uso seguro dentro de um atributo XML/SVG. */
function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** API imperativa do componente, exposta via prop `apiRef`. */
export type CmSignaturePadHandle = {
  /** Limpa o traço e volta ao estado vazio. */
  clear: () => void;
  /** `true` quando nenhum traço foi desenhado (nem preenchido via `defaultValue`). */
  isEmpty: () => boolean;
  /** PNG (fundo branco) do traço atual, ou `null` se vazio. */
  toDataURL: (type?: string, quality?: number) => string | null;
  /** Traços em SVG vetorial (reescala sem perda), ou `null` se vazio. */
  toSVG: () => string | null;
};

export type CmSignaturePadProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  /** Nome do campo — quando definido, sincroniza um `<input type="hidden">` com o data URL. */
  name?: string;
  /** Altura da área de assinatura. Padrão: `200`. */
  height?: number | string;
  /** Cor do traço. Padrão: `--color-foreground`. */
  strokeColor?: string;
  disabled?: boolean;
  /** Texto do botão de limpar. Padrão: "Limpar". */
  clearLabel?: string;
  /** Texto exibido sobre a área vazia. Padrão: "Assine aqui". */
  placeholder?: string;
  /** Nome acessível da área de assinatura. */
  ariaLabel?: string;
  /** Data URL (PNG) pré-carregado — ex.: reabrir uma assinatura já coletada. */
  defaultValue?: string | null;
  /** Disparado com o data URL a cada traço concluído, e `null` ao limpar. */
  onChange?: (dataUrl: string | null) => void;
  /** Ref da API imperativa (`clear`/`isEmpty`/`toDataURL`/`toSVG`). */
  apiRef?: Ref<CmSignaturePadHandle>;
};

export const CmSignaturePad = forwardRef<HTMLDivElement, CmSignaturePadProps>(
  function CmSignaturePad(
    {
      name,
      height = DEFAULT_HEIGHT,
      strokeColor,
      disabled = false,
      clearLabel = "Limpar",
      placeholder = "Assine aqui",
      ariaLabel = "Área de assinatura",
      defaultValue = null,
      onChange,
      apiRef,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const frameRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef({ width: 0, height: 0 });
    const strokesRef = useRef<Stroke[]>([]);
    const activeStrokeRef = useRef<Stroke | null>(null);
    const activePointerIdRef = useRef<number | null>(null);
    const baseImageRef = useRef<HTMLImageElement | null>(null);

    const [isEmpty, setIsEmpty] = useState(true);
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState("");

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const { width, height: h } = sizeRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, h);
      if (baseImageRef.current) ctx.drawImage(baseImageRef.current, 0, 0, width, h);
      configureStroke(ctx, resolveStrokeColor(canvas, strokeColor));
      for (const stroke of strokesRef.current) paintStroke(ctx, stroke, width, h);
    }, [strokeColor]);

    // Measure the frame and size the canvas' backing store for the device pixel
    // ratio, so strokes stay crisp on high-DPI screens instead of blurring.
    useEffect(() => {
      const frame = frameRef.current;
      const canvas = canvasRef.current;
      if (!frame || !canvas) return;

      const resize = () => {
        const cssWidth = frame.clientWidth;
        const cssHeight = frame.clientHeight;
        if (cssWidth <= 0 || cssHeight <= 0) return;
        if (sizeRef.current.width === cssWidth && sizeRef.current.height === cssHeight) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        sizeRef.current = { width: cssWidth, height: cssHeight };
        redraw();
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(frame);
      return () => observer.disconnect();
    }, [redraw]);

    useEffect(() => {
      redraw();
    }, [redraw]);

    // Preload an existing signature once, mirroring how the rest of the lib treats
    // `defaultValue` as an uncontrolled seed rather than a synced controlled value.
    useEffect(() => {
      if (!defaultValue || !DATA_URL_PATTERN.test(defaultValue)) return;
      const img = new Image();
      img.onload = () => {
        baseImageRef.current = img;
        setIsEmpty(false);
        setDataUrl(defaultValue);
        redraw();
      };
      img.src = defaultValue;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / (rect.width || 1),
        y: (event.clientY - rect.top) / (rect.height || 1),
      };
    };

    const commitChange = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      setDataUrl(url);
      setStatusMessage("Assinatura registrada.");
      onChangeRef.current?.(url);
    }, []);

    const finishStroke = useCallback(() => {
      const stroke = activeStrokeRef.current;
      activeStrokeRef.current = null;
      if (!stroke || stroke.length === 0) return;
      strokesRef.current.push(stroke);
      commitChange();
    }, [commitChange]);

    const clear = useCallback(() => {
      strokesRef.current = [];
      activeStrokeRef.current = null;
      baseImageRef.current = null;
      setIsEmpty(true);
      setDataUrl(null);
      setStatusMessage("Assinatura removida.");
      redraw();
      onChangeRef.current?.(null);
    }, [redraw]);

    const toSVG = useCallback((): string | null => {
      const strokes = strokesRef.current;
      const baseImage = baseImageRef.current;
      if (strokes.length === 0 && !baseImage) return null;

      const { width, height: h } = sizeRef.current;
      const viewW = 1000;
      const viewH = Math.round(((h || 1) / (width || 1)) * viewW) || 1;
      const canvas = canvasRef.current;
      const color = canvas ? resolveStrokeColor(canvas, strokeColor) : "#111827";

      const parts: string[] = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="${viewW}" height="${viewH}">`,
        `<rect width="${viewW}" height="${viewH}" fill="#ffffff" />`,
      ];
      if (baseImage) {
        parts.push(
          `<image href="${escapeXmlAttribute(baseImage.src)}" x="0" y="0" width="${viewW}" height="${viewH}" preserveAspectRatio="none" />`,
        );
      }
      for (const stroke of strokes) {
        if (stroke.length === 0) continue;
        if (stroke.length === 1) {
          const cx = (stroke[0].x * viewW).toFixed(2);
          const cy = (stroke[0].y * viewH).toFixed(2);
          parts.push(
            `<circle cx="${cx}" cy="${cy}" r="${(STROKE_WIDTH / 2).toFixed(2)}" fill="${color}" />`,
          );
          continue;
        }
        const d = stroke
          .map((p, i) => `${i === 0 ? "M" : "L"}${(p.x * viewW).toFixed(2)},${(p.y * viewH).toFixed(2)}`)
          .join(" ");
        parts.push(
          `<path d="${d}" fill="none" stroke="${color}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round" />`,
        );
      }
      parts.push("</svg>");
      return parts.join("");
    }, [strokeColor]);

    useImperativeHandle(
      apiRef,
      () => ({
        clear,
        isEmpty: () => strokesRef.current.length === 0 && !baseImageRef.current,
        toDataURL: (type, quality) =>
          strokesRef.current.length === 0 && !baseImageRef.current
            ? null
            : (canvasRef.current?.toDataURL(type, quality) ?? null),
        toSVG,
      }),
      [clear, toSVG],
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      event.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;

      const ctx = canvas.getContext("2d");
      const point = getPoint(event);
      activeStrokeRef.current = [point];
      setIsEmpty(false);

      if (ctx) {
        configureStroke(ctx, resolveStrokeColor(canvas, strokeColor));
        const { width, height: h } = sizeRef.current;
        paintStroke(ctx, [point], width, h);
      }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const stroke = activeStrokeRef.current;
      if (!stroke || event.pointerId !== activePointerIdRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const point = getPoint(event);
      const last = stroke[stroke.length - 1];
      stroke.push(point);
      if (ctx) {
        const { width, height: h } = sizeRef.current;
        ctx.beginPath();
        ctx.moveTo(last.x * width, last.y * h);
        ctx.lineTo(point.x * width, point.y * h);
        ctx.stroke();
      }
    };

    const endPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas?.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      activePointerIdRef.current = null;
      finishStroke();
    };

    return (
      <div ref={ref} className={cn("cm-signature-pad", className)} {...rest}>
        <div
          ref={frameRef}
          className={cn("cm-signature-pad__frame", disabled && "cm-signature-pad__frame--disabled")}
          style={{ ...style, height }}
        >
          <canvas
            ref={canvasRef}
            className="cm-signature-pad__canvas"
            role="img"
            aria-label={isEmpty ? `${ariaLabel} (vazia)` : ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
          />
          {isEmpty ? (
            <span className="cm-signature-pad__placeholder" aria-hidden>
              {placeholder}
            </span>
          ) : null}
        </div>

        <div className="cm-signature-pad__footer">
          <span className="cm-sr-only" role="status" aria-live="polite">
            {statusMessage}
          </span>
          <button
            type="button"
            className="cm-signature-pad__clear"
            onClick={clear}
            disabled={disabled || isEmpty}
          >
            <Eraser className="cm-signature-pad__clear-icon" aria-hidden />
            {clearLabel}
          </button>
        </div>

        {name ? <input type="hidden" name={name} value={dataUrl ?? ""} /> : null}
      </div>
    );
  },
);
CmSignaturePad.displayName = "CmSignaturePad";
