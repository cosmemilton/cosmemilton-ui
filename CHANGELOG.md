# Changelog

## 3.15.0

### Minor Changes

- CmMap: adiciona o campo `color` em `CmMapMarker` — cor livre do pin (hex, rgb(), var(...), nome), sobrepondo `tone`.
- Adiciona `CmSignaturePad` (entry `/client`): captura de assinatura manuscrita via canvas (mouse/touch/caneta), com fundo branco, suporte a `devicePixelRatio`, `name` (sincroniza `<input type="hidden">`), `defaultValue` para pré-carregar uma assinatura existente, `onChange(dataUrl)` e `apiRef` (`clear`/`isEmpty`/`toDataURL`/`toSVG`).
- CmTreeView: adiciona a prop `nodeActions(node)`, que retorna ações customizadas por nó (ex.: "clonar"), renderizadas entre editar e remover.

## 3.14.0

### Minor Changes

- Fecha as duas lacunas de componente apontadas no feedback do Admin (itens 0.8 e 0.9):
  - `CmScheduler` (novo, em `cosmemilton-ui/client`) — agenda com visões **dia/semana** e
    grade de horários: eventos com início/fim (aceita `Date` ou string ISO, serializável de
    RSC), cores por `tone` ou `color` explícita (ex.: por vistoriador), empacotamento de
    eventos sobrepostos em colunas, slots clicáveis (`onSlotClick`), `onEventClick`,
    `renderEvent` para conteúdo customizado, linha do horário atual, toolbar com navegação
    (anterior/hoje/próximo) e troca de visão — tudo controlável (`view`/`date` controlados ou
    não), com `startHour`/`endHour`/`slotMinutes`/`hourHeight`, `weekStartsOn`,
    `hideWeekends` e rótulos em pt-BR.
  - `CmMap` (novo, no entry dedicado **`cosmemilton-ui/map`**) — wrapper fino de Leaflet com
    `markers` (pins tonais via tokens do tema, `label` acessível, popup em **React** via
    portal), modo picker (`value` + `onPick`, com pin arrastável), `onMarkerClick`,
    enquadramento automático dos markers (`fitMarkers`), tiles OSM por padrão
    (`tileUrl`/`tileAttribution` configuráveis) e **escurecimento automático dos tiles no
    tema dark** (segue o `color-scheme` resolvido dos tokens, funciona com temas
    white-label). O componente importa o Leaflet dinamicamente só no cliente (SSR-safe sem
    `next/dynamic`) e degrada com aviso claro quando o peer não está instalado.

    `leaflet` entra como **peer opcional** (`>=1.9`) e fica num entry separado de propósito:
    a lição do `@iconify/react` no `/client` (item 0.2) é que dependência no grafo do entry
    vira dependência obrigatória do consumidor. Quem usa o mapa instala `leaflet` e importa
    `leaflet/dist/leaflet.css` no layout raiz; quem não usa não é afetado. O bundle global
    `window.CmUI` não inclui o `CmMap` pelo mesmo motivo.

## 3.13.0

### Minor Changes

- Melhorias motivadas pelo feedback de uso em um Admin com Next.js App Router:
  - `CmTopbar`, `CmText`, `CmForm`, `CmField` e os primitives de layout (`CmStack`, `CmRow`, `CmCol`, `CmContainer`) agora também são exportados de `cosmemilton-ui/client` (mesma referência do `/server`, como já ocorria com `CmBox`), permitindo montar headers e formulários inteiros dentro de Client Components sem misturar entries.
  - `CmDataTable` aceita `rowKey` como nome de campo (`rowKey="id"`), além da forma função. A forma string é serializável e pode ser passada de Server Components para o client sem wrapper.
  - `CmRichTextEditor` ganha slots `toolbarStart`/`toolbarEnd` para conteúdo customizado na toolbar (ex.: botão de emoji) e a prop `editorApiRef` com a API imperativa `CmRichTextEditorHandle` (`insertText`, `insertHtml`, `exec`, `focus`), que insere na posição do cursor restaurando a última seleção.
  - Documentação: o entry `/client` referencia `CmIcon` via `CmSelect`; sem bundler com tree-shaking, instale o peer opcional `@iconify/react`. A v4 mudará `SelectOption.icon` para `ReactNode` e removerá essa referência.

