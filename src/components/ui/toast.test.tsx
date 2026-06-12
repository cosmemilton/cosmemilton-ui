import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { CmToastProvider, useCmToast } from "./toast.js";

function Trigger({ duration }: { duration?: number }) {
  const { toast } = useCmToast();
  return (
    <button type="button" onClick={() => toast("Arquivo salvo", { duration })}>
      disparar
    </button>
  );
}

function renderToast(duration?: number) {
  render(
    <CmToastProvider>
      <Trigger duration={duration} />
    </CmToastProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "disparar" }));
  return screen.getByRole("alert");
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CmToastProvider", () => {
  it("fecha sozinho após a duração", () => {
    renderToast(5000);
    advance(4999);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    advance(1 + 300);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("pausa a contagem com o mouse em cima e retoma só o tempo restante", () => {
    const item = renderToast(5000);
    advance(3000);

    fireEvent.mouseOver(item);
    expect(item).toHaveAttribute("data-paused");
    advance(60_000);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.mouseOut(item);
    expect(item).not.toHaveAttribute("data-paused");
    advance(1999);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    advance(1 + 300);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("pausa enquanto o foco estiver dentro do toast", () => {
    const item = renderToast(1000);
    const close = screen.getByRole("button", { name: "Fechar" });

    act(() => close.focus());
    expect(item).toHaveAttribute("data-paused");
    advance(60_000);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    act(() => close.blur());
    expect(item).not.toHaveAttribute("data-paused");
    advance(1000 + 300);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
