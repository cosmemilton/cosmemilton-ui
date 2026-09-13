# Alinhamento de ações na tabela

Use `align: "center"` e renderize `CmDataTableActions` diretamente na célula para
centralizar o título sobre o grupo de botões. A mesma configuração pode ser usada
em todas as listagens, independentemente do tema ou da quantidade de ações.

```tsx
import { CmDataTableActions, type CmDataTableColumn } from "cosmemilton-ui/client";

const columns: CmDataTableColumn<Cliente>[] = [
  // Outras colunas…
  {
    key: "acoes",
    header: "Ações",
    align: "center",
    hideable: false,
    render: (cliente) => (
      <CmDataTableActions>
        {/* Botões que operam sobre cliente */}
      </CmDataTableActions>
    ),
  },
];
```

`align: "left"` ou `"right"` alinha o cabeçalho e o grupo à borda correspondente.
Sem `align` explícito, o grupo mantém o padrão anterior à direita. As ações do
toolbar também continuam alinhadas à direita.

`CmDataTableActions` aceita atributos de `div`, inclusive `className` e eventos.
Sua classe pública é `.cm-data-table__actions`. Estilos da aplicação que definem
`justify-content` sobre essa classe podem sobrescrever o alinhamento da coluna.
Mantenha nos botões o tratamento de propagação já usado pela aplicação quando
as ações não devem acionar `onRowClick`; o agrupador não altera eventos.

Em telas estreitas, a [rolagem horizontal do `CmDataTable`](data-table-scroll.md)
permite alcançar as ações nas últimas colunas sem deslocar filtros ou paginação.
