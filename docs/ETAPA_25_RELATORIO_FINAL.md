> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# ETAPA 25 — RELATÓRIO FINAL

Conclusão: 14/10/2026, America/Sao_Paulo. Início, testes e consulta de tarifas: 13/10/2026. Ordem de Desenvolvimento 12. Preparação local; não autoriza produção.

## 1. Status

Preparação concluída localmente, com decisões externas/comerciais identificadas. Ambientes/configurações/proteções testados e documentação de implantação reversível preparada. As pendências externas continuam abertas. Etapa 26 não iniciada, implantação não realizada.

## 2. Checkpoint da Etapa 24

Antes de alterar código: status/main/branch-vv/log15/diff examinados,25 arquivos 24 inventariados, padrões de segredos e temporários conferidos. Backend321/321, React76/76 e build 1.623 módulos reproduzidos. Commit `949f992` — `test(project): conclui homologacao local e regressoes etapa 24`,25 arquivos; anterior77c8bb7/9122f01 e demais checkpoints preservados. Sem push/reset/clean/force. A preparação 25 permanece em diff para revisão; não criado commit extra 25.

## 3. Arquitetura recomendada

Proposta sujeita à aprovação: frontend compartilhado Cloudflare Pages, backend Express compartilhado Cloud Run, Firebase por ambiente homolog/prod. Mapa explícito de hostname→loja no mesmo bundle, autorização backend independente, sem servidor por restaurante. Alternativas Firebase Hosting, instâncias dedicadas por contrato e Node gerenciado comparadas em ETAPA_25_ARQUITETURA_PRODUCAO.md. Adicionar loja implica mapa/CORS/Auth/domínio e build revisados, não onboarding automático.

## 4. Ambientes

development preservado, exemplos seguros usam demo; test exige ambos Emulators locais/projeto demo; homologacao/production exigem NODE_ENV=production, projeto explícito/esperado igual, sem Emulator/arquivo JSON privado, CORS HTTPS/limites/logs. PORT validada antes de init. Web externo exige campos completos/HTTPS/projeto esperado e validação antes de build. Configuração coerente não comprova IAM real. Unit tests e dois builds externos fictícios aprovados; build externo sem modo/config recusado.

## 5. Firebase Web e Authentication

Anonymous/EmailPassword/cadastro opcional/vínculoUID/login/admin/logout/refresh/revogação preservados e regressões passadas. Configuração Web pública sem Admin. Roteiro Console de provedores/domínios/contas/recovery preparado, nenhuma alteração externa. Cadastro nunca concede admin automaticamente. Admin atual vincula uma loja por UID; gestão de várias lojas pelo mesmo admin não foi implementada.

## 6. Firestore e índices

Coleções/endereços/pedidos/nonces/multi-loja preservados. Rules deny-all Web/Admin SDK autorizado;300 negações diretas reexecutadas. Sete índices COLLECTION locais, seis existentes preservados e ativo/disponivel acrescentado; inventário por query no doc de ambientes. Estrutura validada e queries/rules no Emulator passaram. Emulator não aplica exigência de índices compostos: publicação/estado READY/QueryExplain em homologação autorizada permanecem R-005. Nenhuma Rule/índice publicado.

## 7. Frontend hosting

Pages principal proposta, HTTPS/domínios/builds/releases/caches e custos analisados. Free: 100 domínios/projeto, 500 builds/mês, Pro 250 domínios;150 lojas com domínio distinto exigem plano/limite aprovado, não suporte gratuito ilimitado. Exemplos de configuração Pages preparados fora do public. Firebase Hosting alternativo efetivamente testado local: raiz/cardápio/admin retornam SPA 200, nosniff/HTML no-cache/assets imutáveis. Corrigido public de demo/dist para ../../demo/dist após 404 reproduzido; teste permanente evita perder esse vínculo de caminho. Não houve hosting público.

## 8. Backend hosting

Cloud Run proposto com ADC gerenciada, containerNode24.19.0 por digest, npmci/não root/sem .env, PORT e SIGTERM. Docker build local aprovado; runtime sem rede externa prova health 200 e SIGTERM exit 0, config ausente é recusada. Node gerenciado/Render e VPS comparados, sem criar serviços. Proposta1vCPU/512MiB–1GiB/min0/max3/concorrência20/timeout30s depende de medição e aprovação, sem capacidade assegurada.

