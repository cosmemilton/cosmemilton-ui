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
import { CmChoiceCardGroup } from "./choice-card.js";
import { CmLogView } from "./log-view.js";
import { CmOptionRow } from "./option-row.js";
import { CmPasswordStrength } from "./password-strength.js";
import { CmRatioBar } from "./ratio-bar.js";
import { CmSignalList } from "./signal-list.js";
import { CmSlider } from "./slider.js";
import { CmSummaryList } from "./summary-list.js";

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

  it("CmChoiceCardGroup — rádio e checkbox sem violações", async () => {
    const options = [
      { value: "a", title: "Instalar agora", description: "Leva de 8 a 15 minutos." },
      { value: "b", title: "Experimentar", description: "Nada é gravado no disco." },
    ];
    const { container } = render(
      <div>
        <CmChoiceCardGroup
          name="modo"
          label="Modo"
          options={options}
          value="a"
          onChange={() => {}}
        />
        <CmChoiceCardGroup
          multiple
          name="colecoes"
          label="Coleções"
          options={options}
          value={["a"]}
          onChange={() => {}}
        />
      </div>,
    );
    await expectNoAxeViolations(container);
  });

  it("CmOptionRow — switch rotulado pela linha sem violações", async () => {
    const { container } = render(
      <CmOptionRow
        title="Sincronizar o relógio pela rede"
        description="NTP ligado"
        checked
        onCheckedChange={() => {}}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmRatioBar — alça com role slider sem violações", async () => {
    const { container } = render(
      <CmRatioBar
        segments={[
          { label: "Windows", value: 190, valueLabel: "190 GB" },
          { label: "Frevo OS", value: 322, valueLabel: "322 GB" },
        ]}
        handleIndex={0}
        handleLabel="Divisão do disco"
        onChange={() => {}}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmLogView — log com estado por linha sem violações", async () => {
    const { container } = render(
      <CmLogView
        label="Registro"
        entries={[
          { id: "1", text: "mkfs.btrfs /dev/nvme0n1p3", status: "done" },
          { id: "2", text: "pacstrap -K /mnt base", status: "running" },
        ]}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmPasswordStrength — medidor rotulado sem violações", async () => {
    const { container } = render(<CmPasswordStrength value="Sombrinha!Frevo#2026" showHints />);
    await expectNoAxeViolations(container);
  });

  it("CmSignalList — lista de redes sem violações", async () => {
    const { container } = render(
      <CmSignalList
        label="Redes"
        value="a"
        items={[
          { id: "a", label: "SEDUC-PE", signal: 92, locked: true },
          { id: "b", label: "recife-livre", signal: 20 },
        ]}
        onChange={() => {}}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmSummaryList — pares rótulo/valor sem violações", async () => {
    const { container } = render(
      <CmSummaryList
        columns={2}
        items={[
          { label: "Idioma", value: "Português (Brasil)" },
          { label: "Disco", value: "nvme0n1 · 322 GB", tone: "danger", emphasis: true },
        ]}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("CmSlider — range rotulado sem violações", async () => {
    const { container } = render(
      <CmSlider label="Volume" value={40} showValue marks={[0, 50, 100]} onChange={() => {}} />,
    );
    await expectNoAxeViolations(container);
  });
});
