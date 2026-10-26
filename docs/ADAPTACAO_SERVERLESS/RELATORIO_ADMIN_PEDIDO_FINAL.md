# Adendo à finalização — detalhes administrativos de pedidos — 25/10/2026

Estado: **FUNCIONAL E PRONTA PARA PUBLICAR**, no ambiente local controlado. Complementa a última finalização, sem criar outro plano/MVP. Publicação desta alteração não executada. O item15 do novo anexo determina: “Não realizar commit, push ou deploy automaticamente” e “Aguardar autorização de publicação após conclusão dos testes e verificação de segurança.” A autorização automática anterior foi atendida na release7647d6b; este anexo posterior determina novo gate. Nenhuma mudança no Firebase real.

## A — EXECUÇÃO PELO CODEX

AD-PED-C1 — objetivo: revisar exclusivamente `/admin/pedido?id=...` e os serviços/apresentação utilizados por ela. Pré-requisito: base publicada7647d6b e serviço transacional administrativo existente; atendidos. Implementação local concluída. Não houve auditoria geral, nova dependência, reconstrução do serviço ou alteração de transições/Rules. Meta adicional30–60min; comandos registrados abaixo, sem inventar uma medição retrospectiva do tempo técnico integral.

O serviço já persistia via `runTransaction`, exigia admin ativo da loja, revisão esperada e histórico atômico, e retornava releitura de servidor. A tela antiga descartava esse retorno e fazia uma segunda leitura, cujo resultado de falha não era verificado antes da mensagem de sucesso. Agora só recebe sucesso após o retorno confirmado do serviço e usa esse documento retornado. Falhas não antecipam o estado selecionado como persistido. Conflito orienta atualização, sem retry de escrita automático; erro de leitura anterior é removido quando uma gravação/releitura posterior é confirmada; falha incerta da operação pede nova consulta. Sessão/permissão inválida remove dados exibidos; AdminGate e autorização de serviço/Rules continuam obrigatórios.

AD-PED-C2 — layout concluído: CSS próprio acompanha o chunk da página; coluna principal de itens/valores/observações/andamento, lateral de cliente/entrega/financeiro, cards brancos e largura útil, uma coluna até850px, overflow controlado e botões≥44px. Cabeçalho mostra número comercial, data e badge do estado persistido. Releitura tem ícone Google, spinner discreto, aria-busy, foco/hover e bloqueio por ref contra clique duplo. Seletor mostra somente transições já fornecidas pelo serviço, inclusive as condições financeiras existentes. Botões têm loading e feedback global. Ícones usam assets Google existentes; animação respeita reduced-motion.

Cancelamento operacional e alteração financeira usam o modal global com foco/teclado/confirmação consciente, sem autoencerrar após5s. Toasts reutilizam o sistema existente com limite5s, X, clique fora, deduplicação e anúncios acessíveis. Não foram criados listeners persistentes de pedidos. O refresh faz somente leitura; as gravações não alteram preços, itens, cliente ou tipo de entrega.

Financeiro e andamento continuam separados. Confirmar pagamento é registro manual explícito, não aprovação Pix/cartão/bancária. Confirmar financeiro não altera status operacional; alterar andamento não altera pagamento. Matrizes existentes preservadas, inclusive o passo pagamento_confirmado antes de preparação e estados terminais sem novas transições. Não reinterpretar “Entregue” como pago. Valores exibidos vêm do snapshot histórico; desconto e preço unitário mostrados quando disponíveis, ausência aparece como Não informado, sem recalcular o total.

AD-PED-C3 — numeração/compatibilidade concluídas: sequencial transacional por loja, contador/reserva, busca exata, concorrência e IDs internos preservados. Nenhuma geração ou migração nova. Para históricos sem numeroPedido válido, helper compartilhado apresenta Sem número em vez de expor fragmento técnico; detalhe admin explica o histórico. Datas, itens e links internos continuam distinguindo os registros. Não se inventa um número comercial para documento antigo. WhatsApp/cliente/admin reutilizam o mesmo helper; novos pedidos mantêm seus números estáveis. DTO de pedido passa a preservar observacao de item já existente, sem novo campo gravado nem exposição de campos privados; observações comerciais atuais agregadas no campo geral continuam visíveis.

AD-PED-C4 — validação concluída:

-62 testes/6arquivos aprovados em27,89s: página, painel, cliente, DTO, número/WhatsApp e matrizes administrativas.28 testes das duas telas afetadas novamente aprovados em19,16s após ajuste do retry/ícone.17 testes globais de notificações/modal aprovados em2,72s. São80 testes distintos em7arquivos, incluindo uma regressão adicional para remoção do erro anterior; repetições não somadas.
- `node quality/firebase/executar-admin-detalhes.cjs`:154checksSDK/Rules+34Chrome aprovados. O runner exige hosts localhost e usa os emuladores existentes em8188/9198, com projeto demo. Contas/pedidos sintéticos; zero conta/pedido/escrita Firebase real, zero WhatsApp enviado. Matriz inteira, transições negadas, clientes/admin de outra loja, revisão concorrente, histórico imutável e valores preservados. Pedido criado pelo clienteA, alterado pelo admin, relido em detalhes e listagem deA; dashboard releu entregue e valor financeiro confirmado. ClienteB não acessa; nenhuma mudança emRules necessária.
- Navegador: checkout→painel→confirmação financeira→operações→cliente acompanhando, leitura manual com sucesso após retorno, isolamento, paginação, ausência de Express/exceções. CSS/colunas/área de toque/ausência de rolagem horizontal em320/360/390/1366px. Capturas [mobile](EVIDENCIAS_ADMIN_PEDIDO/pedido-390.png) e [desktop](EVIDENCIAS_ADMIN_PEDIDO/pedido-1366.png) inspecionadas. Dados exclusivamente sintéticos. Chrome não equivale a aparelho físico/WebKit.
- Novos testes de interface verificam clique duplo, promise pendente sem sucesso antecipado, falha de rede, preservação de seleção, conflito, permissão, cancelamento explícito, separação financeira e histórico semID na tela. Nenhuma query real de homologação de pedido executada.
- Build homologacao aprovado em18,96s; build final após os últimos ajustes aprovado em9,48s, com9regressões da página aprovadas novamente em4,77s. Aviso conhecido de chunk>500kB permanece; sem refatoração fora do escopo.

