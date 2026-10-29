> Posição vigente: Etapas1–4 concluídas tecnicamente; Etapa5 de consolidação/publicação autorizada em preparação. Commits locais autorizados; push/main, mapa público Cloudflare e deploy aguardam confirmação final do proprietário. Nenhum cliente real iniciado.

# PLANO MESTRE — DEMO COMO MATRIZ COMERCIAL REUTILIZÁVEL
> Documento vivo e executável pelo Codex. Atualizar este arquivo a cada etapa, sem reescrever o histórico.
>
> **Data de criação:** 2026-10-28 · **Estado:** PLANEJAMENTO; nenhuma adaptação de cliente executada por este documento.
> **Repositório mestre:** `LucasTech-Dev/Catalogos` · **Base de referência:** `main` (verificar HEAD antes de cada execução).
> **Demo:** `catalogo-demo-cz1.pages.dev` · **Firebase da Demo:** `bancorestaurante` / `loja-demo`.
> **Owner do produto:** proprietário do Catálogo JS.

## 0. Princípio de produto

**A Lancheria Demo é a matriz. Cada novo estabelecimento será uma instância/cópia personalizada do mesmo sistema, não um novo desenvolvimento.** Alterações centrais devem ser reutilizáveis; customizações próprias da loja ficam em dados/configuração/tema e não devem modificar a matriz sem necessidade.

O resultado comercial deve permitir:
- catálogo e cardápio responsivo, produtos/categorias/ingredientes, disponibilidade/imagens, carrinho com observação por item, entrega/retirada e checkout;
- login Google e e-mail/senha, cliente com dados/endereços/histórico de pedidos e numeração comercial;
- painel administrativo: Dashboard, Pedidos, Produtos, Categorias, Clientes e Configurações;
- feedback de ações humanas, travas contra clique duplo, validação de permissões, integração real com Firestore, WhatsApp;
- publicação de domínio único por cliente; diferenças de marca/dados sem bifurcar o comportamento básico.

### Arquitetura confirmada até o planejamento
- `frontend/`: React 18, Vite, JavaScript ES6, CSS, Firebase Web SDK.
- `firebase/` e `quality/`: Rules/Emulators e testes; **`firebase.json` da release remota foi simplificado para Emulators**, conferir os arquivos locais/históricos antes de presumir configuração de publicação.
- `docs/`: Guia Mestre, relatórios Ordens 012/013, continuidade, índice.
- `infra/`: possui exemplos de ambiente externo; `frontend/.env.example` documenta `VITE_LOJA_ID`, `VITE_LOJAS_POR_HOST`, `VITE_FIREBASE_*` e `VITE_CATEGORIAS_DESATIVACAO`.
- `backend/`: código histórico de Express pode existir; **não é backend hospedado da arquitetura atual**. Back-end operacional significa módulos JS/SDK, validação transacional, Auth, Rules e serviços.
- Cloudflare Pages da Demo usa `frontend` e `dist`; deployment e configurações devem ser confirmados no momento da execução.
- O catálogo já dispõe de separação por `lojaId`, projeções públicas, revisões comerciais, pedidos numerados por loja, checagens de sessão e regras emuladas. Reutilizar antes de reinventar.
- Limpeza Ordem012: relatos oficiais indicam zero pedidos/clientes de teste após limpeza, contador reiniciado para próximo #1 e três admins preservados **naquela data**. Não assumir que o estado permaneceu igual depois do uso real.
- Ordem013: painel revisto e publicado no escopo testado; B-03 (desativação de categorias) ainda condicionada às Rules em produção, B-04 grava horários em etapas, fotos reais e aceite comercial pessoal podem continuar pendentes.
- Mudanças posteriores da Demo (produto indisponível, observações editáveis no carrinho/checkout) podem ter sido acrescentadas diretamente ao GitHub. Verificar HEAD, build e deploy; não presumir testes concluídos dessas alterações.

## 1. Decisões comerciais/técnicas

**Modelo de entrega para a primeira venda:** uma instância Cloudflare Pages por cliente, usando a mesma matriz de código; cada instância tem `lojaId`, domínio, tema e informações próprios. Não duplicar código manualmente em dez pastas que divergirão.

**Isolamento de banco — decisão por cliente antes de criar dados:**
- **Opção A, inicialmente recomendada para simplicidade e segregação:** projeto Firebase separado para cada cliente, com seus Auth/Firestore/Rules/índices; permite isolamento forte e manutenção por estabelecimento, mas adiciona configuração e custos/limites por projeto. Confirmar recursos e custos reais antes de padronizar.
- **Opção B, se custos/operação justificarem:** projeto Firebase multi-tenant, com `lojaId` e Rules efetivamente testadas contra leitura/escrita cruzada. Auth compartilhado exige autorização por loja e cuidado especial com perfis/UID e domínios. Não assumir que configuração por `lojaId` sozinha basta.
- O Codex deve mapear o que já está implementado e escolher **com o proprietário** um padrão antes do provisionamento real. Não migrar a Demo `bancorestaurante` automaticamente.
- Para qualquer opção: cada cliente terá seus produtos, categorias, configurações, administradores, usuários, pedidos, contador e URLs; não copiar pedidos, sessões, credenciais, contas ou contatos da Demo.

**Personalização padrão via dados:** nome da loja, logotipo/favicons, fotos, cor principal, descrição, WhatsApp/Instagram, endereço, horários, entrega/retirada, taxa/valor mínimo, métodos de pagamento, categorias e produtos. Features exclusivas exigem decisão de produto/versão, não hacks por cliente.

**Licenciamento/versionamento:** manter um repositório fonte mestre; preferir deploys parametrizados para cada loja (ou repositório derivado com upstream controlado somente se realmente necessário). Registrar versão do mestre em cada instalação. Planejar upgrades e rollback sem sobrescrever dados de clientes.

## 2. Resumo das quatro etapas obrigatórias

| Fase | Nome | Saída principal | Gate |
|---|---|---|---|
| **1 FRONT** | Modelo visual reutilizável | Site personalizável sem strings fixas da Lancheria Demo | build + desktop/mobile + diferenças entre duas lojas sintéticas |
| **2 BANCO — provisionamento** | Estrutura e dados iniciais de uma loja | Instância de loja e sementes mínimas, sem histórico/testes da Demo | backup/manifesto + Rules/índices/roles adequados + loja isolada |
| **3 BACK — JS/SDK** | Serviços multi-instância e operações administrativas | Mesmo código atende loja correta com transações e direitos corretos | testes Emulator: catálogo, conta, pedido, status, pagamentos, admin |
| **4 BANCO — integração e homologação** | Segurança, integridade, validação e entrega | Loja pronta, verificação real com usuário e owner | isolamento, smoke E2E, publicação, rollback, aceite |

> `4. Banco` permanece como solicitado; não é repetição da fase 2. A fase 2 **monta**, a fase 4 **confere e entrega**.

---

# ETAPA 1 — FRONT-END (visual parametrizável)

**Objetivo:** transformar a interface Demo em um tema de loja, sem dependência de marcas fixas, mantendo páginas/componentes existentes.

