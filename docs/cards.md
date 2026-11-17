# Cartões coloridos

`CmCard` e `CmMetricCard` oferecem `variant="soft"` para um fundo tingido,
`variant="solid"` para um fundo preenchido e `variant="gradient"` para um
degradê. A aparência padrão é `surface`.

Combine a variante com `tone="primary"`, `"secondary"`, `"accent"`,
`"success"`, `"warning"`, `"danger"` ou `"info"`. Os fundos e os textos usam
os tokens do tema ativo. Os mesmos parâmetros funcionam nas skins Classic,
Horizonte e Aurora Ops com o CSS padrão do pacote.

```tsx
import "@cosmemilton/ui/styles.css";
import { CmCard, CmMetricCard } from "@cosmemilton/ui/server";

export function Resumo() {
  return (
    <>
      <CmMetricCard
        title="Receita total"
        value="R$ 184.620"
        variant="gradient"
        tone="primary"
        trend={{ value: 8.2, formattedValue: "8,2%", label: "vs. maio" }}
      />
      <CmCard variant="solid" tone="info" header="Próximo fechamento">
        30 de junho
      </CmCard>
    </>
  );
}
```

As tendências continuam usando a seta e a cor semântica da variação. Ao
personalizar as cores de um tema, escolha pares de fundo e primeiro plano que
mantenham contraste suficiente. Texto e elementos com cor explícita podem ser
ajustados conforme o conteúdo do cartão.
