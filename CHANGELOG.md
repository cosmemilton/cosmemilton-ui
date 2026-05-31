# Changelog

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
