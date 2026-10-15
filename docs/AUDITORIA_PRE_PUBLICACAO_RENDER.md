# CATÁLOGOS — AUDITORIA FINAL ANTES DO RENDER

> Estado posterior — Ordem 06: modo de leitura restrita implementado localmente, catálogo ainda sem aprovação dos dados reais e sem deploy. Ver [RENDER_DEMO_SOMENTE_LEITURA.md](RENDER_DEMO_SOMENTE_LEITURA.md).

Ordem 05 — 15/10/2026, America/Sao_Paulo. Auditoria estática dos arquivos locais. **NO-GO para publicação completa com escrita.** Há caminho proposto de liberação inicial restrita a leitura, mas ainda não está implementado/validado ponta a ponta. Nenhum serviço externo foi consultado nesta ordem, inclusive documentação web, Firebase, GitHub ou Render. Não houve alteração de código, IAM, dados, credenciais, Rules/índices, commit, push ou deploy. Alterações desta ordem são documentação/evidências locais e os registros externos expressamente solicitados.

## 1. Estado do Git

Repositório interno Catalogo-Demo/Catalogo-demo; main em 19b554d, origin LucasTech-Dev/Catalogos. Oito commits à frente de origin/main **local**, sem fetch/consulta ao GitHub nesta rodada; não afirmar estado remoto atual. Commits pendentes em ordem cronológica: 2c06313 (implementação 19/20), 0b1ec3d (registros 19/20), c2a0cbf (21), 9122f01 (22), 77c8bb7 (23), 949f992 (24), 792b069 (25), 19b554d (Cloud Run).

Inventário completo e nominal: [status inicial](evidencias-ordem05/git-status-inicial.txt), [rastreados modificados](evidencias-ordem05/rastreados-modificados.txt), [novos arquivos](evidencias-ordem05/novos.txt), [commits](evidencias-ordem05/commits-pendentes.txt). Inclui diffs acumulados das etapas 19–26/R-025, ignores/CI/exemplos, preparo Cloud Run, Secret File, opt-in bancorestaurante, testes e documentação. Nenhuma alteração descartada ou estágio modificado. Não usar o Git externo vazio do workspace.

## 2. Arquitetura efetivamente implementada

Express 5/CommonJS, Node engines 24.x (.nvmrc 24.19.0), Admin SDK 14.5, React/Vite. server.js valida PORT/config antes do listen, escuta 0.0.0.0 e fecha HTTP/Firestore em SIGTERM. app.js inicializa Firebase, CORS/limites/JSON/validação e monta todos os routers, inclusive escrita. API é compartilhada por loja, não instância por restaurante.

Fluxo preparado: Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controllers → services → Admin SDK → Authentication/Firestore bancorestaurante → API → React. Publicação visual Cloudflare e existência dos dados são informações do proprietário/histórico; não houve comprovação remota nesta rodada. URL real Render inexistente nos artefatos disponíveis. Código local e testes históricos não comprovam a integração publicada.

## 3. Inventário das rotas

**43 contratos: 28 GET e 15 mutações (2 PUT, 4 POST, 3 DELETE, 6 PATCH).** Conferidos backend/src/validators/contratos.js com os routers, controllers e services. Inventário individual de todas as rotas, acesso, escrita, alvo e risco: [ROTAS.md](evidencias-ordem05/ROTAS.md); dados estruturados: [rotas.json](evidencias-ordem05/rotas.json).

Públicos: GET / (saúde) e GET /publico/lojas/:lojaId/catalogo. OPTIONS global atende preflight de origem permitida. Express pode atender HEAD pelos handlers GET, inclusive com leituras no banco; não é rota de escrita adicional. Demais contratos exigem token e, conforme operação, titularidade, role e loja. /publico/lojas/.../me não é anônimo sem token apesar do prefixo.

## 4. Rotas que executam escrita

