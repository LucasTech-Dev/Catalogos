# Referência da API Express atual

14/10/2026. Inventário 43 contratos de backend/src/validators/contratos.js conferido com rotas/controllers, não endpoints planejados. API local 3000; exemplos são fictícios. Prefixos /publico e /admin são namespaces de API, não rotas de páginaReact.

## Convenções

JSON em POST/PUT/PATCH; Content-Typeapplication/json, máximo 64 KiB. AuthorizationBearerIDTokenFirebase nas rotas privadas; não usar tokenAdmin ou role enviado pelo cliente. OrigemCORS autorizada não substitui autorização. IDs até 128 sem slash/controles/dot; percent-encoding não concede acesso. X-Request-ID gerado no servidor. Respostas de erro {"error":"mensagem pública"}; 400input/regra,401credencial,403escopo,404recurso,409conflito,413tamanho,415formato,429limite,500interno,503infra. Detalhes/stack/PII não são expostos. Retry-After quando limiter efetivamente habilitado; quota é local por processo.

Pedido de cliente/anônimo exige Idempotency-Key:16–100 caracteres [a-zA-Z0-9_-]; admin pode criar sem chave, mas usar chave é recomendado para tentativa recuperável. Mesmachave/corpo retorna mesmo pedido com 201; outrocorpo 409. Recuperação GETfinalizacao/chave não cria pedido. UID deriva token; clienteId/preço/taxa/desconto/total enviados nunca concedem titularidade nem autoridade financeira.

## Rotas

