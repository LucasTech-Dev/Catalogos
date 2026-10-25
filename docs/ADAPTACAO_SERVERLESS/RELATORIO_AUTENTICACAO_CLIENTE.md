# Publicado e verificado — 25/10/2026

**https://catalogo-demo-cz1.pages.dev/** atualizado com o commit `2fe8644e054be7c68ae03f676579e2436db8fc59` de LucasTech-Dev/Catalogos/main. Deployment de produção `a17d18e3-580d-4aa2-a784-0e4e7bf7da97`, success às15:03:13 America/Sao_Paulo. Push normal preservou dbecfcf e o histórico; build Git da mesma main acionado no Pages existente após ausência de disparo automático. Nenhuma configuração de projeto alterada. [Recibo de publicação](AUTENTICACAO_PUBLICACAO_EVIDENCIAS.json).

195/195 testes em20 arquivos no checkout de publicação; build homologado com configuração pública existente; perfil72SDK/27Chrome, Google no Auth Emulator, pedidos/admin e isolamento aprovados. **35 verificações na URL pública aprovadas**, incluindo loader, login, cadastro sem submit, controles de senha, desktop/mobile390px sem overflow, Minha conta, persistência, logout, endereços, histórico/detalhe e recusa ao pedido de outro cliente. Zero usuários/pedidos/sessões anônimas novos e zero tentativas de escrita Firestore. Viewport mobile no Chrome não representa dispositivo físico. [Evidência online](AUTENTICACAO_ONLINE_EVIDENCIAS.json), [local](AUTENTICACAO_LOCAL_EVIDENCIAS.json).

Bundle servido contém os recursos Google e mostrar/ocultar senha, entrada `/assets/index-BbOZIrkR.js`, App-B_28SBB9.js. Metadados de commit/deployment e os recursos novos confirmam a atualização. Não se alega igualdade byte a byte com todo o build local: os nomes/hashes de App diferem entre Vite local e Pages, como já ocorria na release anterior; não se alteraram dependências para forçar igualdade. [Recibo HTTP dos recursos](AUTENTICACAO_ASSETS_ONLINE_EVIDENCIAS.json).

A — Codex: implementação, testes, limpeza verificada de builds intermediários, scanner seletivo, commit/push/deploy e35 checks concluídos. Documentação final enviada separadamente com marcador CF-Pages-Skip; sem novo runtime. Build final/credenciais locais/evidências necessárias preservados, sem limpeza pendente. Tempo técnico estimado35–45min, sem cronômetro integral; intervalo de interrupção/retomada excluído, sem espera manual solicitada. Build Pages25s e deployment42s aproximados estão no período automatizado; não somar os5812s da rodada interrompida de admin como trabalho técnico contínuo.

B — Proprietário: **AUTH-H1 pendente somente para login/consentimento Google pessoal em produção**. Abrir /login, usar Continuar com Google, concluir seleção/consentimento e conferir Minha conta/logout; responder sucesso ou erro sanitizado/rota/dispositivo/horário, sem segredos. Estimativa2–5min. Prova Google no Emulator não substitui essa confirmação. Nenhuma conta administrativa criada/reativada nem pedido real novo autorizado por associação. Fotos/limites comerciais anteriores continuam no registro oficial; não há aceite comercial integral presumido. Próxima ação exata: essa confirmação pessoal, sem repetir gates concluídos.

---

# Autenticação e área do cliente — 25/10/2026

Pedido do proprietário: complementar a autenticação existente e, quando validada, enviar diretamente a LucasTech-Dev/Catalogos/main para atualizar https://catalogo-demo-cz1.pages.dev/. A autorização expressa da mensagem atual supera a restrição de publicação automática do anexo somente para esta entrega. Não autoriza mudanças em Rules, índices, IAM, configuração Auth, documentos comerciais, criação de usuários/pedidos reais ou atribuição administrativa.

## A — EXECUÇÃO PELO CODEX

