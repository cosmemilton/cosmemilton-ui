# CosmeMilton UI

Biblioteca de componentes React com suporte opcional a Next para projetos Cosme Milton.

## Links

- Documentação: https://miltonjunior.dev.br/cosmemilton-ui
- Repositório: https://github.com/cosmemilton/cosmemilton-ui
- npm: https://www.npmjs.com/package/cosmemilton-ui

## Uso básico

Importe o CSS público uma vez na aplicação:

```tsx
import "cosmemilton-ui/styles.css";
```

Depois importe os componentes pelo pacote:

```tsx
import { CmAlert } from "cosmemilton-ui";
```

## React puro (Vite ou CRA)

Instale o pacote junto com os peers React:

```bash
npm install cosmemilton-ui react react-dom
```

Em apps Vite ou Create React App, importe o CSS no ponto de entrada e envolva a aplicação com o provider quando for usar temas:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "cosmemilton-ui/styles.css";
import { CmThemeProvider } from "cosmemilton-ui";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CmThemeProvider>
      <App />
    </CmThemeProvider>
  </StrictMode>,
);
```

Para registrar temas próprios em React puro, passe `customThemes` direto no provider. O `CmThemeScript` é útil em Next/App Router para evitar flash visual antes da hidratação, mas não é obrigatório em Vite ou CRA:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "cosmemilton-ui/styles.css";
import {
  CmThemeProvider,
  themes,
  type ThemeConfig,
} from "cosmemilton-ui";
import { App } from "./App";

const baseTheme = themes["cm-neutral"];

const customThemes: ThemeConfig[] = [
  {
    ...baseTheme,
    name: "cm-brand",
    colors: {
      ...baseTheme.colors,
      background: "#f8fafc",
      foreground: "#172033",
      card: "#ffffff",
      cardForeground: "#172033",
      primary: "#006b5f",
      primaryForeground: "#ffffff",
      secondary: "#395b64",
      secondaryForeground: "#ffffff",
      border: "#d7dee7",
    },
  },
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CmThemeProvider customThemes={customThemes} defaultThemeName="cm-brand">
      <App />
    </CmThemeProvider>
  </StrictMode>,
);
```

Os componentes não exigem Next em runtime. Componentes de navegação usam `<a>` por padrão; em React Router, passe um adaptador via `linkComponent` e controle o item ativo com `activeHref`:

```tsx
import { Link, useLocation } from "react-router-dom";
import { CmNavigationMenu } from "cosmemilton-ui";

const RouterLink = ({
  href,
  ...props
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) => <Link to={href} {...props} />;

export function MainNav() {
  const location = useLocation();

  return (
    <CmNavigationMenu
      activeHref={location.pathname}
      linkComponent={RouterLink}
      items={[
        { href: "/", label: "Início" },
        { href: "/clientes", label: "Clientes" },
      ]}
    />
  );
}
```

### CmSidebar com React Router

Use `href` quando quiser navegação nativa do navegador. Em SPAs com React Router, prefira `to` com `linkComponent`, ou `onSelect` com `navigate()` quando o item precisa executar lógica antes de navegar.

```tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CmIcon, CmSidebar } from "cosmemilton-ui";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <CmSidebar
      linkComponent={NavLink}
      activePathname={location.pathname}
      isActive={({ item, pathname }) => pathname === (item.to ?? item.href)}
      brand={{
        title: "CosmeMilton",
        subtitle: "Admin",
      }}
      groups={[
        {
          id: "cadastros",
          label: "Cadastros",
          items: [
            {
              id: "clientes",
              label: "Clientes",
              to: "/app/clientes",
              icon: <CmIcon name="lucide:users" />,
            },
            {
              id: "produtos",
              label: "Produtos",
              to: "/app/produtos",
              icon: <CmIcon name="lucide:package" />,
            },
          ],
        },
        {
          id: "relatorios",
          label: "Relatórios",
          direct: true,
          items: [
            {
              id: "vendas",
              label: "Vendas",
              icon: <CmIcon name="lucide:bar-chart-3" />,
              onSelect: () => navigate("/app/relatorios/vendas"),
            },
          ],
        },
      ]}
    />
  );
}
```

