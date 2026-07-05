import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmTreeView, type CmTreeNode } from "./tree-view.js";
import {
  moveNodeBeforeTarget,
  moveNodeRelativeToTarget,
  pruneToSolitaryPath,
} from "./tree-view.utils.js";

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

  it("renders per-node custom actions and invokes them with the node", async () => {
    const user = userEvent.setup();
    const onClone = vi.fn();
    render(
      <CmTreeView
        data={tree}
        nodeActions={(node) => [
          { key: "clone", icon: <span>C</span>, label: `Clonar ${node.name}`, onClick: onClone },
        ]}
      />,
    );

    const cloneButton = screen.getByRole("button", { name: "Clonar Fruits" });
    await user.click(cloneButton);

    expect(onClone).toHaveBeenCalledWith(tree[0]);
  });

  it("can restrict custom actions to a subset of nodes", () => {
    render(
      <CmTreeView
        data={tree}
        expandedByDefault
        nodeActions={(node) =>
          node.id === "1-1"
            ? [{ key: "clone", icon: <span>C</span>, label: "Clonar", onClick: () => {} }]
            : []
        }
      />,
    );

    expect(screen.getAllByRole("button", { name: "Clonar" })).toHaveLength(1);
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

  it("can expose drag handles only for nodes accepted by isDraggable", () => {
    render(
      <CmTreeView data={tree} expandedByDefault isDraggable={(node) => node.id.includes("-")} />,
    );

    expect(screen.getAllByRole("button", { name: "Drag to reorder" })).toHaveLength(3);
    expect(
      screen
        .getByRole("button", { name: "Fruits" })
        .closest(".cm-tree-view__node")
        ?.querySelector('[aria-label="Drag to reorder"]'),
    ).toBeNull();
  });

  it("uses canDrop to reject a target before invoking move callbacks", () => {
    const canDrop = vi.fn(() => false);
    const onMove = vi.fn();
    const onReorder = vi.fn();
    render(
      <CmTreeView
        data={tree}
        expandedByDefault
        dropMode="auto"
        canDrop={canDrop}
        onMove={onMove}
        onReorder={onReorder}
      />,
    );

    const source = screen
      .getByRole("button", { name: "Apple" })
      .closest(".cm-tree-view__node")
      ?.querySelector<HTMLElement>('[aria-label="Drag to reorder"]');
    const target = screen
      .getByRole("button", { name: "Vegetables" })
      .closest<HTMLElement>(".cm-tree-view__item");
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn(),
      getData: vi.fn(() => "1-1"),
    };

    expect(source).not.toBeNull();
    expect(target).not.toBeNull();
    fireEvent.dragStart(source!, { dataTransfer });
    fireEvent.dragOver(target!, { dataTransfer });
    fireEvent.drop(target!, { dataTransfer });

    expect(canDrop).toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("gives onMove origin/destination details and passes the new tree to onReorder", () => {
    const onMove = vi.fn();
    const onReorder = vi.fn();
    render(
      <CmTreeView
        data={tree}
        expandedByDefault
        dropMode="auto"
        onMove={onMove}
        onReorder={onReorder}
      />,
    );

    const source = screen
      .getByRole("button", { name: "Apple" })
      .closest(".cm-tree-view__node")
      ?.querySelector<HTMLElement>('[aria-label="Drag to reorder"]');
    const target = screen
      .getByRole("button", { name: "Vegetables" })
      .closest<HTMLElement>(".cm-tree-view__item");
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn(),
      getData: vi.fn(() => "1-1"),
    };

    fireEvent.dragStart(source!, { dataTransfer });
    fireEvent.dragOver(target!, { dataTransfer });
    fireEvent.drop(target!, { dataTransfer });

    expect(onMove).toHaveBeenCalledWith(
      "1-1",
      "2",
      1,
      expect.objectContaining({
        position: "inside",
        oldParentId: "1",
        oldOrder: 0,
        newParentId: "2",
        newOrder: 1,
      }),
    );
    expect(onReorder).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "1" }),
        expect.objectContaining({
          id: "2",
          children: expect.arrayContaining([expect.objectContaining({ id: "1-1" })]),
        }),
      ]),
    );
  });
});

describe("tree-view utils", () => {
  it("moveNodeBeforeTarget returns the reordered tree so onReorder can persist a drag", () => {
    const result = moveNodeBeforeTarget(tree, "2", "1");
    expect(result).not.toBeNull();
    expect(result?.parentId).toBeNull();
    expect(result?.nodes.map((n) => n.id)).toEqual(["2", "1"]);
  });

  it("moves a node inside an empty target and reports both locations", () => {
    const data: CmTreeNode[] = [...tree, { id: "3", name: "Empty group", children: [] }];
    const result = moveNodeRelativeToTarget(data, "1-1", "3", "inside");

    expect(result?.parentId).toBe("3");
    expect(result?.order).toBe(0);
    expect(result?.nodes[2].children?.map((node) => node.id)).toEqual(["1-1"]);
    expect(result?.details).toMatchObject({
      position: "inside",
      oldParentId: "1",
      oldOrder: 0,
      newParentId: "3",
      newOrder: 0,
    });
  });

  it("supports dropping after a sibling", () => {
    const result = moveNodeRelativeToTarget(tree, "1-1", "1-2", "after");
    expect(result?.nodes[0].children?.map((node) => node.id)).toEqual(["1-2", "1-1"]);
    expect(result?.order).toBe(1);
  });

  it("rejects a move when the dragged subtree would exceed maxDepth", () => {
    expect(moveNodeRelativeToTarget(tree, "1", "2", "inside", 2)).toBeNull();
  });

  it("pruneToSolitaryPath keeps a single open branch per level", () => {
    const allOpen = new Set(["1", "2"]);
    expect([...pruneToSolitaryPath(tree, allOpen)]).toEqual(["1"]);
  });
});
