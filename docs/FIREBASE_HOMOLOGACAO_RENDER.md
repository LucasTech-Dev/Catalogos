# CATÁLOGOS — FIREBASE DE HOMOLOGAÇÃO E ADAPTAÇÃO PARA RENDER

> Decisão posterior vigente: preparar bancorestaurante, sem projeto/banco novo. Roteiro anterior preservado como histórico; consultar [PREPARACAO_RENDER_BANCORESTAURANTE.md](PREPARACAO_RENDER_BANCORESTAURANTE.md).

Ordem de Preparação 03 — 15/10/2026, America/Sao_Paulo. **Preparado localmente; não implantado.** Esta ordem não autoriza recursos externos, chaves, IAM, escrita real, commit, push, deploy ou Cloudflare. Projeto proposto `catalogos-homolog-2026`, nome `Catálogos Homologação`: disponibilidade e existência não verificadas. `bancorestaurante` permanece intacto.

## 1. Estado inicial do Git

Git interno em Catalogo-Demo/Catalogo-demo, branch main, HEAD 19b554d; oito commits à frente de origin/main local b8e2a4b, conforme referência já consultada na Ordem 02. Nesta ordem não foi atualizada a referência remota. Executados status, branch, log -12, remote -v, diff --stat e diff --check antes das edições. Inventário inicial e oito hashes em [evidencias-ordem03](evidencias-ordem03/).

Commits ainda não enviados: 2c06313 (implementação 19/20), 0b1ec3d (registro 19/20), c2a0cbf (21), 9122f01 (22), 77c8bb7 (23), 949f992 (24), 792b069 (25), 19b554d (Cloud Run). Relatórios/manuais/evidências 26, R-025, ajustes de ignores/CI/exemplos e preparação Render estavam pendentes. Alterações históricas foram preservadas. Não usar o Git externo vazio de /home/lucas/Projetos/Catalogos para publicar.

## 2. Arquitetura identificada

API Express 5 compartilhada, Node 24, Admin SDK 14.5; React/Vite no frontend. Contexto de loja vem de parâmetros e autorização no backend e mapa explícito de hostname no frontend. Não há backend por restaurante, papel superadmin ou nova lógica de pedidos nesta ordem. Cloud Run permanece alternativa histórica/futura; Render é a escolha atual para primeira homologação.

Fluxo preparado: navegador → Cloudflare Pages → React → HTTPS → Render → Express → middleware de autenticação/loja → controller → service → Admin SDK → Authentication/Firestore de homologação → API → React. Ainda depende de recursos externos.

## 3. Inicialização Firebase encontrada

config/firebase.js chamava validarAmbiente, initializeApp e applicationDefault, ou dispensava credencial no Emulator; reutilizava primeiro app existente. server.js já validava PORT, escutava 0.0.0.0 e tratava SIGTERM. app.js carrega Firebase antes de montar rotas. Auth usa getAuth().verifyIdToken(token,true) e consulta usuarios/{uid}; Firestore usa getFirestore() do mesmo app/projeto.

## 4. Problema original no Render

Render não herda ADC do computador. O guarda anterior proibia arquivos em todos os ambientes externos; o runtime gratuito não tem uma identidade Google gerenciada comprovada. Apenas inicializar SDK/retornar health não prova IAM nem conexão com banco. Não usar APP_ENV development para contornar guardas.

## 5. Alternativas avaliadas e fontes oficiais

