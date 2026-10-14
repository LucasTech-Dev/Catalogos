# ETAPA 24 — Plano de testes

Data: 13/10/2026, America/Sao_Paulo. Ordem 11. Escopo local; não executar Etapa 25, deploy, push, migração, escrita Firebase real ou envio WhatsApp.

## Sequência e evidências

1. Status/branch/HEAD, diff 23, documentação e scan de segredos; reproduzir backend, HTTP, erros globais, React, build e suite Emulator 23 antes do checkpoint.
2. Checkpoint exclusivo 23: `77c8bb7`, sobre `9122f01`, 39 arquivos. Histórico preservado.
3. Executar auditorias npm e identificar todas as suítes/scripts, distinguindo auditoria real somente leitura (não executada nesta ordem).
4. Adicionar testes dirigidos de catálogo/carrinho, reproduzir defeitos e corrigir somente os casos comprovados.
5. Executar suites 19–23 no Emulator com código/dependências finais.
6. Chrome headless via CDP, perfil temporário exclusivo, Vite em loopback, backend e dois estabelecimentos fictícios. Não abrir links externos wa.me.
7. Medir serialmente quatro endpoints com 100 e 1.000 produtos/pedidos fictícios, três aquecimentos e 20 amostras; registrar mediana/p95, bytes, memória e chamadas/resultados SDK.
8. Revisar screenshots desktop/mobile, preparar roteiro manual, atualizar permanentemente ressalvas, documentação e guia externo.

## Inventário de suítes

| Suíte/script | Natureza | Escopo |
| --- | --- | --- |
| backend npm test | Node/fakes e unidades | Todos os arquivos em backend/test, incluindo compatibilidade gaxios/uuid |
| pedidoHttpAutenticado.test.js | Express real + Auth/Firestore fake | 43 contratos, autorização, financeiro, entradas, erros e sigilo |
| errosGlobais.test.js | Express real + falhas artificiais | Sync/async, status, correlação, headers já enviados |
| demo npm test | React/jsdom, API/SDK mockados | Seis arquivos, incluindo catálogo/carrinho/races de atualização |
| firebase-emulator-smoke.js | Auth/Firestore Emulator | Identidades, duas lojas e leituras fictícias |
| pagamento-emulator-integration.js | Emulator + API | Quatro métodos, financeiro e loja autorizada |
| whatsapp-emulator-integration.js | Emulator + API | Conteúdo persistido, URL, status e isolamento |
| publico-emulator-integration.js | Emulator + API | Catálogo, cliente/anônimo/endereço, idempotência, titularidade |
| demo/scripts/auth-emulator-integration.js | SDK Web Auth Emulator | Anônimo, cadastro/vínculo, login, senha e refresh |
| admin-emulator-integration.js | Emulator + API | CRUD, dashboard, paginação, configurações, concorrência e revogação |
| demo/scripts/security-emulator-integration.js | SDK Web/Admin + Emulator | 300 negativas diretas e 37 verificações HTTP |
| validacao-emulator-integration.js | Emulator + HTTP real/fake transport | 104 verificações de entradas, snapshots e parsing |
| erros-emulator-integration.js | Emulator + HTTP real | 22 cenários de falhas e commit/recuperação |
| etapa24-homologacao.js | Chrome real + Emulator + HTTP real | UI completa, duas lojas, checkout, administração e benchmark |
| etapa19/20/21/22/23/24-emulator-suite.js | Orquestração | Inclusões sequenciais; não somar regressões repetidas como casos novos |
| firebase-readonly-audit.js | Projeto Firebase real | Fora desta ordem; não é necessário para validar dados fictícios |

`firebase:emulator:etapa24` inclui 23 → 22 → 21 → 20 → 19 e homologação 24. O script Auth Web também é executado na 19. Não se presume aprovação sem resultado de execução.

## Matriz funcional

| Família | Provas previstas |
| --- | --- |
| Catálogo | Públicos/duas lojas, ativo/inativo, detalhes/query, preço, categoria/filtro, vazio/rede/opcionais, campos privados ausentes |
| Carrinho | Adicionar/editar/remover/limpar, reload/navegação, loja separada, máximo/entradas inválidas, cache corrompido/duplicado, preço/ativo atualizados |
| Checkout | Entrega/retirada, taxa/mínimo/endereço próprio, quatro métodos habilitados, financeiros rejeitados, clique duplo e nonce |
| Auth/perfil | Anônimo/cadastro/login/logout/refresh/revogação/trocaUID, perfil sem complemento, dados próprios e endereços CRUD |
| WhatsApp | Dados do pedido/loja, caracteres especiais, repetição/erro/status/terceiro, URL segura, sem envio real |
| Admin | Login/role/loja, páginas/dados, CRUD/categorias/preços refletidos no público, dashboard/status/financeiro/paginação |
| Multi-loja | Admin A negado em B, cliente/endereço alheios, paths manipulados, sem escrita indevida |
| Concorrência | Cinco tentativas/um pedido, financeiro concorrente, categoria/produto, alterações durante processamento e antes/depois do commit |
| Entrada/erros | 400/401/403/404/409/413/415/429 tipado/500/503; timeout/protocolo/rede, erros seguros e recovery |
| Navegação/layout | URLs diretas, reload, histórico/back, desktop 1440×900, mobile emulado 390×844, JS/console e screenshots |
| Desempenho | Serial: catálogo, produtos 25, pedidos 25, dashboard; volume conhecido, aquecimento/amostras, memória e SDK |

## Limites das provas

Mock não comprova persistência real. Emulator não comprova IAM, índices/fatura/latência de produção. Chrome mobile emulado não é celular físico nem Safari/Firefox. Benchmark serial não prova capacidade simultânea. Memória é do processo Node que inclui backend e harness/SDK. Contadores SDK não são leituras faturadas. Roteiro manual e ressalvas de produção permanecem necessários.