`linkComponent` recebe `href`, `to`, `className`, `children`, `title`, `aria-current`, `aria-disabled`, `tabIndex` e `onClick`. Isso permite usar `NavLink`, `Link` do React Router, `next/link` ou um adaptador próprio sem recarregar a página.

## Next opcional

`next` é peer opcional. Se estiver em Next, você pode continuar usando os componentes normalmente e passar `next/link` como adaptador quando quiser navegação client-side:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CmNavigationMenu } from "cosmemilton-ui";

export function MainNav() {
  const pathname = usePathname();

  return (
    <CmNavigationMenu
      activeHref={pathname}
      linkComponent={Link}
      items={[
        { href: "/", label: "Início" },
        { href: "/clientes", label: "Clientes" },
      ]}
    />
  );
}
```

## CmTreeView

Use `CmTreeView` para renderizar uma árvore pesquisável, expansível e opcionalmente arrastável. O prop da árvore se chama `data`; cada item segue o shape `CmTreeNode`:

```ts
type CmTreeNode = {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  icon?: string;
  children?: CmTreeNode[];
  parentId?: string | null;
  order?: number;
  active?: boolean;
  description?: string;
  permissionId?: number;
};
```

Campos obrigatórios:

- `id`: identificador estável do nó, usado por expansão, drag and drop e seleção.
- `name`: texto exibido no item.

Campos opcionais mais usados:

- `children`: subnós recursivos.
- `code` e `slug`: entram na busca; `code` também aparece como badge.
- `active`: quando `false`, renderiza o nó com estado visual inativo.
- `permissionId`: usado em `selectionMode` para seleção de folhas via checkbox.

Exemplo:

```tsx
import { CmTreeView, type CmTreeNode } from "cosmemilton-ui";

const nodes: CmTreeNode[] = [
  {
    id: "catalogo",
    name: "Catálogo",
    slug: "catalogo",
    children: [
      {
        id: "produtos",
        name: "Produtos",
        code: "PRD",
        permissionId: 101,
      },
    ],
  },
];

<CmTreeView
  data={nodes}
  expandedByDefault
  onAdd={(parentId) => console.log("add", parentId)}
  onEdit={(node) => console.log("edit", node)}
  onDelete={(node) => console.log("delete", node)}
/>;
```

## CmAlert

Use `CmAlert` para mensagens curtas de estado, orientação ou erro. O componente aceita quatro tons:

- `info`: mensagem neutra ou informativa.
- `success`: confirmação de operação concluída.
- `warning`: atenção antes de continuar.
- `danger`: erro, bloqueio ou risco.

### Exemplo simples

```tsx
<CmAlert
  title="Tudo certo"
  description="A operação foi concluída."
  tone="success"
/>
```

### Tons disponíveis

```tsx
<>
  <CmAlert
    title="Informação"
    description="Use para mensagens neutras."
    tone="info"
  />

  <CmAlert
    title="Tudo certo"
    description="A operação foi concluída."
    tone="success"
  />

  <CmAlert
    title="Atenção"
    description="Revise antes de continuar."
    tone="warning"
  />

  <CmAlert
    title="Não foi possível salvar"
    description="Corrija os campos destacados e tente novamente."
    tone="danger"
  />
</>
```

### Alerta que desaparece sozinho ao fechar

Passe `dismissible` para mostrar o botão de fechar. Ao clicar, o componente remove a si mesmo da tela. Esse é o exemplo que deve aparecer na documentação quando você quiser demonstrar o alerta funcionando e desaparecendo:

```tsx
<CmAlert
  dismissible
  title="Configuração salva"
  description="Este aviso desaparece ao clicar no botão de fechar."
  tone="success"
  onDismiss={() => {
    console.log("Alerta fechado");
  }}
/>
```

### Demonstração com botão para mostrar novamente

Use `open` e `onOpenChange` quando a tela precisar controlar se o alerta aparece. Esse exemplo deixa claro o ciclo completo: mostrar, fechar e mostrar novamente.

```tsx
"use client";

