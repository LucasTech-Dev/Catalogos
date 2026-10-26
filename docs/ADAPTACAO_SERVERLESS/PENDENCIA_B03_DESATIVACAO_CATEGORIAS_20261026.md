# B-03 — Desativação reversível de categorias (preparada, pendente de validação e deploy de Rules)

Data: 2026-10-26. Projeto Firebase: `bancorestaurante`. Loja: `loja-demo`.

## Problema
As Rules publicadas bloqueavam mudanças `ativo:true -> false` em categorias. O painel ocultava Desativar e Excluir, apesar de exigir gestão real. Isso atrapalha inativação e reativação da categoria `Combos` e seus produtos.

## Solução preparada no código
- Em `firebase/firestore.rules`, foi removida **apenas** a restrição que proibia `ativo:false` em categorias. Autorização de administrador, projeção pública, revisão comercial, campos permitidos e proteção contra exclusão física permanecem.
- `frontend/src/services/adminCatalogo.js`: retirado o bloqueio cliente da desativação lógica.
- `frontend/src/pages/admin/Categorias.jsx`: botão Desativar, confirmação explícita caso existam produtos vinculados, loading, gravação via serviço e releitura.
- Quando uma categoria está inativa, as Rules públicas já restringem a leitura de seus produtos. Os documentos originais e snapshots de pedidos não são apagados.
- A exclusão **física** de categorias permanece bloqueada: requer mecanismo confiável para provar ausência de produtos vinculados, ou arquivamento como decisão de produto separada.

## Gates antes de afirmar que funciona
1. Rodar testes do Firestore Emulator com admin da loja: categoria com zero produtos, com produtos, reativação, sem permissão, outra loja, revisão e projeção pública. Validar que produtos inativos somem corretamente do catálogo e que reativação restaura disponibilidade.
2. Confirmar que alterações de status não geram erros inesperados em listagens públicas nem compras.
3. Publicar as Rules revisadas no `bancorestaurante` **somente com autorização específica e após testes**. Commit GitHub/Pages não publica Rules automaticamente.
4. Testar a gravação real autenticada com uma categoria de teste controlada. Não usar uma categoria comercial para teste antes da verificação.
5. Confirmar no site que o botão está publicado; antes das Rules novas, a ação ainda poderá retornar `permission-denied`.

**Status atual:** CÓDIGO PREPARADO NO GITHUB; DEPLOY DAS RULES NÃO EFETUADO; TESTES EM EMULATOR E GRAVAÇÃO REAL NÃO COMPROVADOS. Não declarar B-03 resolvido em produção.

## Arquivos
- `firebase/firestore.rules`
- `frontend/src/services/adminCatalogo.js`
- `frontend/src/pages/admin/Categorias.jsx`
