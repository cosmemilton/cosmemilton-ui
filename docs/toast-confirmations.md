# Confirmações com toast (3.x)

`CmToastNotice` aceita `action` e `className`. Use `duration={0}` para manter o
aviso aberto até uma ação explícita. `processing` desabilita os botões nativos
nas ações, impede cliques delegados e bloqueia Escape, fechar e o contador.
A aplicação controla a operação assíncrona: ative `processing` antes de iniciar
seu pedido, mantenha-o enquanto aguarda e desmonte o aviso após o sucesso.

`autoFocus` é opcional: move foco à primeira ação e devolve ao elemento anterior
na remoção, desde que o usuário não tenha movido foco para outro lugar.
`onEscapeKeyDown` recebe o evento e pode chamar `preventDefault()` para impedir
fechamento. Escape originado no aviso não fecha um diálogo ancestral.
`onDismiss` permite sincronizar o estado da aplicação ao fechar.

```tsx
{confirming && (
  <CmToastNotice
    title="Excluir registro?"
    description={recordKey}
    duration={0}
    processing={saving}
    autoFocus
    onDismiss={() => setConfirming(false)}
    action={
      <>
        <button onClick={confirmDeletion}>Excluir</button>
        <button onClick={() => setConfirming(false)}>Continuar editando</button>
      </>
    }
  />
)}
```

Alterar `action` ou `processing` atualiza o mesmo aviso. Desmontar
`CmToastNotice` remove seu aviso. Avisos imperativos permanecem independentes:
`const id = toast(message, options)` retorna um identificador;
`update(id, options)` atualiza opções e `dismiss(id)` remove explicitamente.
A aplicação pode usar `dismiss` depois da conclusão mesmo com `processing` ativo.

Avisos comuns continuam com duração padrão de cinco segundos e pausam ao receber
foco ou hover. Conteúdo e ações quebram linhas sem truncar chaves fiscais ou UUIDs.
