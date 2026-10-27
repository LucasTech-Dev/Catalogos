# Ordem013 — revisão administrativa, padronização e limpeza

Estado: correções implementadas, testadas e publicadas; verificação pública aprovada. B-03 e julgamento pessoal permanecem delimitados abaixo. Não declarar todo o painel homologado em produção. B-03 remoto permanece pendente de ato separado.

Autorização: anexo do proprietário de26/10/2026. Repositório LucasTech-Dev/Catalogos/main, projeto bancorestaurante/loja-demo, Pages catalogo-demo. Autoriza correções frontend/serviços JavaScript, testes, commit/push e Pages após gates. Não inclui mutações comerciais reais, Auth/IAM, Rules, exclusão de backups/histórico/arquivos incertos. Arquitetura React/Vite/WebSDK preservada; backend histórico não é hospedado nem reintroduzido como serviço.

## A — execução técnica e achados

- Cliques concorrentes: categorias/configurações/produtos/clientes confiavam em estado React. Travas síncronas compartilhadas agora impedem repetição no mesmo evento, antes de disabled renderizar; produtos distintos continuam independentes. A trava cobre a decisão do modal. Campos e cancelamento de categoria bloqueiam durante gravação; desmontagem impede resposta antiga de reabrir modal/alterar a nova página.
- Criação ambígua: nova tentativa após resposta perdida podia gerar outro ID. A intenção aleatória de criação permanece na URL e sobrevive à recarga, sem conteúdo do formulário. Origem/projeção/revisão são transacionais. Repetir o mesmo ID com os mesmos dados retorna o registro existente sem incrementar revisão; conteúdo divergente gera conflito, sem sobrescrever. IDs não substituem autenticação/Rules. Cancelar deliberadamente uma intenção ou abrir outra é operação diferente; nomes iguais são permitidos comercialmente.
- Filtros durante uma gravação: callback antigo podia restaurar fonte antiga e prender loading. Atualização usa a fonte atual, compartilha leituras em andamento e ignora respostas vencidas. Dashboard não recria consulta de período idêntico; pesquisa local não consulta por tecla. Polling de pedidos permanece limitado e sem toast automático.
- Erros recuperáveis: mensagens importantes deixavam de existir quando o toast sumia. Agora erros de formulário ficam inline, inclusive em configurações parciais e ações de pedido. Sucesso/info continuam com no máximo5s, botão de fechar e fechamento externo. Nenhum sucesso é anunciado antes da confirmação. Releitura/histórico falhos não transformam uma gravação não confirmada em sucesso.
- Sessão: consultas simultâneas do mesmo usuário são compartilhadas; logout tem trava, impede novo login durante a saída e não permite que verificação antiga reabra conteúdo. Autorização no servidor/Rules continua obrigatória em cada serviço; nenhuma concessão de privilégio foi adicionada.
- Clientes/pedidos: detalhe do cliente oferece pedidos associados com filtro de titularidade no servidor e paginação. Detalhe do pedido mostra até20eventos administrativos ordenados, com DTO sem UID administrativo, separando financeiro/operacional. Status e revisão comercial preservados. Lista deixa claro que busca por nome é só da página, e número consulta o Firestore. Nenhuma métrica nova/inventada ou confirmação bancária automática.
- Categorias: leitura real constatou Rules71ca8548 publicadas e candidata80d4a14c local. A diferença é a permissão de desativação reversível; não é mera quebra de linha. Edição/ativação disponíveis; desativação em produção fica desabilitada com explicação, padrão VITE_CATEGORIAS_DESATIVACAO=false. Teste local habilita a candidata. Excluir fisicamente continua bloqueado. Habilitar a flag exige antes autorização/publicação/verificação das Rules corretas; não concedida nesta013.
- Produtos reais: ComboClassic e GuaranáLata estão ativos, disponível=false, categoria ativa, preço válido e imagem ausente. Não são falhas de gravação comprovadas nesta rodada: são estados reais preservados. Reativação de ambos os flags e fallback visual são testados com dados sintéticos; não marcar produtos reais disponíveis nem inventar fotos por associação.
- CSS/acessibilidade: padrão administrativo isolado; foco visível, áreas de toque, spinner/aria-busy, erros persistentes, fieldsets desabilitados, modal com foco/Escape/retorno, menu mobile com Escape, movimento reduzido e cabeçalho/sidebar com safe-area. Não há biblioteca nova ou redesenho do catálogo.

