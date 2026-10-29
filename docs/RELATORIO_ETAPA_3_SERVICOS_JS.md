# Etapa3 — Serviços JavaScript/Firebase SDK por estabelecimento

28/10/2026, America/Sao_Paulo. Relatório técnico do [plano mestre](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md), sem roteiro concorrente. Escopo autorizado na mensagem atual do proprietário, anexo com título “ETAPA3 — BACK-END JS / FIREBASE SDK MULTILOJA”. Hash do pedido012da66042fd7d0c2073044d5f808c28086b4ba8fea0160454104042a8ed9f54. Proíbe operações reais e determina todos os testes de escrita nos Emulators. Etapa4 não iniciada.

Estado: **CONCLUÍDA TECNICAMENTE NO AMBIENTE LOCAL**, com validação automatizada descrita abaixo; publicação e aceite comercial não executados.

## A — EXECUÇÃO PELO CODEX

### Achados e alterações

1. Resolução de loja: o full runtime ainda tinha `VITE_LOJA_ID || 'loja-demo'` em desenvolvimento. Removido o fallback em todos os ambientes full. Localhost exige loja explícita ou mapa; homologação/produção e domínio não local exigem `VITE_LOJAS_POR_HOST`. Host desconhecido, mapa/ID inválidos e configuração ausente falham antes de inicializar os fluxos. A Demo continua válida com sua configuração explícita; exemplos já identificavam `loja-demo` e o host canônico. Não inferir estabelecimento de querystring ou aceitar domínio arbitrário.
2. Identificadores: validadores diferentes aceitavam combinações distintas de espaços/Unicode. O predicado compartilhado `identificadorValido` recusa vazio, espaços nas pontas, separadores de caminho, controles, Unicode malformado, ponto/ponto duplo e valores acima de128caracteres. Serviços mantêm mensagens/status próprios e verificam IDs antes de montar caminhos. Nenhum documento existente foi renomeado ou migrado.
3. Tentativas de checkout: a limpeza de sessão percorria dados de todas as lojas na mesma origem. Agora recebe loja explícita, toca somente o namespace correspondente e codifica loja/UID para impedir colisão de separadores. Chaves da Demo e IDs alfanuméricos existentes permanecem iguais. Chaves legadas ambíguas com separadores não são atribuídas automaticamente a outra loja; permanecem intactas. Carrinho mantém o isolamento já existente por loja e identidade, agora validando o identificador recebido.
4. Auth: a lógica existente foi extraída para `criarServicoConta`, com dependências de Auth e perfil explícitas. `conta.js` mantém exatamente as exportações consumidas pela UI. Uma trava por instância Auth evita login/cadastro/reset simultâneos inclusive quando duas fachadas compartilham a mesma sessão. Cadastro verifica o UID antes/depois da atualização Auth e conserva a vinculação de convidado; não cria conta ou perfil administrativo por e-mail. Serviços de perfil/pedido/admin retornam401 para sessão ausente, sem consultar dados privados.
5. Autoridade administrativa: consultas simultâneas da mesma instância de serviço/UID compartilham apenas o GET em andamento. Nenhum papel é guardado após a operação; revogação é revalidada na próxima chamada. Nenhum cache privado compartilhado entre lojas ou novas permissões foi criado.
6. Concorrência administrativa: teste real de duas criações do mesmo produto/ID encontrou conflito das Rules antes do retry do SDK. Agora chamadas simultâneas com mesma intenção explícita, UID e dados normalizados compartilham a operação. Intenção com dados divergentes recebe409; criações sem intenção explícita continuam independentes. Origem/projeção/revisão continuam transacionais, e repetir depois de concluir usa a recuperação já existente, sem nova revisão.
7. Dashboard: pedidos recentes passam por verificação explícita de `lojaId` antes de compor o DTO. Documento inconsistente é recusado, sem exibir o conteúdo de outro estabelecimento. O esquema Firestore e os índices permanecem os mesmos.

### Serviços analisados e situação