- 50ed7ba: Adiciona controles automáticos de navegação quando o cabeçalho de `CmTabs` transborda, em todas as variantes, mantendo a barra de rolagem oculta e movendo apenas as abas. Corrige também a altura de `CmInput` com botões de início/fim, faz `CmIcon` sem `size` herdar um tamanho contextual do botão, aplica a cor de sucesso ao helper de `CmInput`, `CmSelect` e `CmCombobox`, e melhora o contraste do `CmSwitch` ligado em topbars e sidebars invertidas. O fluxo de publicação agora executa regressão visual em Chromium para o alinhamento dos controles, as cores de feedback e os estados do Switch.

## 3.11.0

### Minor Changes

- Adiciona um bundle global `CmUI` para uso direto via `<script>` sem alterar os entry points ESM existentes. Também corrige o overflow de abas `folder` dentro de dialogs e amplia o DnD do `CmTreeView` com drop hierárquico opt-in, validação via `canDrop`, arraste por nó, respeito a `maxDepth` e metadados de origem/destino.

## 3.8.0

### Minor Changes

- Add `contentPadding` to `CmAppShell` — the scrollable content area (`.cm-app-shell__content`) was always edge-to-edge, forcing consumers to wrap children in a glue class just to breathe.

  `contentPadding` accepts a spacing token (`none`/`xs`/`sm`/`md`/`lg`), raw CSS shorthand (`"1rem 2rem"`) or a px number, and is applied via the `--cm-app-shell-content-padding` variable. The default stays `0`, so existing layouts and full-bleed content are unchanged.

- Add `CmGauge` — radial/donut progress component (server-safe / RSC-ready, exported from `cosmemilton-ui/server`).

  Fills the "progress radial / gauge / donut" gap: an SVG ring with `value`/`min`/`max`, `tone` (mapped to theme tokens) or explicit `color`/`trackColor`, configurable `size`/`thickness`, rounded caps, partial-arc gauge mode via `arc`/`startAngle`, centered percentage with optional `label`, custom `valueFormat`, and fully custom center `children`. Exposes `role="progressbar"` with `aria-valuenow/min/max/valuetext`.

- Add `CmStatusDot` — small tonal status indicator (server-safe / RSC-ready, exported from `cosmemilton-ui/server`).

  Fills the "status dot / indicator" gap (sidebar item status, system status, bottom bar). Renders a colored circle with `tone` (mapped to theme tokens; `default` = neutral/gray), `size` (`sm`/`md`/`lg`) and an optional pulsing `pulse` halo that respects `prefers-reduced-motion`. Pass `label` to expose an accessible name as screen-reader-only text — without it the dot is purely decorative, since color alone isn't accessible.

- Add `CmTimeline` — vertical timeline / activity-feed component (server-safe / RSC-ready, exported from `cosmemilton-ui/server`).

  Fills the "timeline / activity feed + vertical rail" gap: a data-driven `items` list where each entry renders a marker on a connected vertical rail plus content. Per-item `label` (opposite column, e.g. timestamp), `marker` (custom icon, defaults to a toned dot), `tone` (mapped to theme tokens, with a timeline-level default), `title`/`description` or arbitrary `content`, and a `trailing` slot (e.g. a badge). `labelWidth` keeps the opposite column aligned.

  The rail is a continuous line that meets the dots exactly (trimmed at the first and last marker centers). `variant` switches the look: `default` (subtle border rail, larger markers) or `connected` (continuous accent-tinted rail with compact dots — classic activity-feed look).

- Add a `grow` prop to `CmRow`, `CmCol` and `CmStack` — the shortcut for flex children that share space.

  `grow` (`true` = weight 1, or a number for a custom weight) applies `flex: <n> 1 0`, removing the repetitive `style={{ flex: 1, minWidth: 0 }}` needed for two-column splits and fill-remaining layouts. (`min-width: 0` is already the default on the layout primitives, so it no longer has to be repeated either.)

