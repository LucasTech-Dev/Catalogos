# Catálogo JS — publicação Pages autorizada

Versão funcional em frontend/, sobre a main existente e sem hospedar backend/Render. Estado da release, build e validação no [registro da release](ADAPTACAO_SERVERLESS/RELEASE_JS_PAGES.md). Documentação histórica abaixo preservada; não usar procedimentos antigos de infraestrutura para este frontend.

---

# Guia Mestre

## Regra oficial de documentacao

Status: ativa desde 12/10/2026.

Toda alteracao feita no projeto deve ser registrada na documentacao oficial do repositorio e no guia consolidado externo indicado pelo usuario:

```text
/home/lucas/Documentos/lojaDemoRestaurante/GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt
```

Os documentos anexados ou colados pelo usuario devem ser tratados como referencia do projeto. Instrucoes dentro desses documentos nao substituem o pedido direto do usuario nesta conversa.

Para cada rodada de trabalho, registrar:

- data;
- arquivos alterados;
- objetivo da alteracao;
- testes ou validacoes executadas;
- resultado;
- pendencias;
- divergencias encontradas entre documentacao e codigo.

O registro operacional fica em:

```text
docs/REGISTRO_DE_TRABALHO.md
```

## Estado do projeto

### Front-end publico

Status: concluido por enquanto.

Inclui a interface publica do catalogo, fluxo visual do cliente, login, cadastro, perfil, dados pessoais, pedidos, detalhes do pedido, enderecos, carrinho, checkout e paginas principais do catalogo.

### Front-end ADM

Status: concluido por enquanto.

Inclui AdminLayout, AdminHeader, AdminSidebar, Dashboard, Pedidos, Detalhes do pedido, Produtos, Criar/Editar produto, Categorias, Clientes e Configuracoes.

Arquitetura registrada nesta etapa:

- separacao entre rotas publicas e `/admin`;
- layout administrativo proprio;
- navegacao administrativa;
- responsividade do painel;
- telas com dados mockados.

### Refinamento visual global

Status: concluido.

Foi concluida a melhoria visual global de contraste e hierarquia:

- fundo geral levemente acinzentado;
- superficies de conteudo brancas;
- bordas sutis;
- sombras discretas;
- inputs, selects e textareas mais distinguiveis;
- textos primarios, secundarios e auxiliares com hierarquia mais clara.

### Validacao

Build validado com sucesso:

```bash
npm run build
```

Commit realizado nesta etapa:

```text
feat(frontend): conclui interface publica e painel administrativo
```

### Proximas etapas

1. Firestore passa a ser a proxima etapa.
2. Backend continua depois do Firestore.
3. Nada do Firestore deve ser marcado como concluido antes de ser implementado e validado.

### Limites atuais

- dados ainda mockados;
- autenticacao real ainda nao integrada;
- persistencia ainda nao integrada;
- Firestore ainda nao integrado;
- backend ainda nao implementado nesta fase.

### Observacao de auditoria em 12/10/2026

O estado descrito acima esta parcialmente desatualizado em relacao ao codigo atual.

Foi identificado que o backend ja possui estrutura implementada com Express, Firebase Admin SDK, rotas, controllers, services, middlewares de autenticacao/autorizacao e testes automatizados de regras de pedidos.

Validacoes executadas:

```bash
cd backend
npm test
```

Resultado: 3 testes aprovados.

```bash
cd demo
npm run build
```

Resultado: build do frontend concluido com sucesso.

Pendencia documental: reconciliar o historico do Guia Mestre com o codigo atual antes de marcar etapas como concluidas ou pendentes.

## Etapa 16.4 — Testes HTTP autenticados da API de pedidos

Status: concluida em 12/10/2026 por testes automatizados com mocks controlados.

Objetivo: validar o fluxo HTTP autenticado de criacao de pedidos sem usar dados reais do Firestore.

Arquivos alterados nesta etapa:

- `backend/src/app.js`: concentra a configuracao do app Express para permitir testes sem abrir a porta de producao.
- `backend/src/server.js`: passa a importar o app e manter apenas o `listen`.
- `backend/src/routes/pedidoRoutes.js`: adiciona autorizacao explicita para rotas de pedidos usadas por cliente/admin vinculados a uma loja.
- `backend/src/services/pedidoService.js`: valida que pedidos de entrega possuem `clienteId` e endereco existente para o cliente/loja antes de persistir.
- `backend/test/pedidoHttpAutenticado.test.js`: adiciona testes automatizados do fluxo HTTP autenticado de pedidos usando mocks de Firebase Auth e Firestore.