## Matriz de controles e verificação

Inventário completo das declarações com arquivo/linha/handler em ORDEM_013_INVENTARIO_CONTROLES.json. Elementos repetidos por produto/cliente/categoria e campos gerados em mapas representam controles da mesma função; quantidades renderizadas constam do inventário DOM do ensaio. Uma declaração de código não é prova funcional. A matriz abaixo relaciona os grupos aos serviços/testes; resultados integrados finais acompanham os recibos.

| Página | Elemento | Funcionalidade / função | Feedback visual | Proteção contra clique duplo | Firestore | Resultado |
| --- | --- | --- | --- | --- | --- | --- |
| Acesso admin | E-mail/senha/form/Google/mostrar senha | login, entrar, entrarGoogle; CampoSenha | Entrando/Saindo, spinner, erro recuperável | travaLogin/saída; Google já possui guarda | Auth + gate usuarios/loja | Unitários; login sintético no Emulator; OAuth pessoal não automatizado |
| NAV/sidebar | Abrir/fechar/menu/backdrop/Escape | toggleSidebar/closeSidebar | menu e foco restaurado | Síncrono, sem escrita | Não | Navegador local e unitários |
| NAV/sidebar | Links Dashboard/Pedidos/Produtos/Categorias/Clientes/Configurações/loja | Navegação e rota selecionada | Link/foco/aria-current | Não é mutação | Gate da próxima rota | Matriz de rotas local; proteção pública após deploy |
| NAV/sidebar | Sair superior e lateral | sessao.sair | Saindo/erro de sessão | trava síncrona, consulta antiga não reabre painel | Auth da sessão | Unitários e navegador sintético |
| Dashboard | De/Até/Consultar período | periodoGestao/admin.dashboard | Consultando/erro de datas | Fonte/Promise compartilhada, mesma seleção não repete | Agregações da loja e período -03 | SDK e unitários |
| Dashboard | Atualizar/Tentar novamente | atualizarComFeedback/useAdminRecurso | loading/sucesso/erro persistente | Promise compartilhada | Somente leitura | Testes de atraso/erro/filtro |
| Dashboard | Ver todos/Novo produto/Configurações/Pedido recente | Links para rotas oficiais | Foco e navegação | Sem operação mutante | Gate na próxima página | Navegador local |
| Pedidos | Busca/input/Buscar | Número remoto; nome local à página | loading/contexto explícito | disabled + fonte compartilhada | Query limitada | Unitários/SDK |
| Pedidos | Todos/status | setFiltro/listar | filtro ativo/carregamento | Estado idêntico não repete consulta | Status permitido; sem inventar aceito/negado | SDK/Rules |
| Pedidos | Filtro de cliente/limpar filtro | listar clienteId / link ver todos | Contexto do cliente selecionado | Leitura compartilhada | Query por cliente com cursor | SDK, sem consultar outras lojas |
| Pedidos | Anterior/Atualizar/Próxima/Pedido | useAdminLista/navegar | disabled/loading | Fonte/cursor; revisão nas escritas do detalhe | Paginação/consulta | SDK/navegador |
| Detalhe pedido | Atualizar/repetir leitura | atualizar | Spinner/erro recuperável | useRef síncrono | Releitura canônica | Unitários/navegador |
| Detalhe pedido | Select/Salvar status | admin.status | Salvando/confirmado/erro | Guarda + revisão esperada + transação | Pedido/histórico atômicos | Matriz de transições e concorrência SDK |
| Detalhe pedido | Confirmar/recusar/cancelar pagamento | admin.pagamento + confirmarAcao | Modal/manual/Saving | Guarda durante decisão e escrita | Registro manual e histórico; não é liquidação | SDK/navegador |
| Detalhe pedido | Cancelar pedido/confirmar/cancelar modal | confirmarAcao/transição | Decisão explícita; não fecha por tempo | Trava antes do modal | Só grava se confirmado e permitido | Unitários/SDK |
| Detalhe pedido | Histórico/repetir falha | historicoPedido | Lista ordenada/estado vazio/erro | Leitura isolada/coalescida | Até20eventos, sem UID no DTO | SDK e UI |
| Produtos | Busca/categoria/mais/anteriores | Filtro local + paginação de categorias | Resultado/loading | Leitura/cursor compartilhados | Produtos/categorias desta loja | UI/SDK |
| Produtos | Editar/Novo produto | Links para formulário | Navegação | Sem escrita pelo link | Gate/form na próxima rota | Navegador |
| Produtos | Ativar/desativar | alternar/admin.salvar | Spinner/resultado/erro | Trava por produto; campos ativo/disponível restaurados | Origem/projeção/revisão atômicos | UI/SDK |
| Produtos | Remover/Confirmar/Cancelar | remover/admin.excluir | Confirmação e resultado | Trava antes da decisão | Remoção lógica; histórico preservado | UI/SDK/navegador |
| Produto novo/edição | Nome/descrição/ingredientes/preço/categoria/imagem/ativo/disponível | atualizarCampo/ingredientesDoTexto | Labels/validação/fieldset | Campos imutáveis durante salvamento | Payload allowlist | UI/SDK |
| Produto novo/edição | Mais/anteriores categorias | useAdminLista | Página e loading | Cursor/consulta compartilhada | Limite100; categoria atual preservada | Testes existentes/novo inventário |
| Produto novo/edição | Criar/salvar/repetir após recarga | salvarProduto/chaveCriacaoAdmin | Salvando/confirmado/erro persistente | Trava + destino estável + retomada transacional | Mesmo ID; conflito se conteúdo divergir | Unitário recarga/SDK retomada |
| Produto novo/edição | Cancelar/voltar/ver produtos | Navegação | Cancelamento só quando permitido | Cancelar bloqueia durante escrita; sair não desfaz commit | Sem escrita nova | Unidade/desmontagem |
| Categorias | Nova/editar/nome/descrição/salvar | abrir/salvarCategoria | Modal/Salvando/erro | Guarda síncrona; intenção de criação estável | Origem/projeção/revisão | UI/SDK |
| Categorias | Fechar/Cancelar/Escape | fecharModal/useAdminModal | Retorno de foco | Guarda de referência e disabled durante escrita | Não | Unitários |
| Categorias | Ativar | mudarAtivacao(true) | Salvando/resultado/erro | Guarda síncrona | Categoria/projeção/revisão | SDK com Rules atuais |
| Categorias | Desativar | mudarAtivacao(false) | Motivo da indisponibilidade em produção | Botão e função bloqueados sem flag | Candidata somente no Emulator | PENDENTE de Rules remotas; não declarar publicada |
| Categorias | Excluir definitivo | Explicação B-03 | Desabilitado/title | Operação negada também no serviço/Rules | Não apaga vínculos | Negativos SDK aprovados |
| Clientes | Busca/paginação/atualizar | Busca só página/useAdminLista | Estado vazio/erro/loading | Sem consulta por tecla; leitura compartilhada | Lista paginada e isolada | Zero/um/vários em unidade; paginação SDK |
| Clientes | Ver cliente/fechar/Escape/pedidos associados | abrir/useAdminModal/navegar | Loading/modal/foco | Trava de abertura; ignora resposta após sair | DTO autorizado + pedidos do cliente | UI/SDK/navegador |
| Configurações | Nome/descrição/Instagram/telefone/WhatsApp/endereço/bairro/cidade/número/UF/logo/imagem/cor/tempo | alterarCampo | Labels/validação e erro persistente | Fieldset + trava de submit | Campos permitidos e projeção pública | Unitários/SDK |
| Configurações | Dias/abertura/fechamento/fechado | horario/diasEditados | Horários legados visíveis; resultado por etapa | Trava no formulário | Somente dias editados; transações por grupo | SDK com falha parcial injetada |
| Configurações | Entrega/retirada/taxa/mínimo/Pix/dinheiro/crédito/débito | alterarCampo/configurar | Validação comercial | Trava síncrona | Preserva vínculos comerciais | SDK/Rules |
| Configurações | Salvar/repetir falha | salvarConfiguracoes | Salvando/etapas/erro recuperável | Reentrada bloqueada; não apaga formulário em recusa | Sucesso só após dias e grupos confirmados | UI/SDK/navegador |
| Global | Fechar toast/clique externo/Confirmar/Cancelar/Tab/Escape/repetir carregamento | ToastProvider/PageBoundary | Até5s; modais persistem até decisão | Resolução única; sem fechar durante escrita crítica | Somente a ação autorizada do chamador | Unidade/Chrome |