- Add `belowGroups` to `CmSidebar` — a slot rendered right after the menu groups, inside the scrollable nav area.

  Previously the only in-sidebar slot was `footer` (pinned to the bottom), so content that should flow directly under the menu (e.g. a project switcher with status dots) had nowhere to go. `belowGroups` fills that gap; it scrolls together with the menu and is hidden automatically when the sidebar is collapsed (icon-only). The footer stays pinned and existing layouts are unchanged.

  Also adds the optional `belowGroupsDivider` (default `false`) — draws a divider line between the menu and `belowGroups`, inset to align with the nav items.

- `CmText`: extend `size` scale beyond `lg` with `xl`, `2xl` and `3xl` (display/heading sizes).

  Previously `size` capped at `lg` (1.125rem), so rendering a prominent value (e.g. a gauge's "96%") required an inline `fontSize`. The new sizes follow the existing type scale up to 1.875rem (matching `CmMetricCard`'s value), removing the need for inline overrides.

- Enhance `CmProgress` with accessible-only labels and value display.
  - `srOnlyLabel` keeps `label` as the bar's accessible name without rendering visible text (was previously the only way to get a meaningful name, but always forced a visible label).
  - `showValue` renders the percentage to the right of the label; `valueFormat` customizes that text (e.g. `350/500`).
  - Adds `min` support so `value`/percent normalize against a custom range, mirroring `CmGauge`.

  The accessible name and value come from the native `<progress>` element, so the visual header is marked `aria-hidden` to avoid double announcement. Existing usage (`label` only) keeps rendering a visible label.

### Patch Changes

- Fix `CmItem` `title` typing so it accepts any `ReactNode` (e.g. an icon + text), not just a string.

  `CmItemProps` extended `HTMLAttributes<HTMLElement>`, whose native `title` (string) intersected with the component's `title: ReactNode` to produce `string & ReactNode` — so passing an element raised a type error even though it rendered fine at runtime. The native `title` is now omitted before redeclaring it.

## 3.7.0

### Minor Changes

- CmTreeView: controles nativos, modo solitário imediato e limite de níveis
  - Modo Solitário agora recolhe os ramos irmãos imediatamente ao ser ligado (mantendo um caminho aberto por nível), em vez de só passar a valer no próximo clique.
  - Botões nativos de expandir/recolher passaram para a barra de controles, logo após o switch "Modo Solitário", com estilo flat (sem caixa). Novos props `showExpandCollapse`, `showSolitaryToggle` e `controlsSlot` permitem ocultar ou substituir esses controles.
  - Badges de código e estados de arraste/hover dos nós foram ajustados para legibilidade (não dependem mais de `--color-accent` saturado como fundo).
  - Polimento visual: linhas-guia de indentação (rails) ligando os subnós ao pai (alinhadas em todos os modos, inclusive com arraste — o grip saiu do fluxo para não deslocar o conteúdo), ícone de pasta aberta nos nós expandidos, e botões de CRUD pequenos e flat com ícones coloridos por ação (adicionar/editar/excluir) que não aumentam a altura da linha.
  - `maxDepth` continua limitando a profundidade — ao atingir o último nível permitido, o botão de adicionar subitem some automaticamente (comportamento agora coberto por testes).
  - `headerText.solitaryMode` permite traduzir o rótulo do switch.
  - Ícones customizáveis (opcional, default inalterado): props `branchIcon`, `branchOpenIcon` e `leafIcon` trocam os ícones padrão (pasta fechada/aberta/folha), e `CmTreeNode.icon` (agora `ReactNode`) define um ícone por item, com precedência sobre os padrões.

## 3.6.0

### Minor Changes

