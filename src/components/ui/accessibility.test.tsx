import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { axe } from "vitest-axe";

import { CmButton } from "./button.js";
import { CmBadge } from "./badge.js";
import { CmAlert } from "./alert.js";
import { CmDataTable, type CmDataTableColumn } from "./data-table.js";
import { CmTreeView, type CmTreeNode } from "./tree-view.js";
import { CmSidebar, type CmSidebarGroup } from "./sidebar.js";
import { CmGauge } from "./gauge.js";
import { CmProgress } from "./progress.js";
import { CmStatusDot } from "./status-dot.js";
import { CmTimeline } from "./timeline.js";

afterEach(cleanup);

/**
 * Roda o axe-core sobre `container` e falha listando as regras violadas. A regra
 * best-practice `region` é desligada porque estes testes renderizam componentes
 * isolados (sem landmarks de página), e o color-contrast não é avaliado em jsdom
 * (volta como "incomplete", não como violação).
 */
async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe(container, {
    rules: {
      // Componentes isolados não têm landmarks de página.
      region: { enabled: false },
      // color-contrast precisa de layout/canvas reais — verificar em browser
      // (Playwright), não em jsdom, onde volta sempre como "incomplete".
      "color-contrast": { enabled: false },
    },
  });
  // Em caso de falha, lista a regra violada + o HTML do nó culpado.
  const violations = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id}: ${v.help} → ${n.html}`),
  );
  expect(violations).toEqual([]);
}

const tableColumns: CmDataTableColumn<{ id: string; name: string; age: number }>[] = [
  { key: "name", header: "Nome", sortable: true },
  { key: "age", header: "Idade", align: "right" },
];
const tableData = [
  { id: "1", name: "Alice", age: 30 },
  { id: "2", name: "Bob", age: 25 },
];

const treeData: CmTreeNode[] = [
  {
    id: "1",
    name: "Frutas",
    children: [
      { id: "1-1", name: "Maçã" },
      { id: "1-2", name: "Banana" },
    ],
  },
  { id: "2", name: "Vegetais" },
];

const sidebarGroups: CmSidebarGroup[] = [
  {
    id: "main",
    label: "Principal",
    items: [
      { id: "home", label: "Início", href: "/" },
      { id: "reports", label: "Relatórios", href: "/reports" },
    ],
  },
];

describe("accessibility (axe-core)", () => {
  it("CmButton — variantes não têm violações", async () => {
    const { container } = render(
      <div>
        <CmButton>Salvar</CmButton>
        <CmButton variant="outline" tone="danger">
          Excluir
        </CmButton>
        <CmButton disabled>Indisponível</CmButton>
      </div>,
    );
    await expectNoAxeViolations(container);
  });

  it("CmBadge — sem violações", async () => {
    const { container } = render(<CmBadge>Novo</CmBadge>);
    await expectNoAxeViolations(container);
  });

  it("CmAlert — título + descrição sem violações", async () => {
    const { container } = render(
      <CmAlert title="Salvo" description="Suas alterações foram salvas." tone="success" />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmDataTable — cabeçalho ordenável + paginação sem violações", async () => {
    const { container } = render(
      <CmDataTable columns={tableColumns} data={tableData} rowKey={(row) => row.id} />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmTreeView — árvore renderizada sem violações", async () => {
    const { container } = render(<CmTreeView data={treeData} />);
    await expectNoAxeViolations(container);
  });

  it("CmSidebar — navegação sem violações", async () => {
    const { container } = render(
      <CmSidebar groups={sidebarGroups} brand={{ title: "App" }} standalone />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmGauge — progressbar rotulado sem violações", async () => {
    const { container } = render(
      <CmGauge value={72} tone="success" label="Saúde geral" aria-label="Saúde do sistema" />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmProgress — barra rotulada com valor sem violações", async () => {
    const { container } = render(<CmProgress value={72} label="CPU" showValue />);
    await expectNoAxeViolations(container);
  });

  it("CmProgress — label acessível-only sem violações", async () => {
    const { container } = render(<CmProgress value={72} label="Memória" srOnlyLabel />);
    await expectNoAxeViolations(container);
  });

  it("CmStatusDot — indicador rotulado sem violações", async () => {
    const { container } = render(<CmStatusDot tone="success" label="Online" />);
    await expectNoAxeViolations(container);
  });

  it("CmTimeline — feed de atividade sem violações", async () => {
    const { container } = render(
      <CmTimeline
        aria-label="Atividade recente"
        items={[
          { id: "1", label: "19:39", title: "Roteando protocolos", tone: "warning" },
          { id: "2", label: "19:38", title: "MCP conectado", tone: "info" },
          { id: "3", label: "19:37", title: "Testes OK", tone: "success" },
        ]}
      />,
    );
    await expectNoAxeViolations(container);
  });
});
