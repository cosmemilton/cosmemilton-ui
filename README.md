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

Esta árvore contém a V4 estável `4.0.0`. A V3 está preservada na tag `v3.22.2`.
A documentação V4 usa a biblioteca publicada, incluindo seus estilos, fontes,
temas e componentes, sem CSS próprio da aplicação.

### Composição na V4

`CmWorkbench`, `CmCanvas`, `CmInspector` e `CmFrame` compõem editores e
playgrounds com ferramentas opcionais. `CmDisclosure` organiza seções compactas;
`CmField` oferece rótulos associados, dicas de props e controles nativos.
`CmTable`, `CmSkeleton` e `CmThemeScope` permitem tabelas semânticas, estados de
carregamento e limites de tema estáticos. Layouts aceitam dimensões responsivas,
superfícies de vidro, elevação e controle de rolagem. O `CmAppShell` inclui
navegação móvel, busca com teclado e fundos `aurora`/`grid`.

Os três temas V4 são `cm-v4-light` (Claro), `cm-v4-dark` (Escuro) e
`cm-v4-aurora` (Aurora), com paletas próprias e ícones correspondentes no `CmThemeToggle`. `CmThemeProvider` também aceita
`themeName`/`onThemeChange` para controle externo e `storageKey={false}` para
pré-visualizações isoladas. A documentação demonstra essas APIs sem folhas de
estilo ou CSS inline próprios.

## Instalação

```bash
npm install cosmemilton-ui@4 react react-dom
```

`next`, `@iconify/react` e `leaflet` são _peers_ **opcionais** (`leaflet` só é
necessário para o `CmMap`, importado do entry dedicado `cosmemilton-ui/map`).

> **Nota:** o entry `cosmemilton-ui/client` referencia `CmIcon` internamente (via
> `CmSelect`). Com um bundler com tree-shaking (Next, Vite, webpack) isso não traz
> `@iconify/react` para o seu bundle se você não usar `CmIcon`/`showOptionIcons`;
> **sem** tree-shaking (ex.: `import()` direto em Node), instale `@iconify/react`
> junto com o `/client`.

## Uso

Importe o CSS público uma vez na aplicação e os componentes pelo entry point de cliente.
O CSS já inclui os tokens de todos os temas embutidos — nenhum setup de tema é
necessário para renderizar componentes estilizados (tema padrão `cm-v4-light`):

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
`<html data-theme="cm-v4-dark">`. Para sobrescrever tokens, use CSS comum:

```css
:root[data-theme="cm-v4-light"] {
  --color-primary: #7c3aed;
}
```

### Entry points

| Import                          | Conteúdo                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `cosmemilton-ui`                | Exports reais do entry `/server`, com os mesmos tipos e referências.                                                  |
| `cosmemilton-ui/client`         | Componentes interativos (cada arquivo declara `"use client"`). Use no App Router quando precisar de interatividade.   |
| `cosmemilton-ui/server`         | Componentes _server-safe_ (sem `"use client"` na cadeia). Use em React Server Components e layouts.                   |
| `cosmemilton-ui/theme`          | Tokens, temas, `CmThemeProvider`, `CmThemeToggle` e `CmThemeScript` (este _server-safe_, evita flash de tema no SSR). |
| `cosmemilton-ui/map`            | `CmMap` (wrapper de Leaflet). Entry separado para o peer opcional `leaflet` não entrar no grafo do `/client`.         |
| `cosmemilton-ui/map.css`        | CSS e imagens do Leaflet distribuídos pela biblioteca para o `CmMap`.                                                 |
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

Na V4, o entry raiz exporta apenas os componentes seguros para servidor.
Componentes interativos continuam no `/client`; temas e mapa têm entries
dedicados. A documentação inclui o guia de migração V3 → V4.

### Mapa (`CmMap`)

O `CmMap` é um wrapper fino de [Leaflet](https://leafletjs.com) com pins tonais,
popup em React, modo picker (`value`/`onPick`) e tiles que escurecem
automaticamente no tema dark. Instale o peer opcional e importe o CSS público do mapa
no layout raiz:

```bash
npm install leaflet
```

```tsx
// app/layout.tsx
import "cosmemilton-ui/styles.css";
import "cosmemilton-ui/map.css";
```

```tsx
"use client";
import { CmMap } from "cosmemilton-ui/map";

<CmMap
  markers={[{ id: 1, position: { lat: -23.55, lng: -46.63 }, label: "Imóvel A", tone: "success" }]}
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

A aparência opcional `skin="horizonte"` organiza a geometria dos controles e
mantém os comportamentos dos componentes. Suas cores e fontes acompanham
qualquer um dos três temas V4; `classic` continua sendo a aparência padrão.

O `CmDataTable` oferece [rolagem horizontal nativa](docs/data-table-scroll.md)
restrita às colunas, com filtros e paginação separados, e
[alinhamento compartilhado de ações](docs/data-table-actions.md).

O [MegaMenu e a busca em painel](docs/mega-menu.md) oferecem navegação e pesquisa
por grupos, com ícones, descrições, links, ações e teclado. Os dados e os props
definem a composição; a biblioteca fornece toda a apresentação.

Exemplos por componente, variantes, tabela de props e notas de acessibilidade nas
docs vivas:

A documentação V4 está em **https://miltonjunior.dev.br/cosmemilton-ui/v4**.
Inclui os 118 componentes públicos, playgrounds de props, 134 receitas
adicionais, recursos e guias. Para desenvolvimento local, o projeto vizinho
`cosmemilton-ui-docs-v4` usa `http://localhost:3404/v4/getting-started`.

A documentação publicada da V3 continua em
**https://miltonjunior.dev.br/cosmemilton-ui/v3**.

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
