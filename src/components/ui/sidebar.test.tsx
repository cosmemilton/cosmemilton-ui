import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CmSidebar, type CmSidebarGroup } from "./sidebar.js";

afterEach(cleanup);

const groups: CmSidebarGroup[] = [
  { id: "overview", label: "Visão Geral", items: [{ id: "overview", label: "Visão Geral" }] },
  { id: "reports", label: "Relatórios", items: [{ id: "reports", label: "Relatórios" }] },
];

describe("CmSidebar belowGroups", () => {
  it("renders the slot after the menu groups, inside the scrollable nav", () => {
    const { container } = render(
      <CmSidebar
        standalone
        groups={groups}
        belowGroups={<div data-testid="projects">Projetos</div>}
      />,
    );

    const slot = container.querySelector(".cm-sidebar__nav .cm-sidebar__below-groups");
    expect(slot).not.toBeNull();
    expect(screen.getByTestId("projects")).toBeInTheDocument();

    // It must come after the menu options, i.e. be the last child of the nav.
    const nav = container.querySelector(".cm-sidebar__nav");
    expect(nav?.lastElementChild).toBe(slot);
  });

  it("hides the slot when the sidebar is collapsed (icon-only)", () => {
    render(
      <CmSidebar
        standalone
        collapsed
        autoCollapse={false}
        groups={groups}
        belowGroups={<div data-testid="projects">Projetos</div>}
      />,
    );
    expect(screen.queryByTestId("projects")).toBeNull();
  });

  it("renders nothing extra when belowGroups is omitted", () => {
    const { container } = render(<CmSidebar standalone groups={groups} />);
    expect(container.querySelector(".cm-sidebar__below-groups")).toBeNull();
  });

  it("adds the divider modifier only when belowGroupsDivider is set", () => {
    const { container, rerender } = render(
      <CmSidebar standalone groups={groups} belowGroups={<div>x</div>} />,
    );
    expect(container.querySelector(".cm-sidebar__below-groups--divided")).toBeNull();

    rerender(
      <CmSidebar standalone groups={groups} belowGroups={<div>x</div>} belowGroupsDivider />,
    );
    expect(container.querySelector(".cm-sidebar__below-groups--divided")).not.toBeNull();
  });
});
