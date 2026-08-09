import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmLogView, type CmLogEntry } from "./log-view.js";

const entries: CmLogEntry[] = [
  { id: "mkfs", text: "mkfs.btrfs /dev/nvme0n1p3", status: "done" },
  { id: "pacstrap", text: "pacstrap -K /mnt base linux", status: "running", meta: "1.140/1.847" },
  { id: "bootctl", text: "bootctl install" },
  { id: "sbctl", text: "sbctl sign", status: "skipped" },
];

describe("CmLogView", () => {
  it("renders one list item per entry, in order", () => {
    render(<CmLogView entries={entries} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("mkfs.btrfs /dev/nvme0n1p3");
  });

  it("carries the status on the line and on a data attribute", () => {
    render(<CmLogView entries={entries} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveClass("cm-log-view__line--done");
    expect(items[1]).toHaveAttribute("data-status", "running");
    // Sem status declarado, a linha ainda não aconteceu.
    expect(items[2]).toHaveAttribute("data-status", "pending");
  });

  it("says the status in words for screen readers, not only with a glyph", () => {
    render(<CmLogView entries={entries} />);
    expect(screen.getByText(/concluída/)).toHaveClass("cm-sr-only");
    expect(screen.getByText(/em andamento/)).toHaveClass("cm-sr-only");
  });

  it("accepts custom markers and labels", () => {
    render(
      <CmLogView
        entries={[{ text: "etapa", status: "done" }]}
        statusMarkers={{ done: "[ok]" }}
        statusLabels={{ done: "pronta" }}
      />,
    );
    expect(screen.getByText("[ok]")).toBeInTheDocument();
    expect(screen.getByText(/pronta/)).toHaveClass("cm-sr-only");
  });

  it("keeps the live region off by default", () => {
    const { container, rerender } = render(<CmLogView entries={entries} />);
    expect(container.querySelector("[aria-live]")).toBeNull();

    rerender(<CmLogView entries={entries} live />);
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it("shows the meta of the line", () => {
    render(<CmLogView entries={entries} />);
    expect(screen.getByText("1.140/1.847")).toBeInTheDocument();
  });
});
