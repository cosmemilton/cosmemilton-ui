# Complementos compatíveis com 3.x

## Select com conteúdo visual

`CmSelect` aceita `renderOption(option)` e `renderSelected(option)` retornando
`ReactNode`. Use-os para badges e ícones; mantenha `option.label` como texto
significativo para busca por digitação e acessibilidade. Sem callbacks, a
apresentação anterior permanece. Conteúdo de opção deve ser apresentacional,
sem botões ou links interativos aninhados.

## Confirmações por toast

`CmToastNotice` renderiza `action` e aceita `duration={0}` para permanecer até
uma ação explícita. A aplicação controla a operação: mantenha `processing`
ativo enquanto a requisição estiver pendente e desmonte o aviso ao concluir
ou cancelar. `processing` desabilita os controles e bloqueia cliques repetidos,
Escape e fechamento automático.

Use `autoFocus` apenas para confirmações iniciadas pelo usuário. O foco vai
para a primeira ação e volta ao acionador quando o aviso sai, sem roubar foco
se o usuário já tiver mudado para outro elemento. `onEscapeKeyDown` permite
interceptar Escape com `preventDefault()`. Escape no toast não se propaga ao
diálogo ancestral. `onDismiss` informa o fechamento para sincronizar o estado.
Avisos informativos não movem foco por padrão.

A API imperativa `useCmToast()` retorna o identificador de `toast(message,
options)` e oferece `update(id, options)` e `dismiss(id)` para gerenciar o mesmo
aviso. `dismiss` é uma remoção programática explícita, inclusive durante
processamento. Os callbacks devem controlar a operação de negócio; a biblioteca
não inicia nem repete requisições.

## Preferências por instalação

Use o mesmo `storagePrefix` no `CmThemeProvider` e `CmThemeScript`. Por exemplo,
`storagePrefix="cliente-a:"` produz `cliente-a:cm-theme`. O prefixo vazio mantém
as chaves históricas. Mudanças de prefixo releem o novo namespace sem copiar
preferências do anterior. Eventos de `localStorage` de outras abas só alteram
as preferências do namespace ativo; `sessionStorage` é ignorado. Preferências
controladas por props continuam prevalecendo.