## 9. Domínios e HTTPS

Mapa público por hostname exato, domínio desconhecido recusa execução; duas lojas testadas em unidade e fluxo Chrome por instâncias fictícias. CORS HTTPS explícito externo e AuthAuthorizedDomains a configurar. HTTPS/APIbase/redirects/SPA/cache preparados; sem DNS/domínio registrado/certificado real. Limites Pages/certificados e topologia 150 lojas devem ser aprovados antes de implantação.

## 10. Credenciais e IAM

Priorizar SAgerenciada por ambiente, ADC sem distribuir JSON, papéis runtime mínimos Firestore/Authlookup e operador/backup separados. Proposta roles/customroles exige verificação real do conjunto de permissões. Node/Docker/CI/examples não contêm segredo privado. Scan textual e fixture sintética de token passaram; sem valor emitido. Nenhum IAM/conta real alterado ou credencial real impressa.

## 11. Proteção contra abuso

Limiter local opt-in obrigatório externo: por grupo/IP do peer antes deAuth e UID verificado depois, janela 60 s, memóriaaté10mil,429/Retry-After; health/OPTIONS livres. Headersforjados/nonce não mudam quota; slash final normalizado. Defaults generosos deIP e20checkout/UID/min são iniciais e requerem piloto/NAT. Node tests+Emulator21POST/1GET provam 20 chamadas aceitas (1criação/19replays), um pedido; 21ª429 e GETrecuperação 200. SDK Auth direto não é protegido por limiter Express. Planejadas cotas/edge/AppCheck/distribuição/proxyconfiável; nenhum Redis/LB/WAF pago provisionado. R-007/R-023 abertos.

## 12. Retenção de dados

Inventário de pedidos/PII/endereço/conta/log/financeiro/backup proposto. Logs 30 dias, backups diários30dias/semanais12semanas como candidatos técnicos, não prazos jurídicos confirmados. Pedidos e financeiro precisam decisão/assessoria; não apagar snapshots financeiros junto com endereço do perfil. Nenhuma limpeza automática real.

## 13. Política de idempotência

Sem TTL. Manter vínculo nonce→pedido enquanto recuperação estiver disponível. Janela 7 dias somente proposta para discussão, não aprovada/implementada: cliente não possui envelope de tempo autenticado. Expiração futura precisa contrato/tombstone/recuperação ou rejeição explícita, nunca gerar novo pedido a partir da mesma chave antiga. Mesma tentativa/mesmo corpo recupera; corpo diferente 409; falha póscommit preserva associação. R-009 permanece aberto.

## 14. LGPD e privacidade

Mapeados UID/email/nome/telefone/endereço/snapshots/notas/financeiro informativo/nonces/browser/WhatsApp/logs/backups, finalidade/acesso/exportação/exclusão. Proposta técnica distingue validação jurídica de base legal, papéis plataforma/restaurante, subprocessadores/regiões e termos/política. Nenhuma conclusão definitiva ou texto legal publicado. R-008 aberto; a assinatura de idempotência é SHA-256 do corpo canônico; pedidoId e vínculo indireto com o titular continuam protegidos.

## 15. Monitoramento

Logs HTTP estruturados mínimos (UUID requestId/grupo/status/ms), sem body/path/query/PII/token; handlers 23 preservados,API no-store/nosniff/sem x-powered-by. Critérios iniciais 5xx/429/p95/memória/checkout/custos/MAU/integridade listados no doc de segurança, sujeitos à baseline real. Health comprova processo, não dependênciaFirebase. Sem serviço de alertas externo ativado; orçamento não é teto de cobrança.

## 16. Custos estimados e premissas

Modelo puro/JSON/CSV para1/10/50/100/150lojas,30dias e premissas explícitas. Preços oficiais de referência13/10/2026,USD/us-central1/Tier1; região final não escolhida. Subtotal parcial normal (Firestore reads+writes+Runbruto) é0,05/3,75/20,56/41,57/62,58USD, respectivamente; catálogo grande 1.006 reads amplia a2,33/27,38/138,69/277,82/416,96USD. NÃO são custo total nem mensalidades recomendadas.

Transferência/armazenamento/Hosting/logs/backup/Auth/domínios/CI/serviços/FX/impostos/reserva têm fórmulas e variáveis separadas, cotação regional/plano pendente. FirebaseHosting adicional ilustrado; Pages 150 domínios pode exigir custo de plano. Baseline 24 catalog166,14ms/dashboard202,51ms é local serial, não CPU faturável/capacidade. Otimizações futuras de catálogo/cache/paginação/imagens/agregados identificadas, sem refatoração especulativa.