### Trabalho do Codex
- Inventariar strings/recursos específicos da Demo: `Lancheria Demo`, imagens placeholder, favicons, textos institucionais, mensagens WhatsApp, cores, contatos, endereços, títulos/meta tags, URLs/links, placeholders e `loja-demo` hardcoded. Separar nomes em configuração de loja/tema, sem trocar por valores de um novo cliente antes de definir os dados.
- Conferir componentes públicos Home/Cardápio, Produto, Carrinho, Checkout, Sobre, Login, Cadastro, Minha conta, Endereços, Pedidos/Detalhe, menu responsivo; e cabeçalho/painel admin.
- Definir um pequeno conjunto de tokens CSS para cor principal, contraste, estados, tipografia e logos, usando dados seguros; permitir trocar visual de cada loja sem copiar dezenas de arquivos CSS.
- Manter aparência consistente: carregamento inicial, erros, confirmação de ações do usuário por até 5 s, foco/teclado, modais, acessibilidade e responsividade (320/390/768/1366px).
- Validar imagem ausente, produto indisponível com botão cinza desabilitado, observação editável até checkout, card do pedido legível, contador do carrinho isolado por sessão/loja.
- Remover strings `Demo` exibidas ao cliente (exceto quando esta for a loja de demonstração). Não remover textos históricos de documentação.
- Preparar parâmetros de título/SEO, favicon, compartilhamento e imagens sem prometer indexação garantida; evitar vazar nome/dados de outra loja por cache ou configuração equivocada.
- Confirmar separação de dados locais (localStorage/sessionStorage) pelo `lojaId` e UID quando aplicável.
- Criar um **checklist visual de onboarding**: elementos que precisam de material enviado pelo cliente (logo, cores, produtos, fotos, endereço, WhatsApp etc.).
- Construir uma validação local de **duas lojas sintéticas** usando mesmo frontend e configurações diferentes, sem tocar no banco real.
- Não criar segundo frontend ou refazer React em HTML puro.

**Arquivos prováveis:** `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/contexts/`, `frontend/src/styles.css`, `frontend/.env.example`, `infra/ambientes/`. Verificar caminhos reais.

**Entrega/critério:** trocar configuração muda identidade visual, dados públicos e título; funcionalidades continuam disponíveis; zero credenciais embutidas e testes de interface passam.

**Tempo-alvo de planejamento:** 1–2 horas para parametrização mínima e validação local, se o código existente estiver reutilizável. Reportar tempo real.

---

# ETAPA 2 — BANCO DE DADOS (provisionar uma loja nova)

**Objetivo:** gerar uma base limpa, isolada e reproduzível a partir do modelo, nunca do conteúdo histórico da Demo.

### Trabalho do Codex
1. Inventariar esquema **atual real** do Firestore (coleções raiz/subcoleções, campos obrigatórios, projeções, revisões, índices compostos, contador, idempotência, auxiliares) a partir de serviço/Rules/testes e documentação. Não presumir que documentação antiga é a fonte da verdade.
2. Produzir uma **ficha de configuração por estabelecimento** e um manifesto machine-readable de provisionamento, com validação de `lojaId` único e domínio próprio. Não incluir segredos em Git.
3. Definir o mínimo necessário para uma loja nova: documento `lojas/{lojaId}/loja` (conferir schema real), configurações de entrega/retirada, horário, pagamento, categorias, produtos, projeção `catalogosPublicos/{lojaId}`, usuários administradores/vínculos, contador de pedidos. Não inventar caminhos: confirmar em código.
4. Criar `dry-run` **sem escrita** que mostre todos os caminhos planejados, documentos e diferenças. A execução deve exigir projeto/loja explícitos, identidade administrativa correta, backup/versionamento e autorização.
5. Criar método seguro de `seed` inicial com catálogo vazio ou produtos enviados pelo estabelecimento; não copiar clientes, pedidos, números, histórico, UIDs, contas ou dados pessoais da Demo.
6. Aplicar Rules/índices específicos **somente após validação em Emulator e autorização para o projeto do cliente**. Regras de leitura pública e escrita admin devem distinguir lojas; não criar `allow read, write: if true`.
7. Configurar Authentication da loja, provedores usados, domínios OAuth autorizados, papéis e usuários administradores. Nunca criar admin apenas pela presença de um email no frontend.
8. Garantir contador seguro para a primeira compra, preferencialmente próxima numeração #1 somente quando realmente é uma loja nova e não há pedidos/reservas, com transação de concorrência.
9. Preparar rollback/restauração privada; verificar integridade/hashes e não exportar dados pessoais para repo.
10. Guardar dados de ambiente públicos no provedor de hosting e segredos apenas no armazenamento apropriado, jamais em `VITE_*` se forem secretos.

**Entregas:** roteiro de provisionamento com dry-run, manifesto por cliente, teste com loja sintética no Emulator, planilha/checklist simples de cadastro; nenhum provisionamento real automático.

**Tempo-alvo:** 1–2 horas para criar e testar o procedimento reutilizável; nova loja posterior deve exigir só preenchimento e conferência (meta operacional, não garantia).

---

# ETAPA 3 — BACK-END (serviços JS + Firestore/Auth, sem Express)

**Objetivo:** assegurar que o comportamento inteiro responde a `lojaId`/identidade corretos sem duplicar sistemas.

> Aqui “backend” significa serviços/módulos JS ES6 + Firebase Auth/Web SDK, Firestore/transactions e regras de acesso; `backend/` legado NÃO deve ser reativado ou implantado por padrão.

### Trabalho do Codex
- Catalogar serviços de leitura/escrita usados por todas as páginas e verificar que recebem/obtêm a loja certa; nunca fazer fallback silencioso para `loja-demo` num domínio de cliente.
- Centralizar resolução de loja por configuração/host com validação estrita do mapeamento; rejeitar host desconhecido de forma segura (não expor catálogo de outra loja).
- Revisar Auth email/senha, Google, vínculo administrativo por loja, sessão anônima, cadastro de cliente, perfil, endereços, isolamento do carrinho, histórico e logout; separar permissões de admin das de cliente.
- Conferir catálogo, categorias, produtos, ingredientes/opções, imagem/fallback, preço, ativo/disponível; consultas e invalidadores coerentes com revisões/projeções.
- Conferir checkout: dados de entrega/retirada, taxa/valor mínimo/métodos, observações por item, validação servidor/Rules do preço, criação única por intenção, idempotência, numeração transacional, reserva de número, pagamento inicialmente pendente, WhatsApp e recuperação após perda de resposta.
- Conferir admin: Dashboard, Pedidos, detalhes/status operacional e financeiro **manual**, Produtos CRUD lógico, Categorias B-03 condicionada às Rules, Clientes, Configurações e horários B-04. Nenhum sucesso falso; timeout e conflitos tratados.
- Garantir animações/estado busy e travas contra duplo clique, sem bloquear ações independentes. Conexões e GETs devem minimizar leituras repetidas; só usar listeners quando houver benefício.
- Manter módulos comuns genéricos; parametrizar diferenças por cliente em configurações validadas e eventualmente flags explícitas, nunca múltiplas cópias divergentes.
- Criar testes no Emulator de **duas lojas** e **duas contas**: admin A não altera loja B, cliente A não lê cliente B, enumeração de paths falha, dono não ganha privilégio por fornecer UID/lojaId.
- Testar checkout simultâneo por loja e entre lojas; contadores independentes #1, #2; URLs/WhatsApp sempre usam a loja correta.
- Separar claramente status operacional e financeiro; não assumir pagamento bancário confirmado.
- Remover legados somente após prova de ausência de imports/scripts/uso operacional e backups recuperáveis. A limpeza não é licença para apagar documentação nem scripts de restauração.

**Entregas:** serviços revisados, testes multi-loja, matriz de permissões e lista de exceções reais.

