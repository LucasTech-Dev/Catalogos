> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# ETAPA 24 — Roteiro de homologação manual

Preparado em 13/10/2026. **Não realizado em dispositivos físicos nesta ordem.** Chrome automatizado/Emulator são evidências distintas. Executar antes do lançamento e registrar navegador/versão/aparelho/data/responsável/resultado/screenshot de cada item. Usar dados fictícios e ambiente de homologação; implantação e escritas reais exigem ordem própria.

## Preparação

- Confirmar ambiente seguro, API/CORS/Firebase Web, provedores/domínios, usuário admin de cada loja e Rules/índices autorizados. Nunca usar credenciais Admin no navegador.
- Testar Chrome e Firefox desktop; Safari/iOS e Chrome/Android em celulares físicos, incluindo aparelho de menor capacidade.
- Separar lojas A/B e clientes distintos. Registrar tamanhos de tela, conexão/Wi-Fi/móvel, zoom e permissões; proteger screenshots que contenham dados pessoais.
- Confirmar revisão de R-001–R-022 e da política de nonce/retencão; não excluir idempotência sem janela aprovada.

## Catálogo e carrinho

1. Abrir raiz e URLs diretas de cardápio/produto; recarregar e usar voltar/avançar. Conferir filtro/preço/nome/ingredientes/imagem/opcionais.
2. Conferir ativos/inativos/indisponíveis, catálogo vazio, rede offline/lenta e botão de retry. Preço atualizado deve prevalecer sobre resposta atrasada.
3. Adicionar, aumentar até 99, tentar exceder, diminuir, remover e limpar; recarregar/navegar. Carrinho de outra loja não deve aparecer.
4. Alterar preço/ativo pelo admin enquanto cliente compra. Confirmar valor definitivo do servidor ou rejeição segura, preservando tentativa apropriada.
5. Conferir contraste, foco, teclado, leitura de labels/alertas, zoom 200%, teclado móvel e ausência de rolagem horizontal involuntária.

## Cliente, sessão e endereços

6. Entrar como convidado, registrar pedido e vincular cadastro ao mesmo UID; fazer logout/login e conferir histórico próprio. Cliente A não acessa B.
7. Atualizar perfil próprio, criar/editar/excluir endereço, complementar CEP/UF/número s/n; rejeitar incompletos e IDs alheios.
8. Revalidar token expirado/revogado, usuário inativo, troca de conta e resposta atrasada; dados anteriores não podem reaparecer.
9. Fechar/reabrir aba durante tentativa pendente: recuperação via nonce ou preenchimento novamente, sem criar duplicata. Verificar navegador compartilhado.

## Checkout e WhatsApp

10. Fazer entrega com endereço próprio e retirada sem endereço; conferir mínimo/taxa/habilitações, observações acentuadas, quatro formas e pendente.
11. Dar cliques rápidos; simular rede cortada antes/depois da gravação e timeout. Retomar manualmente a mesma tentativa e confirmar um pedido.
12. Confirmar snapshot/endereço/produtos/quantidades/valores na mensagem; URL vem da loja correta e é HTTPS wa.me.
13. Abrir WhatsApp **somente por ação consciente do responsável**; não enviar mensagem real automaticamente. Abertura não prova envio/recebimento/pagamento.
14. Falha do WhatsApp não gera novo pedido nem confirma financeiro. Pedido cancelado/recusado/terceiro e número inválido não devem permitir finalização.

## Administração

15. Entrar em cada loja; cliente/anônimo/admin de outra loja não acessam painel. Recarregar URLs internas, navegar/back, logout e refresh.
16. Criar/editar/desativar produto/categoria; vínculos impedem exclusão imprópria. Confirmar alteração pública e validação de valores/URL.
17. Conferir pedidos/clientes, filtros/cursor/paginação, dashboard por período e cálculo de confirmados/cancelados.
18. Confirmar/recusar pagamento explicitamente e transições operacionais; dois operadores simultâneos não duplicam confirmação.
19. Editar configurações sem apagar objetos/dias omitidos; conferir horários noturnos, taxa, mínimo, retirada/entrega e pagamento habilitado.
20. Simular 401/403/409/429 quando houver rate limiting/500/503 e internet lenta; infraestrutura não deve encerrar sessão legítima nem provocar retry inseguro.

## Registro e liberação

Anotar cada resultado como aprovado/reprovado/não executado, anexar evidência e reproduzir defeito antes de classificar gravidade. Atualizar registro permanente, incluindo R-010/R-012/R-013. Medir produção/homologação autorizada separadamente do Emulator; revisar IAM, cobrança, retenção e abuso. Homologação comercial exige autorização explícita após resolver os bloqueadores, não é automática com a Etapa 24.