Arquivos e funções (hashes em [manifesto](ADMIN_PEDIDO_ARQUIVOS.json)):

| Arquivo | Função |
| --- | --- |
| frontend/src/pages/admin/PedidoDetalhes.jsx | Layout, ações reais/releitura, bloqueio, confirmação, feedback e fallbacks |
| frontend/src/pages/admin/PedidoDetalhes.css | Acabamento responsivo e estados dos controles |
| frontend/src/lib/numeroPedido.js | Fallback histórico honesto, preservando sequência atual |
| frontend/src/services/pedidos.js | Projeção autorizada de observação histórica de item |
| quality/frontend/test/adminPedidoDetalhes.test.jsx |9regressões assíncronas da página |
| quality/frontend/test/admin.test.jsx | Confirmação financeira integrada ao modal global e retorno canônico |
| quality/frontend/test/numeroPublicoMobile.test.jsx | Histórico sem fragmento deID e sem número inventado |
| quality/frontend/test/areaCliente.test.jsx | Busca e navegação preservadas peloID interno |
| quality/frontend/test/pedidosSdk.test.js | Projeção de observação sem campo privado |
| quality/frontend/scripts/admin-pedidos-browser.js | Fluxo real no Emulator e estilos/capturas em4larguras |
| quality/frontend/scripts/admin-pedidos-emulator.js | Matriz existente com releitura cliente/dashboard e recibo seguro |
| quality/frontend/scripts/homologacao-real-011.mjs | Seletores ajustados à nova interface; não executado no Firebase real |
| quality/firebase/executar-admin-detalhes.cjs | Orquestração local reproduzível e encerramento dos emuladores próprios |

Falhas de execução corrigidas: tentativa inicial de criar o novo teste a partir de frontend usou caminho relativo da raiz e falhou antes de escrever; arquivo foi criado no diretório correto e seus9casos executados. Testes de busca históricos esperavam fragmentoID no título; passaram a conferir o link técnico preservado, incluindo a ambiguidade intencional de registros Sem número. Logs PERMISSION_DENIED no Emulator pertencem aos ataques esperados e foram confirmados pelas asserções, não são aceites ignorados. Scripts históricos/fixtures e configurações úteis foram preservados.

Segurança/limpeza: Rules locais comparadas byte a byte com a release7647d6b, hash71ca854897cae61da43c880a9e6ced50fdc269a013f84d39fafec781bb661175. Scanner dos arquivos afetados sem chave privada/identidade privada do proprietário. Git raiz permanece sem commits e com trabalho prévio não rastreado; checkout de publicação limpo em7647d6b, sem stage/commit/push/deploy nesta ordem. Manifesto distingue fontes desta alteração, sem copiar documentos ou scripts privados à release. Processos/perfisChrome e emuladores próprios encerrados pelo helper; build, testes, capturas e recibos necessários mantidos. Sem limpeza pendente nem exclusão de conteúdo exclusivo. Espelho externo ausente, não recriado.

Guia/Registro/Diário/plano/Continuidade/guia consolidado/ressalvas atualizados; matriz apenas registra a projeção de observação, sem novo esquema/contrato de escrita. Índice/inventário conferidos. Não houve baixa deMVPs nem liberação comercial geral. CRUD/categorias/imagens/configurações/limpeza de homologação referidos no anexo permanecem preservados no roteiro vigente; este relatório comprova a página de pedidos e não declara essas frentes novamente homologadas.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

AD-PED-H1 — plataforma GitHub LucasTech-Dev/Catalogos/main e Pages catalogo-demo; objetivo autorizar a publicação conjunta da correção pronta. Estado: AGUARDANDO AUTORIZAÇÃO, conforme item15 do anexo posterior. Sem nova dependência Firebase/Rules/IAM/índice/Auth/migração para este código. Não disparar operação de painel nem exigir login pessoal agora. Após autorização: Codex integra seletivamente fontes/testes/evidências, confere base remota, build e deploy, valida URL pública sem compras reais; mantém rollback7647d6b/Pages2d7ab6cf.

AD-PED-H2 — julgamento visual posterior em sessão pessoal no Android/iPhone; pendente após publicação, sem senha/token no chat. Não é comprovação automática por viewportChrome. Não foi criado pedido real para este ensaio. Próxima tarefa exata: decisão AD-PED-H1; implementação local e documentação completas.
