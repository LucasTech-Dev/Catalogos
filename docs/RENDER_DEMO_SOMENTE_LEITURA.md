# CATÁLOGOS — MODO PÚBLICO SOMENTE LEITURA

> Etapa 1 de publicação: o proprietário informou ter publicado Rules deny-all manualmente. Estado remoto não reverificado nesta rodada; consulte a [branch e roteiro atuais](RENDER_ETAPA1_BRANCH_DEPLOY.md). Catálogo permanece bloqueado.

> Atualização Ordem 07: auditoria real encontrou Rules publicadas inseguras e incompatibilidade no ativo da loja. Publicação bloqueada. Consulte [validação real](VALIDACAO_DADOS_PUBLICOS_RENDER.md); a descrição da Ordem 06 abaixo é histórica.

Ordem 06 — 15/10/2026, America/Sao_Paulo. **Implementado e testado localmente; sem deploy.** Preserva o sistema completo e acrescenta uma execução restrita. Dados reais não foram consultados/aprovados; o exemplo mantém o catálogo bloqueado (503), sem consultas ao banco, até revisão humana. Nenhuma criação de SA/chave/IAM, escrita real, commit/push, Render ou Cloudflare autorizada/executada.

## 1. Git inicial

Repositório interno Catalogo-Demo/Catalogo-demo, main/HEAD 19b554d, oito commits à frente da referência origin/main local; sem fetch/consulta GitHub. Diffs históricos e arquivos novos das etapas 19–26 e ordens 02–05 preservados. Inventário inicial em evidencias-ordem06/git-status-inicial.txt e final no mesmo diretório. Não usar Git externo vazio do workspace. Interrupção de conexão durante a rodada não descartou arquivos; trabalho retomado do estado salvo.

Lidos auditoria pré-publicação, preparação bancorestaurante, implantação, ressalvas, arquitetura e guia; conferidos app.js, 43 contratos e routers/services da auditoria, guards, identidade/loja, Firebase, testes, CORS e limiter. Nenhum código comercial reimplementado ou excluído.

## 2. Rotas permitidas — lista positiva

| Método/alvo bruto exato | Comportamento |
| --- | --- |
| GET ou HEAD / | Health genérico; sem Firestore/Auth |
| GET ou HEAD /publico/lojas/loja-demo/catalogo | Catálogo somente quando aprovado; leitura pontual de IDs configurados |
| OPTIONS dos dois alvos acima | Somente com Origin e Access-Control-Request-Method GET/HEAD; CORS validado; 204 |

Query string, barra final adicional, diferenças de caixa, ID percent-encoded, path alternativo ou método não listado são recusados. HEAD usa o handler GET e pode aquecer o cache/leitura, mas não grava. GET do catálogo sem aprovação responde 503; não são liberadas rotas individuais de produtos/categorias por serem GET: tudo passa pela única projeção auditada.

## 3. Rotas bloqueadas e momento do bloqueio

Os 41 contratos completos restantes, inclusive as 15 mutações, não são montados nesse modo. Admin, usuários/me, perfil, clientes, endereços, pedidos, status/pagamento e WhatsApp ficam indisponíveis. Também são negadas outras lojas, aliases, queries e métodos inesperados. Middleware global defensivo verifica req.originalUrl e método **antes** de parser/controllers/services/Firestore. Resposta 404 genérica: {"error":"Recurso indisponível nesta demonstração."}. Não revela coleções/credenciais/implementação.

app.js valida configuração e escolhe ramo demo ou completo. No ramo demo não carrega routers/controllers/services privados nem firebase-admin/auth; teste de carregamento falha se isso acontecer. Fora do modo demo, ramo completo preserva os 43 contratos, controles e fluxo funcional existentes; suítes históricas foram repetidas.

## 4. Identificação de loja e configuração parcial

CATALOGOS_RUNTIME_MODE=public-readonly-demo exige APP_ENV=homologacao, NODE_ENV=production, todos os IDs Firebase/opt-in iguais a bancorestaurante e CATALOGOS_DEMO_LOJA_ID=loja-demo. Emulator é recusado. Não se usa NODE_ENV isolado como ativação. Modo desconhecido falha; opções CATALOGOS_DEMO_* presentes sem esse modo também falham, para impedir execução completa acidental por omissão do seletor. Sem modo nem opções novas, comportamento normal anterior é preservado; full é opção explícita para esse comportamento, não para primeira publicação.

