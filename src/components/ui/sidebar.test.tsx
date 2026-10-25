import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CmSidebar, type CmSidebarGroup } from "./sidebar.js";

afterEach(cleanup);

it("keeps a collapsed trigger stable until the pointer click opens its preview", () => {
  const { container } = render(
    <CmSidebar
      standalone
      collapsed
      autoCollapse={false}
      groups={[
        {
          id: "first",
          label: "First",
          defaultOpen: true,
          items: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
        },
        {
          id: "second",
          label: "Second",
          items: [
            { id: "c", label: "C" },
            { id: "d", label: "D" },
          ],
        },
      ]}
    />,
  );
  fireEvent.mouseEnter(container.querySelector("aside")!);
  expect(container.querySelector(".cm-sidebar-shell--preview")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Second", exact: true }));
  expect(container.querySelector(".cm-sidebar-shell--preview")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Second", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

it("removes collapsed groups from keyboard navigation without unmounting their items", () => {
  const { container } = render(
    <CmSidebar
      standalone
      autoCollapse={false}
      groups={[
        {
          id: "first",
          label: "First group",
          defaultOpen: true,
          items: [
            { id: "one", label: "One" },
            { id: "two", label: "Two" },
          ],
        },
        {
          id: "second",
          label: "Second group",
          items: [
            { id: "three", label: "Three" },
            { id: "four", label: "Four" },
          ],
        },
      ]}
    />,
  );
  const panels = container.querySelectorAll<HTMLElement>(".cm-sidebar__group-items");
  expect(panels[0].inert).toBe(false);
  expect(panels[1].inert).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Second group", exact: true }));
  expect(panels[0].inert).toBe(true);
  expect(panels[1].inert).toBe(false);
  expect(screen.getByText("One")).toBeInTheDocument();
});

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

describe("CmSidebar rail", () => {
  it("does not add a rail modifier for the default (connectors)", () => {
    const { container } = render(<CmSidebar standalone groups={groups} />);
    const aside = container.querySelector("aside.cm-sidebar");
    expect(aside?.className).not.toMatch(/cm-sidebar--rail-/);
  });

  it.each(["edge", "chip"] as const)("adds the modifier class for rail=%s", (rail) => {
    const { container } = render(<CmSidebar standalone groups={groups} rail={rail} />);
    expect(container.querySelector(`aside.cm-sidebar--rail-${rail}`)).not.toBeNull();
  });
});