- Densidade: CmAppShell agora publica `data-density` no elemento raiz, fazendo a prop `density` cascatear de verdade para topbar, formulários e conteúdo (antes a classe `cm-density-*` só estilizava o próprio shell). CmThemeScript ganhou a prop `defaultDensity` e passa a aplicar o `data-density` persistido (localStorage `cm-density`) antes do primeiro paint, eliminando o flash de densidade e a divergência entre origens que só se manifestava após a hidratação.
- CmInput, CmSelect, CmCombobox e CmMultiSelect ganham o prop `width` (string ou número → px): aplica `width`/`min-width` e `flex: 0 0` na raiz do campo, permitindo fixar a largura direto em linhas flex (CmRow) sem div wrapper. Em CmInput, o atributo HTML legado `width` deixa de ser repassado ao `<input>`.
- CmToastProvider: descansar o mouse sobre um toast (ou levar o foco do teclado para dentro dele) pausa a contagem regressiva — timer de dismiss e barra de progresso congelam juntos — e ao sair a contagem retoma só o tempo restante.

### Patch Changes

- CmDataTable: o painel de detalhes agora estica junto com o layout e nunca fica mais baixo que a tabela, então o bridge da linha selecionada sempre encontra o painel em vez de apontar para o vazio. As pontas externas (tab e bridge) passam a "emergir por baixo" da tabela — terminam rente à borda do card, com a borda cruzando por cima e sombra interna no encontro — e a linha selecionada ganha marcadores internos de 3px num tom mais claro junto às duas bordas, ecoando a continuação da faixa (no modo detail eles substituem a faixa sólida de 3px da seleção).
- CmSidebar: subitens de grupo redesenhados em estilo "trilho" — os marcadores viram nós de uma linha vertical contínua, o item ativo ganha pílula com anel de 1px e o segmento do trilho acende com a identidade da barra de destaque dos itens de topo (com variante própria para tom brand/chrome invertido, onde os estados usam o foreground da marca). O painel de subitens aberto também ganha um respiro de 0.375rem abaixo do gatilho do grupo.

## 3.5.0

### Minor Changes

- Temas escuros mais nítidos: `cm-dark`, `cm-midnight` e `cm-aurora` trocaram as sombras com glow colorido difuso por sombras pretas compactas com anel de 1px; o `cm-aurora` também teve as tinturas dos `layers` reduzidas (10–18% → 4–6%) e o `cm-dark` ganhou `border`/`input` levemente mais claros.
- `CmToast`: barra de contagem regressiva na borda inferior (`.cm-toast__progress`), sincronizada com o `duration` do toast e colorida pelo tom (`--cm-toast-accent`). Respeita `prefers-reduced-motion`.
- `CmDialog`: header reestruturado — a faixa tingida pelo `tone` contém apenas o título (agora colorido com o tom via `color-mix`), e a `description` renderiza no corpo, com fundo próprio e `aria-describedby` preservado. A barra de tom virou cor sólida e o degradê diagonal do header foi substituído por tinta chapada.
- `CmLink`: `variant="button"` + `tone="primary"` agora rende um botão sólido na cor primária (CTA).
- Grid: cards (`CmCard`, `CmMetricCard`, `CmLink variant="card"`) dentro de `CmGrid` acompanham a altura da linha (`height: 100%`) — linhas com conteúdos diferentes ficam com alturas iguais.
- Topbar com `tone="brand"`/chrome invertido: `CmText` solto nos slots agora adapta os tons neutros (`default`/`primary` → fg da marca, `muted` → fg translúcido); tons semânticos ficam intactos.

### Patch Changes

- `CmMetricCard` renderiza em React Server Components: os handlers de clique/teclado só são anexados quando o card é interativo (antes o componente sempre passava `onKeyDown`, o que quebrava em RSC).
- `CmButton`: removido o remapeamento silencioso de `danger`/`warning` → `primary` quando `invertHeader` estava ativo — botões destrutivos mantêm a cor semântica em qualquer chrome.
- `CmDialog`: zerados os margins default de `h2`/`p` do título e da descrição (o margin nativo do browser inflava o header).

## 3.4.0

### Minor Changes