Lista de rotas usa a loja fixa do servidor, não Origin ou loja enviada pelo browser. Configuração de outra loja é recusada na inicialização. IDs de documentos só aceitam A–Z/a–z/0–9/_/-, 1–128 caracteres, sem duplicações, slash ou traversal. JSON de lista inválido/ausente falha antes do servidor iniciar.

## 5. Dados publicáveis e projeções

Revisão humana ainda pendente: **CATALOGOS_DEMO_CATALOG_APPROVED=0** no exemplo. Quando 0, health pode funcionar com configuração/identidade válidas, mas catálogo responde 503 sem abrir consulta Firestore. Para aprovar futuramente: proprietário revisa valores concretos e configura 1 junto das listas explícitas de IDs aprovados; não basta aprovar nome de campo. Nenhuma lista real foi preenchida nesta tarefa.

| Objeto | Projeção exclusiva da demo |
| --- | --- |
| loja | id e nome (até 200 caracteres); ativo deve ser true |
| categoria | id e nome (até 200); ativo deve ser true e ID estar na lista aprovada |
| produto | id, nome (200), descricao comercial (2.000), preco finito entre 0 e 1.000.000, categoriaId, disponivel e imagem opcional |

Produto exige ativo true e categoria ativa efetivamente retornada na lista aprovada. Órfãos/inativos/malformados não são publicados. Indisponível pode ser mostrado como tal, sem botão de compra. Imagem só HTTPS sem userinfo/query/hash e sem host loopback explícito; URL com token de Storage em query não é publicada. Humano precisa aprovar também destino/imagem e texto comercial: filtro técnico não identifica toda PII dentro de campo livre ou todos endereços internos via DNS. Nunca renderizar HTML do Firestore; React usa texto escapado.

Não retornam contato, endereço comercial/residencial, clientes, usuários, pedidos, valores financeiros privados, pagamentos/configuração comercial, nonce, datas administrativas, campos arbitrários ou documento completo. Preço público de produto não é financeiro privado. Projeção normal completa permanece para ambientes completos; a demo tem DTO próprio.

IDs aprovados limitam novas inclusões: produto novo fora da lista não aparece. Aprovação não congela o valor de um documento mutável: qualquer edição posterior exige suspender aprovação/revisar antes de republicar; não há manifesto criptográfico de versões. Nenhum dado real foi aprovado por passar nos testes fictícios.

## 6. Proibição de escrita em duas camadas

HTTP: só health/catálogo permitido e nenhum handler privado montado; testes varrem contratos e verificam zero leituras indevidas/zero chamadas de escrita. Catálogo recebe capacidade lerDocumento; adaptador usa somente db.doc(path).get(), sem get de coleção, transação, set/update/delete/create. Nenhuma operação Auth é usada.

Identidade: preparada proposta restrita a leitura pontual, sem concessão real. Isso precisa ser validado externamente antes do GO, incluindo permissões herdadas e ausência de credencial ampla alternativa. Gate HTTP não elimina risco de chave roubada; IAM de leitura não elimina risco de exposição por código comprometido. Não declarar isolamento IAM de documento/loja com base em papel no projeto.

## 7. Variáveis e exemplo Render vigente

Modelo: infra/render/bancorestaurante.backend.env.example. Valores públicos/sugestões, sem conteúdo de chave:

```dotenv
APP_ENV=homologacao
NODE_ENV=production
GCLOUD_PROJECT=bancorestaurante
FIREBASE_EXPECTED_PROJECT_ID=bancorestaurante
FIREBASE_HOMOLOG_PROJECT_ID=bancorestaurante
FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante
FIREBASE_CREDENTIAL_MODE=render-secret-file
FIREBASE_SERVICE_ACCOUNT_EMAIL=catalogos-api-demo-readonly@bancorestaurante.iam.gserviceaccount.com
CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev
RATE_LIMIT_MODE=enforce
HTTP_LOG_ENABLED=1
CATALOGOS_RUNTIME_MODE=public-readonly-demo
CATALOGOS_DEMO_LOJA_ID=loja-demo
CATALOGOS_DEMO_CATALOG_APPROVED=0
CATALOGOS_DEMO_PRODUCT_IDS=[]
CATALOGOS_DEMO_CATEGORY_IDS=[]
```

