# Isolamento do carrinho — 25/10/2026

A — EXECUÇÃO PELO CODEX: CART-01. Pedido do anexo desta sessão autoriza investigação/correção local e testes; proíbe alterações reais, Rules/Auth/IAM/índices, commit/push/deploy. Pré-requisito: preservar a implementação comercial e o trabalho CLI-VISUAL-01 já presente. Estado: PRONTO PARA PUBLICAR — correção concluída localmente, publicação dependente de autorização específica. Nenhum novo MVP ou plano concorrente.

## Diagnóstico e comportamento

LojaContext mantinha uma única lista em `catalogos:carrinho:<lojaId>`, com IDs/quantidades, inicializada sem consultar Auth e persistida sem reação ao logout. Havia separação por loja, mas nenhuma por UID. Uma conta B no mesmo navegador podia ver os itens montados na conta A. A continuidade visitante→login, isoladamente, era correta e não comprova incidente. O defeito foi identificado no código e nos cenários locais; não se acessaram contas de clientes nem se comprovou exposição real de pedidos/perfis/endereços.

Cache v2 usa loja codificada, chave de conta com UID codificado e chave de visitante com marcador de identidade anônima. A inicialização exibe carrinho vazio até a resolução de Auth; não cria sessão Firebase para começar a comprar. Listener acompanha token/login/logout e distinção entre conta e anônimo, inclusive vinculação que conserva UID. Operações persistem imediatamente, antes de navegação, e conferem a identidade atual; ação atrasada de outra sessão apenas troca o carrinho, sem editar a nova conta.

Visitante persiste na navegação/recarga; ao entrar, a compra de visitante assume o carrinho da conta, sem somar quantidades ao cache anterior dessa conta. Essa política evita duplicar a mesma compra: quando existe uma nova compra de visitante, ela substitui a compra anteriormente salva da mesma conta. Sem nova compra, a conta recupera seu próprio cache. Logout abre visitante vazio; troca direta A→B carrega somente B. Outra sessão anônima não recebe notas da anterior. Não há sincronização Firestore nem mistura entre lojas.

O cache legado sem dono fica intacto e não é importado: não é possível atribuí-lo com segurança. Na primeira utilização da versão corrigida o carrinho antigo pode, portanto, aparecer vazio. Os carrinhos de conta permanecem localmente no navegador para recuperação pela mesma conta; isolamento de interface não constitui criptografia/proteção contra quem inspeciona o armazenamento do próprio navegador. Storage bloqueado mantém funcionamento em memória, sem promessa de persistência após recarga.

A observação individual não era gravada pelo carrinho anterior, embora CartItem já tivesse apresentação para ela. Agora produto+observação identificam a linha; duas observações diferentes não se sobrescrevem, e quantidade/remoção atuam na linha correta. O detalhe permite preenchê-la. Checkout agrega quantidades por produto e envia as notas identificadas por quantidade/nome na observação geral já aceita pelo contrato. Não se alteraram serviços de gravação ou Rules. O limite contratual de 1000 caracteres continua validado, sem truncamento silencioso; excedê-lo exige reduzir as notas. Quantidade agregada também passa pelos limites existentes.

## Arquivos e funções

- `frontend/src/lib/carrinhoSessao.js` (novo): persistência v2 por loja/identidade, transições e proteção contra ação atrasada.
- `frontend/src/contexts/LojaContext.jsx`: conexão com Auth, persistência síncrona e operações por linha/observação; preços continuam derivados do catálogo.
- `frontend/src/lib/compras.js`: sanitização de notas, chave de linha e agregação para o contrato de pedido existente.
- `frontend/src/pages/Produto.jsx`: passa/grava a observação do produto e permite preenchimento.
- `frontend/src/components/ui/CartItem.jsx` e `frontend/src/pages/Carrinho.jsx`: identificação correta de variantes para React/quantidade/remoção.
- `frontend/src/pages/Checkout.jsx`: agrega variantes/notas sem mudar expectedUid, idempotência, validações de preço/disponibilidade ou verificações de troca de sessão.
- `quality/frontend/test/carrinhoSessao.test.jsx` (novo): regressões locais de sessão/loja/recarga/variantes/storage e Provider com mudanças Auth.
- `quality/frontend/test/compras.test.jsx`: fixtures v2, expectedUid e contrato de checkout com notas/preço adulterado no cache.
- `quality/frontend/test/catalogo.test.jsx` e `vitrine.test.jsx`: fixtures/assertivas ajustadas ao armazenamento versionado, preservando os cenários anteriores.
- `quality/frontend/scripts/pedidos-browser.js`: consultas de cache v2 no ensaio permanente de compras Emulator; `validar-imagens-pages.cjs`: semente v2 adicional, mantendo semente antiga para a release online anterior. Somente conferência sintática desses scripts nesta sessão; execução histórica não é nova evidência.
- `quality/docs/documentacao.cjs`: classificação do relatório e atualização reproduzível do índice/inventário.
- Guia Mestre, Diário, Registro, Plano único, Continuidade, Matriz, ressalvas/bloqueios e guia consolidado local: posição da correção/limites/próxima ação. Índice Geral e inventário regenerados; sem alteração da posição comercial dos nove MVPs.

