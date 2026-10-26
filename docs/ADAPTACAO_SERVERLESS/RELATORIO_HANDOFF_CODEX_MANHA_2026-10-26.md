# RELATÓRIO DE PASSAGEM PARA O CODEX — MANHÃ DE 26/10/2026

**Projeto:** Catálogo JS / `LucasTech-Dev/Catalogos`  
**Branch:** `main` (produção Cloudflare Pages `catalogo-demo`)  
**Commit de referência no início deste relatório:** `1a49a2f9717fcb6d00c557e1ee5672c5fe244e12`  
**Site:** https://catalogo-demo-cz1.pages.dev/  
**Firebase real:** `bancorestaurante`, loja `loja-demo`.  
**Arquitetura:** React + Vite, JavaScript, Firebase Auth + Firestore Web SDK diretamente no frontend, Cloudflare Pages. **Não reintroduzir Express/Render** para estas correções.

## 1. Objetivo do handoff

O proprietário quer terminar a demo funcional rapidamente e reaproveitá-la como modelo replicável para clientes reais. Priorizar correções efetivas e verificáveis, e NÃO refazer arquitetura, criar MVPs desnecessários ou reiniciar projeto. Usar `AGENTS.md`, Guia Mestre e `docs/ADAPTACAO_SERVERLESS` como fontes de contexto; documentar arquivos alterados. Este relatório registra as intervenções feitas pelo assistente diretamente na `main` via GitHub durante a manhã de 26/10/2026 e as tarefas ainda não concluídas.

**Distinção crucial:** “commit na main” NÃO equivale a “build/testes passaram”, “deploy Cloudflare publicado”, “Security Rules implantadas” nem “gravação no Firestore real validada”. Diversas modificações abaixo foram feitas por edição remota pontual, sem testes automatizados ou browser E2E. Antes de anunciar conclusão, executar validações apropriadas.

## 2. Linha do tempo dos commits de hoje

Horários aproximados em Brasília, conversão UTC-3 a partir do histórico GitHub; lista em ordem cronológica:

| Commit | Mudança efetivamente enviada à `main` |
| --- | --- |
| `376fbfe3`, `8673c52c` | CSS do Dashboard: filtros de data, cards, responsividade e estados de carregamento. |
| `d569115d` | Commit vazio para tentar forçar deploy da Cloudflare; em captura posterior a Cloudflare mostrou deploy de `d569115` em produção. |
| `f13ad3b1`, `dd61db83` | CSS e busca/filtros da listagem administrativa de pedidos; exibe “Pedido histórico sem número” em vez de “#Sem número” para legados. **Não migra documento nem cria número.** |
| `9c2a03b6` | Detalhes administrativos: mostra os oito status técnicos existentes no seletor; transições proibidas desabilitadas, preserva as validações de Rules e financeiras. **Não implementa os sete novos estados comerciais solicitados.** |
| `bb80b16a` | Registra tarefa autorizada, mas ADIADA, de limpeza de pedidos antigos no Firebase. |
| `480e5cd6`, `934f77db` | Página Produtos: CSS, loading e confirmação; editar, ativar, desativar e “remover do catálogo” (remoção LÓGICA, não exclusão física). |
| `042ae08a`, `8cd7061d` | Página Categorias: CSS, criar/editar/ativar e explicitação do bloqueio B-03. |
| `fc11bebf` | Serviço administrativo de produtos: diagnósticos específicos para categoria inativa/ausente antes de salvar. Ex.: Combo Classic está associado a Combos, que aparece inativa. **Não comprova que Guaraná Lata funciona.** |
| `9d8cfc74`, `eb40b79c`, `a97de29f`, `ee5c8197` | Preparo de desativação reversível de categoria: alteração local de `firebase/firestore.rules`, serviço e botão; documentação B-03. **Rules do Firebase real NÃO foram publicadas.** Exclusão física de categoria continua bloqueada. |
| `d869d821` | Configurações: corrige descarte silencioso de dias de horário editados quando há formatos legados; mostra feedback de salvamento. |
| `2f6e2a4d` | Listagem de pedidos: atualização ao voltar/retomar aba e polling a cada 45 segundos enquanto visível; ainda é consulta HTTP/Firestore, NÃO listener realtime. |
| `e5a229b5` | WhatsApp: diferencia status financeiro manual de confirmação bancária; rotula pedido legado sem número. |
| `feca6b28` | Checkout: evita recuperar/reusar pedido antigo persistido no browser se cliente tem carrinho novo; preserva pedido antigo no Firestore. |
| `1a49a2f9` | CSS do layout admin: NAV/topbar passa a ocupar largura inteira da janela no desktop, acima da sidebar. |

**Atenção:** alguns commits desse mesmo dia são intermediários; conferir SEMPRE o HEAD da `main` e o diff final. Este relatório NÃO contém resultados de testes posteriores a esses commits.