A — OIDC/WIF: [Render OIDC](https://render.com/docs/oidc) exige workspace Pro ou superior e lista AWS, Anthropic e OpenAI; Google/Free não está documentado como integração pronta. [Google WIF](https://docs.cloud.google.com/iam/docs/workload-identity-federation) requer fonte/trust/IAM compatíveis. Não implementado nem assumido como suportado.

B — [Secret Files Render](https://render.com/docs/configure-environment-variables): mecanismo documentado para Web Services, arquivo em /etc/secrets/nome e também na raiz no runtime nativo. A documentação não condiciona esse recurso a plano pago e a lista de [limitações Free](https://render.com/docs/free) não o exclui. Isso sustenta a escolha técnica para Free; acesso/disponibilidade na conta e montagem/permissões reais ainda exigem verificação no painel autorizado. Não houve teste remoto. Arquivo é plaintext disponível ao processo; não é cofre imune a código/dependências comprometidos.

C — Identidade gerenciada em Cloud Run: alternativa sem chave, preservada no modo managed e planejamento histórico. Implica outro provedor e seus requisitos/custos, não foi implantada. Não adicionamos intermediário AWS/servidor de tokens só para evitar chave.

## 6. Estratégia recomendada

Para a homologação Free solicitada: conta de serviço exclusiva do projeto fictício separado, identidade esperada explícita e chave futura em Secret File privado chamado firebase-homologacao.json. **Somente suporte local implementado; nenhuma chave gerada ou baixada.** Uso real exige aprovação posterior, IAM mínimo e rotação definida. Se política organizacional proibir chaves, não contornar: reavaliar hospedagem com identidade gerenciada.

## 7. Código e configurações alterados nesta ordem

| Arquivo | Motivo |
| --- | --- |
| backend/src/config/ambiente.js | Allowlist explícita de projeto homolog, modo e conta; rejeita mistura com produção/Emulator |
| backend/src/config/credencialHomologacao.js | Novo loader restrito e inicialização injetável para testes sem credenciais |
| backend/src/config/firebase.js | Usa a inicialização validada, preservando ADC gerenciada/Emulator |
| backend/src/server.js | Falha antes do listen com log genérico, sem stack ou conteúdo privado |
| backend/test/credencialHomologacao.test.js | Oito testes de identidade, falhas, fixtures, Emulator e startup |
| backend/test/pedidoHttpAutenticado.test.js | Mock informa projeto do app; caso explícito de recusa administrativa entre lojas |
| demo/src/lib/ambienteAplicacao.js e demo/test/ambientes.test.js | Projeto homolog permitido também no frontend; recusa bancorestaurante |
| backend/fixtures/homologacao.json | Plano fictício com duas lojas, documentos de usuários/categorias/produtos/clientes/endereços |
| backend/scripts/homologacao-dry-run.js | Simulação determinística sem SDK, rede ou opção de escrita |
| infra/render/homologacao.backend.env.example | Novo modelo Render, sem credencial |
| infra/ambientes/homologacao.*.env.example | Modelos gerenciado/Web coerentes com os novos guardas |
| infra/cloud-run/homologacao.env.yaml.example | Modo managed e ID permitido para manter alternativa futura coerente |
| backend/.env.example, .gitignore, backend/.dockerignore | Referência ao modelo e exclusão adicional do secret/secrets |
| infra/test/configuracoes.test.cjs | Exemplo Render validado e exclusão Git comprovada |

CI existente continua somente validação, sem secrets/id-token/deploy. Nenhuma mudança desta ordem em workflow ou scripts npm; alteração já presente no workflow é anterior, conforme status inicial.

## 8. Guardas preservados e fortalecidos

Mantidos HTTPS/CORS exato, limites/logs obrigatórios externos, NODE_ENV production, proibição de Emulator externo, correspondência de projeto e recusa de GOOGLE_APPLICATION_CREDENTIALS externo. Modo render-secret-file só em APP_ENV homologacao; produção comercial rejeita projeto catalogos-homolog-*, allowlist e conta de homologação. Nenhuma alteração em validação de pedidos, roles, revogação, titularidade ou transações.

Loader lê somente /etc/secrets/firebase-homologacao.json, sem caminho configurável. O_NOFOLLOW recusa link simbólico final; O_NONBLOCK evita bloquear em FIFO; fstat exige arquivo regular, leitura limitada a 64 KiB, JSON service_account e projeto/email exatos, chave e ID não vazios. SDK cert valida a chave antes do listen. Não usa token_uri/outros endpoints arbitrários do JSON. Exceções não preservam mensagem/cause privados. App prévio é rejeitado no modo secret; outros modos verificam projectId antes de reutilizar app. Falta de secret ou chave inválida impede startup; health não mascara o erro.

A validação local verifica estrutura/identidade declarada e formato criptográfico aceito pelo SDK, não atesta remotamente que o par chave/conta está ativo ou tem IAM suficiente. Isso exige teste externo autorizado. Montagem Render por symlink seria recusada: conferir esse detalhe real antes do GO; não relaxar a proteção silenciosamente.

## 9. Separação de ambientes

| Ambiente | Identidade e dados | Configuração |
| --- | --- | --- |
| Desenvolvimento | Comportamento local legado preservado; real somente se aprovado | APP_ENV development; exemplos locais priorizam Emulator |
| Emulator | Ambos hosts locais, ID demo-; sem ADC/secret | APP_ENV test; Auth 9099/Firestore 8080; API em porta diferente |
| Render homolog | Secret dedicado, projeto catalogos-homolog-* permitido explicitamente | APP_ENV homologacao; NODE_ENV production; modo render-secret-file |
| Homolog gerenciada futura | ADC da plataforma, sem arquivo | Mesmo projeto permitido e modo managed explícito; não é solução Render Free |
| Produção futura | Não configurada/provisionada; identidade e projeto próprios | Modo secret homolog proibido; guardas existentes mantidos |

O fallback histórico bancorestaurante só permanece no desenvolvimento quando sem projeto para preservar comportamento anterior. **Homologação nunca usa esse fallback**: exige três IDs explícitos correspondentes e prefixo dedicado. Não iniciar development em hosting para obter esse fallback.

## 10. Proteção contra projeto incorreto

GCLOUD_PROJECT = FIREBASE_EXPECTED_PROJECT_ID = FIREBASE_HOMOLOG_PROJECT_ID. Prefixo permitido catalogos-homolog-, comprimento até 30; ID proposto catalogos-homolog-2026. Se ID indisponível, proprietário deve aprovar outro ID e atualizar os três campos, email, Web e roteiro. Alterar só um campo falha. JSON project_id e client_email devem corresponder ao projeto e conta esperados; authorized_user pessoal e credencial de outro projeto são recusados. O projeto real existente não foi consultado nem alterado.

## 11. Configuração Render preparada

Repository LucasTech-Dev/Catalogos; branch main após revisão e sincronização autorizadas; Name catalogos-api-homolog; Root Directory backend relativo ao Git interno; Runtime Node; engines 24.x (local .nvmrc 24.19.0); Build npm ci; Start npm start; Free; uma instância; health /; Auto Deploy Off; Virginia proposta, a confirmar na conta. [Versão Node](https://render.com/docs/node-version). Nenhum serviço criado; instalação limpa no Render não executada.

Modelo completo: [homologacao.backend.env.example](../infra/render/homologacao.backend.env.example). Não é aplicado automaticamente, não há YAML que crie recursos por engano.

## 12. Modelo sem segredos e gestão da identidade

Variáveis backend efetivamente lidas:

```dotenv
APP_ENV=homologacao
NODE_ENV=production
GCLOUD_PROJECT=catalogos-homolog-2026
FIREBASE_EXPECTED_PROJECT_ID=catalogos-homolog-2026
FIREBASE_HOMOLOG_PROJECT_ID=catalogos-homolog-2026
FIREBASE_CREDENTIAL_MODE=render-secret-file
FIREBASE_SERVICE_ACCOUNT_EMAIL=catalogos-api-homolog@catalogos-homolog-2026.iam.gserviceaccount.com
CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev
RATE_LIMIT_MODE=enforce
HTTP_LOG_ENABLED=1
```

PORT é fornecida pelo Render; não configurar GOOGLE_APPLICATION_CREDENTIALS nem hosts Emulator. FIREBASE_SERVICE_ACCOUNT_EMAIL é identidade pública esperada, não a chave. Nenhum conteúdo de credencial em exemplos, VITE_*, logs ou Git. O esquema futuro precisa de type=service_account, project_id, client_email, private_key_id e private_key; não há JSON com material privado no repositório.

Acesso: reduzir membros capazes de gerenciar serviço/Environment e acesso ao repositório/deploy. Pessoas com edição de código/deploy podem exfiltrar secret pelo runtime mesmo sem botão de visualização; revisar papéis efetivos do workspace antes do GO. Não presumir mascaramento como barreira de segurança. Secret Files não devem ser compartilhados com ambiente de produção ou grupos amplos.

Build: mecanismo nativo também disponibiliza o arquivo na raiz; não assumir isolamento exclusivo em runtime. Não adicionar cat/env/printenv, upload de workspace ou credenciais a scripts npm. npm ci segue comando solicitado, mas scripts de dependências são código com potencial de acesso: revisar lock/origem e logs antes de adicionar segredo. .dockerignore mantém allowlist restrita e exclui nome fixo; Docker futuro tem mecanismo de secrets próprio, não copiar secret na imagem. .gitignore exclui nome fixo e secrets/, ADC e chaves; scan textual não prova ausência de todos os formatos de segredo.

Rotação posterior: responsável registra somente ID da chave/data/conta, aprova nova chave, substitui Secret File, realiza redeploy manual e teste fictício; confirma credencial nova e então revoga a antiga. Em comprometimento, revogar imediatamente, suspender operações e revisar acesso/logs sem publicar valores. Apagar arquivo no Render não revoga chave Google; remover chave Google e secret são ações distintas. Proibição organizacional de geração de chaves é bloqueio a respeitar, não remover automaticamente.

## 13. Roteiro posterior no Firebase Console — não executado

Todas as linhas exigem nova autorização. Caminhos podem variar conforme UI; sempre conferir ID no seletor. Não selecionar bancorestaurante.

| Ação/local | Opção e valor sugerido | Consequência e verificação | Faturamento | Permissões candidatas | Risco e reversão |
| --- | --- | --- | --- | --- | --- |
| Firebase Console → Adicionar projeto | Catálogos Homologação; editar ID para catalogos-homolog-2026, se disponível | Cria projeto separado; verificar ID antes de confirmar | Começar Spark se elegível; não associar billing | Criador de projeto na organização/conta | ID não é renomeável; deletar projeto é destrutivo e não equivale a renomear |
| Se projeto foi criado no Cloud Console → Firebase → Adicionar Firebase | Selecionar somente novo ID aprovado; Analytics dispensável nesta ordem | Habilita Firebase no projeto; verificar Project settings | Não habilitar Analytics/serviços adicionais por conveniência | Permissões de criação/adição Firebase apropriadas | Habilita serviços; não presumir reversão completa sem efeito |
| Firebase → Uso e faturamento | Spark para escopo básico Auth/Firestore quando elegível | Verificar plano e cotas da conta | Blaze somente se recurso necessário exigir e dono aprovar; billing muda plano | Administrador de faturamento se associação futura | Blaze pode cobrar por consumo; alertas não são teto; downgrade depende dos recursos |
| Build → Firestore Database → Criar banco | Standard/Native, banco (default); modo produção | Cria banco usado por getFirestore(); verificar ID e Rules negando cliente | Uma base elegível com cotas grátis; confirmar Console | Provisionador Firestore, não runtime | Localização não muda após criação; exclusão destrutiva |
| Tela de localização do banco | us-east4 proposta para avaliar proximidade com Render Virginia; confirmar disponibilidade e requisitos | Escolha antes de criar; registrar localização real | Cotas/tarifas e transferência variam por região | Mesmo provisionador | Região fixa; não prometer mesma zona física ou latência sem medir |
| Build → Authentication → Começar → Sign-in method | Email/Password e Anonymous usados pelo código atual; demais desligados | Habilita login/admin e sessão pública; verificar provedores | Verificar quotas Auth/Identity Platform; SMS não faz parte desta ordem | Provisionador com atualização de Auth | Abuso de cadastro/anonimato; pode desabilitar provedor, sem apagar contas |
| Authentication → Settings → Authorized domains | catalogo-demo-cz1.pages.dev e somente prévias aprovadas; localhost só se necessário | Permite fluxos Web no domínio escolhido; confirmar host exato, sem https/path | Sem recurso pago adicional presumido; conferir plano | Atualização config Auth | Domínio autorizado não concede role; remover domínio é reversível, pode interromper login |
| Project settings → General → Your apps → Web | App catalogos-web-homolog; copiar apenas config pública | Fornece projectId/apiKey/authDomain/appId; comparar com projeto aprovado | Registrar app não exige Hosting Render/Firebase | Criar app Web Firebase | Publicar config errada mistura sessões; reconfigurar/rebuild com aprovação |
| Authentication → Users → Add user | Admin e cliente fictícios, email de teste controlado; senha única fora dos documentos | Criar identidades separadas e registrar UIDs corretos | Dentro das cotas aprovadas | Operador com criação de usuários, separado do runtime | example.invalid é placeholder sem entrega; não disparar email; excluir/desativar revoga acesso conforme operação |
| Firestore → Data, via operador aprovado | usuarios/{UID_AUTH}: role admin/cliente, lojaId e ativo true; clientes no UID correspondente | Backend lê role no documento, não no domínio/email; verificar UID/loja A/B | Cada escrita/leitura conta para cota | Escrita dados somente no projeto dedicado | Admin atribuído incorretamente concede poder; revogar role/ativo e sessão; não criar superadmin |
| Firestore → Data ou importação revisada | Plano backend/fixtures/homologacao.json, com UIDs mapeados | Duas lojas/categorias/produtos/clientes/endereços; verificar referências | Operações consomem quota | Operador de fixtures, com autorização de escrita própria | Não importar direto placeholders para Auth diferente; não criar pedidos/WhatsApp |
| Firestore → Rules e Indexes | Rules deny-all de firebase/firestore.rules; sete índices de firebase/firestore.indexes.json após revisão | SDK Web sem acesso; índices devem ficar READY e queries reais funcionar | Índices/armazenamento/operações podem consumir cota | Administrador de Rules/índices | Rules não limitam Admin SDK; mudanças podem interromper leitura; reverter versão aprovada, índices precisam reconstrução |
| Project settings → Service accounts / Cloud Console IAM | Seguir roteiro IAM abaixo, sem usar conta pessoal ou Editor | Identidade runtime exclusiva e sem privilégios de provisionamento | IAM básico não exige Blaze por si; verificar políticas | Provisionador IAM específico | Chave compromete dados; revogação/rotação obrigatória |

Fontes: [planos Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firestore](https://firebase.google.com/docs/firestore/quickstart), [Auth anônima](https://firebase.google.com/docs/auth/web/anonymous-auth), [domínios/localhost](https://firebase.google.com/docs/auth/faq-and-troubleshooting). Associação de billing não autorizada; não incluir Functions/Storage/SMS/backup/PITR/TTL por presumir cobertura Spark.

## 14. Roteiro IAM e secret — não executado

1. Cloud Console → seletor do projeto novo → IAM & Admin → Service Accounts → Create. Nome catalogos-api-homolog; email esperado acima. Identidade runtime distinta da identidade do operador. Verificar ID/email sem gerar chave nesse passo. Candidato de provisionador: Service Account Admin, restrito ao novo projeto; papel não é para runtime.
2. IAM do novo projeto: propor roles/datastore.user para operações de documentos/transações; criar papel personalizado apenas com firebaseauth.users.get para verifyIdToken(token,true). Validar disponibilidade/suficiência com fixtures. [IAM Firestore](https://firebase.google.com/docs/firestore/security/iam), [permissões Auth](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaseauth). Não conceder Firebase Admin, Owner, Editor, Auth Admin ou criação de usuários ao runtime. Se faltar uma permissão, investigar chamada exata e pedir concessão específica, sem ampliar automaticamente.
3. Quem provisiona precisa de permissões próprias para criar SA/papel e definir policy (por exemplo iam.serviceAccounts.create, iam.roles.create e resourcemanager.projects.setIamPolicy). Runtime não recebe essas permissões. IAM de projeto permite alcance amplo no banco; isolamento por loja continua obrigatório na API.
4. Somente após autorização específica de chave: Service Accounts → conta exclusiva → Keys → Add key → Create new key → JSON. Verificar política organizacional e iam.serviceAccountKeys.create; não desativar restrições. Essa operação gera material privado, portanto NÃO foi executada. O download deve ficar fora do Git/backups públicos, com acesso local restrito e remoção segura conforme política do dono.
5. Render → serviço aprovado → Environment → Secret Files → Add Secret File → nome exato firebase-homologacao.json. Upload manual privado pelo operador; nunca pelo chat/Git. Confirmar conta/projeto antes de salvar. Salvar secret pode iniciar deploy, mesmo com Auto Deploy Off; fazer somente na janela explicitamente autorizada. Guardar apenas recibo sem valor privado.
6. Confirmar serviço acessa arquivo regular no caminho fixo; inicialização deve falhar se ausente/incorreto. Free não oferece shell/SSH; usar status/log genérico e smoke autorizado, sem criar endpoint de diagnóstico ou imprimir arquivo. Validar IAM com consultas/fixtures e autenticação reais somente quando autorizado.
7. Verificar políticas efetivas e permissões herdadas antes do GO. Revogar permissões ou deletar SA/chave é reversível apenas parcialmente; chave apagada não é recuperada, precisará de nova chave aprovada. Alterar IAM é remoto e exige ordem própria.

## 15. Dados fictícios reutilizáveis

[Fixtures](../backend/fixtures/homologacao.json): 14 documentos determinísticos, sete para loja-homolog e sete para loja-homolog-b. Incluem usuarios/admin-homolog[-b], usuarios/cliente-homolog[-b], categorias/refeicoes, produtos/prato-teste, clientes/{uid} e enderecos/endereco-teste. Campos correspondem aos schemas atuais; tests validam loja/categoria/produto/endereço e referências. Datas opcionais ausentes, sem strings que imitem Timestamp. Não existe coleção empresas ou senha no Firestore.

UIDs no plano são placeholders de identidades Auth ainda inexistentes: usar UIDs fixos aprovados por provisionamento controlado posterior ou mapear todos os caminhos para UIDs gerados pelo Console. Nunca importar o JSON como backup de produção. Emails example.invalid não recebem mensagens. Telefones/WhatsApp foram omitidos para evitar qualquer destino real; preencher somente dados de teste autorizados quando necessários ao perfil/checkout. Sem pedidos persistidos no plano; cenários de pedido usam testes existentes no Emulator. Configuração comercial fictícia é independente de preços/planos comerciais do produto, que não foram alterados.

Simulação disponível:

```bash
cd backend
node scripts/homologacao-dry-run.js --project catalogos-homolog-2026
```

Não importa Admin SDK, não usa rede, não escreve arquivo/banco e não aceita --write. Recusa projeto ausente/fora do prefixo dedicado, incluindo bancorestaurante. IDs determinísticos evitam duplicação no plano; nenhum seed externo implementado. Uma futura ferramenta de escrita deve exigir projeto/confirmacão explícitos, precondições/idempotência e autorização própria antes de ser executada.

## 16. Proteções multi-loja

Admin: ID Token revogado/expirado é recusado; usuario deve estar ativo e role admin, com lojaId igual ao parâmetro. Produto/categoria/pedido/cliente/endereço são buscados na árvore da loja; operações de cliente exigem titularidade conforme contrato. Caso novo cobre GET sessao/produtos/clientes/pedidos e PATCH loja por admin de outra loja, 403 sem mutação. Suíte histórica cobre demais métodos e papéis. Cliente público pode visitar várias lojas e tem perfil por loja; isso não concede administração. Hostname/CORS não substituem vínculo/role. Sem painel global introduzido.

CORS proposto exato https://catalogo-demo-cz1.pages.dev; chamadas sem Origin também podem existir. Limiter atual usa socket peer e UID, é local por processo: proxy Render pode agrupar clientes. Não foi mudado trust proxy nem inferido IP de header arbitrário. R-007/R-023 permanecem abertas; proteção distribuída e teste NAT/proxy/abuso real continuam requisitos antes de liberar operações.

## 17. Frontend/Cloudflare

Configuração pública futura: VITE_APP_ENV=homologacao, VITE_FIREBASE_PROJECT_ID/VITE_FIREBASE_EXPECTED_PROJECT_ID/VITE_FIREBASE_HOMOLOG_PROJECT_ID iguais ao projeto dedicado; VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN e VITE_FIREBASE_APP_ID do app Web novo. VITE_API_URL será a URL HTTPS real do Render validado; ela ainda não existe. Modelo em [homologacao.web.env.example](../infra/ambientes/homologacao.web.env.example) usa domínio example fictício, nunca endereço inventado Render.

VITE_LOJAS_POR_HOST seleciona loja-homolog pelo host catalogo-demo-cz1.pages.dev e loja B por host de exemplo, ou VITE_LOJA_ID explícito para loja única. Host desconhecido falha. Backend confirma escopo independentemente do bundle. Auth atual obtém sessão anônima para visitante, email/password para conta; onIdTokenChanged limpa dados de outra sessão, API envia ID Token, checkout usa chave idempotente e recuperação sem duplicar pedido. Não compartilhar sessões/config antiga ao trocar projeto sem validar limpeza. Authorized Domains no Console não é CORS da API; configurar ambos.

API tem timeout de 20 s, pode expirar na retomada de aproximadamente um minuto do Free; UX real de retomada requer teste, sem reenviar escrita fora do contrato idempotente. Checkout calcula no servidor e obtém link WhatsApp da API a partir do pedido persistido; gerar URL não envia mensagem, não comprova pagamento/recebimento. Não abrir WhatsApp real nesta ordem. URLs de pedido incluem loja/UID autorizados, não credencial Admin. Cloudflare não foi republicado nem seu estado remoto inspecionado; frontend visual publicado é informação do proprietário.

## 18–22. Testes

Linha de base anterior às mudanças: backend 325/325; React 79/79 em sete arquivos; infraestrutura 3/3; build aprovado (1.624 módulos). Depois: backend 334/334, React 80/80 em sete arquivos, infraestrutura 4/4; build aprovado (1.624 módulos). Nenhum teste novo usa Firebase real.

Novos casos: configuração homolog válida; ausência/divergência de projeto; bancorestaurante recusado; modo/conta ausentes ou incorretos; arquivo ausente/leitura inválida; JSON inválido, authorized_user, projeto/email errados, chave ausente/formato inválido; app prévio/identidade indevida; Emulator sem secret/ADC; produção não aceita copiar config homolog; erros sem segredo/cause; startup sem listen em configuração inválida; fixtures determinísticas/válidas; administração A/B sem mutação; exemplo Render sem segredo e Git ignores efetivos.

As primeiras execuções revelaram um caminho incorreto no teste novo e o mock antigo sem options.projectId, incompatível com a validação nova de app já inicializado. Ambos corrigidos; repetição direcionada e suíte completa aprovadas. Nenhum guarda foi removido para acomodar o mock.

Emulator: Java 21 temporário encontrado em /tmp/catalogos-java21; JAR local em /tmp/catalogos-firebase-emulators. Não houve instalação permanente. Execução da suíte etapa23 (inclui 19–23) em projeto demo-catalogos-emulator com Auth/Firestore locais; concluída com exit 0; etapas 19–23 aprovadas, conforme evidência sanitizada. Primeira tentativa tentou baixar JAR no cache padrão e foi interrompida para reutilizar o cache existente. Logs brutos Emulator podem conter tokens de teste e permanecem fora do Git; somente resumo sanitizado será entregue. Emulator não prova IAM, índices obrigatórios ou custos no Firebase real.

Builds locais usam --outDir /tmp/catalogos-ordem03-before-build e /tmp/catalogos-ordem03-after-build para preservar dist existente. Não houve publicação. Instalação Render, montagem de secret, autenticação válida no projeto dedicado e navegador em hosting real ainda não foram testados.

## 23–25. Documentação e fluxos atualizados

Criado este documento; atualizados IMPLANTACAO_RENDER_HOMOLOGACAO, ARQUITETURA_DEFINITIVA, MANUAL_IMPLANTACAO, MANUAL_DESENVOLVIMENTO, GUIA_MESTRE, REGISTRO_DE_TRABALHO e RESSALVAS_E_PENDENCIAS_PRODUCAO. Ordem 02 preservada como histórico com nota posterior substituindo seu bloqueio técnico por suporte local condicionado. Cloud Run mantém histórico e recebe exemplo coerente com novo guarda, não é a decisão atual.

Oito documentos externos recebem nota posterior da Ordem 03, preservando seções: ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt; GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt; DOCUMENTO_CONSOLIDADO_EscopoGeral_ProjetoCatalogoLoja.txt; ESCOPO DO CLIENTE.txt; EtapasDeProducao_BaseFixo.txt; INDICE_DOCUMENTACAO_ATUAL.md; MANUAL_PERSONALIZACAO_ATUAL.md; CHECKLIST_COMERCIAL_PILOTO.md. Arquivos sanitizados de contas/senhas e snapshot codigoEestrutura.txt não foram abertos/alterados. Não houve modificação de preços ou planos comerciais.

Fluxos diferenciados: catálogo público resolve host/loja e busca projeções; login Firebase obtém token e API verifica revogação/usuário; admin exige role/atividade/vínculo; carrinho fica no React e checkout envia IDs/quantidades, servidor recalcula/transaciona/idempotência, persiste snapshot e gera link WhatsApp somente sob solicitação; multi-loja valida parâmetros e titularidade. Erros retornam JSON seguro com correlação e logs mínimos. Admin secret apenas no backend. Ambientes mantêm projetos/identidades separados.

| Evidência | Estado |
| --- | --- |
| Contratos Express, Auth, multi-loja, checkout | Implementados no código local, regressões aprovadas |
| Loader Secret File, allowlist, exemplos e fixtures | Preparados/testados localmente, sem credencial real |
| Projeto, Auth, Firestore, SA, IAM, Rules/índices publicados | Dependentes de criação externa autorizada |
| Frontend visual Cloudflare | Publicado segundo proprietário; configuração remota não auditada |
| Render e integração Firebase dedicada | Não implantados/comprovados |

## 26. Ressalvas

Totais preservados: 25 IDs, 16 abertas e nove resolvidas localmente; R-025 conforme estado anterior. R-023 proteção distribuída permanece aberta, assim como identidade/IAM externos R-006 e demais requisitos não demonstrados. Java temporário permite esta execução; não encerra R-011 de reprodução/instalação permanente. Preparação não constitui evidência de GO externo.

## 27. Riscos residuais e custos

Secret persistente pode ser extraído por código/dependência/pessoa com acesso ao runtime/deploy; identidade restrita ainda tem alcance no banco dedicado e Admin SDK ignora Rules. Loader não prova remotamente propriedade/permissão/revogação. Conta/plano/montagem real não verificados. Proxy pode causar bloqueio coletivo; retomada Free excede timeout do cliente; testes Emulator não comprovam IAM/índices/performance/fatura reais.

Render Free: 750 h/mês compartilhadas, repouso após 15 min, retomada em cerca de um minuto, banda/minutos de build separados e suspensão/cobrança conforme conta. Tráfego externo intenso iniciado pelo serviço (incluindo banco externo) também pode causar suspensão Free. [Limites oficiais](https://render.com/docs/free). Não recomendar produção comercial nesse plano.

Firebase Spark pode atender Auth não telefônica e uma base Firestore elegível dentro das cotas gratuitas, mas não cobre todos os produtos/recursos. Checar limites atuais de usuários/provedores, leituras/escritas/armazenamento/transferência e necessidade de Blaze antes de criar; não tratar IAM/chave como autorização de faturamento. Backups/PITR/TTL, bases adicionais e outros produtos exigem análise de elegibilidade/custos. Ligação a billing pode mudar plano para Blaze. Alertas não bloqueiam custos automaticamente. Não há orçamento/fatura externa comprovada e não prometemos custo total zero.

## 28. Commit, push e deploy

Nenhum stage, commit, push, deploy, projeto/banco/usuário/chave/IAM/serviço real criado ou modificado. main continua 19b554d. URL real da API inexistente; Cloudflare preservado. Alterações históricas e novas identificadas pelo inventário inicial e tabela desta ordem; revisão final antes de qualquer commit/push.

## 29. Matriz de pré-requisitos e aprovações

| Pré-requisito | Evidência atual | Estado para deploy |
| --- | --- | --- |
| Projeto dedicado existente/ID aprovado | Somente proposta catalogos-homolog-2026 | Pendente |
| Plano/localização/custos aprovados | Roteiro; sem billing | Pendente |
| Auth/provedores/domínios/app Web | Código e roteiro | Pendente externo |
| Firestore/Rules/índices READY | Arquivos locais, deny-all e sete índices | Pendente externo |
| SA e IAM restritos | Proposta de permissões | Pendente externo |
| Credencial segura/rotação/responsável | Loader testado sem segredo real | Pendente externo |
| Render Free/config/secret regular | Modelo sem recurso criado | Pendente externo |
| Ambiente homolog/projeto explícito | Guardas/testes locais aprovados | Preparado localmente |
| Ausência de segredos Git/build | Ignores/testes e scanner textual; revisão final obrigatória | Evidência local, revisar staged antes do push |
| CORS/token/roles/multi-loja | Testes locais | Validação externa pendente |
| Proxy/abuso e R-023 | Limiter atual sem correção distribuída | Pendente |
| Testes locais/build | Aprovados; Emulator conforme recibo final | Local |
| Autorização de publicação | Não concedida | Pendente |

GO somente após resolver os gates externos e aceitar riscos/custos. Não marcar recursos criados por existir roteiro.

## 30. Próxima ação recomendada

Revisar este diff e aprovar primeiro ID/plano/localização e estratégia de SA/Secret File. Depois emitir ordem específica para criar apenas o Firebase dedicado e configurar IAM/fixtures/chave autorizados, com operador identificado. Push e criação/publicação Render devem receber autorização própria após revisão Git e proteção da API. Integração VITE_API_URL/novo build Cloudflare é etapa posterior autorizada, com fixtures e sem mensagens/pedidos reais.

## Decisão vigente — Render com Firebase existente — 15/10/2026

Por instrução posterior do proprietário, usar bancorestaurante e loja-demo na primeira implantação de demonstração; não criar catalogos-homolog-2026, banco novo, migração ou cópia. Esta decisão substitui a Ordem 04 anterior de criação de projeto vazio. Cloud Run e Firebase separado ficam como alternativas históricas/futuras. **Somente preparo local, sem conexão real, chaves, IAM, dados, push ou deploy.** Relatório/configuração atual: docs/PREPARACAO_RENDER_BANCORESTAURANTE.md.

Backend mantém APP_ENV=homologacao e NODE_ENV=production. Para o projeto existente, exige FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante além de GCLOUD_PROJECT, FIREBASE_EXPECTED_PROJECT_ID e FIREBASE_HOMOLOG_PROJECT_ID iguais ao mesmo ID. Somente FIREBASE_CREDENTIAL_MODE=render-secret-file é aceito nessa exceção; managed/ADC pessoal/Emulator/produção comercial são recusados. Conta de serviço deve ser explícita do mesmo projeto e o JSON corresponder exatamente ao projeto/email; arquivo fixo /etc/secrets/firebase-homologacao.json, nenhum segredo no Git/VITE_*/logs. Modelo vigente infra/render/bancorestaurante.backend.env.example. Nome de conta sugerido catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com, ainda não criado/verificado; IAM/geração/upload precisam de aprovação específica.

Frontend tem opt-in equivalente VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante, três IDs públicos correspondentes e mapa catalogo-demo-cz1.pages.dev→loja-demo; modelo infra/render/bancorestaurante.web.env.example. VITE_API_URL segue placeholder até existir URL real validada. Nenhuma publicação Cloudflare feita. Authorized Domains, Rules/índices/IAM e dados do Firebase atual não consultados nesta rodada; arquivos locais não provam estado remoto.

Fluxo preparado: Cloudflare Pages → React → HTTPS → Render → Express → autenticação/loja → controllers → services → Admin SDK → Firebase bancorestaurante (Authentication/Firestore) → API → React. Catálogo público usa projeções; token/revogação, usuário ativo, role e vínculo preservados; cliente/pedido/endereço mantêm titularidade/escopo. Checkout recalcula/transaciona/idempotência no servidor; link WhatsApp não envia mensagem. API continua compartilhada para restaurantes, sem superadmin. Nenhum pedido/usuário real alterado.

Banco persistente não é descartável: opt-in de configuração não autoriza escrita/publicação e não concede IAM. Uma API pública completa com identidade de escrita poderá afetar dados reais; revisar dados publicáveis, alcance de IAM, recuperação e operações permitidas antes de expor. Admin SDK ignora Rules Web; autorização da API continua essencial. CORS HTTPS exato não autentica; limiter local/peer TCP pode agrupar visitantes atrás do proxy. trust proxy não foi ampliado. R-007/R-023 e demais gates reais seguem abertos; 25 ressalvas, 16 abertas e nove resolvidas localmente preservadas. Vendas comerciais não liberadas.

Render proposto catalogos-api-homolog, Node 24, Free, raiz backend no Git interno, npm ci, npm start, health /, Auto Deploy Off, uma instância, PORT da plataforma. Salvar secret pode iniciar deploy; só fazer após autorização. Integração Render–Firebase existente não comprovada. Fixtures/Emulator permanecem fictícios; script de simulação continua recusando bancorestaurante. Resultados reais de testes e limites constam no relatório/evidências desta decisão.