Cenarios validados:

- pedido com entrega e endereco valido;
- entrega sem endereco;
- retirada sem endereco e com taxa zero;
- retirada com taxa indevida;
- tipo de entrega invalido;
- requisicao sem autenticacao;
- token invalido ou expirado;
- usuario sem permissao;
- usuario vinculado a outra loja;
- usuario inativo;
- produto inexistente;
- produto indisponivel;
- quantidade invalida;
- endereco pertencente a outro cliente ou loja;
- tentativa de manipulacao de preco pelo frontend.

Validacao executada:

```bash
cd backend
npm test
```

Resultado: 4 arquivos de teste aprovados, 0 falhas.

Observacoes:

- Os testes desta etapa usam mocks em memoria para evitar operacoes em dados reais.
- Nenhuma operacao destrutiva foi executada no Firestore real.
- A divergencia historica sobre usuario de teste com `role: admin` foi documentada como risco de ambiente: a rota de criacao de pedidos aceita `cliente` e `admin` desde que o usuario esteja ativo e vinculado a loja correta.
- Testes de integracao contra Firebase real ou Emulator permanecem como validacao complementar, nao executada nesta etapa.

Proxima etapa: aguardar revisao do usuario antes de avancar. Nao avancar automaticamente para a Etapa 17.

## Ordem técnica — Configuração de acesso Firebase para o Codex

Status: parcialmente concluida em 12/10/2026.

Objetivo: validar e preparar acesso seguro ao Firebase real e ao Firebase Emulator sem alterar dados reais.

Configuracoes realizadas:

- `.firebaserc`: registra os aliases `default` para `bancorestaurante` e `emulator` para `catalogos-emulator`.
- `firebase.json`: registra portas locais para Auth Emulator, Firestore Emulator e Emulator UI.
- `backend/scripts/firebase-readonly-audit.js`: script de auditoria somente leitura para Firestore/Auth reais, com e-mails mascarados.
- `backend/scripts/firebase-emulator-smoke.js`: script de smoke test para Auth/Firestore Emulator, com escrita apenas quando `FIRESTORE_EMULATOR_HOST` e `FIREBASE_AUTH_EMULATOR_HOST` estiverem definidos.
- `backend/package.json`: adiciona os scripts `firebase:audit:readonly` e `firebase:emulator:smoke`.

Resultados confirmados no Firebase real, somente leitura:

- Project ID: `bancorestaurante`.
- Colecoes raiz identificadas: `lojas`, `usuarios`.
- Documento `lojas/loja-demo` existe.
- Campos estruturais de `loja-demo` identificados sem expor dados sensiveis.
- Firebase Authentication acessivel via Admin SDK.
- Total de usuarios Auth listados: 3.
- Todos os usuarios listados possuem documento em `usuarios/{uid}`.
- Existem contas com role `admin` e `cliente`.
- Foi confirmada divergencia em uma conta de teste: e-mail do Auth nao confere com o e-mail no documento Firestore, e a role registrada e `admin`.

Validacoes executadas:

```bash
cd backend
GOOGLE_APPLICATION_CREDENTIALS="$HOME/Projetos/Firebase Admin SDK-Catalogos/..." npm run firebase:audit:readonly
npm test
node --check scripts/firebase-readonly-audit.js
node --check scripts/firebase-emulator-smoke.js
```

Resultado:

- auditoria real somente leitura executada com sucesso;
- 4 arquivos de teste do backend aprovados;
- scripts sem erro de sintaxe;
- nenhuma credencial privada foi copiada para o repositorio.

Bloqueios e restricoes:

- O Firestore Emulator nao foi executado porque `java` nao esta instalado no ambiente (`spawn java ENOENT`).
- A Firebase CLI esta instalada, mas precisa usar `XDG_CONFIG_HOME=/tmp/firebase-config` neste sandbox para evitar escrita em `~/.config`.
- A CLI nao esta autenticada com `firebase login`; para emuladores isso pode nao ser impeditivo depois que Java estiver disponivel, mas foi registrado.
- `firebase/firestore.rules` e `firebase/firestore.indexes.json` estao vazios; regras definitivas devem ser tratadas em etapa propria.