## Segurança, desempenho e ambientes

Clientes/outros administradores de loja são negados nos serviços e nas Rules. Origem/projeção/revisão continuam atômicas; não relaxar SecurityRules para cumprir tempo. Pagamentos começam pendentes e são registrados manualmente. Histórico e preços antigos não são recalculados. Nenhuma consulta pública contém dados privados de clientes/administradores. Sem dependência nova, listener generalizado, gateway, Express/Render/Functions ou alteração IAM/Auth/índices real. Lista de clientes não inventa totais; detalhes não expõem UID do operador.

Publicação não comprova uma gravação comercial real. Todos os cenários que criam/editam/removem usam lojas/contas sintéticas em Emulators locais. Login OAuth pessoal, aparelho físico Safari/iPhone/Android, seleção comercial dos dois produtos indisponíveis e fotos permanecem julgamento do proprietário. Janela de estado limpo e contador0 da012 preservada; esta013 não executa seus utilitários de exclusão/reset.

## Estrutura e limpeza

Inventário das12pastas em ORDEM_013_INVENTARIO_ESTRUTURA.json. backend é necessário para AdminSDK/GoogleAuth/recuperação e contratos/testes; .tools-local contém Java/jar efetivamente usados; dependências/builds atuais necessários são preservados. docs, quality, firebase, infra e private-backups não são resíduos. .git/.agents/.aws/.codex são preservados sem publicar conteúdo privado. Arquivos de uso incerto permanecem candidatos, sem exclusão. Nenhuma pasta importante será excluída por idade ou por não ser importada no React. Limpeza de logs/temporários só após resumo/hash/recuperação quando pertinente e helpers encerrados; recibo final identifica arquivos e bytes.

