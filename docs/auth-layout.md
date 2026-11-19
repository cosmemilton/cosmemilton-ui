# Layout de autenticação

Use `CmAuthLayout` para compor telas de acesso, inscrição e recuperação de conta. O componente fornece a região principal com título, uma área para o formulário e espaços opcionais para marca, ações e rodapé. O formulário, as rotas e a autenticação ficam na aplicação.

```tsx
import { CmButton } from "@cosmemilton/ui/client";
import { CmAuthLayout, CmForm, CmNativeInput } from "@cosmemilton/ui/server";

export function AccessPage() {
  return (
    <CmAuthLayout
      layout="split"
      appearance="glass"
      title="Acesse sua conta"
      brand={{ title: "Área do cliente" }}
      artworkImage="/imagens/acesso.webp"
    >
      <CmForm action="/acesso" method="post" surface="plain">
        <CmNativeInput label="E-mail" type="email" name="email" autoComplete="username" required />
        <CmNativeInput
          label="Senha"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
        <CmButton type="submit" tone="primary" fullWidth>
          Entrar
        </CmButton>
      </CmForm>
    </CmAuthLayout>
  );
}
```

O padrão `layout="centered"` centraliza o painel e aceita `backgroundImage` para o fundo da página. O layout `split` posiciona a arte de `artworkImage` ao lado do painel quando há espaço. As duas imagens são decorativas. Coloque instruções e informações necessárias no conteúdo da tela.

Use `appearance="plain"` para a superfície padrão e `appearance="glass"` para a aparência translúcida. `description`, `eyebrow` e `icon` complementam o título quando a tela precisa de contexto. `actions` permite inserir controles como um seletor de idioma, e `footer` aceita links de inscrição ou ajuda.