| Contrato | Efeito persistente |
| --- | --- |
| PUT /publico/lojas/:lojaId/me | Merge de perfil em clientes/{uid} |
| POST /publico/lojas/:lojaId/me/enderecos | Cria endereço do próprio UID |
| PUT /publico/lojas/:lojaId/me/enderecos/:enderecoId | Sobrescreve endereço existente do próprio UID |
| DELETE /publico/lojas/:lojaId/me/enderecos/:enderecoId | Remove endereço próprio |
| POST /lojas/:lojaId/pedidos | Transação: pedido, registro idempotência quando fornecido e possível merge do cliente |
| PATCH /lojas/:lojaId/pedidos/:pedidoId/status | Atualiza status/data por transação |
| PATCH /lojas/:lojaId/pedidos/:pedidoId/pagamento | Atualiza pagamento/data por transação |
| PATCH /lojas/:lojaId/pagamentos | Atualiza configuração financeira da loja |
| PATCH /admin/lojas/:lojaId/loja | Atualiza configuração da loja por transação |
| POST /admin/lojas/:lojaId/produtos | Cria produto e atualiza data da categoria para serialização |
| PATCH /admin/lojas/:lojaId/produtos/:id | Atualiza produto e, conforme caso, data da categoria |
| DELETE /admin/lojas/:lojaId/produtos/:id | Desativa produto; é update, não exclusão física |
| POST /admin/lojas/:lojaId/categorias | Cria categoria |
| PATCH /admin/lojas/:lojaId/categorias/:id | Atualiza categoria; consulta produtos ao desativar |
| DELETE /admin/lojas/:lojaId/categorias/:id | Exclui categoria se não houver produto vinculado |

GET finalizacao/:chave somente recupera pedido; GET .../whatsapp lê e gera mensagem/URL, sem enviar WhatsApp ou gravar status. criarUsuario existe em usuarioService, mas não tem rota de escrita exposta neste inventário; não confundir helper com endpoint. Nenhuma chamada Auth createUser/deleteUser/setCustomUserClaims/revokeRefreshTokens/createCustomToken encontrada em backend/src. Scripts de provisionamento/teste não são runtime e não devem compartilhar sua identidade.

## 5. Segurança administrativa

authMiddleware verifica verifyIdToken(token,true), UID válido, documento usuarios/{uid}, ativo true e role cliente/admin. Sessão anônima não obtém administração. /admin exige role admin e loja correspondente antes do controller. Rotas legacy de alteração de status/pagamento/configuração também exigem admin. Usuário sem documento pode operar como cliente público, nunca admin.

SDK instalado confirma que checkRevoked chama getUser para verificar disabled/tokensValidAfterTime (firebase-admin/lib/auth/base-auth.js, verifyIdToken/verifyDecodedJWTNotRevokedOrDisabled). Não remover revogação para reduzir IAM. Datas/role/loja enviados pelo browser não substituem documento e token.

## 6. Isolamento multi-loja e exposição inicial

Middleware loja compara vínculo do usuário com parâmetro; ownershipMiddleware exige próprio cliente ou admin. Pedidos de cliente são filtrados por UID e leitura individual verifica titularidade; endereços ficam na árvore loja/cliente. Cliente público sem vínculo global pode visitar várias lojas, conforme contrato existente. Admin A não acessa administração B pelo middleware; evidência histórica inclui 403 sem mutação. Sem superadmin.

**Achado A05-01 — alto, exposição do catálogo:** loja-demo não é uma allowlist global do backend. O catálogo aceita qualquer :lojaId existente que não tenha ativo === false. Loja/categoria sem ativo também passam pelo comportamento legado; produto exige ativo === true, e um produto com categoria ausente não é barrado por ausência (somente categorias explicitamente inativas são excluídas). Isso não é bypass administrativo; é superfície pública mais ampla que a loja inicial. Fonte: services/publicoService.js:11–19. Antes de publicar, aprovar o conjunto publicável de todas as lojas alcançáveis ou adicionar restrição de exposição inicial no servidor, com testes, em tarefa específica. Mapa de hostname/CORS não limita acesso direto à API.

## 7. Firebase Admin SDK

