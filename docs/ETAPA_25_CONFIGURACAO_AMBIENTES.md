> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# Etapa 25 — Configuração de ambientes

13/10/2026. Preparação local. Todos os oito exemplos em infra/ambientes são fictícios; substituir apenas em processo autorizado. Não copiar chaves reais para código, documentação, chat, build React ou imagem.

| Ambiente | Backend | Web | Persistência |
| --- | --- | --- | --- |
| development | APP_ENV=development, Node24; exemplos seguros apontam demo/hosts locais | VITE_APP_ENV=development; VITE_LOJA_ID ou mapa | Emulator recomendado; comportamento local anterior preservado |
| test | APP_ENV=test e Auth+Firestore em loopback, GCLOUD_PROJECT demo- | VITE_APP_ENV=test, Auth Emulator e projeto demo | Somente dados fictícios; inicialização externa recusada |
| homologacao | APP_ENV=homologacao/NODE_ENV=production, projeto esperado explícito, CORS HTTPS, logs/limites | Build externo validado; projeto homolog separado | Exige autorização externa antes de configurar |
| production | APP_ENV=production/NODE_ENV=production e mesmas guardas estritas | Build externo com projeto prod separado | Nenhuma configuração real realizada 25 |

## Backend

APP_ENV externo exige GCLOUD_PROJECT igual FIREBASE_EXPECTED_PROJECT_ID, nenhum host Emulator, projeto não demo, CORS_ORIGINS com origens HTTPS exatas, RATE_LIMIT_MODE=enforce e HTTP_LOG_ENABLED=1. NODE_ENV=production sem APP_ENV externo falha. GOOGLE_APPLICATION_CREDENTIALS é recusada nos exemplos externos: usar identidade gerenciada/ADC. PORT deve ser inteiro 1–65535. Configuração inválida falha antes de servir requisições; nenhum valor sensível é impresso. Igualdade das variáveis não comprova a identidade/IAM real; operador deve verificar o vínculo do serviço e permissões externamente.

Em development preservou-se a compatibilidade do fallback legado bancorestaurante quando não há GCLOUD_PROJECT. Isso NÃO constitui default seguro para testes: estes devem usar APP_ENV=test e ambos Emulators. Exemplos development usam demo para reduzir risco. Guardas locais anteriores de host/porta/projeto misturado permanecem. APP_ENV inválido e RATE_LIMIT_MODE inválido são recusados.

Node não carrega .env automaticamente; o processo de serviço deve injetar variáveis. Localmente Node24 suporta --env-file para exemplo explícito, ou ambiente controlado pelo runner. Nunca usar source/eval de arquivos não confiáveis. Ex.: node --env-file=../infra/ambientes/test.backend.env.example src/server.js no diretório backend, com Emulator já iniciado. ADC não é necessária no Emulator. Não executar esse exemplo enquanto portas locais estiverem ocupadas.

## Frontend

VITE_* é público no bundle. Permitidos API URL, projectId, authDomain, appId, API key Web pública e identificação das lojas; proibidos credenciais Admin, tokens, senhas/chaves privadas. build:externo recusa nomes VITE_*PRIVATE/PASSWORD/SECRET/TOKEN/CREDENTIAL e valida o conjunto. API HTTPS sem credenciais/query/hash; projeto esperado igual declarado; todos os campos obrigatórios; emulação recusada nos externos.

VITE_LOJAS_POR_HOST é JSON de hostnames em minúsculas e IDs válidos. Matching exato de window.location.hostname, host desconhecido falha fechado, sem fallback para outra loja. IDs/path/query não fornecem autorização. Alternativa individual: VITE_LOJA_ID explícito. npm run build mantém desenvolvimento; npm run build:externo exige VITE_APP_ENV=homologacao ou production no processo e valida antes de chamar Vite com --mode correspondente. Vite incorpora variáveis no build, portanto trocar projeto/domínios implica rebuild revisado; .env local nunca vai à imagem.

Os dois builds externos executados 25 usaram dados fictícios dos exemplos, não artefatos prontos para publicar. Configurações carregadas por loadEnv são validadas e enviadas ao mesmo processo Vite para impedir divergência. Mapa completo e origens precisam de revisão; teste de unidade demonstra A/B/host desconhecido, Chrome 24 demonstra seleção individual de duas lojas fictícias.

