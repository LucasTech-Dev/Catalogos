# Manual de personalização e entrega ao restaurante

14/10/2026. Procedimento documentado; nenhuma loja/admin/domínio real criado 26. Infra compartilhada ainda proposta 25, não aprovada/implantada. Proposta comercial exige escopo assinado e NO-GO técnico superado antes de entrega pública.

## Briefing e reunião

Registrar responsável/contato e aprovação, nome/descrição/identidade (logo,corPrimariaHEX,imagem), endereço/horários/tempoMedio/WhatsApp/telefone/Instagram; categorias(nome/descrição/ordem/ícone), produtos(nome/descrição/preço/categoria/ingredientes/imagem/ativo/disponível), formasPix/dinheiro/crédito/débito, entrega habilitada/taxa única, retirada, mínimo. Imagens precisam direitos/URLs válidas; uploadStorage não é implementado. Dados pessoais/contratos são privados; não inserir emGit.

Definir público-alvo/segmento/região com proprietário: não existe regra de região comercial em código. Não inferir mercado de exemplosSãoPaulo. Registro de plano/preço/prazo/suporte/limites/serviços adicionais depende de aprovação; manter valores históricos sem convertê-los em contrato aprovado.

## Catálogo e configuração

1. Aprovar ID da loja, único e válido (sem slash/controles, até 128 caracteres); decidir ambiente e modelo de hospedagem.
2. Criar documento lojas/{id} em procedimento controlado autorizado (Emulator para ensaio); criação/onboarding não é endpoint público existente.
3. Criar conta administrativa verificada e usuarios/{uid} role admin/lojaId/ativo pelo operador autorizado. Não promover anônimo/cliente viaUI, não compartilhardadosdecredenciais. Não existe superadminglobal.
4. Login da loja→Configurações: nome,descrição,logo/imagem/cor/contatos/endereço/horários,pagamentos,entrega/retirada/mínimo. Usar campos aprovados; bairro/raio/taxa por região/calendário automático não são engine de delivery implementada.
5. Cadastrar categorias antes dos produtos; imagens por URLHTTP(S), sem credenciais; preço numérico com 2 casas. Disponibilidade não equivale a estoque quantitativo.
6. Conferir VITE_LOJA_ID ou mapaVITE_LOJAS_POR_HOST,CORS,AuthAuthorizedDomains eHTTPS. Mudança de mapa exige build revisado e associaçãoDNS autorizada. Copiar demo porcliente é alternativa histórica/dedicada; código reutilizável é premissa,infra compartilhada ainda decisão.
7. Testar catálogo/cliente/anônimo/endereço/carrinho/checkout/um pedido/URL WhatsApp,admin/status/financeiro/rolesA-B,offline/retry e dispositivos. Não enviar mensagem real automaticamente.
8. Restaurante confere textos/preços/imagens/taxa/mínimo/horários/WhatsApp e assina aprovação; infraestrutura/IAM/índices/backup/abuso precisam evidência antes de piloto.
9. Implantação somente com ordem externa e [manual](MANUAL_IMPLANTACAO.md); treinar operador conforme [admin](MANUAL_ADMINISTRADOR.md),registrar versão/contatos/suporte e rollback.

## Coleta e critérios de aceite

Checklist de materiais completos, qualidade de imagens, tabela de produtos validada e alterações extras orçadas separadamente. Sem prometer vendas garantidas, gateway/cupons/variações/adicionais/estoque/upload ou manutenção ilimitada. Pagamento é informativo e confirmado manualmente; URLWhatsApp não prova envio nem recebimento. [Plano piloto](PLANO_DE_HOMOLOGACAO_COMERCIAL.md).
