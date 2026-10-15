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


## Etapa 19 — Integração React + Backend + Firebase — 13/10/2026

Status: implementação validada localmente, aguardando revisão; Etapa 20 não iniciada.

Objetivo: conectar o frontend público aos serviços reais, com compra sem cadastro, carrinho persistente, checkout idempotente e WhatsApp seguro, corrigindo isolamento de pedidos/clientes/endereços.

Auditoria e contratos: `docs/ETAPA_19_AUDITORIA_CONTRATOS.md`.
Relatório completo, inventário de arquivos/funções, decisões, APIs, testes e pendências: `docs/ETAPA_19_RELATORIO_FINAL.md`.

Autenticação: Firebase Web anônimo/e-mail/senha; cadastro pode vincular convidado mantendo UID. Backend deriva titularidade do ID Token; papel de identidades sem perfil interno é sempre cliente. Administradores continuam limitados à loja. Listagem, consulta e WhatsApp de pedidos de terceiros foram corrigidos; endereços são próprios.

Fluxos: catálogo público com projeção; carrinho por loja contendo IDs/quantidades; checkout congela tentativa por loja/UID com Idempotency-Key; servidor calcula preço/taxa/desconto/total e persiste pagamento pendente e snapshot do endereço; URL WhatsApp vem somente do pedido persistido e é aberta por link HTTPS wa.me explícito.

Validações executadas: backend npm test (4 arquivos aprovados); execução HTTP detalhada (51 testes/subtestes aprovados); frontend npm test (10 testes em 2 arquivos aprovados); build Vite aprovado; suíte Auth/Firestore Emulator (smoke, pagamentos, WhatsApp, fluxo público e Web SDK) aprovada; concorrência de cinco tentativas gerou um pedido; Security Rules negaram acesso direto; git diff --check aprovado. Instalação final npm reportou zero vulnerabilidades após correção das dependências transitivas.

Arquivos de implementação: rotas/serviço público, middleware de titularidade, controllers e serviços de pedidos/catálogo, autenticação/CORS/regras, scripts/testes locais, SDK/serviços/contexto/hooks React, componentes e páginas públicas, configurações/exemplos de ambiente. Inventário completo e função de cada arquivo constam no relatório.

Design: CSS global e componentes/páginas administrativas preservados; removidos dados fictícios sem contrato (avaliações, adicionais e confirmação de pagamento). O índice de build previamente rastreado foi preservado após validar os bundles.

Divergências: documentação inicial sobre mocks era histórica; autorização anterior por loja não garantia titularidade; IDs legados de cliente diferentes do UID não são migrados automaticamente. Entrega agora exige configuração confiável na loja e nenhuma informação administrativa é exposta pelo catálogo público.

Pendências de ambiente: preencher Firebase Web/URL API, habilitar provedores/domínios, conferir configuração real da loja, homologação e publicação de regras mediante ordem futura; migração legada somente com vínculo comprovado. Java temporário. Nenhum teste com escrita real, deploy, push ou avanço administrativo executado.


## Etapa 20 — Integração completa do painel administrativo — 13/10/2026

Status: implementada e validada localmente, aguardando revisão. Etapa 19 aprovada pelo usuário com ressalvas; Etapa 21 não iniciada. Branch main, HEAD b8e2a4ba39ae233ad413b434d6ce5cbb42b15308 preservado; alterações não enviadas da Etapa 19 mantidas.

Objetivo: substituir mocks administrativos por APIs reais, preservando design/layout/CSS/navegação e protegendo todas as páginas e operações por Firebase ID Token, role admin e vínculo de loja validados no backend.

Relatório/inventário/função de cada arquivo: `docs/ETAPA_20_RELATORIO_FINAL.md`.
Auditoria/contratos/códigos/modelos: `docs/ETAPA_20_AUDITORIA_CONTRATOS.md`.

Implementado: AdminGate/login/logout; dashboard count/sum por período e valores financeiros separados; pedidos paginados/status/detalhes e confirmação financeira explícita; produtos CRUD/preço/disponibilidade/desativação; categorias CRUD/ativação/integridade; clientes associados/convidados/detalhes com projeção; configurações reais, horários por dia, URL/cor/contato/pagamentos/entrega/taxa/retirada/pedido mínimo; refetch/carga/erro/vazio/paginação, sem polling agressivo.

Endpoints: namespace protegido /admin/lojas/:lojaId para sessão/dashboard/loja/produtos/categorias/clientes/detalhe enriquecido; GET/PATCH existentes de pedidos reutilizados, sem mudar o contrato público de titularidade. Sem concessão de role ou alteração de usuários internos na interface.

Correções: transações de pagamento/status e integridade categoria/produto; erro real de geração de ID encontrado no Emulator corrigido (.doc() em vez de .doc(undefined)); JSON/erros internos sem stack; respostas atrasadas/logout e falhas de refresh não reabrem painel; revalidação não perde formulário; projeção de clientes também nas rotas legadas. Novos checkouts associam cliente pelo UID validado; sem migração real.

Testes executados: backend npm test (4 arquivos aprovados), HTTP detalhado (61 testes/subtestes aprovados), React npm test (28 testes em 3 arquivos aprovados), build Vite aprovado (1621 módulos), sintaxe e git diff --check aprovados. Suíte Auth/Firestore Emulator da Etapa 19 e nova suíte administrativa aprovadas com exit 0; concorrência, token realmente revogado, pagamentos e isolamento multi-loja validados sem Firebase real.

Arquivos principais: serviço/validação/controller/rotas admin, scripts/testes, cliente HTTP/serviço/hooks/guard administrativos e páginas/componentes existentes; índice de arquivos completo no relatório. Sem dependências novas. Rules da Etapa 19 preservadas byte a byte; índices novos declarados somente localmente.

Critério do dashboard: pedidos criados no período de até 31 dias; valor de pedidos inclui cancelados; pagamentos confirmados excluem pendentes/cancelados e são confirmações manuais, não receita de gateway pela data de pagamento. Sem indicadores fictícios de clientes.

Pendências anteriores preservadas: Firebase Web/provedores/domínios reais, dados reais loja-demo, migração comprovada de IDs, Java permanente, rules não publicadas e homologação manual/dispositivos. Pendência adicional: índices de produção não publicados. Busca textual por página; URL de imagem suportada, sem upload/adicionais sem contrato. Nenhum deploy, push, commit, promoção de admin real ou escrita/migração real executado.

Próxima ação: revisão da Etapa 20. Não iniciar Etapa 21 automaticamente.


## Etapa 21 — Segurança do Firestore e Controle de Acesso — 13/10/2026

Ordem 08 executada para desenvolvimento local. Revisão 20 aprovada com ressalvas; checkpoint obrigatório realizado ANTES das correções: main, regressões backend/HTTP61/React28/build/suíte20 aprovadas e scan de segredos. Commits locais coesos 2c06313 (implementação integrada 19/20, serviços compartilhados) e 0b1ec3d (documentação). Histórico preservado, sem push. Etapa 21 em diff local para revisão.

Status: concluída localmente, pendente de revisão do usuário e homologação real. Auditoria/matriz/evidências: `docs/ETAPA_21_AUDITORIA_SEGURANCA.md`. Relatório de 18 itens/inventário completo: `docs/ETAPA_21_RELATORIO_FINAL.md`.

Correções: admin ativo estritamente booleano, validação de IDs impedindo caminho privado aninhado, projeções tipadas de catálogo/usuário/cliente/endereço/pedido/admin, somente produtos publicáveis, preço/taxa/configuração/endereço/categoria dentro da transação de criação, logger/respostas internos sanitizados, separação dos emuladores/projeto demo antes dos SDKs, caches privados por sessão/UID e descarte de respostas atrasadas. API HTTP fixa identidade antes/depois de obter token. Listener global limpa dados privados ao logout.

