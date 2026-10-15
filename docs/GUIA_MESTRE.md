# Guia mestre — primeira demonstração online

Decisão de 15/10/2026: implantar uma API mínima com dados fictícios no Render Free. A primeira demonstração online não integra banco, autenticação, pedidos, pagamentos ou administração.

## Preservação

Branch de implantação: `deploy/render-demo-readonly`, em worktree separado `render-demo-minimal`. A versão completa permanece intacta no checkout `Catalogo-Demo/Catalogo-demo`, branch `preserve/catalogos-full-before-render`, commit `7ee32b469ff636e371897f7397cf19ecc5ae5ec7`. Todos os commits e documentos anteriores permanecem no histórico. `main` permanece em `19b554debfb8f504a9809c6594260325486f7ef2`; não houve merge nem force push.

Este guia rege somente o artefato mínimo. O guia mestre anterior está preservado em `7ee32b4:docs/GUIA_MESTRE.md`; para lê-lo, use `git show 7ee32b4:docs/GUIA_MESTRE.md`. As decisões do sistema completo continuam documentadas naquela versão.

## Fluxo demonstrativo

React existente → GET HTTPS → Express mínimo → JSON fictício empacotado. Categorias, produtos e detalhes vêm de uma única resposta de catálogo; carrinho só em memória do navegador. Recarregar a página apaga o carrinho. Sem checkout real ou persistência.

## Publicação

O proprietário confirmou nesta sessão: Pages `catalogo-demo`, Production branch `main`, automatic production deployments ativado, Preview branch `None` salvo. Confirmação fornecida pelo proprietário; não foi realizada consulta autenticada ao painel. Não alterar essas configurações automaticamente.

Push autorizado exclusivamente de `deploy/render-demo-readonly` após testes e scanner aprovados. Render será criado pelo proprietário no painel, com Auto-Deploy Off. A API só poderá ser considerada publicada após a URL real responder aos testes HTTP. A atualização do frontend hospedado é uma etapa posterior; publicar a API não altera o Pages.

Configuração exata em [PUBLICAR_DEMO_FIXTURES.md](PUBLICAR_DEMO_FIXTURES.md), resultados em [VALIDACAO.md](VALIDACAO.md).