**Tempo-alvo:** 2–4 horas se a separação por loja existente for suficiente; qualquer lacuna de segurança importante deve ser relatada e tratada antes de uma venda real.

---

# ETAPA 4 — BANCO DE DADOS (segurança, integração e homologação)

**Objetivo:** confirmar que o provisionamento da fase 2 e os serviços da fase 3 realmente protegem e manipulam apenas os dados do estabelecimento correto.

### Trabalho do Codex
1. Verificar no Emulator a correspondência entre Rules, schemas de produto/categoria/configuração, projeções públicas, transações de pedidos, numeração, idempotência e histórico.
2. Executar testes de isolamento entre lojas (admin, cliente, anônimo, domínio diferente), buscas e operações negadas. Testar concorrência e corrida entre atualização de produto e checkout.
3. Conferir índices necessários às consultas atuais e autorização para criação dos índices faltantes no projeto alvo.
4. Conferir que seed não copiou pedidos/clientes/dados pessoais da Demo; validar 0 pedidos da nova loja, contador inicial correto, produtos/categorias acordados e admin autorizado.
5. Validar projeção pública consistente com originais, revisão monotônica, transações, reuso de serviços, imagens e horários.
6. Preparar verificação pós-publicação: site HTTPS/domínio próprio, variáveis públicas corretas, OAuth/domínio autorizado, login admin e cliente, carrinho, checkout e WhatsApp da loja. Testes que criam dados reais exigem consentimento e identificação de dados de teste; limpar apenas seus próprios dados.
7. Verificar Security Rules **publicadas**, não apenas arquivo GitHub; conferir hashes/versões de deploy. O mesmo vale para índices, Auth e Cloudflare.
8. Confirmar privacidade/dados pessoais, acesso do administrador, backup, restauração e plano de suporte/rollback. Definir responsabilidade por cobrança e acessos ao Firebase/Cloudflare.
9. Registar custos/limites e monitoramento básico de quota, erros e desempenho antes de escalar a clientes.
10. Emitir checklist de aceite do estabelecimento e registrar evidência de que a nova instância tem dados isolados e comportamento igual à matriz.

**Entregas:** matriz de segurança, relatório de provisionamento e testes, identificação dos deployments, checklist para entregar acesso, backup privado inicial e plano de rollback.

**Tempo-alvo:** 1–2 horas por primeira implantação piloto controlada; replicações subsequentes precisam ser mais rápidas.

---

# 3. Processo repetível para cada novo cliente

1. Cadastrar a ficha do estabelecimento com os dados comerciais e materiais (sem credenciais).
2. Escolher e registrar estratégia Firebase (isolado por projeto ou multi-tenant), domínio/Pages e UID admin.
3. Provisionar estrutura mínima com dry-run + autorização + backup.
4. Preencher loja, produtos, categorias, fotos, preços, atendimento, taxas/horários/pagamentos.
5. Publicar a instância da mesma versão do frontend, com domínio e mapeamento de loja corretos.
6. Testar login, admin, catálogo, carrinho, checkout, pedido numerado, WhatsApp, detalhes/status e isolamento.
7. Entregar ao comerciante o acesso e um guia de uso simples; registrar versão, data, owner e política de manutenção.
8. Melhorias universais retornam à matriz; personalizações exclusivas só viram código separado quando necessárias e documentadas.

**Meta comercial:** replicar uma loja com checklists e parametrização, sem refazer páginas ou criar repositório novo manualmente a cada contratação.

## 4. Template de ficha por cliente (preencher sem segredos)

```yaml
cliente:
  nome_comercial: ""
  identificador_loja: ""
  contato_responsavel: ""
  cidade: ""
  uf: ""
  endereco_comercial: ""
  whatsapp_comercial: ""
  instagram: ""
  dominio: ""
  cloudflare_pages_projeto: ""
  estrategia_firebase: "a_definir" # projeto_isolado | multi_tenant
  firebase_projeto: "" # ID público, não credencial
  admin_uid_verificado: "" # manter em registro privado; não commitá-lo em arquivos públicos
  tema:
    cor_principal: ""
    logo_url: ""
    capa_url: ""
  operacao:
    entrega_habilitada: null
    retirada_habilitada: null
    taxa_entrega: null
    pedido_minimo: null
    horarios: "a_definir"
    pagamentos: []
  catalogo:
    categorias: "a_definir"
    produtos: "a_definir"
  status:
    etapa1_front: "pendente"
    etapa2_banco_provisionamento: "pendente"
    etapa3_back_js: "pendente"
    etapa4_banco_homologacao: "pendente"
    implantacao: "nao_publicada"
  versao_matriz: "preencher_sha_main"
```

> A ficha é um **modelo de campos**, não um arquivo pronto para aplicar a Firestore sem conversão e validação de tipos. Não colocar senha, token, chave privada, dados de cartão, CPF ou dados pessoais de clientes no repositório.

## 5. Modelo de atualizações deste próprio arquivo — Codex deve completar

> **Regra:** adicionar entradas; não sobrescrever achados anteriores nem trocar “pendente” por “concluído” sem evidência.

### Registro de execução (preencher a cada sessão)

| Data/hora | Etapa | Commit/branch | Arquivos | Testes reais | Deploy/Rules | Estado | Bloqueios |
|---|---|---|---|---|---|---|---|
| 2026-10-28 | Planejamento | main, verificar SHA | Este documento | Não executados | Nenhum | PLANEJADO | Decidir estratégia de isolamento por cliente |
| 2026-10-28 | Etapa1 FRONT | Raiz local não rastreada; referência remota ff42ee5 | Fontes/testes/docs listados no fechamento | 327 suíte +2 novos integrados;16layouts;build | Nenhum | Concluída tecnicamente local | Etapa2 não iniciada; provisionamento/entrega dependem de decisões e autorização |
| 2026-10-28 | Etapa2 BANCO | Raiz local não rastreada, sem commit | Manifesto/adapter/CLI/fixtures/testes/docs listados abaixo |59testes focados e ensaio integrado de duas lojas;build | Nenhum em produção | Concluída tecnicamente no Emulator | Decisões de implantação real posteriores; Etapa3 não iniciada |
| 2026-10-28 | Etapa3 SERVIÇOS JS | Raiz local não rastreada, sem commit | Serviços/IDs/Auth/cache/testes/relatório listados no relatório3 |375testes;99checks de serviços;106de provisionamento;build | Nenhum em produção | Concluída tecnicamente local | Etapa4 aguardando ordem; domínio/projeto/aceite e atos reais separados |

### Checklist de aprovação

- [x] Etapa 1: duas lojas sintéticas com logos/cores diferentes, sem vazamento ou quebra visual (validação técnica local de28/10/2026; publicação/aceite pessoal posteriores).
- [x] Etapa 2: manifesto e dry-run de banco, seed seguro e provisionamento reproduzível (somente Emulator; sem provisionamento real).
- [x] Etapa 3: Auth/checkout/admin e transações com isolamento comprovado localmente (serviços/Rules no Emulator; sem publicação ou OAuth pessoal).
- [x] Etapa 4: matriz, Rules candidata, consultas, isolamento, backup e fluxos homologados localmente para duas lojas; índices reais/deploy/aceite comercial permanecem gates separados.
- [ ] Ficha de instalação por cliente pronta.
- [ ] Processo de atualização do código mestre definido.
- [ ] Guia de operação básico ao comerciante.
- [ ] Primeiro cliente piloto validado e acesso entregue.

### Questões a decidir pelo proprietário