Contrato novo: GET /lojas/:lojaId/pedidos/finalizacao/:chave recupera somente nonce do próprio UID/loja e pedido próprio projetado. localStorage contém apenas UID/chave/ID; payload privado na aba (sessionStorage). Fechar aba preserva chave, permite recuperar pedido confirmado; conflito de corpo/commit tardio não duplica. Campos privados legados não são retornados; não houve saneamento ou migração real.

Rules deny-all preservadas, sem liberar SDK direto. Catálogo público via API. Admin SDK privilegiado auditado separadamente. Índices COLLECTION de soma acrescentados localmente: criadoEm+total e pagamento.status+criadoEm+status+total; não publicados, Emulator não comprova índice de produção. CORS allowlist preservado, env/credenciais fora do versionamento.

Validação final: npm backend test 5 arquivos; HTTP 69 testes/subtestes; React 36 testes/4 arquivos; build 1623 módulos; sintaxe Node 44 arquivos e diff --check aprovados. Suite21 Emulator completa exit0 inclui regressões19/20 e 300 negativas diretas SDK Web (6 atores×10 caminhos×5 operações), mais 37 verificações HTTP. Preço confiável, isolamento entre dois clientes/lojas, token expirado/inválido/desativado, admin inativo textual/booleano, revogação real, idempotência 5x e confirmação financeira concorrente validados. Sem segredos encontrados pelos padrões examinados.

Achados altos no escopo corrigidos, sem pendência crítica/alta identificada; não declara segurança universal de produção. Pendências: Rules/índices reais autorizados, IAM/credenciais, provedores/domínios/admin real, CORS HTTPS, dados legados/loja, homologação navegador/celular, retenção/monitoramento/abuso e Java permanente. Sem novas dependências/CSS, deploy, publicação, escrita/migração Firebase real, promoção de admin real ou push remoto.

Guia externo atualizado na seção 96. Próxima ação: revisão do usuário; Etapa 22 depende de nova autorização e não foi iniciada.


## Etapa 22 — Validação global de entradas — 13/10/2026

Ordem 09 autorizada após aprovação com ressalvas da Etapa 21. Status: concluída localmente, disponível para revisão; Etapa 23 não iniciada.

Checkpoint obrigatório ANTES de modificar código: branch main, diff 21 e documentação revisados, scan de 64 arquivos sem padrões privados encontrados, backend/HTTP69/React36/build/suíte integrada21 aprovados. Commit local exclusivo `c2a0cbf` — `security(backend): conclui auditoria e protecoes da etapa 21`. Commits anteriores preservados; sem push. Esta entrada sucede o registro histórico da Etapa 21 em diff local.

Auditoria completa, matriz das 43 rotas, corpos/params/queries/erros e limites: `docs/ETAPA_22_AUDITORIA_VALIDACOES.md`. Relatório de 18 itens e inventário de cada arquivo: `docs/ETAPA_22_RELATORIO_FINAL.md`.

Implementado: seis módulos de schemas em backend/src/validators e middleware reutilizável, presente em todas as rotas, com teste de correspondência entre inventário e routers reais. Validação de corpo/path/query, tipos, obrigatórios/opcionais, campos desconhecidos e aninhados, Unicode, IDs/chaves, controles, CEP/UF/telefone, arrays/quantidades e centavos. Guarda global: 64 KiB JSON, profundidade 8 e 5.000 nós. Pedido: 1–50 produtos distintos, 1–99 por item e até 500 unidades. Monetários recebidos: 0–1.000.000, sem arredondar frações de centavo. Período/dashboard até 31 dias e paginação 1–100. Parsing inválido/compactação/codificação: 400/413/415 genéricos; demais erros existentes preservados, sem antecipar Etapa 23.

PATCH de configuração mescla entrega/retirada/pagamentos/endereço/horários e dias omitidos em transação, validando o resultado antes de gravar. Flag cartao legada convertida ao editar formas para permitir desativação explícita. Desconhecidos agora 400; dicas conhecidas clienteId/precoUnitario/total permanecem validadas e não controlam identidade/cálculo público. Consulta de pedidos de cliente não aceita filtros admin; admin informa limite para cursor/status. Contratos válidos do React preservados, sem mudança de design ou novas dependências.

Resultados: npm backend test 6 arquivos aprovados; HTTP detalhado 253/253; schemas diretos 5/5; React 38/38 em 4 arquivos; build Vite 1.623 módulos aprovado. Suite22 completa inclui regressões19/20/21, 300 negativas SDK Web e 101 verificações novas da 22; integração específica final ampliada a 104 verificações, incluindo transporte HTTP real de JSON inválido/grande, charset e gzip. Rejeições comparadas a snapshots sem persistência; idempotência 5x resulta em um pedido/nonce, total confiável 47,98; isolamento, autorização e financeiro preservados. Sintaxe de 30 JS backend/scripts/testes e diff --check aprovados; revisão de padrões privados sem achados.

Documentação oficial preservada por acréscimo; guia externo atualizado na seção 97 com relatório completo e auditoria. Etapa 22 permanece em alterações locais para revisão, além do checkpoint21 já commitado. Nenhuma publicação, deploy, migração, escrita real, promoção de role ou push.

Pendências anteriores mantidas: publicação Rules/índices mediante ordem futura, IAM/credenciais, provedores/domínios/admin/CORS reais, controle de abuso, dados legados incompatíveis, retenção/auditoria financeira, homologação navegador/celular e Java permanente. Limites comerciais precisam de homologação por estabelecimento. A aprovação local não libera produção. Recomendação: revisar a Etapa 22; iniciar Etapa 23 apenas após nova autorização.


## Etapa 23 — Tratamento global de erros e consolidação de ressalvas — 13/10/2026

Ordem 10 autorizada após aprovação 22 com ressalvas. Status: concluída localmente, disponível para revisão. Etapa 24 não iniciada.

Primeira ação: criado docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md com 17 identificadores, datas, arquivos, descrição, prioridade, impacto, evidência/hipótese, etapa prevista, status, teste e resultado. Registro permanente obrigatório em toda etapa futura. R-015, R-016 e R-017 resolvidas no escopo local 23; demais 14 pendentes, sem remoção ou aprovação comercial implícita.

Checkpoint obrigatório 22 ANTES de alterar código: main, HEAD inicial c2a0cbf, diff 22/documentação revisados, 36 arquivos 22 e novo registro examinados por padrões privados, baseline 6 arquivos, HTTP 253, React 38, build e suíte 22 completa incluindo 19/20/21 aprovados. Commit exclusivo 22 `9122f01` — `feat(backend): conclui validacao global de entradas etapa 22`, 36 arquivos. Registro de ressalvas excluído deste commit para manter escopo 23. Histórico anterior preservado; sem push.

Auditoria de erro/contratos/evidências: docs/ETAPA_23_AUDITORIA_ERROS.md. Relatório obrigatório de 20 itens e inventário individual: docs/ETAPA_23_RELATORIO_FINAL.md. Registro permanente: docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md.

Correções: reprodução confirmou Firestore code 14 durante autenticação respondendo 401; agora 503. Credenciais conhecidas da verificação de token permanecem 401; permissão/loja/inatividade internas 403; falhas temporárias SDK/Firestore 503; falhas inesperadas/configuração do Admin 500. Controllers, guardas, validação, parsing, rotas inexistentes e handlers async encaminham ao handler global Express 5. ErroHttp/ErroDominio e classificador reutilizáveis, mensagens públicas seguras, sem reimplementar validações 22. Rotas desconhecidas 404 JSON, input inválido 400, payload 413, codificação/formato 415. Conflito de mesma chave/outro corpo agora 409; demais regras comerciais preservadas.429 é suportado/testado, sem alegar rate limiting implementado.

