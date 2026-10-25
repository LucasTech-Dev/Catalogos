# Google e notificações de ações — 25/10/2026

A — EXECUÇÃO PELO CODEX: NOTIF-01. Pedido unificado do anexo, com instrução posterior expressa de publicar automaticamente na main do repositório LucasTech-Dev/Catalogos e no Pages existente. Não constitui nova fase/MVP. OAuth teve aprovação própria para acrescentar exclusivamente catalogo-demo-cz1.pages.dev no projeto bancorestaurante.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: OAUTH-H1 autorizou somente esse domínio; OAUTH-H2 confirmou: “Login Google funcionou e abriu Minha conta”. Sem solicitação/registro de senha, código ou dados privados. Essa confirmação valida o consentimento real do usuário; testes do componente compartilhado validam sua disponibilidade no cadastro.

## Diagnóstico e correção OAuth

GET de configuração/provedor identificou Google habilitado, projeto/authDomain corretos e domínio público ausente. Backup recuperável privado feito antes do PATCH; updateMask exclusivo authorizedDomains. Na leitura imediatamente anterior à alteração existia também a variante catalogo-demo-cz1.pages.deV, surgida externamente desde o diagnóstico. Foi preservada junto dos demais valores, sem remoção autorizada. Foi acrescentado somente o domínio correto em minúsculas; verificação posterior comprovou igualdade das demais configurações por SHA256. Uma escrita remota administrativa autorizada, sem alteração de usuários, Rules, IAM ou dados comerciais. Evidências sanitizadas: GOOGLE_OAUTH_DOMINIO_EVIDENCIAS.json, GOOGLE_OAUTH_DOMINIO_APLICADO_EVIDENCIAS.json e GOOGLE_OAUTH_LOGIN_MANUAL_EVIDENCIAS.json. Reversão eventual exige ato próprio e comparação com o estado atual; nunca restaurar uma configuração inteira por associação.

## Matriz de ações

| Área | Ação explícita | Resultado e confirmação |
| --- | --- | --- |
| Login/cadastro | E-mail, Google, recuperação, sair | Resultado após a operação; envio bloqueado enquanto pendente; recuperação genérica sem expor existência de conta. |
| Carrinho | Adicionar, remover, quantidade | Sucesso após atualização local válida; limite e indisponibilidade geram aviso. |
| Checkout | Registrar pedido/preparar WhatsApp | Sucesso só depois de confirmar pedido/finalização; recibo e retomada permanecem úteis na tela; sem sucesso de pagamento presumido. |
| Minha conta | Salvar dados, senha, endereço; excluir endereço | Resultado após persistência; exclusão requer confirmação; cancelar informa cancelamento. |
| Pedidos | Atualizar histórico/detalhe manualmente | Feedback somente no clique; leituras automáticas não disparam toast. |
| Admin | Login/logout, produto, categoria, configurações, pedido/status/financeiro manual | Sucesso após serviço; remoção/exclusão pede confirmação; financeiro mantém confirmação existente. |
| Admin clientes | Consultar detalhe | Detalhe é o resultado visual; falha usa toast, sem notificação redundante de consulta bem-sucedida. |
| Formulários | Obrigatórios inválidos, cancelar edição | Um aviso deduplicado; cancelamento informativo. |

Um toast por vez: resultado diferente substitui o anterior; repetição idêntica não prolonga o prazo. Prazo máximo de cinco segundos, X e clique externo, animação curta e sem capturar foco. role/status/alert, aria-live e movimento reduzido. Confirmação usa diálogo persistente com foco, Tab/Escape e restauração; não usa temporizador. GETs iniciais, paginação automática, foco, Auth observer e retry silencioso não geram toast. Erros de carregamento continuam inline; colisão de conta, bloqueio comercial e salvamento parcial em etapas permanecem avisos persistentes necessários. Nenhuma biblioteca extra: projeto usa CSS próprio, não Tailwind.

## Validação e limites

Suíte integrada React: 217/217 aprovados em 21 arquivos. Regressões finais do fechamento por click/submissão e acesso negado verificadas separadamente. Build homologacao no checkout de publicação com as dez configurações públicas existentes. Emulators exclusivos com usuários/dados sintéticos: perfil72SDK/27Chrome, catálogo administrativo59SDK/19Chrome, pedidos administrativos152SDK/21Chrome e gestão84SDK/20Chrome aprovados; recibo NOTIFICACOES_EMULATOR_EVIDENCIAS.json. Nenhuma criação real de conta/pedido pelos testes automatizados, mudança de Rules/índices/IAM ou acesso administrativo concedido por teste. Login Google real confirmado pelo proprietário.

Falhas corrigidas: assinatura do provider movida para layout effect para receber feedback dos filhos; aviso de colisão/salvamento parcial preservado sem truncar instruções; sucesso anterior removido ao iniciar nova submissão para impedir resultado antigo durante escrita; clique externo também funciona com ativação por teclado. Expectativas dos testes foram adaptadas aos diálogos persistentes sem reduzir suas verificações de dados/segurança. Erros esperados de Rules em casos negativos não são falhas do produto. Histórico de tentativas fica privado e as evidências finais são sanitizadas.

## Comandos e pré-requisitos