## Testes e limites

Suíte completa final: 246/246 testes aprovados em 23 arquivos, 213,99s; são 230 testes anteriores e 16 novos (15 de sessão e um de checkout com variantes). Executada após a última alteração de runtime e também concluiu após a limpeza dos chunks obsoletos. Primeira rodada direcionada: 50 testes aprovados em 82,05s (antes das duas regressões finais e da asserção adicional de checkout). Rodada completa inicial não produziu progresso após o início e foi interrompida (130); repetida com reporter verbose para diagnosticar e concluir. Nenhuma falha funcional foi presumida resolvida sem repetição. Build homologacao final aprovado em 38,43s (1662 módulos); primeiro build também aprovado em 42,63s. Avisos conhecidos de chunk grande/importação estática+dinâmica e mensagens de stream fd do ambiente não impediram o build.

Comandos: `npm test --prefix frontend -- --maxWorkers=1 --reporter=verbose`; rodada dirigida com filtros `carrinhoSessao.test.jsx catalogo.test.jsx compras.test.jsx vitrine.test.jsx`; `node --check` nos dois módulos JS e dois scripts ajustados; Vite `build --mode homologacao --outDir ../private-backups/carrinho-final-build`, com configuração pública existente carregada pelo Node via env-file privado ignorado, sem imprimir valores; `node quality/docs/documentacao.cjs --write` e `--check`.

Os 12 cenários pedidos são cobertos localmente: visitante/adicionar/recarga/navegação; entrada Google/e-mail e preservação única; logout; B após A; notas diferentes; lojas distintas; checkout com expectedUid atual e ausência de preços do cache. Auth é simulado nos testes React, e Google/e-mail são cenários de identidade/provider; não equivalem a consentimento Google real, dois logins pessoais online ou nova gravação real Firestore. Testes de conta existentes verificam chamadas de login/vinculação/logout e colisões. Nenhum pedido/conta/documento comercial criado, nenhuma regra de acesso modificada. Os serviços atuais continuam consultando preço/disponibilidade e vinculando pedido à sessão esperada, sem aceitar total do carrinho como valor definitivo.

## Limpeza, Git e continuidade

Cinco chunks exclusivos do primeiro build foram substituídos no segundo build. Hashes e ausência de referências nos arquivos finais foram conferidos antes da remoção, em `private-backups/carrinho-limpeza.json`. Restam 11 arquivos do build final necessário à revisão, fontes, testes/evidências reutilizáveis e histórico; nenhum conteúdo exclusivo de trabalhos anteriores removido. Sem limpeza pendente. Conferência final do artefato/documentação e Git registrada no recibo CARRINHO_SESSAO_EVIDENCIAS.json.

Git desta cópia já começou sem arquivos rastreados, com fontes/documentação untracked; não confundir com o checkout de publicação anterior em private-backups. Ignorados incluem dependências, ambientes, builds e backups privados. Nenhum stage/commit/push/deploy. Espelho `/home/lucas/Documentos/lojaDemoRestaurante/` ausente, não recriado nem declarado atualizado. Tempo técnico aproximado de 20–30min, sem cronômetro integral; nenhuma espera manual, sem excedente de 60min identificado.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: CART-H1. Nenhuma intervenção técnica indispensável agora. Próxima tarefa exata: revisar a correção e autorizar especificamente eventual publicação no Pages existente, seguida de homologação da troca entre duas contas do próprio proprietário. Trata-se de próxima ação futura, não de solicitação para executar logins protegidos nesta ordem. Publicação permanece pendente; demais gates/ressalvas comerciais e trabalho CLI-VISUAL-01 preservados.
