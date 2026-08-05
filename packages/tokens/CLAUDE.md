# @cosmemilton/tokens

Fonte da verdade dos design tokens da cosmemilton-ui: os 11 temas (`themes.ts`), os tipos (`types.ts`) e os geradores de CSS vars (`theme-to-css.ts`). Consumido em dois lugares:

1. **A lib (este repo):** `src/lib/theme/` é uma **cópia vendorizada gerada** por `scripts/sync-tokens.mjs` — nunca edite lá; edite aqui e rode `npm run sync:tokens` na raiz. O sync é dirigido por `readdir` (arquivo novo aqui entra sozinho; arquivo removido vira órfão apagado no sync e erro no `--check`). O CI falha se a cópia divergir.
2. **O Frevo (monorepo `~/frevo-linux`):** consumirá este pacote diretamente (web e runtime nativo). Spec: `docs/plano_distro_ui_v1.md` do plano do Frevo.

## Regras

- **Não quebrar byte-identidade:** qualquer mudança aqui altera `src/styles/00a-theme-tokens.generated.css` na lib — mudanças de valor de token são mudanças visuais e passam pelo gate de screenshot-diff (Playwright).
- Metade dos defaults (space/zIndex/motion/breakpoints/density/layers) vive em `theme-to-css.ts`, não em `themes.ts` — os dois andam juntos.
- `customThemeCSS` distingue built-in de custom por **igualdade de referência** contra o registry `themes` — antes de publicar este pacote no npm (fase 2), trocar por comparação estrutural ou flag nos built-ins, senão registries de instâncias diferentes reclassificam os 11 temas como custom e mudam a cascata.
- **O repo NÃO usa npm workspaces** (o campo `workspaces` faria o changesets deixar de versionar a lib raiz — testado e revertido em 2026-08-05). Este diretório é um pacote comum dirigido pelos scripts da raiz; o toolchain (tsc/vitest) vem do node_modules da raiz.
- `private: true` até o scope `@cosmemilton` existir no npm. **Checklist para publicar (fase 2):** remover `private`; decidir licença conscientemente (hoje ISC, seguindo o repo); resolver o hazard de igualdade de referência acima; trocar a vendorização da lib por dependência real e apagar `src/lib/theme`; definir o fluxo de publicação (o changesets do repo só versiona a lib raiz).

## Comandos (na raiz do repo)

`npm run tokens:typecheck` · `npm run tokens:build` · `npm run tokens:test` · `npm run sync:tokens` · `npm run check:tokens-sync`