Envelope {error: mensagem} mantido. X-Request-ID gerado pelo servidor, exposto por CORS e capturado em erros do cliente, sem confiar no header recebido. Logs 500/503 mínimos: evento/categoria/status/código conhecido/requestId, sem token/UID/body/PII/stack/path. Resposta já iniciada é fechada sem divulgar exceção pelo handler padrão.

React API: timeout 20 s cobre sessão, token, fetch e JSON; cancelamento explícito permanece AbortError; resposta de sucesso inválida rejeita com diagnóstico cliente 502; trocaUID em token/resposta/body é descartada antes de invalidar a sessão nova. Falhas 500/503/rede não provocam logout. Retry automático após 401 só em leitura ou POST de pedido protegido por nonce; demais mutações exigem ação manual. Carrinho, body e chave da tentativa preservados em 503/409/timeout/falha de protocolo, sem alteração visual.

Resultados finais: backend npm test 7 arquivos, HTTP 285/285, erros globais 3/3, React 65/65 em 4 arquivos, build Vite 1.623 módulos, sintaxe 30 JS backend/scripts/testes e diff--check aprovados. Suite 23 integra 19/20/21/22 e 22 cenários HTTP reais novos; regressão 21 mantém 300 negativas SDK Web e 37 verificaçõesHTTP; 22 mantém 104 verificações. Testes novos simulam abort antes de commit sem persistência e perda de resposta após commit recuperando um pedido/nonce; financeiro/WhatsApp não alteram estado por falha e isolamento permanece.

Documentos atualizados por acréscimo, guia externo seção 98 com auditoria, relatório e registro permanente. Pendências de produção/legados/retenção/expiração/IAM/Rules/índices/performance/navegação/licença/Java/homologação permanecem explicitamente registradas. TTL idempotente adiado: requer janela e retenção conjunta para não permitir duplicação após expirar nonce. Nenhuma escrita real, migração, publicação, deploy, push ou Etapa 24. Etapa 23 permanece em diff local para revisão. Próxima ação: revisão do usuário, que poderá autorizar 24.


## Etapa 24 — Testes completos, regressão e homologação local — 13/10/2026

Ordem11 executada, concluída localmente com ressalvas para revisão. Checkpoint23 criado antes de alterar código: `77c8bb7`,39 arquivos, main, anterior9122f01 preservado, sem push. Baseline23 reproduzido. Relatório completo obrigatório24itens: docs/ETAPA_24_RELATORIO_FINAL.md; plano/roteiro manual e evidências em docs/evidencias-etapa24.

Final: backend321/321 em8arquivos aprovados; matriz HTTP285/285; erros globais3/3; React76/76 em6arquivos; build1.623módulos. Suite24 integrada passou19–23 e nova homologação:300negações SDK,37HTTP21,104HTTP22,22HTTP23;12fluxos Chrome e200checks HTTP24 (184benchmark+16funcionais). Audit zero nas duas árvores. Todos os números distinguem natureza e inclusões sem dupla contagem.

Correções demonstradas e regressivas: catálogo descarta resposta antiga; cache do carrinho sanitiza null/duplicatas; override restrito uuid11.1.1 em gaxios6.7.1 com multipart testado; sidebar renderiza sem ReferenceError e Sair encerra sessão. Novos R-018–022 resolvidos localmente. Os17anteriores permanecem:14abertos (11pendentes e R-010/012/013 em análise),3resolvidos locais23. Total22,14abertos,8resolvidos locais.

Benchmark20amostras/3aquecimentos,100/1.000produtos/pedidos fictícios, catálogo/produtos/pedidos/dashboard; JSON com mediana/p95/bytes/memória/SDK. Catálogo retorna106→1.006documentos; paginados28; dashboard14agregações. Sem estimativa de fatura/capacidade concorrente. Chrome desktop/mobile emulado, URL/reload/back, admin/checkout/WhatsApp URL sem abrir; zero erros JS/console. Inspeção de screenshots não equivale a testes em celulares reais. Roteiro manual pendente.

Inventário individual de cada arquivo/função no item15do relatório. Rules/índices/CSS/configuração real preservados, dist fora do diff. Segredos/ignorados/sintaxe/diff conferidos. Guia externo seção99por acréscimo com prefixo verificado. Nenhum Firebase real, migração, deploy, publicação, envio WhatsApp, push ou Etapa25. Próxima ação depende da revisão/autorização do usuário; não iniciar25.


## Etapa 25 — Preparação da infraestrutura de produção — 14/10/2026

Iniciada em13/10/2026, conclusão/documentação final em14/10/2026 (America/Sao_Paulo).

Ordem12 executada, concluída localmente para revisão; Etapa24 aprovada com ressalvas. Checkpoint24 antes de mudar código:949f992,25arquivos, main e histórico77c8bb7/9122f01 preservado. Baseline321backend/76React/build revalidado. Sem push. Preparação25 permanece em diff local.

Relatório obrigatório25itens:docs/ETAPA_25_RELATORIO_FINAL.md. Criados também arquitetura, configuração de ambientes, análise de custos, segurança operacional e checklist de implantação25. Inventário individual de arquivos/funções no relatório; evidências em docs/evidencias-etapa25.

Proposta sujeita a aprovação: frontend compartilhadoPages (alternativaFirebaseHosting), APIsharedCloudRun/ADCgerenciada, Firebase separado homolog/prod. Mapa explícito domínio→loja no mesmo bundle, backend autoriza cada operação. Exemplos fictícios por ambiente, guardas externas de projeto/HTTPS/Nodeproduction/semEmulator/semJSONprivado, build externo validado. Container não root por digest, semenv, npmci, PORT/SIGTERM testados semredeexterna. CIread-only por SHA, envdemo, testes/build/audit/Emulator semdeploy/secrets; workflow ainda não rodou remotamente.

Abuso: limiter por processo/IPpeer/UID verificado, janela60s/memóriabounded/429RetryAfter, com recuperaçãoGET. Não é proteção distribuída nem cobre Authdireto; R-023 nova registra proxy/NAT/ingress/bypass/instâncias/cotas. Nenhuma14pendência anterior encerrada. Total23:15abertos(11pendentes/4em análise),8resolvidoslocais. R-007 em análise pela evidência local, R-001–022 preservados.

Testes:backend325/325 em9arquivos, inclui285HTTP/3globais; React79/79 em7arquivos; infra3/3; build1.624módulos, dois builds externos fictícios e rejeição semconfig; npmciReact e produçãoDocker/audit0 ambos. Suite25 passou19–24,300negaçõesSDK e12Chrome/200HTTP24; teste novo21POST/1GET mantém20chamadas aceitas (1criação/19replays),um pedido,21ª429 e recuperação200. HostingEmulatorSPAraiz/cardápio/admin/cache aprovado; path public corrigido após404 local. Evidências24 preservadas; não homologação física/real.

Sete índices preparados (seis preservados, ativo/disponivel novo), deny-allRules preservada. Emulatornão valida composto: publicação/READY/QueryExplain externospendentes. Custos modelados1/10/50/100/150lojas com preços oficiais referênciaUSD/us-central1/Tier1 e fórmulas/CSVde componentespendentes. Subtotal parcial não é orçamento total/mensalidade. PagesFree100domínios:150 exige plano/limite/alternativa aprovada.