import { useState } from "react";
import { CmAlert, CmButton } from "cosmemilton-ui";

export function AlertDemo() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {open ? (
        <CmAlert
          dismissible
          open={open}
          onOpenChange={setOpen}
          title="Tudo certo"
          description="A operação foi concluída. Clique no × para esconder."
          tone="success"
        />
      ) : (
        <CmButton size="sm" onClick={() => setOpen(true)}>
          Mostrar alerta
        </CmButton>
      )}
    </>
  );
}
```

### Com ação

Use `action` para adicionar um botão ou link relacionado à mensagem.

```tsx
import { CmAlert, CmButton } from "cosmemilton-ui";

<CmAlert
  title="Sessão expirando"
  description="Salve suas alterações antes de continuar."
  tone="warning"
  action={<CmButton size="sm">Salvar agora</CmButton>}
/>
```

### Props

```ts
type CmAlertTone = "info" | "success" | "warning" | "danger";

type CmAlertProps = {
  title: string;
  description?: string;
  tone?: CmAlertTone;
  className?: string;
  action?: ReactNode;
  dismissible?: boolean;
  closeLabel?: string;
  onDismiss?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
```

## Componentes controlados

Componentes controlados recebem o estado atual e avisam mudanças por callback. Use `useState` no consumidor para fechar o ciclo.

### CmDialog

```tsx
"use client";

import { useState } from "react";
import { CmButton, CmDialog } from "cosmemilton-ui";

export function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CmButton onClick={() => setOpen(true)}>Abrir diálogo</CmButton>
      <CmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir cliente"
        description="Esta ação não pode ser desfeita."
        tone="danger"
        size="sm"
        footer={
          <>
            <CmButton variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </CmButton>
            <CmButton tone="danger" onClick={() => setOpen(false)}>
              Excluir
            </CmButton>
          </>
        }
      >
        Confirme antes de continuar.
      </CmDialog>
    </>
  );
}
```

### CmDrawer

```tsx
"use client";

import { useState } from "react";
import { CmButton, CmDrawer } from "cosmemilton-ui";

export function DrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CmButton onClick={() => setOpen(true)}>Abrir painel</CmButton>
      <CmDrawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title="Filtros"
      >
        Conteúdo do painel lateral.
      </CmDrawer>
    </>
  );
}
```

### CmPopover

```tsx
"use client";

import { useState } from "react";
import { CmButton, CmPopover } from "cosmemilton-ui";

export function PopoverDemo() {
  const [open, setOpen] = useState(false);

  return (
    <CmPopover
      open={open}
      onOpenChange={setOpen}
      align="end"
      trigger={({ open: isOpen, toggle, ref }) => (
        <CmButton ref={ref} onClick={toggle} aria-expanded={isOpen}>
          Opções
        </CmButton>
      )}
    >
      {({ close }) => (
        <CmButton size="sm" onClick={close}>
          Fechar popover
        </CmButton>
      )}
    </CmPopover>
  );
}
```

### CmTabs

```tsx
"use client";

import { useState } from "react";
import {
  CmTabs,
  CmTabsContent,
  CmTabsList,
  CmTabsTrigger,
} from "cosmemilton-ui";

export function TabsDemo() {
  const [tab, setTab] = useState("dados");

  return (
    <CmTabs value={tab} onValueChange={setTab} variant="folder">
      <CmTabsList>
        <CmTabsTrigger value="dados">Dados</CmTabsTrigger>
        <CmTabsTrigger value="permissoes">Permissões</CmTabsTrigger>
      </CmTabsList>
      <CmTabsContent value="dados">Dados cadastrais.</CmTabsContent>
      <CmTabsContent value="permissoes">Permissões do usuário.</CmTabsContent>
    </CmTabs>
  );
}
```

### CmToast

```tsx
"use client";

import { CmButton, CmToastProvider, useCmToast } from "cosmemilton-ui";

function SaveButton() {
  const { toast } = useCmToast();

  return (
    <CmButton
      onClick={() =>
        toast("As alterações foram salvas.", {
          title: "Tudo certo",
          tone: "success",
          duration: 4000,
        })
      }
    >
      Salvar
    </CmButton>
  );
}

