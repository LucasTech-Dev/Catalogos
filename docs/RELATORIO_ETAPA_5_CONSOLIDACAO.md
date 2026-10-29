> Ordem vigente: usuário autorizou enviar apenas pre-main e proibiu qualquer alteração em main. A preparação de publicação abaixo é histórico; E5-H1 não atendida.

# Etapa 5 — Consolidação e publicação da matriz comercial

Estado: ****consolidação local validada; commits locais preparados, aguardando confirmação final E5-H1****. Ordem do proprietário no anexo “ETAPA5 — CONSOLIDAÇÃO E PUBLICAÇÃO DA MATRIZ COMERCIAL”, de28/10/2026 America/Sao_Paulo. Não acrescenta funcionalidades. Continua o [plano mestre](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md), preservando as quatro etapas e a Demo. Datas dos recibos podem indicar29/10UTC.

## A — EXECUÇÃO PELO CODEX

### Integração e preservação

A raiz local é uma branch `adaptacao-js-serverless` sem commits/remoto e com fontes não rastreadas; não foi inicializada uma nova história nem alterada essa condição. Checkout de integração `.tools-local/etapa5-release` clonado da main oficial LucasTech-Dev/Catalogos, base `ff42ee55dd7fff0c4d26ea3826acbfc8596f424b`. Consulta pelo GitHub e clone concordaram; não havia commit remoto posterior à base do planejamento. Preservar esse checkout local para o push final aprovado.

Integrados módulos visuais/identidade, serviços contextuais por loja, identificador compartilhado, Auth reutilizável/travas, carrinho/observações/checkout e proteção de tentativas por loja/UID. Código remoto recente do resumo de checkout, observações editáveis e indisponibilidade preservado, incluindo proteção do editor durante envio. Não houve reconstrução de páginas, mudança de contrato de pedido, dados comerciais ou tecnologia.

Backend histórico e diretórios antigos da main permanecem intactos; não são hospedados. Fontes locais históricas não foram usadas para sobrescrever backend remoto. Fixtures de contratos da main preservadas, incluindo imports nos testes adminGestao/adminPedidos e adaptação só do caminho de fixture no teste de vitrine. Dependências e binários existentes são usados por links locais ignorados, sem copiá-los para Git. Sem exclusão de arquivos históricos/backup.

Índices de repositório passam a refletir os oito já validados localmente e mapeados pelo manifesto, sem executar publicação. `firebase.json`, `.firebaserc` e `firebase/firestore.rules` da main são preservados. A candidata local de Rules continua no repositório e ainda difere do publicado; esta ordem não permite ativá-la. Scripts de teste carregam Rules apenas em Emulators.

### Alvo Cloudflare conferido por GET

Projeto `catalogo-demo`; origem `LucasTech-Dev/Catalogos`, branchmain, deploy automático habilitado; rootfrontend, comando `npm run build -- --mode homologacao`, saídadist. Domínio oficial `https://catalogo-demo-cz1.pages.dev`. Deployment canônico anterior `7de3009f-2f14-4e19-bd80-4498c46f13bc`, SHAff42ee5, success, conferido antes da preparação.

**Incompatibilidade identificada:** ambiente Cloudflare ainda não contém `VITE_LOJAS_POR_HOST`. O novo runtime exige esse mapa e recusa domínio desconhecido; publicar sem ele quebraria a inicialização. Alteração pública preparada, ainda não aplicada:

```json
{"VITE_LOJAS_POR_HOST":"{\"catalogo-demo-cz1.pages.dev\":\"loja-demo\"}"}
```

Preservar integralmente todas as demais variáveis remotas. B-03 continua false por padrão; build local final usa false explicitamente. Não publicar como APP_ENVproduction sobre bancorestaurante: a Demo mantém APP_ENVhomologacao e build de distribuição Vite homologacao, com o projeto explicitamente autorizado. O build de distribuição é o mesmo processo de produção Vite, com o modo correspondente ao alvo. Configuração pública Web existente foi lida sem imprimir valores de API/app no relatório, copiada só em arquivo temporário protegido para validar o build, e será removida após uso. Nenhum segredo de conta de serviço/credencialAdmin é necessário.

