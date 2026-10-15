# CATÁLOGOS — PREPARAÇÃO DE HOSPEDAGEM NO RENDER

> Estado posterior — Ordem 06: modo de leitura restrita implementado localmente, catálogo ainda sem aprovação dos dados reais e sem deploy. Ver [RENDER_DEMO_SOMENTE_LEITURA.md](RENDER_DEMO_SOMENTE_LEITURA.md).

> Decisão posterior vigente: preparar bancorestaurante, sem projeto/banco novo. Roteiro anterior preservado como histórico; consultar [PREPARACAO_RENDER_BANCORESTAURANTE.md](PREPARACAO_RENDER_BANCORESTAURANTE.md).

> Histórico da Ordem 02. O suporte local ao Secret File foi implementado na Ordem 03; configuração e bloqueios externos atuais: [FIREBASE_HOMOLOGACAO_RENDER.md](FIREBASE_HOMOLOGACAO_RENDER.md).

Ordem 02 — 15/10/2026, America/Sao_Paulo. Preparação documental e validação local concluídas. **Publicação bloqueada por identidade Firebase e revisão de exposição/proxy.** Não há serviço criado ou URL de API. Produção comercial permanece NO-GO.

## 1. Status inicial do Git

O diretório /home/lucas/Projetos/Catalogos contém um Git externo vazio, sem commits/remotos. Não é o repositório a publicar. O repositório correto é Catalogo-Demo/Catalogo-demo, origin https://github.com/LucasTech-Dev/Catalogos.git, branch main, HEAD 19b554d. Consulta remota somente de leitura confirmou main em b8e2a4ba39ae233ad413b434d6ce5cbb42b15308, igual ao origin/main local: oito commits locais à frente, nenhum atrás. Nenhum fetch/push foi necessário. Evidências em [evidencias-render](evidencias-render/).

## 2. Alterações pendentes e proposta de commit

Preservadas todas as alterações anteriores. Etapas 19/20 têm implementação em 2c06313 e registro em 0b1ec3d; 21–25 estão nos commits posteriores. Cloud Run tem preparo em 19b554d. Etapa 26, correções documentais R-025 e outros ajustes ainda têm arquivos fora do commit. R-025 consta resolvida localmente, segundo registro anterior; esta rodada não comprova revogação/rotação.

Revisar separadamente para sincronização:

- Histórico: oito commits listados em commits-pendentes.txt, incluindo implementação 19–25 e preparo Cloud Run.
- Pendências anteriores: todos os caminhos em arquivos-modificados-iniciais.txt e arquivos-novos-iniciais.txt; incluem workflow, ignores, relatórios 19–26, manuais, arquitetura, evidências 26, exemplos locais e validador documental.
- Esta ordem: este relatório; acréscimos em ARQUITETURA_DEFINITIVA, MANUAL_IMPLANTACAO, GUIA_MESTRE, REGISTRO_DE_TRABALHO, RESSALVAS_E_PENDENCIAS_PRODUCAO; aviso histórico no roteiro Cloud Run; evidencias-render.

Não usar git add indiscriminado. Conferir staged diff e scanner antes de aprovar commit e push. .gitignore protege .env, ADC, chaves e backups privados; .dockerignore usa lista restrita package/lock/src/Dockerfile. Scanner textual sem achados, com limites inerentes à detecção por padrões. Nenhum documento privado externo copiado ao Git; arquivos de senhas não foram abertos. Nenhuma credencial adicionada.

## 3. Configuração concreta proposta do Render

| Campo | Valor |
| --- | --- |
| Repository | LucasTech-Dev/Catalogos |
| Name | catalogos-api-homolog |
| Branch | main, após revisão e push autorizado dos commits corretos |
| Root Directory | backend (relativo à raiz do Git interno, não ao workspace externo) |
| Runtime | Node |
| Node | 24.x, engines existente; máquina local 24.19.0 |
| Build Command | npm ci |
| Start Command | npm start |
| Instance Type | Free, elegibilidade/disponibilidade da conta a conferir |
| Instâncias | 1 |
| Health Check Path | / |
| Auto Deploy | Off |
| Região | Virginia proposta; confirmar no painel antes da criação |
| HTTPS | Fornecido pelo Render após criação; URL ainda inexistente |

