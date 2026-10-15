# CATÁLOGOS — RENDER: ETAPA 1, BRANCH DE DEPLOY

> Decisão mais recente: primeira publicação usará fixtures sem Firebase, com carrinho demonstrativo. Consulte o [guia prático vigente](PUBLICAR_DEMO_FIXTURES.md); configuração Firebase abaixo permanece como histórico/opção futura.

15/10/2026. Preparação local concluída. Push, IAM, geração de credenciais, Firestore real e criação do serviço Render não executados. Catálogo bloqueado. A ordem atual autoriza preparar branch/commits e aguardar autorização específica para push.

## 1. Branch e estado do Git

Branch criada: `deploy/render-demo-readonly`, a partir de `main`/`19b554d`. `main` permanece nesse commit. Repositório confirmado `https://github.com/LucasTech-Dev/Catalogos.git`; raiz Git é `Catalogo-Demo/Catalogo-demo`, não o Git vazio externo. A consulta somente leitura `git ls-remote --heads origin main deploy/render-demo-readonly` retornou main `b8e2a4ba39ae233ad413b434d6ce5cbb42b15308`; a nova branch não apareceu no remoto. Isso coincide com a referência local origin/main. Não houve fetch/merge/rebase ou alteração do histórico anterior. O estado remoto deve ser conferido novamente antes do envio.

Alterações acumuladas das etapas 19–26/ordens anteriores foram preservadas e organizadas por responsabilidade; não houve descarte de alterações do proprietário. O build alterou somente um index.html rastreado em demo/dist; esse efeito gerado nesta rodada foi revertido ao conteúdo que havia no início, sem incluir artefatos de build no novo commit.

## 2. Commits que serão enviados

O push da nova branch inclui o histórico que falta no remoto: **oito commits anteriores e três commits novos desta preparação**, total 11. Não são apenas os novos commits de backend. Histórico herdado, sem reescrita:

- `2c06313` — feat: integra catalogo publico e painel administrativo (etapas 19 e 20).
- `0b1ec3d` — docs: registra conclusao local das etapas 19 e 20.
- `c2a0cbf` — security(backend): conclui auditoria e protecoes da etapa 21.
- `9122f01` — feat(backend): conclui validacao global de entradas etapa 22.
- `77c8bb7` — fix(backend): centraliza tratamento de erros etapa 23.
- `949f992` — test(project): conclui homologacao local e regressoes etapa 24.
- `792b069` — chore(infra): conclui preparacao local de producao etapa 25.
- `19b554d` — chore(deploy): prepara backend cloud run e documenta fluxos.


Novos commits de implementação:

- `8769ea4` — feat(backend): prepara demonstracao Render somente leitura.
- `b9efe60` — feat(web): prepara previa de catalogo sem Auth e checkout.
- Commit documental que contém este relatório — docs(deploy): consolida auditorias e roteiro Render sem push; hash efetivo informado ao proprietário na entrega.

A lista base/runtime está em [commits-base-e-runtime.txt](evidencias-render-etapa1/commits-base-e-runtime.txt). O último commit inclui documentação, evidências sanitizadas, validador e integração documental no workflow, sem implantação automática. A configuração atual desse workflow só dispara push em main, pull_request ou workflow_dispatch; não há trigger de push para esta branch de deploy.

## 3. Arquivos que entram no deploy

Estrutura confirmada na raiz do repositório remoto: `backend/`, `demo/`, `docs/` e demais diretórios. **Root Directory no Render: `backend`**, não o caminho completo local `Catalogo-Demo/Catalogo-demo/backend`.

O GitHub recebe a árvore do projeto, incluindo frontend e documentação; o Render com essa raiz instala e executa somente o backend. [Manifesto exato dos arquivos backend](evidencias-render-etapa1/arquivos-backend.txt). Execução: `package.json`, `package-lock.json` e `src/**`, incluindo server, app, ambiente, demoPublica, credencialHomologacao, Firebase, ramo demo, DTO e middlewares usados. Fixtures/scripts/testes são material de desenvolvimento presente no diretório, não executado por npm start. Dockerfile/.dockerignore estão preservados, mas **a implantação Node nativa não usa o Dockerfile nem a exclusão do .dockerignore**.

Arquivos ignorados, como node_modules, .env local, ADC, credenciais, firebase-homologacao.json, chaves e logs brutos, não entram nos novos commits. demo/dist/index.html já existia no histórico e foi mantido sem alteração nesta rodada; nenhum novo build foi incluído. Nenhum arquivo de `/home/lucas/Documentos/lojaDemoRestaurante` foi copiado para o repo nesta etapa.

## 4. Testes, instalação e scanner

| Verificação desta rodada | Resultado |
| --- | --- |
| Backend, Node 24.19.0 | 342/342 |
| React | 92/92 |
| Infraestrutura | 7/7 |
| Builds normal e demo explícito | Ambos aprovados; saída demo temporária, API fictícia example.com |
| Integração demo com Emulator | Exit 0, apenas projeto demo- e dados fictícios |
| npm ci exato em cópia limpa do backend commitado | Resultado registrado em verificacao-final.txt |
| npm audit backend e frontend | Zero vulnerabilidades informadas em ambos |
| Scanner do projeto | Sem achados |
| Scanner adicional arquivos candidatos e blobs do histórico pendente | Sem achados; contagens/limitações em scan-historico.json |
| Validador documental/diff | Resultado registrado em verificacao-final.txt |

