# Área do cliente: acabamento e pesquisa — 25/10/2026

**PRONTO PARA PUBLICAR — implementação e validação locais concluídas.** Nenhum stage/commit/push/deploy ou alteração remota nesta ordem. O novo anexo proíbe expressamente publicação automática nesta tarefa e prevalece sobre o pedido de publicação da tarefa anterior. A versão pública permanece f678ee7/Pages2b28a9c6; checkout main8927c27 preservado e limpo, sem receber estes arquivos por associação.

A — EXECUÇÃO PELO CODEX: CLI-VISUAL-01, objetivo corrigir /perfil/pedidos e padronizar visualmente as telas da conta, com pesquisa funcional restrita aos dados já carregados. Pré-requisito: Google/notificações anteriores concluídos, contrato Auth/serviço/Rules preservado. Implementação, testes, revisão visual, build e documentação concluídos. Nenhum novo MVP/plano; atualização da posição no plano único existente.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: CLI-VISUAL-H1, revisão visual da implementação e decisão de publicação posterior. Não há ação técnica/painel indispensável nem bloqueio; publicar exige autorização específica posterior conforme o anexo. Nenhuma senha, confirmação de Firebase ou nova conta solicitada. A avaliação comercial geral não recebe baixa por testes locais.

## Correções e comportamento

As cinco telas usam um único padrão de container com960px máximos, margens iguais e16px laterais no mobile. Fundo cinza claro, cards brancos com borda/sombra discreta, títulos claros e botões existentes padronizados. Mantida a identidade laranja para ações/destaques. Corrigidos o botão de atualizar histórico, o botão equivalente do detalhe e o Cancelar de endereço; os demais formulários/controles continuam os existentes. Filtros e atualização ocupam linhas inteiras no celular para evitar texto cortado. CSS compartilhado e restrito à área do cliente; não houve instalação de Tailwind ou outra biblioteca, pois a aplicação existente usa CSS próprio.

Histórico: cabeçalho, descrição, pesquisa/filtro/atualização, resultados e navegação. Cards identificam pedido, data, produtos, status, total e rota de detalhe existente. Estados separados: “Você ainda não fez nenhum pedido” com Ver cardápio; “Nenhum pedido encontrado” com Limpar pesquisa. Endereços também têm vazio em card e formulário espaçado. Perfil/dados/detalhe usam o mesmo fundo/container e preservam as ações existentes.

