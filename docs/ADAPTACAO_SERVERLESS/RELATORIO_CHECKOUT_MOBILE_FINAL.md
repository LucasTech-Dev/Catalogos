# Checkout mobile: UF, confirmação visual e WhatsApp — 25/10/2026

A — EXECUÇÃO PELO CODEX — CHECKOUT-MOBILE-02

Objetivo: atender o anexo sobre UF pouco clara, aparência da confirmação e risco de o formulário continuar visível. Retomada conferiu main40cdedd limpa; nenhum processo anterior da tarefa estava pendente. A mensagem posterior “quando acabar publique automaticamente, eu autorizo, retome” autoriza commit/push main e deploy Pages ao terminar, superando somente a proibição de publicação automática do anexo. Não autoriza alterações Firebase, Rules, IAM, índices, Auth, preços, produtos ou pedidos históricos; nenhuma dessas operações será executada.

A implementação vigente já substituía o formulário por uma confirmação separada e já tinha numeroPedido transacional por loja. Esses mecanismos foram mantidos, sem reescrever checkout ou geração do número. Confirmação, histórico/detalhes, admin e WhatsApp continuam usando o mesmo rótulo comercial; ID técnico permanece somente nas referências internas. A descrição recebida das capturas Android não permite atribuir uma causa exata ao estado daquela sessão. A confirmação tinha estilos globais mínimos; agora possui CSS completo importado pelo próprio componente e verificado por estilos computados no navegador.

Alterações:

- UF: título mantido, ajuda “(Estado — ex.: RS)”, placeholder “Ex.: RS”, autocapitalização e só letras, duas posições, pattern das27siglas e validação de domínio antes de qualquer criação. Mensagem junto ao campo, aria-invalid/descrição acessíveis após interação. Sigla preservada ao alternar entrega/retirada e digitar nos demais campos. Endereço salvo é normalizado para maiúsculas. Não foi criado outro seletor ou persistência de dados pessoais.
- Confirmação: card branco centralizado, fundo suave, sombra/borda, hierarquia clara, ícone GoogleMaterial existente, número comercial destacado, total definitivo, pagamento/modalidade, botão WhatsApp verde com contraste maior, “Ver meu pedido” e “Iniciar novo pedido”. CSS pertence ao componente, inclusive botões/foco/estados e quebra de textos. Não mostra formulário ou botão de registrar após o servidor confirmar a gravação.
- WhatsApp: mensagem organizada por pedido/loja, itens/quantidades/preços, totais, modalidade/endereço, observações e pagamento pendente. Mantém só referência comercial, sem ID técnico. Link usa o gerador já existente, não cria novo pedido e não confirma recebimento/pagamento. Erro permite preparar novamente somente o link do pedido confirmado.
- Retomada: botão de preparar link fica ocupado durante a consulta; trocar de conta limpa o estado ocupado e descarta URL/confirmacão atrasadas da conta anterior. Idempotência, bloqueio de múltiplos cliques, recuperação de resposta perdida e marcador por loja/usuário mantidos. Novo pedido remove somente o marcador local da tentativa e abre o cardápio; pedido salvo não é apagado e nenhum novo registro é criado automaticamente.

Arquivos técnicos:

| Arquivo | Função |
| --- | --- |
| frontend/src/pages/Checkout.jsx | Ajuda/normalização/validação visual UF, sigla preservada, busy do WhatsApp e limpeza por sessão |
| frontend/src/components/conta/ConfirmacaoPedido.jsx | Estrutura/ícones/ações da confirmação exclusiva |
| frontend/src/components/conta/ConfirmacaoPedido.css | Estilo próprio, card/total/número/botões/foco/responsividade |
| frontend/src/styles.css | Ajuda e erro de UF; estilos anteriores da confirmação realocados ao CSS próprio |
| frontend/src/lib/whatsappPedido.js | Apresentação comercial da mensagem, sem nova operação de compra |
| quality/frontend/test/compras.test.jsx | UF, retomada/URL pendente, validações e fluxo existente |
| quality/frontend/test/numeroPublicoMobile.test.jsx | Conteúdo comercial do WhatsApp, observações/total/número sem ID técnico |
| quality/frontend/test/seguranca.test.jsx | Troca de conta durante preparo de link sem vazamento/travamento |
| quality/frontend/scripts/numero-publico-browser.mjs | UF inválida sem gravação, estilos computados, capturas, novo fluxo sem compra automática |
| quality/frontend/scripts/numero-publico-emulator.mjs | Recibo desta rodada separado, preservando evidência histórica NUM-MOB-01 |

Validação:

31 testes direcionados/3arquivos aprovados em32,45s, incluindo múltiplos cliques, rede perdida, reload, URL com erro e troca de UID. Ensaio `CATALOGOS_CHECKOUT_MOBILE=1 node quality/firebase/executar-numero-publico.cjs`:30checks de regras/concorrência existentes e36Chrome aprovados. Contas anônima/autenticada, entrega e retirada, UFxx sem escrita, rs→RS preservado na troca, card/CSS/ícone/botão verde/toque≥48px/sem transbordamento em320/360/390/1366, confirmação e reload sem duplicação, início de novo fluxo sem apagar/criar pedido, buscas cliente/admin e WhatsApp conferidos. Um pedido de navegador exclusivamente sintético no Emulator; zero compras reais, contas reais ou mensagens reais geradas. Build inicial homologacao18,52s aprovado; build integrado final e publicação serão registrados no fechamento.

As capturas [320px](EVIDENCIAS_CHECKOUT_MOBILE/sucesso-android-320.png) e [390px](EVIDENCIAS_CHECKOUT_MOBILE/sucesso-android-390.png) mostram dados fictícios em Emulator. Captura390 inspecionada visualmente antes de publicar: sucesso centralizado, botões legíveis e formulário ausente. Emulação Chrome/UAAndroid e iPhone, não teste em aparelho real ou motorWebKit. Limite físico continua explícito.

Falhas/correções: primeiro teste novo usava busca textual ambígua “Entrega”, também presente no resumo; corrigido para selecionar botão por papel/nome, sem alterar implementação por causa do teste. Uma comparação Git via subprocessoNode foi limitada pela sandbox; comparação direta de bytes confirmou Rules locais iguais ao checkout limpo. Nenhuma proteção foi alterada para executar testes. Aviso de bundle grande permanece conhecido; sem novas dependências ou auditoria/refatoração ampla.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

Autorização de publicação ATENDIDA pela mensagem atual; não perguntar novamente. Após deploy, conferência física Android/iPhone/WhatsApp pelo proprietário é julgamento visual, sem senha/token no chat. Não é condição adicional para executar o deploy já autorizado. Não criar pedido real de teste automaticamente. Próxima ação do Codex nesta ordem: preparar release seletiva, testes/build integrados, commit/push main LucasTech-Dev/Catalogos, deploy Pages catalogo-demo, leitura pública e registro final. Preservar configuraçãoPages, Firebase e evidências anteriores.

Fontes/testes/capturas/build e manifestos úteis preservados; nenhum descartável novo a excluir. Guia Mestre, Registro, Diário, plano, Continuidade, guia consolidado e ressalvas atualizados; inventário/índice regenerados. Contrato/matriz de dados e noveMVPs inalterados; B-03/B-04/fotos/aceite comercial não recebem baixa. Espelho externo ausente, não recriado. Tempo integral não cronometrado como medição única; durações de comandos registradas, sem inventar tempo retrospectivo. Estado desta entrada: validado localmente, publicação automática autorizada em execução.