A adição do mapa público deve integrar a confirmação final de publicação; não é alteração em Firebase/IAM/Auth/Rules/índices. Não executar PATCH ou push antes dessa confirmação. Depois da aplicação autorizada, conferir por GET antes do push, acompanhar deployment e comparar SHA/URL. Se houver divergência, suspender o ato afetado.

### Tarefas e comandos

| ID | Objetivo / arquivos | Dependência / resultado |
| --- | --- | --- |
| E5-A1 | Checkout isolado, comparação main, integração frontend e ferramentas das etapas1–4 | Baseff42ee5 confirmada, sem exclusões/forçar história |
| E5-A2 | Testes React no checkout integrado e fixtures remotas preservadas | 379/379 em35arquivos,320,25s, executados no checkout consolidado |
| E5-A3 | Homologação SDK/Rules/Chrome, seed/recuperação e B04 nos Emulators | 168SDK+32Chrome/89,140s;99SDK Rules publicadas/23,706s;110seed/24,225s;91B04;16layouts novos |
| E5-A4 | Build com configuração pública exata da Demo mais mapa preparado, scanner e links | Build Vite37,15s,39,187s com verificação; scanner aprovado; mapa remoto não alterado |
| E5-A5 | Commits organizados de código, testes/provisionamento e documentação | Códigoec916e0 e testes9a05d46 preparados; documentação na sequência; sem push |
| E5-A6 | Push/main e deployment/verificação pública | Aguardando confirmação final exigida pelo anexo |

Comandos: `node quality/run.cjs frontend-test --maxWorkers=1 --testTimeout=15000`; `node quality/firebase/executar-provisionamento.cjs --homologacao`, `--seed-etapa4`, `--b04-etapa4`; visual de duas lojas com4larguras; build `vite build --mode homologacao`, configuração validada por `configuracaoAplicacao`; scanner de segredos, sintaxe, `git diff --check`, documento de release e inventário integral local. Escritas somente nos Emulators/projetos demo-. O comando de republicação não será executado neste fechamento preparatório.

### Arquivos e limites

Código: frontend/src e fallback visual, .env.example; package.json mantém comandos remotos e acrescenta aliases das etapas. Testes: quality/frontend/test e config, provisionamento, scripts de homologação/visual/horários e runner. Dados de teste: quality/fixtures/provisionamento, sintéticos. Definições: firebase/firestore.indexes.json somente versionamento. Documentação: plano mestre, relatório5, guia de implantação/checklist, relatórios3/4, provisionamento, manual de personalização, riscos, registros correntes e provas. Resultados finais e SHAs abaixo; versão publicada/deployment novo ainda não existem.

B-03 remoto depende de publicação/verificação específica de Rules, não autorizada; flag permanecefalse. B-04 salva por etapas e informa falha parcial, sem atomicidade semanal. Emulator não comprova índices READY em produção. Seed/backup não têm modo produção; primeiro cliente ainda exige preparação específica de bootstrap real e decisão Firebase/domínio/UID. Auth continua por projeto e admin com uma loja por UID. Metadados sem JS, OAuth pessoal/mobile e aceite comercial seguem seus gates, sem baixa automática por publicação.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

**E5-H1 — confirmação final pendente**, exigida expressamente na seção5 do anexo: “Antes do push que atualizará a main e acionará a publicação, apresentar o resumo das alterações e solicitar minha confirmação final.” Depois de preparar/testar os commits, o executor apresentará SHAs e resumo, incluindo o mapa público exato acima. Não há tarefa técnica para transferir ao proprietário; a confirmação libera somente os atos aprovados. Login/2FA/segredos serão manuais apenas se necessários; não solicitados agora. Espera por essa aprovação e homologação pessoal são separadas do tempo técnico. Tempos de comandos serão registrados; não inventar medição integral de esforço sem cronômetro.