Algumas primeiras execuções de testes/scanner tiveram subprocessos bloqueados pelo sandbox; foram repetidas fora dessa restrição e os números acima correspondem às execuções completas. A primeira chamada do Emulator usou caminho de configuração incorreto e foi corrigida antes da execução aprovada. Um alerta adicional do scanner era parte de hash de integridade npm no lockfile, confirmado pela estrutura JSON e resolvido ajustando o limite do padrão de token, sem alterar o lockfile. Scanner por padrões não certifica ausência universal de segredos ou PII. Não foram abertos ADC/chaves ignorados para preparar commits; nenhum valor secreto foi impresso.

Não foram repetidas todas as regressões Emulator 19–25 nesta rodada; executou-se a integração específica do modo implantável, além das suítes completas unitárias backend/React/infra. Os resultados históricos anteriores permanecem identificados como históricos.

## 5. Variáveis de ambiente exatas

Os nomes abaixo vêm de `backend/src/config/ambiente.js`, `demoPublica.js`, `credencialHomologacao.js` e do [exemplo vigente](../infra/render/bancorestaurante.backend.env.example). Não importar .env de desenvolvimento no Render. Todos os valores são strings; listas são JSON válido.

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

A conta acima é proposta, não criada ou validada nesta etapa; se a identidade efetivamente aprovada tiver outro e-mail, o valor precisa coincidir exatamente com o Secret File e pertencer a bancorestaurante. `PORT` vem da plataforma; o código aceita uma porta inteira válida e usa 3000 somente como default local. Host fixo no código `0.0.0.0`; nenhuma variável HOST é necessária. package.json exige Node 24.x; ambiente testado Node 24.19.0. Auto Deploy é opção do painel, não variável inventada no backend.

Não definir GOOGLE_APPLICATION_CREDENTIALS, FIRESTORE_EMULATOR_HOST ou FIREBASE_AUTH_EMULATOR_HOST no Render. Nenhuma variável VITE_* é necessária à API; frontend e sua VITE_API_URL permanecem sem alteração de publicação. Sem o seletor demo, mas com opções CATALOGOS_DEMO_*, o bootstrap falha; modo/projeto/identidade divergentes também são recusados.

## 6. Secret File esperado e bootstrap

Filename: **`firebase-homologacao.json`**. Caminho usado pelo backend: **`/etc/secrets/firebase-homologacao.json`**. O loader não aceita caminho alternativo ou fallback ADC; verifica arquivo regular, tamanho até 64 KiB, type service_account, project_id, client_email, private_key_id e chave aceita por cert. Falhas têm mensagem sanitizada. A compatibilidade do arquivo montado pelo Render com as verificações do loader ainda precisa ser comprovada na integração real.

Mesmo com catálogo bloqueado, o bootstrap exige configuração e credencial válidas antes do health; não relaxar validação para conseguir um 200. O health não acessa Firestore/Auth e **não comprova permissão IAM de leitura nem validade de acesso remoto**. Conteúdo do Secret File será inserido somente em etapa autorizada própria, nunca no relatório, Git, logs ou VITE_*. Não foi gerada chave nesta rodada.

## 7. Identidade de leitura e roteiro IAM proposto

Depois de autorização específica, o proprietário deverá conferir o projeto bancorestaurante, localizar/criar a identidade exclusiva proposta e revisar política efetiva (projeto, heranças, grupos/deny). A consulta da Ordem 07 não localizou essa conta (404); a situação não foi consultada novamente nesta etapa. Não reutilizar ADC pessoal, conta padrão privilegiada, Owner ou Editor como runtime.

Revisar/criar papel personalizado de projeto conforme [proposta versionada](../infra/render/iam-demo-readonly.proposta.json), contendo **somente `datastore.entities.get`**, e concedê-lo à identidade exclusiva. O modo demo atual faz apenas leitura pontual de documento, sem listagem, Auth, mutação ou transação. `roles/datastore.viewer` é alternativa mais ampla, incluindo listagem, sujeita a revisão; `roles/datastore.user` permite escrita e não atende ao requisito. Conferir ausência de concessões adicionais que reintroduzam escrita. Esta proposta não foi aplicada e não certifica permissões efetivas.

IAM get no banco não isola documentos por loja: a guarda loja-demo é do aplicativo. Admin SDK ignora as Rules dos clientes e pode ler documentos conhecidos se a credencial for usada fora dessas guardas. Aprovar esse alcance residual ou definir isolamento adicional antes de expor a credencial. Sem permissões Firebase Authentication no ramo demo. Após aprovação própria, preparar credencial e montagem protegida, validar acesso por teste de leitura pontual autorizado; não testar escrita no Firebase real por conveniência.

## 8. Git e Render — roteiro para execução posterior

