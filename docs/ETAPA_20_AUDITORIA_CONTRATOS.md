> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# Etapa 20 — Auditoria inicial — 13/10/2026

Branch main; HEAD b8e2a4ba39ae233ad413b434d6ce5cbb42b15308. Alterações da Etapa 19 presentes e preservadas, incluindo arquivos não rastreados. Nenhum commit/push solicitado. Snapshot local de fontes em /tmp/catalogos-etapa20-inicial/fontes.tar, somente para referência desta rodada.

Examinados middleware Auth/role/vínculo, serviços de loja/produto/categoria/cliente/endereço/pedido/pagamento/WhatsApp, rotas/controllers correspondentes e todos os componentes/páginas administrativos.

Incompatibilidades:

- AdminLayout e páginas não verificam sessão/role; header logout é somente link.
- Dashboard contém contagens/faturamento e data fixos; falta contrato de agregação/período.
- Listas administrativas são arrays locais; pedidos já possuem GET, detalhes e PATCH status/pagamento com autorização.
- Produtos/categorias têm somente leitura no backend; falta CRUD validado e política de relacionamento.
- Clientes têm listagem interna, porém retorno bruto e cadastro de convidados no checkout não alimenta necessariamente a coleção de clientes.
- Configurações têm PATCH pagamentos, mas não contrato completo de edição de dados públicos/entrega/horários.
- ProdutoForm possui upload/adicionais sem contrato; não simular persistência de recursos não implementados. Imagem será URL validada; adicionais sem suporte serão retirados do formulário operacional.
- Configurações possuem dias/horário global, mas contrato público já admite horários por dia. Preservar horários distintos existentes e editar por dia.
- Status financeiro/operacional são separados. Não usar o select operacional para confirmar silenciosamente pagamento; confirmação financeira será explícita, usando PATCH existente.
- Falta paginação nas consultas administrativas. Preservar retorno público/legado e acrescentar contrato paginado para o painel.

Implementação planejada dentro da autorização: namespace /admin/lojas/:lojaId com Auth + role admin + vínculo validado, serviços/controllers reutilizáveis, consultas paginadas e dashboard agregado; GET/PATCH de pedidos existentes reutilizados. Exclusão de produto é desativação; categoria vinculada não pode ser excluída e categoria com produto ativo não pode ser desativada. Regras Firestore da Etapa 19 mantidas.

## Contrato final implementado

Todo namespace `/admin/lojas/:lojaId` exige Firebase ID Token, perfil interno ativo com role admin e lojaId correspondente. Clientes, identidades públicas sem perfil, anônimos, inativos e administradores de outra loja são bloqueados. Sem token/inválido/revogado: 401; sem permissão: 403. Nenhum endpoint concede role ou altera usuários internos.

| Método/rota após /admin/lojas/:lojaId | Comportamento |
| --- | --- |
| GET /sessao | Identidade validada, role, lojaId e nome/id da loja; sem credenciais |
| GET /dashboard?inicio=YYYY-MM-DD&fim=YYYY-MM-DD | Até 31 dias; contagens por status, somas, disponibilidade e cinco pedidos recentes |
| GET /loja | Projeção dos campos editáveis |
| PATCH /loja | Configuração validada, persistida e devolvida; campos desconhecidos rejeitados |
| GET /produtos?limite=25&cursor=id&categoriaId=id | Página de produtos; limite 1–100 |
| POST /produtos | Criação, nome/preço/categoria obrigatórios |
| GET /produtos/:id | Produto da loja autorizada |
| PATCH /produtos/:id | Edição parcial, preço/booleans/URLs/categoria validados |
| DELETE /produtos/:id | Desativação preservando documento e pedidos anteriores |
| GET /categorias?limite=25&cursor=id | Página e contagem de produtos vinculados; contagem=0 omite contagens nos seletores |
| POST /categorias | Categoria validada |
| GET /categorias/:id | Categoria da loja |
| PATCH /categorias/:id | Edição/ativação; desativação com produto ativo retorna 409 |
| DELETE /categorias/:id | Exclui somente sem qualquer produto vinculado; conflito 409 |
| GET /clientes?limite=25&cursor=id | Página de dados associados à loja, com projeção explícita |
| GET /clientes/:id | Detalhes permitidos, sem senhas/tokens/role |
| GET /pedidos/:id | Detalhe enriquecido com endereço legado quando autorizado e transições possíveis |

