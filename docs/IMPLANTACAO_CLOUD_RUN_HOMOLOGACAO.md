# Cloud Run — Ordem de Implantação 01

14/10/2026, America/Sao_Paulo. **Preparação local concluída; implantação NÃO executada.** Nenhum recurso externo criado, API habilitada, faturamento associado, IAM modificado, imagem enviada ou serviço exposto. Produção comercial permanece NO-GO. Esta ordem não encerra ressalvas de implantação por documentação.

## Estado inicial e evidências de ambiente

Branch `main`, HEAD inicial `792b069` (checkpoint 25). Havia alterações acumuladas das Etapas 19–26 e R-025, além de documentos não rastreados; índice vazio. Foram examinados status/diff, relatórios 25/26, ressalvas, manuais, Dockerfile, configuração e rotas. Alterações anteriores preservadas; sem reset/clean ou inclusão indiscriminada.

Consultas Google Cloud somente de leitura: oito projetos acessíveis, nenhum identificado como homologação dedicada do Catálogos. A Firebase CLI confirmou seis projetos Firebase acessíveis, também sem identificação de ambiente dedicado para esta ordem. O projeto ativo da CLI é `bancorestaurante`, que **não foi selecionado para o deploy**. `gcloud billing accounts list` retornou lista vazia para a identidade atual; a consulta a `bancorestaurante` retornou `billingEnabled=false`. Isso não prova inexistência de contas sob outras identidades. O comando estável `gcloud firebase projects list` não está disponível nessa instalação; a consulta complementar foi feita com `firebase projects:list`. Não foram instalados componentes da CLI nem ativados serviços para contornar a limitação.

Projeto de hospedagem: **a definir e aprovar**, separado do existente. Sugestão de ID `catalogos-homologacao-<sufixo-unico>` (disponibilidade não verificada). Região sugerida `us-central1` para a homologação pequena, com Firestore regional na mesma região após aprovação; favorece tarifa de referência Tier 1 e evita tráfego inter-regional entre API e banco. Latência do Brasil será maior que São Paulo. `southamerica-east1` é alternativa a cotar se latência/residência forem requisitos. A localização do banco exige decisão antes da criação. Não consultar dados dos demais projetos nem reaproveitá-los por semelhança de nome.

Serviço sugerido `catalogos-api-homolog`. URL, revisão e commit implantados: **inexistentes**. Nenhuma conexão com Firebase externo de homologação foi comprovada.

## Recursos propostos, sujeitos à aprovação

1. Projeto Google Cloud dedicado, registro como projeto Firebase e associação a uma conta de faturamento escolhida pelo proprietário.
2. Firestore Native regional, Authentication e app Web de teste, somente com fixtures fictícias aprovadas. Criação de usuários/lojas/produtos/pedidos externos requer autorização específica; não reutilizar a conta R-025.
3. Repositório Docker `catalogos-homolog` no Artifact Registry, na região aprovada; política de retenção proposta de três imagens, preservando os digests necessários a rollback.
4. Service account runtime `catalogos-api-homolog@PROJETO_APROVADO.iam.gserviceaccount.com`, sem chave JSON; operador/build separados do runtime.
5. Cloud Run privado, 1 vCPU, 512 MiB, concorrência 10, timeout 30 s, min 0, max 1, cobrança por requisição, porta 8080, startup TCP padrão. A capacidade é proposta para testes, não dimensionamento comercial.
6. Orçamento proposto de USD 5/mês, alertas 50/80/100% e previsão de 100%; confirmar moeda da conta e destinatários. Alertas comuns não são teto de gastos. Não foram criados orçamento nem alertas.