1. Um projeto Firebase por loja ou multi-tenant em um só projeto?
2. Cliente terá domínio próprio ou subdomínio Pages inicialmente?
3. Quem é proprietário das contas Cloudflare/Firebase e quem paga os custos?
4. Limite da personalização visual no plano comercial (logo/cores/fotos versus layout exclusivo)?
5. Política de atualização para instâncias já vendidas, suporte e backup.
6. Como será o primeiro cliente piloto e quais dados reais fornecerá?

## 6. Regras para Codex: execução rápida e segura

- Começar pela **etapa 1**, concluir um bloco de cada vez, evitar “auditorias completas” repetidas; aproveite Ordem013.
- Antes de escrever, ler o HEAD de `main`, `docs/INDICE_GERAL_DOCUMENTACAO.md`, `docs/GUIA_MESTRE.md`, `docs/ADAPTACAO_SERVERLESS/CONTINUIDADE_CODEX.md`, este documento e `frontend/.env.example`.
- Inventariar apenas o que impacta a fase, registrar dependências, dar prazo realista por bloco e apresentar diffs/testes.
- Cada etapa deve produzir **código quando necessário**, testes e atualização deste arquivo. Não se limitar a texto.
- Não mudar a Demo para dados de cliente real. Usar parâmetros/instâncias separadas e preservar demo como referência e vitrine.
- Não modificar Firebase real, Rules, IAM, contas Auth, Cloudflare de clientes ou dados comerciais sem autorização específica, identificação do alvo e backup adequado. Publicação de frontend ≠ deploy de Rules.
- Não misturar dados/contas comerciais entre lojas; testar acesso negado entre tenants.
- Não usar Firebase Admin SDK no navegador, nem credenciais/segredos em `VITE_*` ou commits.
- Não alterar o layout atual de forma gratuita, nem reintroduzir Express/Render, Cloud Functions ou provedores novos sem necessidade.
- Não excluir código histórico ou backups por “limpeza” sem provar que não são usados.
- O relatório final de cada etapa deve informar código alterado, testes, risco, commit, Pages, pendências e **próxima ação exata**.
- Tratar tempos apenas como **estimativas de planejamento**; objetivo é menor caminho seguro até a primeira venda.

## 7. Prompt de inicialização para Codex

> Leia `docs/PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md` e os arquivos oficiais ali indicados. A Demo é a MATRIZ comercial que deve permanecer funcionando. Execute **SOMENTE A ETAPA 1 — FRONT**, preparando personalização de nova loja via configuração/tema/branding e testes com duas lojas sintéticas. Não crie outra aplicação, não reintroduza backend Express, não toque no banco real e não faça deploy sem confirmação de escopo. Execute testes e build relevantes, registre todos os diffs e atualize o registro de execução do próprio plano, sem apagar o planejamento das etapas 2, 3 e 4. Entregue uma matriz dos campos que o cliente fornecerá e a próxima ação para iniciar a Etapa 2.


## Execução local — 28/10/2026 — ETAPA 1

### A — EXECUÇÃO PELO CODEX

Autorização: instrução atual do proprietário para adaptar somente o frontend. Documento original importado do GitHub (HEAD confirmado `ff42ee55dd7fff0c4d26ea3826acbfc8596f424b`) sem substituir histórico local. Este passa a ser o roteiro da adaptação comercial; plano serverless mantém posição/histórico dos nove MVPs e aponta para esta etapa, sem fila concorrente.

| ID | Objetivo / arquivos e função | Pré-requisito / dependência | Comandos / teste / resultado | Estado / tempo |
| --- | --- | --- | --- | --- |
| REP-1-C1 | Configuração pública visual por loja: `frontend/src/lib/identidadeLoja.js`, `frontend/src/hooks/useIdentidadeLoja.js`, `.env.example` | Loja resolvida pelo serviço existente; apenas campos visuais permitidos | JSON por loja; URLs https/caminhos locais, cores hex; impede sobreposição de preço/role/Firebase/contatos | Implementado localmente; tempo da sessão no diário |
| REP-1-C2 | `LojaContext`, `AdminGate`, `Header`, `AdminHeader`, `Home`: marca e tema públicos/admin, capa/sobre, textos de abertura/CTA, metadados/favicon | Catálogo seguro existente; dados comerciais não escritos | Título, descrição, og:title/description/image e favicon atualizados com limpeza; logo com fallback; nenhuma foto institucional fixa | Implementado localmente |
| REP-1-C3 | `styles.css`, CSS de Dashboard/Pedidos/Produtos/Categorias e área do cliente: tokens de marca/foco/contraste e desabilitado | Mantém cores semânticas próprias e tipografia compartilhada | Cores principal/escura/suave e texto sobre cor; sem injeção de CSS arbitrário | Implementado localmente |
| REP-1-C4 | `quality/frontend/test/identidadeLoja.test.jsx` e `scripts/replicacao-visual.mjs`: regressão e duas lojas sintéticas com páginas reais | Testes jsdom, Chrome local, nenhuma dependência do banco real | `node quality/run.cjs frontend-test --maxWorkers=2`; `node --require ./quality/register.cjs quality/frontend/scripts/replicacao-visual.mjs`; build temporário | Resultados finais no diário/recibo da etapa |
| REP-1-C5 | Este plano, manual, Guia Mestre, diário/registro/continuidade, índice/inventário e guia consolidado local | Regra14/15; preservar registros anteriores | `node quality/docs/documentacao.cjs --write` e `--check`; revisão Git/ignorados | Registro local desta execução |

Decisões: `VITE_IDENTIDADES_LOJAS` é mapa público indexado por `lojaId`, aceita somente nome/descrição/títulos, logo/capa/sobre/favicon e cor. Campos ausentes usam apenas dados da própria loja, sem buscar marca da Demo. Contato/endereço/horários/produtos/preços continuam nos contratos atuais do catálogo e serão provisionados na Etapa2. Sem mudança de schema/Rules nesta fase. Títulos/meta são atualizados no navegador: prévias de redes sociais que não executam JS exigem metadados estáticos por instância antes da entrega; não há promessa de indexação/prévia universal.

Isolamento local conferido: carrinho `catalogos:carrinho:v2:<loja>:<identidade>` e tentativa de checkout `catalogos:checkout:<loja>:<uid>`. Feedback de navegação contém apenas mensagens fixas sem dados comerciais, expira em5s. Nenhum cache de identidade visual novo. Auth/Rules/isolamento de Firestore não são homologados por teste de tema.

Lacuna de versão preservada: o plano remoto menciona melhorias posteriores de indisponibilidade/edição de observação. Nesta raiz a observação por item é preservada/exibida, mas não editável no carrinho/checkout; botão de navegação do produto indisponível também ainda existe. Não declarar esses dois critérios atendidos nem sobrescrever fontes locais com a main por associação. Atualização posterior nesta mesma sessão: trechos da matriz remota foram conferidos por diff e incorporados seletivamente (ObservacaoItem/CartItem/Carrinho/Checkout/ProductCard, método de LojaContext e CSS), preservando a identidade nova. Editor bloqueado durante gravação; regressões de edição/união/persistência/compra incluídas. Esta lacuna local foi resolvida; a anotação anterior preserva o achado.

### B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

REP-1-H0: nenhuma intervenção indispensável para parametrização/testes locais. Escolha de Firebase por cliente, custos, domínio e aceite visual pessoal permanecem decisões posteriores, sem solicitar painel nesta ordem. Sem login/2FA, segredos ou dados pessoais enviados. Tempo manual/espera humana: zero.