Listas retornam `{itens,proximoCursor}`. Cursor é documento dentro da mesma loja, aplicado por `startAfter`; não permite acessar outra loja. Pedido ordena por criadoEm desc; demais listas por ID do documento. Categorias de seletores usam páginas de até 100 sem contagens desnecessárias; lista de gerenciamento conta os vínculos apenas da página exibida. Buscas textuais de produtos/clientes atuam na página, sinalizadas na interface; categoria/status filtram no servidor.

### Rotas de pedidos existentes reutilizadas

- GET `/lojas/:lojaId/pedidos?limite=25&cursor=id&status=recebido`: para admin com limite informado, retorna página. Sem parâmetro ou para cliente, mantém o contrato anterior; cliente continua vendo somente seus pedidos.
- PATCH `/lojas/:lojaId/pedidos/:pedidoId/status`: transação com transições do serviço existente. Status operacional pagamento_confirmado/pagamento_recusado exige o respectivo estado financeiro previamente atualizado de forma explícita.
- PATCH `/lojas/:lojaId/pedidos/:pedidoId/pagamento`: transação; pendente pode passar a confirmado/recusado/cancelado. Nunca confirmado automaticamente. Pedidos cancelados e transições terminais continuam protegidos.

### Modelos e validação

Produto: nome, descricao, preco, categoriaId, ativo, disponivel, imagem e ingredientes. Preço numérico finito não negativo, até 1.000.000, normalizado em centavos. Categoria deve existir; produto ativo exige categoria ativa. Produtos legados sem categoria podem ser desativados com segurança, mas ativação/edição operacional precisa de categoria válida. Imagem por URL HTTP/HTTPS sem credenciais; upload de arquivo e adicionais sem contrato não simulam persistência.

Categoria: nome, descricao, ativo, icone, ordem. Exclusão de categoria com produtos inclusive inativos é bloqueada; deve-se mover os produtos. Transações compartilham o documento da categoria para serializar criação/ativação de produto contra exclusão/desativação e impedir órfãos.

Loja: nome, descricao, telefone, whatsapp, instagram, endereco, horarios, logo, imagem, corPrimaria, tempoMedio, pagamentos, entrega, retirada, pedidoMinimo. Sem alterações de role, UID, credenciais ou campos internos. Dias possuem abertura, fechamento e fechado; horários por dia e campos de endereço já existentes são preservados pelo formulário. Horário legado textual permanece se não for substituído por configuração estruturada. WhatsApp normalizado pelo serviço existente; taxa/pedido mínimo não negativos; valores vazios/inválidos rejeitados. Pedido mínimo é aplicado no servidor às compras públicas.

Clientes: somente id, nome, e-mail/telefone disponíveis, anonimo e atualizadoEm. Checkout público idempotente alimenta o cliente da loja pelo UID/contato validados, na mesma transação do pedido. Perfil opcional atualiza marcador de convidado pela identidade Firebase, nunca por flags do navegador. Sem migração automática dos convidados anteriores ou IDs legados. Rotas antigas de cliente também receberam projeção explícita.

### Critério financeiro e período

Período inclusivo em datas comerciais UTC-3, apresentado como America/Sao_Paulo, limitado a 31 dias e pela data de criação dos pedidos. `valorPedidos` soma todos os pedidos do período, inclusive cancelados. `valorPagamentosConfirmados` soma somente pagamento.status confirmado, excluindo pedidos cancelados. É confirmação manual no sistema, não liquidação de gateway, nem receita pela data da confirmação. Pendentes nunca são classificados como confirmados/recebidos financeiramente.

Contagens/somas usam agregações do Firestore, sem baixar todos os pedidos. Disponibilidade de produtos considera ativo=true e disponivel diferente de false, inclusive modelos legados sem campo disponivel. Apenas cinco documentos recentes são lidos no dashboard. Índices locais em firebase/firestore.indexes.json; não publicados. Referências: https://firebase.google.com/docs/firestore/query-data/aggregation-queries e https://firebase.google.com/docs/firestore/query-data/query-cursors .

### Estados e erros

React usa AdminGate em toda rota /admin, incluindo formulários e detalhes. Mantém conteúdo oculto até verificação de backend, não cria visitante anônimo para acessar painel e invalida a interface após 401/403 ou falha de refresh. Logout é Firebase real. Revalidação da mesma identidade não desmonta o formulário; respostas de identidade anterior ou gravações que chegam após logout não reabrem o painel.

Operações exibem carga, erro, vazio e confirmação; sucesso usa resposta/refetch, sem F5. Alteração financeira exige confirmação explícita. JSON inválido/tamanho excedido retornam JSON 400/413 sem stack; erros internos administrativos são genéricos. Regras Firestore da Etapa 19 permanecem byte a byte iguais.
