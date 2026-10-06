# MegaMenu e busca em painel

`CmMegaMenu` organiza a navegação em grupos de links ou ações. Passe os dados em
`items`; o componente resolve o painel, as colunas, os ícones e o teclado. Ele não
exige CSS da aplicação nem depende do PrimeReact.

```tsx
"use client";

import { CmMegaMenu } from "cosmemilton-ui/client";
import { CmIcon } from "cosmemilton-ui/server";

export function Navigation() {
  return (
    <CmMegaMenu
      aria-label="Navegação principal"
      items={[
        {
          id: "library",
          label: "Biblioteca",
          icon: <CmIcon name="lucide:library" aria-hidden />,
          groups: [
            {
              id: "components",
              label: "Componentes",
              icon: <CmIcon name="lucide:boxes" aria-hidden />,
              items: [
                {
                  id: "card",
                  label: "Card",
                  href: "/components/card",
                  description: "Superfícies e composição",
                },
                { id: "forms", label: "Formulários", href: "/forms" },
              ],
            },
            {
              id: "guides",
              label: "Guias",
              items: [{ id: "start", label: "Começar", href: "/getting-started" }],
            },
          ],
        },
        { id: "account", label: "Minha conta", href: "/account" },
      ]}
    />
  );
}
```

Um item com `groups` abre o painel. Um item com `href` é um link; `onSelect` permite
executar uma ação. Use IDs estáveis e únicos. `icon` e `badge` aceitam ReactNode,
incluindo SVG, `CmIcon` e `CmBadge`. `disabled` bloqueia interação.
No menu, combinar `href` e `onSelect` executa o callback e mantém a navegação do
link. Para navegar pelo seu router em um callback, use um item sem `href`.

`columns`, `panelWidth`, `align`, `size` e `orientation` controlam a composição.
`variant` escolhe a barra `surface`, `ghost` ou `glass`. `start` e `end` inserem
conteúdo na barra; `panelHeader` e `panelFooter` acrescentam conteúdo ao painel.
`openItem`/`onOpenChange` permitem controlar qual painel está aberto.

Links usam `<a>` por padrão. Em Next.js, passe `linkComponent={Link}` e
`activeHref={pathname}` para integrar a navegação e identificar a página atual.
O painel usa portal e considera o espaço disponível no viewport; abre para cima
quando falta espaço abaixo e há mais espaço acima. Seus grupos
passam a duas ou uma coluna conforme a largura disponível.

## Busca no próprio input

`CmMegaMenuSearch` reutiliza o visual do painel, com resultados agrupados,
descrições e ícones. O usuário digita diretamente no input. Não é preciso criar
um modal, cuidar do filtro ou posicionar a lista.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { CmMegaMenuSearch } from "cosmemilton-ui/client";
import { CmIcon } from "cosmemilton-ui/server";

export function ComponentSearch() {
  const router = useRouter();
  return (
    <CmMegaMenuSearch
      aria-label="Buscar componentes"
      placeholder="Nome, função ou palavra-chave…"
      keyboardShortcut="k"
      groups={[
        {
          id: "components",
          label: "Componentes",
          icon: <CmIcon name="lucide:boxes" aria-hidden />,
          items: [
            {
              id: "card",
              label: "Card",
              description: "Agrupe conteúdo em superfícies",
              keywords: ["cartão"],
              onSelect: () => router.push("/components/card"),
            },
            {
              id: "input",
              label: "Input",
              description: "Entrada de texto",
              onSelect: () => router.push("/components/input"),
            },
          ],
        },
      ]}
    />
  );
}
```

A busca compara todos os termos com nome, descrição, palavras-chave e grupo,
ignorando maiúsculas e acentos. `maxResults` limita os resultados exibidos; a
contagem indica o total encontrado. A seleção executa `onSelect` do item ou
navega pelo `href`; o `onSelect` do componente também informa qual item foi
selecionado. Para navegação programática, use o callback do item, ou o callback
do componente em itens sem `href`.

`query`/`onQueryChange` e `open`/`onOpenChange` permitem controlar o campo e o
painel. O ref aponta para o input real. A busca não bloqueia a rolagem nem prende
o foco.

## Teclado

- No menu, Enter/Espaço alternam o painel e as setas abrem ou percorrem os links.
  Tab entra no painel e continua para os controles seguintes; Escape fecha e
  devolve o foco ao botão de origem.
- Na busca, as setas selecionam resultados; Home/End vão ao primeiro/último;
  Enter ativa e Escape fecha. Tab continua para o próximo controle da página.
- Com `keyboardShortcut="k"`, Ctrl+K ou Command+K focam o input da busca.

Os componentes usam os temas Claro, Escuro e Aurora da V4. Os playgrounds locais
estão em `/v4/components/mega-menu` e `/v4/components/mega-menu-search`.

Referência de composição: [MegaMenu do PrimeReact](https://v10.primereact.org/megamenu/).