Estado: Etapa1 implementada e validada localmente no escopo de personalização; homologação/publicação comercial não executadas. Etapas2–4 não iniciadas. Sem stage/commit/push/Pages/Rules/Auth/IAM/dados reais. Próxima tarefa exata: autorizar Etapa2 para manifesto/dry-run/seed somente no Emulator. Provisionamento real/publicação exigem atos específicos.

### Validação e encerramento técnico da Etapa1

28/10/2026, America/Sao_Paulo. Etapa1 concluída tecnicamente no ambiente local; checklist visual automatizado aprovado. Julgamento pessoal e entrega/publicação permanecem posteriores. A anotação inicial de lacuna de versão foi resolvida nesta mesma etapa, sem sobrescrever trabalho local.

- Suíte final: `node quality/run.cjs frontend-test --maxWorkers=2`, **327/327 testes em32arquivos**,113,61s. Mais dois testes integrados adicionados ao final: `... frontend-test compras --maxWorkers=1`, **20/20**,24,66s (18 já cobertos +2 novos). Total329 casos distintos aprovados. Token/metadata após ajuste final:8/8,9,06s. Primeira execução teve11 falhas de endereço por identidade vazia prematura; corrigido preservando `loja` indefinida até o catálogo chegar; regressões posteriores aprovadas.
- Build final: `npm run build -- --outDir /tmp/catalogo-replicacao-etapa1-validado`, **aprovado em10,50s**. Aviso de chunk >500kB preservado como limitação de tamanho, sem alteração arquitetural para esta fase.
- `node --require ./quality/register.cjs quality/frontend/scripts/replicacao-visual.mjs`: **16layouts aprovados**, duas lojas, Home/admin,320/390/768/1366px, menus mobile e zero exceções JS. [Recibo](ADAPTACAO_SERVERLESS/REPLICACAO_ETAPA1_VISUAL.json). Fixtures somente em build de memória, nenhuma chamada Firebase. Home/admin visual não prova as permissões do painel.
- `node infra/scripts/verificar-segredos.cjs`: scanner textual sem achados. Sandbox inicialmente impediu bind localhost e subprocesso git do scanner; repetidos com permissão do ambiente, sem operação externa. Python inicial não existia no alias `python`; utilizado `python3`. Um comando de criação de teste usou diretório incorreto, não criou arquivo e foi refeito no root. Sem incidente com credenciais.
- Fallback SVG mantido no mesmo caminho compatível `frontend/public/demo-produto.svg`, removido apenas o texto de marca “Demo” da ilustração genérica; ícone/imagem sem foto não anuncia outra loja. Nenhuma foto comercial ou dado do banco alterado.
- Inventário/links: `node quality/docs/documentacao.cjs --write` e `--check` aprovados; scanner inclui fontes não ignoradas. Git raiz mantém arquivos não rastreados desde a entrada; `git diff --check` isoladamente não cobre esses arquivos. `.env`, dependências, backup privado e build anterior ignorados preservados. Sem stage/commit/push/publicação.
- Limpeza: somente scripts/cópias/logs e builds intermediários próprios de `/tmp/replicacao-*` e `/tmp/catalogo-replicacao-etapa1-*` após registro e conferência. Build final validado mantido temporariamente para revisão; `quality/`, fontes, testes, dados, backup e evidências permanentes preservados. Nenhuma exclusão importante pendente de aprovação. Guia externo `/home/lucas/Documentos/lojaDemoRestaurante/` ausente, não recriado.
- Tempo: comandos medidos acima; execução técnica por blocos curtos, sem cronômetro integral confiável desde a primeira leitura; não atribuir duração precisa à sessão. Espera humana zero. Nenhum novo MVP/aceite comercial contabilizado.

Arquivos criados: módulo `identidadeLoja.js` (validação/tokens/metadados), hook `useIdentidadeLoja.js` (ciclo de vida), `ObservacaoItem.jsx` (editor existente na matriz recuperado seletivamente), testes `identidadeLoja.test.jsx`/`observacaoItem.test.jsx`, runner `replicacao-visual.mjs`, recibo visual e cópia local deste plano oficial remoto.

Arquivos ajustados: `LojaContext.jsx` (identidade/edição preservando prontidão), `AdminGate.jsx` (identidade sem alterar autorização), `Header.jsx`/`AdminHeader.jsx` (logo com fallback), `Home.jsx` (conteúdo/fotos configuráveis e indisponibilidade), `ProductCard.jsx` (estado indisponível), `CartItem.jsx`/`Carrinho.jsx`/`Checkout.jsx` (editor reaproveitado da matriz), `styles.css`, CSS admin `Dashboard/Pedidos/Produtos/Categorias` (tokens de foco/cor), `components/conta/areaCliente.css` (superfícies), `public/demo-produto.svg` (fallback neutro), `.env.example`/`package.json` (configuração pública/comando visual), `quality/frontend/test/compras.test.jsx` (união/persistência da observação), `quality/docs/documentacao.cjs` (classificação oficial do plano). Documentação: Guia Mestre, Registro, Diário, Plano serverless, Continuidade, Manual de Personalização, Ressalvas, guia consolidado da raiz, índice e inventário, com posição e próximos atos específicos.

Próxima ação: **Etapa2 — Banco, preparação local de manifesto/dry-run/seed no Emulator**, após autorização. Antes de qualquer provisionamento real, proprietário define projeto por cliente versus projeto compartilhado e autoriza o alvo/ato. Não executar etapas2–4, deploy ou Firebase real automaticamente.

Verificação após limpeza:12/12 testes de identidade/editor aprovados em6,30s; XML do fallback neutro válido, asset público sincronizado no build temporário validado. Índice/inventário/links e estado Git novamente conferidos. Log pontual próprio removido após este registro; fontes e recibo permanente mantidos.

## Execução local — 28/10/2026 — ETAPA 2 BANCO

Autorização: mensagem atual do proprietário, itens1–11, execução exclusiva no Emulator; nenhuma autorização de operação real, stage/commit/push/deploy ou início da Etapa3. Contrato definitivo do seed, caminhos/campos de todos os fluxos, índices, limitações e procedimento em [Provisionamento de lojas](PROVISIONAMENTO_LOJAS.md). É referência técnica deste plano, sem criar roteiro concorrente. Nenhum dado real da Demo lido/copiado/exportado para o seed.

### A — EXECUÇÃO PELO CODEX