Homologação exige projeto explícito e coincidente em GCLOUD_PROJECT/FIREBASE_EXPECTED_PROJECT_ID/FIREBASE_HOMOLOG_PROJECT_ID. bancorestaurante exige adicionalmente FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante, somente APP_ENV homologacao/NODE_ENV production e render-secret-file. Sem flag, divergência, Emulator, ADC por arquivo arbitrário ou produção comercial: configuração recusada antes do listen. Exceção de banco existente não admite managed/ADC pessoal. Fallback legado de development não é usado em homologação.

config/firebase.js chama inicializador validado; Auth e Firestore usam o mesmo app/projeto. cert recebe campos mínimos do JSON, sem token_uri arbitrário. Guardas verificam estrutura e identidade declarada, não provam remotamente IAM/revogação/validade do par chave/conta. Health sem leitura não é validação Firebase. Reutilização de app é recusada no modo secret; nenhum app prévio com identidade diferente deve ser aceito nesse fluxo.

## 8. Proposta IAM: necessário versus opcional

Identidade exclusiva proposta catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com; não criada/verificada. Separar provisionador, runtime de leitura, eventual runtime com escrita e usuários Firebase. IAM Google não é role admin do usuário da loja.

| Capacidade real | Necessidade na fase | Proposta a validar posteriormente |
| --- | --- | --- |
| Validar assinatura/audience/issuer do ID Token | Somente rotas autenticadas; certificados públicos/saída HTTPS | Não exige criar usuário nem conceder Token Creator para verificação normal |
| Conferir disabled/revogação via getUser | Obrigatória onde token é verificado, pois checkRevoked=true | firebaseauth.users.get em papel personalizado; não users.list/create/update/delete |
| Ler loja/produto/categoria por ID e listar consultas/agregações | Obrigatória para catálogo e demais leituras | roles/datastore.viewer como candidato para fase sem escrita; papel personalizado ainda mais restrito deve ser desenhado/validado |
| Criar pedidos, perfis, endereços, idempotência e cadastros de produto/categoria | Apenas fase de escrita aprovada | Permissões de documento create e leituras/transações necessárias; candidato amplo roles/datastore.user requer revisão |
| Alterar status/financeiro/configuração/produto/categoria | Apenas fase de escrita aprovada | Permissões de documento update e leituras/transações necessárias |
| Excluir endereço/categoria | Apenas se essas rotas forem liberadas | Permissão de documento delete; desativar produto exige update, não delete |
| Criar SA/papel/chave, alterar policies, publicar Rules/índices | Nunca runtime | Provisionador humano/automação separado e autorização específica |
| Criar/excluir usuários Auth, claims, custom tokens, revogar sessões | Não necessário ao backend/src atual | Não conceder por antecipação; operações Web de cadastro/login pertencem ao cliente Auth e têm outro risco |

roles/datastore.viewer/user são **propostas**, não confirmação das permissões atuais ou de suficiência no projeto. Para papel personalizado, mapear as RPCs do SDK a permissões de entidade get/list/create/update/delete e de banco/transação exigidas, confirmando suporte e escopo em consulta/autorização futura; não apresentar lista mínima exata como comprovada offline. Viewer pode permitir leitura ampla do banco, inclusive PII; não prova isolamento por documento/loja. Permissões efetivas são união de concessões diretas/herdadas/grupos: adicionar viewer não neutraliza Editor/datastore.user já concedido.

Não conceder Owner, Editor, Firebase Admin, Auth Admin ou Service Account Token Creator ao runtime por conveniência. A chave assina OAuth localmente; isso não exige atribuir permissões administrativas de provisionamento ou impersonação ao próprio serviço. Não conceder Storage/Functions/índices/export/import se não usados.

## 9. Estratégia Secret File e criação posterior

Loader existente lê somente /etc/secrets/firebase-homologacao.json, arquivo regular, 1–65536 bytes, leitura limitada, O_NOFOLLOW e O_NONBLOCK; valida type=service_account, project_id, client_email, private_key e private_key_id, fecha descritor e sanitiza falhas. Ignores excluem secret fixo, secrets/, ADC, PEM/keys e backups; Docker usa allowlist package/lock/src/Dockerfile. Não há JSON real nestes exemplos.

