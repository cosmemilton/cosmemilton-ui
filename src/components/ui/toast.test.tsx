import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";

import { CmToastNotice, CmToastProvider, useCmToast } from "./toast.js";

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
  it("deduplica o aviso declarativo durante os efeitos repetidos do StrictMode", () => {
    render(
      <StrictMode>
        <CmToastProvider>
          <CmToastNotice
            title="Não foi possível entrar"
            description="Informe uma loja válida."
            tone="danger"
          />
        </CmToastProvider>
      </StrictMode>,
    );

    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("aceita a mesma mensagem assim que o usuário fecha o toast, preservando a animação", () => {
    const anterior = renderToast(5000);

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    fireEvent.click(screen.getByRole("button", { name: "disparar" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(anterior).toHaveClass("cm-toast__item--hidden");

    advance(300);
    expect(anterior).not.toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(1);

    // A remoção tardia do anterior não libera duplicatas do novo toast.
    fireEvent.click(screen.getByRole("button", { name: "disparar" }));
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("aceita a mesma mensagem quando o fechamento automático começa antes de um segundo", () => {
    const anterior = renderToast(600);
    advance(600);

    fireEvent.click(screen.getByRole("button", { name: "disparar" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    advance(300);
    expect(anterior).not.toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("fechar um toast anterior mantém a deduplicação do mais recente", () => {
    renderToast(5000);
    advance(1000);
    fireEvent.click(screen.getByRole("button", { name: "disparar" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Fechar" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "disparar" }));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    advance(300);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

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

it("renders and updates the declared notice class and action without duplicating the notification", () => {
  const view = render(
    <CmToastProvider>
      <CmToastNotice title="Pronto" className="first-notice" action={<button>Abrir</button>} />
    </CmToastProvider>,
  );
  expect(screen.getByRole("alert")).toHaveClass("first-notice");
  expect(screen.getByRole("button", { name: "Abrir" })).toBeInTheDocument();
  view.rerender(
    <CmToastProvider>
      <CmToastNotice title="Pronto" className="updated-notice" action={<button>Revisar</button>} />
    </CmToastProvider>,
  );
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  expect(screen.getByRole("alert")).toHaveClass("updated-notice");
  expect(screen.getByRole("button", { name: "Revisar" })).toBeInTheDocument();
});