| ID | Objetivo / arquivos e função | Operação / pré-requisito / dependência | Resultado / teste | Tempo / estado |
| --- | --- | --- | --- | --- |
| REP-2-C1 | `quality/frontend/provisionamento/manifesto.mjs`: valida manifesto e produz cinco documentos/hash determinístico; `quality/fixtures/provisionamento/{aurora,boreal}.json`: dados inteiramente sintéticos | Reusar `validarLojaPatch` e `projetarRegistro`; contrato local Rules/índices/serviços e Etapa1 preservados | Nome/configuração/horários completos, ao menos uma operação e pagamento; nenhuma lista de produto/cliente/pedido aceita. Catálogo vazio e contador0 | Concluído local; tempo de implementação não isolado por ID |
| REP-2-C2 | `quality/frontend/provisionamento/emulator.mjs`: guardas, identidade por UID, inventário recursivo, dry-run e criação atômica | Projeto fictício demo-, loopback numérico, flag de Emulator exclusivo, identidade ativa/verificada/não anônima. Sem Admin SDK/ADC/credenciais ou importação de contas | Commit único de cinco criações `exists:false`; noop se intacto; destinos usados, vazios existentes, órfãos e vínculo divergente recusados. Sem fallback para projeto real | Concluído e validado com Rules atuais; tempo nos testes abaixo |
| REP-2-C3 | `quality/frontend/scripts/provisionar-loja.mjs` e `frontend/package.json`: CLI/aliases públicos de planejar/dry-run/aplicar-local | `planejar` offline não inicializa serviços; `dry-run` conectado só consulta; aplicação exige todos os gates locais | Comando offline Node e alias npm executados com sucesso; nenhuma conta criada pela ferramenta. Bootstrap de UID/contador não fica disponível ao navegador | Concluído; nenhuma dependência instalada |
| REP-2-C4 | `quality/frontend/test/provisionamento.test.jsx`:27validações; `quality/frontend/scripts/provisionamento-emulator.mjs` e `quality/firebase/executar-provisionamento.cjs`: ensaio integrado reproduzível | Binários e harness Auth/Firestore já existentes, projeto `demo-replicacao`, portas8188/9198 exclusivas; Rules carregadas só nessa instância | **106checks integrados**, **59testes focados**, build aprovado. Duas lojas do zero, configurações distintas, perfis/endereços/pedidos/histórico privados isolados, #1 em ambas, concorrência#2/#3, retomada e precondições | Concluído; execução integrada21.642ms, focados19,11s, build14,92s |
| REP-2-C5 | Guia técnico, este plano, Guia Mestre, Registro, Diário, Plano serverless, Continuidade, Manual de Personalização, Ressalvas, guia consolidado local, índice/inventário e classificador `quality/docs/documentacao.cjs` | Regras14/15; preservar histórico e posição dos noveMVPs | Links/classificação conferidos, scanner sem achados, Git/ignorados conhecidos; temporários próprios removidos após evidências | Concluído; espelho externo ausente, não recriado |

### Estrutura e decisões confirmadas

Cinco documentos iniciais: `lojas/{L}`, `catalogosPublicos/{L}`, `lojas/{L}/controleCompra/versao`, `lojas/{L}/contadores/pedidos`, `usuarios/{uid}`. Não usar `lojas/{L}/loja`. Valores/projeções vêm de entrada nova validada, nunca de exportação da Demo. `produtos`, `categorias`, `clientes`, `enderecos`, `tentativasCompra`, `pedidos`, `idempotencia`, `numerosPedidos`, `historicoAdministrativo` surgem depois pelos fluxos existentes; não criar coleções com documentos vazios. Campos e índices atuais estão integralmente mapeados no guia técnico, sem alterar o schema runtime.

Criar admin inicial é bootstrap privilegiado **somente no Emulator**: UID explícito, confirmado, existente, ativo, e-mail verificado e provedor permitido. Consulta por UID, nenhuma concessão por e-mail. As Rules continuam impedindo autoelevação e reset direto de contador; não foram relaxadas. O marcador `Bearer owner` é convenção operacional do Emulator, guardada por projeto demo-/loopback/flag; nenhuma credencial real nem rotina administrativa foi colocada no React.

Catálogo inicial vazio; contador0 resulta no primeiro pedido válido#1, sem criar pedido/reserva fictícia no seed. UID administrativo já vinculado a outra loja é recusado: o modelo atual tem um `lojaId` por vínculo global. Mesmo projeto com dois administradores distintos foi testado; escolha definitiva de Firebase por cliente/custos/contas fica para antes do provisionamento real. Clientes podem voluntariamente manter os próprios perfis por loja no mesmo projeto, sem leitura de terceiros ou cópia entre lojas.

Recuperação comprovada: falha antes do commit deixa cinco caminhos ausentes; resposta perdida é confirmada por dry-run e retomada sem duplicação; corrida de precondição preserva o escritor concorrente e não cria outras partes; seed após catálogo/pedidos é recusado sem renumerar. Não há rollback destrutivo automático nem migração/restauração de lojas existentes embutidos no seed. Manifesto/hash/versão reproduzem o estado inicial numa instância nova de Emulator. Regras de inventário/backup/restauração permanecem obrigatórias para qualquer ato real/destrutivo futuro.

### Comandos e evidências desta execução

- `node --require ./quality/register.cjs quality/frontend/scripts/provisionar-loja.mjs planejar quality/fixtures/provisionamento/aurora.json` e alias `npm --prefix frontend run loja:planejar -- ../quality/fixtures/provisionamento/aurora.json`: aprovados, sem rede/escrita no banco.
- `node quality/run.cjs frontend-test provisionamento identidadeLoja observacaoItem compras --maxWorkers=2`: **59/59 testes em4arquivos**,19,11s (27desta etapa;32de identidade/editor/checkout preservados). Testes permanentes emquality, sem repetir a suíte ampla da Etapa1 sem necessidade.
- `node quality/firebase/executar-provisionamento.cjs`: **106/106checks**,21.642ms no script integrado; inicialização dos Emulators é separada desse tempo. [Recibo sanitizado](ADAPTACAO_SERVERLESS/REPLICACAO_ETAPA2_EMULATOR.json) com IDs/resultados, hashes de Rules/índices, zero gravação/conta/deploy real. Duas lojas iniciais com cinco documentos cada; cenários adicionais de falha também sintéticos, encerrados com o Emulator exclusivo.
- Fluxos normais testados com Web SDK e serviços reais, sem servidor Express/Functions: catálogo vazio, admin correto e admin cruzado negado; configuração/projeção/revisão; produtos/categorias novos sintéticos; dois perfis/endereços; pedido de retirada10,00 e entrega20,00+7,50;#1 por loja; retry idempotente; concorrência#2/#3 emA enquantoB permanece#1; registro financeiro manual/histórico, titularidade e negações de leitura/escrita cruzada. Catálogos públicos continuam públicos intencionalmente.
- `npm --prefix frontend run build -- --outDir /tmp/catalogo-replicacao-etapa2-validado`: aprovado em14,92s. Aviso pré-existente de chunk>500kB mantido; busca no build não encontrou bootstrap privilegiado/fixtures/projeto sintético. Fontes `frontend/src` e `frontend/public` conservam última alteração da Etapa1, sem alteração nesta etapa; apenas `package.json` recebeu novos comandos.
- Sintaxe Node dos módulos/CLI/runner conferida; `node infra/scripts/verificar-segredos.cjs`: sem achados. `node quality/docs/documentacao.cjs --write` e `--check`: aprovados;1948documentos, links do núcleo válidos. O gerador classifica guia técnico e atualiza o plano comercial sem duplicar normas.

### Falhas encontradas e corrigidas

No primeiro teste, `import.meta.url` sob jsdom/Vite produziu URL de navegador: leitura da fixture corrigida para o diretório do runner.24validações iniciais passaram; mais3validam identidade desativada/não verificada/sem provedor permitido. Comparação REST foi normalizada para null/números/mapas, evitando falso conflito de representação; erro de parêntese durante edição foi detectado por `node --check` e corrigido antes do ensaio. Inventário foi ajustado para reconhecer documento existente sem campos: teste integrado confirma recusa e preservação. A primeira tentativa em sandbox recebeu EPERM ao abrir Auth9198; runner repetido com permissão do ambiente para Emulators locais, sem mudar o alvo. Um build foi chamado na raiz sem package.json e corrigido para `npm --prefix frontend`; build correto aprovado. Nenhuma dessas falhas provocou operação em Firebase real ou alteração de dados da Demo.