Identidade sugerida ainda não criada/verificada. PORT fornecida pelo Render; não definir GOOGLE_APPLICATION_CREDENTIALS/hosts Emulator. Para aprovação posterior, listas JSON de IDs revisados substituem [] (máximo 50 produtos/20 categorias); com aprovação 1, listas vazias são inválidas. Configuração explícita não concede IAM nem constitui autorização de deploy/escrita.

## 8. Firebase e credencial

Inicialização Admin App/cert e projeto validado preservados; arquivo privado exclusivo /etc/secrets/firebase-homologacao.json, regular, até 64 KiB, sem symlink final, projeto/email correspondentes, falhas sem segredo. Credencial ausente/inválida impede startup inclusive do health; não há fallback ADC pessoal. Montagem real Render não comprovada e ainda precisa de validação, inclusive se usa symlink.

Demo não chama getAuth/verifyIdToken/getUser/createUser ou endpoint de Authentication. Importar Admin App/Firestore e obter token OAuth da conta de serviço não é consultar usuários Firebase. Health não prova conectividade/IAM. Código de Auth do modo completo é preservado e não carregado no ramo demo.

## 9. IAM mínimo proposto — não aplicado

Arquivo infra/render/iam-demo-readonly.proposta.json sugere papel personalizado com **datastore.entities.get**, correspondente às leituras pontuais via DocumentReference.get/BatchGetDocuments do adaptador. Não pede list, create, update, delete, Auth, IAM, Storage, índice ou administração. A disponibilidade/suficiência exata do papel e possíveis permissões auxiliares de metadados precisam de validação real autorizada; não adicionar permissões por conveniência ao receber falha. Modelo não foi aplicado/testado contra IAM real.

roles/datastore.viewer é alternativa de leitura mais ampla para avaliação, não permissão mínima comprovada nem concessão automática. Não usar datastore.user/Editor/Owner. Firebaseauth.users.get era pertinente ao runtime completo com revogação; não é necessário pelo caminho atual de demonstração, pois não verifica tokens de usuário. Provisionador continua separado; criação de SA/chave/IAM exige autorização própria. IAM concedido no projeto pode permitir ler outros dados caso credencial seja extraída; não prometer isolamento por loja no IAM.

## 10. Render preparado

Serviço catalogos-api-homolog; repository LucasTech-Dev/Catalogos; branch main após revisão/sincronização autorizada; runtime Node.js 24.x; Root Directory backend no Git interno; Build npm ci; Start npm start; health /; Free/uma instância; Auto Deploy Off. Região Virginia continua proposta, não configurada. Secret File e env devem estar preparados com gate ativo antes da primeira publicação; criar serviço/salvar secret pode iniciar deploy. Nenhuma URL real fornecida ou inventada.

Revisar membros com poder de modificar código/env/deploy e dependências/scripts de instalação: secret é plaintext para o processo e não se presume isolamento exclusivo do build. Nunca imprimir env/arquivo/token, enviar pelo chat ou incluir em Git/imagem. Ignores/allowlist Docker existentes preservados. Rotação: nova chave aprovada, substituir secret/redeploy controlado/testar leitura e revogar anterior; apagar secret não revoga chave no Google. Nenhuma chave criada/baixada nesta tarefa.

## 11. Frontend sem persistência ou Auth

VITE_CATALOGOS_RUNTIME_MODE=public-readonly-demo e VITE_CATALOGOS_DEMO_LOJA_ID=loja-demo, junto de VITE_APP_ENV=homologacao e IDs/opt-in bancorestaurante explícitos. Mapa só pode conter loja-demo, host desconhecido falha. VITE_API_URL será URL real HTTPS aprovada; exemplo continua https://api.example.com, não publicável. Config parcial/Emulator/outro projeto/loja falha. Arquivo infra/render/bancorestaurante.web.env.example.

