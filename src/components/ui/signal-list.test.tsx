import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmSignalBars, cmSignalLevel } from "./signal-bars.js";
import { CmSignalList, type CmSignalListItem } from "./signal-list.js";

const redes: CmSignalListItem[] = [
  { id: "seduc", label: "SEDUC-PE", signal: 92, locked: true },
  { id: "lab", label: "escola-lab-2", signal: 61, locked: true },
  { id: "livre", label: "recife-livre", signal: 18 },
];

describe("cmSignalLevel", () => {
  it("never rounds a real signal down to zero", () => {
    // 12% é uma barra fraca, não "sem rede": arredondar para zero mostraria o
    // ícone de rede inexistente numa rede que está ali.
    expect(cmSignalLevel(12)).toBe(1);
    expect(cmSignalLevel(0)).toBe(0);
    expect(cmSignalLevel(100)).toBe(4);
    expect(cmSignalLevel(50)).toBe(2);
  });
});

describe("CmSignalBars", () => {
  it("is decorative without a label", () => {
    const { container } = render(<CmSignalBars value={80} />);
    const bars = container.querySelector(".cm-signal-bars");
    expect(bars).toHaveAttribute("aria-hidden", "true");
    expect(bars).toHaveAttribute("data-level", "4");
  });

  it("becomes an image with a name when labelled", () => {
    render(<CmSignalBars value={50} label="sinal médio" />);
    expect(screen.getByRole("img", { name: "sinal médio" })).toBeInTheDocument();
  });
});

describe("CmSignalList", () => {
  it("renders a radiogroup with one option per item", () => {
    render(<CmSignalList items={redes} label="Redes disponíveis" value="seduc" />);
    expect(screen.getByRole("radiogroup", { name: "Redes disponíveis" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /SEDUC-PE/ })).toBeChecked();
  });

  it("announces the padlock in words", () => {
    render(<CmSignalList items={redes} value={null} />);
    // O espaço entre o nome e o texto só-leitor depende de como o navegador
    // concatena os pedaços do nome acessível; o teste não amarra isso.
    expect(screen.getByRole("radio", { name: /SEDUC-PE\s*\(protegida\)/ })).toBeInTheDocument();
    // A rede aberta não ganha o texto — o cadeado é informação, não enfeite.
    expect(screen.getByRole("radio", { name: "recife-livre" })).toBeInTheDocument();
  });

  it("reports the chosen item with its record", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CmSignalList items={redes} value={null} onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: /escola-lab-2/ }));
    expect(onChange).toHaveBeenCalledWith("lab", redes[1]);
  });

  it("shows the empty state instead of an empty box", () => {
    render(<CmSignalList items={[]} emptyState="Nenhuma rede encontrada" />);
    expect(screen.getByText("Nenhuma rede encontrada")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });

  it("disables the item that asks for it", () => {
    render(<CmSignalList items={[{ id: "a", label: "rede", disabled: true }]} value={null} />);
    expect(screen.getByRole("radio")).toBeDisabled();
  });
});