A pesquisa filtra em memória a lista retornada por listarPedidos: número/ID (inclusive #), nomes dos produtos, código/rótulo de status e data brasileira quando houver Timestamp. Ignora caixa e acentos, combina palavras e atualiza ao digitar; campo com label, botão de limpar e contagem acessível. Select de status deriva apenas dos pedidos carregados; combina-se com o termo, sem nova consulta. Escopo explícito “Busca nos N pedidos carregados da sua conta.” O serviço atual não tem paginação nessa lista; nenhuma paginação foi criada/removida nem foi prometida busca em pedidos não carregados. Troca de UID não reaproveita consulta/filtro da conta anterior; recurso existente continua responsável por limpar os dados e validar sessão/titularidade.

Atualizar usa notificações globais existentes e trava para impedir cliques concorrentes; sucesso só após concluir a leitura. Falha mantém erro persistente visível e não duplica toast nem emite falso sucesso; dados úteis previamente carregados continuam na tela quando o recurso permite. Busca/filtro e leituras automáticas não geram toast. Loading inicial e retry mantêm PageBoundary; atualização secundária mantém conteúdo/botão ocupado.

Rota real de detalhe preservada: `/perfil/pedido?id=...`; a grafia `/perfil/pedidodetalhes` do anexo não é uma rota atual e não foi criada por associação. Labels de status agora são legíveis e badges usam data-status com o código; regressões existentes foram adaptadas a esse código, preservando a verificação do estado operacional. Nenhum status/valor armazenado foi transformado.

## Testes e evidências

-217 testes existentes/21 arquivos aprovados,110,82s.13 novos testes/1 arquivo aprovados,9,86s:230 casos distintos aprovados em duas execuções, sem contar retestes como casos adicionais.
-37 verificações Chrome locais aprovadas; centralização e ausência de overflow em1440/768/390/320px, lista/vazios/busca por número/produto/status/data, limpar, filtro, ausência de consulta/toast por tecla, botão/resultado/erro de atualização e navegação. Cinco telas revistas também em1440/390/320px. Container desktop960px com232,5px de cada lado útil; mobile390px com16px de cada lado/358px de conteúdo. Seis capturas locais em private-backups/area-cliente-browser, inspecionadas visualmente. Fixture sintética só no build de teste em memória, sem substituir arquivo runtime.
-Build homologacao completo aprovado em48,09s, artefato private-backups/area-cliente-final-build. Credenciais/configurações públicas existentes carregadas de arquivo privado ignorado; nenhum valor reproduzido em Git/logs. Avisos conhecidos de chunks/importação dinâmica mantidos, sem erro. Busca por marcadores comprovou ausência das fixtures de teste no artefato final.
-Cinco fontes de serviços/sessão (pedidos.js, pedidosConta.js, conta.js, firebase.js, useRecurso.js) idênticas por hash à main8927c27. Rules/índices/IAM/Auth/documentos/pedidos reais não alterados nem sincronizados. Proteção testada no novo componente por trocaA→B sem dados/filtros da contaA; consulta existente segue filtrando lojaId+clienteId, com conferência de UID e Rules. Evidência de segurança integrada anterior de25/10/2026 (NOTIFICACOES_EMULATOR_EVIDENCIAS.json) continua referência para serviços inalterados; não foi declarada uma nova execução de Emulator nesta ordem.
-Scanner seletivo dos15 arquivos de implementação/teste: zero segredos; dependências/lock preservados. Checkout de publicação continua limpo; Git original mantém a organização sem commits anterior. Recibo sanitizado: AREA_CLIENTE_VISUAL_EVIDENCIAS.json.

Comandos: `npm test --prefix frontend -- --maxWorkers=1`; direcionado `areaCliente.test.jsx`; `npm run test:visual:cliente --prefix frontend` (Chrome/servidor somente local); `node --check` para os cinco scripts alterados; build Vite `--mode homologacao --outDir ../private-backups/area-cliente-final-build` no frontend, com env-file público já existente e ignorado; `node quality/docs/documentacao.cjs --write`/`--check`. Nenhum teste online foi executado nesta ordem.

Falhas de ensaio corrigidas: plugin de fixtures precisava executar antes da transformação JSX e fornecer stub do módulo API; medição de centralização foi corrigida para usar largura útil excluindo a barra de rolagem. Revisão visual identificou select estreito no mobile, corrigido com controles em linhas inteiras. Essas falhas não alteraram serviços/segurança. Capturas e relatório finais substituem tentativas intermediárias, cujos logs sanitizados permanecem privados. Comparação de fontes é restrita aos cinco serviços listados; arquivos históricos Firebase do remoto não foram copiados/sincronizados.

## Arquivos criados/modificados e função

- `frontend/src/pages/Pedidos.jsx`: Layout, pesquisa local, filtro por status, estados vazios distintos, apresentação e navegação.
- `frontend/src/pages/Perfil.jsx`: Aplica container e superfícies compartilhadas sem mudar sessão ou logout.
- `frontend/src/pages/DadosPessoais.jsx`: Aplica apresentação compartilhada preservando formulário e autenticação.
- `frontend/src/pages/Enderecos.jsx`: Container comum, botões padronizados, formulário espaçado e vazio em card; serviços preservados.
- `frontend/src/pages/PedidoDetalhes.jsx`: Apresentação comum, status/data legíveis e botão de atualização compartilhado; mesma rota/contrato.
- `frontend/src/lib/pedidosApresentacao.js`: Normalização de texto/acentos, filtro dos dados fornecidos e apresentação de status/data; sem acesso ao Firebase.
- `frontend/src/components/conta/AtualizarPedidos.jsx`: Atualização explícita com ícone, loading, trava síncrona e feedback existente.
- `frontend/src/components/conta/areaCliente.css`: Padrão visual único para as cinco telas, pesquisa/filtros e responsividade sem afetar admin.
- `frontend/package.json`: Comando npm test:visual:cliente reproduzível.
- `quality/frontend/test/areaCliente.test.jsx`: 13 regressões de busca, sessão, erro, loading, navegação e estados vazios.
- `quality/frontend/scripts/area-cliente-browser.mjs`: 37 verificações Chrome locais e capturas com fixtures sintéticas em build de memória.
- `quality/frontend/scripts/admin-pedidos-browser.js`: Asserção usa código data-status preservando a verificação de acompanhamento após rótulo legível.
- `quality/frontend/scripts/validar-pages-js-online.cjs`: Seletor de status adaptado à apresentação; script online não executado nesta ordem.
- `quality/frontend/scripts/validar-autenticacao-pages.cjs`: Seletor de status adaptado à apresentação; script online não executado nesta ordem.
- `quality/frontend/scripts/validar-notificacoes-pages.cjs`: Seletor de status adaptado à apresentação; script online não executado nesta ordem.

Documentação: este relatório e AREA_CLIENTE_VISUAL_EVIDENCIAS.json; Guia Mestre, Registro de Trabalho, Diário, Plano único, Continuidade e guia consolidado recebem a posição/resultado/próxima ação. Índice/inventário regenerados pelo quality/docs/documentacao.cjs com classificação deste relatório. Matriz, noveMVPs e riscos comerciais não mudaram; não criada outra lista de riscos ou plano. Espelho externo /home/lucas/Documentos/lojaDemoRestaurante ausente e não recriado.

## Limpeza, limites e próxima ação

Build intermediário próprio desta tarefa removido após inventário de hashes e ausência de referências operacionais; artefato final, fontes, fixtures/testes permanentes, logs necessários, capturas e evidências preservados. Limpeza registrada no recibo final, hashes das fontes/artefato reconferidos depois e nenhuma limpeza pendente. Nenhum arquivo exclusivo/histórico ou artefato da release anterior removido. Tempo técnico desta ordem: aproximadamente10–15min incluindo testes/builds e documentação, sem cronômetro integral; sem espera manual solicitada, tempos automatizados registrados acima. Não houve auditoria geral nem etapa adicional.

Próxima ação exata: revisão visual pelo proprietário e autorização específica de integração/publicação desta correção quando desejada. Nenhum bloqueio técnico identificado. Estado local pronto não significa publicado, aceite comercial ou baixa das ressalvas anteriores.
