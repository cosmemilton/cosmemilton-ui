import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmChoiceCard, CmChoiceCardGroup, type CmChoiceCardOption } from "./choice-card.js";

const options: CmChoiceCardOption[] = [
  { value: "instalar", title: "Instalar agora", description: "Leva de 8 a 15 minutos." },
  { value: "testar", title: "Experimentar sem instalar", description: "Nada é gravado no disco." },
  { value: "manual", title: "Particionar na mão", disabled: true },
];

describe("CmChoiceCard", () => {
  it("renders a radio with title and description", () => {
    render(
      <CmChoiceCard
        name="modo"
        value="instalar"
        title="Instalar agora"
        description="Leva de 8 a 15 minutos."
      />,
    );
    const input = screen.getByRole("radio", { name: /instalar agora/i });
    expect(input).toHaveAttribute("type", "radio");
    expect(screen.getByText("Leva de 8 a 15 minutos.")).toBeInTheDocument();
  });

  it("switches to a checkbox when multiple", () => {
    render(<CmChoiceCard multiple name="colecoes" value="escritorio" title="Escritório" />);
    expect(screen.getByRole("checkbox", { name: /escritório/i })).toBeInTheDocument();
  });

  it("reports the checked state through onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <CmChoiceCard
        multiple
        name="c"
        value="a"
        title="Escritório"
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("marks the root as disabled for styling and blocks the input", () => {
    render(<CmChoiceCard name="m" value="a" title="Servidor" disabled data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveAttribute("data-disabled");
    expect(screen.getByRole("radio")).toBeDisabled();
  });
});

describe("CmChoiceCardGroup", () => {
  it("exposes a radiogroup and selects a single value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CmChoiceCardGroup
        name="modo"
        label="Modo de instalação"
        options={options}
        value="instalar"
        onChange={onChange}
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "Modo de instalação" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /instalar agora/i })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: /experimentar/i }));
    expect(onChange).toHaveBeenCalledWith("testar");
  });

  it("keeps the option order when toggling in multiple mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CmChoiceCardGroup
        multiple
        name="colecoes"
        label="Coleções"
        options={options}
        value={["testar"]}
        onChange={onChange}
      />,
    );

    // Marcar a PRIMEIRA opção depois da segunda tem de devolver a ordem do
    // catálogo, não a ordem dos cliques — é o que mantém a receita estável.
    await user.click(screen.getByRole("checkbox", { name: /instalar agora/i }));
    expect(onChange).toHaveBeenCalledWith(["instalar", "testar"]);
  });

  it("unchecks in multiple mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CmChoiceCardGroup
        multiple
        name="colecoes"
        options={options}
        value={["instalar", "testar"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /instalar agora/i }));
    expect(onChange).toHaveBeenCalledWith(["testar"]);
  });

  it("disables the option that asks for it", () => {
    render(
      <CmChoiceCardGroup name="modo" options={options} value="instalar" onChange={() => {}} />,
    );
    expect(screen.getByRole("radio", { name: /particionar na mão/i })).toBeDisabled();
  });

  it("does not leak value/onChange to the root element", () => {
    const { container } = render(
      <CmChoiceCardGroup name="modo" options={options} value="instalar" onChange={() => {}} />,
    );
    // `value` sobrando no rest viraria atributo da <div> — e `onChange` passaria
    // a escutar o bubbling dos inputs, disparando duas vezes.
    expect(container.querySelector(".cm-choice-card-group")).not.toHaveAttribute("value");
  });

  it("selects with the arrow keys, like any native radio group", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("instalar");
      return (
        <CmChoiceCardGroup
          name="modo"
          options={options.slice(0, 2)}
          value={value}
          onChange={setValue}
        />
      );
    }
    render(<Controlled />);

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /experimentar/i })).toBeChecked();
  });
});