- CSS publicado em cascade layers e novos bundles:
  - Todo o CSS agora vem dentro de `@layer cm.reset, cm.tokens, cm.components` — CSS do consumidor fora de layer sempre vence o da biblioteca, sem guerra de especificidade.
  - Novo `cosmemilton-ui/components.css`: bundle **sem o reset global** (sem estilos em `body`/`html`/`a`/etc.), com um reboot escopado de especificidade zero (`:where`) restrito às subárvores `.cm-*` — adoção incremental em apps existentes sem alterar a página.
  - Versões minificadas publicadas: `cosmemilton-ui/styles.min.css` e `cosmemilton-ui/components.min.css`.
  - Pipeline de CSS com PostCSS: autoprefixer + cssnano sobre o alvo de browsers em `.browserslistrc` (piso `color-mix()`, baseline 2023); o build agora falha se algum partial tiver erro de sintaxe.
  - Higiene de pacote: export `./package.json`; `dist/index.js` (guard de migração do entry raiz) declarado em `sideEffects` para não ser removido por tree-shaking; peer `next` simplificado para `>=15`.

- Navegação completa por teclado em `CmSelect`, `CmMultiSelect` e `CmCombobox` (padrões WAI-ARIA listbox/combobox):
  - Novo hook `useListboxKeyboard`: setas (↑/↓), `Home`/`End`, `Enter`/`Espaço`, `Tab`, typeahead com acúmulo de prefixo, destaque via `aria-activedescendant` (foco DOM permanece no gatilho) e `scrollIntoView` do item ativo.
  - Gatilhos agora expõem `role="combobox"` + `aria-controls`; opções recebem `id` estável, `tabIndex={-1}` e estado visual `--active` que acompanha teclado e mouse.
  - `CmMultiSelect`: `Enter`/`Espaço` alternam a opção sem fechar o popup.
  - `CmCombobox`: input com `role="combobox"`/`aria-autocomplete="list"`, setas navegam a lista filtrada (destaque segue o primeiro resultado ao digitar), `Enter` seleciona, `Escape` fecha (antes não havia handler de Escape).
  - **Observação para testes dos consumidores:** o gatilho do select/multi-select agora tem role `combobox` (antes `button`) — queries como `getByRole("button", { name: … })` devem virar `getByRole("combobox", { name: … })`.

- Temas como CSS estático: todos os temas embutidos agora são publicados dentro de `styles.css` (`:root` + um bloco `:root[data-theme="…"]` por tema), gerados no build a partir do registry. Importar o CSS passa a ser suficiente para renderizar componentes estilizados — sem JavaScript de tema.
  - `CmThemeScript` ficou ~99% menor: define apenas `data-theme` antes do paint (e emite um `<style>` apenas para temas custom), em vez de serializar todos os temas em todo HTML SSR.
  - `CmThemeProvider` não injeta mais tokens como style inline no `<html>` — trocar de tema é um flip de atributo. Consequência importante: agora dá para sobrescrever tokens via CSS do app (`:root[data-theme="cm-neutral"] { --color-primary: … }`).
  - Novo campo `colorScheme?: "light" | "dark"` no `ThemeConfig`, emitido como `color-scheme` no bloco do tema. `cm-dark`, `cm-midnight` e `cm-aurora` já o declaram (corrige scrollbars/controles nativos claros no tema `cm-aurora`, que estava fora do seletor hardcoded antigo).
  - Novos exports em `cosmemilton-ui/theme`: `themeToCSSBlock`, `customThemeCSS`, `themeSelector`.

- `CmThemeScript` aceita a prop `nonce`, repassada às tags inline `<script>`/`<style>` — necessário em apps com Content-Security-Policy sem `'unsafe-inline'`.

## 3.3.0

### Minor Changes

