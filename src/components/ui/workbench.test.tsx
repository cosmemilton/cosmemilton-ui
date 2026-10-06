import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CmCanvas, CmFrame, CmInspector, CmWorkbench } from "./workbench.js";
import { CmDisclosure } from "./disclosure.js";
import { CmField } from "./field.js";
import { CmTextarea } from "./textarea.js";

function PersistentTools() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((current) => current + 1)}>Ajustes {count}</button>;
}

describe("editor surfaces", () => {
  it("preserves inspector state when tools are hidden and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CmWorkbench inspector={<PersistentTools />}>Canvas</CmWorkbench>);
    await user.click(screen.getByRole("button", { name: "Ajustes 0" }));
    rerender(
      <CmWorkbench inspectorOpen={false} inspector={<PersistentTools />}>
        Canvas
      </CmWorkbench>,
    );
    expect(screen.getByRole("button", { name: "Ajustes 1", hidden: true })).not.toBeVisible();
    rerender(
      <CmWorkbench inspectorOpen inspector={<PersistentTools />}>
        Canvas
      </CmWorkbench>,
    );
    expect(screen.getByRole("button", { name: "Ajustes 1" })).toBeVisible();
  });

  it("keeps native disclosure contents mounted across native toggles", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDetailsElement>();
    render(
      <CmDisclosure ref={ref} title="Configurações" meta="2 campos" defaultOpen>
        <PersistentTools />
      </CmDisclosure>,
    );
    await user.click(screen.getByRole("button", { name: "Ajustes 0" }));
    const summary = screen.getByText("Configurações").closest("summary")!;
    await user.click(summary);
    expect(ref.current).not.toHaveAttribute("open");
    await user.click(summary);
    expect(ref.current).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Ajustes 1" })).toBeVisible();
  });

  it("forwards iframe references and native events", () => {
    const ref = createRef<HTMLIFrameElement>();
    const loaded = vi.fn();
    render(
      <CmFrame
        ref={ref}
        title="Editor de diagrama"
        src="about:blank"
        height={480}
        onLoad={loaded}
        data-testid="frame"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId("frame"));
    expect(ref.current).toHaveAttribute("height", "480");
    expect(ref.current).toHaveAccessibleName("Editor de diagrama");
    fireEvent.load(ref.current!);
    expect(loaded).toHaveBeenCalledOnce();
  });

  it("supports a narrow canvas and compact inspector without consumer styles", () => {
    render(
      <CmCanvas contentWidth={280} pattern="grid">
        <CmInspector title="Ajustes">
          <span>Conteúdo</span>
        </CmInspector>
      </CmCanvas>,
    );
    expect(screen.getByRole("heading", { name: "Ajustes" })).toBeVisible();
    expect(screen.getByText("Conteúdo")).toBeVisible();
  });
});

describe("compact controls", () => {
  it("associates the field label with a native checkbox and displays errors", async () => {
    const user = userEvent.setup();
    render(
      <CmField
        htmlFor="notifications"
        label="Notificações"
        labelHint="email"
        layout="inline"
        density="compact"
        control="native"
        error="Selecione uma opção"
      >
        <input id="notifications" type="checkbox" />
      </CmField>,
    );
    await user.click(screen.getByText("Notificações"));
    expect(screen.getByRole("checkbox", { name: "Notificações" })).toBeChecked();
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione uma opção");
  });

  it("connects textarea labels and error messages while preserving native changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CmTextarea
        label="Observação"
        helperText="Detalhe o cenário"
        error="Obrigatório"
        density="compact"
        onChange={onChange}
      />,
    );
    const textarea = screen.getByRole("textbox", { name: "Observação" });
    expect(textarea).toHaveAccessibleDescription("Obrigatório");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    await user.type(textarea, "Texto novo");
    expect(textarea).toHaveValue("Texto novo");
    expect(onChange).toHaveBeenCalledTimes(10);
  });
});