Procedimento posterior, não executado: aprovar SA/escopo; provisionador cria SA/papel e confere ausência de concessões amplas; aprovar geração de chave conforme política organizacional; gerar fora Git, upload privado diretamente no Render → Environment → Secret Files, nome firebase-homologacao.json; nunca enviar ao chat. Conferir email/ID e montagem regular real. Montagem por symlink final seria recusada; compatibilidade precisa ser comprovada, não relaxada às cegas.

A documentação Render anteriormente consultada registra arquivo em /etc/secrets e também raiz no runtime nativo, e que salvar secret pode disparar deploy. Sem consulta externa nesta ordem, esses comportamentos e disponibilidade Free precisam de confirmação posterior no painel. Não afirmar isolamento exclusivo em runtime: processo, dependências de build e operadores capazes de alterar deploy podem exfiltrar segredo. Revisar lock/scripts npm, limitar membros, não imprimir env/arquivo nem enviar contexto do serviço em artefatos.

Rotação posterior: substituir chave em janela aprovada, redeploy/testar apenas operações permitidas e revogar anterior; comprometimento exige revogação imediata/suspensão. Apagar Secret File não revoga chave no Google. Não gerar/baixar JSON ou mudar política organizacional nesta auditoria.

## 10. Firestore Rules locais

firebase/firestore.rules nega read/write para todo cliente SDK. Compatível com o modelo API-only local; Admin SDK ignora Rules e depende de IAM/API. Não prova estado publicado em bancorestaurante. Não alterar Rules para fazer Admin SDK funcionar. Checklist futuro: leitura da versão publicada sob aprovação, comparar conteúdo/hash e caminhos, confirmar ausência de exceções abertas; teste autorizado de negação com cliente apropriado sem dados privados ou escrita real indiscriminada. Usuários, clientes, endereços, pedidos e idempotência devem continuar sem acesso direto pelo Web SDK.

## 11. Consultas e índices

Manifesto local: sete índices COLLECTION, sem fieldOverrides. Nenhum foi publicado/verificado nesta ordem. Cruzamento com código:

| Consulta alcançável | Índice local / verificação pendente |
| --- | --- |
| GET pedidos admin com limite e status: pedidoController → adminService.listar | pedidos status ASC + criadoEm DESC; cursor lê documento e orderBy criadoEm desc |
| Dashboard count por status e período criadoEm | pedidos status ASC + criadoEm ASC |
| Dashboard sum(total) por período | pedidos criadoEm ASC + total ASC |
| Dashboard financeiro: pagamento.status == confirmado, status != cancelado, período e orderBy criadoEm/status | pedidos pagamento.status ASC + criadoEm ASC + status ASC; versão com total ASC para aggregate sum |
| Desativar categoria: produtos categoriaId == X e ativo == true | produtos categoriaId ASC + ativo ASC |
| Dashboard produtos ativos e explicitamente indisponíveis | produtos ativo ASC + disponivel ASC |
| Admin produtos filtrados por categoriaId, ordenados __name__; count categoriaId | Conferir índices de campo único e ordenação __name__ efetivos; não afirmar necessidade de novo composto sem erro/plano real |
| Cliente lista pedidos por clienteId; admin sem limite ordena criadoEm desc | Índice de campo único correspondente; não há orderBy composto com clienteId nessa consulta |
| Catálogo/listagens legacy de produtos/categorias/clientes/endereços | get da coleção inteira, sem filtros Firestore; filtro público acontece em memória |
| GET de documentos, cursor, recuperação idempotência e endereço legado | Acesso por documento; verificar tipos/IDs, não criar composto só para get |

