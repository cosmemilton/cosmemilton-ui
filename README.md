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