| Grupo / serviços | Situação local / evidência | Limite preservado |
| --- | --- | --- |
| Loja por configuração/host — `ambienteAplicacao`, `api`, `firebase`, `firebasePublico`, fachadas conta/admin/pedidos | Corrigido fallback; domínios/IDs explícitos; mapeamento de duas lojas e host desconhecido testados | Nova release exige mapa dos hosts autorizados; não altera o site publicado |
| Auth — `autenticacao`, `conta`, `acessoConta`, `firebase`, hooks de sessão | E-mail/senha, cadastro, conversão de anônimo, login/logout, troca/reset de senha e reutilização de UID testados; Google local com credencial sintética e popup/link/erros/duplicação em testes de interface | OAuth Google real/domínios/2FA/sessão pessoal são homologação posterior; Auth é do projeto, não de cada documento loja |
| Perfil/endereços — `perfil`, fachada `conta`, hook `useRecurso` | CRUD próprio, dados separados por caminho loja/UID, negação ao terceiro/admin de outra loja e resposta tardia/troca de sessão na regressão | Um cliente pode ter seus próprios perfis em mais de uma loja no mesmo projeto; isso não mistura perfis de terceiros |
| Catálogo público — `catalogo`, `projecaoPublica`, `LojaContext` | Mesmo ID com preço/nome/ingredientes/imagem próprios por loja, origem/projeção/revisão atualizadas e categorias ativas respeitadas | Catálogo público continua público intencionalmente; fontes comerciais reais da Demo não alteradas |
| Produtos/categorias — `adminCatalogo`, fachada `admin`, hooks de ação | Criação idempotente, edição, ativação/disponibilidade, remoção lógica, revisão e filtros; duplicação simultânea e payload divergente tratados | Exclusão física de categoriaB-03 continua bloqueada. Desativação local permitida pela candidata não significa liberação da flag/publicação em produção |
| Carrinho/checkout — `carrinhoSessao`, `compras`, `previaCompra`, `tentativaCheckout`, `Checkout` | IDs/loja/UID isolados; quantidade/observações/remoção/subtotal na regressão; preço, mínimo, método, disponibilidade e taxa da loja validados no fluxo SDK/Rules | Preço no cliente é prévia; Rules continuam autoridade. Não transferir pedido/carrinho de outra identidade ou loja |
| Pedido/numeração — `pedidos`, `pedidoIncremental`, fachada `pedidosConta`, `numeroPedido` | #1 por loja, #2/#3 concorrentes, idempotência, intenção recuperável, falha offline, histórico próprio e atualização observável | ID técnico usado em links/autoridade; rótulo comercial continua `numeroPedido`, sem renumerar históricos |
| Admin pedidos/financeiro — `adminPedidos`, `admin`, `useAdmin` | Busca/lista, status, pagamento manual, revisão e histórico protegidos; cliente observa mesma alteração; outro admin/cliente não escreve | Pagamento inicial pendente; confirmação manual não equivale a liquidação bancária/gateway |
| Dashboard/clientes/configurações — `adminGestao` | Agregações, recentes, lista de clientes e ajustes de WhatsApp/Instagram/endereço/horário/mínimo isolados; retorno de pedido inconsistente recusado | B-04 continua salvamento por dia/grupos com erro recuperável; sem atomicidade semanal nova |
| WhatsApp — `whatsappPedido`, finalização `pedidos` | Mensagem/URL usam nome/número/pedido/valor da loja autorizada; nenhuma mensagem enviada | Preparar link não confirma recebimento/pagamento |

### Desempenho e concorrência

Melhoria mensurada por contagem, sem prometer latência global: dois gates simultâneos da mesma instância/UID fazem um GET de autoridade; chamada posterior reconsulta o servidor e detecta revogação. Duas criações simultâneas com mesma intenção fazem uma criação e um avanço de revisão por loja, com o mesmo retorno confirmado. Dados divergentes não se juntam. Mapas em memória são descartados após sucesso/falha e não atravessam contextos de loja.

Catálogo conserva o agrupamento já existente de quatro consultas paralelas por lote e compartilhamento apenas de leitura em andamento por instância Firebase/loja. Não foram adicionados listeners, polling, persistência de DTO privado ou cache de permissão. Hooks existentes continuam descartando respostas antigas e bloqueando ações concorrentes conforme regressão.

### Arquivos e função

Criados:

- `frontend/src/lib/identificador.js`: predicado único de IDs.
- `frontend/src/services/autenticacao.js`: serviços Auth atuais reutilizáveis por dependências explícitas, com trava compartilhada por Auth.
- `quality/frontend/test/multiloja.test.js`: host/ID, sessão ausente e armazenamento por loja/UID.
- `quality/frontend/scripts/servicos-multiloja-emulator.mjs`: ensaio de duas lojas com os serviços da aplicação, usando os manifestos e provisionador da Etapa2.
- Este relatório e recibo integrado `docs/ADAPTACAO_SERVERLESS/ETAPA3_SERVICOS_EMULATOR.json`.

Modificados:

- `frontend/src/lib/ambienteAplicacao.js`: sem fallback e com exigência de domínio autorizado.
- `frontend/src/services/{catalogo,projecaoPublica,perfil,pedidos,pedidoIncremental,adminCatalogo,adminPedidos,adminGestao}.js`: IDs compartilhados;401 explícito quando cabível; coalescência de autoridade/criação e validação dos pedidos recentes no módulo correspondente.
- `frontend/src/services/conta.js`: fachada compatível da fábrica Auth/perfil; mesmos métodos exportados.
- `frontend/src/lib/{firebase,carrinhoSessao,tentativaCheckout}.js` e `frontend/src/pages/Checkout.jsx`: namespace de tentativa e limpeza só da loja atual, sem mudança no formato do pedido.
- `frontend/.env.example`: configuração explícita/documentação dos hosts; sem segredo.
- `frontend/package.json`, `quality/firebase/executar-provisionamento.cjs`: alias `firebase:emulator:servicos-multiloja` e opções de cenário/regressão reutilizando o harness da Etapa2; `provisionamento-emulator.mjs` permite recibo separado somente nessa regressão, e o comando original sem argumentos conserva seu comportamento.
- `quality/frontend/test/{ambientes,conta,seguranca,leiturasFirestore,catalogoSdk,demoPublica}.test.*` e `quality/frontend/vitest.config.mjs`: configurações de loja explícitas nos testes, sem mascarar fallback; mocks Auth refletem a mudança de sessão do SDK e popup pendente é encerrado no teste; teste da consulta de autoridade e revogação.
- Documentação de posição, plano, riscos, matriz, manual, índice/inventário e classificador atualizados, preservando entradas das Etapas1/2.

Nenhuma alteração nas Rules, índices, provedores/contas reais, Firebase real, IAM, dados comerciais, estilos/marca da Etapa1 ou implementação do provisionador/manifestos da Etapa2. O backend histórico continua arquivado; nenhum Express/Render/Functions reintroduzido.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

REP-3-H0: nenhuma intervenção indispensável para esta etapa local. Identidades/segredos de teste são fabricados dentro dos Emulators; nunca solicitar conta/senha/2FA pessoal. Tempo manual/espera humana0. Escolha Firebase por cliente versus compartilhado, custos/domínio/UID real e julgamento comercial continuam futuros atos específicos. Não solicitar painéis nem publicar nesta ordem.

## Validação, falhas e fechamento

Resultados finais efetivamente conferidos abaixo; limpeza restrita a temporários próprios registrada no fechamento. As provas das Ordens012/013 e Etapas1/2 conservam data/ambiente/limites e não são apresentadas como testes novos. Posição dos noveMVPs sem baixa automática.

Falhas corrigidas durante o bloco: mocks Auth anteriores não atualizavam `currentUser` ao criar/vincular conta; alinhados ao SDK antes de verificar o novo guarda. Um teste deixava popup eternamente pendente e passou a encerrá-lo; helper de teste restaurado após edição local. Fixtures externas/Demo readonly passaram a declarar mapa de hosts; a configuração real explícita da Demo é preservada. A corrida real de criações administrativas foi corrigida no serviço, sem relaxar Rules. Revisão automática inicialmente recusou o ensaio por não reconhecer autorização do anexo; após leitura com linhas/hash do pedido, reconheceu a autorização expressa atual e liberou o mesmo ensaio local. Sem necessidade de nova autorização humana nem desvio do bloqueio.

Limites para Etapa4: conferir segurança/Rules/índices efetivamente publicados somente sob autorização específica; realizar homologação final de fluxos e recuperação da release consolidada; decidir estratégia de projeto/contas por cliente; preparar hosts/OAuth/rollback; conservar B-03/B-04 e metadados dinâmicos até seus gates próprios. Uma autorização de Etapa4 não publica automaticamente a matriz. Nenhum início automático de Etapa4, commit, push ou deploy.

### Resultados efetivos da validação final

- `node quality/run.cjs frontend-test --maxWorkers=2`: **375/375 testes em34arquivos**,124,31s. Inclui Auth/UI, loja/host, identificação, cache, carrinho/observações/checkout, perfil/endereço, gate/admin/dashboard, erros/travas e regressões permanentes das etapas anteriores. Configuração de teste contém `VITE_LOJA_ID` explicitamente; runtime não ganhou fallback para passar testes.
- `node quality/firebase/executar-provisionamento.cjs --servicos`: **99/99 verificações** em60.640ms no script integrado, além da inicialização/encerramento dos Emulators. [Recibo](ADAPTACAO_SERVERLESS/ETAPA3_SERVICOS_EMULATOR.json), com projeto fictício, IDs das provas, hashes e zero operações reais. Categoria pôde ser desativada nas Rules locais candidatas; não se habilitou flag nem publicou Rules em produção.
- `node quality/firebase/executar-provisionamento.cjs --regressao-provisionamento`: **106/106 verificações**,21.358ms no script. [Recibo separado](ADAPTACAO_SERVERLESS/ETAPA3_PROVISIONAMENTO_REGRESSAO.json). A prova original `REPLICACAO_ETAPA2_EMULATOR.json` manteve sua gravação original de21:06:11 Brasília; nem os manifestos nem o provisionador foram substituídos.
- `npm --prefix frontend run build -- --outDir /tmp/catalogo-etapa3-validado`: aprovado em24,65s. Aviso existente de chunk>500kB preservado, sem arquitetura nova para esta etapa. Inspeção dos assets confirma ausência de bootstrap `Bearer owner`, projeto `demo-replicacao` e fixtures administrativas sintéticas.
- Sintaxe Node dos módulos/runner/scripts conferida. Scanner textual `node infra/scripts/verificar-segredos.cjs`: sem achados. `node quality/docs/documentacao.cjs --write` e `--check`: aprovados após incluir os recibos novos;1951documentos e links do núcleo válidos. Um check intermediário acusou inventário anterior à criação do segundo recibo; regenerado, sem perda de histórico.
- Hashes dos arquivos de Rules/índices são idênticos nos recibos originais da Etapa2, Etapa3 e regressão de provisionamento. Arquivos reais não foram publicados/modificados. O Emulator não verifica a existência dos índices compostos realmente publicados, que continuam gate da Etapa4.