### B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

**REP-2-H0 — nenhuma intervenção indispensável nesta etapa local.** Plataforma: Emulator local controlado pelo executor. Objetivo: validar processo sintético. Pré-requisito: autorização desta mensagem, já atendida. Resultado: nenhuma confirmação obrigatória aguardada, sem login/2FA/CAPTCHA/segredo/painel real. Tempo manual/espera humana:0. Etapa3 não iniciada. Decisões futuras de projeto por loja, domínio/custos/contas/UID e atos reais serão preparadas tecnicamente e autorizadas separadamente quando necessárias; não há solicitação de painel futuro nesta ordem.

### Limites, limpeza e estado final

Etapa2 concluída tecnicamente **somente no Emulator**, após implementação/validação/registro/limpeza e verificação final. Etapa1 preservada localmente e ainda sem nova publicação. Sem stage/commit/push/deploy, alteração de Rules/índices/Auth/dados reais ou migração do banco da Demo. Repositório raiz continua com conteúdo não rastreado como na entrada; `git diff --check` sozinho não cobre esses arquivos, portanto foi complementado por scanner, sintaxe, build e testes. `.env`, backups privados, dependências, binários, histórico e builds anteriores necessários preservados.

Temporários descartáveis desta etapa restritos aos próprios `/tmp/replicacao-etapa2-*` (logs/planejamentos diagnósticos/script documental) após registrar resultados. Build atual de revisão `/tmp/catalogo-replicacao-etapa2-validado` preservado; fontes/fixtures e testes permanentes emquality/ não são resíduos. Nenhuma exclusão importante pendente. Emulators exclusivos/atores SDK encerrados pelo harness. Guia externo ausente em `/home/lucas/Documentos/lojaDemoRestaurante/`, sem recriação. Tempo de comandos registrado acima; sessão técnica sem cronômetro integral confiável desde a leitura inicial, sem estimativa apresentada como medição. Espera humana zero; revisão automática para ambiente local é separada da execução de testes.

Riscos no registro oficial: provisionamento real ainda não autorizado/implementado; Auth compartilhado não significa contas separadas por loja; mesmo UID admin não suporta múltiplos vínculos nesse modelo; Emulator não homologa índices publicados. B-03/B-04, metadados dinâmicos, publicação da Etapa1 e aceite comercial continuam delimitados. Posição dos noveMVPs e Matriz de Migração sem mudança de contrato.

**Próxima tarefa exata: Etapa3 — revisar serviços JavaScript/SDK, resolução de loja, sessões, contratos e isolamento reutilizando as provas desta etapa, somente após autorização específica.** Não iniciar automaticamente nem provisionar cliente real por associação.

Verificação após limpeza da Etapa2:27/27 testes de provisionamento aprovados em4,03s; inventário/links e estado Git novamente conferidos. Log pontual próprio removido após registrar o resultado. Sem limpeza importante pendente de aprovação.

## Execução local — 28/10/2026 — ETAPA 3 SERVIÇOS JS

Estado: **concluída tecnicamente localmente**. Autorização expressa do proprietário no anexo “ETAPA3 — BACK-END JS / FIREBASE SDK MULTILOJA”, hash012da66042fd7d0c2073044d5f808c28086b4ba8fea0160454104042a8ed9f54; supera a espera registrada ao encerrarEtapa2. Não autoriza Etapa4 ou operações reais. [Relatório obrigatório](RELATORIO_ETAPA_3_SERVICOS_JS.md) registra serviços, arquivos, problemas, correções, testes, limites e pendências, preservando o planejamento e histórico acima.

### A — EXECUÇÃO PELO CODEX

| ID | Objetivo / arquivos e função | Pré-requisito / operação / dependência | Resultado / teste | Tempo / estado |
| --- | --- | --- | --- | --- |
| REP-3-C1 | `identificador.js`, `ambienteAplicacao.js`, validadores dos serviços e `.env.example`: identificação segura por loja/host | Ordem atual; configuração pública explícita, sem mudar IDs/dados reais | Sem fallback para Demo; mapa obrigatório em domínios externos; IDs inválidos recusados antes dos caminhos;375testes da regressão incluem negativos | Concluído local; implementação sem medição isolada |
| REP-3-C2 | `autenticacao.js`/`conta.js`, serviços perfil/pedidos/admin: contexto Auth reutilizável e sessão ausente | Reaproveitar fluxos existentes; Auth Emulator, sem privilégios por e-mail | Cadastro/login/reset/troca/logout/anon→conta/Google sintético; UID preservado; duplicação bloqueada;401 explícito | Concluído; integrado ao ensaio99checks |
| REP-3-C3 | `tentativaCheckout.js`, `firebase.js`, `carrinhoSessao.js`, `Checkout.jsx`: armazenamento e limpeza por loja/UID | Etapa1 mantida, chaves usuais da Demo preservadas | Nenhum dado deB migrado/apagado pela sessãoA; codificação evita colisão; regressão de observações/checkout preservada | Concluído; testes locais |
| REP-3-C4 | `adminCatalogo.js`/`adminGestao.js`: GET em andamento compartilhado, criação por intenção e DTO de pedido validado | Não cachear papel; mesma intenção/UID/payload, Rules existentes | Duas criações idênticas→uma gravação/revisão; divergência409; revogação revalidada; dashboard recusa lojaId inconsistente | Concluído;99checks e teste de contagemGET |
| REP-3-C5 | `multiloja.test.js`, testes existentes atualizados, runner/harness e `servicos-multiloja-emulator.mjs`; alias npm | Reutilizar provisionamento/fixtures daEtapa2 e Web SDK real; somente Emulators | **375/375 testes**, **99checks de serviços**, **106de regressão do provisionamento**, build aprovado; recibos separados, originalEtapa2 preservado |124,31s;60.640ms;21.358ms;build24,65s; concluído |
| REP-3-C6 | Relatório3, plano, Guia Mestre, Registro/Diário/Continuidade, Matriz, manuais, riscos, guia consolidado local, classificador/índice/inventário | Regras14/15 e documentação permanente | Arquivos/funções/comandos/falhas/limites registrados; scanner sem achados;1951docs/links aprovados; temporários próprios removidos | Concluído; verificação após limpeza no adendo |

### Decisões e evidências

Contratos de banco/Rules/índices preservados. Mesmos serviços com dependências explícitas; nenhuma aplicação/servidor novo. Admin continua vinculado à sua loja por UID, sem papel conferido pelo e-mail. Auth compartilhado por projeto não implica contas segregadas por documento; dados próprios ficam nos caminhos loja/UID. Configuração canônica da Demo permanece explícita, sem fallback para hospedar cliente novo. Nenhum contador real reiniciado nem histórico renumerado; ID técnico continua nos caminhos/links e o número comercial é mostrado ao usuário.

Evidências permanentes: [serviços99checks](ADAPTACAO_SERVERLESS/ETAPA3_SERVICOS_EMULATOR.json) e [provisionamento106checks](ADAPTACAO_SERVERLESS/ETAPA3_PROVISIONAMENTO_REGRESSAO.json). As Rules/índices têm os mesmos hashes da prova original daEtapa2. Fonte do provisionador e manifestos preservados; o runner adicionou seleção de cenário/recibo para não sobrescrever a evidência anterior. Build atual em `/tmp/catalogo-etapa3-validado`; bootstrap/fixtures não estão nos assets. Script de ensaio: `npm --prefix frontend run firebase:emulator:servicos-multiloja`. Regressão de seed: `node quality/firebase/executar-provisionamento.cjs --regressao-provisionamento`. Comandos e resultados completos no relatório.

