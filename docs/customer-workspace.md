# Cadastro de clientes: histórico e visões salvas

Em um back-office, a pessoa pode voltar à visão “Crédito em revisão”, abrir um cliente e conferir quem mudou seu limite, sem sair do formulário. Os componentes não se comunicam com a rede nem exigem um backend específico.

## CmChangeHistory

```tsx
import { CmChangeHistory } from "@cosmemilton/ui";

<CmChangeHistory
  events={[
    {
      id: "credit-800",
      title: "Limite de crédito alterado",
      actor: "Ana Souza",
      dateTime: "2026-11-24T13:42:00Z",
      dateLabel: "24 nov · 10:42",
      changes: [{ field: "Limite de crédito", before: "R$ 500,00", after: "R$ 800,00" }],
    },
  ]}
/>;
```

Passe os eventos na ordem em que devem aparecer. O componente apresenta o histórico sem registrar alterações: o armazenamento, as permissões e a filtragem dos dados são responsabilidade do aplicativo. Formate valores, horas e autores antes de repassá-los. Também pode ser importado de `/client` ou `/server`.

## CmSavedViews

```tsx
"use client";

import { useState } from "react";
import { CmSavedViews, type CmSavedView } from "@cosmemilton/ui/client";

type Settings = { status: "all" | "review"; columns: string[]; sort: "name" | "limit" };
const defaults: Settings = { status: "all", columns: ["name"], sort: "name" };
const credit: Settings = { status: "review", columns: ["name", "limit"], sort: "limit" };

export function ClientListViews({
  settings,
  onSettingsChange,
}: {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}) {
  const [active, setActive] = useState<string | null>("credit");
  const [views, setViews] = useState<CmSavedView<Settings>[]>([
    { id: "credit", label: "Crédito em revisão", snapshot: credit },
  ]);
  const reference = views.find((view) => view.id === active)?.snapshot ?? defaults;

  return (
    <CmSavedViews
      views={views}
      activeViewId={active}
      currentSnapshot={settings}
      dirty={JSON.stringify(settings) !== JSON.stringify(reference)}
      onApply={(view) => {
        setActive(view?.id ?? null);
        onSettingsChange(view?.snapshot ?? defaults);
      }}
      onCreate={(view) => {
        const id = crypto.randomUUID();
        setViews((items) => [...items, { ...view, id }]);
        setActive(id);
      }}
      onUpdate={(id, view) =>
        setViews((items) => items.map((item) => (item.id === id ? { ...view, id } : item)))
      }
      onDelete={(id) => {
        setViews((items) => items.filter((item) => item.id !== id));
        setActive(null);
        onSettingsChange(defaults);
      }}
    />
  );
}
```

O estado inicial da lista neste exemplo é `credit`. Passe uma configuração atual imutável em `currentSnapshot`; o componente entrega esse objeto ao salvar. Quando o usuário seleciona a visão padrão, `onApply` recebe `null`. Após criar ou excluir, o aplicativo decide qual visão fica ativa. Os callbacks de gravação e exclusão são opcionais e podem ser assíncronos: atualize o estado controlado após a operação terminar. O exemplo salva em memória; troque os callbacks por seu adaptador de armazenamento local ou API se precisar persistir. Nenhum acoplamento ao Report, ao banco ou ao estado de uma tabela específica é necessário.

## Demonstração no navegador

Execute `npm ci` e `npm run test:visual:serve`, depois abra `http://127.0.0.1:4178/customer-workspace`. Adicione `?theme=dark` para a versão escura.
