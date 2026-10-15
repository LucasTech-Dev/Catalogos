# Catálogos — API de demonstração isolada

Esta branch contém somente a API Express com catálogo fictício da `loja-demo`: seis produtos e três categorias. O carrinho do React existente funciona em memória; nenhuma compra é registrada.

O desenvolvimento completo está preservado no commit `7ee32b469ff636e371897f7397cf19ecc5ae5ec7` e na branch local `preserve/catalogos-full-before-render`. A branch `main` não foi alterada. O histórico não foi reescrito. Os arquivos removidos neste snapshot continuam disponíveis nos commits anteriores.

## Executar

Node.js 24. No diretório `backend`, execute `npm ci`, depois `CORS_ORIGINS=http://127.0.0.1:5173 npm start`. `npm test` executa os testes HTTP e o smoke de `npm start`.

- `GET /` e `HEAD /`: health.
- `GET /publico/lojas/loja-demo/catalogo` e `HEAD` no mesmo caminho: loja, categorias e produtos.
- `OPTIONS` nos mesmos caminhos somente para preflight GET/HEAD de origem aprovada.
- Outros caminhos, queries, aliases e métodos retornam 404.

O React consome esse único endpoint para categorias, produtos e detalhes; não há novos endpoints de detalhe. Código frontend preservado na versão completa. Não há autenticação, SDK de banco, serviços externos, rotas administrativas, checkout ou escrita persistente no artefato. `express` é a única dependência direta.

Veja [publicação no Render](docs/PUBLICAR_DEMO_FIXTURES.md), [guia mestre](docs/GUIA_MESTRE.md) e [validação](docs/VALIDACAO.md).