main.jsx seleciona import dinâmico da prévia DemoPublica; app completo não é iniciado. Páginas /, /cardapio e /produto exibem catálogo/filtro, sem adicionar ao carrinho. /carrinho, /checkout, /login, /cadastro, /perfil e /admin mostram indisponibilidade e não buscam dados. Não há mensagem de pedido concluído; afirma explicitamente que nenhum pedido foi criado. Nenhum link WhatsApp é oferecido.

Prévia usa somente fetch GET catálogo com credentials omit; não importa serviços de compra/Auth. Proteção adicional em firebase.js mantém auth null e não inicializa/listena sessão mesmo se alguém importar módulo completo com config Web presente; api.js recusa operações fora do GET público antes de fetch/sessão. SDK Web Auth/config API key não são necessários à prévia; flags de projeto continuam para validação e coerência. Signup/login por provedores do Firebase real continuam uma superfície independente da API/UI; não foram desabilitados ou testados externamente.

Modo completo/checkout funcional preservados fora da configuração demo; regressões React existentes foram executadas. Build emite chunks de código normal quando referenciados pelo bundler, mas a prévia não os inicia e backend permanece bloqueado independentemente do bundle. Cloudflare/SPA/configuração remota não publicados nem auditados nesta tarefa.

## 12. Rate limiting, consultas e tamanho

Demo limita catálogo a 60 requisições/minuto por peer TCP/processo, com 429/Retry-After; não confia em X-Forwarded-For. Health/preflight não consomem consultas. Máximo 71 documentos por carga aprovada (1 loja + até 20 categorias + até 50 produtos), sem varredura de coleção. DTO final máximo 64 KiB; excesso resulta 503 sem devolver corpo parcial. Não há paginação porque o conjunto é explicitamente limitado; mais produtos exige nova decisão/implementação.

Cache somente do DTO público por 30 s e single-flight coalescem requisições concorrentes por processo. Alteração/retirada de aprovação exige reiniciar com config revista; mudança de valor pode continuar visível até 30 s. Falhas não são cacheadas: limite de requisições ainda não é teto financeiro. Leitura de documento completo ocorre dentro do backend antes da projeção; não é field-level IAM nem aprovação automática do conteúdo.

Proxy Render pode agrupar visitantes no mesmo bucket. Sem proteção distribuída ou teste de topologia real. R-023/R-007 permanecem abertas. Fonte de imagens externa pode gerar tráfego do navegador; somente imagens públicas aprovadas, referrerPolicy no-referrer, sem buscas adicionais no backend.

## 13. CORS, headers e logs

Lista HTTPS exata do env validado, sem wildcard; exemplo autoriza https://catalogo-demo-cz1.pages.dev. Preflight só nos dois alvos e para GET/HEAD, Allow-Methods GET/HEAD/OPTIONS e Allow-Headers Content-Type. Origem negada é 403; rota bloqueada continua 404 genérico antes de consultar dados (navegador pode apresentar erro CORS nesse caso). Sem Origin ainda pode acessar superfície pública: CORS não é autenticação.

No-store, nosniff, sem x-powered-by, X-Request-ID e Retry-After preservados. Logs estruturados de acesso e erros sanitizados, sem body/URL/identidade/token; não imprimir listas/dados privados. Erros de rede/SDK respondem mensagem genérica. Timeout Web de 20 s pode expirar na retomada do Free de cerca de um minuto; retry manual só de leitura. Não simular pedido para resolver timeout.

## 14–18. Testes e builds

Resultados reais finais em docs/evidencias-ordem06/resumo.json e logs sanitizados:

| Verificação | Resultado |
| --- | --- |
| 14. Backend | 342/342 |
| 15. React | 92/92, oito arquivos; 11 testes específicos da prévia |
| 16. Infraestrutura | 7/7 |
| 17. Emulator | Novo teste demo e regressões 19–23, exit 0 |
| 18. Build | Normal e modo demo explícito aprovados, saídas /tmp |

 Novos testes cobrem: health/HEAD, catálogo aprovado, projeção mínima/categorias/ativos, outra loja, todos os 41 contratos não permitidos/15 escritas, aliases/traversal/query/métodos, config incompleta/divergente/Emulator, app sem carregamento privado/Auth, nenhum acesso indevido/escrita, aprovação 0 sem consulta, limites/cache/CORS/erros e resposta grande.

