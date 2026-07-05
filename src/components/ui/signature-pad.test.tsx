import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import { CmSignaturePad, type CmSignaturePadHandle } from "./signature-pad.js";

const FAKE_DATA_URL = "data:image/png;base64,MOCK";

// jsdom never actually loads <img> resources, so drive `onload` synchronously
// once `src` is assigned — matching how a real browser resolves a data: URL.
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = "";
  get src() {
    return this._src;
  }
  set src(value: string) {
    this._src = value;
    this.onload?.();
  }
}
// @ts-expect-error - minimal stand-in for HTMLImageElement, sufficient for this component's usage.
globalThis.Image = MockImage;

function fakeContext() {
  return {
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    lineJoin: "miter",
  } as unknown as CanvasRenderingContext2D;
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () => fakeContext() as unknown as RenderingContext,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(FAKE_DATA_URL);
  // jsdom doesn't implement pointer capture at all, so stub it rather than spy on it.
  HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
  HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
  HTMLCanvasElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function canvasOf(container: HTMLElement) {
  return container.querySelector("canvas") as HTMLCanvasElement;
}

function draw(canvas: HTMLCanvasElement) {
  fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
  fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
}

describe("CmSignaturePad", () => {
  it("starts empty, showing the placeholder and a disabled clear button", () => {
    render(<CmSignaturePad placeholder="Assine aqui" />);
    expect(screen.getByText("Assine aqui")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeDisabled();
  });

  it("captures a stroke, reports it via onChange and enables the clear button", () => {
    const onChange = vi.fn();
    const { container } = render(<CmSignaturePad onChange={onChange} />);

    draw(canvasOf(container));

    expect(onChange).toHaveBeenCalledWith(FAKE_DATA_URL);
    expect(screen.queryByText("Assine aqui")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).not.toBeDisabled();
  });

  it("syncs a hidden input when name is set", () => {
    const { container } = render(<CmSignaturePad name="signature" />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.value).toBe("");

    draw(canvasOf(container));
    expect(hidden.value).toBe(FAKE_DATA_URL);
  });

  it("does nothing when disabled", () => {
    const onChange = vi.fn();
    const { container } = render(<CmSignaturePad disabled onChange={onChange} />);

    draw(canvasOf(container));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Assine aqui")).toBeInTheDocument();
  });

  it("clears via the button, restoring the empty state and calling onChange(null)", async () => {
    const onChange = vi.fn();
    const { container } = render(<CmSignaturePad onChange={onChange} />);

    draw(canvasOf(container));
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText("Assine aqui")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeDisabled();
  });

  it("exposes an imperative API via apiRef", () => {
    const apiRef = createRef<CmSignaturePadHandle>();
    const { container } = render(<CmSignaturePad apiRef={apiRef} />);

    expect(apiRef.current?.isEmpty()).toBe(true);
    expect(apiRef.current?.toDataURL()).toBeNull();
    expect(apiRef.current?.toSVG()).toBeNull();

    draw(canvasOf(container));

    expect(apiRef.current?.isEmpty()).toBe(false);
    expect(apiRef.current?.toDataURL()).toBe(FAKE_DATA_URL);
    expect(apiRef.current?.toSVG()).toContain("<svg");

    apiRef.current?.clear();
    expect(apiRef.current?.isEmpty()).toBe(true);
  });

  it("preloads a defaultValue data URL as a non-empty signature", async () => {
    render(<CmSignaturePad name="signature" defaultValue={FAKE_DATA_URL} />);
    expect(await screen.findByRole("button", { name: "Limpar" })).not.toBeDisabled();
  });

  it("ignores a defaultValue that isn't a data URL", () => {
    render(<CmSignaturePad defaultValue="https://example.com/signature.png" />);
    expect(screen.getByText("Assine aqui")).toBeInTheDocument();
  });
});
