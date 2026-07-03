# cosmemilton-ui

> Componentes React para sistemas administrativos — ESM para RSC/Next/Vite e bundle global para uso direto no navegador.

[![npm](https://img.shields.io/npm/v/cosmemilton-ui.svg)](https://www.npmjs.com/package/cosmemilton-ui)
[![CI](https://github.com/cosmemilton/cosmemilton-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/cosmemilton/cosmemilton-ui/actions/workflows/ci.yml)
[![license: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](./LICENSE)
![types: included](https://img.shields.io/badge/types-included-blue.svg)

`cosmemilton-ui` é uma biblioteca de componentes para painéis, back-offices e dashboards:
navegação (sidebar, menus, breadcrumb), exibição de dados (data-table, tree-view,
gráficos, cards), formulários e overlays (dialog, drawer, popover, toast), com temas
e densidade configuráveis. Possui três entry points ESM, tipos TypeScript e um bundle
global opcional para páginas sem bundler.

## Instalação

```bash
npm install cosmemilton-ui react react-dom
```

`next`, `@iconify/react` e `leaflet` são _peers_ **opcionais** (`leaflet` só é
necessário para o `CmMap`, importado do entry dedicado `cosmemilton-ui/map`).

> **Nota:** o entry `cosmemilton-ui/client` referencia `CmIcon` internamente (via
> `CmSelect`). Com um bundler com tree-shaking (Next, Vite, webpack) isso não traz
> `@iconify/react` para o seu bundle se você não usar `CmIcon`/`showOptionIcons`;
> **sem** tree-shaking (ex.: `import()` direto em Node), instale `@iconify/react`
> junto com o `/client`. A v4 tornará `SelectOption.icon` um `ReactNode`, removendo
> essa referência.

## Uso

Importe o CSS público uma vez na aplicação e os componentes pelo entry point de cliente.
O CSS já inclui os tokens de todos os temas embutidos — nenhum setup de tema é
necessário para renderizar componentes estilizados (tema padrão `cm-neutral`):

```tsx
import "cosmemilton-ui/styles.css";
import { CmButton } from "cosmemilton-ui/client";

export function Example() {
  return <CmButton>Salvar</CmButton>;
}
```

### Uso direto no navegador

Também é possível carregar a biblioteca como um script global, sem bundler. O JavaScript
expõe `window.CmUI`; o CSS continua sendo carregado separadamente. Fixe uma versão real no
lugar de `VERSION` para ter builds reproduzíveis:

```html
<link rel="stylesheet" href="https://unpkg.com/cosmemilton-ui@VERSION/styles.min.css" />

<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
></script>
<script src="https://unpkg.com/cosmemilton-ui@VERSION"></script>

<div id="root"></div>
<script>
  const { CmButton } = window.CmUI;
  const button = React.createElement(CmButton, null, "Salvar");
  ReactDOM.createRoot(document.getElementById("root")).render(button);
</script>
```

O mesmo arquivo pode ser referenciado explicitamente por
`cosmemilton-ui@VERSION/dist/cm-ui.min.js`. Esse bundle não inclui React nem ReactDOM,
evitando cópias duplicadas; os entry points ESM existentes continuam inalterados.

Para **trocar de tema** (e lembrar a escolha do usuário sem flash no SSR), adicione o
`CmThemeScript` no `<head>` do layout — Next App Router:

```tsx
// app/layout.tsx
import "cosmemilton-ui/styles.css";
import { CmThemeScript } from "cosmemilton-ui/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <CmThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Qualquer tema embutido também pode ser fixado sem JavaScript:
`<html data-theme="cm-dark">`. Para sobrescrever tokens, use CSS comum:

```css
:root[data-theme="cm-neutral"] {
  --color-primary: #7c3aed;
}
```

### Entry points

| Import                          | Conteúdo                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `cosmemilton-ui/client`         | Componentes interativos (cada arquivo declara `"use client"`). Use no App Router quando precisar de interatividade.   |
| `cosmemilton-ui/server`         | Componentes _server-safe_ (sem `"use client"` na cadeia). Use em React Server Components e layouts.                   |
| `cosmemilton-ui/theme`          | Tokens, temas, `CmThemeProvider`, `CmThemeToggle` e `CmThemeScript` (este _server-safe_, evita flash de tema no SSR). |
| `cosmemilton-ui/map`            | `CmMap` (wrapper de Leaflet). Entry separado para o peer opcional `leaflet` não entrar no grafo do `/client`.         |
| `cosmemilton-ui/styles.css`     | CSS publicado. Importe **uma vez** na aplicação.                                                                      |
| `cosmemilton-ui/components.css` | CSS **sem o reset global** — para adoção incremental em apps existentes (o estilo da página continua do app).         |

Componentes de layout/texto server-safe usados com frequência dentro de Client
Components — `CmBox`, `CmStack`, `CmRow`, `CmCol`, `CmContainer`, `CmText`,
`CmTopbar`, `CmForm` e `CmField` — são exportados **nos dois entries** (`/client`
e `/server`), então um arquivo `"use client"` pode importar tudo de
`cosmemilton-ui/client`.

Ambos também existem minificados (`styles.min.css`, `components.min.css`). Todo o CSS
é publicado dentro de `@layer cm.reset, cm.tokens, cm.components` — qualquer CSS seu
fora de layer sempre vence o da biblioteca, sem guerra de especificidade.

> **v3** removeu o export raiz `cosmemilton-ui`. Importe sempre por um dos entry
> points acima. O guia de migração 2.x → 3.0 está nas docs vivas.

### Mapa (`CmMap`)

O `CmMap` é um wrapper fino de [Leaflet](https://leafletjs.com) com pins tonais,
popup em React, modo picker (`value`/`onPick`) e tiles que escurecem
automaticamente no tema dark. Instale o peer opcional e importe o CSS do Leaflet
no layout raiz:

```bash
npm install leaflet
```

```tsx
// app/layout.tsx
import "cosmemilton-ui/styles.css";
import "leaflet/dist/leaflet.css";
```

```tsx
"use client";
import { CmMap } from "cosmemilton-ui/map";

<CmMap
  markers={[
    { id: 1, position: { lat: -23.55, lng: -46.63 }, label: "Imóvel A", tone: "success" },
  ]}
  onMarkerClick={(marker) => console.log(marker.id)}
/>;

// Seleção de coordenada (ex.: cadastro de imóvel):
<CmMap value={coords} onPick={setCoords} zoom={15} center={coords ?? undefined} />;
```

O componente carrega o Leaflet dinamicamente só no cliente (SSR-safe, sem
`next/dynamic`) e, sem `center`, enquadra os `markers` automaticamente.

## React puro (Vite/CRA)

`cosmemilton-ui` não exige Next em runtime. Importar o CSS basta para renderizar; o
provider de tema é necessário apenas para troca de tema em runtime (`CmThemeToggle`,
`useCmTheme`, persistência em `localStorage`, temas custom):

```tsx
import "cosmemilton-ui/styles.css";
import { CmThemeProvider } from "cosmemilton-ui/theme";
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

**https://miltonjunior.dev.br/cosmemilton-ui/v3**

## Requisitos

- React `>=18.2 || 19` (e React DOM na mesma faixa)
- Node `>=18`
- Next `>=15` — opcional (App Router / RSC)
- Leaflet `>=1.9` — opcional (apenas para `cosmemilton-ui/map`)

## Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) e o [Código de Conduta](./CODE_OF_CONDUCT.md).
Mudanças entram via [Changesets](https://github.com/changesets/changesets); o histórico
fica em [CHANGELOG.md](./CHANGELOG.md).

## Licença

[ISC](./LICENSE) © Cosme Milton