## 17. Backup e recuperação

Plano de backup/PITR/acesso/retencão/RPO24h/RTO4h candidato, sem comprovação ou recurso real. Restoreisolado antes de produção; para uma loja filtrar prefixo e manifesto/precondições, preservar B e escrituras posteriores, não importar collectionGroupglobal na base compartilhada. Auth separado do backupFirestore. Estratégia legados exige mapeamento inequívoco/controle de conta/backup/dry-run/relatório/ambíguos/financeiro/rollback/pós-check, nunca email/nome suficientes. Ensaio de recuperação completo e migração fictícia executável não implementados; preparação documental concluída, evidência real permanece pendente.

## 18. CI/CD

Workflow de validação preparado, read-only/sem secretsFirebase/id-token/deploy; actionsSHA, baseDocker digest,Node24/Java21, envdemo explícito, npmci/scan/test/build/audit/Emulator/Chrome, timeout/cancelamento. YAML e comandos locais aprovados. Nenhuma execução GitHub (sem push); disponibilidade runner/custos/próximo primeiro run precisam validar. Deploy futuro manual/aprovado, jamais automático em push para main. Quotas/minutos por plano listadas.

## 19. Testes executados

| Família | Resultado e natureza |
| --- | --- |
| Checkpoint 24 | Backend 321/321, React 76/76 e build 1.623 módulos reproduzidos antes do commit |
| Backend final | 325/325 em 9 arquivos; inclui 285 HTTP e 3 globais, com SDK fake e Express local |
| Guardas finais | 4/4, incluídos no 325; também rejeita NODE_ENV=test no ambiente externo |
| React final | 79/79 em 7 arquivos; API/SDK mockados e jsdom |
| Infraestrutura | 3/3 independentes: scanner sintético, custos/franquias e configurações |
| Emulator 19–24 | Integração aprovada; 300 negativas SDK, 37 HTTP21, 104 HTTP22 e 22 HTTP23, sem somar inclusões |
| Chrome reexecutado na 25 | 12 fluxos e 200 verificações HTTP24 (184 benchmark + 16 funcionais), zero erros JS/console; modo Web test explícito também passou |
| Abuso 25 | 21 POST + 1 GET: 1 criação/19 replays aceitos, 21ª tentativa recebe 429, recuperação retorna 200; um pedido |
| Hosting Emulator | Raiz/cardápio/admin retornam HTML SPA 200; headers, revalidação do HTML e assets immutable aprovados |
| Docker | Build/instalação aprovados; health200, SIGTERM exit0, usuário não root, sem .env e sem rede externa; configuração ausente negada |
| Builds | Local 1.624 módulos, JS 434,98 KB (~108,11 KB gzip); dois builds externos fictícios aprovados, modo ausente recusado |
| npm | npm ci React (219 packages/220 auditados), produção backend no Docker; npm audit zero nas duas árvores |
| Integridade | Scan, sintaxe JS/JSON/YAML/pins e git diff --check aprovados; evidências24 preservadas |


Resumos em docs/evidencias-etapa25/verificacoes.txt, JSON/custos/capturas em mesma pasta. Testes manuais físicos/produção/Cloudflare/CI remoto/IAM/índices reais/restore real NÃO executados. Inspeção de screenshot 24 e Chrome automatizado não equivalem a homologação comercial. Timer/CDP/Emulator/cargaCPU local não estimam escala 150.

## 20. Arquivos criados/alterados

Inventário individual (arquivo/função); também guia externo seção 100, por acréscimo com prefixo verificado. Nenhuma alteração de CSS/Rules ou envreal. dist/index histórico restaurado após build, nenhum artefato dist incluído no diff.

