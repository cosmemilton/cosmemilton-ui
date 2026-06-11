# Changelog

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