Preparados planosConsoleAuth/IAM/legados com identidadecomprovada/dry-run/backup/precondições/rollback, retenção/PII/LGPD/nonce semTTL, backup/restauração isolada porprefixoLoja/RPO-RTOcandidatos, observabilidade e alertas. FasesA–H com responsáveis/critérios; somenteA local executada. Guia externo seção100 por acréscimo/prefixoverificado. Nenhum recurso pago, cobrança, Firebase/IAM/Auth/DNSreal, deploy/publicação, migração/exclusão/backupreal, mensagemWhatsApp ouEtapa26. Próxima ação: revisão do usuário e autorização separada para26/implantação.


## Etapa26 — Auditoria/documentação definitiva —14/10/2026

Ordem13 concluída localmente;produçãoNO-GO. Checkpoint25:792b069,60arquivos,anterior949f992,histórico preservado,sem push. Backend325/React79/build/infra reexecutados. Nenhumcódigofuncional alterado26.

Auditoria recursiva externa8arquivos7TXT/1ZIP,backupprivado foraGit SHA256verificado,não sobrescrito. Cincoarquivos deplanejamento/snapshot com zonas correntes eoriginal integral preservado;GUIA acrescido101,credenciais apenasmodo600;ZIPbyteigual. Total7originais alterados(6texto/1permissão),1mantido,0pendente de leitura;3novosmanuais/índice,total11. Preços/datas históricos não alterados/assumidos aprovados.

CriadosREADME/manuais/arquitetura/API43/modelo/decisões/auditoria/inventário/divergências/planoGO/NO-GO/relatório30itens. Históricos19–25marcados;errata25assinaturaSHA256nãoJSONbruto;examplesdev/testAPI3000semcolidirFirestore8080. Novo validator documental/CIsemdeploy confere links/contratos/configs.

16divergências registradas comstatus,evidência/correção;comerciais/credenciais/equipe seguem pendentes. R-001–023 preservados eclassificados,nenhum encerrado;R-024suporteplataforma/R-025credenciaistexto novos:25totais/17abertos/8resolvidoslocais.

Suite25inclui19–24/12Chrome/200HTTP e21POST+1GETinfra/um pedido429;300negativasSDK,HostingEmulatorSPAcache,Dockernãorootsem.env/redeexterna,infra3/build1.624módulos/audit0passaram. Links/backup/prefixoguia/ZIP/segredossintaxe conferidos. Semdispositivos físicos/CIremoto/recuperação ouprodução real.

Relatório:docs/ETAPA_26_RELATORIO_FINAL.md;inventário/registroD001–016 e matizNO-GO nosdocs26. Próxima ação:revisão/autorização separada do usuário. Nenhumpush/deploy,Rule/índicereal,billing/IAM/DNS/lojasreais,migração/exclusão/backupFirebase oumensagemWhatsApp26.


## R-025 — Encerramento local da segurança de credenciais — 14/10/2026

Estado atual: R-025 resolvida localmente, aguardando revisão do proprietário. Total preservado de 25 identificadores: 16 ressalvas abertas e 9 resolvidas localmente. Este registro posterior atualiza a situação da Etapa 26; os totais e as descrições anteriores permanecem como histórico. Não implica homologação de produção nem encerra outra ressalva.

Operações Firebase informadas pelo proprietário nesta rodada, sem repetição pelo agente: projeto `bancorestaurante`, conta de teste `XPN5…iw02`, senha nova aceita e refresh tokens revogados no terminal local; conta habilitada, papel `admin` e vínculo `loja-demo` preservados. Segundo o proprietário, a primeira tentativa foi recusada por senha inferior a 12 caracteres e a segunda concluiu a operação. A senha nova não foi fornecida ao agente. Não houve login nem qualquer operação Firebase nesta finalização; nenhuma outra conta foi modificada pela tarefa.

Evidências locais verificadas nesta rodada:

- TXT original sanitizado: `/home/lucas/Documentos/lojaDemoRestaurante/email se senhas teste.txt`.
- TXT do backup sanitizado: `/home/lucas/Documentos/lojaDemoRestaurante_BACKUPS/etapa26_2026-10-14_032948/email se senhas teste.txt`.
- ZIP sanitizado: `/home/lucas/.local/share/Trash/files/lojaDemoRestaurante_BACKUPS.zip`; alterada somente a entrada `lojaDemoRestaurante_BACKUPS/etapa26_2026-10-14_032948/email se senhas teste.txt`.
- Campo `Senha` substituído por `[CREDENCIAL REMOVIDA — ARMAZENADA FORA DA DOCUMENTAÇÃO]`, preservando os demais campos. As três cópias não contêm mais os valores antigos identificados; nenhum desses valores foi escrito em logs ou relatórios ou em novas cópias.
- ZIP: teste CRC aprovado em todas as 11 entradas, mesma lista e ordem, comentário preservado e SHA-256 do conteúdo das outras 10 entradas idêntico antes/depois. Reconstrução sem extração para disco, com arquivo intermediário contendo apenas dados já sanitizados. TXT original, TXT do backup e ZIP em modo `0600`.
- `.gitignore` reforçado para os documentos de senhas de teste, diretórios/pacotes privados conhecidos, ADC, credenciais e chaves privadas. Manuais públicos continuam elegíveis ao Git. `backend/.dockerignore` mantém inclusão restrita a package.json/package-lock.json, src e Dockerfile, com exclusões privadas adicionais.
- Verificados 254 arquivos rastreados ou não ignorados e o conteúdo do índice: nenhuma ocorrência dos valores antigos identificados nem dos padrões examinados de chaves privadas, refresh tokens JSON, tokens GitHub, chaves AWS e Google. Índice sem alterações preparadas para commit. A varredura não constitui prova universal de ausência de segredos nem exame integral do histórico Git.
- `git check-ignore` confirmou os exemplos privados protegidos e a preservação dos manuais públicos. `git diff --check` aprovado. Validador documental aprovado: 15 arquivos atuais, 42 links relativos e 43 contratos, além dos exemplos de portas. Sem alteração de código funcional.

Documentação oficial atualizada por acréscimo: este registro, `docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md`, `docs/REGISTRO_DE_TRABALHO.md`, `docs/GUIA_MESTRE.md` e o guia externo `GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt`. Históricos anteriores preservados. O backup e o ZIP foram deliberadamente sanitizados: verificações históricas de identidade desses artefatos descrevem o estado anterior à correção.

Riscos residuais: a sanitização cobre somente as três cópias conhecidas; não elimina possíveis cópias desconhecidas nem vestígios recuperáveis em disco. Access tokens já emitidos podem continuar válidos até expirar se a API não verificar revogação. A nova senha não foi recebida, usada nem escrita nesta tarefa; sua ausência absoluta em arquivos existentes não pode ser comprovada por comparação com um valor desconhecido. Proteções do Git não removem arquivos já rastreados nem substituem revisão contínua.

Nenhum commit, push, deploy, publicação de Rules/índices, alteração IAM, mudança comercial ou avanço para outra ressalva. Aguardar revisão do proprietário.


## Ordem de Implantação 01 — preparação Cloud Run — 14/10/2026

Preparação local concluída, sem implantação externa. Relatório corrente, custos, recursos, IAM, variáveis, testes, atualização e rollback: [Cloud Run homologação](IMPLANTACAO_CLOUD_RUN_HOMOLOGACAO.md). Branch inicial main/792b069, alterações anteriores preservadas. Único ajuste de execução: servidor escuta explicitamente em 0.0.0.0 e usa PORT fornecida pela plataforma. Dockerfile existente preservado; contexto backend sem credenciais.

Consultas somente de leitura encontraram oito projetos Cloud e seis Firebase acessíveis, nenhum identificado como homologação dedicada; listagem de billing vazia para a identidade atual e billingEnabled=false no projeto atual bancorestaurante. Esse projeto não foi selecionado para API pública. Proposta sujeita à aprovação: projeto Firebase/Cloud dedicado, us-central1 (banco na mesma região), serviço catalogos-api-homolog privado por IAM, identidade runtime dedicada sem JSON, 1 vCPU/512 MiB/concorrência10/min0/max1/timeout30s. Quotas/permissões efetivas e billing do novo projeto não confirmados.

