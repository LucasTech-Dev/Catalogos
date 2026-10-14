# ETAPA 22 — AUDITORIA DE VALIDAÇÕES

Data: 13/10/2026, America/Sao_Paulo. Ordem de Desenvolvimento 09. Escopo: API Express local, contratos React e dados fictícios nos emuladores Auth/Firestore. Etapa 23 não iniciada.

## Referência e checkpoint antes das alterações

Repositório de implementação: `Catalogo-Demo/Catalogo-demo`, distinto do Git no diretório pai. Branch `main`; commits 19/20 `2c06313` e `0b1ec3d` preservados. Status e diff completo da Etapa 21 revistos, documentação 19/20/21, Guia Mestre, Registro e seção 96 do guia externo consultados. Nenhum AGENTS.md encontrado no workspace.

Antes das alterações de código: backend 5 arquivos, HTTP 69/69, React 36/36, build Vite e suíte integrada 21 aprovados. Esta suíte inclui regressões 19/20, 300 negativas SDK Web e 37 verificações HTTP de segurança. Scan dos 64 arquivos não encontrou os padrões privados procurados (chaves privadas, chave de API Google, tokens GitHub e access key AWS). Não é garantia universal de ausência de segredos. Checkpoint local exclusivo `c2a0cbf` — `security(backend): conclui auditoria e protecoes da etapa 21`, 64 arquivos, sem push, árvore limpa após commit. Relatórios 21 permanecem históricos: a menção a diff local é sucedida por este checkpoint.

O sandbox bloqueou portas locais; primeira tentativa também encontrou cache CLI fora das raízes graváveis. Execução autorizada fora do sandbox, cache/Java em /tmp, resolveu a infraestrutura. Falhas iniciais não são evidência de aprovação. Nenhum Firebase real foi acessado nesta ordem.

## Achados e decisões

| Achado inicial | Correção |
| --- | --- |
| Perfil/endereço projetavam extras mas não os rejeitavam | Schemas estritos de entrada antes de persistir |
| Pedidos aceitavam extras arbitrários e itens repetidos/sem limite total | Allowlist em cada nível, 50 itens distintos, 99 por item, 500 unidades totais |
| Queries desconhecidas/repetidas e filtros ignorados | Contratos por rota, strings únicas e filtros específicos |
| Preço administrativo arredondava mais de dois decimais | Rejeição de fração de centavo, mantendo estratégia Number/centavos |
| Valor financeiro null podia gerar TypeError/500 | Validação numérica finita antes de comparação |
| PATCH substituía objetos inteiros | Mesclagem transacional de entrega, retirada, pagamentos, endereço e horários por dia |
| Mesclagem podia conservar cartao=true e impedir desativação | Conversão da flag legada em crédito/débito explícitos ao editar pagamentos |
| Tipos permissivos em UF/CEP/horários/cor | Schemas brasileiros, verificação de tipos antes de regex |
| Codificação/compactação malformada resultava em 500 | Mapeamento limitado a erros de parsing reconhecidos: 400/413/415 |
| Campos de prototype e profundidade não delimitados | Guarda estrutural central limitada e erros sem refletir payload |

Sem dependência nova: schemas são funções CommonJS reutilizadas pelos serviços. `adminValidacaoService` torna-se fachada de compatibilidade; validação administrativa muda para `validators/administracao`. Validadores de perfil saem de `publicoService` para `validators/perfil`. As mesmas funções protegem chamadas de serviço e HTTP, sem uma segunda implementação de regras. Repetir a invocação na fronteira HTTP e em serviços preserva os chamadores diretos.

Validação estrutural não consulta autorização. Auth/role/loja/ownership continuam antes do middleware específico nas rotas privadas; a guarda global de profundidade atua após JSON parsing para limitar o processamento. Transições, existência de recursos, titularidade de endereço, produtos/categorias ativos, forma habilitada, pedido mínimo e cálculos continuam nos serviços/transações. Campos internos não são controlados por payloads.

## Inventário completo: 43 rotas explícitas