**Achado A05-02 — médio, leituras não limitadas:** catálogo carrega todos produtos/categorias da loja antes de filtrar; listagens legacy de clientes/endereços/produtos/categorias e pedidos sem limite também podem retornar toda coleção autorizada. pedidos?status=... sem limite não entra no ramo paginado administrativo e o filtro não é aplicado nesse caminho; cursor também só é efetivo no ramo paginado. Fonte: controllers/pedidoController.js listarPedidosDaLoja; services/pedidoService.js listarPedidos. Não confundir parâmetro aceito com consulta efetivamente executada. Revisar UX/contrato/paginação em tarefa própria antes de crescimento/carga; não modificar nesta auditoria.

Checklist externo futuro: confirmar banco (default)/modo e localização existentes, exportar somente definição de índices/field overrides, comparar sete entradas e status READY, verificar single-field exemptions/direções, executar consultas específicas com autorização e dados mínimos, guardar somente resultado técnico sem PII. Agregações/inequalities exigem validação real/Explain aprovado; timestamps/total ausentes em legados podem excluir resultados. Emulator não comprova necessidade/suficiência, custo ou implantação de índice.

## 12. Dados candidatos a públicos

Revisão futura deve aprovar registros/valores concretos, não só nomes de campo. Não foram consultados dados reais. Escopo inicial proposto: somente lojas/loja-demo e suas categorias/produtos usados pelo catálogo, sem varrer outras lojas. Se não houver bloqueio de exposição de outras lojas, revisar também todo conjunto alcançável ou manter NO-GO.

| Dados/caminho | Campos candidatos e cuidado |
| --- | --- |
| lojas/loja-demo | nome, descricao, telefone/whatsapp comerciais, instagram, endereço comercial, horários, logo/imagem, corPrimaria, tempoMedio, pagamentos habilitados, entrega/retirada/taxa, pedidoMinimo |
| lojas/loja-demo/categorias | id, nome, descricao, icone, ordem, ativo; produtos se campo projetado existente |
| lojas/loja-demo/produtos | id, nome, descricao, categoriaId, preco, ativo, disponivel, imagem, ingredientes |

Projeções fazem allowlist/tipos, não remoção de PII embutida em texto. Telefone/endereço podem ser pessoais, descrição pode conter notas internas e URL pode conter token privado/tracker. URLs aceitam HTTP/HTTPS sem userinfo, não garantem ausência de query sensível; não visitar imagens/links reais nesta auditoria. Categorias/loja sem ativo explícito passam pelo comportamento legado; produto indisponível pode ser listado com flag disponivel=false, não é sinônimo de oculto. Dono precisa aprovar esses comportamentos e valores antes da exposição.

## 13. Dados privados e revisão limitada futura

usuarios/{uid}: email, role, ativo, lojaId, datas e identificação; clientes/{uid}: nome/telefone/email/anonimo; enderecos: residência e complementos; pedidos: titular, endereço snapshot, observações, itens/histórico, valores e status; pagamento: forma/status/valor e datas; idempotencia: hash/assinatura/vínculo de pedido; configurações/notas administrativas não pertencentes à projeção pública. Dados financeiros informativos não comprovam liquidação. Não expor no catálogo nem em logs.

Procedimento de revisão autorizado posteriormente: definir operador, caminhos e campos exatos, quantidade máxima e finalidade; ler primeiro somente projeção de loja-demo/categorias/produtos, sem usuarios/clientes/pedidos/endereços/idempotência; proprietário revisa valores na interface privada. Relatório registra aprovado/reprovado por categoria de campo/ID não sensível e ação proposta, sem copiar PII. Não executar GET de coleção inteira por conveniência. Auditoria privada adicional ou alteração de registro exige ordem própria; não corrigir dados durante revisão de leitura.

## 14. Configuração exata do Render preparada

| Campo | Configuração local/proposta |
| --- | --- |
| Serviço | catalogos-api-homolog |
| Repository/branch | LucasTech-Dev/Catalogos / main, após revisão e push autorizado |
| Runtime/Node | Node.js 24.x pelo engines; .nvmrc local 24.19.0; confirmar versão resolvida no build |
| Root Directory | backend, relativo ao Git interno |
| Build/Start | npm ci / npm start |
| Health | /; não testa Firebase |
| Instância | Free, uma instância, disponibilidade da conta não conferida |
| Auto Deploy | Off; não impede primeira publicação nem necessariamente salvar secret |
| Região | Virginia continua proposta; banco existente/região real não consultados |
| Porta/rede | PORT da plataforma; 0.0.0.0; HTTPS da plataforma a conferir |
| Secret | /etc/secrets/firebase-homologacao.json, sem conteúdo em Git/VITE_*/logs |

