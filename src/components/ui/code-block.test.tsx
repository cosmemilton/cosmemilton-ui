import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CmCodeBlock } from "./code-block.js";

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
afterEach(() => {
  if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
  else Reflect.deleteProperty(navigator, "clipboard");
  vi.restoreAllMocks();
});

describe("code block clipboard", () => {
  it("copies the exact displayed code and reports success", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const copied = vi.fn();
    const source = `const texto = '<div> & "literal"';\nconsole.log(texto);`;
    const { rerender } = render(
      <CmCodeBlock
        code={source}
        filename="editor.tsx"
        language="tsx"
        copyable
        maxHeight={300}
        footer="Atualizado ao vivo"
        preProps={{ "data-testid": "source" }}
        copyButtonProps={{ "data-testid": "copy-action" }}
        onCopy={copied}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    await waitFor(() => expect(copied).toHaveBeenCalledWith(source));
    expect(writeText).toHaveBeenCalledWith(source);
    expect(screen.getByTestId("copy-action")).toHaveTextContent("Copiado");
    expect(screen.getByTestId("source").textContent).toBe(source);
    expect(screen.getByRole("status")).toHaveTextContent("Copiado");
    rerender(<CmCodeBlock code="const proximo = true;" copyable />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeVisible();
  });

  it("reports a rejected clipboard operation without claiming success", async () => {
    const user = userEvent.setup();
    const error = new Error("Permissão negada");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(error) },
    });
    const failed = vi.fn();
    const copied = vi.fn();
    render(<CmCodeBlock code="hello" copyable onCopy={copied} onCopyError={failed} />);
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    await waitFor(() => expect(failed).toHaveBeenCalledWith(error));
    expect(copied).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível copiar");
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeVisible();
  });

  it("reports an unavailable clipboard API", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    const failed = vi.fn();
    render(<CmCodeBlock code="hello" copyable onCopyError={failed} />);
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    await waitFor(() => expect(failed).toHaveBeenCalledOnce());
    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível copiar");
  });
});