Frontend cobre filtro, GET sem credencial, seis páginas privadas sem fetch ou pedido, configuração parcial/diferente, Auth desligado mesmo com API key fictícia, cliente API defensivo e retry sem expor erro. Infra cobre exemplo demo bloqueado por padrão, modo obrigatório quando houver opções demo, ignores e proposta IAM sem escrita/Auth.

Emulator novo usa fábrica idêntica de app com capacidade get-only, Firestore local e projeto demo-; escreve apenas fixtures nesse projeto fictício. Confirma health/catálogo, 41 contratos bloqueados/outra loja, leituras indevidas ausentes, fixtures intactas e zero pedidos. Testar fábrica com dados emulados não permite habilitar produção com Emulator: guardas de startup recusam esse conjunto. Regressão 19–23 do app completo executada no mesmo ambiente separado em processos próprios. Nenhum token/credencial real de bancorestaurante usado.

Build normal e build com modo demo explícito feitos em /tmp, preservando dist. Config do build demo usa URL/valores públicos fictícios e não faz deploy nem consulta API. SDK/IAM/montagem de secret reais não são comprovados por builds/testes. Logs brutos CLI/Emulator podem conter env e tokens locais e não são distribuídos; somente marcos sanitizados entram nas evidências.

## 19–20. Documentação e fluxo

Criado este relatório. Atualizados IMPLANTACAO_RENDER_HOMOLOGACAO, PREPARACAO_RENDER_BANCORESTAURANTE, ARQUITETURA_DEFINITIVA, GUIA_MESTRE, REGISTRO_DE_TRABALHO e RESSALVAS_E_PENDENCIAS_PRODUCAO. Auditoria 05 permanece histórico; A05-01/03 têm correção HTTP local condicionada ao modo, não prova de configuração real.

Oito documentos externos de arquitetura/hospedagem/fluxo e guia consolidado recebem nota da Ordem 06, preservando histórico, sem tocar arquivos privados de senhas ou preços/planos comerciais. Fluxo novo: Cloudflare Pages → React demo sem Auth/checkout → HTTPS → Render → Express somente leitura → catálogo aprovado da loja-demo → Firestore bancorestaurante → DTO público → React. Pedidos/login/admin/outras lojas bloqueados na primeira publicação; descrições completas anteriores continuam funcionalidades desenvolvidas para ambientes completos, não liberação pública atual.

## 21. Arquivos alterados nesta ordem

Código: backend/src/app.js (seleção), config/ambiente.js e novo config/demoPublica.js; novos demo/app.js e demo/catalogo.js. Teste novo backend/test/demoPublica.test.js; script backend/scripts/demo-readonly-emulator.js. Frontend: main.jsx, lib/ambienteAplicacao.js, lib/firebase.js, services/api.js; novos lib/runtimeDemo.js, pages/DemoPublica.jsx e test/demoPublica.test.jsx. Infra: exemplos bancorestaurante backend/Web, novo iam-demo-readonly.proposta.json, teste configuracoes.test.cjs. Documentos acima e evidencias-ordem06. Demais diffs do Git são históricos, preservados conforme inventário inicial; não absorvidos em commit.

## 22. Riscos residuais e bloqueios de publicação

Dados reais não aprovados: catálogo segue bloqueado no exemplo. SA/chave/IAM efetivos inexistentes/não comprovados, permissões herdadas precisam revisão, montagem Secret File ainda sem evidência, política de rotação e proteção de operadores pendentes. Texto/imagem de registro aprovado pode ser alterado externamente: exige nova revisão. Backend HTTP sem escrita não impede uso indevido de uma credencial ampla fora do gate. Auth Web real tem política própria; não alterada aqui. Rules/índices e dados existentes não consultados/modificados.

Cotas/custo de leituras, imagens, egress e Render Free não garantem custo total zero; limite por peer/processo não é borda distribuída. Cache de 30 s tem janela de atualização. Free pode dormir, reiniciar e exceder timeout Web. Não há GO comercial ou integração real comprovada.

