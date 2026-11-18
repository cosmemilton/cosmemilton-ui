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

Em `CmCard`, `pattern` aceita `"orbits"`, `"connections"`, `"bricks"` e
`"puzzle"`. O padrão é `"none"`. O painel opcional `aside` fica ao lado do
conteúdo e passa para baixo quando o cartão tem até 530 px de largura.

```tsx
import { CmProgress } from "@cosmemilton/ui/client";
import { CmCard, CmText } from "@cosmemilton/ui/server";

<CmCard
  variant="gradient"
  tone="primary"
  pattern="orbits"
  aside={<CmProgress label="Meta do mês" value={92} showValue tone="inherit" />}
>
  <CmText as="h2" size="xl" tone="inherit">Receita do período</CmText>
</CmCard>
```

## Painéis com cabeçalho e rodapé

`CmPanel` usa o título como nome acessível da região. Em uma seção com título
`h2`, use `headingLevel={3}` para os painéis internos. A propriedade `icon`
aceita um ícone decorativo e `actions` recebe as ações do cabeçalho.

```tsx
import { CmPanel, CmText } from "@cosmemilton/ui/server";

<CmPanel
  title="Central de suporte"
  description="Situação dos chamados"
  headingLevel={3}
  footer={<CmText>Tempo médio de primeira resposta · 1h 24min</CmText>}
>
  <CmText>18 chamados abertos</CmText>
</CmPanel>
```

Agrupe indicadores ou ações relacionados em `footer`. Se a grade esticar o
painel até a altura de um vizinho, o conteúdo começa logo após o cabeçalho e o
grupo fica na base. Com altura natural, o rodapé acompanha o conteúdo.
