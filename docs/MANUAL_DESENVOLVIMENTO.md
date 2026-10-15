# Manual de desenvolvimento local

14/10/2026. Node 24.19.0 (.nvmrc), npm/locks, Java 21 e FirebaseCLI 15.32.0; Chrome é necessário ao harness CDP. Java permanente ainda R-011; pasta /tmp não é instalação permanente.

## Instalação reproduzível

Na raiz Catalogo-Demo/Catalogo-demo: nvm use (se nvm instalado). Execute npm ci --ignore-scripts em backend e demo. Não copiar env reais, service account ou backups para Git. [Env/examples](../infra/ambientes/). Arquivos .env.local privados ficam ignorados. Referência de scripts é package.json de cada diretório; não existe npmstart funcional no root.

## Emulator seguro

Na raiz: firebase emulators:start --project demo-catalogos-emulator --only auth,firestore. Auth9099/Firestore8080; nunca apontar testes para bancorestaurante por fallback. APP_ENV=test exige hosts loopback e projeto demo. API usa 3000, não 8080 ocupado pelo Firestore. Exemplos test/development foram corrigidos 26 para evitar a colisão.

Em outro terminal, na raiz:
```
APP_ENV=test GCLOUD_PROJECT=demo-catalogos-emulator FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 PORT=3000 node --env-file=infra/ambientes/test.backend.env.example backend/src/server.js
```
No demo, configurar .env.local a partir do exemplo test.web (não sobrescrever existente sem revisar) e npm run dev -- --host 127.0.0.1 --port 5173 --strictPort. APIhttp://localhost:3000,loja-demo precisa fixture fictícia para catálogo; não há seed real automático. O navegador mostra vazio/404 se loja não existir. Rotinas de integração criam fixtures próprias somente emdemo.

## Testes/build

backend:npm test. demo:npm test e npm run build. Raiz:node --test infra/test/configuracoes.test.cjs;node infra/scripts/verificar-segredos.cjs;node infra/scripts/validar-documentacao.cjs.

```
firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'node backend/scripts/etapa25-emulator-suite.js'
```
Para preservar evidências anteriores, ETAPA24_EVIDENCIAS=/tmp/catalogos-regressao no ambiente. Suite 25 integra 19–24 maislimites. SDK Auth e Rules negativos também são inclusões; não somar como novos testes. Harness usaVite5273/5274 e APIportaefêmera, remove imagem temporária. Executar quando portas livres.

Build normal é local; build:externo exige VITE_APP_ENVhomologacao/production e configuração pública completa/projeto esperado/HTTPS. Não executar deploy. Após build, npm run preview pode conferir artefato recém-gerado; index.html histórico rastreado é preservado no diff após verificação, portanto gerar novamente antes de preview/publicação autorizada. Hostinglocal: firebase emulators:exec --config infra/hosting/firebase.preparacao.json --project demo-catalogos-hosting --only hosting 'node infra/scripts/hosting-smoke.cjs'.

## Diagnóstico

401 credencial versus 403 escopo versus 503 infra. X-Request-ID auxilia logs; não colar token/body/PII em tickets. ConfirmarJava/Node/hosts/projeto/CORS/APIURL/loja, portas livres eAuthprov. Chave já usada comcorpodiferente 409 não deve ser substituída silenciosamente. MetadataLookupWarning isolado no Emulator não comprova problema no Firebase real. [API](REFERENCIA_API.md),[manutenção](MANUAL_MANUTENCAO.md).


## Comandos rápidos na raiz do projeto

```bash
npm --prefix backend ci --ignore-scripts
npm --prefix demo ci --ignore-scripts
npm --prefix backend test
npm --prefix demo test
npm --prefix demo run build
node --test infra/test/configuracoes.test.cjs
node infra/scripts/validar-documentacao.cjs
node infra/scripts/verificar-segredos.cjs
```

Não rodar instalação enquanto houver suite usando node_modules. Para executar somente o frontend em ambiente fictício já configurado, no diretório demo: `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`. Para preparar arquivos .env.local, conferir o conteúdo existente e não sobrescrever configuração do usuário.


## Ordem de Implantação 01 — preparação Cloud Run — 14/10/2026

Preparação local concluída, sem implantação externa. Relatório corrente, custos, recursos, IAM, variáveis, testes, atualização e rollback: [Cloud Run homologação](IMPLANTACAO_CLOUD_RUN_HOMOLOGACAO.md). Branch inicial main/792b069, alterações anteriores preservadas. Único ajuste de execução: servidor escuta explicitamente em 0.0.0.0 e usa PORT fornecida pela plataforma. Dockerfile existente preservado; contexto backend sem credenciais.

Consultas somente de leitura encontraram oito projetos Cloud e seis Firebase acessíveis, nenhum identificado como homologação dedicada; listagem de billing vazia para a identidade atual e billingEnabled=false no projeto atual bancorestaurante. Esse projeto não foi selecionado para API pública. Proposta sujeita à aprovação: projeto Firebase/Cloud dedicado, us-central1 (banco na mesma região), serviço catalogos-api-homolog privado por IAM, identidade runtime dedicada sem JSON, 1 vCPU/512 MiB/concorrência10/min0/max1/timeout30s. Quotas/permissões efetivas e billing do novo projeto não confirmados.

Backend325/325, React79/79, infra3/3, build React1.624 módulos em /tmp, imagem Docker local e 8 checks HTTP sem rede externa aprovados; UID1000, SIGTERMexit0, logs mínimos e contexto restrito conferidos. Firebase real de homologação não testado. Java indisponível no PATH: Emulator não reexecutado nesta rodada (R-011). Evidências antigas continuam históricas.

A primeira fase proposta é privada para operadores aprovados. Firebase ID Token do React não substitui IAM do Cloud Run; prévia de navegador depende de gateway/acesso protegido ou autorização específica de exposição após revisão de rotas/abuso/custos. CORS não é autenticação; limiter por processo/peer não resolve proxy/distribuição. Não alterar automaticamente trust proxy ou tornar serviço público.

Frontend já usa VITE_API_URL, VITE_APP_ENV, projeto Firebase esperado e VITE_LOJAS_POR_HOST (ou VITE_LOJA_ID), com mapa explícito de hostname implementado no código; não há prova da configuração do site publicado. Cloudflare atual permanece sem alteração. Não usar conta R-025 nem dados reais para homologação.

Fluxos lógico/de dados do documento externo existente ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt atualizados, distinguindo código implementado, homologação não implantada e produção prevista. Histórico integral anterior preservado; snapshots e decisões comerciais mantidos. Recursos externos, billing, APIs, IAM, invocadores, dados fictícios e eventual acesso público exigem aprovação específica, conforme a Ordem 01 do proprietário.

R-001/002/005/006/007/010/011/012/013/023/024 continuam com pendências; nenhuma encerrada por esta ordem. R-025 permanece resolvida localmente: total25,16abertas,9resolvidaslocais. Sem push, deploy, escrita Firebase, publicação de Rules/índices ou mudanças comerciais. Commit restrito aos artefatos novos da ordem e server.js; acréscimos nestes documentos compartilhados permanecem em diff para não incorporar alterações anteriores.

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