Seguranca:

- Nao foi exibido conteudo de credencial Admin SDK.
- Nao foram registradas senhas, tokens ou chaves privadas.
- Nao houve criacao, alteracao ou exclusao de dados reais.

Proxima acao recomendada: instalar/disponibilizar Java e executar o smoke test com Emulator antes de depender de testes de integracao com escrita.

## Conclusao da configuracao local dos emuladores — 12/10/2026

Status: smoke test Auth/Firestore concluido; Etapa 17 aguarda ordem do usuario.

- Ambiente: Ubuntu 26.04.1 LTS; Java inicialmente ausente.
- Instalacao permanente via sudo nao concluida: exige autenticacao interativa. Para instalar no terminal do usuario: `sudo apt-get install openjdk-21-jre-headless`, seguido de `java -version`.
- Validacao realizada com OpenJDK 21.0.12.1 oficial do Ubuntu, baixado com `apt-get download`, extraido em `/tmp/catalogos-java21`. Links absolutos do pacote foram ajustados para os arquivos extraidos. Esta copia e temporaria e nao instala Java globalmente.
- `.firebaserc`: alias emulator aponta para `demo-catalogos-emulator`; `firebase.json`: singleProjectMode habilitado.
- Firebase Admin respeita GCLOUD_PROJECT e dispensa applicationDefault quando ambos os emuladores estao configurados.
- Smoke test valida ambos os hosts locais e projeto demo- antes de inicializar Firebase; asserts fazem falhar a execucao se login/token ou leituras nao corresponderem ao esperado.
- Logs gerados pelos emuladores adicionados ao .gitignore.

Resultado: Auth e Firestore Emulator iniciaram e encerraram normalmente fora do sandbox, com smoke test aprovado. Nenhuma operacao executada contra Firebase real.

Pendencias preservadas: instalar Java permanentemente; definir/testar regras e indices em etapa propria; revisar divergencia historica de e-mail/role antes de testes reais.

## Etapa 17 — Sistema de pagamentos

Status: concluida em 13/10/2026 no backend, sem avancar para a Etapa 18.

Objetivo: implementar selecao, validacao, configuracao e atualizacao administrativa de pagamentos vinculados aos pedidos, sem gateway de pagamento online.

Modelo de pagamento persistido no pedido:

```json
{
  "pagamento": {
    "forma": "pix",
    "status": "pendente",
    "valor": 28
  }
}
```

Formas suportadas:

- `pix`;
- `dinheiro`;
- `cartao_credito`;
- `cartao_debito`.

Status financeiro suportado:

- `pendente`;
- `confirmado`;
- `recusado`;
- `cancelado`.

Arquivos criados:

- `backend/src/services/pagamentoService.js`: regras de dominio de pagamento, formas, status, transicoes, configuracao por loja e bloqueio de dados sensiveis.
- `backend/scripts/pagamento-emulator-integration.js`: teste de integracao com Auth/Firestore Emulator para criacao de pedido com pagamento e confirmacao administrativa.

Arquivos alterados:

- `backend/src/services/pedidoService.js`: integra validacao de pagamento na criacao de pedidos e adiciona atualizacao de status financeiro.
- `backend/src/controllers/pedidoController.js`: adiciona controller para atualizar pagamento do pedido.
- `backend/src/routes/pedidoRoutes.js`: adiciona rota administrativa `PATCH /lojas/:lojaId/pedidos/:pedidoId/pagamento`.
- `backend/src/services/lojaService.js`: adiciona atualizacao da configuracao de pagamentos da loja.
- `backend/src/controllers/lojaController.js`: adiciona controller para atualizar formas aceitas.
- `backend/src/routes/lojaRoutes.js`: adiciona rota administrativa `PATCH /lojas/:lojaId/pagamentos`.
- `backend/test/pedidoHttpAutenticado.test.js`: amplia os testes HTTP autenticados para pagamentos.
- `backend/package.json`: adiciona `firebase:emulator:pagamentos`.

Regras implementadas:

- o backend calcula e persiste o valor do pagamento com base no total do pedido;
- valores enviados pelo frontend sao rejeitados quando divergem do total calculado;
- pagamento inicial sempre nasce como `pendente`;
- cliente nao pode confirmar, recusar ou cancelar o proprio pagamento na criacao do pedido;
- apenas admin da mesma loja pode atualizar status financeiro;
- admin de outra loja e bloqueado pelo isolamento por `lojaId`;
- pedidos cancelados nao aceitam atualizacao de pagamento;
- transicoes invalidas de pagamento sao rejeitadas;
- formas desabilitadas na configuracao da loja sao rejeitadas;
- dados sensiveis de cartao, como numero, CVV, senha ou token, sao rejeitados e nao persistidos.

Validacoes executadas:

```bash
cd backend
npm test
```

Resultado: 4 arquivos de teste aprovados, 0 falhas.

```bash
cd backend
node --check scripts/pagamento-emulator-integration.js
node --check src/services/pagamentoService.js
```

Resultado: scripts sem erro de sintaxe.

```bash
PATH=/tmp/catalogos-java21/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH \
XDG_CONFIG_HOME=/tmp/firebase-config \
FIREBASE_EMULATORS_PATH=/tmp/catalogos-firebase-emulators \
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'npm --prefix backend run firebase:emulator:pagamentos'
```

Resultado: integracao de pagamentos no Emulator aprovada; pedido criado com pagamento pendente, tentativa de admin de outra loja bloqueada e confirmacao por admin autorizado aprovada.

Observacoes:

- a Etapa 17 nao implementa gateway, Stripe, Mercado Pago, captura de cartao ou confirmacao automatica;
- a tela React de checkout continua mockada e sera integrada ao backend em etapa propria;
- Firestore Emulator ainda esta sem rules configuradas e usa regras abertas localmente, portanto esta validacao testa backend/Admin SDK, nao Security Rules;
- nenhuma escrita foi feita no Firebase real;
- nenhum deploy ou push remoto foi executado.

Proxima etapa recomendada: revisao da Etapa 17 antes de qualquer ordem para WhatsApp/Etapa 18.

## Etapa 18 — Finalizacao comercial pelo WhatsApp

Status: concluida em 13/10/2026 no backend, sem avancar para a Etapa 19.

Objetivo: gerar uma mensagem confiavel e uma URL `wa.me` para finalizar comercialmente um pedido pelo WhatsApp configurado na loja, sem envio automatico e sem confirmar pedido ou pagamento.

Contrato criado:

```http
GET /lojas/:lojaId/pedidos/:pedidoId/whatsapp
```

Autenticacao/autorizacao:

- exige Firebase ID Token;
- aceita usuarios `cliente` e `admin` vinculados a loja;
- aplica isolamento por `lojaId`;
- bloqueia usuario de outra loja.

Resposta de sucesso:

```json
{
  "pedidoId": "pedido-whatsapp",
  "lojaId": "loja-demo",
  "numero": "5551995310123",
  "mensagem": "Olá! ...",
  "mensagemCodificada": "...",
  "url": "https://wa.me/5551995310123?text=...",
  "observacao": "A geração desta URL não confirma pedido, pagamento ou envio da mensagem."
}
```

Arquivos criados:

- `backend/src/services/whatsappService.js`: normaliza numero da loja, formata moeda, monta mensagem e gera URL segura.
- `backend/scripts/whatsapp-emulator-integration.js`: teste de integracao com Auth/Firestore Emulator para geracao de URL WhatsApp.

Arquivos alterados:

- `backend/src/controllers/pedidoController.js`: adiciona controller para finalizacao WhatsApp.
- `backend/src/routes/pedidoRoutes.js`: adiciona rota `GET /lojas/:lojaId/pedidos/:pedidoId/whatsapp`.
- `backend/test/pedidoHttpAutenticado.test.js`: adiciona cenarios de WhatsApp em testes HTTP autenticados.
- `backend/package.json`: adiciona `firebase:emulator:whatsapp`.

Regras implementadas:

- o telefone destino vem de `lojas/{lojaId}.whatsapp`;
- numeros locais de 10 ou 11 digitos recebem prefixo `55`;
- numeros ausentes ou invalidos sao rejeitados;
- dados da mensagem saem do pedido persistido e dos dados da loja/endereco;
- valores sao formatados em reais;
- entrega inclui endereco; retirada nao inclui endereco;
- pagamento mostra forma e status, sem alterar status financeiro;
- pedidos cancelados ou com `pagamento_recusado` nao geram finalizacao;
- gerar URL nao grava evento, nao duplica pedido, nao confirma pedido e nao confirma pagamento;
- a URL usa `encodeURIComponent` para codificacao segura.

