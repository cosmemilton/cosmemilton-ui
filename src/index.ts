// Root entry — intentionally a guard, not a barrel.
//
// cosmemilton-ui v3 dropped the single root export in favor of three
// environment-scoped subpaths so React Server Components never pull a
// "use client" module into the server graph. A bare
// `import { X } from "cosmemilton-ui"` (common when migrating from v2) used to
// fail with an opaque "Cannot find module" because no "." export existed. This
// module exists only so that import resolves — and then throws a message that
// says exactly where to go.

const GUIDANCE = [
  "cosmemilton-ui v3 has no root entry point. Import from a subpath instead:",
  '  • Client (interactive) components:  import { … } from "cosmemilton-ui/client"',
  '  • Server-safe components (RSC):      import { … } from "cosmemilton-ui/server"',
  '  • Theme tokens & helpers:            import { … } from "cosmemilton-ui/theme"',
  "",
  "Docs: https://miltonjunior.dev.br/cosmemilton-ui/v3",
].join("\n");

/**
 * @deprecated The root `"cosmemilton-ui"` import was removed in v3. Import from
 * `cosmemilton-ui/client`, `cosmemilton-ui/server`, or `cosmemilton-ui/theme`.
 * See https://miltonjunior.dev.br/cosmemilton-ui/v3
 */
export const __cosmemiltonUiRootEntryRemoved = true;

throw new Error(GUIDANCE);
