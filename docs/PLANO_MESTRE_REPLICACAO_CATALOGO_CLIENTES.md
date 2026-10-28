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

### Checklist de aprovação

- [ ] Etapa 1: duas lojas sintéticas com logos/cores diferentes, sem vazamento ou quebra visual.
- [ ] Etapa 2: manifesto e dry-run de banco, seed seguro e provisionamento reproduzível.
- [ ] Etapa 3: Auth/checkout/admin e transações com isolamento comprovado.
- [ ] Etapa 4: Rules/índices/deploy e segurança homologados por loja.
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