| Método | Caminho | Acesso | Corpo/schema | Query permitida | Sucesso |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | público | — | — | 200 |
| GET | `/usuarios/me` | Firebase; próprio usuário | — | — | 200 |
| GET | `/publico/lojas/:lojaId/catalogo` | público | — | — | 200 |
| GET | `/publico/lojas/:lojaId/me` | Firebase; titular/admin conforme recurso | — | — | 200 |
| PUT | `/publico/lojas/:lojaId/me` | Firebase; titular/admin conforme recurso | cliente | — | 200 |
| GET | `/publico/lojas/:lojaId/me/enderecos` | Firebase; titular/admin conforme recurso | — | — | 200 |
| POST | `/publico/lojas/:lojaId/me/enderecos` | Firebase; titular/admin conforme recurso | endereco | — | 201 |
| PUT | `/publico/lojas/:lojaId/me/enderecos/:enderecoId` | Firebase; titular/admin conforme recurso | endereco | — | 200 |
| DELETE | `/publico/lojas/:lojaId/me/enderecos/:enderecoId` | Firebase; titular/admin conforme recurso | — | — | 204 |
| GET | `/lojas/:lojaId` | Firebase; titular/admin conforme recurso | — | — | 200 |
| PATCH | `/lojas/:lojaId/pagamentos` | admin da loja | pagamentos | — | 200 |
| GET | `/lojas/:lojaId/produtos` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/produtos/:produtoId` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/categorias` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/categorias/:categoriaId` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/clientes` | admin da loja | — | — | 200 |
| GET | `/lojas/:lojaId/clientes/:clienteId` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/clientes/:clienteId/enderecos` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/clientes/:clienteId/enderecos/:enderecoId` | Firebase; titular/admin conforme recurso | — | — | 200 |
| POST | `/lojas/:lojaId/pedidos` | Firebase; titular/admin conforme recurso | pedido | — | 201 |
| GET | `/lojas/:lojaId/pedidos` | Firebase; titular/admin conforme recurso | — | limite, cursor, status | 200 |
| GET | `/lojas/:lojaId/pedidos/finalizacao/:chave` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/pedidos/:pedidoId` | Firebase; titular/admin conforme recurso | — | — | 200 |
| GET | `/lojas/:lojaId/pedidos/:pedidoId/whatsapp` | Firebase; titular/admin conforme recurso | — | — | 200 |
| PATCH | `/lojas/:lojaId/pedidos/:pedidoId/status` | admin da loja | status | — | 200 |
| PATCH | `/lojas/:lojaId/pedidos/:pedidoId/pagamento` | admin da loja | financeiro | — | 200 |
| GET | `/admin/lojas/:lojaId/sessao` | admin da loja | — | — | 200 |
| GET | `/admin/lojas/:lojaId/dashboard` | admin da loja | — | inicio, fim | 200 |
| GET | `/admin/lojas/:lojaId/loja` | admin da loja | — | — | 200 |
| PATCH | `/admin/lojas/:lojaId/loja` | admin da loja | loja | — | 200 |
| GET | `/admin/lojas/:lojaId/pedidos/:id` | admin da loja | — | — | 200 |
| GET | `/admin/lojas/:lojaId/produtos` | admin da loja | — | limite, cursor, categoriaId | 200 |
| GET | `/admin/lojas/:lojaId/produtos/:id` | admin da loja | — | — | 200 |
| POST | `/admin/lojas/:lojaId/produtos` | admin da loja | produto | — | 201 |
| PATCH | `/admin/lojas/:lojaId/produtos/:id` | admin da loja | produtoParcial | — | 200 |
| DELETE | `/admin/lojas/:lojaId/produtos/:id` | admin da loja | — | — | 200 |
| GET | `/admin/lojas/:lojaId/categorias` | admin da loja | — | limite, cursor, contagem | 200 |
| GET | `/admin/lojas/:lojaId/categorias/:id` | admin da loja | — | — | 200 |
| POST | `/admin/lojas/:lojaId/categorias` | admin da loja | categoria | — | 201 |
| PATCH | `/admin/lojas/:lojaId/categorias/:id` | admin da loja | categoriaParcial | — | 200 |
| DELETE | `/admin/lojas/:lojaId/categorias/:id` | admin da loja | — | — | 204 |
| GET | `/admin/lojas/:lojaId/clientes` | admin da loja | — | limite, cursor | 200 |
| GET | `/admin/lojas/:lojaId/clientes/:id` | admin da loja | — | — | 200 |

GETusuarios/me pode 404 quando não existe documento complementar; outras rotas públicas autenticadas ainda podem operar como cliente. LegacyGETlojas/:id e produtos/categorias são leituras autenticadas/projetadas, não substituem catálogo público. Titular só vê seus pedidos/endereços; admin precisa da mesma loja. Excluir produto em/admin desativa e retorna 200; excluir categoria vinculada retorna 409. Admin PATCH preserva campos/objetos/dias omitidos.

## Schemas de escrita

| Nome | Campos/semântica |
| --- | --- |
| cliente | nome obrigatório≤200; telefone 10–15 dígitos, só estes campos |
| endereco | rua/numero/bairro/cidade obrigatórios; uf válida; opcionais apelido/complemento/cep |
| pedido | itens[{produtoId,quantidade}], tipoEntrega entrega/retirada, enderecoId naentrega, pagamento{forma},cliente{nome,telefone},observacao≤1000; formas alternativoformaPagamento legada, hintsfinanceiros validados/ignorados conforme serviço |
| status | {status}: estado operacional real e transição permitida |
| financeiro | {status}: confirmação/recusa/cancelamento administrativo conforme estado |
| produto/Parcial | nome,descricao,preco,categoriaId,ativo,disponivel,imagem,ingredientes; create exige nome/preço/categoria; PATCHnão vazio |
| categoria/Parcial | nome,descricao,ativo,icone,ordem; ordeminteira 0–10000 |
| loja | nome,descricao,telefone,whatsapp,instagram,endereco,horarios,logo,imagem,corPrimaria,tempoMedio,pagamentos,entrega,retirada,pedidoMinimo; campos reais emadministracao.js |
| pagamentos | config booleanas pix,dinheiro,cartao_credito,cartao_debito; somente estas quatro chaves no contrato HTTP; compatibilidade de leitura legada cartao não autoriza enviá-la como campo novo |

Pedidos:50 itens distintos/1–99quantidades/total500unidades. Preços 0–1.000.000 e até 2 casas; servidor resolveproduto/categoria/configuração dentro de transação. Entrega usa endereço próprio e taxa confiável; retirada não usaendereço/taxa. Obrigatoriedades da loja/mínimo/formas habilitadas são regras da persistência. Não mandar PAN/CVV/token de pagamento/variações/adicionais. Campos inesperados são 400.

## Respostas e paginação

Catálogo {loja,categorias,produtos} por allowlist sem privadas. Pedido inclui snapshots/valores/pagamento/estado, semnonce interno. WhatsApp {pedidoId,lojaId,numero,mensagem,mensagemCodificada,url,observacao}; rejeita estados incompatíveis/número inválido; não envia mensagem nem muda estado. /admin/sessao contémUID/email/role/lojaId/loja projetada.

Adminlistas {itens,proximoCursor},limite 1–100 padrão 25 e docadicional para cursor. Categoria contagem 0 desliga agregação por categoria; dashboard inicio/fim emperíodo≤31 dias. GETpedidos aplica paginação/filtros somente paraadmin comquerylimite; cliente eadmin semlimite mantêm array legado integral, não alegar paginação universal. Cliente com filtros recebe 400; admin comquery semlimite também 400. Semquery retornaarraylegado; não afirmar que filtros são ignorados.

## Exemplo local de retirada

Body fictício: {"tipoEntrega":"retirada","itens":[{"produtoId":"produto-ficticio","quantidade":1}],"pagamento":{"forma":"pix"}}. CabeçalhosAuth/chave devem vir da sessão fictícia do Emulator; não publicar token nem executar contra Firebase real. Criar produto/loja autorizados antes, não trocar preço viahint. Fluxo completo é validado pelas suites existentes.

Fontes: routes/*,controllers/pedidoController.js,services/pedidoService.js/adminService.js/whatsappService.js,validators/{base,pedidos,perfil,administracao,consultas,contratos}. [Modelo](MODELO_FIRESTORE.md),[manuais](MANUAL_DESENVOLVIMENTO.md).