Backend325/325, React79/79, infra3/3, build React1.624 módulos em /tmp, imagem Docker local e 8 checks HTTP sem rede externa aprovados; UID1000, SIGTERMexit0, logs mínimos e contexto restrito conferidos. Firebase real de homologação não testado. Java indisponível no PATH: Emulator não reexecutado nesta rodada (R-011). Evidências antigas continuam históricas.

A primeira fase proposta é privada para operadores aprovados. Firebase ID Token do React não substitui IAM do Cloud Run; prévia de navegador depende de gateway/acesso protegido ou autorização específica de exposição após revisão de rotas/abuso/custos. CORS não é autenticação; limiter por processo/peer não resolve proxy/distribuição. Não alterar automaticamente trust proxy ou tornar serviço público.

Frontend já usa VITE_API_URL, VITE_APP_ENV, projeto Firebase esperado e VITE_LOJAS_POR_HOST (ou VITE_LOJA_ID), com mapa explícito de hostname implementado no código; não há prova da configuração do site publicado. Cloudflare atual permanece sem alteração. Não usar conta R-025 nem dados reais para homologação.

Fluxos lógico/de dados do documento externo existente ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt atualizados, distinguindo código implementado, homologação não implantada e produção prevista. Histórico integral anterior preservado; snapshots e decisões comerciais mantidos. Recursos externos, billing, APIs, IAM, invocadores, dados fictícios e eventual acesso público exigem aprovação específica, conforme a Ordem 01 do proprietário.

R-001/002/005/006/007/010/011/012/013/023/024 continuam com pendências; nenhuma encerrada por esta ordem. R-025 permanece resolvida localmente: total25,16abertas,9resolvidaslocais. Sem push, deploy, escrita Firebase, publicação de Rules/índices ou mudanças comerciais. Commit restrito aos artefatos novos da ordem e server.js; acréscimos nestes documentos compartilhados permanecem em diff para não incorporar alterações anteriores.

## Decisão vigente — Render, Ordem de Hospedagem 02 — 15/10/2026

A primeira hospedagem de homologação passa a ser planejada no Render (Web Service Node, Free). Cloud Run permanece como alternativa histórica/futura; suas instruções de IAM privado não se aplicam ao Render. **Render não implantado; sem URL de API, push ou alteração no Cloudflare.** Frontend informado pelo proprietário: https://catalogo-demo-cz1.pages.dev/ (configuração publicada não auditada nesta ordem).

Fluxo previsto: navegador → Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controllers → services → Firebase Admin SDK → Firestore → API → React. Implementação local existente preservada; integração externa pendente de projeto Firebase fictício separado e identidade autorizada. Não usar bancorestaurante ou contas R-025. Não executar pedidos/WhatsApp reais.

Catálogo público: GET /publico/lojas/:lojaId/catalogo → validação e projeções públicas → Firestore da loja. Checkout: React coleta dados → token Firebase → validações da API → cálculo do servidor → transação/idempotência → pedido. Pedidos: consultas/status exigem titularidade ou administração conforme rota. Autenticação: Firebase Web obtém ID Token; API verifica token e revogação, consulta usuário ativo e determina role. Administração: /admin/lojas/:lojaId exige admin e loja correspondente. Multi-loja: hostname→loja explícito no React; parâmetros, middlewares e services validam escopo no servidor. Erros: JSON seguro, status e requestId; logs estruturados sem body, token ou identidade. Admin SDK ignora Rules Web: isolamento depende da API e IAM do ambiente separado.

Configuração proposta: LucasTech-Dev/Catalogos, main somente após revisão/sincronização; Root Directory backend; Node 24.x; npm ci; npm start; Free; instância única; health GET /; Auto Deploy Off; Virginia sugerida, disponibilidade na conta a confirmar. PORT fornecida pelo Render; escuta 0.0.0.0 já implementada.

Bloqueio: guardas externos rejeitam GOOGLE_APPLICATION_CREDENTIALS e exigem identidade gerenciada; Render não herda ADC local. OIDC gerenciado documentado requer workspace Pro e não lista Google. Não há integração Firebase externa validada. Chave de service account em Secret File seria alternativa sujeita a aprovação específica, IAM restrito e alteração revisada do guarda; não foi criada nem configurada. HTTP pode ser testado localmente sem dados, mas GET / não prova Firebase nem restringe outras rotas. Não publicar o app completo como se fosse somente health.

CORS proposto: https://catalogo-demo-cz1.pages.dev, sem barra final; não é autenticação. Limiter em memória usa peer TCP; proxy Render pode agrupar visitantes e gerar 429 coletivo. Não confiar arbitrariamente em X-Forwarded-For ou habilitar trust proxy irrestrito. R-007/R-023 seguem abertas até validação de borda/proxy. Nenhuma ressalva encerrada por esta preparação; R-025 preservada como resolvida localmente segundo o registro anterior, sem nova validação de rotação.

Free: 750 horas por workspace/mês, suspensão após esgotamento, repouso após 15 minutos e retomada em cerca de um minuto; banda/build têm limites separados. Não prometer custo zero total ou operação comercial. Fontes: https://render.com/docs/free ; https://render.com/docs/oidc .

## Estado vigente — Ordem de Preparação 03 — 15/10/2026

Render continua escolhido para a primeira homologação; Cloud Run permanece alternativa histórica/futura. **Somente preparação local; sem projeto/SA/chave/IAM/serviço real, commit, push ou deploy.** Firebase proposto: catalogos-homolog-2026 (nome Catálogos Homologação), existência/disponibilidade não verificadas. bancorestaurante não foi consultado nem alterado. Frontend visual informado: https://catalogo-demo-cz1.pages.dev/; configuração remota não auditada/republicada.

O bloqueio de código da Ordem 02 foi tratado localmente: FIREBASE_CREDENTIAL_MODE=render-secret-file, somente APP_ENV=homologacao e NODE_ENV=production, lê exclusivamente /etc/secrets/firebase-homologacao.json. GCLOUD_PROJECT, FIREBASE_EXPECTED_PROJECT_ID e FIREBASE_HOMOLOG_PROJECT_ID devem ser iguais ao ID dedicado permitido; FIREBASE_SERVICE_ACCOUNT_EMAIL exige conta de serviço do mesmo projeto e o JSON deve corresponder exatamente a ambos. Arquivo ausente/irregular, symlink final, excesso de tamanho, JSON/credencial inválidos, projeto/conta divergentes falham antes do listen, sem imprimir segredo. Sem ADC pessoal/Git/VITE_*. Modo managed é explícito para alternativa com identidade gerenciada; não é promessa de ADC automático no Render. Produção comercial recusa configuração homolog. Desenvolvimento/Emulator preservados; homologação nunca cai no fallback bancorestaurante.

Estratégia recomendada posterior: conta de serviço restrita e exclusiva, Secret File privado Render; nenhuma chave foi gerada nesta ordem. O recurso é documentado em https://render.com/docs/configure-environment-variables sem restrição paga indicada; conta/montagem real ainda não verificadas. Render OIDC gerenciado requer Pro e não lista Google como provedor suportado: https://render.com/docs/oidc . Secret é plaintext acessível ao processo e pessoas com poder de deploy; não presumir isolamento de build. Restringir permissões do workspace, revisar dependências, não imprimir env/arquivo, rotacionar substituindo secret e revogando chave anterior; remover secret não revoga chave no Google. IAM proposto (não aplicado): datastore.user no novo projeto e firebaseauth.users.get para verificação de revogação; operador/provisionamento separado do runtime. Política que proíbe chave deve ser respeitada.