## Testes, falhas e fechamento

Resultados atuais nos recibos ORDEM_013_*.json; verificação pública anexada após deploy em ORDEM_013_PUBLICO_EVIDENCIAS.json. Resultado final local:315frontend,357backend histórico,13infra,320SDK/Rules (77catálogo+84gestão+159pedidos),249Chrome (36catálogo+179gestão+34pedidos). Os17 testes da main são subconjunto dos315, não contados novamente. Testes anteriores não são contados como execução desta ordem. Resultados já executados:357backend;13infra após atualizar asserção histórica;315frontend/30arquivos aprovados na suíte final em233,05s; fontes runtime idênticas à main integrada. Três testes da main com caminhos de fixtures históricos distintos também aprovados em execução específica. Build homologacao do checkout integrado aprovado em28,04s, com aviso não bloqueante do chunk App acima de500kB. A suíte inicial teve uma falha de expectativa sobre cancelamento e toast; corrigida para aguardar liberação assíncrona e exigir erro persistente. Duas chamadas npm no diretório raiz falharam por ausência de package.json; comandos corretos executados em frontend/backend. Uma revisão automática expirou antes de iniciar teste local; repetição única permitida foi aprovada. Não houve rejeição por risco nem operação remota contornada.

Na ampliação do navegador, recargas após injeção de Rules locais deixaram leituras nos canais HTTP/Listen pendentes, apesar de Auth inicializado e usuário válido. Instrumentação só do bundle sintético isolou o problema; a matriz agora encerra o Firestore do ensaio antes de cada navegação completa. Produção não recebe esse hook, segredo ou mudança de transporte. Os ensaios interrompidos são registrados como falhas, nunca como aprovados. O teste de revisão da configuração foi corrigido: grupos inalterados não incrementam revisão, portanto não se exige incremento fixo de11. Matriz Chrome aprovada: nove rotas, oito larguras320–1920px,147checks de layout dentro de179checks de gestão; catálogo36checks, incluindo duas janelas concorrentes. A diferença de15px no tablet era scrollbar: asserção passou a comparar clientWidth. O teste de criação na listagem agora percorre a paginação, pois o ID aleatório não garante primeira página. A tentativa inicial de resolução relativa do helper de Rules partia de backend/package.json e falhou; createRequire(import.meta.url) corrige apenas a ferramenta. Vitest no sandbox não iniciou subprocessos: tentativa encerrada, processos próprios órfãos encerrados, execução autorizada fora do sandbox concluída.

