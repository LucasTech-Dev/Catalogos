# CATÁLOGOS — PREPARAÇÃO RENDER COM `bancorestaurante`

> Estado posterior — Ordem 06: modo de leitura restrita implementado localmente, catálogo ainda sem aprovação dos dados reais e sem deploy. Ver [RENDER_DEMO_SOMENTE_LEITURA.md](RENDER_DEMO_SOMENTE_LEITURA.md).

> Auditoria posterior: [AUDITORIA_PRE_PUBLICACAO_RENDER.md](AUDITORIA_PRE_PUBLICACAO_RENDER.md). Primeira publicação restrita a leitura ainda depende de gate e IAM efetivo; não há modo global somente leitura implementado.

Ordem de Implantação 04 — decisão vigente de 15/10/2026, America/Sao_Paulo. **Preparação local, sem publicação.** Substitui o roteiro anterior denominado Ordem 04 de criação de projeto vazio. Não criar catalogos-homolog-2026, outro banco, migração ou cópia de dados para esta primeira implantação. Cloud Run e Firebase separado permanecem alternativas históricas/futuras. Decisão atual: API Express compartilhada no Render, conectada posteriormente ao Firebase existente, com dados persistentes e loja inicial loja-demo.

## 1. Estado do Git

Git correto: Catalogo-Demo/Catalogo-demo, origin LucasTech-Dev/Catalogos, main em 19b554d. Oito commits à frente da referência remota local origin/main, sem atualização remota nesta rodada. Inventário do working tree em [evidencias-render-existente](evidencias-render-existente/). Mantidos diffs históricos 19–26/R-025/Cloud Run/Render e os novos arquivos ainda não rastreados; sem reset/clean/stage/commit/push. git diff --check executado antes das alterações e repetido ao finalizar.

Relatórios FIREBASE_HOMOLOGACAO_RENDER.md, IMPLANTACAO_RENDER_HOMOLOGACAO.md e ressalvas lidos; código efetivo de ambiente, identidade, servidor, CORS, token, autorização de loja, limiter, projeções, contratos de pedidos, Rules/índices e configuração frontend revisado. Não houve inspeção remota de dados, Rules, índices, Authorized Domains ou IAM de bancorestaurante.

## 2. Validação explícita de ambiente

A exceção não remove o guarda de projeto dedicado: adiciona uma autorização específica para o ID exato bancorestaurante, apenas em APP_ENV=homologacao, NODE_ENV=production e FIREBASE_CREDENTIAL_MODE=render-secret-file.

Exige simultaneamente GCLOUD_PROJECT = FIREBASE_EXPECTED_PROJECT_ID = FIREBASE_HOMOLOG_PROJECT_ID = FIREBASE_EXISTING_DEMO_PROJECT_ID = bancorestaurante. O quarto campo é o opt-in novo, lido somente na configuração do processo. Ausência, valor genérico como true ou ID diferente não autoriza o existente. Flag aplicada em outro ambiente, projeto ou modo managed é recusada. Produção comercial recusa bancorestaurante nesta configuração, inclusive sem flag; liberação comercial não foi implementada.

Continua exigindo conta de serviço explícita do mesmo projeto e JSON que corresponda exatamente ao projeto/email. Não há fallback de homologação para outro projeto, ADC pessoal ou Emulator. Não alterar APP_ENV para development para contornar requisitos: o comportamento local legado é preservado, mas NODE_ENV production exige ambiente externo explícito.

Configuração não concede IAM, não torna dados descartáveis e não autoriza deploy. É uma barreira contra erro operacional; quem controla código/env ainda controla o processo. Render não recebe ADC local automaticamente.

## 3. Alterações de código e configuração desta rodada

