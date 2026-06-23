import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmTimeline, type CmTimelineItem } from "./timeline.js";

const items: CmTimelineItem[] = [
  { id: "a", label: "19:39", title: "Roteando protocolos", tone: "warning", trailing: <span>tag</span> },
  { id: "b", label: "19:38", title: "MCP conectado" },
  { id: "c", label: "19:37", title: "Testes OK", tone: "success" },
];

describe("CmTimeline", () => {
  it("renders an ordered list with one item per entry", () => {
    const { container } = render(<CmTimeline items={items} />);
    expect(container.querySelector("ol.cm-timeline")).toBeInTheDocument();
    expect(container.querySelectorAll(".cm-timeline__item")).toHaveLength(3);
  });

  it("renders label, title and trailing slots", () => {
    render(<CmTimeline items={items} />);
    expect(screen.getByText("19:39")).toHaveClass("cm-timeline__label");
    expect(screen.getByText("Roteando protocolos")).toHaveClass("cm-timeline__title");
    expect(screen.getByText("tag").parentElement).toHaveClass("cm-timeline__trailing");
  });

  it("applies per-item tone and falls back to the timeline tone", () => {
    const { container } = render(<CmTimeline items={items} tone="info" />);
    const markers = container.querySelectorAll(".cm-timeline__marker");
    expect(markers[0]).toHaveClass("cm-timeline__marker--tone-warning"); // explicit
    expect(markers[1]).toHaveClass("cm-timeline__marker--tone-info"); // inherited default
    expect(markers[2]).toHaveClass("cm-timeline__marker--tone-success");
  });

  it("draws a continuous rail: one connector per item, trimmed at the first/last dot", () => {
    const { container } = render(<CmTimeline items={items} />);
    const connectors = container.querySelectorAll(".cm-timeline__connector");
    expect(connectors).toHaveLength(3);
    expect(connectors[0]).toHaveClass("cm-timeline__connector--first");
    expect(connectors[2]).toHaveClass("cm-timeline__connector--last");
    expect(connectors[1]).not.toHaveClass("cm-timeline__connector--first");
    expect(connectors[1]).not.toHaveClass("cm-timeline__connector--last");
  });

  it("omits the rail entirely for a single item", () => {
    const { container } = render(<CmTimeline items={[{ id: "solo", title: "Único" }]} />);
    expect(container.querySelector(".cm-timeline__connector")).toBeNull();
  });

  it("applies the variant class (default and connected)", () => {
    const { container, rerender } = render(<CmTimeline items={items} />);
    expect(container.querySelector("ol")).toHaveClass("cm-timeline--variant-default");
    rerender(<CmTimeline items={items} variant="connected" />);
    expect(container.querySelector("ol")).toHaveClass("cm-timeline--variant-connected");
  });

  it("renders a custom marker as an icon marker", () => {
    const { container } = render(
      <CmTimeline items={[{ id: "x", title: "Com ícone", marker: <svg data-testid="ic" /> }]} />,
    );
    const marker = container.querySelector(".cm-timeline__marker");
    expect(marker).toHaveClass("cm-timeline__marker--icon");
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });

  it("prefers custom content over title/description", () => {
    render(
      <CmTimeline
        items={[{ id: "y", title: "ignorado", content: <p>conteúdo custom</p> }]}
      />,
    );
    expect(screen.getByText("conteúdo custom")).toBeInTheDocument();
    expect(screen.queryByText("ignorado")).toBeNull();
  });

  it("omits the label column entirely when no item has a label", () => {
    const { container } = render(<CmTimeline items={[{ id: "z", title: "Sem label" }]} />);
    expect(container.querySelector(".cm-timeline__label")).toBeNull();
  });

  it("exposes labelWidth as a CSS variable (number → px)", () => {
    const { container } = render(<CmTimeline items={items} labelWidth={64} />);
    const ol = container.querySelector("ol.cm-timeline") as HTMLOListElement;
    expect(ol.style.getPropertyValue("--cm-timeline-label-width")).toBe("64px");
  });

  it("forwards native props to the root element", () => {
    render(<CmTimeline items={items} data-testid="t" aria-label="Atividade" />);
    expect(screen.getByTestId("t").tagName).toBe("OL");
    expect(screen.getByTestId("t")).toHaveAttribute("aria-label", "Atividade");
  });
});