## 3. Arquivos principais envolvidos

- `frontend/src/styles.css`: topbar/largura total; Dashboard também possui `frontend/src/pages/admin/Dashboard.css`.
- `frontend/src/components/admin/AdminLayout.jsx`, `AdminHeader.jsx`, `AdminSidebar.jsx`: estrutura do painel.
- `frontend/src/pages/admin/Pedidos.jsx` e `Pedidos.css`: lista, busca, filtros, atualização.
- `frontend/src/pages/admin/PedidoDetalhes.jsx` e `PedidoDetalhes.css`: status operacionais, validação visual, pagamentos.
- `frontend/src/services/adminPedidos.js`: transições, consultas getDocsFromServer, transações para status e histórico administrativo.
- `frontend/src/lib/numeroPedido.js`: formatação de números.
- `frontend/src/services/pedidoIncremental.js`: novo pedido, idempotência, numeração pública, contador e reserva em transação Firestore.
- `frontend/src/pages/Checkout.jsx`, `frontend/src/lib/tentativaCheckout.js`: tentativa de compra local, retomada, novo pedido.
- `frontend/src/lib/whatsappPedido.js`: mensagem de WhatsApp.
- `frontend/src/pages/admin/Produtos.jsx`, `Produtos.css`, `ProdutoForm.jsx`: catálogo administrativo.
- `frontend/src/pages/admin/Categorias.jsx`, `Categorias.css`: categorias administrativas.
- `frontend/src/services/adminCatalogo.js`: serviços de edição, categoria, produtos e projeção pública.
- `frontend/src/pages/admin/Configuracoes.jsx`, `frontend/src/services/adminGestao.js`: configurações e gravações.
- `frontend/src/services/projecaoPublica.js`: sincronização das projeções comerciais e revisão.
- `firebase/firestore.rules`: Rules LOCAIS no repo; publicação no Firebase real é operação separada.
- `docs/ADAPTACAO_SERVERLESS/PENDENCIA_LIMPEZA_PEDIDOS_RETOMAR_EM_CASA.md`.
- `docs/ADAPTACAO_SERVERLESS/PENDENCIA_B03_DESATIVACAO_CATEGORIAS_20261026.md`.

## 4. Comportamentos observados em produção por capturas do proprietário

1. **Cloudflare:** inicialmente `catalogo-demo` mostrava aviso de repositório desconectado e último deploy `dfbc3dd`. Instalação GitHub App `Cloudflare Workers and Pages` estava presente e autorizada para todos os repositórios; Build configurado com `main`, raiz `frontend`, comando `npm run build -- --mode homologacao`, saída `dist`. Após o commit vazio `d569115d`, a Cloudflare mostrou um deployment de produção verde desse commit. **Não concluir, só por isso, que todos os pushes subsequentes deployaram.**
2. **Pedidos:** em 26/10 a página listava pedidos legados “Pedido histórico sem número”. Depois, uma captura mostrou **Pedido #3**, da Nathália, total R$ 73,70, status Recebido, em 26/10/2026 às 10:47. Isso indica que ao menos um novo pedido NUMERADO passou a aparecer no admin depois das correções. Não demonstra que todos os novos pedidos ou os testes de concorrência funcionem.
3. **Pedido da Nathália enviado via WhatsApp anteriormente:** texto de **Onion Rings, R$ 26,90, “PEDIDO #Sem número”**, status financeiro “Confirmado”, enquanto proprietário afirmou que era compra recém-feita e não aparecia como pedido novo. Na lista administrativa havia registro anterior de Nathália de R$ 26,90, com status “Pagamento confirmado”, criado em 25/10/2026 às 20:29. Hipótese de reuso indevido de pedido anterior persistido no browser levou ao commit `feca6b28`. **Hipótese plausível, não diagnóstico confirmado por logs/Firestore.** Não assumir que dinheiro foi recebido; não alterar status de forma retroativa sem auditar documento e `historicoAdministrativo`.
4. **Produtos:** Combo Classic e Guaraná Lata apareciam indisponíveis e falhavam ativação/edição com “Alteração recusada pelas regras do catálogo”. Causas individuais não comprovadas. `Combos` constava categoria inativa. Verificar IDs, campos, projeção, Rules e versão de dados; não inventar sucesso.
5. **Categorias:** criar/editar/ativar existiam; desativar e excluir bloqueados pelo B-03. Nova implementação de desativar necessita deploy controlado das Rules após testes. Não declarar pronta em produção.
6. **Configurações:** código de gravação/projeção presente, mas não houve teste real authenticated end-to-end durante as edições desta manhã.
7. **NAV administrativa:** captura indicou topbar começando após os 260px da sidebar; `1a49a2f9` muda `left:260px` para `left:0` no desktop. **Ainda não confirmado em navegador depois do deploy.**

