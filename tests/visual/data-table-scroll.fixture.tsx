import { useState } from "react";
import { CmButton } from "../../src/components/ui/button.js";
import { CmDialog } from "../../src/components/ui/dialog.js";
import { CmInput } from "../../src/components/ui/input.js";
import { CmStack } from "../../src/components/ui/layout.js";
import { CmDataTable, type CmDataTableColumn } from "../../src/components/ui/data-table.js";

const rows = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1).padStart(3, "0"),
  codigo: String(index + 1).padStart(13, "0"),
  descricao: `Café especial ${String(index + 1).padStart(3, "0")}`,
  ncm: "09012100",
  venda: "12,50",
  st: "060",
  icms: "18,00",
  pisCofins: "01",
  estoque: "125,500",
  gondola: "9,000",
}));

const columns: CmDataTableColumn<(typeof rows)[number]>[] = [
  { key: "codigo", header: "Código de barras", hideable: false },
  { key: "descricao", header: "Produto", hideable: false },
  { key: "ncm", header: "NCM" },
  { key: "venda", header: "Venda", align: "right" },
  { key: "st", header: "ST ICMS" },
  { key: "icms", header: "ICMS (%)", align: "right" },
  { key: "pisCofins", header: "PIS/COFINS saída" },
  { key: "estoque", header: "Estoque", align: "right" },
  { key: "gondola", header: "Gôndola", align: "right" },
];

export function DataTableScrollFixture({
  detail = false,
  tableMinWidth = 1600,
  customHeader = false,
  empty = false,
  loading = false,
}: {
  detail?: boolean;
  tableMinWidth?: number;
  customHeader?: boolean;
  empty?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [busca, setBusca] = useState("");
  const [event, setEvent] = useState("Nenhuma exportação");
  const [selected, setSelected] = useState<string | undefined>(detail ? "001" : undefined);
  const filteredRows = rows.filter((row) =>
    row.descricao.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")),
  );

  return (
    <main data-testid="data-table-scroll-fixture">
      <CmButton onClick={() => setOpen(true)}>Abrir relatório</CmButton>
      <CmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Relatório de produtos"
        size="2xl"
        footer={<CmButton onClick={() => setOpen(false)}>Fechar relatório</CmButton>}
      >
        <CmDataTable
          columns={columns}
          data={empty ? [] : filteredRows}
          loading={loading}
          rowKey="id"
          title={customHeader ? undefined : "Produtos da loja 0002"}
          description={
            customHeader ? undefined : "Prévia de produtos com nove colunas e paginação."
          }
          header={
            customHeader ? (
              <CmStack fullWidth gap="md">
                <h3>Produtos da loja 0002</h3>
                <div
                  data-testid="custom-header-filters"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))",
                    gap: ".75rem",
                  }}
                >
                  <CmInput
                    label="Buscar produtos"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                  />
                  <CmInput label="Data inicial" type="date" defaultValue="2026-10-03" />
                  <CmInput label="Data final" type="date" defaultValue="2026-10-03" />
                  <CmButton onClick={() => setEvent("Exportação solicitada")}>Exportar</CmButton>
                </div>
              </CmStack>
            ) : undefined
          }
          tableMinWidth={tableMinWidth}
          scrollAreaLabel="Tabela de produtos"
          tableKey="visual-scroll-products"
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5, 10]}
          toolbar={
            customHeader ? undefined : (
              <CmInput
                label="Buscar produtos"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            )
          }
          actions={
            customHeader ? undefined : (
              <CmButton onClick={() => setEvent("Exportação solicitada")}>Exportar</CmButton>
            )
          }
          selectedRowKey={selected}
          onRowClick={(row) => setSelected(row.id)}
          detailPanelEnabled={detail}
          detailPanelWidth={250}
          detailEmptyMessage="Selecione um produto"
          renderSelectedRowDetail={(row) => <p>Detalhes: {row.descricao}</p>}
        />
        <output role="status">{event}</output>
      </CmDialog>
    </main>
  );
}