Até confirmação: **a versão permanece local**, sem push, deploy ou mudança de configuração remota. Homologação pública da nova matriz e SHA oficial publicado ficam pendentes. Depois do aceite final, executar somente publicação/GETs públicos/navegação sem identidade pessoal ou gravação; compras/contas/mutações administrativas reais não estão autorizadas. Não iniciar loja comercial.


### Resultados intermediários e correções do ensaio

Regressão React completa:379/379,35arquivos,320,25s; avisos esperados jsdom de navegação não implementada. Build de distribuição homologacao aprovado em37,15s,39,187s incluindo validação da configuração; aviso já conhecido de chunk>500kB. Scanner do checkout integrado sem achados. Leitura nova das Rules gerou somente fixture genérica local e hashes: publicado71ca8548/candidata80d4a14c, diferença restrita ao predicado de desativação de categorias.

**Compatibilidade publicada ensaiada novamente:**99checks dos serviços novos contra a fonte exata das Rules efetivamente publicadas, carregada somente no Emulator, em23,706s. B-03 foi recusado como esperado, sem contorno; demais fluxos de Auth, catálogo, perfil/endereço, compra/numeração/concorrência, financeiro manual e isolamento aprovados. Nenhuma Rule, índice ou dado real alterado.

Primeiro ensaio Chrome integrado interrompido por corrida do teste: ele aguardava e-mail autenticado, mas navegava antes do redirect final para /perfil. Corrigida somente a sincronização do ensaio, aguardando rotafinal, sem modificar produto/fluxoAuth. Reexecução registrada separadamente. Um comando de sincronização local iniciou no diretório do checkout e encontrou caminho relativo duplicado; a cópia raíz foi corrigida em seguida, sem perda ou alteração remota.


### Preparação da verificação após publicação

`quality/frontend/scripts/etapa5-publico.cjs` preparado e validado por sintaxe, **ainda não executado**. Exige confirmação de publicação/SHA e conserva recibo próprio sem sobrescrever histórico. Bloqueia endpoints Auth/FirestoreWrite/commit/WhatsApp antes da navegação, verifica Home/cardápio/imagens/quatro larguras, produto/carrinho/observação apenas local, formulário de login e gates administrativos. Checkout/área privada online são verificação de carregamento/proteção com Auth bloqueado; operações completas/administrativas permanecem homologadas no Emulator. Não criar conta/pedido real para preencher critério. Conferência de SHA/deployment é via GET do Cloudflare, separada da navegação.

Mapa público revisável: [patch preparado, não aplicado](ADAPTACAO_SERVERLESS/ETAPA5_MAPA_PAGES_PREPARADO.json). Preservar demais variáveis/configurações e verificar alvo/tipos no momento autorizado. Rollback futuro: restaurar release/frontend anterior pelo mecanismo Pages autorizado, sem apagar pedidos, reduzir contador ou restaurar dados; mapa público pode permanecer compatível com o código anterior. Nenhum rollback ou mutação executado.


## Fechamento da preparação local — aguardando E5-H1

Todos os gates locais previstos nesta preparação passaram. Contagens **novas**:379React/35arquivos em320,25s;168SDK+32Chrome integrados em89,140s;99SDK contra Rules publicadas em23,706s;110checks seed/backup/restauração em24,225s;91B04;16layouts de duas marcas/quatro larguras. Esses grupos verificam cenários diferentes e não são apresentados como uma única contagem de testes únicos. Build de distribuição37,15s (39,187s incluindo validação), scanner, sintaxe e documentação aprovados. [Recibo consolidado local](ADAPTACAO_SERVERLESS/ETAPA5_VALIDACAO_LOCAL.json), [homologação](ADAPTACAO_SERVERLESS/ETAPA5_HOMOLOGACAO_EMULATOR.json), [Rules publicadas no Emulator](ADAPTACAO_SERVERLESS/ETAPA5_RULES_PUBLICADAS_EMULATOR.json), [provisionamento](ADAPTACAO_SERVERLESS/ETAPA5_PROVISIONAMENTO_EMULATOR.json), [B04](ADAPTACAO_SERVERLESS/ETAPA5_B04_EMULATOR.json) e [visual](ADAPTACAO_SERVERLESS/ETAPA5_VISUAL.json). Provas1–4 foram restauradas/conferidas byte a byte no checkout, sem sobrescrever histórico com execuções novas.