APIs a verificar/habilitar somente com aprovação: `run.googleapis.com`, `artifactregistry.googleapis.com`, `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, `firebase.googleapis.com` e serviços de suporte requeridos pelo projeto. `cloudbuild.googleapis.com` e staging Cloud Storage somente se o build remoto for aprovado; caminho preferencial inicial usa o Docker local e upload explícito. Quotas Run/Firestore/Auth/Registry, limites organizacionais e permissões efetivas permanecem não confirmados, pois o projeto alvo não foi definido. Nenhum `services enable` foi executado.

## IAM proposto e limites

Runtime: `roles/datastore.user` apenas no projeto/banco de homologação para leituras, consultas, agregações e transações necessárias; papel personalizado de Auth com `firebaseauth.users.get` para a verificação de usuário/revogação feita por `verifyIdToken(token, true)`. Validar suporte e suficiência com testes no projeto aprovado. `roles/firebaseauth.viewer` é alternativa de leitura mais ampla para discussão, não concessão automática. Não atribuir Owner, Editor, Firebase Admin ou Auth Admin ao runtime.

O Admin SDK ignora as Rules Web: isolamento por loja vem dos middlewares/services, e o papel de banco não isola documentos por restaurante. Isso torna obrigatórios projeto separado e regressões multi-loja. Rules deny-all do cliente e índices devem ser revisados no projeto novo; nenhuma publicação está autorizada nesta fase.

Operador: permissões para deploy Cloud Run (candidato `roles/run.developer`), `iam.serviceAccounts.actAs` apenas na identidade runtime e escrita no repositório de imagens (`roles/artifactregistry.writer` no repositório). Provisionador distinto precisa de permissões específicas de criação de projetos, associação de billing, Service Usage, criação de SA/papéis/banco/orçamento; todas exigem aprovação nominal e escopo. Invocadores de teste: `roles/run.invoker` somente para operadores aprovados. Nenhuma alteração de IAM foi executada. Documentação oficial: [identidade de serviço](https://docs.cloud.google.com/run/docs/configuring/services/service-identity), [permissões Auth](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaseauth), [IAM Firestore](https://docs.cloud.google.com/firestore/native/docs/security/iam).

## Auditoria do backend e exposição

Node 24.19.0, Express 5, Firebase Admin SDK 14.5.0 e locks existentes. Dockerfile preservado: base por digest, `npm ci --omit=dev --ignore-scripts`, apenas package/lock/src, usuário `node`. Ajuste necessário em `backend/src/server.js`: endereço explícito `0.0.0.0`; PORT continua validada antes da inicialização. SIGTERM fecha HTTP e cliente Firestore, com limite de 10 s. [Contrato Cloud Run](https://docs.cloud.google.com/run/docs/container-contract).

Firebase usa `applicationDefault()`; no Cloud Run recebe a identidade gerenciada via plataforma. Não copiar ADC, JSON privado ou diretórios do usuário; não montar credenciais na imagem. Homologação exige `NODE_ENV=production`, projetos explícitos iguais, CORS HTTPS, logs/limites habilitados e ausência de Emulator/chave JSON. Inicializar o SDK e responder health não comprovam permissão nem conectividade com o banco.

| Superfície | Proteção de aplicação auditada |
| --- | --- |
| `GET /` | Health do processo, sem consulta Firebase |
| `GET /publico/lojas/:lojaId/catalogo` | Público no Express; projeções e contexto da loja; pode consumir leituras Firestore |
| `OPTIONS` | Preflight sem autenticação no Express; apenas origem configurada |
| `/usuarios/me`, perfil/endereços públicos autenticados | Firebase ID Token válido, titularidade/contexto da loja |
| Pedidos, clientes, categorias, produtos e loja | Token, validação e guardas conforme contrato; operações administrativas exigem role/loja; pedidos de cliente limitados ao titular |
| `/admin/lojas/:lojaId/*` | Token com checagem de revogação, documento usuário ativo, role admin e loja correspondente |

Firebase anônimo é identidade de cliente, nunca administrador. Controllers/services preservam cálculo no servidor, transações/idempotência e isolamento. CORS é controle de navegador, não autenticação. Requisições sem Origin podem alcançar rotas públicas se a borda for aberta. Limiter em memória por processo usa o peer do socket, sem confiar em X-Forwarded-For; proxies Cloud Run podem agrupar clientes e causar bloqueio coletivo. Não mudar `trust proxy` automaticamente. R-007/R-023 continuam abertas; max 1 não é teto financeiro nem resolve rate limiting distribuído.

Primeiro deploy proposto: **IAM privado**, sem `allUsers`, sem desabilitar a verificação IAM. Ingress por URL HTTPS pode ser alcançável na internet, mas invocações exigem operador autorizado. Testar com token IAM do operador capturado só em memória e `X-Serverless-Authorization`, mantendo `Authorization` para o ID Token Firebase quando testes autenticados forem aprovados. Não imprimir tokens nem passá-los em argumentos de processo. [Autenticação Cloud Run](https://docs.cloud.google.com/run/docs/authenticating/overview), [duas camadas de autenticação](https://docs.cloud.google.com/run/docs/authenticating/service-to-service).

O React estático não consegue consumir diretamente um serviço IAM privado com apenas o token Firebase atual; o preflight também pode ser recusado pela borda. Fase de navegador exige escolher/aprovar gateway ou acesso protegido compatível, ou autorizar separadamente exposição da API após revisar as rotas públicas, abuso e custos. Não conceder `allUsers` para resolver um erro de CORS. A prévia React e a API privada são etapas distintas.

## Variáveis reais e frontend

Modelo backend: [homologacao.env.yaml.example](../infra/cloud-run/homologacao.env.yaml.example). Substituir os placeholders somente por valores aprovados, sem credenciais.

| Nome backend | Valor/proveniência |
| --- | --- |
| `APP_ENV` | `homologacao` |
| `NODE_ENV` | `production` |
| `GCLOUD_PROJECT` | ID do projeto dedicado aprovado |
| `FIREBASE_EXPECTED_PROJECT_ID` | Mesmo ID, conferido contra recurso real |
| `CORS_ORIGINS` | Lista exata de origens HTTPS de prévia autorizadas, sem wildcard |
| `RATE_LIMIT_MODE` | `enforce` |
| `HTTP_LOG_ENABLED` | `1` |
| `PORT` | Fornecida pelo Cloud Run, containerPort 8080 |

Não definir `GOOGLE_APPLICATION_CREDENTIALS`, `FIREBASE_AUTH_EMULATOR_HOST` ou `FIRESTORE_EMULATOR_HOST` no serviço.

Web já implementa `VITE_API_URL` em `demo/src/lib/ambienteAplicacao.js`/`demo/src/services/api.js`; HTTPS externo, timeout 20 s, erros seguros, ID Token, retry restrito a leitura/checkout idempotente e tratamento de mudança de UID. Usar [exemplo Web homologação](../infra/ambientes/homologacao.web.env.example): `VITE_APP_ENV`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_EXPECTED_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_APP_ID`, `VITE_API_URL` e `VITE_LOJAS_POR_HOST` (ou `VITE_LOJA_ID`). Esses campos são configuração pública de app Web, nunca chave Admin. Valores atuais do exemplo são fictícios, não artefato publicável.

O mapa hostname→loja **está implementado no código**, por lista explícita no bundle, com falha para hostname desconhecido; não cria lojas/domínios nem prova configuração do site publicado. `VITE_LOJA_ID` é alternativa de loja única. O backend valida escopo independentemente do mapa. SPA usa pathname, exigindo fallback do hosting. Não alterar o site `https://catalogo-demo-cz1.pages.dev/`, seu CORS ou configuração Firebase atual. Prévia futura precisa origem, projeto/app, dados fictícios, domínio Auth e forma de acesso aprovados.

## Testes desta rodada

| Verificação | Evidência |
| --- | --- |
| Backend após ajuste | 325/325 em 9 arquivos; inclui testes HTTP com SDK fake, ambiente, autorização e limiter |
| React | 79/79 em 7 arquivos |
| Infra | 3/3; contexto Docker, configuração e scanner sintético |
| Build React | 1.624 módulos, saída isolada em `/tmp/cloudrun01-web-build`; dist rastreado preservado |
| Docker build | Aprovado localmente; instalação reproduzível do Dockerfile existente |
| Docker runtime sem rede externa | 8 checks: health 200, CORS permitido 200/negado 403, admin e usuário sem token 401, pedido sem token 401, inexistente 404, OPTIONS permitido 204 |
| Imagem | UID 1000, 61 arquivos de aplicação fora node_modules limitados a src/package/lock; sem ADC local ou documentos privados no contexto |
| Shutdown/logs | SIGTERM exit 0; logs HTTP com evento/requestId/grupo/status/duracaoMs |
| Scan/documentação | Scanner existente sem achados; validador documental e diff --check aprovados |

Digest local da imagem de preparação: `sha256:a687139933b719ace387c3932a055e4d3a0e57936a582f69b86f8f089af32c02`. Tag local `catalogos-api:homolog-preparacao`; não enviada a registro remoto. O digest a implantar deve ser capturado novamente no Registry após upload aprovado. Evidências de logs desta execução estão em `/tmp/cloudrun01-*.log`; temporárias e não são requisito do runtime.

Firebase externo não testado nem alterado. Regressão Emulator não reexecutada nesta rodada: Java não está disponível no PATH; preservar R-011 e evidências históricas 25/26 como históricas, sem recontá-las. Os testes unitários usam fixtures/mocks. O teste Docker usa projeto fictício e rede externa desabilitada; não comprova IAM, consultas reais ou índices. Depois de aprovar/provisionar o ambiente, executar checks privados de health, CORS e 401, depois conectividade/queries e escopo A/B somente com fixtures e identidades aprovadas. Não usar conta R-025, mensagens WhatsApp ou carga paga. Não construir um diagnóstico público de banco.

## Custos potenciais e premissas — consulta oficial 14/10/2026

Referência USD/us-central1, sem câmbio/impostos/descontos contratuais. Modelo proposto por requisição: 10.000 requisições/mês, 10.000 s faturáveis totais sem sobreposição, 1 vCPU e 0,5 GiB. Run bruto aproximado: CPU USD 0,24 + RAM USD 0,0125 + requisições USD 0,004 = **USD 0,2565/mês**, antes das franquias. Partidas/encerramentos e duração real podem ampliar o tempo. Franquias de referência: 180.000 vCPU-s, 360.000 GiB-s e 2 milhões de requisições por mês, compartilhadas pela conta de faturamento; disponibilidade não confirmada. Não prometer custo zero. [Tarifas Cloud Run](https://cloud.google.com/run/pricing).

Build local evita cobrança Cloud Build, mas consome a máquina/rede do operador. Alternativa remota: 20 builds de 10 minutos em e2-standard-2 a USD 0,006/min = **USD 1,20 bruto**; franquia promocional de 2.500 minutos/mês por conta para essa máquina/default pool, sujeita a elegibilidade e mudanças. Cloud Storage de staging e transferência são adicionais. [Cloud Build](https://cloud.google.com/build/pricing).

Registry: exemplo de 0,8 GiB-mês armazenado, franquia de 0,5 GiB por conta, restante a aproximadamente USD 0,10/GiB-mês (730 h), resulta em cerca de **USD 0,03/mês** com a franquia disponível. Tamanho comprimido e retenção reais serão medidos. Egress e recursos adicionais separados. [Artifact Registry](https://cloud.google.com/artifact-registry/pricing).

Esses subtotais não são orçamento total. Firestore (queries/documentos/índices/armazenamento), Auth conforme provedores/uso, logs, transferência para Brasil, staging, gateway/IAP/LB se escolhido, consumo de outros projetos, moeda da conta e impostos não foram cotados para um projeto alvo existente. Região/quota/budget ainda não configurados. Alertas comuns notificam e não interrompem automaticamente cobranças; min 0/max 1 ajudam a conter consumo, não o limitam a USD 5. [Budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets), [limites de instâncias](https://docs.cloud.google.com/run/docs/configuring/max-instances).

## Procedimento manual futuro — NÃO executado

Obter aprovação explícita com ID de projeto, billing acessível, região/banco, APIs, recursos, IAM nominal, limite financeiro aceito e invocadores. Só depois provisionar cada recurso aprovado. Confirmar permissões/cotas e configuração Firebase antes de enviar imagem.

Construir com contexto **backend/**, nunca raiz/documentação externa; repetir scanner/testes e registrar commit e digest. Não usar deploy por source da raiz nem configurar CI automático. Com imagem já enviada por procedimento aprovado, o comando abaixo é uma referência para revisão, não um script pronto para execução:

```bash
gcloud run deploy catalogos-api-homolog \
  --project=PROJETO_HOMOLOGACAO_APROVADO \
  --region=us-central1 \
  --image=us-central1-docker.pkg.dev/PROJETO_HOMOLOGACAO_APROVADO/catalogos-homolog/api@sha256:DIGEST_APROVADO \
  --service-account=catalogos-api-homolog@PROJETO_HOMOLOGACAO_APROVADO.iam.gserviceaccount.com \
  --env-vars-file=ARQUIVO_YAML_REVISADO \
  --port=8080 --cpu=1 --memory=512Mi --concurrency=10 --timeout=30 \
  --min-instances=0 --max-instances=1 --cpu-throttling \
  --execution-environment=gen2 --no-allow-unauthenticated
```

Não executar com placeholders nem com `bancorestaurante`. Conferir política IAM real para garantir ausência de concessões públicas herdadas. `--no-allow-unauthenticated` não substitui revisão da política. Capturar URL oficial, image digest, revisão, configuração não sensível e resultado dos testes privados. Uma revisão anterior já pública exige análise específica; não presumir que a flag remove toda política anterior. A URL não constitui autorização para frontend público.

Atualizações: repetir checks, construir/taguear pelo commit, enviar a imagem aprovada e criar revisão com `--no-traffic`; validar revisão/tag mediante IAM aprovado e promover tráfego explicitamente. Manter revisão/digest anterior. Primeira revisão sem release anterior: rollback significa suspender os testes e retirar tráfego/acesso por operação aprovada, sem apagar dados. Havendo revisão anterior: `gcloud run services update-traffic catalogos-api-homolog --project=PROJETO_APROVADO --region=us-central1 --to-revisions=REVISAO_ANTERIOR=100`, apenas após confirmar a revisão e autorização operacional. Rollback de código não reverte transações Firestore, IAM, billing ou esquema. Se houver falha de permissão, interromper e propor a permissão exata, sem ampliar papéis automaticamente.

## Ressalvas, documentação e commit

R-001/R-002: configuração e autenticação externas pendentes; R-005: Rules/índices/queries reais; R-006: ADC gerenciada/IAM real; R-007/R-023: abuso/proxy/cotas; R-010/R-013: dispositivos/hosting/domínios; R-011: Java; R-012: custos; R-024: suporte central. Nenhuma encerrada por esta preparação. R-025 permanece resolvida localmente conforme registro e informação do proprietário; sem novas credenciais. Total: 25 IDs, 16 abertas, 9 resolvidas localmente.

Documentos internos de arquitetura, implantação, desenvolvimento, guia, registro e ressalvas recebem atualização desta ordem. Documento externo existente `ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt` recebe os diagramas e a distinção implementado/implantado/previsto; escopo geral, etapas, índice, manual, checklist e guia consolidado recebem notas correntes preservando o histórico. Snapshot `codigoEestrutura.txt` permanece histórico, sem alterações. Nenhum preço/plano/decisão comercial alterado; arquivo sanitizado R-025 preservado.

Commit local específico inclui somente o ajuste `server.js`, o novo modelo YAML e este relatório, sem absorver os documentos acumulados ainda não revisados/commitados da Etapa 26/R-025. Acréscimos nos documentos compartilhados permanecem no working tree para revisão junto ao histórico anterior. Nenhum push. O relatório final informa o hash efetivamente criado; não há versão implantada.