| Arquivo | Alteração |
| --- | --- |
| backend/src/config/ambiente.js | Opt-in exato para banco existente, restrito à demonstração/Secret File; recusa produção comercial |
| backend/test/credencialHomologacao.test.js | Caso novo de aceite/recusas e inicialização com SDK/arquivo simulados; sem rede ou chave real |
| demo/src/lib/ambienteAplicacao.js | Autorização explícita equivalente no Web, mantendo projeto esperado e host→loja |
| demo/test/ambientes.test.js | Caso novo positivo/negativo para projeto existente, modo, Emulator e hostname |
| infra/render/bancorestaurante.backend.env.example | Modelo backend vigente sem segredo |
| infra/render/bancorestaurante.web.env.example | Modelo Web vigente com placeholders públicos e loja-demo |
| infra/test/configuracoes.test.cjs | Modelo real validado localmente e recusa sem opt-in |

Loader credencialHomologacao.js, inicialização firebase.js, servidor, regras de pedidos, autenticação e autorização não foram modificados nesta rodada. As alterações anteriores nesses arquivos continuam no working tree e são identificadas no inventário. Não renomear ou apagar fixtures anteriores; elas são material de teste, não plano de importação do projeto existente. homologacao-dry-run continua recusando bancorestaurante e não escreve externamente.

## 4. Segurança preservada e superfície pública