## 5. Pendências prioritárias para o Codex

### P0 — Verificações imediatas, evitar regressão (15–35 min estimados, NÃO garantidos)

- Fazer `git fetch`, reconciliar com `origin/main`, inspecionar `git log` recente e quaisquer arquivos locais que o Codex possua. **Não sobrescrever alterações locais relevantes nem fazer force push.**
- Instalar dependências existentes (sem trocar stack), rodar testes essenciais, build de homologação e scanner de segredos. Conferir compilação de **Produtos**, **Categorias**, **Configurações**, **Checkout**, **Pedidos** e CSS de NAV.
- Testar browser desktop/mobile nas áreas alteradas. Capturar falhas reais e corrigir no menor patch possível.
- Verificar Cloudflare `catalogo-demo` e confirmar commit em produção; build e logs. Commit na `main` não significa deploy concluído.
- Verificar se a mudança da NAV acima da sidebar não cria sobreposição do cabeçalho/menu, principalmente em breakpoints 981px/980px/640px.

### P0 — Fluxo crítico: pedido novo, número e pagamento (30–60 min estimados, depende de testes)

- Reproduzir o caso “cliente clica em Registrar pedido, mas WhatsApp mostra pedido anterior”. Validar `tentativaCheckout`, recuperação de pedidos por UID/chave, navegação, novo carrinho e mudança de sessão. **Verificar se o novo código baseado em itens no carrinho não interfere com retomadas legítimas, casos de erro de rede ou idempotência.**
- Criar cenários no Emulator: checkout primeira compra, segunda compra mesma pessoa, conta anônima, duas contas separadas, duas compras simultâneas, pedido antigo com ID técnico, reabertura do checkout, perda de rede/resposta incerta. Verificar que nenhum pedido é criado duas vezes.
- Verificar que checkout SEMPRE começa com pagamento `pendente` até o administrador alterar manualmente; seleção de cartão de débito não confirma pagamento. A alteração financeira deve ser autorizada, transacional, auditada e refletida corretamente para cliente.
- Confirmar `numeroPedido` gerado no Firestore e idêntico no checkout, WhatsApp, painel, detalhes e perfil. Evitar `#Sem número` para qualquer novo pedido; legados sem número devem permanecer identificados como legados, até limpeza autorizada.
- Verificar status no painel com dados novos e mecanismo de atualização; polling a cada 45s deve evitar consultas desnecessárias e evitar perda de estado quando filtro muda.
- Auditar o registro legado de Nathália de R$ 26,90 e o histórico financeiro por leitura autenticada, se houver autorização/identidade apropriadas. Não expor dados pessoais em logs/documentação pública.

### P1 — Categorias: B-03 (20–45 min de código/testes + publicação separada)

- Rodar suíte Firestore Emulator em `firebase/firestore.rules` revisadas. A mudança preparada permite inativação reversível, mas **não está publicada no Firebase real**.
- Validar admins próprios, admins de outra loja, clientes, escrita de projeção, revisão, status de produtos vinculados, reativação, histórico de pedidos.
- Após testes, solicitar autorização específica para publicar Rules e executar apenas o deploy de Rules no `bancorestaurante`. Não relaxar leitura/escrita de clientes/pedidos.
- Verificar operações realmente recusadas pela Rules e diferenciar erro de versão/transação de erro de permissão.
- Exclusão definitiva de categorias continua BLOQUEADA; considerar arquivamento/desativação como solução comercial segura, sem burlar Rules. Não criar exclusão física sem estratégia de vínculo.

### P1 — Produtos (20–40 min estimados)

- Validar **criar novo produto, editar, ativar, desativar, remover logicamente, reativar** e reflexo imediato no catálogo público.
- Investigar Combo Classic e Guaraná Lata individualmente. `Combos` estava inativa; para Guaraná, a causa exata é desconhecida.
- Verificar se “Remover do catálogo” altera efetivamente `ativo:false` e `disponivel:false`, se a projeção pública é atualizada e se o rótulo “Removido” não confunde com produto apenas desativado.
- Produto com categoria inativa, inexistente, preço inválido, dados legados e imagem ausente não deve falhar silenciosamente.
- **Imagens quebradas continuam pendentes** em alguns itens (Bacon Burger, Chicken Crispy, Coca-Cola, etc.), conforme capturas anteriores; verificar URLs/origem e fallback seguro. Não substituir imagem por produto diferente.

### P1 — Configurações (20–40 min estimados)

- Rodar casos de horários com dias em formato antigo (texto), dias editados separadamente, fechamento, intervalo inválido e gravação parcial.
- Testar nome, descrição, Instagram, WhatsApp, endereço, entrega, retirada, taxa, pagamento, identidade visual; validar persistência e projeção pública.
- Confirmar com reload que os dados realmente retornam do Firestore. Nunca apresentar sucesso se ocorreu escrita parcial.
- Garantir que regras e validações comerciais razoáveis permaneçam — “sem restrição” não significa permitir dados inválidos.