A criação do Web Service inicia um deploy; Auto Deploy Off impede atualizações automáticas futuras, não neutraliza a primeira publicação. Não criar serviço antes da aprovação e resolução dos bloqueios. Root Directory segue [documentação monorepo](https://render.com/docs/monorepo-support); região segue [lista oficial](https://render.com/docs/regions); [Auto Deploy](https://render.com/docs/deploys).

## 4. Compatibilidade Node.js/Express

Express 5, Admin SDK 14.5, CommonJS, lockfile v3 existente; scripts start=node src/server.js, dev=node --watch src/server.js, test=node --test. Node engines 24.x e .nvmrc 24.19.0. Nenhuma incompatibilidade de HTTP comprovada nesta rodada: não houve alteração de lógica/código do backend. npm ci é compatível com package/lock existentes; instalação limpa no ambiente Render ainda não executada. Docker continua alternativa histórica, não necessário para o runtime Node proposto.

## 5. Porta

PORT validada como inteiro 1–65535; padrão local 3000. server.js escuta explicitamente em 0.0.0.0. No Render deixar PORT ser fornecida pela plataforma, sem fixar 3000/8080. SIGTERM já fecha HTTP/Firestore com limite de 10 segundos.

## 6. Health check

GET / responde 200 com mensagem genérica, sem leitura de banco. CORS exige origem autorizada se Origin estiver presente; health do Render sem Origin é aceito. Health prova processo HTTP, não autenticação Admin, IAM, índices ou disponibilidade Firestore. O app inicializa SDK e monta todas as rotas: não existe modo dedicado somente HTTP. Publicar o app inteiro com ID fictício não equivale a uma superfície limitada a health.

## 7. Credenciais Firebase — bloqueio

applicationDefault() não recebe automaticamente ADC do computador no Render. Guardas de homologação exigem projeto explícito, NODE_ENV production e rejeitam GOOGLE_APPLICATION_CREDENTIALS. Não definir development para contorná-los.

Preferência: projeto Firebase dedicado com dados fictícios e identidade de workload. [OIDC gerenciado Render](https://render.com/docs/oidc) exige workspace Pro ou superior e documenta AWS, Anthropic e OpenAI; integração Google/Free não foi comprovada. [WIF Google](https://docs.cloud.google.com/iam/docs/workload-identity-federation) exige fonte de identidade compatível, confiança e IAM. Não apresentar essa opção como pronta.

Alternativa após autorização específica: conta de serviço exclusiva de homologação com chave JSON em [Secret File Render](https://render.com/docs/configure-environment-variables), fora do Git e do Vite. O mecanismo existe, mas é incompatível com o guarda atual e requer revisão pontual antes de uso. Nenhum nome novo de variável foi introduzido. Não há configuração executável de credencial aprovada nesta ordem.

Permissões candidatas para revisão: roles/datastore.user no projeto dedicado e firebaseauth.users.get para verificação de revogação; confirmar suficiência com fixtures. Nunca Owner/Editor ou Firebase Admin por conveniência. Operador de provisionamento e identidade runtime separados. Chave persistente aumenta risco de exfiltração; restringir acesso ao painel/secret, inventariar ID/validade e responsável. Rotação proposta: criar nova chave aprovada, substituir secret, redeploy manual, testar acesso fictício, revogar chave antiga e confirmar revogação; em incidente revogar imediatamente e suspender operações. Não executar criação/IAM/rotação sem autorização. bancorestaurante permanece intocado.

## 8. Segurança da API

Públicos: GET /, OPTIONS permitido e GET /publico/lojas/:lojaId/catalogo. Catálogo pode consumir Firestore sem token. /usuarios/me e rotas de cliente exigem ID Token; verifyIdToken(token,true) verifica revogação. /admin/lojas/:lojaId exige usuário ativo, role admin e loja correspondente. Pedidos exigem cliente/admin com titularidade e escopo conforme contrato. Sessão anônima Firebase nunca concede administração. Controllers/services mantêm validação, cálculos do servidor, transações/idempotência e isolamento por loja. Referência completa: REFERENCIA_API.md (43 contratos).

Admin SDK ignora Rules Web. URL Render é pública e não recebe o IAM privado do Cloud Run. CORS não impede acesso por clientes fora do navegador. Nenhuma autorização para pedidos/admin reais ou WhatsApp foi recebida. JSON de erro e logs existentes evitam exceções brutas, body, token, IP e PII; logs têm grupo, status, duração e requestId.

## 9. Variáveis reais

| Variável | Valor proposto / pendência |
| --- | --- |
| APP_ENV | homologacao |
| NODE_ENV | production |
| GCLOUD_PROJECT | Pendente: ID real do novo projeto fictício aprovado; não usar placeholder em deploy |
| FIREBASE_EXPECTED_PROJECT_ID | Mesmo ID aprovado |
| CORS_ORIGINS | https://catalogo-demo-cz1.pages.dev |
| RATE_LIMIT_MODE | enforce |
| HTTP_LOG_ENABLED | 1 |
| PORT | Injetada pelo Render |

Não definir hosts Emulator ou credenciais pessoais. GOOGLE_APPLICATION_CREDENTIALS é lida/rejeitada pelo código externo atual: não configurá-la até mudança revisada e autorização. Todos os nomes acima já existem no código. Nenhum segredo em VITE_*. VITE_API_URL somente após URL real validada e atualização Cloudflare autorizada.

## 10. CORS

Lista exata HTTPS sem barra final. Testados origem permitida, origem negada 403 e OPTIONS 204. Header Authorization autorizado. Requisições sem Origin continuam possíveis; autenticação é independente. Não usar wildcard ou domínios de preview indiscriminados.

## 11. Rate limiting

Ativo por processo em memória, com limites por peer TCP e UID autenticado e resposta 429/Retry-After. Não confia em X-Forwarded-For; atrás do proxy Render visitantes podem compartilhar bucket e sofrer bloqueio coletivo. Instância única não resolve distribuição por cliente nem constitui teto financeiro. R-007/R-023 permanecem abertas. Antes de liberar dados: validar contrato do proxy, spoofing e agrupamento com tráfego autorizado, depois decidir proteção de borda/configuração restrita; não habilitar trust proxy=true arbitrariamente.

## 12. Testes executados

- Backend npm test: 325/325 aprovados.
- Frontend npm test: 79/79, sete arquivos aprovados.
- Frontend npm run build -- --outDir /tmp/catalogos-render-web-build: aprovado, 1.624 módulos; saída local não publicada.
- Infra node --test infra/test/*.test.cjs: 3/3 aprovados.
- Smoke HTTP com APP_ENV=homologacao, NODE_ENV=production e ID fictício: oito checks aprovados — health, CORS permitido/negado, usuário/admin/pedido sem token, 404 e OPTIONS. Não consultou banco nem verificou token válido externo.
- Scanner textual sem achados e validador documental (15 arquivos, 45 links, 43 contratos) aprovados; diff --check aprovado antes desta edição, repetido ao finalizar.
- Sandbox inicialmente limitou subprocessos e não forneceu contagem completa: suítes repetidas com execução local permitida; resultados acima são da repetição completa.
- Emulator não reexecutado: Java ausente no PATH. Não instalar nem usar projeto real como substituto. Firebase externo, instalação/build Render, autenticação externa válida, latência e proxy Render não validados.

Logs e script smoke em evidencias-render. Exemplos e fixtures locais não representam integração externa concluída.

## 13. Arquivos alterados

Somente documentação e evidências desta ordem; lista final em evidencias-render/git-status-final.txt inclui também mudanças preexistentes. Nenhum código de negócio alterado. Atualizações compartilhadas preservam os diffs anteriores para revisão conjunta.

## 14. Documentos externos atualizados

Em /home/lucas/Documentos/lojaDemoRestaurante/, oito documentos receberam a decisão atual em seção posterior, preservando o conteúdo anterior: ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt; DOCUMENTO_CONSOLIDADO_EscopoGeral_ProjetoCatalogoLoja.txt; ESCOPO DO CLIENTE.txt; EtapasDeProducao_BaseFixo.txt; GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt; INDICE_DOCUMENTACAO_ATUAL.md; MANUAL_PERSONALIZACAO_ATUAL.md; CHECKLIST_COMERCIAL_PILOTO.md. Snapshot codigoEestrutura.txt mantido histórico. Arquivos de credenciais não lidos/alterados. Cópias de preparo em /tmp, fora do Git.

## 15. Fluxo lógico e de dados atualizado

Navegador → Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controllers → services → Admin SDK → Firestore → resposta API → React. Fluxo previsto, ainda sem backend externo.

- Catálogo: hostname determina loja explícita no bundle, GET público valida escopo, seleciona campos e retorna catálogo.
- Checkout: React envia dados com token; servidor valida e calcula valores, verifica contexto da loja e usa idempotência/transação.
- Pedidos: consulta/alteração exige titularidade ou role administrativa segundo rota; nenhuma ordem real executada.
- Autenticação: SDK Web obtém token, API verifica assinatura/revogação e usuário ativo, resolve role e contexto.
- Administração: token → admin → mesma loja → validação → service/Firestore.
- Multi-loja: API compartilhada, parâmetros e autorização em cada escopo; mapa de hostname não substitui validação do servidor.
- Erros: respostas JSON seguras e correlação; frontend trata falhas/timeout. Retomada Free de cerca de um minuto pode exceder timeout atual de 20 segundos: validar UX antes de conectar o site.
- Dados: projeto de homologação separado, fixtures fictícias, Admin SDK somente no backend, credencial fora Git/Vite, IAM restrito.

Código local implementado não prova publicação. Frontend Cloudflare foi informado como publicado pelo proprietário; conteúdo/configuração real não auditados. Render e Firebase de homologação permanecem pendentes.

## 16. Commit/push

Nenhum commit, stage ou push realizado nesta ordem. main local continua em 19b554d. Solicitar revisão do conjunto acima antes de sincronizar GitHub. Não usar o Git externo vazio.

## 17. Deploy

Não executado. Bloqueios: projeto fictício não definido/provisionado; identidade Admin compatível não aprovada; política atual rejeita arquivo; validação proxy/abuso pendente; revisão Git e autorizações pendentes. Um modo isolado somente HTTP exigiria mudança específica que não carregasse SDK/rotas de dados; não foi adicionado por não ser incompatibilidade de HTTP comprovada.

## 18. URL real

Inexistente. Não foi fabricado domínio onrender.com. URL do frontend informado: https://catalogo-demo-cz1.pages.dev/.

## 19. Custos e limitações

Segundo [Render Free](https://render.com/docs/free) e [FAQ](https://render.com/docs/faq), consulta de 15/10/2026: 750 horas de instância gratuitas por workspace/mês; esgotamento suspende os serviços Free até renovação mensal. Inatividade de 15 minutos suspende processo; retomada aproximadamente um minuto. Sem disco persistente Free; arquivos locais não são armazenamento de negócio. Banda e minutos de build têm franquias próprias; excesso pode gerar cobrança ou suspensão conforme conta/meio de pagamento. Firebase/transferência/IAM externos têm custos separados. Plano Free não é recomendado pelo Render para produção. Elegibilidade/limites reais da conta não consultados. Não prometer fatura total zero. OIDC gerenciado exige workspace Pro, fora da premissa gratuita.

## 20. Próximas ações e autorização

Revisar e aprovar os arquivos/commits concretos antes do push. Escolher projeto separado fictício e autorizar expressamente seu provisionamento e IAM. Para a opção mais simples no Render, decidir autorização específica para conta de serviço exclusiva/chave restrita/Secret File e posterior mudança revisada do guarda, sem tocar bancorestaurante. Alternativa sem chave requer solução de identidade comprovada e eventual custo adicional. Nenhuma credencial deve ser enviada pelo chat.

Somente com identidade e controles validados: aprovar criação do Web Service Free, exposição pública e deploy manual; capturar URL/commit reais e testar health/CORS/autenticação/escopo com fixtures. Depois pedir aprovação própria para configurar VITE_API_URL, mapa de loja e Firebase fictício no Cloudflare e publicar frontend. Não executar pedidos reais, mensagens WhatsApp, mudanças de usuários/Rules/índices reais ou IAM existente.

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


## Primeira versão online com fixtures — 15/10/2026

Decisão vigente: publicar API Express com dados fictícios locais, sem conectar bancorestaurante. Novo modo explícito public-fixture-demo dispensa Firebase Admin/Auth/Firestore/ADC/Secret File e recusa configuração Firebase misturada. Preservados modos completos e demonstração Firebase. Health e catálogo fictício de loja-demo; privados, escrita e outras lojas bloqueados. React separado mantém início, cardápio, categorias, detalhe e carrinho em memória (até 20 por item, refresh esvazia), sem login, checkout, pedido, pagamento ou persistência. Sem fallback estático no React: dados vêm de GET à API.

Guia prático vigente: [publicar demonstração com fixtures](PUBLICAR_DEMO_FIXTURES.md). Backend344/React101/infra8, build homologação e integração React+Express em Chrome local aprovados. npm start iniciou sem SDK/Secret, health e catálogo200/admin-outra-loja404 e SIGTERM exit0. Nenhuma alteração Firebase/IAM/chave/produção Cloudflare. Proprietário escolheu criar Render pelo painel. Push da branch deploy/render-demo-readonly autorizado com condição de verificar previews; configuração Cloudflare não disponível nas conexões atuais, confirmação solicitada. URL Render ainda inexistente; não declarar implantação. Produção Cloudflare exige confirmação específica; preparar primeiro Preview. Ressalvas preservadas: 25 IDs, 16 abertas/nove resolvidas localmente; sem vendas comerciais.