HEAD implícito reutiliza contrato GET. OPTIONS de origem permitida mantém preflight 204. Não existe nova rota de criação de usuário, gateway ou administração de roles. Rotas desconhecidas seguem o comportamento existente; tratamento global de erros é reservado à Etapa 23.

Todos os IDs de path (lojaId, pedidoId, produtoId, categoriaId, clienteId, enderecoId, id) usam a mesma validação. A identidade UID vem do token. Chave no path usa o schema de idempotência. Queries ausentes são permitidas; qualquer query fora da coluna é rejeitada. Corpo ausente ou objeto vazio em leitura/delete é aceito; corpo com campos é rejeitado. Todos os corpos com schema rejeitam campos desconhecidos, inclusive aninhados.

| Método | Rota | Parâmetros path | Query permitida | Corpo / obrigatórios | Erros possíveis |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | nenhum | nenhuma | sem campos de corpo | 400: entrada inválida; 500: falha interna segura |
| GET | `/usuarios/me` | nenhum | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 500: falha interna segura |
| GET | `/publico/lojas/:lojaId/catalogo` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/publico/lojas/:lojaId/me` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| PUT | `/publico/lojas/:lojaId/me` | lojaId | nenhuma | nome e telefone obrigatórios; somente esses campos | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| GET | `/publico/lojas/:lojaId/me/enderecos` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| POST | `/publico/lojas/:lojaId/me/enderecos` | lojaId | nenhuma | rua, numero, bairro, cidade e uf obrigatórios; apelido, complemento e cep opcionais | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| PUT | `/publico/lojas/:lojaId/me/enderecos/:enderecoId` | lojaId, enderecoId | nenhuma | rua, numero, bairro, cidade e uf obrigatórios; apelido, complemento e cep opcionais | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| DELETE | `/publico/lojas/:lojaId/me/enderecos/:enderecoId` | lojaId, enderecoId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| PATCH | `/lojas/:lojaId/pagamentos` | lojaId | nenhuma | pix, dinheiro, cartao_credito, cartao_debito booleanos; objeto não vazio; operação dedicada substitui configuração completa, omitidos ficam false; ao menos um habilitado | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| GET | `/lojas/:lojaId/produtos` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/produtos/:produtoId` | lojaId, produtoId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/categorias` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/categorias/:categoriaId` | lojaId, categoriaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/clientes` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/clientes/:clienteId` | lojaId, clienteId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/clientes/:clienteId/enderecos` | lojaId, clienteId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/clientes/:clienteId/enderecos/:enderecoId` | lojaId, clienteId, enderecoId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| POST | `/lojas/:lojaId/pedidos` | lojaId | nenhuma | itens e pagamento.forma (ou formaPagamento legada) obrigatórios; tipoEntrega default entrega; enderecoId obrigatório na entrega; cliente e observacao opcionais; dicas legadas descritas abaixo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| GET | `/lojas/:lojaId/pedidos` | lojaId | limite, cursor, status | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/pedidos/finalizacao/:chave` | lojaId, chave | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/pedidos/:pedidoId` | lojaId, pedidoId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| GET | `/lojas/:lojaId/pedidos/:pedidoId/whatsapp` | lojaId, pedidoId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura |
| PATCH | `/lojas/:lojaId/pedidos/:pedidoId/status` | lojaId, pedidoId | nenhuma | somente status operacional conhecido obrigatório | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| PATCH | `/lojas/:lojaId/pedidos/:pedidoId/pagamento` | lojaId, pedidoId | nenhuma | somente status financeiro conhecido obrigatório | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 500: falha interna segura; 413: JSON grande; 415: codificação |
| GET | `/admin/lojas/:lojaId/sessao` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/dashboard` | lojaId | inicio, fim | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/loja` | lojaId | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| PATCH | `/admin/lojas/:lojaId/loja` | lojaId | nenhuma | PATCH não vazio dos campos de configuração listados abaixo; mesclagem de objetos por campo/dia | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura; 413: JSON grande; 415: codificação |
| GET | `/admin/lojas/:lojaId/pedidos/:id` | lojaId, id | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/produtos` | lojaId | limite, cursor, categoriaId | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/produtos/:id` | lojaId, id | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| POST | `/admin/lojas/:lojaId/produtos` | lojaId | nenhuma | nome, preco e categoriaId obrigatórios; descricao, ativo, disponivel, imagem, ingredientes opcionais | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura; 413: JSON grande; 415: codificação |
| PATCH | `/admin/lojas/:lojaId/produtos/:id` | lojaId, id | nenhuma | PATCH não vazio dos mesmos campos de produto; todos opcionais individualmente | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura; 413: JSON grande; 415: codificação |
| DELETE | `/admin/lojas/:lojaId/produtos/:id` | lojaId, id | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/categorias` | lojaId | limite, cursor, contagem | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/categorias/:id` | lojaId, id | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| POST | `/admin/lojas/:lojaId/categorias` | lojaId | nenhuma | nome obrigatório; descricao, ativo, icone e ordem opcionais | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura; 413: JSON grande; 415: codificação |
| PATCH | `/admin/lojas/:lojaId/categorias/:id` | lojaId, id | nenhuma | PATCH não vazio dos mesmos campos de categoria; todos opcionais individualmente | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 409: produto vinculado; 503: consulta indisponível; 500: falha interna segura; 413: JSON grande; 415: codificação |
| DELETE | `/admin/lojas/:lojaId/categorias/:id` | lojaId, id | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 409: produto vinculado; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/clientes` | lojaId | limite, cursor | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |
| GET | `/admin/lojas/:lojaId/clientes/:id` | lojaId, id | nenhuma | sem campos de corpo | 400: entrada inválida; 401: autenticação; 403: permissão/loja; 404: recurso ausente/alheio; 503: consulta indisponível; 500: falha interna segura |

Os códigos acima são possibilidades conforme contexto, não promessa de que todo recurso ausente resulte em 404: inexistência de produto/endereço dentro de criação de pedido é erro de negócio 400. CORS inesperado retorna 403 em qualquer rota; parsing pode retornar 400/413/415 antes da autenticação. Erros mantêm envelope `{error: mensagem}`, sem stack/caminho/credencial. 409 continua reservado aos conflitos de integridade de categoria; conflito de idempotência mantém 400 por compatibilidade.

## Organização por domínio

1. **Catálogo público:** GET catalogo sem token, ID validado, sem filtros/corpo; projeções 21 preservadas.
2. **Lojas:** leitura legada e admin; pagamentos dedicados e configuração parcial distintos.
3. **Usuários:** somente GET usuarios/me; UID validado do token; sem schema de promoção/criação HTTP.
4. **Autenticação/perfil:** autenticação Firebase verificada pelo middleware existente; GET/PUT público me. Credenciais de cadastro/login continuam no Firebase Web SDK, fora da API Express.
5. **Clientes:** consultas administrativas/legadas; cadastro de contato do próprio cliente em me/checkout. E-mail é derivado do token Firebase verificado, não aceito no body; nenhuma nova coleta de e-mail.
6. **Endereços:** schemas explícitos nos POST/PUT próprios; leitura legada mantém ownership.
7. **Produtos:** criação e edição parcial distintas, referência de categoria dentro da mesma loja e transação existente.
8. **Categorias:** criação/edição; desativação/exclusão com vínculos continua guardada transacionalmente.
9. **Pedidos:** criação estrita, leitura própria/admin; paginação admin específica.
10. **Entrega/retirada:** tipo conhecido, endereço próprio obrigatório na entrega; retirada sem endereço/taxa; habilitação/configuração checada no servidor.
11. **Pagamentos:** forma conhecida/habilitada; financeiro nasce pendente; estados/transições guardados, sem gateway.
12. **WhatsApp:** somente IDs, sem corpo/query; conteúdo vem do pedido persistido.
13. **Dashboard:** datas comerciais válidas, inclusivas, até 31 dias, UTC-3.
14. **Administração:** namespace preserva Auth + admin ativo + loja; não existe atribuição de role por schema.
15. **Configurações:** PATCH validado e mesclado em transação; campos omitidos preservados.
16. **Recuperação idempotente:** chave/UID/loja, somente registro próprio; esquema de hash/assinatura e recuperação anterior preservados.

## Schemas e limites

| Campo/estrutura | Limite/contrato |
| --- | --- |
| JSON | 64 KiB descompactados; 413 ao exceder |
| Estrutura | Profundidade máxima 8 (raiz 0); máximo 5.000 nós; ciclos/prototype rejeitados |
| Identificadores | string 1–128 unidades UTF-16, não somente espaços; sem barra/backslash, controles C0/C1, . ou ..; Unicode bem formado |
| Idempotency-Key / chave | 16–100 caracteres ASCII alfanuméricos, _ ou -; cliente/anônimo obrigatória, admin opcional |
| Itens | 1–50 produtos distintos; quantidade inteira 1–99 por produto; até 500 unidades totais |
| Textos de nome/endereço/ingrediente | Até 200 unidades UTF-16; nomes/campos essenciais não vazios |
| Descrição | Até 2.000; permite tab, LF e CR |
| Observação | Até 1.000; permite tab, LF e CR |
| Ingredientes | Até 50 strings, cada uma até 200; vazio permitido como lista opcional |
| Ícone / ordem categoria | Ícone até 50; ordem inteira 0–10.000 |
| Monetários recebidos | Number finito 0–1.000.000, no máximo dois decimais significativos; tolerância somente ao ruído binário Number |
| URL imagem/logo | HTTP(S), sem usuário/senha, até 2.048; vazio permitido |
| Cor primária | String #RRGGBB |
| Telefone | Até 25 caracteres de dígitos/espaço/parênteses/hífen e + inicial; 10–15 dígitos, não todos zero; telefone opcional da loja pode ser vazio |
| WhatsApp | Mesma validação de telefone antes da normalização existente; sem letras descartadas silenciosamente |
| UF | Uma das 27 UFs brasileiras, caixa normalizada; endereço administrativo opcional permite vazio |
| CEP | Opcional/vazio; 8 dígitos ou XXXXX-XXX |
| Horários | sete dias canônicos segunda/terca/quarta/quinta/sexta/sabado/domingo; HH:mm 00:00–23:59; fechado booleano; horários abertos devem ter abertura/fechamento diferentes após merge |
| Paginação | limite textual decimal inteiro 1–100 (default admin 25); cursor ID da mesma coleção/loja; categoriaId somente produtos; contagem 0/1 somente categorias |
| Dashboard | inicio/fim YYYY-MM-DD reais; intervalo inclusivo até 31 dias; defaults do serviço preservados |

Limites de estrutura/pedido/moeda centralizados em `validators/base.js`, sem novas variáveis de ambiente. Configuração futura pode alterar as constantes e respectivas evidências; não se aceita limite decidido pelo cliente. Limite monetário unitário pode produzir total acima de 1.000.000 com várias unidades; total calculado é confiável e os limites atuais mantêm centavos abaixo de Number.MAX_SAFE_INTEGER.

Campos de loja: nome, descricao, telefone, whatsapp, instagram, endereco, horarios, logo, imagem, corPrimaria, tempoMedio, pagamentos, entrega, retirada e pedidoMinimo. Endereço da loja pode continuar texto (até 1.000) ou objeto com rua/logradouro, numero, bairro, cidade, uf, cep e complemento. Entrega recebe habilitada/taxa, retirada habilitada. Objetos parciais de entrega/pagamentos/endereços/horários preservam chaves anteriores; horário parcial por dia é validado contra o valor mesclado. Horário cruzando meia-noite continua permitido; horários iguais não representam implicitamente 24 horas. Não há cálculo de agenda de funcionamento novo nesta etapa.

Ao editar entrega habilitada, a taxa efetiva deve estar configurada e válida. Entrega e retirada não podem terminar ambas false. Pagamentos editados devem manter ao menos um habilitado. Erros de consistência são detectados antes de tx.update.

## Contratos modificados e compatibilidade React

- Desconhecidos antes ignorados agora resultam em 400. Prova antiga do convidado enviando role=admin foi reforçada: tentativa rejeitada sem escrita, depois fluxo legítimo com UID do token continua aprovado.
- Para compatibilidade segura, somente dicas legadas conhecidas continuam permitidas: clienteId (cliente não escolhe identidade), precoUnitario do item e total são validados quanto ao formato e ignorados pelo cálculo; taxaEntrega pública não substitui configuração, desconto público só zero. Para admin, taxa/desconto são valores autorizados pela rota e validados, com desconto não podendo exceder valor do pedido.
- pagamento.status=pendente e pagamento.valor numérico que coincide com total continuam aceitos como contrato legado. Confirmado/recusado/cancelado na criação são proibidos inclusive para admin. Valores, senhas, CVV, tokens e complementos desconhecidos não podem ser usados como confirmação financeira.
- formaPagamento legada continua alternativa a pagamento.forma; se ambos vierem, devem concordar. Normalização existente de formas/financeiro preservada. Não há gateway nem dados de cartão armazenados.
- Mais de duas casas em preço/taxa/pedido mínimo passam a 400; não ocorre arredondamento comercial silencioso. Dados legados inválidos não são migrados. Preço existente inválido impede novo pedido; pedido já salvo pode ser recuperado pela mesma chave.
- Listagem de pedidos de cliente não aceita filtros administrativos. Admin usando cursor/status precisa informar limite para impedir filtro silenciosamente ignorado; consumidor React já envia limite.
- PATCH /admin/.../loja passa a preservar objetos/dias omitidos. PATCH /lojas/.../pagamentos conserva a semântica dedicada de substituição completa, com campos omitidos false, e exige ao menos um método.
- Nenhuma requisição válida do React exige alteração. Consumidores verificados: services/api/admin/conta, Checkout, Enderecos, ProdutoForm, Categorias e Configuracoes. Nenhuma mudança de design/produção React; somente dois testes novos do cliente HTTP, incluindo erro 400 sem retry/logout e payload Unicode/chave preservados.

Rules, índices, projeções, transações financeiras/checkout, roles e isolamento 21 preservados. Nenhuma migration, deploy, push ou escrita real. Garantia de ausência de persistência parcial é por requisição inválida do backend; cadastro de endereço separado já aceito antes de um checkout inválido não é revertido automaticamente.

## Evidências e limites de cobertura

- Inventário testado contra os routers Express reais: todos os 43 contratos correspondem às rotas registradas, todos com middleware.
- Todas as rotas rejeitam query inesperada; todas as mutações com schema rejeitam {}, array, null, primitivas e extra interno; estado completo fake comparado antes/depois.
- Todos os GET explícitos aceitam entrada válida, além de HEAD. CRUD/perfil/endereço/configuração/checkout válidos têm cobertura nas regressões e novos casos.
- Pedidos: repetição de produto, 51 itens, 500+ unidades, decimais/tipos/NaN/Infinity, extras aninhados, cartão/status manipulado, Unicode/controles, transação sem escrita quando item posterior inexiste.
- Configuração: merge e legado cartao, flags contraditórias, centavos, horários/URLs/UF/CEP; auth/loja preservados mesmo com body inválido.
- Firebase usa Auth/Firestore reais locais e comparação de snapshots antes/depois de lote inválido. Concorrência 5x cria um pedido/nonce; total 47,98 vem de 2×19,99 + taxa 8; recuperação de outra identidade negada. JSON inválido, excesso, charset e gzip têm teste HTTP real.
- Suite22 inclui suite21 → suite20 → suite19. As 300 negações diretas de Firestore permanecem na regressão 21. SDK Firebase real/IAM/índices de produção e homologação celular não são comprovados pelo Emulator.

Fontes oficiais consultadas: [Express 5 API](https://expressjs.com/en/api/) e [atualização de objetos aninhados no Firestore](https://firebase.google.com/docs/firestore/manage-data/add-data#update_fields_in_nested_objects). Implementação final também conferida contra o body-parser instalado: tipos reconhecidos de parsing, charset, encoding e limites. A mesclagem explícita em transação preserva objetos e valida o estado resultante antes de atualizar.