Variáveis lidas no modo proposto, modelo infra/render/bancorestaurante.backend.env.example:

```dotenv
APP_ENV=homologacao
NODE_ENV=production
GCLOUD_PROJECT=bancorestaurante
FIREBASE_EXPECTED_PROJECT_ID=bancorestaurante
FIREBASE_HOMOLOG_PROJECT_ID=bancorestaurante
FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante
FIREBASE_CREDENTIAL_MODE=render-secret-file
FIREBASE_SERVICE_ACCOUNT_EMAIL=catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com
CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev
RATE_LIMIT_MODE=enforce
HTTP_LOG_ENABLED=1
```

Email é sugestão ainda não provisionada. PORT injetada; GOOGLE_APPLICATION_CREDENTIALS/Emulator não definidos. Configuração de arquivos .env não é carregada automaticamente pelo start. Web usa modelo infra/render/bancorestaurante.web.env.example, mapa host→loja-demo, mesmos IDs/opt-in públicos e VITE_API_URL futura real, ainda sem URL Render. Nunca copiar Admin para VITE_. Estado atual do Cloudflare/Auth domains/fallback SPA não foi consultado.

Limites Free registrados em consultas anteriores: 750 h/workspace/mês, repouso 15 min e retomada em cerca de um minuto; banda/build/tráfego externo têm limites adicionais; uma instância, sem disco persistente/SSH. Não revalidados externamente nesta ordem. Confirmar painel/plano/condições antes do deploy; não prometer custo zero. Timeout Web atual 20 s pode expirar na retomada. Dados devem persistir no Firestore, nunca em filesystem efêmero.

## 15. Abuso e fase inicial somente leitura

Limiter por processo: catálogo 600/min por peer, checkout 120/min por peer e 20/min por UID; admin 600/min por peer e 180/min por UID; API geral 600/min peer e 120/min UID. Janela 60 s, mapa máximo 10 mil chaves, Retry-After no 429. Health e OPTIONS isentos. Peer vem de req.socket.remoteAddress; sem trust proxy ou confiança arbitrária em X-Forwarded-For. Proxy pode agrupar clientes; múltiplas identidades podem contornar quota por UID. CORS não protege contra clientes sem Origin. Idempotência impede duplicata de tentativa, não criação de novos pedidos por atacante.

**Achado A05-03 — alto para fase inicial: não existe modo somente leitura.** As 15 mutações continuam montadas. Usar conta de teste, esconder botões, CORS ou instruir só GET não bloqueia gravações de quem tiver token válido. Chave de serviço de escrita no processo torna mutações efetivamente possíveis.

Caminho recomendado, sujeito a implementação/aprovação posterior:

1. Fase mínima: somente GET/HEAD / e catálogo de loja-demo previamente aprovado, mais OPTIONS estritamente necessário; negar demais caminhos/métodos no próprio backend ou borda sem acesso direto que permita bypass. Preservar autenticação nas rotas que continuarem liberadas; não promover GET privado a público.
2. Identidade runtime exclusiva sem permissão efetiva de escrita Firestore (candidato viewer) e sem criação/alteração de usuário Auth; verificar IAM direto/herdado e que não exista outra credencial ampla. IAM de leitura protege contra mutações no banco mesmo se endpoint montado, mas isoladamente não limita exposição de PII por GET privado ou catálogo de outra loja.
3. Testar rejeição de todas as 15 mutações com zero alteração usando mocks/Emulator antes de publicar. Não testar POST real para “provar” que IAM nega sem autorização específica. Registrar métodos HEAD/OPTIONS, caminhos alternativos e acesso direto Render.
4. Não conectar ainda fluxos Web de sessão anônima/cadastro/checkout: Firebase Web signInAnonymously/link/cadastro pode criar/alterar contas Auth mesmo se a API só ler Firestore. Para catálogo público não é necessário token. Testes privados de token exigem identidade já aprovada e escopo próprio.
5. Autorizar separadamente expansão para leituras autenticadas de dados privados, depois escritas específicas e recuperação/backup/limites; não elevar tudo para datastore.user automaticamente.

