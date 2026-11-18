# Aparência Aurora Ops

A skin Aurora Ops aplica o acabamento do dashboard aos componentes da CM-UI.
Os temas Claro, Escuro e Aurora fornecem as cores. A skin define a
apresentação dos menus, barras de topo, botões, cartões, indicadores,
molduras de gráficos, tabelas, badges, progresso e linhas do tempo.

As [variantes de cartões coloridos](cards.md) também podem ser usadas com Aurora Ops.

```tsx
import "@cosmemilton/ui/styles.css";
import { CmThemeProvider } from "@cosmemilton/ui/theme";
import { CmMetricCard } from "@cosmemilton/ui/server";

export function Indicadores() {
  return (
    <CmThemeProvider skin="aurora-ops" defaultThemeName="cm-v4-light">
      <CmMetricCard
        title="Taxa de conversão"
        value="3,64%"
        trend={{ value: -0.26, formattedValue: "0,26 p.p.", label: "vs. período anterior" }}
      />
    </CmThemeProvider>
  );
}
```

O sinal de `trend.value` determina a direção e a cor. Passe
`trend.formattedValue` para exibir a variação com a unidade e a precisão do
seu produto. Use um valor absoluto formatado, pois o componente adiciona a
seta. Quando a opção é omitida, o valor é exibido como percentual.

Use o prop `actions` de `CmChartFrame`, `CmLineChart` ou `CmBarChart` para
colocar controles, como um seletor de período, ao lado do título. As ações
continuam acessíveis enquanto os dados carregam. A área dos controles se ajusta
ao espaço disponível.

No `CmPageHeader`, agrupe o seletor e a ação em um `CmRow align="end" gap="sm" wrap` dentro de `actions`. O campo usa a largura do conteúdo nessa área. Os controles ficam na mesma linha enquanto couberem, inclusive com o rótulo visível.

Para comparar duas séries com unidades diferentes, use `CmComparisonLineChart` com `curve="smooth"` e `legendPosition="header"`. Defina `area: true` no eixo da série que deve receber preenchimento. A curva passa pelos valores originais e é interrompida onde há dados ausentes. A opção `xLabels="responsive"` mostra mais datas quando o gráfico dispõe de espaço.

Use `CmDonutChart variant="segmented" legendLayout="list"` para exibir um anel com intervalos entre as fatias e percentuais alinhados à direita. Para etapas de um pipeline, use `CmBarChart orientation="horizontal"`, informe `tone` em cada item e habilite `legend` para mostrar a legenda gerada pelos próprios dados.

Em `CmProgress` e em `CmBarChart orientation="horizontal"`, use `barThickness` para ajustar a espessura das barras. Os aliases `xs`, `sm`, `md` e `lg` correspondem a 4, 8, 12 e 16 px. Também é possível informar um número positivo em pixels, como `barThickness={6}`. No pipeline do Aurora, `barThickness="sm"` exibe as cinco etapas com barras de 8 px. Ao omitir a prop, o componente usa a espessura padrão do tema.

Combine `CmTopbar` com [`CmMegaMenuSearch`](mega-menu.md#busca-na-barra-superior)
para uma busca larga no desktop. No celular, a busca ocupa uma linha inteira
abaixo dos controles do cabeçalho. O `CmUserMenu` aceita navegação por setas,
Home e End. Escape fecha o menu e devolve o foco ao botão do perfil.

Em SSR, passe a mesma skin a `CmThemeScript` e `CmThemeProvider` para aplicar a
aparência no primeiro paint. Aplique `cm-v4-light`, `cm-v4-dark` ou
`cm-v4-aurora` com a API de temas. A aplicação continua responsável pela
composição, pelos dados e pelas ações das páginas.