### P2 — Status comerciais definitivos (30–60 min estimados, exige definição/migração/testes)

O usuário pediu o fluxo simplificado: **Recebido, Pedido aceito, Pedido negado, Pagamento aceito, Em preparação, Saiu para entrega, Entregue**. O sistema ainda suporta estados legados `recebido`, `pagamento_confirmado`, `pagamento_recusado`, `em_preparacao`, `pronto`, `saiu_para_entrega`, `entregue`, `cancelado`.

- Definir migração retrocompatível (históricos, badges, dashboard e regras), sem renomear estados em produção sem validação.
- Não confundir **status operacional** com **status financeiro**. “Pedido aceito/negado” e “Pagamento aceito” precisam de semântica explícita, e confirmação manual não é confirmação bancária.
- Alterações exigem alinhamento entre frontend, serviços, Firestore Rules, testes e deploy das Rules com autorização separada.

### PENDÊNCIA EXPRESSAMENTE ADIADA — Exclusão dos pedidos antigos

**Não fazer agora sem o proprietário retomar esta etapa**, apesar de já existir autorização registrada para a exclusão especificamente delimitada de pedidos antigos. Consultar `docs/ADAPTACAO_SERVERLESS/PENDENCIA_LIMPEZA_PEDIDOS_RETOMAR_EM_CASA.md`.

- Fazer inventário e BACKUP RECUPERÁVEL dos pedidos, históricos, idempotência, reservas e contador ANTES de excluir.
- Não apagar produtos, categorias, clientes, Auth, loja ou demais coleções.
- Não resetar contador para #1 se existirem reservas/números legítimos, referências sobreviventes ou pedidos comerciais já comunicados. **Já foi observado Pedido #3 em 26/10**; isso deve ser considerado explicitamente.
- Cloud Codespaces/Codex falhou no navegador (extensão e erro `SIGILL`); plugin Firebase no ChatGPT falhou em instalar. Retomar no ambiente local e com credenciais de administração, sem expor chaves.

## 6. Regras de segurança e implantação

- O Firestore e o catálogo público são produção real. Jamais copiar Rules “abertas” ou autorizar `allow read, write: if true`.
- `firebase/firestore.rules` local no GitHub foi alterado para desativação de categoria. **Não presume deploy**.
- Código de frontend em `main` aciona pipeline Pages, mas precisa confirmação do SHA em **Deployments**, testes online e preservação de variáveis.
- Evitar script com Admin SDK como parte do frontend, nem expor credenciais privadas.
- Não excluir dados remotos sem inventário, backup, identificação de caminho e autorização adequada.
- Não reverter a demonstração em base fictícia, nem criar backend Render/Express apenas para resolver GETs.

## 7. Critérios de aceite para o próximo encerramento

1. Testes + build passam para HEAD atual, com resultado quantitativo real (não reaproveitar contagens antigas).
2. Browser desktop e mobile sem regressões nos principais fluxos.
3. Um pedido NOVO de verdade é criado uma única vez, numerado e visto pelo admin; financeiro inicia pendente e só muda após ação administrativa confirmada.
4. Editar/ativar produto funciona no Firestore e no catálogo público, com isolamento da loja.
5. Configurações básicas ficam persistidas após reload; horários legados não são ignorados.
6. Categoria: se não publicar Rules, informar **pendente**; se publicar com autorização, testar efeito real e registrar evidências.
7. NAV ocupa toda largura sem ocultar sidebar ou ações.
8. Registrar commits, deploys reais, arquivos alterados, testes, limitações e pendências no Guia Mestre/índice/documentação oficial.

**Ordem recomendada para rapidez:** (1) build/regressões/deployment; (2) pedido novo/numeração/pagamento; (3) produtos; (4) configurações; (5) Rules B-03; (6) refino comercial de status; limpeza antiga só quando retomada.

## 8. Instrução pronta para o Codex

> Leia este relatório, `AGENTS.md`, o Guia Mestre e documentação da Ordem 011. Faça primeiro um inventário não destrutivo da `main` e validação dos commits listados. Execute testes, corrija falhas concretas com o mínimo de alteração, valide criação/numeração e financeiro de pedidos, produtos e configurações. Não afirme que algo funciona só porque existe um botão ou commit. Preserve dados comerciais, identidades e histórico. **Não execute a limpeza de pedidos antigos nesta rodada.** Security Rules no Firebase real, IAM e operações destrutivas demandam autorização explícita separada. Verifique deploy da Cloudflare e atualize a documentação oficial com evidências, arquivos e pendências.