Fluxo preparado: navegador → Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controller → service → Admin SDK → Authentication/Firestore de homologação → API → React. Catálogo: hostname explícito seleciona loja e API pública devolve projeções. Autenticação: Web SDK obtém ID Token e API verifica token/revogação e usuário. Administração: role admin, ativo e vínculo loja; CORS/domínio não concedem role. Carrinho no React; checkout envia IDs/quantidades, servidor recalcula valores e persiste transação/idempotência e snapshots; link WhatsApp deriva do pedido sob autorização, gerar link não envia mensagem nem comprova pagamento. Isolamento multi-loja fica nos middlewares/services e titularidade; Admin SDK ignora Rules Web. Erros JSON seguros e logs mínimos com requestId preservados.

Fixtures locais: duas lojas (loja-homolog e loja-homolog-b), usuários fictícios, categorias, produtos, clientes e endereços; 14 documentos, sem senhas/telefones/WhatsApp/pedidos reais. UIDs placeholders devem ser mapeados aos Auth UIDs aprovados posteriormente. Script backend/scripts/homologacao-dry-run.js --project catalogos-homolog-2026 somente simula: sem SDK, rede, escrita ou opção --write. Dados/preços fictícios não modificam planos comerciais.

Render proposto: catalogos-api-homolog; Git interno LucasTech-Dev/Catalogos, main após revisão/push autorizado; raiz backend; Node 24; npm ci; npm start; Free; instância única; health /; Auto Deploy Off; Virginia sugerida, disponibilidade a verificar. PORT da plataforma; CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev. Secret e configuração podem iniciar deploy ao salvar: autorização deve preceder ação no painel. Não existe URL da API. VITE_API_URL só receberá URL real validada em etapa posterior; VITE_FIREBASE_PROJECT_ID/EXPECTED_PROJECT_ID/HOMOLOG_PROJECT_ID devem corresponder ao Firebase dedicado. Configuração Web é pública, chave Admin jamais VITE_. Hostname→loja continua explícito e backend confirma escopo. Authorized Domains e CORS são controles distintos.

Testes antes/depois: backend 325→334 aprovados; React 79→80; infra 3→4; ambos builds aprovados (1.624 módulos). Emulator 19–23 concluído, exit 0, com Java 21 e JAR temporários já disponíveis, projeto demo- e Auth/Firestore locais; sem instalação permanente ou dados reais. Inclui tokens/sessões, Rules deny-all, autorização A/B, concorrência, validações, erros e pedidos fictícios. Logs brutos Emulator não distribuídos por poderem conter tokens locais; evidência sanitizada preservada. Teste novo de admin de outra loja retorna 403 e não altera dados. Integração Render, Secret File real, IAM, índices READY e queries reais não comprovados.

Estados: contratos/fluxos existentes implementados; loader/guardas/exemplos/fixtures preparados localmente; projeto/Auth/Firestore/SA/IAM/Rules/índices dependem de criação externa; Render/Firebase dedicado não implantados. Roteiro Console, IAM, rotação, matriz de gates e relatório completo: docs/FIREBASE_HOMOLOGACAO_RENDER.md no repositório. Somente após aprovação: escolher ID/plano/localização, criar Firebase dedicado, configurar Auth/Firestore/Rules/índices e IAM/credencial; depois autorizar push e publicação Render; por último integrar Cloudflare com nova aprovação.

Ressalvas preservadas: 25 IDs, 16 abertas, nove resolvidas localmente; R-025 mantém estado anterior. R-023 e R-007 continuam abertas: limiter em memória usa peer TCP e pode agrupar clientes no proxy; sem proteção distribuída comprovada. R-006 aguarda IAM/credencial real; Java temporário não encerra R-011. Sem encerramento por documentação. Free tem repouso de 15 min e retomada de cerca de um minuto, potencialmente além do timeout Web atual de 20 s; 750 horas/workspace/mês e limites de banda/build/tráfego externo, sem garantia de custo total zero. Spark deve ser verificado para o escopo básico; billing/Blaze, recursos adicionais e custos exigem aprovação própria. Produção comercial segue NO-GO.

## Ordem 04 — projeto Firebase vazio — 15/10/2026

Preparação 03 aprovada documentalmente com ressalvas, sem inspeção independente declarada pelo proprietário. Git preservado: main 19b554d, oito commits à frente da referência remota local e alterações pendentes. Ordem 04 limita-se à orientação para o proprietário criar somente projeto Firebase novo: Catálogos Homologação, ID proposto catalogos-homolog-2026, Spark sem billing. Consulta CLI ao ID terminou código 120 sem saída: disponibilidade não confirmada, validar no formulário Console. Projeto ainda não confirmado como criado; ID/plano efetivos aguardam informação do proprietário.

Spark atende esta fase vazia. São Paulo (southamerica-east1) e Northern Virginia (us-east4) são regiões Firestore suportadas; nenhuma foi escolhida. Banco/localização, Authentication, app Web, dados, identidade/chave, Render e Cloudflare ficam para autorização posterior. Não vincular billing nem configurar recursos que fixem localização padrão incidentalmente. bancorestaurante não foi consultado/modificado. Sem commit, push ou deploy; 16 ressalvas abertas preservadas. Procedimento e fontes oficiais: docs/ORDEM_04_CRIACAO_PROJETO_FIREBASE.md.

## Decisão vigente — Render com Firebase existente — 15/10/2026

Por instrução posterior do proprietário, usar bancorestaurante e loja-demo na primeira implantação de demonstração; não criar catalogos-homolog-2026, banco novo, migração ou cópia. Esta decisão substitui a Ordem 04 anterior de criação de projeto vazio. Cloud Run e Firebase separado ficam como alternativas históricas/futuras. **Somente preparo local, sem conexão real, chaves, IAM, dados, push ou deploy.** Relatório/configuração atual: docs/PREPARACAO_RENDER_BANCORESTAURANTE.md.

Backend mantém APP_ENV=homologacao e NODE_ENV=production. Para o projeto existente, exige FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante além de GCLOUD_PROJECT, FIREBASE_EXPECTED_PROJECT_ID e FIREBASE_HOMOLOG_PROJECT_ID iguais ao mesmo ID. Somente FIREBASE_CREDENTIAL_MODE=render-secret-file é aceito nessa exceção; managed/ADC pessoal/Emulator/produção comercial são recusados. Conta de serviço deve ser explícita do mesmo projeto e o JSON corresponder exatamente ao projeto/email; arquivo fixo /etc/secrets/firebase-homologacao.json, nenhum segredo no Git/VITE_*/logs. Modelo vigente infra/render/bancorestaurante.backend.env.example. Nome de conta sugerido catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com, ainda não criado/verificado; IAM/geração/upload precisam de aprovação específica.

Frontend tem opt-in equivalente VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante, três IDs públicos correspondentes e mapa catalogo-demo-cz1.pages.dev→loja-demo; modelo infra/render/bancorestaurante.web.env.example. VITE_API_URL segue placeholder até existir URL real validada. Nenhuma publicação Cloudflare feita. Authorized Domains, Rules/índices/IAM e dados do Firebase atual não consultados nesta rodada; arquivos locais não provam estado remoto.

Fluxo preparado: Cloudflare Pages → React → HTTPS → Render → Express → autenticação/loja → controllers → services → Admin SDK → Firebase bancorestaurante (Authentication/Firestore) → API → React. Catálogo público usa projeções; token/revogação, usuário ativo, role e vínculo preservados; cliente/pedido/endereço mantêm titularidade/escopo. Checkout recalcula/transaciona/idempotência no servidor; link WhatsApp não envia mensagem. API continua compartilhada para restaurantes, sem superadmin. Nenhum pedido/usuário real alterado.