## 23. Ressalvas

Preservados 25 IDs, 16 abertas e nove resolvidas localmente; R-025 mantém estado anterior. R-023/R-007 continuam abertas. R-005 (estado Rules/índices), R-006 (identidade/IAM) e integração/configuração/custos/hosting continuam pendentes. A05-01/03 tratados localmente no modo demo e cobertura de limites do catálogo reduz A05-02 nesse ramo; listagens do modo completo permanecem e não foram refatoradas. Não encerrar ressalva externa por aprovação de código/mocks. Java temporário permite ensaio mas não encerra reprodução permanente R-011.

## 24. Estado real de publicação

Sem stage, commit, push, deploy, criação de Web Service, IAM, chave ou alteração Firebase/Cloudflare. HEAD continua 19b554d. URL API real ainda não fornecida. Frontend visual remoto é informação anterior do proprietário; configuração real não comprovada nesta ordem.

## 25. Próximo passo necessário

Revisar este diff e a configuração de primeira publicação. Depois autorizar separadamente: revisão limitada dos dados publicáveis/IDs da loja-demo e metadados IAM, definição/validação da identidade somente leitura, geração/upload de credencial aprovada, revisão/commit/push, criação Render com gate já ativo e smoke de leitura. Só então integrar/publicar prévia Cloudflare com flags corretas e URL real. Não avançar para pedidos/admin/escrita nem alterar para full no serviço de demonstração. Aguardar revisão do proprietário.


## Ordem 07 — auditoria real de leitura — 15/10/2026

Relatório vigente: [VALIDACAO_DADOS_PUBLICOS_RENDER.md](VALIDACAO_DADOS_PUBLICOS_RENDER.md). Consulta autorizada ao projeto confirmado bancorestaurante, banco Native (default), região existente nam5, com ADC de usuário (e-mail nominal não identificado, impróprio como identidade Render). Foram 16 documentos únicos: loja-demo, quatro categorias e 11 produtos; 17 obtenções com releitura projetada de ativo da loja. Sem clientes/endereços/pedidos/ADM/usuários, outras lojas, escrita ou documentos completos nos relatórios.

Bloqueador crítico A07-01: Rules efetivamente publicadas diferem do deny-all local e permitem read sem autenticação também em clientes, endereços, pedidos e ADM da loja-demo; create/update têm apenas condições de campos, sem request.auth. Não foram exploradas permissões nem consultados documentos privados; isso não prova vazamento ocorrido. A API demo e IAM de leitura não corrigem acesso direto Firestore. Nenhuma Rule foi alterada.

Nove produtos e três categorias são candidatos técnicos, sem aprovação de publicação. A07-02: campo ativo ausente na loja impede catálogo (503). A07-03: seis URLs de imagem com query são omitidas pelo DTO, sem acesso remoto. A07-04: disponivel ausente nos 11 produtos é interpretado como true pelo código e requer confirmação. Listas preservadas vazias e CATALOGOS_DEMO_CATALOG_APPROVED=0.

SA proposta catalogos-api-demo-readonly não localizada (404); sem concessões diretas ao alvo na policy consultada, herança/permissões efetivas não comprovadas. datastore.entities.get atende à leitura pontual pela referência oficial, sem escrita/Auth; papel personalizado ainda é proposta, não isola por loja. Zero índices compostos nos grupos produtos/pedidos, sete locais ausentes; demo pontual dispensa esses índices. Evidências sanitizadas em evidencias-ordem07.

Fluxo preparado continua Cloudflare React demo → HTTPS/Render somente leitura → Admin SDK/IAM → catálogo aprovado loja-demo → DTO; o caminho direto do Web SDK obedece às Rules publicadas e apresenta risco independente. Nenhum push/deploy, credencial, IAM, alteração Firebase ou Cloudflare. Próxima fase exige autorização específica, priorizando correção/testes das Rules antes de liberar catálogo. Preservadas 25 ressalvas, 16 abertas/nove resolvidas localmente; R-005/R-006/R-007/R-023 abertas; vendas comerciais não liberadas. Os achados A07 não criam novos IDs R.
