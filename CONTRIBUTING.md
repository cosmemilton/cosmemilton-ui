# Contributing to cm-ui

Thanks for your interest in improving **cm-ui**! This guide covers the local
workflow and the conventions we follow.

## Getting started

```bash
git clone https://github.com/cosmemilton/cosmemilton-ui.git
cd cosmemilton-ui
npm install
```

## Scripts

| Script                  | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm run build`         | Compile `src/` to `dist/` and copy the published CSS  |
| `npm run typecheck`     | Type-check the whole project with `tsc --noEmit`      |
| `npm run lint`          | Run ESLint (`lint:fix` to auto-fix)                   |
| `npm run format`        | Format with Prettier (`format:check` to verify only)  |
| `npm run test`          | Run the Vitest suite (`test:watch`, `test:coverage`)  |
| `npm run changeset`     | Record a release note for your change                 |

## Before opening a PR

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run changeset` — required whenever the published package changes. Pick
   `patch` / `minor` / `major` per [SemVer](https://semver.org).

CI runs typecheck + lint + test + build on every PR.

## Conventions

- **`"use client"`** — interactive components declare the directive at the top of
  their own source file. Server-safe components must not import anything that
  pulls in a `"use client"` module. Keep new components in the correct entry
  (`src/client.ts` vs `src/server.ts`).
- **Component API** — prefer `forwardRef`, set `displayName`, spread native props
  (`...rest`) onto the root element, and accept `className` merged via `cn()`.
- **Accessibility** — interactive components need keyboard support, correct ARIA
  roles/labels, and visible focus. `eslint-plugin-jsx-a11y` is wired into lint.
- **Icons** — see [docs/icons.md](docs/icons.md). Don't add new hard icon
  dependencies; built-in affordances use `lucide-react`, everything else is
  bring-your-own.
- **Styling** — component styles live in `src/styles.css` and are shipped as a
  single CSS file. Use existing design tokens; avoid hard-coded colors.

## Breaking changes

Breaking changes require a `major` changeset and a migration note. The move from
`cosmemilton-ui` (root export) to `cm-ui` with the `client` / `server` / `theme`
entry points in `3.0.0` is the reference example.

## Code of conduct

By participating you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).