As duas lojas foram provisionadas do zero com a ferramenta da Etapa2. AdminA/AdminB usaram credenciais Google sintéticas do Auth Emulator; clienteA converteu anônimo em e-mail/senha conservando UID, clienteB foi cadastrado e teve senha recuperada por código gerado localmente, sem imprimir esse código ou enviá-lo para serviço real. Um Google cliente local vinculou anônimo e refez login sem duplicar conta. Usuário sem login e anônimo foram incluídos nos negativos. Popup/erros de loginGoogle foram validados na regressão UI; credencial sintética não comprova OAuth real.

Pedidos simultâneos começaram em#1 por loja; IDs de produto iguais preservaram preços10,00/20,00. B permitiu PIX/entrega7,50; A não aceitou essas configurações por associação. A concorrência cliente/anônimo emA produziu#2/#3, B manteve sequência própria. Repetição/recuperação da intenção emB confirmou#2 sem consumir outro número. Dados de pedido gravado ficaram intactos após editar preços/ingredientes/imagens e remover logicamente produto. Pagamento manual/status deA tornaram-se visíveis ao cliente e não alteraramB; dashboard financeiro e listas de clientes ficaram separados. Leitura/escrita cruzada de perfis, endereços, pedidos e históricos foi negada pelos SDK/Rules. Nenhuma mensagemWhatsApp foi enviada.

### Preservação, limpeza e Git

Foram preservados arquivos históricos, backups privados, dependências, binários dos Emulators, testes/fontes reutilizáveis e builds anteriores necessários. Os novos arquivos de teste/recibos são permanentes, fora do bundle. Temporários exclusivamente próprios em `/tmp/etapa3-*` (scripts de edição/documentação e logs de ensaio) são removidos após registrar as provas; build atual `/tmp/catalogo-etapa3-validado` permanece disponível para revisão. Não existe exclusão importante pendente de aprovação. A validação após limpeza é registrada no adendo final.

Git raiz permanece sem commits e com o conteúdo não rastreado observado na entrada, mais os arquivos desta etapa. Nenhum stage/commit/push/deploy. `git diff --check` não cobre sozinho os arquivos não rastreados; complementado por revisão de fontes, sintaxe, scanner, testes, build e inventário. `.env`, backups privados e artefatos ignorados continuam preservados; sem reprodução de segredos. Guia consolidado local atualizado. Espelho externo `/home/lucas/Documentos/lojaDemoRestaurante/` ausente, sem recriação. Emulators criados pelo harness encerrados, sem tocar em instância pré-existente.

Tempo técnico dos comandos medidos acima; o bloco inteiro não teve cronômetro integral confiável desde a primeira leitura, portanto não apresentar uma estimativa como medição. Espera humana0; houve revisão automática local, distinta da execução. Nenhuma conclusão artificial por orçamento.

Próxima ação exata: **aguardar autorização para Etapa4 — validação final Firestore/Rules/isolamento e homologação da matriz consolidada**, aproveitando estes recibos com seus hashes/ambiente. Preparar atos reais separadamente quando autorizados; não iniciar Etapa4 nem publicar automaticamente.

Precisão da evidência de falhas: o ensaio desativa/reativa a rede da instância Web SDK para testar indisponibilidade real do cliente. A perda de resposta é simulada após commit, com recuperação da mesma intenção/idempotência e regressõesUI de resposta perdida; não foi feita interceptação física do transporte SDK nem qualquer teste de falha em produção.

Verificação após limpeza da Etapa3:61/61 testes em4arquivos aprovados em8,58s, cobrindo loja/host/cache/Auth/gates e revogação. Inventário/links e Git novamente conferidos; log pontual próprio removido após este registro. Sem limpeza importante pendente de aprovação.
