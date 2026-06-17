import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmTreeView, type CmTreeNode } from "./tree-view.js";
import { moveNodeBeforeTarget, pruneToSolitaryPath } from "./tree-view.utils.js";

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

    await user.type(screen.getByPlaceholderText("Buscar categorias..."), "Carrot");

    expect(screen.getByRole("button", { name: "Carrot" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apple" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Fruits" })).not.toBeInTheDocument();
  });

  it("populates the breadcrumb when a node is selected", async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} />);

    await user.click(screen.getByRole("button", { name: "Fruits" }));

    expect(screen.getByRole("button", { name: "Navigate to Fruits" })).toBeInTheDocument();
  });

  it("collapses sibling branches as soon as solitary mode is enabled", async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} expandedByDefault />);

    // Ambos os ramos começam abertos.
    expect(screen.getByRole("button", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Carrot" })).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: "Modo Solitário" }));

    // Sobra apenas o primeiro ramo aberto, sem precisar recolher/expandir antes.
    expect(screen.getByRole("button", { name: "Apple" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Carrot" })).not.toBeInTheDocument();
  });

  it("keeps a single branch open per level while solitary mode is on", async () => {
    const user = userEvent.setup();
    render(<CmTreeView data={tree} expandedByDefault solitaryMode />);

    // Inicia já solitário: só o primeiro ramo aberto.
    expect(screen.getByRole("button", { name: "Apple" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Carrot" })).not.toBeInTheDocument();

    // Abrir o outro ramo fecha o primeiro.
    await user.click(screen.getAllByRole("button", { name: "Expand" })[0]);
    expect(screen.getByRole("button", { name: "Carrot" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apple" })).not.toBeInTheDocument();
  });

  it("hides the native expand/collapse controls when showExpandCollapse is false", () => {
    render(<CmTreeView data={tree} showExpandCollapse={false} />);
    expect(screen.queryByRole("button", { name: /Expandir Tudo/ })).not.toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Modo Solitário" })).toBeInTheDocument();
  });

  it("can hide the solitary toggle", () => {
    render(<CmTreeView data={tree} showSolitaryToggle={false} />);
    expect(screen.queryByRole("switch", { name: "Modo Solitário" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Expandir Tudo/ })).toBeInTheDocument();
  });

  it("renders default folder/file icons but lets node.icon and per-type props override them", () => {
    const custom: CmTreeNode[] = [
      { id: "a", name: "Alpha", icon: <span data-testid="node-icon">★</span> },
      { id: "b", name: "Bravo", children: [{ id: "b-1", name: "Bravo Leaf" }] },
    ];
    render(
      <CmTreeView
        data={custom}
        expandedByDefault
        leafIcon={<span data-testid="leaf-icon">◆</span>}
      />,
    );

    // Ícone próprio do nó tem precedência.
    expect(screen.getByTestId("node-icon")).toBeInTheDocument();
    // Folhas sem ícone próprio usam o leafIcon fornecido (a folha "Bravo Leaf").
    expect(screen.getByTestId("leaf-icon")).toBeInTheDocument();
  });

  it("hides the add-subcategory button at the deepest allowed level via maxDepth", () => {
    const onAdd = () => {};
    render(<CmTreeView data={tree} maxDepth={2} onAdd={onAdd} expandedByDefault />);

    // maxDepth=2 → níveis 0 e 1. O nó raiz (nível 0) pode receber subcategoria.
    expect(screen.getAllByRole("button", { name: "Add Subcategory" }).length).toBeGreaterThan(0);

    // Os filhos (nível 1) são o nível mais profundo permitido: sem botão de adicionar.
    const leaf = screen.getByRole("button", { name: "Apple" }).closest(".cm-tree-view__node");
    expect(leaf?.querySelector('[title="Add Subcategory"]')).toBeNull();
  });
});

describe("tree-view utils", () => {
  it("moveNodeBeforeTarget returns the reordered tree so onReorder can persist a drag", () => {
    const result = moveNodeBeforeTarget(tree, "2", "1");
    expect(result).not.toBeNull();
    expect(result?.parentId).toBeNull();
    expect(result?.nodes.map((n) => n.id)).toEqual(["2", "1"]);
  });

  it("pruneToSolitaryPath keeps a single open branch per level", () => {
    const allOpen = new Set(["1", "2"]);
    expect([...pruneToSolitaryPath(tree, allOpen)]).toEqual(["1"]);
  });
});
