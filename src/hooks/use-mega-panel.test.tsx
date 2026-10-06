import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useMegaPanel } from "./use-mega-panel.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Fixture({ positioned = vi.fn() }: { positioned?: () => void }) {
  const reference = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useMegaPanel(reference, panel, { onPosition: positioned });
  return (
    <>
      <button ref={reference}>Abrir</button>
      <div ref={panel} data-testid="panel">
        Resultados
      </div>
    </>
  );
}

describe("useMegaPanel", () => {
  it("limits height to the area below the reference instead of the full short viewport", async () => {
    vi.stubGlobal("innerHeight", 280);
    expect(window.innerHeight).toBe(280);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      return {
        x: 20,
        y: 16,
        top: 16,
        left: 20,
        bottom: 68,
        right: 180,
        width: 160,
        height: 52,
        toJSON() {},
      };
    });
    const positioned = vi.fn();
    render(<Fixture positioned={positioned} />);
    const panel = screen.getByTestId("panel");
    await waitFor(() => expect(panel).toHaveAttribute("data-positioned", "true"));
    expect(panel.style.position).toBe("fixed");
    expect(panel.style.top).toBe("76px");
    expect(panel.style.getPropertyValue("--cm-mega-panel-max-height")).toBe(
      `${window.innerHeight - 84}px`,
    );
    expect(panel.style.getPropertyValue("--cm-mega-panel-max-width")).toBe(
      `${window.innerWidth - 16}px`,
    );
    expect(positioned).toHaveBeenCalledOnce();
    window.dispatchEvent(new Event("resize"));
    await waitFor(() => expect(panel.style.top).toBe("76px"));
    expect(positioned).toHaveBeenCalledOnce();
  });

  it("falls back above a bottom-edge trigger and keeps the panel inside a 280px viewport", async () => {
    vi.stubGlobal("innerHeight", 280);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const trigger = this.tagName === "BUTTON";
      return trigger
        ? {
            x: 20,
            y: 220,
            top: 220,
            left: 20,
            bottom: 264,
            right: 180,
            width: 160,
            height: 44,
            toJSON() {},
          }
        : {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 120,
            right: 320,
            width: 320,
            height: 120,
            toJSON() {},
          };
    });
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.tagName === "BUTTON" ? 44 : 120;
    });
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.tagName === "BUTTON" ? 160 : 320;
    });
    vi.spyOn(Element.prototype, "scrollHeight", "get").mockReturnValue(240);
    render(<Fixture />);
    const panel = screen.getByTestId("panel");
    await waitFor(() => expect(panel).toHaveAttribute("data-positioned", "true"));
    expect(panel.style.getPropertyValue("--cm-mega-panel-max-height")).toBe("204px");
    const top = Number.parseFloat(panel.style.top);
    expect(top).toBeGreaterThanOrEqual(8);
    expect(top + 120).toBeLessThanOrEqual(212);
  });
});