export function ToastDemo() {
  return (
    <CmToastProvider>
      <SaveButton />
    </CmToastProvider>
  );
}
```

### CmTreeView

```tsx
"use client";

import { useState } from "react";
import { CmTreeView, type CmTreeNode } from "cosmemilton-ui";

const permissionTree: CmTreeNode[] = [
  {
    id: "clientes",
    name: "Clientes",
    children: [
      { id: "clientes.listar", name: "Listar", permissionId: 101 },
      { id: "clientes.editar", name: "Editar", permissionId: 102 },
    ],
  },
];

export function TreeSelectionDemo() {
  const [selectedIds, setSelectedIds] = useState(new Set<number>([101]));

  return (
    <CmTreeView
      data={permissionTree}
      expandedByDefault
      selectionMode
      selectedIds={selectedIds}
      onSelectionChange={(permissionId, checked) => {
        setSelectedIds((current) => {
          const next = new Set(current);
          if (checked) next.add(permissionId);
          else next.delete(permissionId);
          return next;
        });
      }}
    />
  );
}
```

## Dados e callbacks

### CmDataTable

`columns`, `data` e `rowKey` são obrigatórios. `column.render(row)` customiza a célula, `column.sortValue(row)` controla ordenação e `tableKey` ativa persistência de colunas visíveis no `localStorage`.

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  CmButton,
  CmDataTable,
  type CmDataTableColumn,
} from "cosmemilton-ui";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Pro" | "Enterprise";
  status: "Ativo" | "Em teste" | "Bloqueado";
  mrr: number;
  lastSeen: Date;
};

const customers: CustomerRow[] = [
  {
    id: "cus_001",
    name: "Ana Lima",
    email: "ana@acme.com",
    plan: "Pro",
    status: "Ativo",
    mrr: 890,
    lastSeen: new Date("2026-05-10"),
  },
  {
    id: "cus_002",
    name: "Bruno Alves",
    email: "bruno@orbit.com",
    plan: "Starter",
    status: "Em teste",
    mrr: 190,
    lastSeen: new Date("2026-05-08"),
  },
  {
    id: "cus_003",
    name: "Carla Rocha",
    email: "carla@north.io",
    plan: "Enterprise",
    status: "Ativo",
    mrr: 4200,
    lastSeen: new Date("2026-05-12"),
  },
];

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CustomersTableDemo() {
  const [selectedId, setSelectedId] = useState<string>();

  const columns = useMemo<CmDataTableColumn<CustomerRow>[]>(
    () => [
      { key: "name", header: "Cliente", sortable: true },
      { key: "email", header: "Email", defaultHidden: true },
      { key: "plan", header: "Plano", sortable: true },
      { key: "status", header: "Status", sortable: true },
      {
        key: "mrr",
        header: "MRR",
        align: "right",
        sortable: true,
        render: (row) => money.format(row.mrr),
      },
      {
        key: "lastSeen",
        header: "Último acesso",
        sortable: true,
        sortValue: (row) => row.lastSeen,
        render: (row) => row.lastSeen.toLocaleDateString("pt-BR"),
      },
      {
        key: "actions",
        header: "Ações",
        align: "right",
        hideable: false,
        render: (row) => (
          <CmButton
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              console.log("Editar cliente", row.id);
            }}
          >
            Editar
          </CmButton>
        ),
      },
    ],
    [],
  );

  return (
    <CmDataTable
      columns={columns}
      data={customers}
      rowKey={(row) => row.id}
      selectedRowKey={selectedId}
      onRowClick={(row) => setSelectedId(row.id)}
      tableKey="customers-table"
      defaultSortKey="mrr"
      defaultSortDirection="desc"
      defaultRowsPerPage={5}
      emptyMessage="Nenhum cliente encontrado."
    />
  );
}
```

### Gráficos

