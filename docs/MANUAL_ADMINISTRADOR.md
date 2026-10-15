# Manual do administrador da loja

14/10/2026. Interface integrada/testada localmente; produção ainda NO-GO. Conta administrativa precisa vínculo explícito à loja; não há painel global da plataforma.

## Login e segurança

Abrir /admin, informar conta autorizada; AdminGate consulta /admin/lojas/:lojaId/sessao. Cliente/anônimo/outra loja não têm acesso. Não compartilhar senha emtextos/tickets; recuperação no fluxo de conta deve ser homologada no provedor real. Token expirado/invalidado pede login; indisponibilidade 503 não deve ser confundida com credencial 401.

## Dashboard

Período emAmerica/Sao_Paulo, máximo 31 dias. Pedidos criados no período; valor de pedidos inclui cancelados; confirmado financeiro exclui cancelados. Não é liquidação bancária/gateway. Dados legados sem timestamps podem não entrar emquery,reportarantesdetomar decisãofinanceira.

## Pedidos e pagamentos

/admin/pedidos tem filtros/paginação e detalhes em/admin/pedido?id=... . Verificar itens/snapshot/endereço/tipoentrega/observação/total do servidor. Statuspermitidos: recebido→pagamento_confirmado→em_preparacao→pronto→saiu_para_entrega/entregue; cancelamentos/recusa seguem mapa permitido, estados finais não retornam livremente.

Confirmar/recusar financeiro é ação explícita autorizada; initialpendente,formaPix/dinheiro/crédito/débito. Transação evita alterações concorrentes inconsistentes. Não confirmar por abrirWhatsApp ou copiar número; registrar somente evidência operacional real conforme política do estabelecimento. Valores do pedido não se ajustam automaticamente após mudar preço de produto.

## Produtos/categorias/clientes

/admin/produtos lista/busca textual local/paginação; criar em/admin/produto/novo,editar em/admin/produto?id=... . Preço/categoria/descrição/imagemURL/ingredientes/ativo/disponível. DELETEproduto desativa, não elimina histórico. Categoria vinculada não pode ser excluída sem mover produtos; transações preservam integridade.

/admin/clientes lista apenas vínculos da loja com projeção; não existe gestão de contaAuth/role no painel. Endereços/dadospessoais são privados, sem exportação irrestrita para equipe central.

## Configurações e logout

/admin/configuracoes: nome/descrição/contato/endereço/horários/logo/imagem/cor/WhatsApp,quatroformas,mínimo,taxa única/entrega/retirada. PATCHparcial preserva objetos/dias não informados. Conferir efeito público emnovo acesso/foco. Cor deveHEX e links válidos; não existe editor visual arbitrário/unlimitedCMS.

Sair no cabeçalho/sidebar chama encerramento da sessão; verificar painel fechado. Em dispositivo compartilhado, fecharaba apóslogout. Falha de rede deve preservar tentativa eformulário quando aplicável. 409 conflito pede conferência,429aguardarRetry-After,500/503reportarrequestId semPII. Não repetir confirmaçãofinanceira sem verificar estado persistido.