| Arquivo | Função |
| --- | --- |
| .github/workflows/validacao-local.yml | CI de validação sem deploy/segredos, actions por SHA, ambiente demo explícito |
| .nvmrc | Versão Node24.19.0 reproduzível |
| backend/.dockerignore | Allowlist do contexto; exclui env/credenciais/testes |
| backend/.env.example | Exemplo local e referência aos ambientes externos |
| backend/Dockerfile | Container não root com base por digest e npm ci |
| backend/package-lock.json | Metadado engines no lock, sem atualização de dependências |
| backend/package.json | Node 24 e script suite 25 |
| backend/scripts/etapa24-homologacao.js | Saída de evidências selecionável e Web test/demo explícito, sem sobrescrever histórico 24 |
| backend/scripts/etapa25-emulator-suite.js | Orquestra regressões 19–24 e infraestrutura 25, guardada por Emulator |
| backend/scripts/infraestrutura-emulator-integration.js | 429 real/Retry-After,21POST/1GET e um pedido/recuperação |
| backend/src/app.js | Headers seguros/no-store/sem x-powered-by, logs e limiter de entrada |
| backend/src/config/ambiente.js | Guardas de ambiente/projeto/CORS/ADC/limites/logs/porta |
| backend/src/middleware/authMiddleware.js | Quota somente após UID/token verificado, antes de lookup complementar |
| backend/src/middleware/operacao.js | Rate limit em memória bounded e observabilidade mínima |
| backend/src/server.js | PORT antes de init e SIGTERM seguro até 10 s |
| backend/test/infraestrutura.test.js | Quatro testes dirigidos ambiente/429/memória/PII, incluindo trailingSlash |
| demo/.env.example | Ambiente Web local e exemplo do mapa explícito |
| demo/package-lock.json | EnginesNode 24 no lock, nenhuma atualização de versões |
| demo/package.json | Node 24 e build:externo validado |
| demo/scripts/build-externo.mjs | Valida configuração pública e modo antes de executar Vite |
| demo/src/lib/ambienteAplicacao.js | Config segura e hostname→loja explícito, preserva local |
| demo/src/lib/firebase.js | Exige config externa completa antes de Firebase Web |
| demo/src/services/api.js | Usa base e loja selecionadas pela configuração validada |
| demo/test/ambientes.test.js | Três testes de Web externo/HTTPS/mapa/loja desconhecida |
| docs/ETAPA_25_ANALISE_CUSTOS.md | Fontes, premissas, cenários e fórmulas dos componentes pendentes |
| docs/ETAPA_25_ARQUITETURA_PRODUCAO.md | Recomendação/alternativas, domínios, escala e decisões |
| docs/ETAPA_25_CHECKLIST_IMPLANTACAO.md | FasesA–H com evidência/risco/responsável e CI sem deploy |
| docs/ETAPA_25_CONFIGURACAO_AMBIENTES.md | Ambientes/Auth/Firestore/inventário de índices/estratégia legados |
| docs/ETAPA_25_RELATORIO_FINAL.md | Relatório obrigatório de 25 itens |
| docs/ETAPA_25_SEGURANCA_OPERACIONAL.md | IAM/abuso/PII/retencão/idempotência/monitoramento/backup e restore |
| docs/GUIA_MESTRE.md | Acréscimo da conclusão local 25 e próxima revisão |
| docs/REGISTRO_DE_TRABALHO.md | Histórico de alterações/testes/decisões da 25 |
| docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md | Todos 22 identificadores preservados, evidências 25 e R-023 |
| docs/evidencias-etapa25/auditoria-dependencias.json | Contagens audit 0 nas duas árvores |
| docs/evidencias-etapa25/custos.json | Saída reproduzível do modelo com fontes e limites |
| docs/evidencias-etapa25/documentacao-consultada.json | Inventário de consulta, hashes no momento da leitura, não hash dos docs finais |
| docs/evidencias-etapa25/homologacao/admin-mobile.png | Screenshot Chrome 25 com dados fictícios; não dispositivo físico |
| docs/evidencias-etapa25/homologacao/catalogo-desktop.png | Screenshot Chrome 25 com dados fictícios; não dispositivo físico |
| docs/evidencias-etapa25/homologacao/catalogo-mobile.png | Screenshot Chrome 25 com dados fictícios; não dispositivo físico |
| docs/evidencias-etapa25/homologacao/checkout-desktop.png | Screenshot Chrome 25 com dados fictícios; não dispositivo físico |
| docs/evidencias-etapa25/homologacao/resultados.json | Métricas/fluxos Chrome novos 25 |
| docs/evidencias-etapa25/variaveis-custos.csv | Tarifas referência e itens sem preço final a confirmar |
| docs/evidencias-etapa25/resumo.json | Ambiente, datas, checkpoint, contagens e limites da execução |
| docs/evidencias-etapa25/verificacoes.txt | Resumos literais das execuções com natureza distinguida |
| firebase/firestore.indexes.json | Mantém seis índices, acrescenta ativo/disponivel para dashboard |
| infra/ambientes/development.backend.env.example | Exemplo fictício development backend |
| infra/ambientes/development.web.env.example | Exemplo fictício development Web |
| infra/ambientes/homologacao.backend.env.example | Exemplo fictício homologacao backend |
| infra/ambientes/homologacao.web.env.example | Exemplo fictício homologacao Web |
| infra/ambientes/production.backend.env.example | Exemplo fictício production backend |
| infra/ambientes/production.web.env.example | Exemplo fictício production Web |
| infra/ambientes/test.backend.env.example | Exemplo fictício test backend |
| infra/ambientes/test.web.env.example | Exemplo fictício test Web |
| infra/hosting/cloudflare-headers.example | Headers/caching alternativo para provedor proposto, ainda não aplicado |
| infra/hosting/cloudflare-redirects.example | FallbackSPA 200 para Pages a adotar após aprovação |
| infra/hosting/firebase.preparacao.json | Hosting alternativo relativo à pasta do config, rewrite/cache testados |
| infra/scripts/custos.cjs | Modelo puro parametrizado, cenários1/10/50/100/150 |
| infra/scripts/hosting-smoke.cjs | Prova local de URLs diretas/SPA/headers/cache |
| infra/scripts/verificar-segredos.cjs | Scan de arquivos Git/novos, só relata nome/padrão, nunca valor |
| infra/test/configuracoes.test.cjs | Três testes scan sintético/custos/franquia/configurações |