- `npm test --prefix frontend -- --maxWorkers=1`: suíte completa no checkout Git de publicação;217 aprovados. Depois da correção final de click/submit e texto de acesso negado, `npm test --prefix frontend -- --maxWorkers=1 notificacoes.test.jsx admin.test.jsx`:34 aprovados.
- `firebase emulators:exec --project demo-catalogos-sdk --only auth,firestore`: integrações sequenciais perfil/admin-catalogo/admin-pedidos/admin-gestao pelo `quality/frontend/scripts/integracao-final.cjs`, com CATALOGOS_EMULATOR_EXCLUSIVO=1, Java21 e Emulators locais. Primeiro ensaio revelou expectativas de resultado antigo; correções e reexecução só das três suítes administrativas afetadas. A tentativa sem permissão de loopback falhou antes de iniciar; reexecução com loopback permitido, sem alteração de segurança do Firebase real.
- Build: `node --env-file=../../homologacao-real-011/firebase-public.env node_modules/vite/bin/vite.js build --mode homologacao --outDir ../../notificacoes-final-build` no frontend do checkout main. Configuração pública local já existente, não enviada ao Git;23,32s, sem erro. Avisos conhecidos de chunk grande/dynamic import preservados, sem refatoração fora de escopo.
- `node quality/docs/documentacao.cjs --write` e `--check`: inventário/índice integrais na cópiaJS; conferência específica no checkout de release.
- Após publicar: `CATALOGOS_NOTIFICACOES=AUTORIZADA node quality/frontend/scripts/validar-notificacoes-pages.cjs`, Chrome com contas sintéticas existentes em arquivo local privado, zero novos pedidos/cadastros.

## Arquivos e funções

- `frontend/src/App.jsx`: Provider global de feedback em todas as rotas.
- `frontend/src/components/admin/AdminGate.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/components/admin/AdminState.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/components/ui/PageLoader.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/contexts/LojaContext.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/hooks/useAdmin.js`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/hooks/useRecurso.js`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Cadastro.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Checkout.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/DadosPessoais.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Enderecos.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Login.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/PedidoDetalhes.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Pedidos.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Perfil.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/Produto.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/Categorias.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/Clientes.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/Configuracoes.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/Dashboard.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/PedidoDetalhes.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/ProdutoForm.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/pages/admin/Produtos.jsx`: Integra feedback de ações explícitas e conserva o contrato/carregamento/sessão existente.
- `frontend/src/lib/notificacoes.js`: Eventos explícitos, texto seguro, transporte de resultado na navegação e atualização manual.
- `frontend/src/components/ui/ToastProvider.jsx`: Toast único, deduplicação, expiração, confirmação acessível e limpeza de listeners.
- `frontend/src/components/ui/ToastProvider.css`: Posição responsiva, cores, ícones, animação e movimento reduzido.
- `frontend/src/components/ui/BotaoGoogle.jsx`: Mesmo login Google compartilhado por login e cadastro, com bloqueio de requisição duplicada.
- `quality/frontend/test/notificacoes.test.jsx`: Regressões de duração, substituição, eventos, confirmação, privacidade e limpeza.
- `quality/frontend/test/conta.test.jsx`: Google no cadastro e recuperação com resultado real e bloqueio de envio duplicado.
- `quality/frontend/test/admin.test.jsx`: Escrita administrativa assíncrona e confirmação antes de mutação.
- `frontend/package.json`: comando de validação online das notificações.
- `quality/firebase/oauth-google-readonly.cjs`: diagnóstico restrito de projeto/domínio/provedor.
- `quality/firebase/autorizar-dominio-google.cjs`: alteração específica já aprovada com backup/comparação e gate explícito.
- `quality/frontend/scripts/validar-notificacoes-pages.cjs`: testes online com contas sintéticas preexistentes, bloqueando novas contas/escritas e sem envio de pedido.
- `quality/frontend/scripts/perfil-browser.js` e `admin-catalogo-browser.js`: testes locais existentes atualizados para confirmar os novos diálogos; preservados na cópia de origem.
- Documentos oficiais de posição/diário/plano/risco/continuidade e índice: registro e próxima ação; histórico preservado.

## Limpeza e tempo

Três builds intermediários exclusivos desta tarefa removidos após inventário de hashes e ausência de uso em runtime/Git/CI. Build final, fontes, testes, release anterior/rollback e logs/evidências privados preservados. Hashes dos 34 arquivos fonte e onze saídas finais conferidos após limpeza; nenhuma limpeza pendente. Scanner seletivo do stage sem segredos (fixture contém somente cabeçalho sintético de chave, sem chave); nenhum ambiente/backup privado enviado. Recibo NOTIFICACOES_LIMPEZA_EVIDENCIAS.json.

Execução técnica estimada até esta validação:35–45min incluindo comandos automatizados, sem cronômetro integral. Espera de confirmação Google separada, sem duração inferida. Falhas e retestes registrados; nenhuma etapa declarada concluída apenas por tempo. Tempos por suíte/build constam nos recibos; não somar tentativas repetidas como novos testes aprovados.

## Publicação e encerramento

Validações locais concluídas; publicação autorizada em execução. Checkout de publicação é private-backups/publicacao-js-main; Git original sem histórico permanece preservado. Push normal, sem force, configurações Pages preservadas. Validar deployment canônico e navegação real depois do build remoto; publicação não substitui aceite comercial. B-03/B-04/fotos e demais ressalvas anteriores permanecem. Espelho externo /home/lucas/Documentos/lojaDemoRestaurante ausente, não recriado. Próxima ação após a publicação: usar/revisar a demo; nenhum novo MVP ou ato protegido iniciado automaticamente.