- Address v3 adoption feedback: two new components, a toast-positioning option, and a friendlier root-import error.
  - **`CmRichTextEditor`** (`cosmemilton-ui/client`): zero-dependency rich text editor built on `contentEditable` with a standard toolbar (bold/italic/underline/strike, H1–H3, paragraph, bullet/ordered lists, blockquote, link/unlink, clear formatting, undo/redo). Controlled or uncontrolled HTML via `value`/`defaultValue`/`onChange`, configurable `toolbar`, `readOnly`/`disabled`, `placeholder`, plain-text paste by default, and a customizable `onLinkRequest`. No TipTap/ProseMirror peer dependency required.
  - **`CmFileUpload`** (`cosmemilton-ui/client`): zero-dependency drag-and-drop upload with image thumbnails/file previews, `accept`/`maxSize`/`maxFiles` validation (`onReject` with reasons), controlled `value`/`onChange`, and an `onUpload` callback for accepted files. Exposes the `formatFileSize` helper.
  - **`CmToastProvider` `position` prop**: `top-left` | `top-center` | `top-right` | `bottom-left` | `bottom-center` | `bottom-right` (default `bottom-right`), so toasts can avoid overlapping a fixed sidebar. Adds the exported `CmToastPosition` and `CmToastProviderProps` types.
  - **Root import guard**: importing from the bare `"cosmemilton-ui"` entry (removed in v3) now throws a clear message pointing to the `/client`, `/server` and `/theme` subpaths instead of an opaque "module not found".

## 3.2.0

### Minor Changes

- Add `CmGallery` / `CmLightbox` and a server-side mode for `CmDataTable`.
  - **`CmGallery` / `CmLightbox`** (`cosmemilton-ui/client`): a responsive thumbnail grid with a built-in full-screen lightbox — portal, scroll-lock, focus-trap, Escape to close, arrow-key navigation, thumbnail strip, counter and captions. `CmLightbox` can also be used standalone as a controlled viewer (`open` / `index` / `onClose`). Fills the previously missing gallery/lightbox primitive.
  - **`CmDataTable` server-side / controlled mode** (additive, non-breaking): new props `manualSorting`, `manualPagination`, `totalRows`, `loading` (+ `loadingMessage`), controlled `page` / `onPageChange`, `rowsPerPage` / `onRowsPerPageChange`, `sortKey` / `sortDirection` / `onSortChange` (emits the new `CmDataTableSort`), and configurable `rowsPerPageOptions`. The default client-side sorting/pagination behavior is unchanged.

All notable changes to `cosmemilton-ui` are documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
From this release forward, versioning and changelog entries are managed with
[Changesets](https://github.com/changesets/changesets).

## Unreleased

## 3.1.0 - 2026-05-31

### Added

- Added `formatCPF`, `formatCNPJ` and `formatPhone` to the public server-safe
  utilities.
- Added alphanumeric CNPJ formatting support for the new Receita Federal CNPJ
  format.

### Fixed

- Fixed portaled floating menus so `CmSelect`, `CmMultiSelect`, `CmPopover` and
  `CmSplitButton` keep positioning after their panels mount.
- Fixed spacing token handling in layout primitives so props like `gap="md"`
  resolve to valid CSS values.
- Fixed long-page sidebar behavior so the navigation can stay pinned while page
  content scrolls.

### Tooling & governance

- Added `LICENSE` (ISC) to match the declared license.
- Added ESLint (TypeScript + React + React Hooks + jsx-a11y), Prettier and
  EditorConfig with `lint`, `format` and related npm scripts.
- Added Vitest + Testing Library and a `test` / `test:watch` / `test:coverage`
  script set.
- Added Changesets for versioning and this `CHANGELOG.md`.
- Added GitHub Actions CI (typecheck + lint + test + build) and contribution
  governance docs (`CONTRIBUTING`, `CODE_OF_CONDUCT`, issue/PR templates).
- Added `prepack`/`prepublishOnly` gates, `engines`, `publishConfig` and source
  maps for the published JavaScript.

### Icons

- The icon strategy now ships **one bundled default set** (`lucide-react`, used
  by built-in component affordances) and treats every other icon library as an
  **optional** dependency. `@iconify/react` (the universal `CmIcon` gateway to
  150+ icon sets) moved from a hard dependency to an **optional peer
  dependency** — install it only if you use `CmIcon`. Components also accept any
  `ReactNode` for icon props, so you can bring `react-icons`, `@heroicons/react`,
  Phosphor, or your own SVGs. See [docs/icons.md](docs/icons.md).