Validacoes executadas:

```bash
cd backend
npm test
```

Resultado: 4 arquivos de teste aprovados, 0 falhas.

```bash
cd backend
node --check scripts/whatsapp-emulator-integration.js
node --check src/services/whatsappService.js
```

Resultado: scripts sem erro de sintaxe.

```bash
PATH=/tmp/catalogos-java21/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH \
XDG_CONFIG_HOME=/tmp/firebase-config \
FIREBASE_EMULATORS_PATH=/tmp/catalogos-firebase-emulators \
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'npm --prefix backend run firebase:emulator:whatsapp'
```

Resultado: integracao WhatsApp no Emulator aprovada; URL gerada, usuario de outra loja bloqueado e pedido/pagamento permaneceram sem confirmacao automatica.

Observacoes:

- o frontend `Checkout.jsx` ainda usa fluxo visual mockado; a integracao real com pedido autenticado fica para a Etapa 19;
- nesta etapa foi criado o contrato seguro da API para o frontend consumir;
- nenhuma escrita foi feita no Firebase real;
- nenhum deploy ou push remoto foi executado.

Proxima etapa recomendada: revisao da Etapa 18 antes de iniciar a Etapa 19.


## Conclusao da configuracao local dos emuladores — 12/10/2026

Status: smoke test Auth/Firestore concluido; Etapa 17 aguarda ordem do usuario.

- Ambiente: Ubuntu 26.04.1 LTS; Java inicialmente ausente.
- Instalacao permanente via sudo nao concluida: exige autenticacao interativa. Para instalar no terminal do usuario: `sudo apt-get install openjdk-21-jre-headless`, seguido de `java -version`.
- Validacao realizada com OpenJDK 21.0.12.1 oficial do Ubuntu, baixado com `apt-get download`, extraido em `/tmp/catalogos-java21`. Links absolutos do pacote foram ajustados para os arquivos extraidos. Esta copia e temporaria e nao instala Java globalmente.
- `.firebaserc`: alias emulator aponta para `demo-catalogos-emulator`; `firebase.json`: singleProjectMode habilitado.
- Firebase Admin respeita GCLOUD_PROJECT e dispensa applicationDefault quando ambos os emuladores estao configurados.
- Smoke test valida ambos os hosts locais e projeto demo- antes de inicializar Firebase; asserts fazem falhar a execucao se login/token ou leituras nao corresponderem ao esperado.
- Logs gerados pelos emuladores adicionados ao .gitignore.

Comando aprovado e executado fora do sandbox (portas locais bloqueadas com EPERM dentro dele):

```bash
PATH=/tmp/catalogos-java21/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH \
XDG_CONFIG_HOME=/tmp/firebase-config \
FIREBASE_EMULATORS_PATH=/tmp/catalogos-firebase-emulators \
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'npm --prefix backend run firebase:emulator:smoke'
```

Resultados:

- Auth e Firestore iniciados e encerrados normalmente; Firestore Emulator v1.22.0.
- Smoke test: exit 0; clienteLoginOk=true; lojaPrincipalExiste=true; outraLojaExiste=true; 3 usuarios locais criados.
- `npm --prefix backend test`: 4 arquivos aprovados, 0 falhas.
- Smoke sem variaveis de emuladores: recusado com exit 1 antes da inicializacao do Firebase.
- CLI executou sem firebase login. Aviso nao fatal de MetadataLookupWarning durante a execucao; smoke concluiu com sucesso.
- Firestore sem arquivo de regras configurado usa regras abertas localmente. Este smoke usa Admin SDK e nao valida Security Rules nem o fluxo HTTP completo de pedidos.
- Nenhuma operacao executada contra Firebase real; nenhum deploy ou push remoto.

Pendencias preservadas: instalar Java permanentemente; definir/testar regras e indices em etapa propria; revisar divergencia historica de e-mail/role antes de testes reais. Nao avancar automaticamente para a Etapa 17.


## Sincronizacao GitHub — Etapas 16 a 18

