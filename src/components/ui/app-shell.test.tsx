import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmAppShell } from "./app-shell.js";

describe("CmAppShell", () => {
  it("renders sidebar, topbar and content slots", () => {
    render(
      <CmAppShell sidebar={<nav>menu</nav>} topbar={<header>top</header>}>
        <p>conteúdo</p>
      </CmAppShell>,
    );
    // The sidebar slot renders twice: desktop aside and mobile drawer.
    expect(screen.getAllByText("menu")).not.toHaveLength(0);
    expect(screen.getByText("top")).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("publishes density as data-density so it cascades to descendants", () => {
    const { container } = render(<CmAppShell density="compact">conteúdo</CmAppShell>);
    const shell = container.querySelector(".cm-app-shell");
    expect(shell).toHaveAttribute("data-density", "compact");
    expect(shell).toHaveClass("cm-density-compact");
  });

  it("omits data-density without an explicit density", () => {
    const { container } = render(<CmAppShell>conteúdo</CmAppShell>);
    expect(container.querySelector(".cm-app-shell")).not.toHaveAttribute("data-density");
  });

  it("omits data-density for the default density", () => {
    const { container } = render(<CmAppShell density="default">conteúdo</CmAppShell>);
    expect(container.querySelector(".cm-app-shell")).not.toHaveAttribute("data-density");
  });
});
