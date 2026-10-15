# Modelo Firestore atual

14/10/2026. Fonte: serviços/projeções/validadores reais; sem migração ou consulta de dados de produção.

| Caminho | Conteúdo/finalidade | Acesso |
| --- | --- | --- |
| usuarios/{uid} | nome/email/role(cliente ou admin)/lojaId/ativo/criadoEm/atualizadoEm | API de identidade própria; provisionamento admin controlado |
| lojas/{lojaId} | nome/descrição/telefone/whatsapp/endereço/horários/logo/imagem/corPrimaria/tempoMedio/instagram/pagamentos/entrega/retirada/pedidoMinimo/ativo | Projeção pública ou admin da loja |
| lojas/{lojaId}/categorias/{id} | nome/descrição/ativo/icone/ordem/datas | Catálogo e admin autorizado |
| lojas/{lojaId}/produtos/{id} | nome/descrição/preço/categoriaId/ativo/disponivel/imagem/ingredientes/datas | Catálogo filtra ativo/categoria; adminCRUD |
| lojas/{lojaId}/clientes/{uid} | nome/telefone/email/anonimo/datas | Próprio/admin da mesma loja |
| .../clientes/{uid}/enderecos/{id} | rua/numero/bairro/cidade/uf/apelido/complemento/cep | Próprio/admin conforme rota |
| lojas/{lojaId}/pedidos/{id} | lojaId/clienteId/enderecoId/endereço snapshot/cliente/itens/subtotal/taxaEntrega/desconto/total/pagamento/observacao/tipoEntrega/status/datas | Titular ou admin da loja |
| lojas/{lojaId}/idempotencia/{sha256} | assinatura SHA-256 do corpo canônico e pedidoId | Somente backend, hash do documento deriva UID:chave |

Não há coleção empresas implementada, senha no Firestore, gateway/PAN/CVV, estoque quantitativo, variações/adicionais/cupons ou papel global. Campos inesperados não devem ser enviados para contornar contrato.

Itens são snapshots {produtoId,nome,precoUnitario,quantidade,subtotal}; pagamento {forma,status,valor,datas quando existentes}. Formas pix/dinheiro/cartao_credito/cartao_debito; inicial pendente. Endereço do pedido é snapshot, não referência viva que muda ao editar perfil. Valor/financeiro informativo não prova liquidação.

Estados reais: recebido,pagamento_confirmado,em_preparacao,pronto,saiu_para_entrega,entregue,cancelado,pagamento_recusado. Não há estado enviado_whatsapp ou campo obrigatório enviadoEm. Confirmação financeira e transição operacional são sincronizadas pelas regras dos serviços, não por abrir URL.

Datasource público usa allowlist/projeções: não expõe usuários/clientes/pedidos/nonces/campos arbitrários. Timestamp devolvido pode ser objeto {_seconds,_nanoseconds}, não exigir sempre stringISO.

## Índices e legados

Sete índices preparados em firebase/firestore.indexes.json; inventário por consulta em [ambientes25](ETAPA_25_CONFIGURACAO_AMBIENTES.md). Regras negam leitura/escritaSDKdireta; Admin SDKbypass exige IAM/backend. Emulator não comprova índices/IAM/fatura real.

Cliente novo usa UID; cliente legado cli_* não comprova titularidade. Não inferir migração por nome/email. Link de conta anônima preserva UID. Backup/dry-run/manifesto/precondições/rollback devem manter financeiro/endereço e associação idempotente. Sem TTL/exclusão automática. Retenção/exclusão do titular dependem de política aprovada; hash/vínculo também podem ser dados associados ao indivíduo.
