# Publicação da biblioteca

A branch `main` recebe o desenvolvimento. Pushes nela não executam builds nem
publicam pacotes. Pull requests destinados a `main` ou `release` executam as
validações da biblioteca, sem acesso ao token de publicação.

A branch permanente `release` recebe as versões estáveis. Cada push nela executa
typecheck, lint, testes unitários, testes dos tokens, regressão visual, build,
verificação das fontes geradas, publint, resolução dos tipos e inspeção do pacote.
Somente depois desses checks o job de publicação envia ao npm o tarball validado,
com a tag `latest` e proveniência do GitHub Actions.

Para preparar uma versão:

1. Na `main`, execute `npm run changeset:version` para consumir os changesets
   pendentes e gerar a versão e o changelog. Sincronize o lockfile com
   `npm install --package-lock-only --ignore-scripts` e confira os três arquivos.
   A versão deve ser inédita e superior à tag `latest` do npm; prereleases como
   `4.0.0-next.0` não são publicadas por esse fluxo. Um changeset pendente ainda
   não altera a versão do pacote.
2. Commit e push das alterações na `main`.
3. Faça merge da `main` na `release` e push da `release`.
4. Aguarde o workflow **CI** confirmar a versão, a tag `latest` e a integridade
   do pacote no npm. A propagação pode levar alguns minutos.
5. Crie e envie a tag Git `vX.Y.Z` no commit da `release` cuja publicação foi
   confirmada. A tag Git registra o código publicado; ela não substitui a
   atualização da versão nem a publicação no npm.

Somente `main` e `release` são branches permanentes. Branches de trabalho podem
ser removidas depois de integradas ou preservadas por uma tag de versão, como
`v3.22.3`, cuja publicação de manutenção usa a tag npm `maintenance-v3`.

O secret do repositório `NPM_TOKEN` é usado apenas no passo `npm publish`. O job de
publicação não instala dependências nem executa scripts de lifecycle. O token
precisa permitir publicação de `cosmemilton-ui` e atender aos requisitos de 2FA
da conta npm.

Executar novamente o workflow para a mesma versão e o mesmo pacote não republica
o artefato. Se a versão já existir com conteúdo diferente, o workflow falha e pede
uma nova versão. Falhas de rede ou autenticação na consulta ao npm também
interrompem a publicação; não são interpretadas como uma versão inexistente.

A execução manual fica disponível em **Actions → CI → Run workflow**. Selecione
a branch `release`: execuções manuais em outras branches não publicam.

As referências oficiais do fluxo são a [publicação de pacotes Node.js no GitHub
Actions](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages)
e o comando [`npm publish`](https://docs.npmjs.com/cli/v11/commands/npm-publish/).
