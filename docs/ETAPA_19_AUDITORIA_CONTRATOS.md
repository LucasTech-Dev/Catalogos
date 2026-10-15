> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# Etapa 19 — Auditoria e contratos finais

Data: 13/10/2026. Referência inicial: main, b8e2a4ba39ae233ad413b434d6ce5cbb42b15308. Árvore do repositório interno limpa na auditoria. O diretório pai possui outro Git e não é o repositório de implementação.

## Incompatibilidades encontradas

- Todas as consultas do catálogo exigiam usuário cadastrado e vínculo com loja. Criada projeção pública explícita, sem abrir documentos administrativos.
- Auth rejeitava identidades Firebase sem documento em usuarios. Agora essas identidades validadas recebem somente papel cliente; não podem acessar operações administrativas.
- Listagem/consulta/WhatsApp de pedidos autorizavam apenas por loja, expondo pedidos alheios. Agora listagem consulta clienteId igual ao UID; consulta individual e WhatsApp retornam 404 para pedido alheio. Admin autorizado mantém acesso à própria loja.
- Clientes e endereços não verificavam titularidade. Listagem de clientes exige admin; consultas de cliente/endereço exigem UID correspondente ou admin da loja.
- clienteId e taxa/desconto chegavam do navegador. Para clientes, clienteId é substituído pelo UID validado, taxa deriva da configuração da loja e descontos não autorizados são bloqueados.
- Pedido não persistia contato do comprador nem uma cópia do endereço. Adicionados contato validado e snapshot do endereço; WhatsApp permanece estável após editar/excluir endereço cadastrado.
- Criação não possuía prevenção de duplicação. Clientes agora precisam enviar Idempotency-Key. Transação grava pedido e registro da chave conjuntamente; repetição recupera o pedido original mesmo após mudança de disponibilidade/preço/configuração. Chave diferente não recupera pedido de outro UID. Mesmo chave/corpo diferente é rejeitado.
- Checkout enviava cartão genérico, preços/total/taxa fictícios e montava mensagem independente. Agora usa quatro formas reconhecidas e somente a URL do pedido real.
- Não havia escrita de perfil/endereço do próprio comprador. Adicionadas rotas autenticadas /me com projeção e validação explícitas.
- CORS ausente; configuradas origens explícitas. Arquivo de Security Rules vazio; preparada negação de acesso direto, já que o cliente consome a API/Admin SDK.

## API consumida pelo React

As respostas são JSON direto, sem envelope data. Erros possuem `{ "error": "mensagem" }`.

| Método e rota | Acesso | Retorno/código |
| --- | --- | --- |
| GET /publico/lojas/:lojaId/catalogo | Público | 200 `{loja,categorias,produtos}`; 404 loja ausente/inativa |
| GET /publico/lojas/:lojaId/me | ID Token | 200 `{uid,email,anonimo,nome?,telefone?}` |
| PUT /publico/lojas/:lojaId/me | ID Token | 200 `{nome,telefone}`; 400 dados inválidos |
| GET /publico/lojas/:lojaId/me/enderecos | ID Token | 200 array de endereços próprios |
| POST /publico/lojas/:lojaId/me/enderecos | ID Token | 201 endereço persistido com id |
| PUT /publico/lojas/:lojaId/me/enderecos/:enderecoId | ID Token | 200 endereço próprio; 404 inexistente/alheio |
| DELETE /publico/lojas/:lojaId/me/enderecos/:enderecoId | ID Token | 204; só opera no caminho do UID validado |
| POST /lojas/:lojaId/pedidos | ID Token cliente/admin | 201 pedido definitivo; cliente exige Idempotency-Key; 400 validação/conflito |
| GET /lojas/:lojaId/pedidos | ID Token cliente/admin | 200 array; cliente somente seus pedidos |
| GET /lojas/:lojaId/pedidos/:pedidoId | ID Token cliente/admin | 200 próprio/admin da loja; 404 alheio/ausente |
| GET /lojas/:lojaId/pedidos/:pedidoId/whatsapp | ID Token cliente/admin | 200 contrato existente `{pedidoId,lojaId,numero,mensagem,mensagemCodificada,url,observacao}`; 400 status/número inválido |