## B — proprietário / pendências delimitadas

013-H1 publicação frontend/serviços/main/Pages autorizada no próprio anexo; não pedir novamente.013-H2 Rules reversíveis B-03 não autorizadas nesta ordem; candidata validada separadamente, produção com flagfalse.013-H3 julgamento físico e sessão OAuth pessoal não automatizados. Os dois outros administradores da012 continuam preservados. Não solicitar exclusão novamente, não reabrir limpeza nem consumir#1 com compra real de teste. Próxima ação exata: proprietário atualizar /admin e conferir na sessão pessoal; Rules B-03 somente em ato específico posterior. Nenhuma intervenção indispensável restante para esta publicação.

## Arquivos e reprodução

Arquivos runtime e regressões selecionados para esta release (fontes históricas fora desse escopo preservadas):

| Arquivo | Função |
| --- | --- |
| `frontend/src/services/projecaoPublica.js` | Retomada idempotente e projeção transacional |
| `frontend/src/services/admin.js` | Facade dos serviços administrativos |
| `frontend/src/services/adminCatalogo.js` | Destino estável e recuperação de criação |
| `frontend/src/services/adminPedidos.js` | Histórico DTO e paginação por cliente |
| `frontend/src/lib/criacaoAdmin.js` | Intenção estável de criação na URL |
| `frontend/src/hooks/useAdminModal.js` | Foco, Tab, Escape e retorno |
| `frontend/src/hooks/useAdmin.js` | Atualização coalescida usando filtros atuais |
| `frontend/src/hooks/useAdminAcao.js` | Trava síncrona por ação/registro e montagem |
| `frontend/src/pages/admin/ProdutoForm.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/PedidoDetalhes.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/Clientes.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/Configuracoes.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/Categorias.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/Pedidos.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/Produtos.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/pages/admin/Dashboard.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/components/ui/ToastProvider.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/components/admin/AdminPadrao.css` | Estilos administrativos responsivos e acessíveis |
| `frontend/src/components/admin/AdminGate.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/components/admin/AdminLayout.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `frontend/src/components/admin/AdminState.jsx` | Página/componente administrativo: guardas, estado, feedback e acessibilidade |
| `quality/frontend/test/admin.test.jsx` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/test/ordem013.test.jsx` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/test/adminPedidoDetalhes.test.jsx` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/scripts/ordem013-publico.cjs` | Verificação pública sem cadastro/checkout/gravações |
| `quality/frontend/scripts/lib/chrome.cjs` | Navegador de testes e descarte de sessão local antes de navegação |
| `quality/frontend/scripts/lib/admin-audit.cjs` | Inventário DOM, nove rotas e oito larguras |
| `quality/firebase/ordem013-readonly.cjs` | Leitura restrita de catálogo e hash Rules, sem escrita |
| `quality/firebase/regras-ordem013.cjs` | Reconstrução e hash de contratos atual/candidato somente para Emulator |
| `quality/firebase/executar-ordem013.cjs` | Runner local Auth/Firestore com encerramento dos processos |
| `quality/docs/ordem013-inventario.cjs` | Inventário estrutural e declarações de controles |
| `quality/frontend/scripts/admin-catalogo-emulator.js` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/scripts/admin-catalogo-browser.js` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/scripts/admin-gestao-emulator.js` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/scripts/admin-gestao-browser.js` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/scripts/admin-pedidos-emulator.js` | Regressão executável de ações/contratos/persistência |
| `quality/frontend/scripts/admin-pedidos-browser.js` | Regressão executável de ações/contratos/persistência |