É tecnicamente possível sem enfraquecer as verificações, mas **não está pronto para deploy como leitura restrita** nesta entrega de auditoria. Nenhum middleware/mecanismo de bloqueio foi implementado ou variável fictícia inventada para isso. Simplesmente escolher viewer no futuro limita escrita, mas requer comprovação de IAM e não resolve todos os gates acima.

## 16. Verificações ainda necessárias no Firebase real

Todas pendentes, sem consulta nesta ordem: identidade do projeto/banco (default)/região/plano, política efetiva IAM e disponibilidade de papel mínimo, credencial/rotação e montagem Render, versão Rules, índices READY e exemptions, consultas reais e custos, dados concretos publicáveis da loja-demo e das demais lojas se alcançáveis, vínculo/atividade dos admins usados nos testes, Authorized Domains/config Web, recuperação dos dados antes de liberar escrita. Separar consultas de metadados, revisão de catálogo e revisão de PII em autorizações limitadas. Não habilitar APIs/billing/índices para resolver erro de leitura automaticamente.

## 17. Arquivos a revisar e sequência de commits posterior

Listas completas nos três inventários Git; não usar git add . ou git add -A. Sequência proposta, sem commit executado:

1. Revisar os oito commits já existentes e segredos no histórico antes de decidir push. As três preparações têm alterações compartilhadas fora do HEAD; não presumir que GitHub já tenha código atual.
2. Checkpoint documental 26/R-025: README, docs de referência/modelo/manuais/arquitetura/plano/ressalvas e relatórios/evidências 26; separar notas históricas das notas novas por hunks. Workflow, infra/scripts/validar-documentacao.cjs e correções exemplos development/test têm origem anterior a esta ordem.
3. Suporte local de identidade: ambiente/firebase/server, loader novo, teste credencialHomologacao, ajuste mock e teste HTTP, .env.example e ignores; incluir modelos Render/gerenciado/Cloud Run coerentes. Esse checkpoint deve permanecer executável, sem parte dependente faltante.
4. Exceção banco existente e Web: hunks de FIREBASE_EXISTING_DEMO_PROJECT_ID e equivalente Web, testes positivos/negativos, modelos bancorestaurante backend/Web e testes infra. Como ambiente/teste já misturam ordens 03/04, usar seleção de hunks revisada; alternativa é um commit coeso de identidade+opt-in com descrição que identifique ambas origens, sem falsificar separação histórica.
5. Fixtures/script somente simulação e modelos históricos separados, se mantidos; sem importar no Firebase real. Documentar por que plano de projeto separado permanece histórico.
6. Relatórios 02–05 e evidências sanitizadas, GUIA_MESTRE/REGISTRO/ressalvas e notas de substituição de decisões, preservando o conjunto final coerente. Ordem 05 altera somente docs/evidências.
7. Conferir staged diff, lista de arquivos, scanner, links e testes locais pertinentes ao checkpoint; proprietário revisa cada commit e aprova push do conjunto. Só depois sincronizar a branch; nenhum comando de deploy no CI existente.

Ignores protegem .env privado, ADC, chaves, secret e backups. Scanner textual local em candidatos atuais sem achados; não prova histórico completo, segredos em imagens/binários ou ausência de PII em texto livre. Logs brutos Firebase/Emulator e documentos de senha externos não devem entrar. firebase-debug.log aberto no IDE fica fora do Git interno/ignorado conforme contexto; não foi lido/copied para o relatório. repomix não deve ser adicionado automaticamente: pacote agregado precisa revisão independente se for proposto. Não copiar documentação privada externa para o repositório. Nenhuma credencial foi exibida.