Commits locais no checkout isolado:

| Commit | Escopo |
| --- | --- |
| `ec916e0` |33arquivos: identidade/cores/logo e serviços/Auth/carrinho/checkout por loja, preservando componentes e controles existentes |
| `9a05d46` |34arquivos: provisionamento/dry-run, backup, testes/fixtures, regressão de Rules publicadas, aliases e oito índices somente versionados |
| Documentação | Plano, relatórios/evidências/guias/checklist e estado E5-H1; HEAD final identificável por git log e na solicitação de confirmação |

**Versão candidata de código:ec916e0; pacote com testes:9a05d46. Nenhuma versão comercial nova está publicada ainda.** O SHA completo final será confrontado com main/Cloudflare depois da autorização; não atribuir o deployment anteriorff42ee5 à matriz nova.

Limpeza: somente temporários próprios Etapa5 de comparação/configuração pública protegida/build-runner/logs locais em /tmp, após resumo nos recibos. Build /tmp/catalogo-etapa5-validado, checkout com commits, fontes/testes/fixtures/evidências/histórico/backups e dependências úteis preservados. Nenhuma pasta histórica ou conteúdo exclusivo removido. Scanner/diff/sintaxe/docs reconferidos após limpeza. Git raiz continua intacto/não rastreado; Git do checkout contém commits locais e deve ficar limpo. Espelho externo ausente, não recriado. Tempo técnico integral não cronometrado desde o primeiro comando; tempos de comandos medidos acima, espera humana0 até a solicitação E5-H1; espera futura é registrada separadamente.

Próxima ação exata: confirmação final do proprietário para adicionar exclusivamente o mapa público preparado no ambiente production do Pages catalogo-demo, preservando demais variáveis, e enviar os commits revisados à main sem force. Em seguida conferir deployment success/SHA/domínio e executar a verificação pública bloqueando escritas/Auth. Não executar outra implantação, conta/pedido real, Rules/índices/IAM/Auth ou mudanças comerciais. Etapa5 permanece **aguardando publicação e homologação online**, não totalmente concluída.


## Merge isolado em pre-main

Main remota reconfirmadaff42ee5 e mantida intacta. Branchpre-main criada dessa main; merge --no-ff de consolidacao/matriz-comercial-etapa5 produziu00af404285e236871f86bd4ed46dd300c3a631a9, com paisff42ee5 e801c4d4. Sem conflitos e com árvore exatamente igual à versão validada. Nenhum código precisou ser alterado. Git tracking configurado exclusivamente para origin/pre-main no push.

Cloudflare GET confirmou previewsnone e produção exclusivamente emmain; não mudar configurações nem publicar. Testes focados novos e revisão de scanner/docs/diff complementam as provas anteriores, sem relabelar379testes como nova execução. Não foi necessário novo build/suíte ampla porque o merge preservou a árvore validada. Somente registros desta ordem foram acrescentados depois do merge. Recibo ETAPA5_PRE_MAIN_MERGE.json identifica base, pais, árvore e validação. Main local e remota devem ser conferidas novamente após o push específico a pre-main.

Sem temporários relevantes/limpeza importante pendente: log próprio resumido no recibo e removido, fontes/evidências/checkouts/backups/dependências preservados. Inventário integral da cópia original não foi reescrito por esta operação exclusiva de branch; checker pertinente à release e índice foram conferidos na pre-main. Espelho externo ausente continua sem alteração. Tempo dos testes é medido; não há cronometragem integral desta operação curta. Próxima ação é revisão/testes de pre-main, nunca merge automático em main.
