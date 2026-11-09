import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useState } from "react";

import { CmDialog } from "./dialog.js";
import { CmThemeProvider } from "../theme/theme-provider.js";

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

describe("confirmações persistentes", () => {
  it("renderiza ações e classe, permanece aberta e restaura foco sem fechar o ancestral", () => {
    const escapeAncestor = vi.fn();
    document.addEventListener("keydown", escapeAncestor);
    const dismissed = vi.fn();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    render(
      <>
        <CmToastProvider>
          <CmToastNotice
            description="Excluir registro?"
            duration={0}
            // Explicitly testing the custom opt-in focus behavior, not native autofocus.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="confirmacao"
            onDismiss={dismissed}
            action={<button>Continuar editando</button>}
          />
        </CmToastProvider>
      </>,
    );
    expect(screen.getByRole("alert")).toHaveClass("confirmacao");
    expect(screen.getByRole("button", { name: "Continuar editando" })).toHaveFocus();
    expect(document.querySelector(".cm-toast__progress")).toBeNull();
    advance(60_000);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(escapeAncestor).not.toHaveBeenCalled();
    advance(300);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
    trigger.remove();
    document.removeEventListener("keydown", escapeAncestor);
  });

  it("atualiza ações sem duplicar e bloqueia cliques/fechamento durante processamento", () => {
    const confirm = vi.fn();
    const show = (processing: boolean) => (
      <CmToastProvider>
        <CmToastNotice
          description="Confirmar?"
          duration={0}
          processing={processing}
          action={<button onClick={confirm}>Confirmar</button>}
        />
      </CmToastProvider>
    );
    const { rerender } = render(show(false));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(confirm).toHaveBeenCalledTimes(1);
    rerender(show(true));
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    fireEvent.keyDown(screen.getByRole("alert"), { key: "Escape" });
    advance(60_000);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(show(false));
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    advance(300);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("permite cancelar Escape e remove o aviso quando o declarativo desmonta", () => {
    const escape = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const { rerender } = render(
      <CmToastProvider>
        <CmToastNotice description="UUID longo" duration={0} onEscapeKeyDown={escape} />
      </CmToastProvider>,
    );
    fireEvent.keyDown(screen.getByRole("alert"), { key: "Escape" });
    advance(300);
    expect(escape).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<CmToastProvider>{null}</CmToastProvider>);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("expõe identificador, atualização e dismiss para ações imperativas", () => {
    function Example() {
      const { toast, update, dismiss } = useCmToast();
      return (
        <button
          onClick={() => {
            const id = toast("Salvar?", { duration: 0 });
            update(id, { action: <button onClick={() => dismiss(id)}>Salvar</button> });
          }}
        >
          Abrir
        </button>
      );
    }
    render(
      <CmToastProvider>
        <Example />
      </CmToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

it("keeps a real parent dialog open and restores its trigger after Escape", () => {
  const closeDialog = vi.fn();
  function Example() {
    const [confirming, setConfirming] = useState(false);
    return (
      <CmThemeProvider>
        <CmToastProvider>
          <CmDialog open onClose={closeDialog} title="Editor" portal>
            <button onClick={() => setConfirming(true)}>Excluir</button>
            {confirming && (
              <CmToastNotice
                description="Excluir registro?"
                duration={0}
                // Intentional opt-in on a custom confirmation, not native DOM autofocus.
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onDismiss={() => setConfirming(false)}
                action={<button>Continuar editando</button>}
              />
            )}
          </CmDialog>
        </CmToastProvider>
      </CmThemeProvider>
    );
  }
  render(<Example />);
  const trigger = screen.getByRole("button", { name: "Excluir" });
  act(() => trigger.focus());
  fireEvent.click(trigger);
  expect(screen.getByRole("button", { name: "Continuar editando" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  advance(300);
  expect(closeDialog).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("does not coalesce independent confirmations with identical text", () => {
  render(
    <CmToastProvider>
      <CmToastNotice description="Confirmar?" duration={0} action={<button>Excluir A</button>} />
      <CmToastNotice description="Confirmar?" duration={0} action={<button>Excluir B</button>} />
    </CmToastProvider>,
  );
  expect(screen.getAllByRole("alert")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Excluir A" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Excluir B" })).toBeInTheDocument();
});

it("does not dismiss parent state during StrictMode replay or message changes", () => {
  const dismissed = vi.fn();
  function Example({ message }: { message: string }) {
    const [open, setOpen] = useState(true);
    return (
      <CmToastProvider>
        {open && (
          <CmToastNotice
            description={message}
            duration={0}
            onDismiss={() => {
              dismissed();
              setOpen(false);
            }}
            action={<button>Confirmar</button>}
          />
        )}
      </CmToastProvider>
    );
  }
  const { rerender } = render(
    <StrictMode>
      <Example message="Primeiro" />
    </StrictMode>,
  );
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  expect(dismissed).not.toHaveBeenCalled();
  rerender(
    <StrictMode>
      <Example message="Segundo" />
    </StrictMode>,
  );
  expect(screen.getByText("Segundo")).toBeInTheDocument();
  expect(dismissed).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  advance(300);
  expect(dismissed).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("alert")).toBeNull();
});

it("calls the latest dismissal callback once even before a queued render", () => {
  const original = vi.fn();
  const latest = vi.fn();
  function Example() {
    const { toast, update, dismiss } = useCmToast();
    return (
      <button
        onClick={() => {
          const id = toast("Efêmero", { onDismiss: original });
          update(id, { onDismiss: latest });
          dismiss(id);
          dismiss(id);
        }}
      >
        Abrir e fechar
      </button>
    );
  }
  render(
    <CmToastProvider>
      <Example />
    </CmToastProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Abrir e fechar" }));
  expect(original).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("alert")).toBeNull();
});
