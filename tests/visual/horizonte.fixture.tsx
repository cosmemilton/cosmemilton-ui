import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CmThemeProvider, useCmTheme } from "../../src/components/theme/theme-provider.js";
import { CmTreeView, type CmTreeNode } from "../../src/components/ui/tree-view.js";
import { CmInput } from "../../src/components/ui/input.js";
import { CmSelect } from "../../src/components/ui/select.js";
import { CmTextarea } from "../../src/components/ui/textarea.js";
import { CmButton } from "../../src/components/ui/button.js";
import { CmUserMenu, type CmUserMenuPresentation } from "../../src/components/ui/user-menu.js";
import {
  CmDataTable,
  CmDataTableActions,
  type CmDataTableColumn,
} from "../../src/components/ui/data-table.js";
import { Eye, Grid2X2, LogOut, PanelsTopLeft, Pencil, Settings, UserRoundX } from "lucide-react";
import { DataTableScrollFixture } from "./data-table-scroll.fixture.js";

const initialNodes: CmTreeNode[] = [
  {
    id: "bebidas",
    name: "Bebidas",
    active: true,
    children: [
      { id: "cafe", name: "Café especial", parentId: "bebidas", active: true },
      { id: "cha", name: "Chá verde", parentId: "bebidas", active: true },
    ],
  },
  {
    id: "alimentos",
    name: "Alimentos",
    active: true,
    children: [
      { id: "arroz", name: "Arroz integral", parentId: "alimentos", active: true },
      { id: "feijao", name: "Feijão preto", parentId: "alimentos", active: true },
    ],
  },
  {
    id: "limpeza",
    name: "Limpeza",
    active: true,
    children: [{ id: "sabao", name: "Sabão neutro", parentId: "limpeza", active: true }],
  },
];

function HorizonteFixture() {
  const { theme, setThemeByName } = useCmTheme();
  const [nodes, setNodes] = useState(initialNodes);
  const [event, setEvent] = useState("Nenhum movimento");
  const [city, setCity] = useState("");

  return (
    <main className="horizonte-fixture" data-testid="horizonte-fixture">
      <header className="horizonte-fixture__header">
        <div>
          <h1 className="cm-page-header__title">Componentes Horizonte</h1>
          <p>Validação com componentes reais · dados fictícios</p>
        </div>
        <CmButton
          onClick={() =>
            setThemeByName(
              theme.name === "cm-horizonte-light" ? "cm-horizonte-dark" : "cm-horizonte-light",
            )
          }
        >
          Alternar tema
        </CmButton>
      </header>

      <div className="horizonte-fixture__grid">
        <section aria-label="Categorias de produtos">
          <CmTreeView
            data={nodes}
            expandedByDefault
            draggable
            dropMode="auto"
            onReorder={setNodes}
            onMove={(id, parent, order, details) =>
              setEvent(`${id} → ${parent ?? "raiz"}; ${details.position}; ${order}`)
            }
            onEdit={(node) => setEvent(`Editar ${node.name}`)}
            onDelete={(node) => setEvent(`Excluir ${node.name}`)}
          />
          <p role="status">{event}</p>
        </section>

        <section className="horizonte-fixture__fields" aria-label="Estados dos campos">
          <CmInput label="Nome vazio" clearable />
          <CmInput label="Nome preenchido" defaultValue="Ana Beatriz" clearable />
          <CmInput label="Nome inválido" error="Informe o nome completo." defaultValue="Ana" />
          <CmInput label="Código somente leitura" value="000012" readOnly />
          <CmInput label="Campo desabilitado" value="Indisponível" disabled />
          <CmInput label="Densidade compacta" density="compact" />
          <CmSelect
            label="Município"
            value={city}
            onChange={setCity}
            options={[
              { value: "recife", label: "Recife" },
              { value: "fortaleza", label: "Fortaleza" },
            ]}
          />
          <CmTextarea label="Observações" defaultValue="Cliente prefere contato por e-mail." />
          <CmButton tone="primary">Salvar cliente</CmButton>
        </section>
      </div>
    </main>
  );
}