Sem token: 401. Token inválido, revogado, expirado não renovável ou usuário Firebase desativado: 401. Perfil desativado/role indevida/vínculo com outra loja: 403. Origens fora de CORS_ORIGINS: 403. Preflight de origem permitida: 204.

Rotas administrativas existentes de PATCH pagamentos da loja/status do pedido/pagamento do pedido foram preservadas e continuam exigindo admin da loja. GET /usuarios/me permanece disponível para perfil interno existente; o frontend público utiliza /publico/lojas/:lojaId/me.

## Corpo do checkout

```json
{
  "itens": [{"produtoId": "produto-real", "quantidade": 2}],
  "tipoEntrega": "entrega",
  "enderecoId": "endereco-proprio",
  "pagamento": {"forma": "pix"},
  "cliente": {"nome": "Nome do cliente", "telefone": "11999999999"},
  "observacao": "Observação opcional"
}
```

Retirada omite enderecoId. Nenhum UID, role, lojaId, preço, subtotal, total, desconto ou taxa é necessário no corpo. O backend calcula os valores; pagamento nasce pendente. Quantidades inteiras de 1 a 99. Observação limitada a 1000 caracteres. Produtos exigem ativo=true, disponível diferente de false e preço numérico finito não negativo.

Endereço exige rua, numero, bairro, cidade, uf; aceita apelido, complemento, cep. Strings limitadas a 200 caracteres. Perfil aceita somente nome e telefone. Campos administrativos enviados nessas rotas não são persistidos.

## Configuração de loja e compatibilidade

- Pagamentos: pix, dinheiro, cartao_credito, cartao_debito booleanos. Configuração legada cartao=true habilita crédito e débito, conforme serviço existente.
- Entrega: entrega.habilitada=true e entrega.taxa numérica não negativa; taxaEntrega na raiz aceita como valor legado, mas não habilita entrega sozinha. Ausência de configuração bloqueia entrega.
- Retirada: retirada.habilitada=false desabilita; ausência mantém retirada disponível, compatível com backend anterior.
- Informações públicas: nome, descricao, logo, imagem, telefone, whatsapp, endereco, corPrimaria, tempoMedio. Endereço estruturado e horários recebem projeções próprias; nenhuma chave administrativa deve ser adicionada implicitamente ao contrato público.
- Horários: texto ou objeto por segunda/terca/terça/quarta/quinta/sexta/sabado/sábado/domingo; cada dia pode ter abertura, fechamento e fechado.
- Produtos: id, nome, descricao, preco, imagem, categoriaId, ativo, disponivel, ingredientes. Categorias: id, nome, descricao, icone, ordem; categorias explicitamente inativas são omitidas.

Não houve migração de clientes legados nem alteração de configuração da loja real. Clientes cujos documentos antigos usam ID diferente do UID precisam de migração controlada com vínculo comprovado; não se infere titularidade pelo nome/e-mail ou por clienteId vindo do navegador.

## Autenticação e armazenamento

Firebase Web SDK usa sessão anônima para convidado. Cadastro opcional vincula credencial à identidade anônima, preservando UID. Contas Firebase novas sem documento interno nunca recebem privilégios administrativos. Perfis internos existentes conservam isolamento por loja e status ativo.

Carrinho guarda apenas IDs e quantidades por loja em localStorage. Catálogo é recarregado na navegação e ao recuperar foco. Checkout guarda chave, corpo congelado, endereço e pedido retornado por loja e UID; falhas de conexão mantêm a tentativa. Rejeições HTTP 400 antes de receber pedido permitem corrigir formulário; conflitos de chave preservam a tentativa. Falha no WhatsApp repete apenas a consulta do pedido já registrado. Nenhum token é incluído na URL WhatsApp.

A abertura é feita por link HTTPS explícito com target=_blank e rel=noopener noreferrer, após validar domínio exato wa.me, sem credenciais/porta e com caminho numérico. Evita depender de window.open após chamada assíncrona. A interface informa que abertura não confirma recebimento, envio ou pagamento.