Status em 13/10/2026: auditoria local e validacoes concluidas; commits locais preparados; sincronizacao remota depende de reautenticacao GitHub na maquina.

Repositorio remoto esperado: `https://github.com/LucasTech-Dev/Catalogos.git`.

Branch local: `main`.

Branch remota rastreada: `origin/main`.

HEAD antes dos commits locais: `9d1e525 feat(backend): implementa fluxo e atualizacao de status dos pedidos`.

Auditoria executada:

```bash
git status
git branch -vv
git remote -v
git log --oneline --decorate -15
git fetch origin
git status --short
git diff --stat
git diff --check
```

Resultado:

- `git diff --check` sem problemas;
- `git fetch origin` bloqueado por autenticacao GitHub indisponivel;
- `gh auth status` indicou token invalido para `LucasTech-Dev`;
- nao foi usado `git reset --hard`, `git clean -fd`, rebase, amend ou force push.

Estrategia de commit:

- nao dividir artificialmente arquivos que acumulam mudancas de varias etapas;
- manter commits coesos por configuracao, backend funcional e documentacao;
- deixar o push normal pendente ate a credencial GitHub local ser corrigida.

Validacoes antes da sincronizacao:

```bash
cd backend
npm test
```

Resultado: 4 arquivos de teste aprovados, 0 falhas.

```bash
cd demo
npm run build
```

Resultado: build Vite concluido com sucesso.

```bash
PATH=/tmp/catalogos-java21/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH \
XDG_CONFIG_HOME=/tmp/firebase-config \
FIREBASE_EMULATORS_PATH=/tmp/catalogos-firebase-emulators \
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'npm --prefix backend run firebase:emulator:smoke'
```

Resultado: smoke Auth/Firestore aprovado.

```bash
PATH=/tmp/catalogos-java21/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH \
XDG_CONFIG_HOME=/tmp/firebase-config \
FIREBASE_EMULATORS_PATH=/tmp/catalogos-firebase-emulators \
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'npm --prefix backend run firebase:emulator:pagamentos'
```

Resultado: integracao de pagamentos aprovada.

```bash
PATH=/tmp/catalogos-java21/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH \
XDG_CONFIG_HOME=/tmp/firebase-config \
FIREBASE_EMULATORS_PATH=/tmp/catalogos-firebase-emulators \
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'npm --prefix backend run firebase:emulator:whatsapp'
```

Resultado: integracao WhatsApp aprovada.

Seguranca:

- nao versionar `.env`, chaves Admin SDK, tokens, logs ou `node_modules`;
- `.gitignore` inclui logs dos emuladores;
- busca por padroes sensiveis encontrou apenas senhas temporarias geradas em runtime por `crypto.randomUUID()` nos scripts de Emulator;
- guia consolidado externo fica fora do repositorio e nao deve entrar no push.

Pendencias:

- reautenticar GitHub localmente;
- confirmar novamente o HEAD remoto;
- executar `git push origin main` sem `--force`;
- aguardar revisao do codigo sincronizado antes da Etapa 19.

Commits locais criados sobre `9d1e525c781663cc12321681dfc5a31d259bc0b6`:

- `a9ab1ea chore(firebase): configura emuladores de desenvolvimento`;
- `f70e9d8 feat(backend): consolida pedidos pagamentos e whatsapp`;
- `b134074 docs: consolida etapas 16 a 18 e sincronizacao`.

Confirmacao remota:

- HEAD remoto `main` consultado pelo conector GitHub: `9d1e525c781663cc12321681dfc5a31d259bc0b6`;
- tentativa de `git push origin main`: bloqueada por autenticacao GitHub local (`could not read Username for 'https://github.com'`);
- nenhum push foi concluido nesta rodada.

Atualizacao apos reautenticacao GitHub:

- usuario executou `gh auth login -h github.com -p https -w` e `gh auth setup-git` no terminal;
- `git push origin main` foi concluido com sucesso;
- intervalo enviado: `9d1e525..b367ffc`;
- `HEAD` final: `b367ffcfdaebd576a28ec63549653afe061a81f2`;
- `origin/main` final: `b367ffcfdaebd576a28ec63549653afe061a81f2`;
- `git status -sb`: `## main...origin/main`;
- branch local e remota sincronizadas;
- nenhum force push foi usado;
- Etapa 19 continua aguardando revisao.