function UserMenuFixture() {
  const { theme, setThemeByName } = useCmTheme();
  const [event, setEvent] = useState("Nenhuma ação");
  const presentations: CmUserMenuPresentation[] = ["slim", "default", "compact"];

  return (
    <main className="user-menu-fixture" data-testid="user-menu-fixture">
      <header className="user-menu-fixture__heading">
        <div>
          <h1>Menu do usuário</h1>
          <p>Componentes reais · identidade de teste</p>
        </div>
        <CmButton
          onClick={() =>
            setThemeByName(
              theme.name === "cm-horizonte-dark" ? "cm-horizonte-light" : "cm-horizonte-dark",
            )
          }
        >
          Alternar tema
        </CmButton>
      </header>
      {presentations.map((presentation) => (
        <section
          className={`user-menu-fixture__example user-menu-fixture__example--${presentation}`}
          data-testid={`user-menu-${presentation}`}
          aria-label={`Apresentação ${presentation}`}
          key={presentation}
        >
          <div className="user-menu-fixture__bar">
            <h2>{presentation}</h2>
            <CmUserMenu
              presentation={presentation}
              menuHeader={presentation === "slim" ? "always" : undefined}
              user={{ title: "Milton Andrade", subtitle: "Administrador", initials: "MA" }}
              items={[
                {
                  id: "products",
                  label: "Meus produtos",
                  icon: <Grid2X2 size={16} />,
                  onSelect: () => setEvent(`${presentation}: produtos`),
                },
                {
                  id: "settings",
                  label: "Preferências",
                  icon: <Settings size={16} />,
                  disabled: true,
                },
                { type: "separator", id: "account" },
                {
                  id: "logout",
                  label: "Sair",
                  icon: <LogOut size={16} />,
                  danger: true,
                  onSelect: () => setEvent(`${presentation}: sair`),
                },
              ]}
            />
          </div>
        </section>
      ))}
      <footer className="user-menu-fixture__footer">
        <CmButton data-testid="user-menu-outside">Área fora do menu</CmButton>
        <output data-testid="user-menu-event" aria-live="polite">
          {event}
        </output>
      </footer>
    </main>
  );
}

function DataTableFixture() {
  const [event, setEvent] = useState("Nenhuma ação");
  const rows = [{ id: "0012", name: "Ana Beatriz", city: "Recife · PE" }];
  const alignments = ["left", "center", "right"] as const;
  const tableColumns: CmDataTableColumn<(typeof rows)[number]>[] = [
    { key: "id", header: "Código", align: "right" },
    { key: "name", header: "Cliente", render: (row) => <strong>{row.name}</strong> },
    { key: "city", header: "Município" },
    ...alignments.map((align) => ({
      key: align,
      header: { left: "Esquerda", center: "Ações", right: "Direita" }[align],
      align,
      hideable: false,
      render: () => (
        <CmDataTableActions data-testid={`actions-${align}`}>
          {[
            { label: "Visualizar", icon: Eye },
            { label: "Cadastro completo", icon: PanelsTopLeft },
            { label: "Editar", icon: Pencil },
            { label: "Inativar", icon: UserRoundX },
          ].map(({ label, icon: Icon }) => (
            <CmButton
              key={label}
              size="sm"
              variant="ghost"
              iconOnly
              icon={<Icon size={15} />}
              aria-label={label}
              onClick={(click) => {
                click.stopPropagation();
                setEvent(`${align}: ${label}`);
              }}
            />
          ))}
        </CmDataTableActions>
      ),
    })),
  ];

  return (
    <main className="data-table-fixture" data-testid="data-table-fixture">
      <h1 className="cm-page-header__title">Alinhamento das ações</h1>
      <p>Componentes reais · dados fictícios</p>
      <CmDataTable
        columns={tableColumns}
        data={rows}
        rowKey="id"
        tableKey="visual-actions-columns"
        pagination={false}
        title="Clientes"
        description="Cabeçalhos e ações compartilham o alinhamento da coluna."
        actions={<CmButton>Exportar</CmButton>}
        onRowClick={() => setEvent("Linha selecionada")}
      />
      <output role="status">{event}</output>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Horizonte fixture root not found");
const params = new URLSearchParams(window.location.search);
const fixture = params.get("fixture");
const skin = params.get("skin") === "classic" ? "classic" : "horizonte";
const theme = params.get("theme") === "dark" ? "dark" : "light";
createRoot(root).render(
  <CmThemeProvider
    skin={skin}
    defaultThemeName={
      skin === "horizonte" ? `cm-horizonte-${theme}` : theme === "dark" ? "cm-dark" : "cm-neutral"
    }
    chrome="surface"
  >
    {fixture === "user-menu" ? (
      <UserMenuFixture />
    ) : fixture === "data-table" ? (
      <DataTableFixture />
    ) : fixture === "data-table-scroll" ? (
      <DataTableScrollFixture
        detail={params.get("detail") === "true"}
        tableMinWidth={params.get("tableWidth") === "600" ? 600 : 1600}
      />
    ) : (
      <HorizonteFixture />
    )}
  </CmThemeProvider>,
);