AUTH-01: integração React/Vite/ES6 com Firebase Web SDK existente, sem nova dependência ou reconstrução de perfil/endereços/pedidos. Google usa signInWithPopup e linkWithPopup, mantendo o authDomain existente e evitando introduzir a infraestrutura adicional de redirecionamento entre domínios; sucesso de vinculação preserva UID anônimo. Erros de janela bloqueada/cancelada, domínio e método diferente recebem mensagens amigáveis. Nenhum documento de autoridade é criado ou alterado. Referências oficiais consultadas: [Google no Firebase](https://firebase.google.com/docs/auth/web/google-signin) e [vinculação de provedores](https://firebase.google.com/docs/auth/web/account-linking).

Conta Google já existente não provoca merge de UIDs: falha da vinculação mantém o convidado conectado. A tela oferece cadastro com outro e-mail para preservar o acesso ao histórico antes de sair, ou troca explícita para a conta existente após aviso de que o histórico não será transferido e poderá ficar inacessível. Não há migração automática por e-mail nem cópia de pedidos. Login por senha também exige essa escolha quando existe sessão anônima. No painel administrativo o formulário avisa previamente sobre a troca de identidade; o acesso continua dependendo da autoridade Firestore existente.

Cabeçalho desktop/mobile acompanha onIdTokenChanged: aguarda Auth e apresenta Entrar ou Minha conta com a rota correta. Persistência existente do SDK preservada. Perfil mostra nome, e-mail e telefone disponível; logout trata falha e cliques duplicados. Endereços mantêm CRUD e seleção no checkout existentes e recebem confirmação de sucesso. Histórico/detalhes continuam usando titularidade e queries existentes, sem alterar contrato de pedidos.

Todos os campos de senha recebem olho acessível, oculto inicialmente, sem submeter o formulário e sem persistir a senha. Inclui cadastro/confirmação, dados pessoais e painel administrativo. Contas exclusivamente Google recebem orientação de gerenciar senha no Google; a troca local aparece somente para provider password.

Telefone passa a ser opcional no cadastro: nome é salvo no displayName do Auth. Se houver telefone válido, salva o perfil comercial pelo serviço existente. Sem telefone, não se tenta criar documento inválido: as Rules atuais exigem telefone no perfil completo. Ao salvar Meus dados ou finalizar compra, as validações comerciais existentes continuam aplicáveis. Novo usuário Google usa nome/e-mail do Auth como fallback sem criação de permissões ou perfil incompleto. Cadastro numa sessão já autenticada orienta acessar Minha conta ou sair; não modifica outra conta silenciosamente.

## Arquivos e funções

| Arquivo/grupo | Função |
| --- | --- |
| frontend/src/components/ui/CampoSenha.jsx — novo | Olho acessível e preservação do valor digitado. |
| frontend/src/hooks/useSessao.js — novo | Estado inicial pendente e assinatura da sessão Firebase. |
| frontend/src/services/conta.js | Google, vinculação, colisões, mensagens e cadastro com telefone opcional. |
| frontend/src/services/perfil.js | Fallback displayName e informação dos provedores da própria sessão. |
| frontend/src/components/layout/Header.jsx | Ação Minha conta/Entrar no desktop e mobile. |
| frontend/src/components/admin/AdminGate.jsx | Mesmo gate Firestore, olho e aviso explícito de troca de sessão. |
| frontend/src/pages/Login.jsx, Cadastro.jsx, DadosPessoais.jsx | Login Google, escolha em colisão, olhos, validações e segurança conforme provedor. |
| frontend/src/pages/Perfil.jsx, Enderecos.jsx | Identificação, logout com erro e confirmações de endereço. |
| frontend/src/styles.css | Estilos responsivos dos controles e aviso de conflito. |
| frontend/package.json | Comandos reproduzíveis de autenticação local/online. |
| quality/frontend/test/conta.test.jsx — novo | Regressões de serviço/UI/sessão/cabeçalho/olhos/conflitos. |
| quality/frontend/scripts/auth-emulator-integration.js | SDK real no Auth Emulator: vinculação Google, login e colisão mantendo UID. |
| quality/frontend/scripts/validar-autenticacao-pages.cjs — novo | Roteiro online sem cadastro, pedido ou escrita Firestore. |
| quality/frontend/scripts/{perfil,admin-pedidos,admin-catalogo,admin-gestao}-browser.js e homologacao-real-011.mjs | Ensaios locais existentes: selecionam botão submit após introdução do olho; perfil testa consentimento e cadastro sem telefone. Fontes e comandos locais preservados. |
| Guia Mestre, plano único, diário, Registro, Continuidade, riscos, índice/inventário e este relatório | Estado, evidências e próxima ação; sem novo plano/MVP. |

## Validação e limites

Suítes completas da cópiaJS e do checkout de publicação: ambas195/195 testes em20 arquivos. Perfil:72 checks SDK/Rules e27 no Chrome local, incluindo cadastro sem telefone, dados, endereços/seleção no checkout, senha, consentimento, persistência e logout. Build final do checkout de publicação aprovado com as dez variáveis públicas homologadas (bancorestaurante/loja-demo/full conferidos com Pages); dependências/lockfile preservados. A rodada anterior comprovou pedidos (70 negativas/leituras, cinco provas de limite e 23 checks de navegador) e administração (152 checks SDK e 21 navegador). Nova vinculação Google/novo login/colisão passou no Auth Emulator. A primeira rodada de perfil identificou também que o fallback precisava preservar a ausência de nome quando o Auth não fornece displayName; serviço corrigido e72+27 checks reexecutados com sucesso. Roteiro passou a exigir consentimento explícito antes do login de convidado; o teste permanece executável. Um ensaio de fixtures excedeu 5s durante concorrência de testes/builds e foi repetido sem alterar seu timeout. Nenhum erro é tratado como aprovação.

Teste local de Google não comprova login pessoal Google no domínio de produção. Login e consentimento de uma conta Google real permanecem confirmação humana; não se criam contas reais de teste nesta entrega. Admin positivo real não é reativado: a conta sintética anterior continua desativada. Negativas são verificadas localmente/online conforme ambiente.

## Git, limpeza, reversão e estado

CópiaJS original continua sem commits/rastreados e é preservada. Publicação usa o checkout com histórico private-backups/publicacao-js-main, base dbecfcfee8995ce7d9197ca9878aaf407c80dfe7, push normal sem force e envio seletivo. Nada de git add geral da cópia original. Não copiar credenciais, rodada privada, dependências, builds, backend ou arquivos históricos por associação. Novas regressões de conta e Auth Emulator acompanham a release; bibliotecas locais de ensaio não publicadas anteriormente permanecem na árvore quality original com seus comandos completos.

Cópias intermediárias próprias de bibliotecas de ensaio e documentação integral no checkout de release foram removidas após comparar byte a byte com as fontes originais e confirmar ausência no histórico Git remoto; nenhum original removido. A release conserva seus próprios documentos/histórico, recebe somente as entradas desta tarefa, relatório/evidências e conferência pertinente; índice/inventário/plano/diário integrais continuam atualizados na cópiaJS. Logs privados/artefatos atuais necessários permanecem ignorados. Sem limpeza de histórico/dados ou resíduos exclusivos aguardando aprovação. Espelho externo /home/lucas/Documentos/lojaDemoRestaurante ausente, não recriado. Matriz de migração, posição dos nove MVPs e ressalvas comerciais anteriores sem mudança. Reversão de frontend pelo commit/deployment anterior; nenhuma reversão Firebase necessária.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

AUTH-H1: após publicação, entrar em /login com Continuar com Google, concluir seleção/consentimento pessoal e conferir Minha conta, dados e logout. Plataforma: site oficial e janela Google; motivo manual: identidade/consentimento, sem envio de senha ou código ao chat. Valores públicos: URL oficial acima, bancorestaurante/loja-demo. Tempo estimado: 2–5min. Confirmar somente sucesso/erro sanitizado, rota, dispositivo e horário. Essa confirmação não concede permissão administrativa, não migra pedidos e não autoriza criar pedidos reais. Criação/vínculo de conta administrativa e novo pedido integrado pertencem à sequência futura indicada pelo proprietário e não são executados nesta entrega.

Publicação e resultado online serão registrados ao terminar a validação. Tempo técnico e espera/interrupção serão separados no fechamento; o intervalo de interrupção não conta como execução técnica. Estado: fechamento local, publicação ainda não comprovada.
