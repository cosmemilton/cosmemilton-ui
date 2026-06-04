# Changelog

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
