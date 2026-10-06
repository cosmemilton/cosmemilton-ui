# Aparência Horizonte

Horizonte é uma aparência opcional da CM-UI V4 para a geometria dos controles,
com rótulos flutuantes, tabelas compactas e tipografia local. Suas cores acompanham
o tema ativo: `cm-v4-light` (Claro), `cm-v4-dark` (Escuro) ou `cm-v4-aurora` (Aurora).

## Ativação

```tsx
import "cosmemilton-ui/styles.css";
import { CmThemeProvider, useCmTheme } from "cosmemilton-ui/theme";

export function App() {
  return (
    <CmThemeProvider skin="horizonte" defaultThemeName="cm-v4-light" chrome="surface">
      <YourApplication />
    </CmThemeProvider>
  );
}

function Toggle() {
  const { theme, setThemeByName } = useCmTheme();
  return (
    <button
      onClick={() => setThemeByName(theme.name === "cm-v4-dark" ? "cm-v4-light" : "cm-v4-dark")}
    >
      Alternar claro / escuro
    </button>
  );
}
```

`skin` aceita `"classic" | "horizonte"` e é controlada pela aplicação. Seu padrão
é `classic`; não é restaurada do armazenamento. `useCmTheme().skin` permite consultar
a aparência ativa. O provider aplica `data-cm-skin` no elemento `html`, incluindo
componentes que renderizam portais diretamente no `body`.

O tema de cores continua independente da aparência. A preferência válida em
`cm-theme` no `localStorage` tem precedência sobre `defaultThemeName`.
Paletas V3 não fazem parte do registro V4. Para prévias sem persistência, passe
`storageKey={false}`; para controle externo, use `themeName` e `onThemeChange`.

Aplicações SSR devem passar a mesma aparência ao script de inicialização:

```tsx
<CmThemeScript skin="horizonte" defaultThemeName="cm-v4-light" />
```

O script define a aparência antes do primeiro paint. Quando a aplicação já informa
atributos no HTML do servidor, use `data-cm-skin="horizonte"` no mesmo elemento.

## Fontes e tokens

Os arquivos variáveis Inter e Manrope, com suas licenças OFL, acompanham o pacote em
`dist/fonts`. Não dependem de Google Fonts ou de requisições a serviços externos.
As famílias internas `CM UI Sans` e `CM UI Display` são compartilhadas pelos temas
V4. O bundler precisa processar as URLs do CSS para servir esses arquivos locais.
Ao hospedar o CSS diretamente, mantenha `fonts/` ao lado de `styles.css`.

`ThemeTypography.fontFamilyHeading` é opcional e produz `--font-family-heading`.
Quando omitido, seu valor é o de `fontFamily`. A skin usa esse token nos títulos;
o CSS das aplicações pode usá-lo nos próprios headings. Cores, raios, sombras e
densidade continuam personalizáveis pelas APIs de temas da biblioteca.

Os pesos compartilhados da skin são `--cm-horizonte-weight-body: 400`,
`--cm-horizonte-weight-control: 500` e `--cm-horizonte-weight-emphasis: 550`.
Use-os também nas composições da aplicação para manter o mesmo padrão no claro
e nos três temas. Títulos conservam os pesos de destaque da fonte de títulos.

As tabelas usam `--cm-horizonte-data-foreground` para os dados e foreground para
nomes em `strong`; o cabeçalho tem 42px inclusive com seletor de colunas. Para
alinhar o título das ações sobre o grupo de botões, use `align: 'center'` na
coluna e `CmDataTableActions` como filho direto da célula. Consulte
[Ações da tabela](data-table-actions.md).

## Comportamentos preservados

- `CmInput` mantém rótulo flutuante, foco, validação, máscara, limpeza e eventos.
  Para ter o rótulo dentro de um campo vazio, use `label` e não informe um placeholder
  explícito. As combinações com `helperText` continuam seguindo a API existente.
- `CmDataTable` mantém seleção de colunas com `tableKey`, preferências, paginação,
  ordenação e painel opcional de detalhes.
- `CmTreeView` mantém modo solitário, expansão, busca e callbacks de arraste.
- Modais, menus e seletores usam a mesma aparência nos portais.

Horizonte altera a apresentação dos componentes. A composição das páginas,
autenticação, dados, permissões e persistência dos movimentos continuam a cargo
da aplicação. Para usar a geometria padrão, passe `skin="classic"`; a paleta V4
selecionada permanece ativa. A adoção não exige substituir os componentes funcionais.

## Menu de usuário slim

`CmUserMenu` oferece a apresentação opcional `slim`, apropriada para a barra superior:

```tsx
<CmUserMenu
  presentation="slim"
  size="sm"
  menuHeader="always"
  user={{ title: "Ana Beatriz", subtitle: "Administradora", email: "ana@example.com" }}
  items={userMenuItems}
/>
```

O trigger é um único botão acessível, com avatar de 34 px, nome de 11 px, subtítulo
de 10 px e uma área visual de 32 px para a seta. O tamanho `sm` mede 38 px de altura;
os outros valores de `size` e um `avatarSize` explícito continuam disponíveis.
`showTitle`, `showSubtitle` e `showChevron` controlam os elementos do trigger.
Em telas menores que 768 px, o texto é recolhido e a seta permanece visível.

O menu usa uma única superfície de 200 px, limitada ao viewport, com linhas de
36 px. Quando o cabeçalho é exibido, apresenta um ícone de usuário e a identificação
em texto, sem repetir o avatar. Os modos `menuHeader="auto" | "always" | "never"`
continuam disponíveis. No modo `auto`, a identificação aparece quando oculta no
trigger, inclusive em telas pequenas. `--cm-user-menu-slim-width` permite ajustar
a largura sem alterar os outros menus.

`slim` fecha com Escape e devolve o foco ao botão; selecionar uma ação ou clicar
fora também fecha o menu. A seta é parte visual do mesmo botão, sem interação
aninhada. As apresentações `default` e `compact` mantêm seus padrões anteriores.
O tratamento de Escape também pode ser habilitado explicitamente em `CmPopover`
e `CmDropdownMenu` por `dismissOnEscape`; o padrão dessa propriedade é `false`.

## Publicação e desenvolvimento local

Execute `npm run build` para sincronizar os tokens, compilar as APIs e copiar fontes
e CSS para `dist`. Consumidores locais devem apontar para a raiz deste pacote e
usar os mesmos exports públicos que usarão quando a versão for publicada no npm.
Não importe os fontes `src/` diretamente. Uma alteração na biblioteca exige novo
build antes de ser consumida pelo Integrador.
