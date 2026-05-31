# cm-ui

> Componentes React para sistemas administrativos — ESM puro, prontos para RSC/Next e usáveis em React puro (Vite/CRA).

[![npm](https://img.shields.io/npm/v/cm-ui.svg)](https://www.npmjs.com/package/cm-ui)
[![CI](https://github.com/cosmemilton/cosmemilton-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/cosmemilton/cosmemilton-ui/actions/workflows/ci.yml)
[![license: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](./LICENSE)
![types: included](https://img.shields.io/badge/types-included-blue.svg)

`cm-ui` é uma biblioteca de componentes para painéis, back-offices e dashboards:
navegação (sidebar, menus, breadcrumb), exibição de dados (data-table, tree-view,
gráficos, cards), formulários e overlays (dialog, drawer, popover, toast), com temas
e densidade configuráveis. ESM-only, três entry points e tipos TypeScript incluídos.

## Instalação

```bash
npm install cm-ui react react-dom
```

`next` e `@iconify/react` são _peers_ **opcionais**.

## Uso

Importe o CSS público uma vez na aplicação e os componentes pelo entry point de cliente:

```tsx
import "cm-ui/styles.css";
import { CmButton } from "cm-ui/client";

export function Example() {
  return <CmButton>Salvar</CmButton>;
}
```

### Entry points

| Import             | Conteúdo                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `cm-ui/client`     | Componentes interativos (cada arquivo declara `"use client"`). Use no App Router quando precisar de interatividade.   |
| `cm-ui/server`     | Componentes _server-safe_ (sem `"use client"` na cadeia). Use em React Server Components e layouts.                   |
| `cm-ui/theme`      | Tokens, temas, `CmThemeProvider`, `CmThemeToggle` e `CmThemeScript` (este _server-safe_, evita flash de tema no SSR). |
| `cm-ui/styles.css` | CSS publicado. Importe **uma vez** na aplicação.                                                                      |

> **v3** removeu o export raiz `cosmemilton-ui`. Importe sempre por um dos entry
> points acima. O guia de migração 2.x → 3.0 está nas docs vivas.

## React puro (Vite/CRA)

`cm-ui` não exige Next em runtime. Envolva a aplicação com o provider de tema:

```tsx
import "cm-ui/styles.css";
import { CmThemeProvider } from "cm-ui/theme";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <CmThemeProvider>
    <App />
  </CmThemeProvider>,
);
```

Componentes de navegação usam `<a>` por padrão; em React Router, passe um adaptador
via `linkComponent` e informe a rota ativa (ex.: `activeHref`/`activePathname`).

## Documentação

Exemplos por componente, variantes, tabela de props e notas de acessibilidade nas
docs vivas:

**https://miltonjunior.dev.br/cosmemilton-ui**

## Requisitos

- React `>=18.2 || 19` (e React DOM na mesma faixa)
- Node `>=18`
- Next `>=15` — opcional (App Router / RSC)

## Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) e o [Código de Conduta](./CODE_OF_CONDUCT.md).
Mudanças entram via [Changesets](https://github.com/changesets/changesets); o histórico
fica em [CHANGELOG.md](./CHANGELOG.md).

## Licença

[ISC](./LICENSE) © Cosme Milton