Falhas relevantes: teste real encontrou conflito de criação simultânea e levou à correção no serviço sem relaxar Rules. Tests/mocks de Auth ajustados para refletir sessão do SDK e encerrar popup pendente; fixtures passaram a informar hosts explicitamente. Revisão automática inicialmente não reconheceu o anexo; evidência com linhas/hash da mensagem atual demonstrou autorização e liberou o ensaio local. Nenhuma barreira contornada ou autorização humana repetida. Inventário regenerado após criar o novo recibo. Detalhes no relatório, sem copiar logs de autenticação.

### B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

**REP-3-H0: nenhuma intervenção indispensável nesta etapa local.** Plataforma: Emulators/projeto fictício. Objetivo: validar serviços e isolamento. Momento: bloco atual autorizado; pré-requisitos atendidos pela ordem anexada e infraestrutura local já existente. Resultado: concluído sem pedir senha/token/login pessoal/2FA/painel. Evidência automatizada sanitizada nos recibos. Tempo manual/espera humana0. Não solicitar ações de produção futuras nesta ordem.

### Estado final, limites e próxima tarefa

Etapas1,2e3 concluídas tecnicamente localmente; não publicadas por esta sequência. Arquitetura React/Vite/ES6 + Firebase Web SDK/Auth/Firestore/Rules mantida, sem Express/Render/Functions. Sem gravação Firebase real, IAM, Auth real, criação de loja real, publicação de Rules/índices, stage/commit/push/deploy. Código de marca/estilos daEtapa1 e procedimento/recibo original daEtapa2 preservados. Histórico/backups/fontes/testes/artefatos necessários mantidos. Nenhuma exclusão importante pendente. Guia externo ausente, não recriado.

GoogleOAuth pessoal/domínios reais, índices compostos publicados, B-03 flag/Rules remotas, B-04 gravação em etapas, metadados dinâmicos, escolha de projeto/contas/custos por cliente e aceite visual/comercial continuam com seus limites no registro oficial.375testes e205checks executados nas duas suítes não substituem homologação real. NoveMVPs não recebem baixa por esta etapa; matriz atualizada somente quanto ao contrato reforçado dos serviços.

**Próxima tarefa exata: aguardar autorização para Etapa4 — validação final do banco/segurança/isolamento e homologação da matriz consolidada. Não iniciar automaticamente.** Qualquer ato real/publicação continua exigindo autorização específica; terminar quatro etapas não publica por associação.

Verificação após limpeza da Etapa3:61/61 testes em4arquivos aprovados em8,58s, cobrindo loja/host/cache/Auth/gates e revogação. Inventário/links e Git novamente conferidos; log pontual próprio removido após este registro. Sem limpeza importante pendente de aprovação.


## Execução da Etapa4 — fechamento local

# Adaptação comercial — Etapa4 HOMOLOGAÇÃO LOCAL — 28/10/2026

A — EXECUÇÃO PELO CODEX: Etapas1–4 concluídas tecnicamente no escopo local autorizado. 168checks SDK/segurança/consultas/recuperação +32checks Chrome de duas lojas, 110checks de provisionamento/backup inicial e91checks B-04;379testes React em35arquivos; build19,48s e scanner aprovados. Mesmos fontes React/serviços ligados às duas lojas sintéticas, sem mock comercial; backup tipado e restauração em projeto Emulator separado, incluindo falha/resposta perdida e proteção contra sobrescrita. Manifesto de consultas/índices e guia reutilizável de implantação preparados. Leitura2GET confirmou Rules publicadas71ca8548 iguais à Ordem013 e diferentes da candidata80d4a14c; zero mutações reais. B-03 remoto mantém flagfalse; B-04 por etapas, sem atomicidade semanal. Schema/Rules/índices/runtime comercial e dados da Demo preservados; nenhuma conta real/IAM/stage/commit/push/deploy. NoveMVPs sem alteração de aceite real. Relatório4 detalha arquivos, falhas corrigidas no ensaio, testes e limites; evidências anteriores preservadas. Tempo integral técnico não cronometrado; comandos/recibos medidos, espera humana0.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: nenhuma intervenção indispensável para o fechamento local. Próxima ação exata: definir o primeiro estabelecimento e autorizar sua preparação de implantação, com decisão de projeto/contas/custos/domínio e UID próprio. Bootstrap real, Rules, índices, Auth/OAuth, publicação Pages/domínio e pedido integrado real exigem atos específicos; não iniciados. Seed/backup atuais são exclusivamente Emulator, sem modo produção; operação real deve ser preparada/revisada por alvo. Aceite pessoal/mobile/WhatsApp e riscos oficiais permanecem. Sem limpeza importante pendente; espelho externo ausente, não recriado. Não iniciar implantação automaticamente.


[Relatório4](RELATORIO_ETAPA_4_HOMOLOGACAO.md) · [Guia de implantação](GUIA_IMPLANTACAO_NOVA_LOJA.md). Evidências próprias ETAPA4_*; sem sobrescrever as provas1–3. A estrutura definitiva continua em [PROVISIONAMENTO_LOJAS](PROVISIONAMENTO_LOJAS.md), sem novas coleções.


## Etapa5 — Consolidação e publicação da matriz comercial

A — EXECUÇÃO PELO CODEX: autorização adicional do anexo de28/10/2026, sem reabrir funcionalidades nem criar outro plano. Integrar as quatro etapas em checkout isolado da main oficial, preservar histórico e trabalho local, repetir testes/build/scanner, preparar commits separados e versão candidata. Base remota conferidaff42ee5; sem alterações remotas posteriores identificadas. Build da Demo exige mapa público explícito de host ainda ausente no Cloudflare. [Relatório5](RELATORIO_ETAPA_5_CONSOLIDACAO.md) registra evidências/arquivos/SHAs e diferença de configuração. [Checklist comercial reutilizável](GUIA_IMPLANTACAO_NOVA_LOJA.md#checklist-reutilizável--primeira-venda-e-próximas-instalações) contém16itens por cliente.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: E5-H1, confirmação final antes de atualizar main e acionar publicação; inclui o mapa público exato da Demo preparado no relatório. Só pedir após commits/testes concretos. Firebase real/Rules/índices/IAM/Auth/contas/pedidos permanecem sem autorização de mudança. Homologação online ocorrerá após publicação autorizada, sem escrita real ou pedido de teste; aceite comercial/primeira loja real permanecem posteriores.

| Fase | Estado | Dependência |
| --- | --- | --- |
|5.1 Integração | Validada localmente | Checkout isoladoff42ee5, preservação e merge dos quatro escopos |
|5.2 Testes/build | Aprovados novamente, recibosETAPA5 próprios | Gates essenciais de React, SDK/Rules, recuperação, provisionamento e responsividade |
|5.3 Commits | Locais preparados, E5-H1 pendente para push | Testes/scanner e revisão do conteúdo |
|5.4 Push/Pages | Aguardando E5-H1 | Mapa público, push semforce, SHA esperado e deployment success |
|5.5 Homologação online | Não iniciada | Versão nova efetivamente publicada, sem mutações reais |
|5.6 Registro oficial | Registros locais atualizados; deployment pendente | Commit/deploy real somente quando confirmados |

A Etapa5 só concluirá totalmente após main, deployment e verificação pública comprovados; preparação local não será rotulada como publicação. Não implantar cliente automaticamente.