**Comandos abaixo não foram executados para envio.** Após revisar estes commits, confirmar as políticas de branch/preview do Cloudflare e autorizar especificamente o push:

```bash
cd /home/lucas/Projetos/Catalogos/Catalogo-Demo/Catalogo-demo
git status --short
git log --oneline origin/main..deploy/render-demo-readonly
git diff --stat origin/main...deploy/render-demo-readonly
git ls-remote --heads origin main deploy/render-demo-readonly
git push --dry-run origin deploy/render-demo-readonly:refs/heads/deploy/render-demo-readonly
git push -u origin deploy/render-demo-readonly:refs/heads/deploy/render-demo-readonly
```

Não usar push --all, --mirror, --force, merge em main ou tag de deploy. O dry-run é prévia do push, não simulação de todos os efeitos dos provedores após o envio real. Reconsultar remoto e tratar divergências sem reescrever histórico automaticamente.

Cloudflare Pages separa branch de produção e previews. Uma branch exclusiva evita atualizar main, mas **não garante ausência de preview automático**. Antes do push, conferir no painel a production branch e os controles de preview da conta existente; a política real não foi acessada/modificada nesta etapa. Se a branch acionar uma publicação indesejada, resolver isso com autorização antes de enviar. Não abrir PR automaticamente, pois também pode disparar checks/previews. As Rules deny-all informadas pelo proprietário podem afetar clientes que ainda consultem Firestore diretamente; não se afirmou que o site atual foi retestado ou permanece integralmente funcional.

Somente após envio aprovado, identidade revisada e autorização de criação do serviço: no Render, New → Web Service, conectar `LucasTech-Dev/Catalogos`, escolher explicitamente **deploy/render-demo-readonly** e configurar:

| Campo | Valor preparado |
| --- | --- |
| Nome | catalogos-api-homolog |
| Language/Runtime | Node.js, versão 24.x pelo package.json |
| Root Directory | backend |
| Build Command | npm ci |
| Start Command | npm start |
| Plano | Free, disponibilidade da conta a confirmar |
| Health Check Path | / |
| Auto Deploy | Off |
| Environment | Exatos 16 pares do item 5 |
| Secret File | firebase-homologacao.json, item 6, somente após autorização |

Conferir região disponível/latência antes da criação; não mudar banco existente nam5 nem habilitar plano pago. Não clicar Create Web Service nesta etapa. A primeira criação já implica implantação; Auto Deploy Off controla implantações seguintes e não elimina a primeira. Salvar Secret File pode disparar implantação. A documentação oficial informa repouso da instância Free após 15 minutos sem tráfego; o primeiro acesso pode demorar. Plano para demonstração, sem liberação comercial.

Após a futura implantação autorizada: registrar URL realmente fornecida (não inventar hostname), conferir commit implantado/modo nos logs sem segredos, GET e HEAD / → 200, GET catálogo → 503 com flag 0 e zero leituras pelo handler, e caminhos privados/outra loja → 404 no ramo demo. Não enviar POST de prova ao Firebase real. Não vincular Cloudflare à API nem preencher VITE_API_URL de produção nessa mesma ação sem autorização.

## 9. Bloqueios antes de Create Web Service

| Gate | Situação |
| --- | --- |
| Branch/commits locais e testes | Preparados; aguardando revisão/autorização de push |
| GitHub com versão correta | Ainda não enviada; Render não deve selecionar main por padrão |
| Cloudflare | Política de production/preview precisa ser conferida antes do push; nenhuma configuração alterada |
| Rules bloqueio total | Proprietário informou publicação manual; não houve nova consulta/imagem verificada nesta etapa. A auditoria de exposição da Ordem 07 é histórica e não deve ser apresentada como estado atual confirmado |
| IAM/identidade exclusiva sem escrita | Não preparada externamente; alcance e permissões efetivas pendentes |
| Secret File e bootstrap real | Credencial não gerada; montagem/validação no Render pendentes |
| Catálogo | Continua aprovado=0, listas vazias; ausência de ativo na loja, disponibilidade e imagens são pendências para liberar produtos depois, não para o handler health |
| Integração/limites/custos | Render real ainda não testado; nenhum serviço ou billing habilitado |

Ressalvas preservadas: 25 IDs, 16 abertas e nove resolvidas localmente; nenhuma encerrada por esta preparação. R-005 exige evidência atual das Rules para reavaliação; R-006 aguarda IAM/credencial, R-007/R-023 seguem abertas. Sem vendas comerciais.

Fontes oficiais consultadas nesta etapa: [Express no Render](https://render.com/docs/deploy-node-express-app), [porta e host](https://render.com/docs/web-services), [Secret Files e salvamento](https://render.com/docs/configure-environment-variables), [limites Free](https://render.com/docs/free), [permissões Firestore](https://firebase.google.com/docs/firestore/security/iam) e [branches/preview no Cloudflare](https://developers.cloudflare.com/pages/configuration/branch-build-controls/). Evidências locais: [resumo](evidencias-render-etapa1/resumo.json) e [verificação final](evidencias-render-etapa1/verificacao-final.txt). Próxima ação depende de autorização específica para enviar somente esta branch.
