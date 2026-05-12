# CosmeMilton UI

Biblioteca de componentes React/Next para projetos Cosme Milton.

## Uso básico

Importe o CSS público uma vez na aplicação:

```tsx
import "cosmemilton-ui/styles.css";
```

Depois importe os componentes pelo pacote:

```tsx
import { CmAlert } from "cosmemilton-ui";
```

## CmAlert

Use `CmAlert` para mensagens curtas de estado, orientação ou erro. O componente aceita quatro tons:

- `info`: mensagem neutra ou informativa.
- `success`: confirmação de operação concluída.
- `warning`: atenção antes de continuar.
- `danger`: erro, bloqueio ou risco.

### Exemplo simples

```tsx
<CmAlert
  title="Tudo certo"
  description="A operação foi concluída."
  tone="success"
/>
```

### Tons disponíveis

```tsx
<>
  <CmAlert
    title="Informação"
    description="Use para mensagens neutras."
    tone="info"
  />

  <CmAlert
    title="Tudo certo"
    description="A operação foi concluída."
    tone="success"
  />

  <CmAlert
    title="Atenção"
    description="Revise antes de continuar."
    tone="warning"
  />

  <CmAlert
    title="Não foi possível salvar"
    description="Corrija os campos destacados e tente novamente."
    tone="danger"
  />
</>
```

### Alerta que desaparece sozinho ao fechar

Passe `dismissible` para mostrar o botão de fechar. Ao clicar, o componente remove a si mesmo da tela. Esse é o exemplo que deve aparecer na documentação quando você quiser demonstrar o alerta funcionando e desaparecendo:

```tsx
<CmAlert
  dismissible
  title="Configuração salva"
  description="Este aviso desaparece ao clicar no botão de fechar."
  tone="success"
  onDismiss={() => {
    console.log("Alerta fechado");
  }}
/>
```

### Demonstração com botão para mostrar novamente

Use `open` e `onOpenChange` quando a tela precisar controlar se o alerta aparece. Esse exemplo deixa claro o ciclo completo: mostrar, fechar e mostrar novamente.

```tsx
"use client";

import { useState } from "react";
import { CmAlert, CmButton } from "cosmemilton-ui";

export function AlertDemo() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {open ? (
        <CmAlert
          dismissible
          open={open}
          onOpenChange={setOpen}
          title="Tudo certo"
          description="A operação foi concluída. Clique no × para esconder."
          tone="success"
        />
      ) : (
        <CmButton size="sm" onClick={() => setOpen(true)}>
          Mostrar alerta
        </CmButton>
      )}
    </>
  );
}
```

### Com ação

Use `action` para adicionar um botão ou link relacionado à mensagem.

```tsx
import { CmAlert, CmButton } from "cosmemilton-ui";

<CmAlert
  title="Sessão expirando"
  description="Salve suas alterações antes de continuar."
  tone="warning"
  action={<CmButton size="sm">Salvar agora</CmButton>}
/>
```

### Props

```ts
type CmAlertTone = "info" | "success" | "warning" | "danger";

type CmAlertProps = {
  title: string;
  description?: string;
  tone?: CmAlertTone;
  className?: string;
  action?: ReactNode;
  dismissible?: boolean;
  closeLabel?: string;
  onDismiss?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
```