## Firebase Web/Auth: operações futuras no Console

1. Aprovar projetos distintos homolog/prod, região, responsáveis e billing quando necessário; ainda não criados/modificados 25.
2. Registrar Web app e extrair somente configuração pública para ambiente de build; comparar projeto esperado entre API/Web, sem divulgar arquivos Admin.
3. Habilitar Anonymous e Email/Password previstos pela UI; domínio exato de homolog/lojas na lista Authorized Domains, HTTPS e templates de recuperação de senha revisados.
4. Cadastro opcional usa linkWithCredential sobre usuário anônimo: preserva UID. Conflito de credencial existente requer login/tratamento explícito; não mesclar histórico por email. UI atual não promete OAuth/telefone; novos provedores são decisão posterior.
5. Criar contas administrativas de forma controlada e documento usuarios/{uid} com role admin/lojaId/ativo após dupla conferência. Nenhum cadastro de cliente gera admin; proteger procedimento fora da API pública.
6. Homologar logout, password recovery, token expirado/revogado, usuário inativo/sem documento, UID na troca de conta e loja diferente. verifyIdToken(token,true) continua ativo.
7. Registrar evidência sem tokens/senhas/PII. [Verificação de tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens) e [revogação](https://firebase.google.com/docs/auth/admin/manage-sessions).

## Firestore, índices e Rules

Rules deny-all Web preservadas: público e dados privados passam pela API; Admin SDK exige autorização e IAM. Manifesto agora contém 7 índices COLLECTION (seis anteriores preservados, um ativo/disponivel adicionado). Sem collectionGroup transversal ou TTL.

| Consulta real / arquivo | Índice preparado |
| --- | --- |
| adminService listar pedidos status==, criadoEm desc | pedidos status ASC + criadoEm DESC |
| dashboard count por status e período criadoEm | pedidos status ASC + criadoEm ASC |
| soma por período | pedidos criadoEm ASC + total ASC |
| financeiro confirmado e status!=cancelado, ordem criadoEm/status | pagamento.status ASC + criadoEm ASC + status ASC; versão com total ASC para sum |
| categoria ativa vinculada / transação | produtos categoriaId ASC + ativo ASC |
| dashboard produtos ativo==true/disponivel==false | produtos ativo ASC + disponivel ASC (novo) |
| listagens __name__/criadoEm e cat/clienteId isolados; get por ID | índices de campo único automáticos, revisar Query Explain em homologação |

Emulator executa queries e regras mas NÃO verifica necessidade/suficiência de índices compostos. Manifesto/estrutura/testes locais foram validados; R-005 continua aberta até publicação autorizada e consultas com Query Explain no projeto homolog. [Limitação oficial Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore?hl=en), [gestão de índices](https://firebase.google.com/docs/firestore/query-data/indexing?hl=en). Campos criadoEm/total ausentes em legados podem excluir resultados de agregação; conferência de dados é requisito antes de liberar dashboard.

## Legados / R-004

UID Auth, usuarios/{uid}, clientes/{id} e pedidos.clienteId têm funções distintas. Cadastros novos/anônimos vinculados usam UID; IDs históricos como cli_* não provam vínculo. Preparar manifesto por loja com evidência de controle da conta e autorização do titular, oldId→uid inequívoco, IDs de documentos afetados, hashes/versões, antes/depois e conflitos. Nome/email nunca bastam.

Antes de qualquer migração futura: backup verificável + restore de ensaio isolado; dry-run sem escrita, relatório de ambíguos em quarentena, dupla aprovação; preferir lotes pequenos/transações com precondição de versão e checkpoint por lote. Copiar/mesclar perfil/endereço somente com política definida; atualizar referências clienteId aprovadas, preservar itens/total/taxa/status/pagamento/criadoEm e histórico financeiro integral. Não fundir contas Auth por conveniência. Anônimo vinculado mantém UID e normalmente não requer remap.

Rollback usa manifesto antes/depois com precondições; nunca sobrescreve alteração posterior sem reconciliação. Pós-check verifica titularidade, contagens/somas por loja, endereços, recuperação idempotente e inexistência de vínculo cruzado. Se idempotência deriva UID, preservar associação antiga ou projetar alias autorizado para retry antes de mudar titularidade; não descartar nonce. Nenhuma migração/backup de dados reais executada 25.
