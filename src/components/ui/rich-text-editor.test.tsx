import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmRichTextEditor, type CmRichTextEditorHandle } from "./rich-text-editor.js";
import { createRef } from "react";

afterEach(cleanup);

function content(container: HTMLElement) {
  return container.querySelector(".cm-rte__content") as HTMLElement;
}

describe("CmRichTextEditor", () => {
  it("renders the default toolbar with a textbox", () => {
    render(<CmRichTextEditor ariaLabel="Conteúdo" />);
    expect(screen.getByRole("textbox", { name: "Conteúdo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lista numerada" })).toBeInTheDocument();
  });

  it("hides the toolbar when read-only", () => {
    render(<CmRichTextEditor readOnly value="<p>Somente leitura</p>" />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Negrito" })).not.toBeInTheDocument();
  });

  it("reflects a controlled value into the editable area", () => {
    const { container } = render(<CmRichTextEditor value="<p>Olá</p>" />);
    expect(content(container).innerHTML).toBe("<p>Olá</p>");
  });

  it("emits onChange with the current HTML on input", () => {
    const onChange = vi.fn();
    const { container } = render(<CmRichTextEditor onChange={onChange} />);
    const el = content(container);
    el.innerHTML = "<p>Novo</p>";
    fireEvent.input(el);
    expect(onChange).toHaveBeenLastCalledWith("<p>Novo</p>");
  });

  // jsdom omits document.execCommand, so install a mock for the duration.
  function mockExecCommand() {
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: exec,
    });
    return exec;
  }

  it("runs execCommand when a toolbar button is clicked", async () => {
    const user = userEvent.setup();
    const exec = mockExecCommand();
    render(<CmRichTextEditor />);

    await user.click(screen.getByRole("button", { name: "Negrito" }));
    expect(exec).toHaveBeenCalledWith("bold", false, undefined);
  });

  it("inserts a link from onLinkRequest", async () => {
    const user = userEvent.setup();
    const exec = mockExecCommand();
    render(<CmRichTextEditor onLinkRequest={() => "https://example.com"} />);

    await user.click(screen.getByRole("button", { name: "Inserir link" }));
    expect(exec).toHaveBeenCalledWith("createLink", false, "https://example.com");
  });

  describe("toolbar slots", () => {
    it("renders toolbarStart and toolbarEnd around the command buttons", () => {
      render(
        <CmRichTextEditor
          toolbarStart={<button type="button">Emoji</button>}
          toolbarEnd={<button type="button">Variáveis</button>}
        />,
      );
      const toolbar = screen.getByRole("toolbar");
      const buttons = Array.from(toolbar.querySelectorAll("button"));
      expect(buttons[0]).toHaveTextContent("Emoji");
      expect(buttons[buttons.length - 1]).toHaveTextContent("Variáveis");
      expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
    });

    it("keeps the toolbar visible with toolbar={false} when a slot is provided", () => {
      render(<CmRichTextEditor toolbar={false} toolbarStart={<button type="button">Emoji</button>} />);
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Emoji" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Negrito" })).not.toBeInTheDocument();
    });

    it("still hides the toolbar when read-only, even with slots", () => {
      render(<CmRichTextEditor readOnly toolbarStart={<button type="button">Emoji</button>} />);
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });
  });

  describe("editorApiRef", () => {
    it("inserts text and html at the editor via execCommand and emits onChange", () => {
      const exec = mockExecCommand();
      const onChange = vi.fn();
      const api = createRef<CmRichTextEditorHandle>();
      render(<CmRichTextEditor editorApiRef={api} onChange={onChange} />);

      api.current?.insertText("olá");
      expect(exec).toHaveBeenCalledWith("insertText", false, "olá");

      api.current?.insertHtml("<b>oi</b>");
      expect(exec).toHaveBeenCalledWith("insertHTML", false, "<b>oi</b>");

      expect(onChange).toHaveBeenCalled();
    });

    it("runs arbitrary commands through exec", () => {
      const exec = mockExecCommand();
      const api = createRef<CmRichTextEditorHandle>();
      render(<CmRichTextEditor editorApiRef={api} />);

      api.current?.exec("bold");
      expect(exec).toHaveBeenCalledWith("bold", false, undefined);
    });

    it("focus() moves focus to the editable area", () => {
      const api = createRef<CmRichTextEditorHandle>();
      const { container } = render(<CmRichTextEditor editorApiRef={api} />);

      api.current?.focus();
      expect(document.activeElement).toBe(content(container));
    });
  });
});
