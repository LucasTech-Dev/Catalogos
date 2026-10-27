# Ordem012 — limpeza delimitada executada; pendências preservadas — 26/10/2026

A — EXECUÇÃO PELO CODEX:012-C1–7 no manifesto concluídos tecnicamente com verificação real.64 documentos removidos (14 pedidos principais,8 legados,9 históricos,8 perfis,13 endereços/tentativas,7 idempotências,3 reservas,2 usuarios de clientes), sete contas Auth de clientes removidas. Leitura21:10:18 Brasília:zero pedidos/zero perfis,39 documentos/21Auth restantes;38 documentos protegidos idênticos. Administrador proprietário Google/UID/permissões e outros dois administradores preservados. Backup103documentos/28Auth com recuperação319checks, três testes de seleção e nove verificações públicas aprovados. Catálogo, produtos/categorias/configurações/projeções/revisão comercial/Rules/índices/IAM/código runtime/Cloudflare mantidos. Sem conta/pedido real de teste, commit/push/deploy.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:012-H1 (números/compromissos externos) e012-H2 (18 anônimos sem vínculo) continuam sem resposta. Contador restabelecido em3; próxima compra seria#4, NÃO#1. As18 contas incertas e dois administradores continuam preservados; não declarar Ordem012 integralmente concluída. Próxima tarefa exata: obter fatos012-H1/H2 e revalidar imediatamente antes de qualquer reset/limpeza complementar; não repetir64/sete já excluídos.012-H3 sessão pessoal/primeira compra pelo proprietário após definir numeração. NoveMVPs e demais riscos preservados. Backup privado fora do checkout publicado e ignorado; espelho externo ausente. Sem limpeza importante pendente.

Relatório: [Ordem012: resultado real, backup e pendências](RELATORIO_ORDEM_012_LIMPEZA.md).


---

# PENDÊNCIA — Limpeza dos pedidos antigos e numeração comercial (retomar em casa)

**Registrado em:** 26/10/2026  
**Estado:** PENDENTE / NÃO EXECUTADO  
**Prioridade:** alta, mas adiada a pedido do proprietário.  
**Projeto:** Firebase `bancorestaurante` · loja `loja-demo` · GitHub `LucasTech-Dev/Catalogos` (branch `main`).

## Decisão já tomada
O proprietário **autorizou explicitamente** a exclusão dos pedidos antigos da coleção `lojas/loja-demo/pedidos`, para reiniciar os testes comerciais com pedidos criados por ele e numeração pública simples (`Pedido #1`, `#2`, `#3`...). A autorização não abrange excluir clientes, Auth, produtos, categorias, loja ou configurações; nem alterar Rules/IAM/índices. Revalidar o escopo e a situação real antes de qualquer exclusão.

## Por que ainda não foi feito
- A integração Firebase do ChatGPT não pôde ser instalada/conectada.
- O Codespaces/Codex apresentou erro de inicialização e o Chrome encerrou a aba com `SIGILL`.
- **Nenhum documento do Firebase foi apagado por esta solicitação.** Nenhuma limpeza ou reset de contador ocorreu.
- Pedidos legados sem `numeroPedido` continuam exibindo `Pedido histórico sem número`.

## Funcionalidade já implementada no código
- `frontend/src/services/pedidoIncremental.js` usa uma transação Firestore que cria o pedido com `numeroPedido`, atualiza `lojas/{lojaId}/contadores/pedidos` e cria reserva `lojas/{lojaId}/numerosPedidos/{N}`.
- A numeração é por loja, com transação, idempotência e reserva para concorrência.
- O fluxo novo deve exibir o mesmo número no checkout, painel, histórico, detalhes e WhatsApp.
- A existência do código **não garante** que as Rules atuais, o estado real do contador ou os dados de produção estejam compatíveis. Conferir.

## Roteiro mínimo para executar em casa
1. Confirmar credenciais administrativas e que o projeto é **exatamente** `bancorestaurante` e a loja `loja-demo`. Usar apenas ambiente administrativo autorizado, nunca credenciais no frontend.
2. Pausar compras/escritas concorrentes durante a janela de limpeza e identificar outros processos ainda ativos.
3. Inventariar pedidos, subcoleções de histórico e documentos vinculados de `idempotencia`, `numerosPedidos`, `contadores/pedidos` e `clientes/{uid}/tentativasCompra`. Avaliar dependências em relatórios e nos registros do cliente.
4. Fazer **backup íntegro recuperável** de tudo que será excluído, validar a cópia e guardar fora do repositório público. O backup anterior da Ordem 010/011 não é necessariamente atualizado.
5. Conciliar contador e reservas com os pedidos existentes. **Não reiniciar em #1 se houver referências sobreviventes ou números já comunicados que não devam ser reutilizados.** Se for seguro, reiniciar a sequência; caso contrário continuar do próximo número válido.
6. Excluir somente os pedidos antigos e referências associadas comprovadas; não fazer exclusão cega de coleções. Tratar subcoleções de pedidos: apagar documento pai no Firestore não apaga as subcoleções.
7. Usar operações com conferência de identidade/versões e registrar falhas parciais; se houver divergências, parar e recuperar de modo dirigido.
8. Confirmar por leitura remota que a lista de pedidos está vazia, sem referências órfãs relacionadas; verificar que usuários, produtos, loja e Auth permanecem inalterados.
9. Verificar compatibilidade das **Rules efetivamente publicadas** com `numeroPedido`, contador e reserva. Não alterar Rules sem nova autorização específica.
10. Rodar testes de criação e concorrência **no Emulator**. O proprietário fará pessoalmente o primeiro pedido real depois da limpeza.
11. Na compra real, confirmar o mesmo número comercial no checkout, WhatsApp, histórico e painel; verificar isolamento e ausência de duplicação.

## Critério de conclusão
Relatar: número de pedidos excluídos; IDs ou caminhos envolvidos (sem dados sensíveis públicos); histórico/subcoleções excluídos; referências técnicas removidas; caminho privado/hash do backup; situação do contador; resultado de testes; primeiro número novo correto; integridade de clientes/Auth/produtos/configurações. Só marcar **CONCLUÍDO** depois de leitura real de confirmação.

## Restrições
- Não solicitar novamente a mesma autorização para a exclusão **já delimitada**, mas pedir nova autorização para alterações adicionais de Rules, IAM, Auth, índices, clientes ou outras lojas.
- Não criar pedidos reais de teste automaticamente.
- Não expor credenciais, backups com dados pessoais nem IDs completos de clientes em commits públicos.
- Não refazer arquitetura/Express/Render. Preferir o menor procedimento seguro.
