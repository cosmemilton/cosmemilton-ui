import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmRichTextEditor } from "./rich-text-editor.js";

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
});