## 21. Situação das ressalvas

PreservadosR-001–022;R-015–022 seguem resolvidos apenas localmente23/24. Todas 14 abertas anteriores permanecem; R-007 em análise pela proteção local. R-023 nova (limiter por processo/proxy/ingress/distribuição) pendente. Total23,15abertas(11pendentes/4análise),8resolvidaslocalmente, zero homologação real. Ledger diferencia preparado/externo/proprietário/homologação/evidência, não encerra item por plano.

## 22. Pendências de implantação

Configuração dos projetos/Console Auth/domínios/dados comerciais/IAM/edge/índices/hosting/region/billing, aprovação retenção/backup/idempotência, credenciais gerenciadas corretas, ensaio de restore/legados e roteirophysical 24. Publicar só após ordens específicas e checklistB–H; nada dissoexecutado 25. Java localpermanente, primeiroCI remoto e scansupplychain daimagem ainda pendentes.

## 23. Decisões que exigem aprovação

Provedor/região/plano e orçamento completo, domínio/limites150,instâncias/SLA e coldstart, topologia de borda/limiterdistribuído/AppCheck, IAMaprovisionamento, dados comerciais e administradores, políticaPII/log/backup e janela/contratodeexpiração, migração/identidadeslegadas e termos/licença. Sem decisão atribuída automaticamente ao proprietário e sem pedido para provisionarantesdetrabalho pronto.

## 24. Riscos residuais

Falha compartilhada pode afetar várias lojas; quotas locais não garantemcusto oufairnessdistribuído. O Emulator não valida índices/IAM/fatura; desempenho não prova concorrência. Mapa/CORS/domínios exigem manutenção;150 domíniosnão cabemPagesFree. Restore/migração semmanifesto podem atingirB ou perderfinanceiro. Expirar nonce isolado duplica pedido; jurídica/retencão ausentes bloqueiamliberaçãocomercial. Defaults legados de desenvolvimento não devem serusadoscomoteste/produção. Todas as limitaçõesexplicitadas antes de liberar.

## 25. Recomendação para Etapa 26

Submeter os seisdocumentos, checklist, custos e guia atualizado à revisão. Etapa 26 somente após autorização explícita; preparação concluída não permite deploy. Não houvepush, deploy, publicaçãoRules/índices, cobrança, recurso pago, IAM/DNS/Authreal, escrita/exclusão/migração/backupreal, mensagemWhatsApp ouavanço 26 nestaordem.


## Errata documental — Etapa 26,14/10/2026

A auditoria de pedidoService.js confirmou assinatura SHA-256, não corpo/PII em texto claro. A redação corrente foi corrigida; o texto anterior permanece no checkpoint792b069 e na seção100histórica do guia externo. Nenhuma alteração funcional.