Banco persistente não é descartável: opt-in de configuração não autoriza escrita/publicação e não concede IAM. Uma API pública completa com identidade de escrita poderá afetar dados reais; revisar dados publicáveis, alcance de IAM, recuperação e operações permitidas antes de expor. Admin SDK ignora Rules Web; autorização da API continua essencial. CORS HTTPS exato não autentica; limiter local/peer TCP pode agrupar visitantes atrás do proxy. trust proxy não foi ampliado. R-007/R-023 e demais gates reais seguem abertos; 25 ressalvas, 16 abertas e nove resolvidas localmente preservadas. Vendas comerciais não liberadas.

Render proposto catalogos-api-homolog, Node 24, Free, raiz backend no Git interno, npm ci, npm start, health /, Auto Deploy Off, uma instância, PORT da plataforma. Salvar secret pode iniciar deploy; só fazer após autorização. Integração Render–Firebase existente não comprovada. Fixtures/Emulator permanecem fictícios; script de simulação continua recusando bancorestaurante. Resultados reais de testes e limites constam no relatório/evidências desta decisão.

## Ordem 05 — auditoria pré-publicação local — 15/10/2026

Preparação 04 aprovada documentalmente com ressalvas pelo proprietário; isso não é inspeção independente nem autorização de operações externas. Auditoria 05 restrita aos arquivos locais, sem Firebase/GitHub/Render/web, credenciais ou testes externos. Relatório completo: docs/AUDITORIA_PRE_PUBLICACAO_RENDER.md; inventário individual: docs/evidencias-ordem05/ROTAS.md.

Resultado: 43 contratos, 28 GET e 15 mutações Firestore. Não há modo global somente leitura: pedidos/perfis/endereços/configuração/produtos/categorias continuam montados com suas autorizações. Catálogo público aceita qualquer lojaId existente não explicitamente inativo, não só loja-demo; loja/categoria sem ativo passam no comportamento legado. Campos projetados precisam de aprovação de valores concretos: allowlist não remove PII dentro de texto/contatos/URL. Listagens legacy e catálogo podem ler coleções inteiras; filtro de status/cursor em listagem administrativa de pedidos depende do ramo paginado com limite. Esses achados não foram alterados nesta auditoria.

Primeira liberação proposta: somente health e catálogo de loja-demo previamente aprovado, com restrição no backend ou borda sem bypass e identidade efetivamente sem escrita (viewer como candidato, IAM herdado a conferir). Isso é plano, não funcionalidade pronta. CORS, esconder botões ou usar token de teste não bloqueiam as mutações. Não conectar cadastro/login anônimo/checkout do frontend nessa fase, pois Web SDK pode criar/alterar contas Auth independentemente da escrita Firestore na API. Não testar POST no Firebase real para comprovar negação sem autorização específica.

Runtime exclusivo proposto catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com, ainda não criado/verificado. Auth com verifyIdToken(token,true) consulta getUser para revogação/disabled; firebaseauth.users.get é candidato de permissão, não users.create/update/delete/list ou Auth Admin. Para leitura Firestore, viewer é candidato; escrita futura exige concessão específica de create/update/delete conforme operações, nunca Owner/Editor por conveniência. Permissões efetivas/Secret File/montagem/rotação não comprovadas. Nenhuma chave lida/gerada/baixada nesta ordem. Ignores, loader restrito e logs seguros preservados; Admin SDK ignora Rules Web.

Rules locais deny-all e sete índices COLLECTION comparados com queries reais dos services; estado publicado/READY e exemptions desconhecidos. Emulator anterior não comprova índices reais. Checklist de consulta futura exige autorização específica e metadados/campos mínimos, sem clientes/endereços/pedidos/usuários reais por conveniência. Não criar banco/projeto, migrar dados ou publicar Rules/índices.

Fluxo vigente preparado: Cloudflare Pages → React → HTTPS → Render → Express/middlewares/controllers/services → Admin SDK → Firebase bancorestaurante → API → React. Render permanece proposto catalogos-api-homolog, Node 24, backend, npm ci/npm start, Free/uma instância, health /, Auto Deploy Off, PORT da plataforma; CORS exato https://catalogo-demo-cz1.pages.dev e secret fixo /etc/secrets/firebase-homologacao.json. Opt-in de ambiente bancorestaurante preservado. Limites/plano/conta Render e URL real não verificados nesta ordem. Salvar secret/criar serviço pode iniciar publicação; gate deve existir antes da primeira implantação.

Git main 19b554d, oito commits à frente da referência remota local; sem fetch/commit/push. Inventários rastreados/novos/commits preparados; sequência de commits proposta para revisão por hunks e conjunto executável, sem inclusão indiscriminada. Scanner textual local sem achados nos candidatos atuais; isso não certifica histórico completo, binários ou PII. Testes da Ordem 04 (backend335/React81/infra5/build/Emulator19–23) são históricos; não reexecutados nesta rodada estática, sem mudança de código. Validador documental e diff --check conferidos localmente.

Permanecem 25 ressalvas, 16 abertas e nove resolvidas localmente; R-025 preservada. A05-01 (alcance catálogo), A05-02 (volume/filtro listagens) e A05-03 (ausência de leitura restrita) são achados da auditoria, não novos IDs R. R-005/R-006/R-007/R-023 e integração/custos seguem pendentes. NO-GO para API completa com escrita ou vendas. Próxima ação: proprietário revisar escopo/gate de leitura e autorizar tarefas específicas; depois metadados/dados publicáveis, IAM/credencial, GitHub, Render e Cloudflare em fases aprovadas. Nenhuma operação externa ou modificação de dados/IAM/serviço realizada.

## Ordem 06 — demonstração pública somente leitura — 15/10/2026

Implementação local concluída, sem publicação. Relatório vigente: docs/RENDER_DEMO_SOMENTE_LEITURA.md. Modo CATALOGOS_RUNTIME_MODE=public-readonly-demo validado antes de iniciar HTTP; exige homologacao/production explícitos, projeto/opt-in bancorestaurante, credencial Secret File correspondente e CATALOGOS_DEMO_LOJA_ID=loja-demo. Config parcial, modo inválido, outro projeto/loja ou Emulator incompatível falham fechados. Opções CATALOGOS_DEMO_* sem seletor demo são recusadas. Aplicação completa com 43 contratos preservada fora desse modo.

Permitidos exclusivamente GET/HEAD / e /publico/lojas/loja-demo/catalogo; OPTIONS apenas nesses caminhos, com origem e método GET/HEAD aprovados. Outras 41 rotas, 15 mutações, admin, usuários, clientes, endereços, pedidos/WhatsApp, outras lojas, queries/aliases/traversal e métodos não listados são negados antes de controllers/services. Não monta routers privados nem importa Firebase Authentication no ramo demo. Resposta genérica de indisponibilidade, sem detalhes internos.

Dados reais ainda não revisados: exemplo mantém CATALOGOS_DEMO_CATALOG_APPROVED=0 e listas JSON CATALOGOS_DEMO_PRODUCT_IDS=[] / CATALOGOS_DEMO_CATEGORY_IDS=[]. Catálogo retorna 503 sem consultar Firestore; health não lê banco. Futuramente aprovação humana de valores concretos + flag 1 e listas explícitas (até 50 produtos/20 categorias) são obrigatórias. Nenhum ID real aprovado nesta ordem. Loja/categorias/produtos exigem ativo true, produtos vinculados às categorias aprovadas; DTO só loja id/nome, categorias id/nome e produto id/nome/descricao/preco/categoriaId/disponivel/imagem opcional HTTPS sem userinfo/query/hash. Sem contatos/endereços/clientes/pedidos/financeiro privado/usuários/metadados. Projeção não detecta toda PII em texto e aprovação por ID não congela documentos: alterações posteriores exigem suspender/revisar aprovação.