| Superfície | Contrato local auditado |
| --- | --- |
| GET / | Health genérico do processo, sem dados/consulta Firebase |
| OPTIONS | Preflight da origem permitida; sem autenticação |
| GET /publico/lojas/:lojaId/catalogo | Público; projeções permitem somente campos próprios do catálogo/loja, incluindo contatos comerciais configurados |
| /usuarios/me e perfil/endereços de cliente | ID Token válido, revogação, identidade/titularidade e escopo conforme contrato |
| /admin/lojas/:lojaId/* | ID Token, usuário ativo, role admin e vínculo com a loja solicitada |
| Pedidos | Token, validação, titularidade/role, cálculo no servidor, transação/idempotência; status/financeiro administrativos |

verifyIdToken(token,true), recusa de conta inativa/role inválida e admin anônimo permanecem. Usuário público/cliente pode navegar lojas e tem dados por loja; isso não concede administração. Coleções e buscas de produto/categoria/pedido/endereço respeitam contexto. Mapa do frontend não substitui middleware. Testes existentes e caso explícito de admin B→A demonstram 403 sem mutação. Não há superadmin.

CORS restrito à origem HTTPS exata https://catalogo-demo-cz1.pages.dev, sem barra final/wildcard; não é autenticação e não impede scripts fora do navegador. Não há trust proxy habilitado; limiter usa peer TCP e UID, não header forjado. Atrás do proxy Render pode agrupar visitantes e bloquear coletivamente. Não foi inventada topologia ou habilitado trust proxy=true. R-007/R-023 seguem abertas até teste/solução de borda e abuso aprovados.

Proteção contra pedidos abusivos atual: token e revogação, escopo/titularidade, limite em memória por peer/UID, corpo 64 KiB, validação de IDs/quantidades/preços e idempotência. Contas anônimas e chaves novas não tornam requisições legítimas automaticamente: atacante pode criar identidades/tentativas e consumir Auth/Firestore; idempotência não é proteção distribuída contra abuso. Não foi adicionada permissão nem alterado contrato de checkout. Se publicar app completo com IAM de escrita, suas rotas válidas podem gravar no banco persistente. Aprovação de preparo não autoriza isso.

Arquivos locais firebase/firestore.rules negam todo acesso direto Web; sete índices estão preparados em firebase/firestore.indexes.json. Isso não comprova que o projeto atual tenha as mesmas Rules ou índices READY. Publicação/consulta operacional remota específica requer nova autorização. Admin SDK ignora Rules: [IAM Firestore](https://firebase.google.com/docs/firestore/security/iam). Projeções evitam campos internos arbitrários, mas dados existentes devem ser revisados pelo proprietário antes de catálogo público. Não prometemos ausência de conteúdo sensível dentro de campos comerciais livres sem auditoria autorizada.

Erros e logs preservados: JSON seguro, requestId/grupo/status/duração, sem body/token/senha/IP; falha de configuração antes do listen registra somente código genérico. Health não comprova IAM, índices ou conexão real Firebase.

## 5. Estratégia de credenciais e procedimento posterior

Recomendação: identidade exclusiva catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com, **nome sugerido, não criado nem verificado**. Email final precisa ser aprovado e igual ao configurado. Não reutilizar ADC pessoal ou identidade ampla por conveniência.

O [Secret File Render](https://render.com/docs/configure-environment-variables) mantém o material fora do Git; loader existente aceita somente /etc/secrets/firebase-homologacao.json, arquivo regular até 64 KiB, recusa symlink final, exige type service_account e projeto/email/chave/ID, passando campos mínimos ao cert do SDK. Falhas são sanitizadas. Arquivo ausente/mismatch impede startup; não há fallback managed nesse opt-in. Nome homologacao é convenção do arquivo, não implica que o banco seja isolado ou descartável.

OIDC gerenciado documentado pelo Render exige workspace Pro e não lista Google como integração pronta: [Render OIDC](https://render.com/docs/oidc). Não foi assumida federação Google gratuita.

Operações futuras, cada uma após aprovação específica:

1. Inventariar somente no projeto aprovado o estado efetivo IAM/Rules/índices/contas e plano; não listar/copiar dados indiscriminadamente. Confirmar necessidade de cada permissão e operadores autorizados.
2. Criar SA runtime dedicada separada do provisionador. Para API completa, candidato roles/datastore.user e papel Auth restrito com firebaseauth.users.get para revogação. Esses são candidatos a revisão, não mínimo comprovado no ambiente real. Não conceder Owner/Editor/Firebase Admin/Auth Admin. Se primeira liberação for somente leitura, avaliar papel de leitura específico, sabendo que rotas de escrita não funcionarão; modo somente leitura não foi implementado.
3. Aprovar nominalmente o alcance: permissões de documentos/Admin SDK podem atingir outros dados/lojas desse banco, não só loja-demo. Não afirmar que IAM de projeto isola restaurante. Revisar permissões herdadas e política organizacional antes de gerar chave; não remover política que proíba chaves.
4. Só após autorização de chave: operador gera JSON da SA específica em local privado fora Git e envia diretamente ao painel Render → Environment → Secret Files, nome firebase-homologacao.json. Não enviar segredo ao chat. Não executado.
5. Restringir membros com poder de alterar Environment/código/deploy, pois podem extrair o segredo pelo runtime. Arquivo é plaintext para o processo e dependências; não presumir que esteja isolado do build. Não usar cat/env/printenv nem incluir em artefatos. Ignores/allowlist Docker e scanner mantidos.
6. Salvar Secret File pode iniciar deploy mesmo com Auto Deploy Off; só fazê-lo em janela aprovada. Conferir montagem real (incluindo regularidade/sem symlink) e permissões, sem endpoint de diagnóstico nem log de conteúdo. Free sem shell não deve motivar divulgação do segredo.
7. Rotação: aprovar nova chave, substituir secret, redeploy/testar com operações autorizadas e revogar anterior. Em comprometimento revogar imediatamente e suspender operações. Apagar secret não revoga chave Google. Registrar somente ID/data/responsável, nunca valor.

Nenhum JSON real foi gerado, baixado ou lido nesta rodada. Não houve IAM real, conta de serviço real ou conexão a bancorestaurante.

## 6. Configuração Render vigente

| Campo | Valor proposto |
| --- | --- |
| Repository | LucasTech-Dev/Catalogos |
| Branch | main, somente após revisão/sincronização autorizada |
| Name | catalogos-api-homolog |
| Runtime / Node | Node.js / 24.x conforme engines existente |
| Root Directory | backend, relativo ao Git interno |
| Build / Start | npm ci / npm start |
| Instance Type | Free, disponibilidade/limites reais da conta a confirmar |
| Instâncias | Uma |
| Health Check Path | / |
| Auto Deploy | Off; criação/salvar secret ainda pode publicar |
| Região | Virginia continua proposta, não configurada; localização do banco existente não consultada/alterada |
| URL real da API | Ainda não fornecida; nenhum serviço criado por esta ordem |

Variáveis reais, modelo em [bancorestaurante.backend.env.example](../infra/render/bancorestaurante.backend.env.example):

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

Email é sugestão, não recurso existente confirmado. PORT é injetada pelo Render, escuta 0.0.0.0 já implementada. Não definir GOOGLE_APPLICATION_CREDENTIALS ou hosts Emulator. Exemplos não são aplicados automaticamente. Sem segredo VITE_*, .env rastreado ou upload de JSON ao Git.

Free continua com retomada lenta e limites de horas/banda/build; Firebase existente e tráfego têm quotas/custos separados, plano real não confirmado nesta rodada. Não prometer custo total zero nem elegibilidade comercial.

## 7. Cloudflare e fluxo de dados

Modelo [bancorestaurante.web.env.example](../infra/render/bancorestaurante.web.env.example) usa VITE_APP_ENV=homologacao; VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_EXPECTED_PROJECT_ID, VITE_FIREBASE_HOMOLOG_PROJECT_ID e VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID iguais a bancorestaurante; configuração Web pública do app existente a confirmar pelo proprietário. Nenhuma API key/appId real foi copiada. authDomain do exemplo deve ser conferido contra configuração real.

VITE_LOJAS_POR_HOST={"catalogo-demo-cz1.pages.dev":"loja-demo"}; host desconhecido falha. VITE_API_URL continua placeholder https://api.example.com, a substituir somente pela URL real Render validada. Authorized Domains do Auth deve incluir o host aprovado, estado atual não consultado. CORS backend é controle distinto. SPA exige fallback /* → /index.html 200, já preparado em infra/hosting/cloudflare-redirects.example; não foi publicado nem comprovado no site remoto. Build comum não deve ser confundido com publicação: build:externo valida a configuração externa antes de Vite, e fallback precisa estar no artefato/hosting aprovado.

Fluxo preparado: Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controllers → services → Admin SDK → Firebase bancorestaurante (Auth/Firestore) → resposta API → React. API compartilhada, não uma por loja.

Catálogo usa projeções por loja; Auth Web obtém sessão/ID Token, API verifica revogação e usuário; admin exige role/atividade/vínculo; carrinho/checkout conserva sessão e chave idempotente, servidor recalcula e persiste pedido, link WhatsApp é gerado sob autorização. Sessões existentes desse mesmo projeto continuam tendo significado real: não usar contas existentes para teste sem autorização. Não enviar WhatsApp, criar pedidos ou alterar usuário real. Timeout Web 20 s pode expirar na retomada Free de cerca de um minuto; validar UX e recuperação sem duplicação antes da integração pública.

Situação: código/guardas preparados localmente; frontend visual publicado segundo proprietário, configuração real não auditada; Firebase existente informado pelo proprietário/histórico, sem nova auditoria; Render/conexão Admin/URL/API pública não implantados ou comprovados nesta ordem.

## 8. Testes executados

Linha de base backend antes da alteração: 334/334. Resultados finais: backend **335/335**, React **81/81** em sete arquivos, infraestrutura **5/5**, build aprovado com 1.624 módulos e Emulator 19–23 concluído com **exit 0**; evidências em evidencias-render-existente/resumo.json. Novos testes usam exclusivamente SDK/filesystem simulados com material fictício; nenhum token válido do projeto real ou credencial real foi usado. Casos positivos: opt-in exato com configuração completa e conta esperada; negativos: sem opt-in, valor errado, modo managed, produção/desenvolvimento, projeto ausente/divergente, conta errada, ADC, Emulator, CORS/limiter inválidos, host não mapeado e reaproveitamento da flag em outro projeto.

Regressão backend inclui HTTP, identidade, startup, logs, roles, revogação, titularidade, idempotência e isolamento A/B sem mutação. Frontend inclui sessões/checkout/admin/ambiente e build isolado em /tmp/catalogos-existing-build. Infra inclui exemplo vigente e Rules/índices/ignores locais. Emulator: suíte etapa23 (inclui 19–23), projeto demo-catalogos-emulator e Auth/Firestore locais, Java/JAR temporários já existentes; resultado final nas evidências. Logs brutos podem conter tokens locais e não são distribuídos ao Git; entregar apenas resumo sanitizado. Sem escrita no Firestore real ou testes destrutivos.

## 9. Riscos e critérios antes da publicação

Banco existente contém dados persistentes; reaproveitamento deixa de oferecer separação por projeto entre demonstração e os dados anteriores. Nenhuma migração/cópia ou limpeza foi feita. Erro de aplicação, credencial roubada, rota pública abusada ou operador autorizado indevidamente pode afetar dados do mesmo banco. Alias homologacao não remove esse risco.

Antes de criar o Web Service ou adicionar secret: revisar Git/staged e autorizar push; conferir identidade/IAM efetivos, política de rotação, dados publicáveis de loja-demo, Rules publicadas, sete índices necessários READY e queries, recuperação dos dados e alcance permitido de escrita; resolver/aceitar explicitamente abuso/proxy, custos e risco da exposição pública. Não encerrar gate por passar unit test ou health. Publicar todas as rotas com escrita habilitada exige autorização específica para operar no banco existente, além do preparo local.

## 10. Ressalvas relacionadas

Mantidos 25 IDs: 16 abertas e nove resolvidas localmente; R-025 conforme registro anterior. R-001/R-002 de configuração/integração, R-005 de Rules/índices reais, R-006 de identidade/IAM, R-007/R-023 de abuso/proxy/distribuição, R-010/R-013 de hosting/dispositivos e R-012 de custos continuam pendentes conforme registros. Java temporário não encerra R-011. Decisão de reaproveitar banco não encerra ressalvas por documentação; riscos anteriores de isolamento de ambiente agora têm aceitação/escopo a revisar antes de publicar. Nenhuma aprovação comercial.

## 11. Documentação atualizada

Este relatório e notas vigentes em IMPLANTACAO_RENDER_HOMOLOGACAO, FIREBASE_HOMOLOGACAO_RENDER, ARQUITETURA_DEFINITIVA, MANUAL_IMPLANTACAO, GUIA_MESTRE, REGISTRO_DE_TRABALHO e RESSALVAS_E_PENDENCIAS_PRODUCAO. Roteiro ORDEM_04_CRIACAO_PROJETO_FIREBASE recebe aviso de substituição; não executá-lo para criar projeto.

Oito documentos externos em /home/lucas/Documentos/lojaDemoRestaurante recebem decisão atual preservando seções: ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt, GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt, DOCUMENTO_CONSOLIDADO_EscopoGeral_ProjetoCatalogoLoja.txt, ESCOPO DO CLIENTE.txt, EtapasDeProducao_BaseFixo.txt, INDICE_DOCUMENTACAO_ATUAL.md, MANUAL_PERSONALIZACAO_ATUAL.md e CHECKLIST_COMERCIAL_PILOTO.md. Não alterar documentos privados de senhas ou snapshot histórico; não mudar preços/planos comerciais.

## 12. Próximas operações que exigem aprovação

Revisão do diff desta ordem e mudanças históricas; consulta operacional real específica quando necessária; criar identidade exclusiva e configurar IAM; gerar/manusear chave e adicionar Secret File; qualquer publicação de Rules/índices ou alteração de dados/usuários/pedidos; push; criação/deploy do Web Service e exposição pública; integração/build/publicação Cloudflare. Cada ação precisa de autorização no escopo e ordem correspondentes. Não criar projeto/banco novo. Nenhuma operação dessas executada nesta rodada.

Próxima ação recomendada: revisão do código/configuração, depois ordem específica de identidade/IAM no projeto existente com alcance e operadores definidos; revisão de exposição/recuperação antes de chave/deploy. Aguardar proprietário, sem avançar automaticamente.

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
