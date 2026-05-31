import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmTreeView, type CmTreeNode } from "./tree-view.js";

const tree: CmTreeNode[] = [
  {
    id: "1",
    name: "Fruits",
    children: [
      { id: "1-1", name: "Apple" },
      { id: "1-2", name: "Banana" },
    ],
  },
  {
    id: "2",
    name: "Vegetables",
    children: [{ id: "2-1", name: "Carrot" }],
  },
];

afterEach(cleanup);

describe("CmTreeView", () => {
  it("renders the root nodes", () => {
    render(<CmTreeView data={tree} />);
    expect(screen.getByRole("button", { name: "Fruits" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vegetables" })).toBeInTheDocument();
  });

  it("keeps children collapsed until their branch is expanded", async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} />);

    expect(screen.queryByRole("button", { name: "Apple" })).not.toBeInTheDocument();

    // The first collapsed branch is "Fruits".
    await user.click(screen.getAllByRole("button", { name: "Expand" })[0]);

    expect(screen.getByRole("button", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Banana" })).toBeInTheDocument();
  });

  it('reveals every branch through "Expandir Tudo"', async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} />);

    await user.click(screen.getByRole("button", { name: /Expandir Tudo/ }));

    expect(screen.getByRole("button", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Carrot" })).toBeInTheDocument();
  });

  it("renders nested nodes immediately when expandedByDefault is set", () => {
    render(<CmTreeView data={tree} expandedByDefault />);
    expect(screen.getByRole("button", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Carrot" })).toBeInTheDocument();
  });

  it("filters the tree to the matching subtree when searching", async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} />);

    await user.type(
      screen.getByPlaceholderText("Buscar categorias..."),
      "Carrot",
    );

    expect(screen.getByRole("button", { name: "Carrot" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apple" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Fruits" })).not.toBeInTheDocument();
  });

  it("populates the breadcrumb when a node is selected", async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} />);

    await user.click(screen.getByRole("button", { name: "Fruits" }));

    expect(
      screen.getByRole("button", { name: "Navigate to Fruits" }),
    ).toBeInTheDocument();
  });
});