Leitura pontual por DocumentReference.get, sem varrer coleção ou chamar mutações/transações/Auth. Limite máximo 71 documentos por carga, resposta máxima 64 KiB, cache somente DTO 30 s e coalescência de concorrência. Limiter demo 60/min por peer/processo, 429/Retry-After; sem confiar em X-Forwarded-For/trust proxy aberto. Proxy pode agrupar usuários; cache/limite não são proteção distribuída ou teto de custo. R-023/R-007 permanecem abertas.

Frontend explícito VITE_CATALOGOS_RUNTIME_MODE=public-readonly-demo, VITE_CATALOGOS_DEMO_LOJA_ID=loja-demo, IDs/opt-in públicos bancorestaurante e mapa somente loja-demo. main carrega prévia separada; catálogo e filtro sem carrinho/checkout/Auth. Páginas privadas mostram indisponibilidade e não buscam dados; nunca aparentam pedido criado. Firebase Web Auth não inicializa mesmo com configuração pública presente; cliente API completo também tem gate defensivo. SDK Auth/API key não necessários à prévia. VITE_API_URL segue placeholder até existir URL real aprovada. Nenhum WhatsApp ou pedido real. Auth real por outros clientes é superfície independente, não desabilitada nesta ordem.

IAM: infra/render/iam-demo-readonly.proposta.json propõe papel personalizado somente datastore.entities.get, sem listagem/escrita/Auth/IAM; suficiência/permissões efetivas ainda precisam de validação autorizada, sem ampliar por conveniência. Identidade sugerida catalogos-api-demo-readonly@bancorestaurante.iam.gserviceaccount.com não criada/verificada. Secret fixo /etc/secrets/firebase-homologacao.json, nunca Git/VITE_*/logs; montagem real/rotação/políticas/IAM herdado pendentes. No modo demo, Firebaseauth.users.get não é necessário pelo caminho de execução; revogação do modo completo continua preservada.

Render proposto catalogos-api-homolog, Node24/Free/uma instância, raiz backend, npm ci/npm start, health /, Auto Deploy Off, PORT da plataforma; criar serviço/salvar secret pode iniciar deploy e exige autorização. CORS exato do exemplo https://catalogo-demo-cz1.pages.dev. Plano/região/limites da conta e URL API não comprovados. Nenhuma operação Firebase real/Rules/índices/Cloudflare/Render/IAM/chave/GitHub efetuada. Sem commit/push/deploy. Fluxo preparado: Cloudflare Pages → React demo sem Auth/checkout → HTTPS → Render → Express somente leitura → catálogo aprovado da loja-demo → Firestore bancorestaurante → DTO público → React.

Testes: backend342/342, React92/92, infraestrutura7/7; builds normal e demo aprovados. Teste novo Emulator aprovou catálogo, 41 contratos negados, outra loja, zero mutações pelo app e fixtures intactas; regressões 19–23 completas exit0. Fixtures foram escritas apenas em projeto demo- emulado com Java/JAR temporários; não no Firebase real. Logs brutos CLI podem conter env/tokens locais e não são distribuídos; evidências sanitizadas em docs/evidencias-ordem06. Fluxos completos anteriores continuam desenvolvidos para ambientes completos, indisponíveis na primeira demonstração.

Ressalvas preservadas: 25 IDs, 16 abertas e nove resolvidas localmente; R-025 conforme estado anterior. A05-01/A05-03 corrigidos localmente no modo restrito e cobertura de A05-02 reduzida no ramo demo, sem encerrar gates de IAM/dados/hosting/proxy/custos. Produção comercial permanece NO-GO. Próximo passo depende de revisão do proprietário: aprovar dados/IDs, validar IAM leitura/identidade e secret reais, depois revisar/sincronizar Git e autorizar publicação restrita/API/Cloudflare. Não alternar serviço demo para full por conveniência. Não criar projeto/banco nem alterar preços/planos comerciais.


## Ordem 07 — auditoria real de leitura — 15/10/2026

Relatório vigente: [VALIDACAO_DADOS_PUBLICOS_RENDER.md](VALIDACAO_DADOS_PUBLICOS_RENDER.md). Consulta autorizada ao projeto confirmado bancorestaurante, banco Native (default), região existente nam5, com ADC de usuário (e-mail nominal não identificado, impróprio como identidade Render). Foram 16 documentos únicos: loja-demo, quatro categorias e 11 produtos; 17 obtenções com releitura projetada de ativo da loja. Sem clientes/endereços/pedidos/ADM/usuários, outras lojas, escrita ou documentos completos nos relatórios.

Bloqueador crítico A07-01: Rules efetivamente publicadas diferem do deny-all local e permitem read sem autenticação também em clientes, endereços, pedidos e ADM da loja-demo; create/update têm apenas condições de campos, sem request.auth. Não foram exploradas permissões nem consultados documentos privados; isso não prova vazamento ocorrido. A API demo e IAM de leitura não corrigem acesso direto Firestore. Nenhuma Rule foi alterada.

Nove produtos e três categorias são candidatos técnicos, sem aprovação de publicação. A07-02: campo ativo ausente na loja impede catálogo (503). A07-03: seis URLs de imagem com query são omitidas pelo DTO, sem acesso remoto. A07-04: disponivel ausente nos 11 produtos é interpretado como true pelo código e requer confirmação. Listas preservadas vazias e CATALOGOS_DEMO_CATALOG_APPROVED=0.

SA proposta catalogos-api-demo-readonly não localizada (404); sem concessões diretas ao alvo na policy consultada, herança/permissões efetivas não comprovadas. datastore.entities.get atende à leitura pontual pela referência oficial, sem escrita/Auth; papel personalizado ainda é proposta, não isola por loja. Zero índices compostos nos grupos produtos/pedidos, sete locais ausentes; demo pontual dispensa esses índices. Evidências sanitizadas em evidencias-ordem07.

Fluxo preparado continua Cloudflare React demo → HTTPS/Render somente leitura → Admin SDK/IAM → catálogo aprovado loja-demo → DTO; o caminho direto do Web SDK obedece às Rules publicadas e apresenta risco independente. Nenhum push/deploy, credencial, IAM, alteração Firebase ou Cloudflare. Próxima fase exige autorização específica, priorizando correção/testes das Rules antes de liberar catálogo. Preservadas 25 ressalvas, 16 abertas/nove resolvidas localmente; R-005/R-006/R-007/R-023 abertas; vendas comerciais não liberadas. Os achados A07 não criam novos IDs R.


## Render — Etapa 1: branch de deploy — 15/10/2026

Branch local deploy/render-demo-readonly preparada sem mover main, sem push/deploy/IAM/chaves ou alteração do Firebase. Relatório vigente: [preparação da branch e roteiro](RENDER_ETAPA1_BRANCH_DEPLOY.md). Backend342, React92 e infra7 aprovados; builds normal/demo e integração demo em Emulator aprovados; auditorias npm sem vulnerabilidades; scanner de arquivos e histórico pendente sem segredos encontrados. Catálogo permanece APPROVED=0 e listas vazias.

Proprietário informou publicação manual de Rules deny-all; isso atualiza o contexto de autorização, mas não foi reverificado remotamente nesta etapa. Achado da Ordem07 preservado como histórico. Antes de push: conferir políticas reais production/preview do Cloudflare e aprovar o envio exclusivo da branch. Antes de Render: identidade efetivamente sem escrita, Secret File válido, versão correta no GitHub e autorização de criação do serviço. main e configuração Cloudflare não alteradas; 25 ressalvas/16 abertas/nove resolvidas localmente preservadas.