`frontend/.env.example`: flag B-03 false; `frontend/package.json`: aliases reproduzíveis. Relatório, inventários, recibos e capturas sintéticas registram resultados; Guia Mestre/Registro/Continuidade/Índice apontam a etapa. O inventário integral local em quality/docs/documentacao.cjs não substitui o verificador específico da release: cada checkout verifica somente os documentos existentes em seu escopo. Backend/infra históricos testados na cópia JS, sem reintroduzir hospedagem legada.

Comandos: em frontend, `npm test`, `npm run build -- --mode homologacao`, `npm run firebase:emulator:ordem013`, `npm run test:online:ordem013`. Emulator exige Node24, Java21 e jar Firestore1.22.0 em .tools-local e firebase-tools localmente disponível; backend/node_modules fornece AdminSDK/GoogleAuth ao runner, sem incluir dependências no Git. O runner recusa portas ocupadas e usa exclusivamente projetos demo-/hosts loopback; nunca apontar para bancorestaurante.

Rollback: frontend anterior b0d00c567f3fe057bfc2faa60760b5ce41a7db78 e Pages096db2ed preservados. Se necessário, reverter seletivamente a release frontend por Git, sem apagar pedidos novos, resetar contador ou modificar Rules/dados reais. Tempo: comandos atuais medidos nos recibos; não há cronometragem confiável do esforço técnico acumulado entre sessões26–27/10, portanto não é inventada uma duração total. Espera de build/Emulators/provedor é separada da sessão pessoal e homologação comercial.

Limpeza executada: dois arquivos intermediários/2.175.599bytes removidos da árvore ativa; log antigo preservado comprimido e restauração verificada, captura incorreta substituída. Dois links temporários de ferramentas no checkout removidos sem tocar nos alvos. Recibo ORDEM_013_LIMPEZA.json; nenhuma pasta/fonte/backups/histórico removidos. Gate documental integral foi regenerado após novas evidências; checker de release, diff e scanner sem achados aprovados. Nenhuma limpeza importante pendente de autorização.

## Publicação e verificação final

Código e26cc5609e54e9d85b2dde8eee2ea0ea39018ada enviado à main preservando b0d00c5 e o histórico remoto. Pages3de58476-d266-42bf-90c1-ba040098419e canônico em success às2026-10-27T23:49:45.148Z (20:49:45 Brasília), mesma SHA. Rootfrontend/buildhomologacao/dist e demais configurações remotas preservados; flagB03 ausente, portanto false.31checks Chrome públicos aprovados após deploy em320/390/768/1366px: catálogo, carrinho somente local, cadastro sem submit, nove páginas admin protegidas e Google presente, zero exceçõesJS, nenhuma escrita/conta/pedido real. Não equivale a login pessoal, pagamento bancário ou gravação administrativa real. Persistência foi comprovada nos Emulators; produção foi conferida sem alterar dados.

Manifesto ORDEM_013_PUBLICACAO.json identifica a seleção57arquivos inicial (incluindo o próprio manifesto pelo commit); ORDEM_013_PAGES_EVIDENCIAS.json identifica o deploy de código. Fechamento documental posterior agrega recibos públicos/limpeza e estado atual, sem mudança runtime; a SHA final está no Git. Checkout de publicação limpo/alinhado após push. Raiz Git sem commits, trabalho exclusivo e fontes históricas preservados.20temporários próprios foram removidos após arquivo privado recuperável conferido, além do log/captura/links já descritos. Nenhuma exclusão importante pendente;31checks públicos ocorreram após essa limpeza.

Documentos locais oficiais atualizados: Guia Mestre, Registro, Diário, Plano de Execução, Matriz de Migração (contratos de criação/histórico/filtro), riscos oficiais/referências, Continuidade, Índice e guia consolidado local. quality/docs/documentacao.cjs e quality/infra/test/configuracoes.test.cjs corrigidos somente na cópia histórica local; a release mantém seu checker próprio e fixtures históricas válidas. Índice/Continuidade de release listam apenas documentos existentes, sem copiar em massa o acervo histórico. Guia externo /home/lucas/Documentos/lojaDemoRestaurante ausente, não recriado nem declarado atualizado.