## 18. Bloqueadores e validações desta auditoria

Bloqueadores principais: leitura restrita ainda não implementada; catálogo não limitado à loja inicial; IAM/Secret File reais sem validação; Rules/índices publicados desconhecidos; dados reais não aprovados para publicidade; proxy/abuso e custo não demonstrados; revisão Git/push/publicação sem autorização. A05-02 de volume/filtro de listagem deve ser considerado antes de carga/admin. Comprometimento da identidade pode alcançar banco inteiro, pois Rules não limitam Admin SDK.

Verificações desta ordem: inspeção estática de contratos/routers/controllers/services/SDK instalado/guards/CI/ignores, geração de inventário (43/28/15), validação documental local (43 contratos) e diff --check; scanner textual local. Nenhuma suíte HTTP/Emulator/build/npm audit foi executada nesta rodada de leitura: não houve alteração de código e não foram acessados serviços externos. Evidências **históricas da Ordem 04**, não recontadas como execução nova: backend 335, React 81, infra cinco, build e Emulator 19–23 aprovados. Estado externo permanece desconhecido.

## 19. Ressalvas e documentação

Totais preservados: 25 IDs, 16 abertas e nove resolvidas localmente; R-025 conforme registro anterior. Achados A05 são referências desta auditoria, não novos IDs R nem mudança de total. R-001/R-002 integração/configuração, R-005 Rules/índices, R-006 identidade/IAM, R-007/R-023 abuso/proxy e R-012 custo permanecem pertinentes. R-010/R-013 hosting/dispositivos e demais itens não foram encerrados. Produção comercial permanece NO-GO.

Atualizados IMPLANTACAO_RENDER_HOMOLOGACAO, PREPARACAO_RENDER_BANCORESTAURANTE, RESSALVAS_E_PENDENCIAS_PRODUCAO, GUIA_MESTRE e REGISTRO_DE_TRABALHO com nota desta ordem. Fluxo externo ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO e guia consolidado recebem mesmo estado local e sequência sem escrita; histórico preservado. Nenhum documento registra identidade/projeto/Render comprovados sem evidência.

## 20. Plano ordenado para publicar e testar

1. Proprietário revisa esta auditoria e decide escopo inicial: recomendar health + catálogo de loja-demo aprovado, sem outras leituras privadas ou mutações.
2. Autorizar/implementar gate inicial e testes locais de negação/sem efeitos, preservando contratos do modo completo e validação de ambiente. Não foi implementado nesta ordem.
3. Autorizar consultas reais limitadas de metadados IAM/Rules/índices e de campos publicáveis específicos; corrigir pendências em ordens próprias, sem ampliar permissões ou publicar Rules automaticamente.
4. Aprovar SA exclusiva somente de leitura/escopo efetivo e procedimento de chave/rotação; criar identidade, conceder permissões e gerar secret apenas sob autorização específica.
5. Revisar/commitar conjunto coerente do Git e aprovar push. Conferir que branch remota terá exatamente versão validada, sem segredos.
6. Autorizar criação/configuração Render Free e exposição restrita; preparar gate e credencial ANTES do primeiro deploy, pois criar serviço/salvar secret pode publicar. Registrar URL real, commit, versão Node e configuração sem valores privados.
7. Smoke externo autorizado: health, CORS, catálogo aprovado e negação das rotas bloqueadas, sem testes de pedidos reais. Não inventar URL, não enviar tokens pelo chat/log. Verificar acesso direto sem bypass e observabilidade/custo/retomada.
8. Autorizar integração de catálogo Cloudflare (SPA/URL/CORS) e testar sem cadastro/sessões/escrita involuntária. Expandir autenticação/admin privado só após escopo de dados aprovado.
9. Escritas exigem ordem posterior, recuperação verificada e testes controlados específicos; não habilitar vendas ou WhatsApp real por causa da publicação de catálogo.

Aguardar revisão do proprietário. Nenhuma etapa externa executada.
