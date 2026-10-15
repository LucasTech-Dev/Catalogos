# Inventário auditado — 43 contratos

Conferido com routers/controllers/services. HEAD implícito do Express executa os handlers GET; OPTIONS global é preflight sem escrita. Não contam como contratos adicionais.

| Método | Caminho | Acesso | Escrita Firestore | Alvo/efeito | Risco |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | Público | Não | Health HTTP; sem Firestore | Baixo |
| GET | `/usuarios/me` | Token, próprio UID | Não | usuarios/{uid} | Privacidade/custo, exige autorização |
| GET | `/publico/lojas/:lojaId/catalogo` | Público, loja pelo parâmetro | Não | Loja/categorias/produtos projetados | Exposição/custo público |
| GET | `/publico/lojas/:lojaId/me` | Token, próprio UID, contexto da loja | Não | clientes/{uid} (GET pode ler usuarios/{uid}) | Privacidade/custo, exige autorização |
| PUT | `/publico/lojas/:lojaId/me` | Token, próprio UID, contexto da loja | Sim | clientes/{uid} (GET pode ler usuarios/{uid}) | Persistência/abuso |
| GET | `/publico/lojas/:lojaId/me/enderecos` | Token, próprio UID, contexto da loja | Não | clientes/{uid}/enderecos | Privacidade/custo, exige autorização |
| POST | `/publico/lojas/:lojaId/me/enderecos` | Token, próprio UID, contexto da loja | Sim | clientes/{uid}/enderecos | Persistência/abuso |
| PUT | `/publico/lojas/:lojaId/me/enderecos/:enderecoId` | Token, próprio UID, contexto da loja | Sim | clientes/{uid}/enderecos | Persistência/abuso |
| DELETE | `/publico/lojas/:lojaId/me/enderecos/:enderecoId` | Token, próprio UID, contexto da loja | Sim | clientes/{uid}/enderecos | Persistência/abuso |
| GET | `/lojas/:lojaId` | Token e contexto da loja | Não | Loja/produtos/categorias projetados | Privacidade/custo, exige autorização |
| PATCH | `/lojas/:lojaId/pagamentos` | Admin ativo, mesma loja | Sim | Configuração de loja | Persistência/abuso |
| GET | `/lojas/:lojaId/produtos` | Token e contexto da loja | Não | Loja/produtos/categorias projetados | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/produtos/:produtoId` | Token e contexto da loja | Não | Loja/produtos/categorias projetados | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/categorias` | Token e contexto da loja | Não | Loja/produtos/categorias projetados | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/categorias/:categoriaId` | Token e contexto da loja | Não | Loja/produtos/categorias projetados | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/clientes` | Admin ativo, mesma loja | Não | Clientes (PII) | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/clientes/:clienteId` | Token, mesma loja; próprio cliente ou admin | Não | Cliente privado | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/clientes/:clienteId/enderecos` | Token, mesma loja; próprio cliente ou admin | Não | Endereços privados | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/clientes/:clienteId/enderecos/:enderecoId` | Token, mesma loja; próprio cliente ou admin | Não | Endereços privados | Privacidade/custo, exige autorização |
| POST | `/lojas/:lojaId/pedidos` | Token cliente/admin, loja; titularidade para cliente | Sim | Pedido + idempotência; cliente pode ser atualizado | Persistência/abuso |
| GET | `/lojas/:lojaId/pedidos` | Token cliente/admin, loja; titularidade para cliente | Não | Pedidos próprios/admin; recuperação/WhatsApp somente leitura | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/pedidos/finalizacao/:chave` | Token cliente/admin, loja; titularidade para cliente | Não | Pedidos próprios/admin; recuperação/WhatsApp somente leitura | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/pedidos/:pedidoId` | Token cliente/admin, loja; titularidade para cliente | Não | Pedidos próprios/admin; recuperação/WhatsApp somente leitura | Privacidade/custo, exige autorização |
| GET | `/lojas/:lojaId/pedidos/:pedidoId/whatsapp` | Token cliente/admin, loja; titularidade para cliente | Não | Pedidos próprios/admin; recuperação/WhatsApp somente leitura | Privacidade/custo, exige autorização |
| PATCH | `/lojas/:lojaId/pedidos/:pedidoId/status` | Admin ativo, mesma loja | Sim | Pedido/financeiro; detalhe pode ler endereço legado | Persistência/abuso |
| PATCH | `/lojas/:lojaId/pedidos/:pedidoId/pagamento` | Admin ativo, mesma loja | Sim | Pedido/financeiro; detalhe pode ler endereço legado | Persistência/abuso |
| GET | `/admin/lojas/:lojaId/sessao` | Admin ativo, mesma loja | Não | Configuração de loja | Privacidade/custo, exige autorização |
| GET | `/admin/lojas/:lojaId/dashboard` | Admin ativo, mesma loja | Não | Agregações/pedidos/produtos (privado) | Privacidade/custo, exige autorização |
| GET | `/admin/lojas/:lojaId/loja` | Admin ativo, mesma loja | Não | Configuração de loja | Privacidade/custo, exige autorização |
| PATCH | `/admin/lojas/:lojaId/loja` | Admin ativo, mesma loja | Sim | Configuração de loja | Persistência/abuso |
| GET | `/admin/lojas/:lojaId/pedidos/:id` | Admin ativo, mesma loja | Não | Pedido/financeiro; detalhe pode ler endereço legado | Privacidade/custo, exige autorização |
| GET | `/admin/lojas/:lojaId/produtos` | Admin ativo, mesma loja | Não | Produtos; salvar também atualiza categoria | Privacidade/custo, exige autorização |
| GET | `/admin/lojas/:lojaId/produtos/:id` | Admin ativo, mesma loja | Não | Produtos; salvar também atualiza categoria | Privacidade/custo, exige autorização |
| POST | `/admin/lojas/:lojaId/produtos` | Admin ativo, mesma loja | Sim | Produtos; salvar também atualiza categoria | Persistência/abuso |
| PATCH | `/admin/lojas/:lojaId/produtos/:id` | Admin ativo, mesma loja | Sim | Produtos; salvar também atualiza categoria | Persistência/abuso |
| DELETE | `/admin/lojas/:lojaId/produtos/:id` | Admin ativo, mesma loja | Sim | Produtos; salvar também atualiza categoria | Persistência/abuso |
| GET | `/admin/lojas/:lojaId/categorias` | Admin ativo, mesma loja | Não | Categorias; transações verificam produtos | Privacidade/custo, exige autorização |
| GET | `/admin/lojas/:lojaId/categorias/:id` | Admin ativo, mesma loja | Não | Categorias; transações verificam produtos | Privacidade/custo, exige autorização |
| POST | `/admin/lojas/:lojaId/categorias` | Admin ativo, mesma loja | Sim | Categorias; transações verificam produtos | Persistência/abuso |
| PATCH | `/admin/lojas/:lojaId/categorias/:id` | Admin ativo, mesma loja | Sim | Categorias; transações verificam produtos | Persistência/abuso |
| DELETE | `/admin/lojas/:lojaId/categorias/:id` | Admin ativo, mesma loja | Sim | Categorias; transações verificam produtos | Persistência/abuso |
| GET | `/admin/lojas/:lojaId/clientes` | Admin ativo, mesma loja | Não | Clientes (PII) | Privacidade/custo, exige autorização |
| GET | `/admin/lojas/:lojaId/clientes/:id` | Admin ativo, mesma loja | Não | Clientes (PII) | Privacidade/custo, exige autorização |
