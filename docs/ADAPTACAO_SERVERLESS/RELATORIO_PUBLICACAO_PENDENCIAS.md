# Publicação das pendências prontas — 25/10/2026

A — EXECUÇÃO PELO CODEX: PUB-PEND-01. Autorização geral expressa no anexo desta sessão para integrar, commitar, fazer push normal na main de LucasTech-Dev/Catalogos e publicar no Pages catalogo-demo, preservando configurações homologadas e Firebase real. A retomada mantém essa autorização. Objetivo: publicar CART-01 e CLI-VISUAL-01, sem novo MVP ou funcionalidades adicionais.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: PUB-PEND-H1. Nenhuma intervenção técnica indispensável identificada. Consentimento Google pessoal já confirmado em OAUTH-H2; não repetir desafio humano. Avaliação visual/comercial geral permanece do proprietário e não é presumida pelos testes.

## Escopo e preparação

Carrinho isolado por loja/conta, logout vazio, transferência única de visitante e observações por produto; apresentação unificada das cinco telas da conta e pesquisa local de pedidos por ID/produto/status/data. Demais correções de autenticação, notificações, loading, imagens e GETs já publicadas, preservadas nesta integração.

Checkout de publicação existente: private-backups/publicacao-js-main. Main8927c27 limpa e alinhada com origin/main após fetch, histórico preservado; Git original sem commits permanece intacto. Seleção compara fontes atuais com esse checkout, sem copiar árvore inteira, backend histórico, configurações Firebase, ambientes, backups ou migrações. Dois testes de contrato mantêm os caminhos de fixtures próprios do checkout remoto; scripts npm existentes preservados, acrescentado apenas test:visual:cliente. Não remover arquivos remotos ausentes nesta cópia.

Arquivos/funções de runtime e testes descritos nos relatórios RELATORIO_ISOLAMENTO_CARRINHO.md e RELATORIO_AREA_CLIENTE_VISUAL.md. A seleção inclui fontes frontend afetadas, testes de sessão/compras/apresentação e scripts de verificação compatíveis com a nova apresentação. Novo quality/frontend/scripts/validar-pendencias-pages.cjs preserva o verificador anterior e acrescenta pesquisa, responsividade e isolamento online de carrinho com contas sintéticas já existentes. Escritas Firestore, cadastro, alteração/recuperação de conta e envio WhatsApp bloqueados pelo navegador; checkout sem submit. Nenhuma credencial incorporada: leitura do arquivo privado de homologação existente, sem imprimir valores.

## Validação e publicação

Build homologacao no checkout integrado aprovado em29,77s, artefato privado publicacao-pendencias-build. Avisos conhecidos de chunk grande e importação estática/dinâmica, sem erro. Scanner seletivo inicial:28 arquivos, zero achados de chaves privadas/tokens/configuração Firebase embutida. git diff --check aprovado. Suíte integrada:234 testes aprovados em22 arquivos; vitrine.test.jsx não carregou por usar caminho de fixture do workspace original. Corrigido somente no checkout para a fixture contratos-originais já preservada, assim como os dois testes de contrato. Reexecução direcionada aprovada:12/12 em8,03s. Total246 casos distintos aprovados/23 arquivos; a falha de resolução anterior fica registrada e não é contada como teste funcional aprovado. Publicação ainda pendente.

Comandos: git fetch origin main; npm test --prefix private-backups/publicacao-js-main/frontend -- --maxWorkers=1 --reporter=verbose; Vite build --mode homologacao com env-file público existente e ignorado; node --check no novo verificador; scanner seletivo privado. Logs e lista de arquivos mantidos em private-backups/publicacao-pendencias-*.

## Limites, recuperação e continuidade

Nenhuma alteração Firebase real/Rules/índices/Auth/IAM/dados comerciais autorizada nesta ordem. Sem novo pedido, pagamento, conta ou recurso pago. Rollback frontend disponível no deployment2b28a9c6/códigof678ee7; eventual reversão não modifica Firebase. Nove MVPs, B-03/B-04, quatro fotos pendentes e demais ressalvas comerciais preservados. Cache legado sem dono continua preservado e não é importado; carrinho antigo pode aparecer vazio após atualização.

Build atual, fontes, testes, histórico, backups e evidências necessários preservados; nenhum resíduo comprovadamente dispensável gerado para exclusão. Espelho externo /home/lucas/Documentos/lojaDemoRestaurante ausente, não recriado. Próxima ação desta mesma ordem: concluir suíte integrada, commit/push e Pages já autorizados, validar URL oficial e registrar resultados finais. Estado: EM EXECUÇÃO, publicação ainda não confirmada.