```tsx
import { CmBarChart, CmChart, CmLineChart } from "cosmemilton-ui";

const conversion = [
  { label: "Visitas", value: 1200, color: "#2563eb" },
  { label: "Leads", value: 420, color: "#16a34a" },
  { label: "Vendas", value: 96, color: "#f97316" },
];

const revenue = [
  { label: "Jan", value: 32000 },
  { label: "Fev", value: 41000 },
  { label: "Mar", value: 38000 },
  { label: "Abr", value: 52000 },
];

export function ChartsDemo() {
  return (
    <>
      <CmChart data={conversion} maxValue={1200} />
      <CmBarChart data={conversion} height={280} showGrid showValues />
      <CmLineChart data={revenue} height={240} tone="success" />
    </>
  );
}
```

### CmCalendar

`month` usa a convenção do JavaScript: `0` é janeiro, `4` é maio.

```tsx
"use client";

import { useState } from "react";
import { CmCalendar } from "cosmemilton-ui";

export function CalendarDemo() {
  const [date, setDate] = useState(new Date(2026, 4, 13));

  return (
    <CmCalendar
      value={date}
      month={4}
      year={2026}
      onSelect={(nextDate) => setDate(nextDate)}
    />
  );
}
```

### CmCommand

Selecionar um item chama `item.onSelect()` e fecha o modal.

```tsx
"use client";

import { CmButton, CmCommand, type CmCommandItem } from "cosmemilton-ui";

export function CommandDemo() {
  const items: CmCommandItem[] = [
    {
      id: "new-customer",
      label: "Novo cliente",
      keywords: ["criar", "cadastro"],
      shortcut: "N",
      onSelect: () => console.log("Novo cliente"),
    },
    {
      id: "open-invoices",
      label: "Ver faturas abertas",
      keywords: ["financeiro", "cobrança"],
      shortcut: "F",
      onSelect: () => console.log("Faturas"),
    },
  ];

  return (
    <CmCommand
      items={items}
      title="Ações rápidas"
      placeholder="Digite uma ação..."
      trigger={(open) => <CmButton onClick={open}>Abrir comandos</CmButton>}
    />
  );
}
```

### CmCombobox

`onChange` recebe o item selecionado ou `null` ao limpar. `onSearch` recebe a busca digitada com debounce de 300 ms.

```tsx
"use client";

import { useState } from "react";
import { CmCombobox, type CmComboboxItem } from "cosmemilton-ui";

const assignees: CmComboboxItem[] = [
  {
    value: "usr_ana",
    label: "Ana Lima",
    description: "Customer Success",
    keywords: "cs clientes contas",
  },
  {
    value: "usr_bruno",
    label: "Bruno Alves",
    description: "Financeiro",
    keywords: "cobrança faturas",
  },
];

export function ComboboxDemo() {
  const [selected, setSelected] = useState<CmComboboxItem | null>(assignees[0]);

  return (
    <CmCombobox
      items={assignees}
      value={selected?.value ?? ""}
      onChange={setSelected}
      onSearch={(query) => console.log("Buscar responsáveis por", query)}
      name="assigneeId"
      label="Responsável"
      placeholder="Buscar pessoa ou equipe..."
      helperText="A seleção também preenche o campo hidden do formulário."
      emptyState={<span>Nenhum responsável encontrado.</span>}
      selectedDisplay="label"
    />
  );
}
```

## Header compacto com tema

Para headers compactos, use `CmThemeToggle` com `presentation="compact"` ou componha o menu manualmente quando quiser controlar rótulos, ícones e ordenação.

```tsx
"use client";

import { CmButton, CmDropdownMenu, useCmTheme } from "cosmemilton-ui";

const themeLabel = (name: string) => name.replace("cm-", "");

export function HeaderThemeMenu() {
  const { theme, themes, setThemeByName } = useCmTheme();

  return (
    <CmDropdownMenu
      align="end"
      trigger={({ open, toggle, ref }) => (
        <CmButton ref={ref} size="sm" variant="ghost" onClick={toggle}>
          {themeLabel(theme.name)}
        </CmButton>
      )}
      items={Object.values(themes).map((candidate) => ({
        id: candidate.name,
        label: themeLabel(candidate.name),
        shortcut: candidate.name === theme.name ? "Atual" : undefined,
        onSelect: () => setThemeByName(candidate.name),
      }))}
    />
  );
}
```
