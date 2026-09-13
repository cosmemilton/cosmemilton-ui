# Rolagem horizontal da tabela

A partir da versão 3.22.0, `CmDataTable` mantém a rolagem horizontal na própria
área de colunas. O cabeçalho das colunas e as linhas se movem juntos. O título da
listagem, os filtros, as ações e a paginação permanecem na largura disponível,
fora dessa área rolável. O painel de detalhes também permanece separado.

Esse comportamento é automático quando as colunas ultrapassam a largura
disponível. Não é necessário criar um contêiner com `overflow-x` na aplicação.
O componente usa a rolagem nativa do navegador, inclusive por toque, e os tokens
de foco compartilhados nas aparências Classic e Horizonte, em claro e escuro.

## Props

| Prop              | Tipo               | Comportamento                                                                                                                                                           |
| ----------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scrollAreaLabel` | `string`           | Nome acessível da tabela e da região rolável, quando existe overflow. Use um nome que identifique os dados, como `"Produtos encontrados"`.                              |
| `tableMinWidth`   | `number \| string` | Largura mínima da tabela interna. Números representam pixels; strings aceitam valores CSS, como `"60rem"`. Não altera a largura dos filtros, das ações ou da paginação. |

As duas props são opcionais. Sem `tableMinWidth`, a tabela mantém a largura
natural de suas colunas; não há uma largura mínima fixa imposta pelo componente.
Escolha uma largura mínima apenas quando o conteúdo exigir espaço para continuar
legível em telas pequenas.

Sem um `scrollAreaLabel` preenchido, a tabela e a região usam o título renderizado
pelo `CmDataTable` como nome acessível. Quando não há esse título ou se usa um
`header` personalizado, o nome padrão é `"Tabela de dados"`. A tabela mantém esse
nome mesmo quando não há rolagem.

```tsx
import { CmDataTable } from "cosmemilton-ui/client";

<CmDataTable
  columns={columns}
  data={produtos}
  rowKey="codigo"
  title="Produtos encontrados"
  toolbar={filtros}
  actions={acoes}
  scrollAreaLabel="Produtos encontrados"
  tableMinWidth={900}
  pagination
/>;
```

## Teclado e acessibilidade

A região de rolagem recebe nome acessível, foco visível e uma parada de Tab
somente quando existe overflow horizontal. Quando as colunas cabem na área
disponível, ela não acrescenta uma parada à navegação.

Com a região focada, o navegador permite a rolagem pelo teclado. Os campos,
botões, menus e links dentro da tabela mantêm seu próprio comportamento; o
componente não captura suas teclas para simular rolagem. A tabela continua usando
os elementos semânticos de cabeçalho, linhas e células.

O componente reavalia a necessidade de rolagem quando a área disponível ou o
conteúdo muda, incluindo a seleção de colunas e o painel de detalhes.

## Adoção em aplicações existentes

Depois que a versão for publicada no npm, atualize a dependência e os lockfiles
da aplicação e consuma o CSS da mesma versão. No SRI Integrador, essa atualização
deve preceder a remoção dos ajustes locais usados para contornar a ausência de
rolagem no componente.

Substitua larguras mínimas de tabela escritas no CSS da aplicação por
`tableMinWidth`, quando necessárias. Remova somente os contêineres de rolagem e as
sobrescritas de `overflow` ou largura que duplicam o comportamento da biblioteca;
preserve os estilos de conteúdo e as regras de negócio. Não envolva o componente
inteiro em uma nova área horizontal, pois isso faria filtros e paginação se
deslocarem junto com as colunas.

Confira a rolagem até a última coluna, o acesso por teclado às ações, os filtros
e a paginação em desktop e celular, nos temas claro e escuro. Para alinhamento dos
botões nas células, consulte [Ações da tabela](data-table-actions.md).
