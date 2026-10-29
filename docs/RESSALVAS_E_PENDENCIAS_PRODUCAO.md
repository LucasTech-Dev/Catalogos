# Etapa5 — gates de publicação da matriz

REP-PUB1: commits locais autorizados, push/main/Pages aguardam confirmação final E5-H1 do anexo atual. REP-PUB2: Cloudflare não possui VITE_LOJAS_POR_HOST; adicionar somente o mapa público explícito do domínio oficial após confirmação e antes do push. Build candidato validado com esse mapa; sem ele a nova versão recusará inicialização. Não contornar com fallback. REP-PUB3: publicação frontend não autoriza Rules B03/índices/Auth/IAM/dados reais. Matriz publicada e homologação comercial de cliente continuam estados distintos. [Relatório5](RELATORIO_ETAPA_5_CONSOLIDACAO.md). Riscos anteriores abaixo preservados.

---

# Replicação — gates após homologação local da Etapa4

REP-HOM1: quatro etapas técnicas locais concluídas; isso não libera cliente real. REP-HOM2: leitura GET atual confirmou Rules publicadas71ca8548, candidata80d4a14c; B-03 remoto/flagfalse aguarda ato específico de publicação/verificação. B-04 validado por etapas/falha/retomada, sem promessa de atomicidade semanal. REP-HOM3: índices locais mapeados/testados em Emulator, existência/READY/consultas no projeto real ainda não homologadas. REP-HOM4: seed e backup são Emulator-only; primeiro bootstrap/restauração comercial requer operação revisada por alvo, inventário/backup e autorização, sem remover guardas. Backup tipado local limita restauração atômica a450docs, não exporta Auth, exige quiescência e não migra referências. REP-HOM5: decidir projeto dedicado/compartilhado, contas/custos/domínio/UID, Auth/OAuth/Google pessoal, publicação/release e pedido real completo antes da entrega. REP-JS2/JS3, metadados dinâmicos/aceite físico e demais riscos abaixo preservados; datas e estados anteriores são históricos. [Relatório4](RELATORIO_ETAPA_4_HOMOLOGACAO.md) e [guia](GUIA_IMPLANTACAO_NOVA_LOJA.md). Nenhuma implantação iniciada.

---

# Serviços multiloja — posição28/10/2026

REP-JS1: Etapa3 concluída tecnicamente local, sem publicação.375testes/99checks de serviços/106de provisionamento e build não homologam Rules/índices/Auth/OAuth realmente publicados nem o aceite comercial. Etapa4 aguarda autorização. REP-JS2: nova release exige `VITE_LOJAS_POR_HOST` para homologação/produção e domínios não locais; desenvolvimento local exige loja explícita. Conferir hosts canônicos/preview antes de entregar; não contornar a recusa com fallback para a Demo. REP-JS3: Auth é compartilhado dentro de cada projeto; clientes podem ter perfis próprios separados por loja, e o vínculo administrativo atual continua com um lojaId por UID. Escolher projeto dedicado versus compartilhado antes de provisionar cliente real. Cache de tentativa codifica loja/UID; chaves legadas ambíguas não são migradas por atribuição automática. B-03 local candidata permite desativação testada, mas flag/publicação real permanecem pendentes; exclusão física bloqueada. B-04 continua gravação por etapas. Riscos anteriores, metadados dinâmicos e aceite físico/comercial não encerrados por conveniência.

---

# Provisionamento comercial — ressalvas de28/10/2026

REP-BD1: procedimento inicial implementado/testado somente no Emulator, com bloqueio de projeto real e destino externo. Não há autorização, ferramenta habilitada ou resultado de provisionamento de cliente real. Definir projeto dedicado versus compartilhado, contas/custos/domínio e UID antes de qualquer ato real. REP-BD2: `usuarios/{uid}.lojaId` tem uma loja por UID administrativo no modelo atual; seed não promove por e-mail nem reatribui vínculo existente. Clientes sem vínculo global podem ter seus próprios perfis separados em múltiplas lojas; isso não equivale a contas Auth segregadas por loja no mesmo projeto. REP-BD3: índices compostos publicados não são homologados pelo Emulator; verificar índices/Rules reais na Etapa4 com autorização. Falha/resposta perdida do seed deve ser recuperada pelo mesmo manifesto/dry-run, sem apagar loja ou reiniciar contador. Etapa1 local preservada; B-03/B-04/aceite físico/comercial/SEO dinâmico e demais riscos não baixados por conveniência. Nenhuma nova faseMVP/Etapa3/publicação iniciada.

---

# Adaptação comercial — 28/10/2026

REP-R1: parametrização frontend validada localmente; não comprova provisionamento, Auth/Rules de nova loja, publicação ou liberação comercial. Etapas2–4 não iniciadas. REP-R2: título/meta/favicon dinâmicos no navegador; robôs/previews sem JS podem receber HTML genérico. Preparar metadados estáticos por instância no gate de entrega. REP-R3: raiz Git continua não rastreada, preservada; matriz remota ff42ee5 consultada somente leitura e trechos incorporados seletivamente, sem sincronização/commit/push. Escolha de projeto Firebase e custos por cliente continua pendente antes de provisionar. B-03/B-04/aceite físico/comercial e riscos anteriores não foram encerrados por testes visuais.

---

# Ordem013 — correções publicadas e verificadas — 27/10/2026

A — EXECUÇÃO PELO CODEX: código e26cc56/main publicado; Pages catalogo-demo/3de58476 success às20:49:45 Brasília, mesma versão.315 testes frontend/30arquivos,357 backend histórico local,13 infra local,320SDK/Rules e249Chrome locais aprovados;17testes de contratos na main são subconjunto dos315. Build homologacao integrado28,04s.31checks públicos após deploy aprovados: catálogo320/390/768/1366px, carrinho local, formulário cadastro, nove rotas admin protegidas/Google. Zero conta/pedido/escrita Firebase real. Guardas síncronas, criação idempotente recuperável, erros persistentes, histórico administrativo, pedidos por cliente, sessão e CSS acessível publicados. Inventário18fontes/109declarações/12pastas; matriz9rotas/8larguras no Emulator. Log antigo e20temporários removidos só após cópia privada recuperável verificada; captura intermediária e dois links próprios removidos; fontes/backups/histórico preservados. Recibos ORDEM_013_*.json e RELATORIO_ORDEM_013.md. Fechamento documental posterior não altera runtime.

| ID | Estado atual | Evidência/limite |
| --- | --- | --- |
|013-C1–C4 | Concluídos no escopo autorizado | Código, inventários, testes SDK/Chrome/315UI/build, limpeza recuperável |
|013-C5 /013-H1 | Publicação executada/verificada | main e26cc56, Pages3de58476,31checks públicos; registro final em commit documental |
|013-H2 | Pendente, fora do ato atual | Rules B-03 para desativação reversível; botão/serviço bloqueados com padrãofalse |
|013-H3 | Julgamento pessoal pendente | OAuth pessoal, dispositivo físico e aceite comercial não automatizados |

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: nenhuma intervenção indispensável restante para encerrar esta publicação. Próxima ação exata: atualizar /admin na sessão pessoal e avaliar o painel; tratar Rules B-03 somente em autorização específica posterior. B-04 continua gravação explícita por etapas com erro recuperável, não atomicidade global. ComboClassic/Guaraná/fotos reais preservados, sem alteração comercial. Limpeza012 não foi repetida; três administradores/backups preservados e nenhuma compra de teste consumiu#1. Não houve Rules/Auth/IAM/índices reais ou nova fase dos noveMVPs. Sem limpeza importante pendente de aprovação; espelho externo ausente, não recriado. Publicação não equivale a homologação comercial integral.

---

# Ordem013 — revisão administrativa autorizada, em execução — 26/10/2026

A — EXECUÇÃO PELO CODEX: pedido anexado pelo proprietário inicia013 e autoriza correções frontend/serviços, testes, commit/push main e Pages após gates. Inventário inicial15fontes/101declarações de controles/12pastas. Corrigidos guardas síncronos, cancelamento durante gravação, erros recuperáveis, retomada de criação, atualização após troca de filtro, histórico administrativo e navegação dos pedidos do cliente; validação completa em andamento.59testes focados e357backend aprovados; infra13 após corrigir asserção histórica, sem mudar índices. Suíte frontend completa e três cenários SDK/Chrome em execução. Testes que escrevem somente no Emulator. Base limpa/contador0/administradores/backups da012 preservados; sem nova operação real de limpeza.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: nenhuma intervenção indispensável para código/testes/publicação autorizados. B-03 CONFIRMADO: Rules publicadas71ca8548 ainda recusam desativar categorias; candidata local80d4a14c permite. Não publicar Rules nesta ordem. UI exige VITE_CATEGORIAS_DESATIVACAO=true somente após autorização e verificação das Rules correspondentes; padrãofalse explica indisponibilidade. Exclusão física continua bloqueada. ComboClassic/Guaraná reais ativos mas indisponíveis, sem imagem, sem alteração comercial pelo executor. Próxima ação desta ordem: validar fluxos/layout, limpar apenas resíduos comprovados, documentar e publicar partes independentes. NoveMVPs/aceite geral e riscos preservados.

---

# Ordem012 ENCERRADA — limpeza verificada e publicada — 26/10/2026

A — EXECUÇÃO PELO CODEX: finalização real comprovada, zero pedidos/perfis/contasclientes,18anônimos restantes removidos, três administradores e38documentos comerciais/protegidos preservados; contador0/próximo#1. Backup original e adicional privados íntegros, modo700/600.170checksEmulator +3política aprovados; build homologacao8,69s e scanner398arquivos sem achados. Commit1fb9984/main publicado; Pages catalogo-demo/eba3d4c6 success às21:32:30 Brasília; dez checks públicos aprovados APÓS deploy, zero gravações/contas/pedidos reais de validação. Relatório e recibos ORDEM_012_FINALIZACAO_*.json publicados; fechamento documental em commit posterior sem mudança runtime. Main preserva histórico remoto e raiz local preservada. Temporários próprios removidos, Emulators/Chrome encerrados; nenhum resíduo importante pendente de aprovação. Inventário/índice atualizados; espelho externo ausente, não recriado.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:012-H1/H2 resolvidas pela confirmação expressa e execução. Nenhuma intervenção indispensável restante para encerrar esta limpeza/publicação. Login/cadastro/checkout comprovados no Emulator com identidades sintéticas; entrada pública/adminGoogle/cadastro conferidos online. Sessão Google pessoal e compra real não foram automatizadas nem declaradas homologadas. Próxima ação exata: usar a Demo normalmente; a primeira compra válida consumirá#1. Outros dois administradores mantidos até identificação/função verificada; sem exclusão por associação. Sem nova ordem/MVP/Rules/IAM; B-03/B-04/fotos e aceite comercial geral permanecem nos riscos oficiais. Histórico abaixo preservado.

---

# Ordem012 — limpeza e reinício da sequência concluídos — 26/10/2026

A — EXECUÇÃO PELO CODEX: confirmação posterior do proprietário atende012-H1/H2 e autoriza18 anônimos + reset + publicação. Novo inventário recuperável39documentos/21Auth; manifesto703aa295, bancoFirestore único, uma webApp, nenhum appAndroid/iOS/outra loja/referência aos18.170checksEmulator aprovados, incluindo restauração dos18anônimos, login administrativo sintético, cadastro/perfil/login cliente, checkout concorrente#1/#2, idempotência e pagamento pendente. Execução real às21:28 Brasília removeu18Auth; leitura21:28:57 confirma zero pedidos/perfis/contasclientes e três administradores preservados. Contador0 às21:28:45; próximo pedido#1.38documentos protegidos e configuraçãoRules/Auth/índices preservados. Dez checks públicos sem escrita aprovados; nenhuma conta/pedido real de validação criado. Dois backups privados recuperáveis preservados; fontes runtime não alteradas. Publicação main/Pages autorizada em preparação.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:012-H1/H2 ATENDIDAS, sem nova aprovação de exclusão. Os dois outros administradores permanecem até identificação/função verificada; exclusão não autorizada nem necessária para esta limpeza.012-H3 fica como julgamento pessoal comercial, sem automatizar Google/2FA e sem bloquear o encerramento técnico da limpeza; login real do proprietário e primeira compra real não foram executados pelo Codex. Próxima ação técnica desta ordem: publicar relatório/ferramentas/evidências e verificar Pages. Depois, uso normal da Demo pelo proprietário; nenhuma nova limpeza/reset/Rules/IAM por associação. B-03/B-04/fotos/noveMVPs/aceite geral preservados. Relatório RELATORIO_ORDEM_012_LIMPEZA.md e ORDEM_012_FINALIZACAO_*.json; espelho externo ausente, sem recriação.

---

# Ordem012 — publicada na main e Cloudflare — 26/10/2026

A — EXECUÇÃO PELO CODEX: commit1630242/main enviado; Pages catalogo-demo/630928da success às21:21:50 Brasília, disparo automático. Build homologacao9,61s, três testes de preservação, sintaxe das oito ferramentas, scanner393arquivos sem achados e documentação aprovados. Nove verificações Chrome públicas aprovadas após deploy às21:22:19, catálogo390/1366px, carrinho local, login protegido/Google e nenhuma escrita Firebase. Tentativa HTTP via urllib recebeu403, sem invalidar navegação Chrome efetiva; não é prova de checkout autenticado. Runtime preservado; documentação final publicada em commit posterior sem mudança funcional. Relatório e recibos ORDEM_012_PUBLICACAO*.json na adaptação serverless.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: publicação autorizada atendida.012-H1/H2 continuam pendentes; contador3/próximo#4,18 contas incertas e dois outros administradores preservados. Nenhuma nova exclusão, reset, Rules/IAM/Auth ou compra real nesta publicação. Backup privado ignorado, sem segredos no Git; guias históricos integrais continuam locais, espelho externo ausente. Sem limpeza importante pendente. Próxima tarefa exata: responder fatos012-H1/H2; depois revalidar estado antes de eventual adendo, sem repetir exclusões concluídas.012-H3 sessão pessoal/aceite posterior.

---

# Publicação da Ordem012 autorizada — 26/10/2026

A — EXECUÇÃO PELO CODEX: instrução expressa “publique tudo na main ... cloudflare” autoriza commit/push main LucasTech-Dev/Catalogos e publicação Pages catalogo-demo. Integração seletiva das oito ferramentas/testes, seis evidências sanitizadas, relatório e registros da etapa; fontes runtime mantidos. Backup/exportações/manifesto privado e credenciais excluídos. Build, testes da seleção, varredura e verificação pública fazem parte desta publicação. Nenhuma execução de limpeza, reset, Rules, IAM ou Auth é incluída neste ato.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: autorização de publicação atendida, sem nova confirmação indispensável.012-H1/H2 continuam pendentes; contador3 (próxima compra#4),18 contas de origem incerta e dois outros administradores preservados. Julgamento pessoal012-H3 permanece posterior. Documentação integral histórica e espelhos locais não são copiados em massa para a release; relatório/evidências/registro corrente publicados preservam a continuidade. Próxima ação técnica: conferir mesmo commit main no Pages e navegação pública sem gravações.

---

# Ordem012 — limpeza delimitada executada; pendências preservadas — 26/10/2026

A — EXECUÇÃO PELO CODEX:012-C1–7 no manifesto concluídos tecnicamente com verificação real.64 documentos removidos (14 pedidos principais,8 legados,9 históricos,8 perfis,13 endereços/tentativas,7 idempotências,3 reservas,2 usuarios de clientes), sete contas Auth de clientes removidas. Leitura21:10:18 Brasília:zero pedidos/zero perfis,39 documentos/21Auth restantes;38 documentos protegidos idênticos. Administrador proprietário Google/UID/permissões e outros dois administradores preservados. Backup103documentos/28Auth com recuperação319checks, três testes de seleção e nove verificações públicas aprovados. Catálogo, produtos/categorias/configurações/projeções/revisão comercial/Rules/índices/IAM/código runtime/Cloudflare mantidos. Sem conta/pedido real de teste, commit/push/deploy.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:012-H1 (números/compromissos externos) e012-H2 (18 anônimos sem vínculo) continuam sem resposta. Contador restabelecido em3; próxima compra seria#4, NÃO#1. As18 contas incertas e dois administradores continuam preservados; não declarar Ordem012 integralmente concluída. Próxima tarefa exata: obter fatos012-H1/H2 e revalidar imediatamente antes de qualquer reset/limpeza complementar; não repetir64/sete já excluídos.012-H3 sessão pessoal/primeira compra pelo proprietário após definir numeração. NoveMVPs e demais riscos preservados. Backup privado fora do checkout publicado e ignorado; espelho externo ausente. Sem limpeza importante pendente.

Relatório: [Ordem012: resultado real, backup e pendências](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_012_LIMPEZA.md).

---

# Handoff de26/10 — correções publicadas e verificadas

A — EXECUÇÃO PELO CODEX: HANDOFF-C1–6 concluídas no escopo técnico autorizado. Main55e9ba6/Pages71eb9050, disparo automático e sucesso às20:04:39 Brasília;40 verificações públicas aprovadas.301 testes integrados,28 verificações unitárias adicionais de painel/imagens,340 checks SDK/Rules e136 Chrome locais, build14,14s e scanner aprovados. Checkout preserva idempotência na resposta perdida e separa nova compra; ativação restaura ativo/disponível; fallback de foto e melhorias locais de acesso/perfil preservados. Navegação pública não substitui gravação comercial. Recibos, arquivos, limites, falhas/correções e rollback no relatório.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: HANDOFF-H1 publicação atendida, sem intervenção indispensável restante para esta release. Próxima tarefa exata: homologação comercial controlada na sessão pessoal após autorização específica para compra/alterações de dados. Rules B-03 permanecem pendentes de ato separado; B-04 em etapas/fotos/aceite físico/comercial preservados. Sem escritaFirebase real/Auth/IAM/índice/Rules ou mensagem pelo executor. ComboClassic/Guaraná não foram alterados. Exclusão de pedidos adiada; não resetar/renumerar/migrar por associação. NoveMVPs sem mudança ou etapa nova. Raiz sem commits preservada; main sincronizada. Evidências/testes/fontes/backups/build necessários mantidos, sem limpeza importante pendente; espelho externo ausente.

Relatório: [revisão e recibos](ADAPTACAO_SERVERLESS/RELATORIO_REVISAO_HANDOFF_20261026.md).


---

# Adendo administrativo de pedidos publicado e verificado — 25/10/2026

A — EXECUÇÃO PELO CODEX: AD-PED-H1 atendida por “publique”. Commitdfbc3dd/main LucasTech-Dev/Catalogos, Pages catalogo-demo/612eb624 produção canônica success às22:32:13 America/Sao_Paulo. Rootfrontend/buildhomologacao/dist e configuração remota preservados; ausência de disparo automático doPages confirmada antes de iniciar deployGit autorizado. Layout responsivo, releitura manual com feedback, loading/trava/modal, estado operacional e financeiro separados, documento canônico após transação, observações/fallbacks e histórico Sem número publicados. Não há renumeração ou mudança na geração do número.

80testes/7arquivos integrados novamente aprovados em27,61s; build11,05s. Evidência atual154checksSDK+34Chrome preservada, sem reexecutar a matriz já válida.29checks públicos aprovados em320/360/390/1366px,9produtos sem transbordamento/timeout/exceções, produto emrede lenta, ingredientes/observações/checkoutUF/confirmacaomobile preservados; /admin e /admin/pedido protegidos pelo loginGoogle; textos de ações/admin/histórico e CSS/spinner novos conferidos nos assets servidos. Entradaindex-DVNnqJe3.js. Navegação pública/bundle não substituem sessão pessoal ou gravação de pedido em produção; persistência e isolamento foram comprovados noEmulator. Nenhuma conta/pedido real, mensagem ou escritaFirebase/Rules/Auth/IAM/índice/migração nesta publicação. B-03/B-04/fotos/aceite geral/noveMVPs preservados.

Release seletiva18arquivos com scanner/hashes conferidos, sem credenciais/identidade privada. Scripts operacionais de homologação real e runner/ensaio local permanecem locais; fontes/testes/capturas sintéticas preservados noGit. Recibo ADMIN_PEDIDO_PUBLICACAO_EVIDENCIAS.json distingue os18hashes efetivamente enviados do manifesto de preparação local; ADMIN_PEDIDO_PAGES_EVIDENCIAS.json registra os29checks. Verificador somente leitura validar-admin-pedido-pages.cjs e registros finais permanecem locais, sem push documental adicional. Rules locais idênticas byte a byte à fonte publicada anterior/hash71ca8548, sem alteração. Rollbackfrontend7647d6b/Pages2d7ab6cf registrado. Git da cópia main limpo/alinhado0/0; raiz sem commits e trabalho prévio preservados. Helpers encerraram Chrome/perfis/emuladores próprios; fontes/build/capturas/testes úteis mantidos, sem resíduos descartáveis ou limpeza pendente. Inventário/índice conferidos; espelho externo ausente, não recriado. Tempos de comandos registrados, sem inventar medição integral.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: autorização de publicação ATENDIDA. Próxima ação exata: atualizar /admin e conferir a página de pedido na sessão pessoal; AD-PED-H2 julgamento físico Android/iPhone permanece pendente, sem login pessoal automatizado nem compra real de teste. Nenhuma nova autorização/intervenção técnica indispensável para encerrar esta publicação. Publicação concluída; histórico abaixo preservado.

---

# Adendo administrativo de pedidos — pronto localmente — 25/10/2026

A — EXECUÇÃO PELO CODEX: AD-PED-C1–4 concluídos. /admin/pedido tem CSS próprio, colunas responsivas, atualização somente leitura, spinner/bloqueio/foco, status persistido só após retorno do serviço transacional e confirmação de cancelamento/financeiro. Sem falso sucesso por releitura falha. Operacional e financeiro separados; regras/transições/revisão/isolamento mantidos. Cliente/endereço/valores/desconto/observações com fallbacks. Históricos sem número usam Sem número, sem fragmentoID e sem migração; sequência e busca existentes preservadas. Projeção permite observação de item já armazenada, sem mudar escrita/Rules.

80testes distintos/7arquivos,154checksSDK+34Chrome aprovados; clienteA viu persistência em detalhe/listagem, dashboard releu o estado, clienteB/adminoutraloja negados. Responsividade320/360/390/1366 e capturas390/1366 inspecionadas; Chrome não comprova aparelho físico. Buildhomologacao aprovado, recibos/manifesto em docs/ADAPTACAO_SERVERLESS/ADMIN_PEDIDO_*.json, relatório RELATORIO_ADMIN_PEDIDO_FINAL.md e adendo no relatório da última finalização. Serviço/Rules já funcionais reaproveitados, sem novo listener/dependência ou auditoria geral. Nenhuma escritaFirebase real, Rules/IAM/índice/Auth/migração/conta/pedido real/WhatsApp ou stage/commit/push/deploy. Fontes/testes/build/capturas úteis mantidos, processos temporários próprios encerrados, sem limpeza pendente. Raiz sem commits/trabalho prévio preservada; cópia de publicação limpa7647d6b. Scanner/hashRules conferidos, índice/inventário atualizados; espelho externo ausente. NoveMVPs/comercial/B-03/B-04/fotos/roteiro geral permanecem, sem presumir aceite das outras frentes do painel.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: AD-PED-H1 aguardando autorização para publicar esta alteração, conforme item15 do novo anexo (“Não realizar commit, push ou deploy automaticamente”). A autorização automática anterior foi atendida na release7647d6b; não substitui a instrução posterior. Sem dependência de mudançaFirebase para este código. Estado: FUNCIONAL E PRONTA PARA PUBLICAR localmente. Próxima tarefa exata: decisão AD-PED-H1, depois integração seletiva/build/push main LucasTech-Dev/Catalogos/deploy Pages catalogo-demo e verificação pública. AD-PED-H2 julgamento físico da sessão pessoal após publicação, sem automação/login/pedido real nesta etapa. Histórico abaixo preservado.

---

# CHECKOUT-MOBILE-02 publicada e verificada — 25/10/2026

A — EXECUÇÃO PELO CODEX: publicação automática autorizada concluída. Commit7647d6b/main LucasTech-Dev/Catalogos, Pages catalogo-demo/2d7ab6cf produção canônica success às22:10:43 America/Sao_Paulo. Rootfrontend/comando homologacao/saídadist/configuração remota preservados. Sem disparo automático após push, deploy Git executado pela conexão autorizada. UF com exemplo/validação/maiúsculas e preservação; confirmação com card centralizado/ícone/total e botões mobile; WhatsApp organizado; confirmação exclusiva/idempotência e isolamento mantidos. Nenhuma alteração Firebase/Rules/Auth/IAM/índices/dados ou pedido/conta real criado, nenhuma mensagem enviada.

31 testes/3 arquivos novamente aprovados na cópia integrada em23,20s; build13,40s. Ensaio local atual30checksSDK+36Chrome aprovado, com capturas sintéticas320/390 e CSS verificado até1366.25checks na URL publicada aprovados em320/360/390/1366:9produtos públicos, sem transbordamento/exceções/timeout, rede lenta, ingredientes/observações/adminGoogle preservados; ajudaUF, confirmação e CSS verde presentes nos assets servidos. Entradaindex-BugPpdWE.js. Leitura pública e bundle não substituem checkout real nem teste físico. Evidências: docs/ADAPTACAO_SERVERLESS/CHECKOUT_MOBILE_PUBLICACAO_EVIDENCIAS.json e CHECKOUT_MOBILE_PAGES_EVIDENCIAS.json; relatório RELATORIO_CHECKOUT_MOBILE_FINAL.md. Verificador reutilizável validar-checkout-mobile-pages.cjs somente leitura, fora do build.

Release seletiva17arquivos com hashes/scanner conferidos; nenhum segredo/identidade privada publicado. Rules comparadas byte a byte, sem mudança. Git da cópia main limpo/alinhado0/0, raiz sem commits preservada. Rollbackfrontend40cdedd/Pages8ef017d3 registrado, sem reverter Firebase. Fontes/testes/capturas/build necessários mantidos; Chrome próprio/perfis temporários encerrados pelo helper, sem limpeza pendente. Registros finais/verificador online permanecem locais, sem push documental adicional. Índice/inventário conferidos; espelho externo ausente, não recriado. Contrato/matriz/noveMVPs e B-03/B-04/fotos/aceite comercial geral preservados. Durações dos comandos registradas; sem estimativa retrospectiva de tempo integral.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: autorização ATENDIDA; nenhuma intervenção indispensável para encerrar. Próxima ação exata: atualizar a página no Android/iPhone e avaliar o checkout/WhatsApp na sessão pessoal. Conferência em aparelho físico/WhatsApp segue pendente como julgamento visual, sem bloquear esta publicação autorizada. Não foi automatizado login pessoal ou pedido real. Histórico abaixo preservado.

---

# Checkout mobile final — validado; publicação autorizada — 25/10/2026

A — Codex: CHECKOUT-MOBILE-02, UF com exemplo/siglas válidas/maiúsculas e preservação; confirmação com CSS próprio/card/ícone/total/botão verde; mensagemWhatsApp organizada; retomada de link ocupada e isolada por conta. Número comercial e confirmação exclusiva já existentes preservados.31testes +30checksSDK/RulesEmulator +36Chrome aprovados, capturas320/390inspecionadas e estilos verificados até1366px. Nenhuma alteraçãoFirebase/Rules/Auth/IAM/índice/preços/produtos/pedidos reais. Reporte: RELATORIO_CHECKOUT_MOBILE_FINAL.md na adaptação serverless. Contrato/matriz/noveMVPs e demais riscos preservados.

B — proprietário: autorização atual para publicar automaticamente recebida, substitui a proibição do anexo nesse ato/alvo. Próxima ação desta mesma ordem: build/testes integrados,push main LucasTech-Dev/Catalogos,deploy Pages catalogo-demo,verificação online. Julgamento físico Android/iPhone/WhatsApp posterior; captura é de dados sintéticos/Chrome, não aparelho real. Sem nova confirmação indispensável. Histórico abaixo preservado.

---

# NUM-MOB-01 publicada e verificada — 25/10/2026

A — EXECUÇÃO PELO CODEX: instrução “publique” atende NUM-H1/NUM-H2 apresentados. Rules bancorestaurante d35b5c52 ativadas e fonte exata conferida às21:49:44 local; anterior bc43163b preservada, sem alteraçãoAuth/IAM/índices ou escrita de dadosFirestore pelo executor. Código40cdedd/main LucasTech-Dev/Catalogos enviado; Pages catalogo-demo/8ef017d3 produção canônica success às21:50:30 America/Sao_Paulo. Build/comando/rootfrontend/saídadist e configuração remota preservados. Janela Rules→site de aproximadamente46s; abas antigas devem atualizar a página. Não foi necessário criar contador/reserva manualmente, migrar histórico ou gerar compra real de homologação.

274testes/27arquivos aprovados novamente no checkout integrado em83,32s; build homologacao13,15s. Evidência local anterior155checksEmulator/Chrome preservada, não reexecutada nesta publicação.22checks online aprovados em320/360/390/1366px:9produtos públicos comAuth/imagens bloqueados, sem APIString.isWellFormed, sem transbordamento/timeout/exceções, produto em latência250ms,ingredientes/observações/adminGoogle preservados, contrato numeroPedido/reserva e confirmação separados presentes no bundle servido, SDKLite público carregado. Entradaindex-nlZ7qlmN.js. Zero conta/pedido real criado ou mensagem enviada pelo executor. Inspeção do bundle e leituras públicas não substituem pedido integrado real nem teste em aparelho físico. [Recibo,45arquivos publicados e rollback](ADAPTACAO_SERVERLESS/NUMERO_PUBLICO_PUBLICACAO_EVIDENCIAS.json). Ferramentas novas publicar-numero-publico-rules.cjs (preparo inativo/ativação/verificação limitados à release) e validar-numero-mobile-pages.cjs (leitura/navegação pública semlogin) preservadas; verificador e registros finais permanecem locais sem push documental adicional. NUMERO_PUBLICO_ARQUIVOS descreve preparação local; recibo de publicação registra hashes exatos da release, cujo package.json preserva aliases remotos.

Rules foram compiladas antes da troca via criação de versão inativa; backup privado da release/fonte anterior foi conferido. Implantação usa PATCH somente da releasecloud.firestore; nenhum outroalvo. Falta de disparo automático doPages observada; deployGit manual autorizado. Rollback de frontend ba6d414/cc708a80 e ruleset anterior preservados; não apagar novos pedidos/números nem reverter Rules sem conferir consumidores. Git do checkout limpo/alinhado, Git raiz sem commits preservado. Scanner45arquivos sem credenciais/identidadeprivada; backups/manifestos ignorados e fontes/testes/build atual úteis mantidos. ProcessosChrome próprios encerrados, sem novos descartáveis/limpeza pendente. Inventário/índice conferidos; espelho externo ausente,não recriado.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: NUM-H1/NUM-H2 ATENDIDAS, publicação concluída. R-NUM-01: gate de autorização/implantação atendido; homologação de compra real permanece não executada por automação. R-MOB-01: conferência física Safari/iPhone/Android/aplicativoWhatsApp ainda pendente, pois teste comUA/viewportChrome não equivale aWebKit/aparelho real. Próxima ação exata:atualizar site e avaliar no dispositivo; se o proprietário deliberadamente criar pedido de teste, conferir número/WhatsApp/ausência de duplicação. Nenhuma nova operação técnica/autorização indispensável para encerrar esta publicação. B-03/B-04/fotos/aceitecomercial e demais riscos continuam como registrados; posição dos noveMVPs sem nova baixa automática. Histórico abaixo preservado.

---

# Publicação NUM-MOB-01 autorizada e em preparação — 25/10/2026

A — Codex: resposta “publique” atende NUM-H1 e NUM-H2 específicos apresentados imediatamente antes: Rules bancorestaurante + commit/push main LucasTech-Dev/Catalogos + Pages catalogo-demo. Rules novas compiladas/verificadas como versão inativa, sem trocar a release atual; anterior conferida com baseline e preservada em backup privado. 274 testes e155checks locais aprovados permanecem evidência; integração/build da cópia de publicação em execução. Nenhum pedido/conta real ou mensagem de teste será criado nesta publicação. Ativação das Rules e implantação serão coordenadas; nenhuma conclusão remota presumida.

B — proprietário: autorizações atendidas; somente julgamento físico Safari/iPhone/WhatsApp permanece posterior. Sem intervenção técnica indispensável durante a execução autorizada. Relatório e evidências abaixo preservam o histórico da preparação.

---

# NUM-MOB-01 — gates de implantação e limite físico — 25/10/2026

R-NUM-01 ABERTO: numeração comercial/novo contrato local validado, mas Rules publicadas não permitem contador/reserva/campo. Aprovações NUM-H1 (Rules bancorestaurante) e NUM-H2 (main/Pages catalogo-demo) ainda ausentes; nenhum ato real iniciado. Transição exige coordenação, porque Rules novas exigem número que o frontend anterior não envia. Backup e reversão documentados, sem apagar pedidos/contadores. Não publicar frontend isolado. Campo começa em1 por loja, não nos números ilustrativos1025; não há migração de histórico.

R-MOB-01 ABERTO PARA HOMOLOGAÇÃO FÍSICA: 19checksChrome com UA iOS/Android/WhatsApp e320/360/390px,Auth/imagens bloqueados,latência300ms/offline/online/importação tardia aprovados; isso não comprova WebKit/aparelho ou aplicativoWhatsApp real. Causa da sessão específica do iPhone11 não confirmada. Dois pontos de fragilidade de carregamento e dependência de API recente corrigidos localmente; nenhum timeout aumentado. Reteste pessoal depois de publicação autorizada.

A — Codex:274testes,30checksRules e106regressões aprovados,build13,36s; leitura somente Rules confirma base remota com diferença de newline final. B — proprietário: decisões NUM-H1/NUM-H2 e depois homologação física. [Escopo,arquivos e evidências](ADAPTACAO_SERVERLESS/RELATORIO_NUMERO_PUBLICO_MOBILE.md). Demais ressalvas/B-03/B-04/fotos/aceite comercial preservadas; preparação não dá baixa por associação.

---

# Navegação administrativa publicada e verificada — 25/10/2026

A — EXECUÇÃO PELO CODEX: ADM-NAV-01 PUBLICADA por “suba, bota no ar”. Commit ba6d414/main LucasTech-Dev/Catalogos; Pages catalogo-demo/cc708a80, produção canônica success às 21:03:03 America/Sao_Paulo. Configuração frontend/dist/comando homologacao preservada; ausência de disparo automático levou ao deploy Git manual autorizado. Regressão integrada 53 testes e build 10,85s aprovados; 21 checks online em 320/390/1366px, Google administrativo disponível, /admin e /admin/pedidos protegidos, login cliente preservado, sem exceções ou transbordamento. Nova entrada index-u0Q5KKK3.js confirmada. [Recibo, arquivos publicados e rollback](ADAPTACAO_SERVERLESS/ADMIN_NAVEGACAO_PUBLICACAO_EVIDENCIAS.json). Checks Emulator anteriores 84 SDK/31 Chrome mantidos como evidência versionada, não reexecutados nesta publicação.

Nenhuma alteração Firebase nesta publicação, conta/pedido criado ou mensagem enviada. Permissão admin e WhatsApp concedidos antes permanecem válidos. Sete fontes runtime e regressão de acesso publicadas com relatório/recibos sanitizados; ferramentas administrativas, planos completos, backups e credenciais permanecem locais. Preparação seletiva evitou copiar scripts históricos fora do escopo; nenhuma exclusão de conteúdo exclusivo. Diagnóstico inicial de cópia documental por diretório incorreto corrigido sem perda. Scanner dos 13 arquivos passou, identidade pessoal não incluída. Checkout da release limpo/alinhado; Git raiz sem commits preservado. Registros finais/verificador online ficam locais, sem novo commit/push documental automático. Inventário conferido; espelho externo ausente. Sem limpeza pendente.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: autorização de publicação atendida. Próxima ação exata: atualizar /admin e entrar com a conta Google autorizada; confirmar experiência pessoal do painel. Sessão pessoal não foi automatizada nem homologada por inferência. Nenhuma nova autorização técnica indispensável nesta publicação. B-03/B-04/fotos/aceite comercial geral e demais riscos preservados; contratos/matriz/nove MVPs sem mudança. Histórico abaixo preservado.

---

# Publicação da navegação administrativa autorizada — 25/10/2026

A — Codex: resposta “suba, bota no ar” autoriza commit/push na main LucasTech-Dev/Catalogos e deploy Pages catalogo-demo da correção revisável. Firebase preservado nesta publicação. Base remota 932f967 confirmada alinhada, configuração Pages frontend/dist e comando homologacao mantidos. 53 testes e 115 checks Emulator/Chrome aprovados anteriormente; integração/build/validação online desta release em execução. Nenhuma publicação concluída presumida.

B — proprietário: autorização atendida nesta mesma ordem; após publicação, conferir sessão Google em /admin. Não automatizar identidade pessoal. Riscos comerciais e histórico mantidos; próxima ação desta ordem: concluir push/deploy e validar nova entrada Google online, sem criar conta/pedido ou enviar WhatsApp.

---

# Navegação administrativa corrigida localmente — 25/10/2026

A — EXECUÇÃO PELO CODEX: ADM-NAV-01. Conta segue admin ativo da loja-demo. Relato “Minha conta” na rota /admin recebido; Chrome público isolado abriu Acesso administrativo em /admin, sem perfil/redirecionamento/exceções. Login e cabeçalho sempre dirigiam ao perfil: correção local consulta papel/ativo/loja no servidor e UID atual, encaminha administrador ao painel e oferece acesso no perfil/menu desktop/mobile; entrada administrativa recebe Google. Gate/Rules continuam protegendo dados. 53 testes aprovados, build homologacao 7,96s, 84 checks SDK e 31 checks Chrome/Emulator aprovados; login até /admin, perfil/menu em 320/390/1366px, cliente/outra loja negados. [Arquivos, evidências e limites](ADAPTACAO_SERVERLESS/RELATORIO_ADMIN_PROPRIETARIO_WHATSAPP.md). Sem nova mutação Firebase real, commit/push/deploy ou novo MVP/contrato/matriz; demais riscos comerciais mantidos. Fontes/testes/build preservados, sem limpeza pendente; espelho externo ausente.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: ADM-H2 não homologado. Próxima ação: publicar a correção após autorização específica, conforme pedido desta etapa “Não faça commit, push ou deploy automaticamente”; depois conferir painel com sessão Google pessoal. Teste isolado não substitui essa confirmação. WhatsApp configurado anteriormente continua válido; histórico abaixo preservado.

---

# Admin concedido; conferência visual pendente — 25/10/2026

A — EXECUÇÃO PELO CODEX: ADM-C1/C2 e WA-C1 executados por autorização específica. Conta Google identificada privadamente; usuarios/{uid} com role admin, ativo true, lojaId loja-demo. Releitura atual confirma permissão, idempotência zero escritas. WhatsApp público/origem 5551995310123 e revisão atômica; demais campos preservados. Cinco testes e 26 checks Emulator aprovados, leitura pública e URL verificadas. Sem mensagens/pedidos novos, Auth/Rules/IAM/índices ou deploy/stage/commit/push. [Relatório e arquivos](ADAPTACAO_SERVERLESS/RELATORIO_ADMIN_PROPRIETARIO_WHATSAPP.md). Contratos/matriz/nove MVPs e demais riscos B-03/B-04/fotos mantidos; nenhuma limpeza pendente, cópias úteis preservadas, espelho externo ausente.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: ADM-H1 login Google confirmado; ADM-H2 relatou visual de cliente, portanto aceite administrativo pendente. Login e Minha conta atualmente levam a /perfil para qualquer papel; /admin usa gate próprio. Próxima tarefa exata: identificar a tela na rota /admin pela pergunta já enviada e resolver o ponto afetado, sem repetir concessão correta ou presumir sucesso. Credencial enviada no chat não usada/persistida; rotação recomendada diretamente no provedor, confirmação pendente. WhatsApp exige confirmação de envio pelo cliente. Histórico abaixo preservado.

---

# Ingredientes — lacuna de conteúdo atendida nos seisprodutos — 25/10/2026

ING-03:seislistas aprovadas no contexto“publique” aplicadas e confirmadas; ClassicBurger, bebidas e doisinativos preservados. Código932f967/Pages353f56d4/success;34checks online em320/390px aprovados. Cópia33documentos e restauraçãoEmulator111checks verificadas antes da aplicação. Não houve mudançaRules/índices/Auth/IAM ou promessa de alergênicos/contaminação. [Evidências e limites](ADAPTACAO_SERVERLESS/RELATORIO_INGREDIENTES.md). A — Codex:publicação/verificação concluídas. B — proprietário:revisão visual;retiradas selecionáveis dependem de definição/autorização,sem confundir ingredientes depreparo ou componentesdecombo com itens removíveis. Demais riscos/B-03/B-04/fotos e aceitecomercial mantidos.

---

# Ingredientes — composição proposta, ainda não aplicada — 25/10/2026

ING-H1(sugestões) atendida. Leitura atual dos11produtos confirma9ativos/2inativos, ClassicBurger com ingredientes e seisoutrascomidas com arrayvazio; bebidas e combo tratados separadamente. Propostas ajustadas às descrições atuais, aguardandoING-H2 e autorização específica de escrita. Nenhuma receita sugerida é confirmada automaticamente. [Tabela consolidada](ADAPTACAO_SERVERLESS/PROPOSTA_INGREDIENTES.md). Seletor de retirada depende de identificar os itens realmente removíveis; observações atuais preservadas, sem preçoextra ou garantia de alergênicos. Nenhuma escritaFirebase/publicação/nova baixa comercial. A — Codex:inventário/comparação/contrato local verificados. B — proprietário:aprovar ou corrigir composição; operações futuras específicas separadas.

---

# Ingredientes — lacuna de conteúdo confirmada — 25/10/2026

Leitura pública somente leitura confirmou ingredientes:[] naBatataFrita. Campo administrativo de ingredientes e apresentação local corrigidos/testados; catálogo real ainda não preenchido. Composição aguardandoING-H1; não inferir ingredientes ou afirmar que todos os produtos estão vazios (somenteBatataFrita conferida). Sem alteraçõesFirebase/publicação. [Causa,correção e evidências](ADAPTACAO_SERVERLESS/RELATORIO_INGREDIENTES.md). Demais riscos/comercial mantidos. A — Codex: código local validado. B — proprietário: composição para preparar preenchimento e autorizações futuras específicas.

---

# Material/mobile — evidência de publicação — 25/10/2026

MATERIAL-01 publicado7ac6a05/Pages23734aae. Centralização do carrinho e observações agora públicas; transbordamento320px no detalheadmin corrigido e validado localmente.280checksChrome em22rotas e90online aprovados. Chromeviewport não comprovaSafari/iOS físico. DisparoautomáticoPages continua não confirmado; deploymentGit manual autorizado funcionou, sem modificar integração.249testes distintos/20integrados/build aprovados. Nenhuma baixa de ressalvascomerciais/B-03/B-04/quatro fotos. [Evidências e limites](ADAPTACAO_SERVERLESS/RELATORIO_MATERIAL_MOBILE.md). A — Codex: publicação/verificação concluídas. B — proprietário: revisão visual, sem ação técnica indispensável.

---

# CART-01 — proteção publicada — 25/10/2026

Correção de isolamento do carrinho publicada: código f7be03b, Pages d370c31d/success. 56 verificações online aprovadas, incluindo logout vazio, contaB sem carrinhoA e recuperação exclusiva do carrinhoA. Cache legado sem dono preservado, sem importação; pode aparecer vazio após atualização. Disparo automáticoPages continua não confirmado; deployGit manual autorizado bem-sucedido, sem mudar integração. Demais ressalvas e gates comerciais mantidos. [Resultado e limites](ADAPTACAO_SERVERLESS/RELATORIO_PUBLICACAO_PENDENCIAS.md). A — Codex: publicação/verificação concluídas. B — proprietário: revisão visual, sem ação técnica indispensável.

---

# Carrinho por identidade — CART-01 — 25/10/2026

Falha de isolamento local identificada: cache por loja era compartilhado entre UIDs. Correção local v2 preparada; publicação pendente de autorização específica, logo a proteção nova ainda não está no site por esta sessão. Cache legado sem titularidade é preservado sem importação (primeira utilização pode exibir vazio); compra de visitante substitui cache anterior da mesma conta, sem somar compras. Observações agregadas respeitam limite contratual1000; storage bloqueado funciona somente em memória. Testes locais não comprovam consentimento Google ou troca online entre contas reais; sem evidência de incidente em pedidos/dados comerciais. [Relatório e evidências](ADAPTACAO_SERVERLESS/RELATORIO_ISOLAMENTO_CARRINHO.md). Demais riscos/ressalvas preservados, sem baixa por associação.

---

# OAuth Google — atualização específica — 25/10/2026

OAUTH-DOMINIO resolvido: catalogo-demo-cz1.pages.dev incluído sob aprovação própria; demais configurações comprovadamente preservadas. Proprietário confirmou login Google e abertura de Minha conta. Variante de domínio .deV preexistente à escrita foi preservada, sem autorização de remoção. Não há bloqueio OAuth conhecido após a confirmação; isso não encerra ressalvas comerciais/B-03/B-04/fotos ou autoriza novas operações. Evidências e limites em ADAPTACAO_SERVERLESS/RELATORIO_GOOGLE_NOTIFICACOES.md.

---

# Autenticação do cliente — 25/10/2026

AUTH-01 publicado:2fe8644/main/Pagesa17d18e3,195 testes/build e35 checks online aprovados, sem mudar Rules, índices, IAM ou configuração Auth. Vinculação preserva UID; colisão não mescla históricos e exige escolha explícita após aviso. Telefone opcional no cadastro não altera o requisito das Rules para salvar perfil completo/compra. Login Google pessoal em produção aguarda AUTH-H1 e não é comprovado por Emulator. Nenhuma ressalva anterior encerrada ou permissão administrativa concedida. [Escopo e evidências](ADAPTACAO_SERVERLESS/RELATORIO_AUTENTICACAO_CLIENTE.md).

---

# Publicação geral — atualização de evidência — 25/10/2026

Loading/performance/imagens publicados: código4f3c01f, Pages3afef9fe/success e24 checks online/175 testes aprovados. O impedimento de disparo automático foi contornado por deploymentGit manual autorizado; disparo automático continua não confirmado, sem alteração da integração. Quatro fotos continuam pendentes com fallback, B-03/B-04 e demais gates comerciais conservam seus limites. Rodada atual mede somente bloqueioadmin e não valida autoridade positiva no Firebase real; nenhuma reativação feita. Medianas de pedidos/bloqueioadmin não apresentaram ganho nesta rodada; comparação binária integral local/Pages não obtida, embora commit/versionamento e recursos publicados estejam confirmados. [Método/evidências/limites](ADAPTACAO_SERVERLESS/RELATORIO_PUBLICACAO_GERAL.md). Sem baixa de risco por associação ou novo MVP.

---

# Imagens do catálogo — 25/10/2026

Publicado: código030ec02, Pages440ebe2b/success e cinco verificações online desktop/mobile/detalhe/carrinho aprovadas (recibo IMAGENS_PAGES_EVIDENCIAS.json). Correção frontend: destaque usa Bacon Supreme com identificação correta; home/cardápio/detalhe/carrinho recebem fallback local acessível.17 testes relevantes e build homologacao aprovados; Chrome desktop/mobile aprovado. Quatro fotos reais pendentes: Bacon Burger/Batata Frita/Coca-Cola com campo vazio; Chicken Crispy com URL externa404. Sem fotos originais recuperadas nem alterações Firebase. Não encerrar essa pendência por causa do fallback.

A — Codex: diagnóstico somente leitura, proteção visual e publicação autorizada no Pages existente; acompanhar evidência no relatório de imagens. B — proprietário: disponibilizar fotos próprias/licenciadas correspondentes; eventual mudança dos oito campos imagem exige autorização específica com valores definidos. Próxima ação somente completar essas imagens; não criar contas ou novas funcionalidades. Sem limpeza pendente; espelho externo ausente.

---

# Catálogo JS publicado — DEMO FUNCIONAL — 25/10/2026

https://catalogo-demo-cz1.pages.dev serve o catálogo full com Firebase real. Código integrado em LucasTech-Dev/Catalogos/main, commit c63a6e05119fb363e57512fa929a80209fd8d713, preservando parent/histórico remoto; push normal. Pages catalogo-demo:root frontend, build npm run build -- --mode homologacao, saída dist e dez variáveis públicas homologadas. Deployment canônico81f69c28-c10f-4647-a8b4-355464daf214/success substituiu ac720402.

A — EXECUÇÃO PELO CODEX:147 testes no checkout integrado/build local com hashes homologados;16 checks na URL pública (home/produtos, anônimo/login, carrinho/checkout sem submit, histórico/detalhe, admin restrito, mobile/rotas, sem provisórias/Render/exceções). Zero pedidos/cadastros e-mail novos; uma sessão anônima necessária identificada. Firebase comercial/Rules/índices/IAM/configuração Auth/usuários originais não alterados. B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:autorização de integração/publicação atendida; nenhuma intervenção técnica pendente.

[Relatório final/arquivos/limites](ADAPTACAO_SERVERLESS/RELATORIO_PUBLICACAO_JS_PAGES.md). Checkout de commits desta release em private-backups/publicacao-js-main (main com histórico); Git original vazio preservado, não presumir que recebeu commits. Backend/demo/firebase remotos e projetos independentes preservados, não hospedados. JS-09 conclui publicação/validação dos fluxos solicitados; B-03/B-04/aceite comercial geral não recebem baixa por associação. Sem limpeza pendente; backups/credenciais/build necessários ignorados, espelho externo ausente.

Próxima ação:usar a demo publicada e obter avaliação comercial; replicação/personalização somente quando solicitada. Não abrir novas etapas, migrar/configurar Firebase ou repetir pedidos/testes aprovados automaticamente. Resultados anteriores de bloqueio abaixo são históricos, superados por esta autorização/execução.

---

# Publicação Pages — alinhamento Git bloqueado — 24/10/2026

Homologação real concluída permanece válida. A ordem atual autoriza commit/push/deploy sob condições; a condição de interromper por branch incorreta foi acionada: cópiaJS na branch adaptacao-js-serverless, sem commits/rastreados/remote; Pages catalogo-demo (URL catalogo-demo-cz1.pages.dev) ligado a LucasTech-Dev/Catalogos/main, auto-deploy ativo. Root remoto ainda demo, sem variáveis Pages; produto oficial em frontend/. Produção antiga ac720402 ainda exibe páginas provisórias de login/checkout/admin.

A — EXECUÇÃO PELO CODEX: leitura Git/Pages, scanner sem achados,147 testes aprovados, build full com oito saídas/hash idêntico ao homologado, verificação Chrome sem Render/contas/pedidos novos. Nenhum stage/commit/push/deploy/configuração remota ou Firebase alterado. B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: SYNC-H1 decidir integração preservando main e corrigir root/variáveis Pages; nenhuma senha solicitada. Procedimento mínimo/evidências/arquivos/limites no [relatório](ADAPTACAO_SERVERLESS/RELATORIO_SINCRONIZACAO_GITHUB_PAGES.md).

Próxima ação exata: preparar checkout baseado na main remota dentro desta pasta, preservar cópia/histórico, revisar diff seletivo, corrigir root para frontend e variáveis públicas homologadas no Pages; então commit/push normal já autorizado, se sem conflitos/dados sensíveis, e validar auto-deploy online. Não usar force, sobrescrever main com commit-raiz, enviar diretório inteiro ou alterar Firebase. JS-09 aguarda publicação; demais MVPs/ressalvas não recebem baixa por associação. Sem nova auditoria/plano/funcionalidade; nenhuma limpeza pendente. Espelho externo ausente.

---

# Ordem011 — configuração final do Firebase — 24/10/2026

**CONCLUÍDA.** Projeto bancorestaurante/(default). Cinco índices compostos criados exclusivamente pelo endpoint de índices; 5/5 READY confirmados. Anônimo habilitado por PATCH limitado a signIn.anonymous.enabled. E-mail/senha, Google, três usuários, demais configurações Auth, Rules e 57 documentos comerciais preservados na comparação antes/depois. Migração não repetida. Detalhes, horários, arquivos e limites no [relatório](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_CONFIGURACAO_FINAL.md).

A — EXECUÇÃO PELO CODEX: 011-CFG-C1 índices, C2 Auth e C3 preservação executados; C4 registro documental/limpeza. Cinco consultas Query Explain(analyze=false) aprovadas; sem leitura de resultados nem criação de usuário/pedido de teste. JS-01–07 e limites B-03/B-04 preservados; JS-09 avança somente na configuração real.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: 011-CFG-H0 dispensada, as duas operações específicas foram executadas pela conexão administrativa autorizada. Nenhuma intervenção ou segredo solicitado.

Próxima tarefa exata: homologação essencial HOM011-01–12 do checklist existente, mediante autorização específica para contas/dados/pedidos controlados; depois publicação da demo Cloudflare Pages sob ato próprio. Não iniciar escritas de homologação, domínio Auth, publicação, commit ou push nesta ordem. R-005 continua aberto até homologação/configuração de host/publicação; somente os gates de índices/Anônimo foram atendidos. Nenhuma nova funcionalidade ou auditoria geral. Espelho externo ausente, não recriado.

---

# Ordem011/P2B — migração real concluída; gates restantes — 24/10/2026

Bootstrap29caminhos resolvido nesta janela:12atualizações/17criações/28preservados conferidos por leitura de57caminhos eversões;16projeções coerentes,revisão0/alteracao null. Cincofases confirmadas emjournal; semdivergências/erros oualterações inesperadas nos57caminhos. Confirmações administrativas anteriores aceitas,semnova auditoria.

Permanecem riscos de escritores desconhecidos/concorrência posterior e recuperação dirigida de qualquer incidente futuro; não resetarjournal/revisão nem restaurar dados emmassa. Gates de índices/loginanônimo,homologaçãointegrada e publicaçãoPages/comercial continuam pendentes e exigem autorizações próprias; nenhum risco desses foi fechado pela migração. Loginanônimo não substitui logincliente/admin. Nenhuma alteraçãoIAM/Auth/Rules/índices oupublicação nesta ordem. Próximaação: autorização específica para5índices e loginanônimo,sem iniciarParte3 automaticamente. [Relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md),[recibo](ADAPTACAO_SERVERLESS/ORDEM_011_P2B_EXECUCAO_EVIDENCIAS.json); histórico abaixo preservado.

---

# Ordem011/P2B-M — bloqueios identificados atendidos — 24/10/2026

Estado vigente: bloqueios conhecidos de segundoOwner,Render e conta técnica atendidos. RemoçãoOwner já corroborada automaticamente na leitura anterior; proprietário confirma únicaOwner identificada,projetoRender consultado semserviços e conta cat-logos-api-full-homologa-o desativada. Papel tinha create/update/delete,semimport; firebase-adminsdk-fbsvc preservada. Evidência manual recebida,semnova leitura403. Preflight atual aprovado:40documentos iguais emcampos/updateTime,17ausentes,zero divergências,mesma identidade/projeto/backup. LIBERADO tecnicamente,0/29gravações;aplicação aguarda autorização específica.

Risco residual permanece: não há prova universal sobre escritores desconhecidos,herança/grupos,delegação,caches/previews; não deduzir contenção global de logs vazios/HTTP404. Transações57caminhos emcadafase,precondições deversão/ausência e journal comrecibos continuam essenciais. Cincofases não são uma transação global; divergência ourecibo perdido exige parar/recuperação dirigida. Não fechar riscoscomerciais/índices/Auth/Pages nem tratar liberação técnica como publicação. Próximaação: autorização específica29 eprecondições atuais. Detalhes no [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md) e [recibo final](ADAPTACAO_SERVERLESS/ORDEM_011_P2B_FINAL_EVIDENCIAS.json). Histórico abaixo preservado.

---

# Dois bloqueios finais — instrução manual precisa — 24/10/2026

A — EXECUÇÃO PELO CODEX:011-P2B-L correlacionou porhash o binding técnico anterior com ID `cat-logos-api-full-homologa-o`; papel `catalogosBackendFull`. Sem nova leitura403/auditoria/preflight. B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:H2R confirmar ausênciaRender no workspacecorreto;H2I consultar permissões do papel eestado da conta exata. Telas/permissõesdeconsulta eformato seguro deresposta em [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md). **BLOQUEADO;0/29escritas.** Após confirmações suficientes,preflight eautorização explícita antes deaplicar;nenhuma alteraçãoIAM/serviços autorizada. Históricoabaixopreservado,semnovo plano.

---

# Revalidação pós-remoções — 24/10/2026

A — EXECUÇÃO PELO CODEX:011-P2B-K confirma1Owner/mesmaADC (segundoOwner removido),backup/fontes/projeto corretos,40documentos iguais emcampos/versão e17ausentes/zero divergências. RenderHTTP404; sem conexão administrativa para confirmar exclusão. Permanece vínculo técnicocatalogosBackendFull; leitura depapel/conta403,capacidadeatual não esclarecida. Catálogo/chunks conhecidos conferidos semexecutarapp ouescritas; nenhuma novaauditoriaBiblioteca.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:011-P2B-H2 confirmar ausênciaRender nopainel e somente estado/permissões daconta técnica associada aopapel citado; semalterações nestaordem. ObstruçãoOwner encerrada. **BLOQUEADO pela contençãotécnica/confirmacãoadministrativaRender;0/29escritas.** ApósH2,revalidarsejanela mudou,declararliberaçãosegatesaprovados eaguardarautorizaçãoexplícitapara29. Relatório/recibos/comandos/falhas/limites em [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md). Históricoabaixopreservado;matriz/noveMVPs intactos.

---

# Liberação final 2B — BLOQUEADO — 24/10/2026

A — EXECUÇÃO PELO CODEX:011-P2B-J conferiu integridade local do manifesto29/backup/Rules/fontes testadas; aprovada. B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:011-P2B-H1 ainda sem confirmação funcional/acordo do segundoOwner e sem evidência administrativa de contenção ou impossibilidade de escrita do backend relevante. Sem nova auditoria/Biblioteca/exclusão; somente esses impedimentos conhecidos.

Próxima ação mínima:H1; depois executar preflight somente leitura, declarar liberação se todos os gates passarem e aguardar autorização explícita antes de29gravações. Versões/identidade remotas atuais não revalidadas porque a janela não está comprovada. Zero escritas/alterações externas; evidência167+AuthSDK anterior reutilizada, sem novos testes. Detalhes/arquivos/comandos/limites em [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md). Histórico abaixo preservado; demais riscos e posição dos noveMVPs intactos.

---

# Atualização 2B — concorrência e pendências administrativas — 24/10/2026

Contenção de escritores continua **não comprovada**;0/29operações reais. Por orientação mais recente, investigação/desativação Render e hospedagem antiga ficam pendentes para o fim da construção, sem bloquear trabalho local independente e sem autorizar exclusões futuras. EstadoRender/ID/runtime não confirmados; segundo Owner é usuário, função/necessidade/acordo ainda desconhecidos. Nenhum escritor remoto contido nesta sessão. Não fechar risco por adiamento nem presumir autorização da migração nesta preparação.

Redução local: transação confere57caminhos em cada fase; updateTime/exists:false e journal com versões retornadas evitam sobrescrita silenciosa. Risco residual: interrupção/estado parcial entre fases, resposta perdida exige recuperação dirigida; Admin/Owner pode escrever depois. Próxima decisão necessária antes de executar29: janela administrativa comprovada, tratamento específico dos escritores relevantes adiados, revalidação de versões/cópia/identidade e instrução expressa de retomada. Sem nova auditoria ampla da Biblioteca. Detalhes/limites no [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md). Demais riscos/estados preservados.

---

# Complemento2B — escritores inspecionados; migração bloqueada pela precondição7 — 24/10/2026

A — EXECUÇÃO PELO CODEX:011-P2B-F concluído na inspeção exclusivamente de leitura. IAM confirma associação atual dobackendfull histórico e2usuáriosOwner; definições dospapéis403. CatálogoantigoPages200,bundle apontapara bancorestaurante/Render;Renderhealthtimeout,não prova desativação. Logs24hsemresultados,não prova contenção. Processos/agendamentos visíveis semescritor observado,crontabprivado inacessível. BibliotecaPages176deployments/configuração publicada não comprovada. B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:011-P2B-H1 parcial; afirmação dejanelacomúnicoexecutor recebida,mas suspensões/acordo comsegundaidentidade/externos não comprovados. Tabela,evidências,comandos,limites,arquivos eprocedimento no [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md).

**Estado:0atualizações/0criações/0fases;contenção não comprovada,011-P2B-C/D não iniciados.** Próxima ação exata:comprovar estado administrativo doRender eacordo dasegundaidentidadeOwner,resolver automações/externos desconhecidos oupreparar contenção específica comimpacto/reversão;nenhuma alteraçãoIAM/Rules/serviços autorizada nesta inspeção. Revalidarversões na retomada. JS-01–07/JS-08preservados,JS-09aguarda gate. SemParte3,Auth,índices,deploy,commit,push,exclusão. Riscos em docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md;espelhoexternoausente,nãorecriado.

---

> Histórico anterior preservado; o complemento2B acima atualiza a contenção.

# Ordem011 — Parte2B autorizada; aplicação aguardando contenção — 24/10/2026

Autorização específica recebida para12atualizações/17criações,29caminhos do manifesto2A em bancorestaurante/(default)/loja-demo. Conferência automatizada20:22:00–20:22:34 America/Sao_Paulo: hashes/cópia/fontes íntegros,mesma identidadeADC,40existentes iguais emcampos/updateTime e17alvos ausentes,zero divergências. **Zero escritas e zero fases aplicadas; revisão/projeções continuam ausentes.** Falta confirmação verificável da contenção de escritores administrativos,item4.7 da ordem; autorização não é evidência de contenção.

A — EXECUÇÃO PELO CODEX:011-P2B-A/B concluídos na conferência;C/D aguardam H1;E registra/valida documentação. B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO:011-P2B-H1 pendente,informar escritores/painéis/scripts/pessoas pausados e manutenção da janela até verificação. Detalhes,arquivos,comandos,falhaDNS resolvida,tempo/limites e recuperação no [relatório2B](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2B.md). Próxima ação exata:receber H1,revalidar versões e aplicar somente as cinco fases aprovadas com autorização privada/journal. Não corrigir divergência fora do manifesto. JS-01–07/limitesJS-08 preservados;JS-09 em precondições2B. Índices/Auth/Parte3/Pages separados,nãoexecutados;sem commit/push/deploy/exclusão. Espelho externo ausente,nãorecriado.

Estado oficial: contenção de escritores privilegiados **PENDENTE**, impede primeira escrita2B. Gates de hashes/identidade/versões aprovados somente na janela citada; proteção/retomada/homologação e demais riscos anteriores não encerrados.

---

> Histórico anterior preservado; a entrada011/Parte2B acima prevalece no seu escopo.

# Status oficial — Ordem011/Parte2A — 24/10/2026

**R-004 permanece ABERTO para vínculos/endereço/histórico:**4clientes semUID comprovado,2endereços incompletos,15pedidos intactos;nenhumvínculo/pagamento/snapshot fabricado. Gate dasdecisões comerciais desta2A ATENDIDO:9ativos disponíveis/2inativos indisponíveis,preços mantidos,Pix/dinheiro/crédito/débito eidentidade/valores existentes explicitamente confirmados. Não significa WhatsApp/endereço/visual/histórico homologados.

**R-005 permanece ABERTO:**gateRules010 preservado;5índices ausentes comprovados porExplain,nenhumcriado. Automáticos padrãoREADY/2consultas deigualdades mescladas confirmados;lacuna anterior400corrigida noescopo. Anônimo DESATIVADO segundo observação manual doproprietário,habilitação exige ato próprio. Email/senha habilitado,3contasativas/1admin/2clientes preservados,Pagesausente/hostfinalpendente,trava deprodução preservada. Projeções/revisão aindaausentes noreal;preparo2A/simulação não éhomologação/disponibilidade/aceite.

**R-009/gatesderecuperação permanecem ABERTOS:**backup010correspondente àleitura dirigida40/17,SHA256 e restauração/migração166Emulator+AuthSDKcomprovados;sem snapshot/Authrestaurável/segundacópia criptografada/corteprivilegiado comprovados. IdentidadeADC conferida privadamente,permissão deescrita nuncaexercitada. Resposta privadaP1 contémcampohashConfig:valoresnão inspecionados/reproduzidos,arquivo0600/ignoradoGit preservado;novas consultas eutilitárioP1 usam máscara/allowlist paraevitarrecoleta. Não há evidência deexposição pública nestaetapa,nãoapagar evidência paraocultar achado;protegerretenção/cópias privadas.

B-03ABERTO/bloqueado;B-04poretapas,semsemanaatômica. Parte2Aconcluída na preparação;nenhumaautorização2B/criaçãoreal/alteraçãoAuth/índice/deploy/Parte3/4. [Relatório eprovas](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_2A.md). Próximoato:2Bsomente29caminhos/hash e gatescorrespondentes;índices/Auth/homologação/Pages separados.

---

> Histórico anterior preservado; a entrada011/Parte2A acima prevalece no seu escopo.

# Status oficial de riscos — Ordem011/Parte 1 — 24/10/2026

**R-004 permanece ABERTO:**4clientes semcorrespondência porIDAuth,2endereços incompletos e15pedidos preservados;nenhumvínculo/pagamento/snapshot inferido. Loja/11produtos ainda exigemadaptação;identidadepública,disponibilidade e cartões dependem deescolha comercial. Achado011:Reactexpandecartao=trueparacrédito/débito;candidato contémdesabilitaçãoexpressa atédecisão,não aplicarautomaticamente.

**R-005 permanece ABERTO,gateRules jáatendido010:**0 índicescompostos reais confirmadosnovamente;exceçõesdecampoúnicoHTTP400/nãoconclusivas;Auth e-mail/senha habilitado,anônimo inconclusivo,domínio Pages ausente.3 Authativos/1admin/2clientes documentados;appWeb comcampos obrigatórios,semprova delogin/build remoto. Projeções/revisão ausentes,não criadasaqui. Trava production+bancorestaurante preservada. Homologação/abuso/configuração/publicação/aceite não atendidos.

**R-009/gatesderecuperação permanecem ABERTOS:**40 documentos/cópia 010correspondentes àleitura011,SHA256conferido e restauração40+ensaio139Emulatoraprovados. Isso atende opreparo localP1,sem snapshot/Authrecuperável/segunda cópia criptografada/corte comprovado de escritores Admin/Console. Verificarversões/gatesconformeimpacto antesdoato futuro. Não inventariados consumidoresprivilegiados emexecução.

B-03ABERTO/bloqueado;B-04resolvidolocalmente poretapas,sem semana atômica nemhomologaçãoreal. **Parte 1 concluída somente na preparação**,manifesto de 29 caminhos condicionais;Partes2–4não iniciadas. Nenhuma escritareal/deploy. [Relatório/evidências](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_011_PARTE_1.md). Estadosnovos aquinão são baixa de risco por ensaio/comprovação defonte.

---

> Histórico anterior preservado; a entrada011/P1 acima prevalece no seu escopo.

# Estado oficial — Rules publicadas e fonte conferida — 24/10/2026

**R-005/configuração real: gate da publicação da fonte Rules ATENDIDO; risco geral permanece ABERTO.** Publicação manual do proprietário em bancorestaurante/(default), release atualizada às 16:04:44 e conferência remota às 16:06:28. Fonte comercial414 linhas equivalente ao arquivo aprovado: a única diferença é ausência deLF final noConsole, comprovada porSHA256 do arquivo local sem esse byte. AsRules escolares foram substituídas. Não houve republicação ou alteração remota pelo Codex.

Ainda ABERTOS: adaptação dos dados/configuração, projeções/revisão, índices READY/Auth/domínios, configuração de produção, fluxos reais/recuperação/abuso e homologação comercial. Inventário anterior40/0 compostos/projeções ausentes é evidência histórica, não nova leitura de estado. Permanecem lacunasR-004 de titularidade/histórico/endereço e gatesR-009 de preservação/recuperação. Backup local validado não é backup Auth/snapshot/segunda cópia segura. Nada disso recebe baixa por publicação das Rules.

**B-03 continua ABERTO e bloqueado:** não desativar/excluir categorias, inclusive vazias. B-04 permanece resolvido LOCALMENTE por etapas, sem promessa de semana atômica ou homologação real. As147 React+8 suites da preparação anterior não são testes novos nesta conferência documental.

Impacto de consumidores antigos: aplicações que dependiam das permissões escolares em bancorestaurante podem estar sem acesso. Biblioteca local aponta biblioteca-riachuelo; versões hospedadas/cópias antigas não atestadas. Não restaurar permissões escolares nem relaxar segurança para preservar compatibilidade antiga. Confirmar incidentes de consumidores independentes e isolá-los no seu alvo próprio se necessário, sem mudança nesta ordem. EscritoresAdmin/Console ignoramRules e continuam uma dependência de integridade antes de abrir compras.

[Recibo remoto](ADAPTACAO_SERVERLESS/ORDEM_010_RULES_PUBLICADAS_EVIDENCIAS.json) e [relatório010](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_010.md). Catálogo JS oficial, sem backend Express/Render.011 não iniciada; nenhum novo ato remoto autorizado.

---

> Histórico anterior preservado; esta confirmação de publicação010 prevalece no escopo indicado.

# Riscos oficiais — Rules definitivas preparadas010 — 24/10/2026

R-005/configuração publicada continua ABERTO: fonte comercial completa revalidada localmente (147React+8 suitesSDK/Rules/navegador), sem publicação. `.firebaserc` local agora aponta bancorestaurante; firebase.json aponta aRules correta. Fonte idêntica008/B-04, sem enfraquecimento. Isso não fecha permissões/configuração remota nem homologação/aceite.

Dependência de consumidores delimitada: Software Biblioteca local usa biblioteca-riachuelo e não revelou referência a bancorestaurante no código consultado. Nenhum conflito compartilhado ativo confirmado; implantações/cópias antigas não foram atestadas, e escritoresAdmin/Console ignoramRules. Confirmar consumidores publicados/corte antes de substituição futura, sem obrigação de compatibilidade com o catálogo descontinuado e sem adaptarRulesescolares.

Continuam os gates de recuperação/segunda cópia segura, contaAuth, dados/configuração/projeções/revisão/índices/Auth reais (R-004/005/009 e dependências já registradas). B-03 permanece bloqueado; B-04 continua por etapas, sem atomicidade semanal. [AnexoRules](ADAPTACAO_SERVERLESS/PREPARACAO_RULES_DEFINITIVAS_010.md) e [recibo](ADAPTACAO_SERVERLESS/ORDEM_010_RULES_EVIDENCIAS.json). Sem baixa de risco por testes locais, sem mudança real/011.

---

> Histórico anterior preservado; esta preparação010 atualiza somente seu escopo.

# Estado oficial — continuação010, leitura real — 24/10/2026

**Gate de publicação/configuração real permanece ABERTO (R-005 e dependências de consumidores/recuperação):** Rules reais de biblioteca escolar, sem lojas; origem/consumidores/escritores ainda não identificados. A ausência de coleções escolares na descoberta não prova ausência de consumidores. Não substituir política nem ampliar privilégios até esclarecer o impacto e autorizar ato/alvo011.0 índices compostos/projeções/revisão observados; bootstrap/READY seguem pendentes.

**R-004/vínculos e histórico permanece ABERTO:**4 clientes sem correspondência porID com3 Auth;2 endereços sem número/UF;7 pedidos atuais (4 sem clienteId,3 ligados a IDs antigos,0 UIDAuth) e8 resumos arquivados preservados;6 sem pagamento e7 sem snapshotcliente. Não expor histórico ou atribuir titularidade/pagamento por suposição. Configuração comercial usa schema incompatível; projetor bruto perderia frete/horários. Identidade pública, cartões e disponibilidade precisam decisão válida.

**Recuperação de documentos comprovada SOMENTE LOCALMENTE:**40/40 campos-documentos iguais, SHA256 e fixture tipada aprovados no Emulator. Isso reduz a lacuna de recuperação local; não encerra proteção de dados/contas nem autoriza destruição. Sem backup recuperávelAuth, snapshot transacional, restauração de timestamps de sistema/Storage/IAM ou segunda cópia criptografada comprovada. PITR desativado, janela de versões3600s observada; não alterada. R-009 e demais gates remotos mantidos. DomínioPages ausente da configuraçãoAuth lida; emails0/3 verificados, sem mudança/aceite implícito; validade do login remoto ainda não homologada.

B-03 permanece ABERTO/bloqueado e B-04 resolvido LOCALMENTE por etapas; nenhuma baixa adicional.12 verificações fictícias/Rules locais, incluindo checkout/isolamento, não comprovam fluxo publicado. Leituras reais autorizadas executadas, sem mutações. [Inventário](ADAPTACAO_SERVERLESS/INVENTARIO_FIREBASE_REAL.md), [recuperação](ADAPTACAO_SERVERLESS/PLANO_BACKUP_RECUPERACAO.md), [relatório010](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_010.md). Próxima ação: esclarecer consumidor/publicador escolar e revisar proposta antes de definir011;011 não iniciada.

---

> Histórico anterior preservado; a continuação010 acima prevalece no escopo indicado.

# Ordem010 — atualização oficial dos gates — 24/10/2026

Compatibilidade operacional com o catálogo antigo deixa de ser requisito por decisão expressa; não é mais gate comercial nem motivo para manter backend/Rules/infraestrutura legados. Isso não fecha riscos de perda de dados ou autoria/isolamento: inventário real, backup recuperável, transformação de dados úteis/contas/histórico, contenção de escritores e recuperação continuam pendentes. Nenhuma conta/projeto real consultado ou modificado010.

B-03 permanece ABERTO e desativação/exclusão de categorias bloqueadas; B-04 RESOLVIDO LOCALMENTE por etapas, sem atomicidade semanal; B-02 somente local. Nenhum risco R anterior recebe baixa. Índice público produtos ativo/categoriaId/preco foi preparado localmente, sem prova READY/consulta remota. Trava production+bancorestaurante permanece, requer correção/testes específicos antes da release. Política real/dados/índices/Auth/domínios/admins, proteção contra abuso, recuperação, versão/rollback e root Pages frontend seguem gates.

JS-09/010: preparação local, homologação real e aceite comercial PENDENTES. Mutação Firebase, exclusão real, publicação/deploy e desligamento remoto somente011 especificamente autorizada, não iniciada. O legado pode ser descontinuado sem preservar disponibilidade; o arquivo histórico permanece. Não apagar contas/pedidos/credenciais sem impacto identificado. Espelho externo ausente/não recriado. Próxima tarefa exata JS-09-C1/010-C no plano único.

---

> Histórico anterior preservado; entrada010 prevalece no escopo atual.

# Ordem009 — estado oficial dos riscos —24/10/2026

**B-03 permanece ABERTO, operação bloqueada com segurança.** Não permitir desativação ou exclusão de categoria, inclusive vazia; contagem informativa não prova ausência de vínculos nas Rules. Efeito comercial: administrador cria/edita/reordena/reativa categorias e move/desativa produtos, mas não remove/desativa categorias. A009 admite encerramento local com essa restrição documentada; não há aceite comercial implícito. Não transferir um bloqueador do escopo comercial habilitado ao pós-MVP. Metadados/contadores exigiriam bootstrap e protocolo de todos os escritores/importadores; não implementados para liberar exclusão.

**B-04 continua RESOLVIDO LOCALMENTE pelo caminho em etapas.** Falha parcial/formulário/revisão/projeção e checkout50 revalidados009; semana inteira não é atômica. B-02 continua resolvido somente localmente. Nenhum estado/gravidadeR-005/006/009/024 ou outro risco remoto recebe baixa por associação.

Gates concretos remanescentes: projetoDemo bancorestaurante é recusado em production por proteção herdada, homologacao/full exige flags explícitas; não remover trava por conveniência. Projeto real compartilhado exige revisão de Rules/consumidores/importações, inicialização segura das projeções/revisões, índicesREADY, provedores/domíniosAuth/admins e dados fictícios aprovados. Git atual não tem arquivos rastreados/commit-base; release e rollback remoto precisam identificação própria. Root remotoPages antigo demo precisa conferência/migração autorizada para frontend. Retenção de tentativas/nonce, recuperação, abuso/desempenho/custos e suporte continuam gates correspondentes. [Checklist009](ADAPTACAO_SERVERLESS/CHECKLIST_HOMOLOGACAO.md) e relatório registram procedimento/limites, não novo ledger.

Falha intermediária009 do navegador de checkout: faltava aguardar catálogo/botão habilitado no harness; adicionada espera de total/endereço/estado comercial sem relaxar asserções. Resultado final/retomada no recibo009; preservar falha no histórico. Sem Firebase real, credencial, cliente real, commit/push/deploy/homologação/liberação comercial. Espelho externo ausente e não recriado.010 não iniciada.

---

> Histórico anterior preservado; a entrada009 acima prevalece.

# Continuação008/B-04 — resolvido localmente pela alternativa em etapas —24/10/2026

**B-04 de configuração008: RESOLVIDO LOCALMENTE no caminho autorizado por dia/grupos.** Os sete dias podem ser confirmados pelo serviço e pelo formulário real. A semana inteira não é atômica; cada transação preserva origem/projeção/revisão. Falha parcial real testada: confirma somente os dias/grupos já gravados, preserva formulário, mantém consistência pública e orienta conferir/retomar. Uma escrita concorrente antiga não sobrescreve a configuração recente; retomada explícita validada. Checkout e50produtos após salvar os horários aprovados. Evidências finais/limites/hashes no [recibo008/B-04](ADAPTACAO_SERVERLESS/ORDEM_008_B04_EVIDENCIAS.json).

Limitação mantida: lote integral de sete dias ainda ultrapassa1000expressões e é recusado sem parcial. Esta recusa permanece teste negativo; não conta como aprovação de atomicidade semanal. A solução não usa a candidata anteriormente rejeitada: ambas igualdades canônicas, autoridade, máscaras privadas e revisão monotônica foram preservadas. Risco operacional explícito: mais transações/leituras e possibilidade de interrupção entre dias/grupos; falha de rede pode deixar a última etapa sem confirmação, exigindo conferir o banco antes de retomar. Sem prometer rollback automático nem conclusão de etapa não confirmada.

**B-03 permanece ABERTO:** desativação/exclusão de categorias continuam bloqueadas, sem alterações nesta ordem. B-02 continua resolvido só localmente. R-005 e demais riscos remotos mantêm seus estados anteriores; testesEmulator não comprovam publicação, homologação remota ou liberação comercial.009 não iniciada; nenhuma credencial/dado real/operação remota/commit/push/deploy. Espelho externo ausente/não recriado. Histórico e recibo008 anterior preservados.

---

> Histórico anterior preservado; este registro continua a fonte exclusiva dos status.

# Ordem008 — PARCIAL LOCAL; B-04 de configuração —24/10/2026

**B-04 ABERTO no escopo da configuração008:** salvar todos os sete dias abertos09:00–18:00 numa transação válida excede1000expressões das Rules no Emulator. Impacto bloqueante para concluir008/configuração integral, sem afirmar impossibilidade geral do Firestore. Origem/projeção/revisão permanecem intactas na recusa; serviço informa409/B04_LIMITE_CONFIG e formulário preservado. Outros patches e um dia, dashboard/clientes/pedidos/WhatsApp têm evidência local. O B-04 histórico de privacidade003 foi resolvido naquele escopo; esta ocorrência é de orçamento na configuração008, sem desfazer a prova003.

As duas igualdades canônicas completas permanecem na política oficial. Revisão automática rejeitou a candidata de reduzir cálculo da origem quando a projeção muda, inclusive após prova finita120casos, por risco de afrouxamento e dependência do acoplamento entre documentos. Candidata não aplicada/executada. Próxima decisão é autorizar somente ensaio isolado descrito no diário, sem presumir segurança nem integração. Não contornar a rejeição nem dividir silenciosamente uma gravação atômica para cumprir contrato.

B-03 permanece aberta/bloqueada para desativação/exclusão de categorias, não tratada008. B-02 permanece resolvido apenas localmente. R-005/Rules/índices/ambiente real, R-006/IAM, R-009/retenção e recuperação, R-024/suporte e demais riscos remotos mantêm seus estados anteriores. [Recibo008](ADAPTACAO_SERVERLESS/ORDEM_008_EVIDENCIAS.json) discrimina testes e falha intermediária de regressão, sem converter asserção de recusa em aprovação da funcionalidade bloqueada.

Espelho externo /home/lucas/Documentos/lojaDemoRestaurante ausente/não recriado; importados preservados. .github ausente: npm/quality executáveis não provamCI remota. Sem Firebase real, dados/IAM/Auth/custos/painel, homologação/publicação/liberação comercial ou009. Riscos antigos ligados a Express/Render exigem reavaliação no ambienteSDK autorizado, sem baixa por associação.

---

> Histórico anterior preservado; este registro mantém a fonte exclusiva dos status.

# Ordem007 — atualização local de evidências — 23/10/2026

Lista/detalhe/transições/pagamentos administrativos implementados e testados no Emulator. [Recibo007](ADAPTACAO_SERVERLESS/ORDEM_007_EVIDENCIAS.json):144 React,152 SDK/Rules e21 navegador;486 regressões003–006,0 reprovações finais. Confirmados isolamento por loja, transições originais, campos financeiros históricos imutáveis, histórico atômico e recusa de decisão concorrente antiga. Pagamento é registro manual identificado, sem gateway/liquidação/estorno.

**B-03 permanece aberta**, desativação/exclusão de categorias bloqueadas, sem intervenção nesta ordem. **B-02 permanece resolvido apenas localmente.** R-005 continua aberto para publicação/homologação de Rules/índices/ambiente real, R-006 para IAM/credenciais, R-009 para retenção/recuperação e R-024 para suporte por equipe; testes de admin individual007 não encerram esses riscos. Demais status/gravidades preservados. JS-08 parcial: dashboard/clientes/configuração ainda não migrados. Firebase real, homologação/publicação e liberação comercial não realizados. Espelho externo ausente; TXT consolidado local atualizado, sem criação fora do escopo exclusivo. Nenhum novo bloqueio financeiro técnico foi necessário no escopo original testado; alterações inválidas e por pessoas sem autoridade são negadas, não omitidas de testes.

---

> Histórico anterior preservado.

# Ordem 006 — administração de catálogo por SDK — 23/10/2026

**Concluída no escopo local com restrição B-03.** Produtos: listagem paginada/filtro/detalhe/criação/edição/preço/disponibilidade/ativação/desativação e exclusão lógica pelo Firebase Web SDK. Categorias: listar/criar/editar/reativar; desativar/excluir continuam bloqueados no serviço e nas Rules, inclusive sem produtos. Nenhuma reconstrução de telas; rotas preservadas. Origem canônica/projeção pública/revisão monotônica são gravadas atomicamente com `salvarComProjecao`. Pedidos finalizados preservados e rascunho com preço antigo recusado. Sem Firebase real, publicação, liberação comercial, commit/push/deploy ou início da007. Dashboard, pedidos administrativos, clientes e configuração conservam seus contratos anteriores.

Evidências e arquivos: [diário](ADAPTACAO_SERVERLESS/DIARIO_DE_EXECUCAO.md) e [recibo006](ADAPTACAO_SERVERLESS/ORDEM_006_EVIDENCIAS.json). Próxima ação: proprietário revisar a entrega local e autorizar especificamente a Ordem007; não executar automaticamente. B-02 permanece resolvido somente localmente; B-03 permanece aberta nas operações perigosas. Riscos têm estado oficial em `docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md`.

Estado oficial: B-03 ABERTA para desativação/exclusão de categorias; contagem informativa não autoriza essas mutações. B-02 resolvida localmente, sem aceite remoto. Demais riscos/gates anteriores mantidos. Categoria vazia também não pode ser excluída nesta versão. Console/Admin SDK ignoram Rules: alterações avulsas não constituem gravador comercial seguro. Acesso admin real, migração/projeções/revisão inicial, índices de consultas reais, Rules remotas, desempenho/custos, homologação, rollback e liberação comercial seguem pendentes de atos específicos.

Ressalva de teste006: navegador004 teve timeout intermitente ao cadastrar endereço; fixture de entrega e esperas corrigidas, última execução passou72 SDK+24 navegador. Causa do timeout restante não comprovada; estabilidade do harness deve ser revista antes da homologação real, sem repetir auditoria geral nem considerar teste histórico como nova execução.

---

> Conteúdo anterior preservado como histórico; a posição acima prevalece.

# Ordem 005 — atualização oficial de B-02 — 23/10/2026

**B-02 RESOLVIDO LOCALMENTE** para o protocolo canônico protegido por revisão, na versão/hashes/ambiente do [recibo](ADAPTACAO_SERVERLESS/ORDEM_005_SINCRONIZACAO_EVIDENCIAS.json).105 verificações adversariais, pedidos reais SDK1/10/11/25/50, compra no checkout React, confirmação e retomada sem duplicata. Origem999/projeção100 negada; escritas comerciais atômicas com getAfter e invalidação por revisão impedem congelar preços velhos. R-005 permanece aberto para Rules/publicação/configuração remota; R-009 permanece aberto para retenção/recuperação/operação remota. Demais IDs e suas gravidades/status não recebem baixa por associação.

**B-03 INALTERADO:** exclusão/desativação de categoria vinculada continuam proibidas e testadas; não implementados contadores/novo admin. O produto real não foi habilitado/publicado/liberado comercialmente.

Limites explícitos: Console/Admin SDK bypassam Rules e exigem escritor/procedimento confiável equivalente; painel antigo/servidor preservado não está certificado como escritor desse protocolo. Nenhuma alteração real nesta ordem. Metadado de revisão inexistente mantém compra bloqueada. Novas tentativas parciais são privadas e não viram vendas; não há expurgo automático que reabra nonces. Custo de n+3 escritas e escala/abuso remotos continuam em seus gates. Espelho documental externo ausente, consolidado local atualizado. Evidência de implementação não substitui homologação/publicação/autorização externa.

---

> Posições anteriores abaixo são histórico; não substituem o resultado de23/10/2026.

# Ordem 005 / Biblioteca — evidência e posição vigente — 22/10/2026

**B-02 ABERTO. B-03 INALTERADO.** Novo ensaio parcial confirmou acumuladores de1/10/11/25/50 no Emulator por validação incremental, mas reproduziu preço desatualizado: fonte100 versus origem999, resultado100 aceito. A divergência impede liberar criação comercial. Campos financeiros/entrega/nonce completos ainda sem prova; não confundir52 escritas do ensaio50 com compra real. Rules oficiais continuam bloqueando toda criação de pedido e marcador pelo cliente.

Cloud Functions/finalizador servidor/Express/Render/API estão cancelados como alternativa autorizada pela nova decisão. Propostas anteriores permanecem apenas no histórico. Não foi introduzido banco/framework/servidor nem alterado Firebase real. R-005/R-009 e demais status remotos não recebem baixa; B-03 não foi reaberto/solucionado por associação. Próximo mínimo técnico ainda na005: eliminar divergência por sincronização canônica atômica e depois exigir contrato comercial/recuperação integral, sem006.

[Referência, protocolo e limites](ADAPTACAO_SERVERLESS/MATRIZ_MIGRACAO.md), [testes reais e arquivos](ADAPTACAO_SERVERLESS/ORDEM_005_BIBLIOTECA_EVIDENCIAS.json). A candidata é exclusivamente quality e NÃO PUBLICAR.

---

## Histórico anterior preservado

# Continuação Ordem 005 — B-02 permanece aberto após projeção testada — 22/10/2026

**B-02 ABERTO:** fonte comercial de uma leitura, bloqueada a compradores, não bastou. Provas SDK no Emulator: parcial com DTO permitiu1 e recusou10/11/25/50 por1000 expressões; mínima permitiu1/10/11, recusou25/50 pelo mesmo motivo. Batch/transação50 também negados. São políticas parciais isoladas, nunca implantadas no produto; fonte semeada por Admin no Emulator não comprova manutenção administrativa canônica. Nenhuma compra comercial foi criada/liberada.

Política oficial preservada:70 verificações SDK de consultas/bloqueio, incluindo1/10/11/25/50, entrega/retirada, preço/quantidade/taxa/desconto/total/loja/UID/status/pagamento adulterados, duas tentativas concorrentes e produto realmente lido antes de alteração. Todos os novos creates negados, sem alegar validação semântica integral ou idempotência funcional. Regressões e builds aprovados conforme diário. R-005/R-009 e demais riscos remotos não fechados.

**B-03 inalterado:** exclusão/desativação de categoria vinculada não foi liberada ou migrada. Nenhuma permissão/admin/regra oficial foi alterada. Proposta mínima para B-02: exceção somente de finalização financeira em executor confiável reaproveitando código preservado; exige decisão explícita sobre exclusividadeSDK e posteriores autorizações por ato. Sem essa decisão/prova integral alternativa, manter bloqueio/Ordem005 parcial, sem006/produção. [Evidências e limites](ADAPTACAO_SERVERLESS/DIARIO_DE_EXECUCAO.md).

---

## Histórico anterior preservado

# Ordem 005 — B-02 comprovado, sem liberação de criação — 22/10/2026

B-02 **permanece aberto**: prova real isolada permitiu10 leituras e recusou11/50, transação50 e batch11; houve limite1000 expressões no ensaio50. R-005/R-009 e demais riscos permanecem com status anteriores, sem baixa por proposta. B-03 não alterado; nenhuma categoria foi excluída/desativada. A migração está parcial:47 verificações SDK/segurança e19 navegador validaram consultas próprias/prévia/bloqueio, não criação comercial. Pedidos presentes nos testes foram semeados por Admin exclusivamente no Emulator; novos pedidos pelo cliente=0.

Todas as escritas em pedidos/idempotencia continuam negadas. Bloqueio na UI não é a barreira de segurança: os ataques diretos Web SDK foram recusados pelas Rules. Leituras e recuperação de marcadores exigem titularidade e loja. Novo orçamento/projeção comercial é candidato dependente de decisão e testes, não solução adotada. Não há Functions, API nova, dado real ou publicação. R-002/R-004 continuam pendentes de homologação/vínculo real. Não fechar riscos de abuso, revogação, custos, índices/publicação ou recuperação remota por testes locais.

Detalhes/proposta em [matriz](ADAPTACAO_SERVERLESS/MATRIZ_MIGRACAO.md), [execução](ADAPTACAO_SERVERLESS/DIARIO_DE_EXECUCAO.md). Próxima ação é continuar a Ordem005/B-02 com decisão específica de contrato; não iniciar Ordem006. Fonte única de status continua o registro oficial de ressalvas; histórico preservado.

---

## Histórico anterior preservado

# Ordem 004 — evidência privada local, sem baixa de riscos remotos — 22/10/2026

Auth existente reaproveitado e perfil/endereços ligados ao Web SDK; política privada local validando titularidade, schema e autoridade imutável. Gate local aprovado:72 SDK/Rules privadas,24 navegador conta,131 React,94+14 catálogo e builds. Resultado integrado final no [diário](ADAPTACAO_SERVERLESS/DIARIO_DE_EXECUCAO.md). **R-002 (Auth/domínios), R-004 (IDs legados), R-005 (publicação Rules) e demais riscos permanecem com seus status oficiais anteriores.** Não foi executada operação em bancorestaurante, migração de documentos, publicação ou homologação comercial. Reset no Emulator comprova emissão da ação local, não entrega de e-mail real. Cliente sem documento em usuarios não recebe autoridade; não há criação automática de admin.

Limites: get próprio em usuarios é somente individual e sem escrita; consumidor mantém documentos próprios separados por loja; administrador não recebe leitura genérica de clientes nem acesso à outra loja. Registro de autoridade existente exige ativo=true, role reconhecida e vínculo da loja; sessão anônima administrativa negada. IDs legados sem vínculo UID continuam inacessíveis até tratamento autorizado. Bloqueadores B-02/B-03 e necessidade futura de usar salvarComProjecao nas mutações do painel preservados. Nenhum contador/risco fechado por conveniência.

Operações protegidas e publicação continuam não autorizadas. Frontend, Rules e dados publicados devem ser correspondentes antes de alegar disponibilidade. Histórico e status normativo permanecem abaixo.

---

## Histórico anterior preservado

# Ordem 003 — evidência local nova, sem baixa de riscos remotos — 21/10/2026

**R-005 permanece aberto.** Privacidade do catálogo e atualização atômica foram aprovadas exclusivamente no Emulator: 94 verificações SDK/Rules, 14 navegador integrado, 123 React; build aprovado. Projeção separada com campos/tipos explícitos; `segredo` ausente do documento/listagem brutos. Não é apenas filtragem no React. Rules locais já têm política de catálogo; não foram publicadas nem aplicadas a bancorestaurante.

B-04 local resolvido após autorização expressa já recebida, sem novo pedido. B-02/B-03 permanecem pendentes; categoria existente não muda ativo e não há exclusão física. Painel será ligado ao gravador na etapa administrativa existente; mudanças privilegiadas por fora dele não têm gatilho automático nesta arquitetura e exigem procedimento autorizado. Nenhum risco permanente fechado ou ID novo: baseline de 25 IDs/16 abertos/nove locais mantido; comercial NO-GO. [Detalhes técnicos](ADAPTACAO_SERVERLESS/MATRIZ_MIGRACAO.md), [execução](ADAPTACAO_SERVERLESS/DIARIO_DE_EXECUCAO.md).

---

## Histórico anterior preservado

# Ordem 003 — evidência nova de R-005 — 21/10/2026

R-005 continua aberto: candidata local de Rules permitiu listar campo extra reservado de produto fictício ativo, mesmo negando get individual. Teste permanente reproduz a presença efetiva da chave, SDK13.0.0/Emulator1.22.0; 44 verificações aprovadas antes da reprovação. Nenhum segredo real foi usado. Regressões React118/build aprovados não substituem esse gate. Rules oficiais locais deny-all; candidata preservada apenas em quality/fixtures e não publicada.

B-04 é identificador de evidência na adaptação, sem novo ID permanente/status concorrente. Proposta mínima de projeção pública separada aguarda autorização por alterar a organização dos documentos; nenhum schema/dado real criado. Ordem003/MVP-002 não concluídos. B-02/B-03 e demais riscos permanecem como registrados; contagem de 25 IDs/16 abertos/nove locais preservada. [Resultado e proposta](ADAPTACAO_SERVERLESS/RISCOS_E_BLOQUEIOS.md).

---

# Atualização de escopo — Ordem 002 — 21/10/2026

Direção vigente Web SDK/Rules, sem Functions/API intermediária/Express operacional planejados. Nenhum ID de risco encerrado por esta preparação. R-005: deny-all local exige implementação/testes antes de acesso SDK; projeções não são permissões por campo. R-005/009: limite atual de 50 produtos/documentos separados impede a validação direta proposta do pedido com paridade integral (B-02). R-005: excluir/desativar categoria depende de consulta de ausência de vínculos não disponível nas Rules no schema atual (B-03). Manter dependentes bloqueados até decisão/prova, sem criar alternativa arquitetural automaticamente.

Transições finitas de status/financeiro e dados próprios são candidatos a SDK/Rules; não exigir servidor sem impedimento específico. Git isolado e .gitignore preparado resolvem a pendência de isolamento local, sem importar histórico ou fechar gates de segurança. [Evidências/soluções mínimas](ADAPTACAO_SERVERLESS/RISCOS_E_BLOQUEIOS.md), [matriz](ADAPTACAO_SERVERLESS/MATRIZ_MIGRACAO.md). Nenhum dado, conta, Rule/índice/IAM remoto alterado; comercial continua NO-GO. Baseline de 25 IDs/16 abertos/nove locais preservado, sem nova auditoria geral ou baixa automática. R-025 segue seu encerramento local histórico; não presume credenciais externas usadas/rotacionadas nesta sessão.

---

# Atualização de escopo dos riscos — cópia serverless — 21/10/2026

Ordem 001 documental, sem fechamento de qualquer ID. Mantida a contagem histórica: 25 IDs, 16 abertos/nove resolvidos localmente, sem transferir aprovação local para a arquitetura serverless. Status por ID permanece neste arquivo; [RISCOS_E_BLOQUEIOS](ADAPTACAO_SERVERLESS/RISCOS_E_BLOQUEIOS.md) apenas detalha o impacto e soluções propostas.

R-005: deny-all confirmado somente na fonte local; acesso SDK requer desenho/teste antes de publicação. R-003/005: projeções Express não equivalem a leitura direta de documentos inteiros. R-001/002/006/007/023: Auth/ativo/revogação/admin/abuso exigem equivalência na nova entrada. R-009/017: preservar transação, nonce e recuperação do pedido. R-011: Java ausente no PATH atual; não afirmar nova execução de Emulator. R-012/013: faturamento/Functions, ambiente bancorestaurante/produção e builds com URL Render dependem de decisão/testes posteriores. R-025: dois arquivos ativos reservados e toda árvore de backups externos não foram importados; não foram usados, exibidos, rotacionados ou considerados resolvidos.

Bloqueios de preparação: Git da cópia não isolado (descobre pai, sem HEAD/remote utilizável); cinco arquivos ocultos só no original. Nenhum dado/Rules/índice/IAM remoto consultado ou alterado nesta ordem. Liberação comercial da adaptação: NO-GO. Próxima atividade proposta: Ordem 002 / Etapa 01, sem iniciá-la.

---

>19/10/2026 — Migração965ecb2autorizada com parada antesdocorte se não houver rollback/sequência segura. Primeira ação manualAutoOff/operador/rollbackpendente,semchave/corte. CanalRenderdoCodexnãoautenticado;recuperação operacional deve estar assegurada antes503. Não altera16riscos abertos. [Estado](MVP_02_RELATORIO.md).

>19/10/2026 — H2 consulta concluída;rollbackdep-db8e6r8u01pc73ff7np0 e configuração registrados. Candidata965ecb2 prepara leitura única de bootstrap anteshealth,15testes focados simulados aprovados;sem leitura Firebase real. Instalação/deploy/recuperação aguardam aprovação específica,16ressalvas abertas mantidas. Não certificar R-006/007/023resolvidas antes integração. [Escopo](MVP_02_RELATORIO.md).

>19/10/2026 — fonte candidata full publicada em branch dedicada267abb3,semdeploy/segredo;main/readonlypreservadas. Não encerra16ressalvas;R-006 aguardauso credencial/integracao,R-007/023gatespreservados. Build/start/health/IDrollbackpendentes para janela. [Registro](MVP_02_RELATORIO.md).

>19/10/2026: candidata local267abb3 validada13/13 e sem chave/bootstrap seguro; push depende de confirmação de nenhum autodeploy Render. Sem publicação/integração real; R-006/007/023 e16riscos abertos preservados. [Estado](MVP_02_RELATORIO.md).

>19/10/2026 — catálogo anônimo do full em bancorestaurante agora exige allowlist de lojas; candidata02 usa[]/503 sem leitura,3testes novos. Não certifica integrações/proteção remotas nem encerra R-005/006/007/023. Fonte full não publicada, rollback/configuração e autorizações Render pendentes; chave condicional não gerada.16ressalvas abertas preservadas. [Janela](MVP_02_RELATORIO.md).

>19/10/2026 — Hobby confirmado; preparação Secret File/caminho fixo12+8testes aprovados, sem chave/montagem/deploy. R-006 permanece aberta até uso real e controles da credencial; R-005/007/023 e demais gates não encerrados.25IDs/16abertos/nove locais preservados. [Procedimento](MVP_02_RELATORIO.md#secret-file-no-render-hobby--preparação-sem-execução).

>19/10/2026 — H7 comprovada: uma binding customizada sem condição e sete CAN_ACCESS no projeto; não é autenticação do Render nem teste SDK/dados. R-006 continua aberta até credencial/montagem/uso efetivos; R-007/023 e demais gates inalterados. OIDC GCP agora documentado no Render Pro+; plano workspace e rollback real aguardam leitura H2.25IDs/16abertos/nove locais preservados. Meta60min não encerra risco. [Relatório atual](MVP_02_RELATORIO.md).

> H7 —19/10/2026: associação única autorizada para execução manual, não executada/confirmada. Policy atual200 sem vínculo; IAM conta/papel403 SERVICE_DISABLED; conferência final no painel antes de salvar. R-006 e16ressalvas abertas mantidas. Sem credencial/Render/deploy. [Estado/instruções](MVP_02_RELATORIO.md).

> Revalidação C1 após H6 — 19/10/2026: sete CANNOT_ACCESS no projeto, falta de Allow; Deny NOT_DENIED/PAB NOT_ENFORCED. Sem concessão identificada. R-006 permanece aberta; definição/policy SA com leitura atual limitada por403 IAM SERVICE_DISABLED; H7 não autorizada. Não fecha gates de isolamento/credenciais/integração.25 IDs/16abertos/nove locais preservados. [Relatório e limites](MVP_02_RELATORIO.md).

> H6 — 18/10/2026: API ENABLED, diagnóstico v3beta no projeto retornou7/7CANNOT_ACCESS (AllowNOT_GRANTED/DenyNOT_DENIED); sem bindings diretas à SA, públicas/grupos/domínios/principalSets e parent no projeto lido. PAB sem bloco retornado; não certificar ausência universal de privilégios/restrições. R-006 segue aberta, autenticação/montagem/integração pendentes. H7 apenas proposta de uma associação no projeto/sem condição/sem expiração, aguardando aprovação; nada concedido.25IDs/16abertos/nove locais mantidos. [Matriz/escopo](MVP_02_RELATORIO.md).

> H5 validada — 18/10/2026: papel real projects/bancorestaurante/roles/catalogosBackendFull, GA/habilitado, sete permissões exatas, sem extras. Sem binding direta da SA no projeto/conta; sem grupos/domínios/principalSets públicos na policy e sem parent no metadado do projeto. Acesso efetivo completo segue inconclusivo: Policy Troubleshooter403/SERVICE_DISABLED, inclusive quota explícita bancorestaurante. R-006 permanece aberta; H6 apenas proposta de habilitar API diagnóstica, não autorizada; escopo de eventual concessão de projeto explicitado, não aprovado/aplicado.25IDs/16abertos/nove locais mantidos. [Diagnóstico](MVP_02_RELATORIO.md).

> H5 — 18/10/2026: revisão do papel candidato concluída, sete permissões justificadas no backend completo e SUPPORTED/GA no projeto. Criação somente da definição autorizada condicionalmente, condição satisfeita; aguarda execução manual. Nenhuma associação/permissão efetiva/chave concedida; limitações de escopo/herança/Troubleshooter403 mantidas antes de binding.25IDs/16abertos/nove locais preservados. [Conferência e passos](MVP_02_RELATORIO.md).

> H4/identidade real — 18/10/2026: conta [identidade técnica histórica; referência integral preservada localmente] criada pelo proprietário às17h42 e verificada habilitada/zero chavesUSER_MANAGED. Modelo/ID aceitos,11testes configuração/loader aprovados. Sem bindings diretas na policy projeto eSA; Troubleshooter403 **não permite certificar acesso efetivo zero**, heranças/grupos/recursos não integralmente avaliados. R-006 permanece aberta. H5 proposta para definir papel customizado somente, sem binding/chave, aguarda autorização específica.25IDs/16abertos/nove locais mantidos. [Relatório](MVP_02_RELATORIO.md).

> MVP-02-H2 — 18/10/2026: inventário manual recebido (Node/Free/Oregon/On Commit/4dbc919; sem secret/grupo; rollback anterior visível), com valores ilegíveis pendentes. Inspeção do commit mínimo mostrou ausência legítima do seletor runtime e recusa de env Firebase: não adicionar credencial/config agora. R-006: SA full proposta não localizada por GET404, matriz customizada de sete permissões preparada, não concedida; criação somente da identidade aguardando autorizaçãoH4. R-007/023 e dados/contrato/índices/retention/custos continuam gates.25IDs/16abertos/nove resolvidos localmente mantidos, sem baixa automática por painel ou proposta. [Resultados](MVP_02_RELATORIO.md).

> MVP-02-H1 — 18/10/2026: proprietário descartou segundo serviço; preparar somente catalogos-api-homolog existente. **25IDs/16abertos/nove resolvidos localmente mantidos.** Nova leitura autenticada restrita confirmou fonte Rules remota normalizada idêntica ao deny-all local (ruleset c6f0772e-8dba-4b9e-911c-cc99edd4b2d9, updateTime2026-10-15T13:01:55.188438Z): evidência antiga de Rules abertas foi superada quanto à fonte publicada, sem encerramento automático R-005; IAM/negações remotas ainda pendentes. Índices compostos0, contra sete locais; disponibilidade ausente nos11produtos, DTO full com9candidatos recusado pelo React, loja sem ativo explícito; dados/publicação não aprovados. R-006/007/023 e custos/plano/rollback efetivos continuam pendentes. [Resultados, quatro regressões novas e H2 de leitura Render](MVP_02_RELATORIO.md). Nenhuma mudança remota.

> Atualização de evidências — 18/10/2026: MVP-01 concluída/publicada/homologada pelo proprietário; [relatório final](MVP_01_RELATORIO.md). MVP-02 A1–A4 locais:344 backend/oito infra, suíte25 Emulator com token revogado/duas lojas/300 negações SDK e Docker fixtures/full; [evidências e limites](MVP_02_RELATORIO.md). **25 IDs,16 abertos/nove resolvidos localmente mantidos; nenhuma baixa automática.** R-005/A07-01 remoto não revalidado/corrigido; R-006 IAM/segredo e R-007/R-023 ingresso/limite distribuído não comprovados; R-011 Java apenas temporário; R-012 custos/capacidade reais pendentes. Aceite MVP-01 atualiza evidência R-013, sem fechar o risco por conveniência. Comercial NO-GO.

<!-- ordem09-definicao -->
> Regra vigente — 15/10/2026: o Demo é o primeiro catálogo oficial para um cliente fictício, vitrine comercial e base reutilizável multi-loja. Ver [definição permanente](DEFINICAO_OFICIAL_CATALOGO_DEMO.md). O modo temporário de fixtures não substitui o produto completo. Registros anteriores mantêm seu escopo histórico; não comprovam publicação ou liberação comercial atual.

# Ressalvas e pendências de produção

Criado em 13/10/2026 (America/Sao_Paulo), Ordem 10. Registro permanente: toda etapa futura deve atualizá-lo. Não remover itens ao concluir uma etapa; preservar evidência, decisão e teste. Aprovação local não libera produção.

## R-001 — Configuração Firebase Web real

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: frontend/.env.example; frontend/src/lib/firebase.js.
- Descrição/evidência ou hipótese: Conexão e autenticação comerciais sem homologação.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Conexão e autenticação comerciais sem homologação.
- Etapa prevista: 19/25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-002 — Provedores e domínios Auth

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: frontend/src/lib/firebase.js; backend/src/config/firebase.js.
- Descrição/evidência ou hipótese: Login real precisa de homologação.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Login real precisa de homologação.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-003 — Dados comerciais loja-demo

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/services/lojaService.js.
- Descrição/evidência ou hipótese: Dados comerciais precisam de conferência autorizada.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Dados comerciais precisam de conferência autorizada.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-004 — Identificadores legados

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/lib/identificadores.js; backend/src/services/clienteService.js.
- Descrição/evidência ou hipótese: Migração exige vínculo comprovado, sem inferir identidade.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Migração exige vínculo comprovado, sem inferir identidade.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-005 — Publicação Rules e índices

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: firebase/firestore.rules; firebase/firestore.indexes.json.
- Descrição/evidência ou hipótese: Configuração local ainda não publicada.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Configuração local ainda não publicada.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-006 — IAM e credenciais Admin

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/config/firebase.js.
- Descrição/evidência ou hipótese: Privilégios reais precisam de revisão.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Privilégios reais precisam de revisão.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-007 — Rate limiting e prevenção de abuso

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/app.js.
- Descrição/evidência ou hipótese: Ausência de mecanismo comercial homologado.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Ausência de mecanismo comercial homologado.
- Etapa prevista: 25.
- Status: em análise (Etapa 25; proteção local preparada, homologação de abuso pendente).
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-008 — Retenção de pedidos/usuários/PII

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/services/pedidoService.js; publicoService.js.
- Descrição/evidência ou hipótese: Política de retenção precisa de definição.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Política de retenção precisa de definição.
- Etapa prevista: 25/26.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-009 — Retenção de idempotência

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/services/pedidoService.js.
- Descrição/evidência ou hipótese: Excluir nonce prematuramente pode duplicar pedidos; não implementar TTL sem política.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Excluir nonce prematuramente pode duplicar pedidos; não implementar TTL sem política.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-010 — Navegador e dispositivos móveis

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: frontend/src/App.jsx.
- Descrição/evidência ou hipótese: Homologação manual pendente.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Homologação manual pendente.
- Etapa prevista: 24/25.
- Status: em análise (Etapa 24; aprovação de produção pendente).
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-011 — Java 21 permanente

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: firebase.json.
- Descrição/evidência ou hipótese: Java temporário em /tmp não garante ambiente futuro.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Java temporário em /tmp não garante ambiente futuro.
- Etapa prevista: 25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-012 — Custos e desempenho Firestore

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/services/adminService.js.
- Descrição/evidência ou hipótese: Hipótese de custo crescente; medir antes de classificar defeito.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Hipótese de custo crescente; medir antes de classificar defeito.
- Etapa prevista: 24/25.
- Status: em análise (Etapa 24; aprovação de produção pendente).
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-013 — Histórico e URLs da navegação React

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: frontend/src/App.jsx.
- Descrição/evidência ou hipótese: window.location.pathname observado; comportamento ainda a avaliar.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: window.location.pathname observado; comportamento ainda a avaliar.
- Etapa prevista: 24.
- Status: em análise (Etapa 24; aprovação de produção pendente).
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-014 — Metadados/distribuição backend

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/package.json.
- Descrição/evidência ou hipótese: Descrição/licença genéricas; não definir licença sem decisão.
- Gravidade/prioridade: Baixa; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Descrição/licença genéricas; não definir licença sem decisão.
- Etapa prevista: 26.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-015 — Classificação de falhas na autenticação

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/middleware/authMiddleware.js.
- Descrição/evidência ou hipótese: Inspeção estática: catch responde 401 a qualquer exceção; comprovar por teste.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Inspeção estática: catch responde 401 a qualquer exceção; comprovar por teste.
- Etapa prevista: 23.
- Status: resolvida (escopo local da Etapa 23).
- Teste de comprovação: Reprodução anterior em /tmp/etapa 23-reproducao.log: Firestore code 14 durante Auth retornava 401. Testes dirigidos HTTP e Emulator verificam 503/500 para infraestrutura e 401 somente para credenciais, mantendo checkRevoked=true.
- Resultado da correção: Resolvida localmente na Etapa 23: classificação contextual de Auth e global de Firestore, sem invalidar sessão por indisponibilidade. Atualização em 13/10/2026; registro inicial e ordem preservados nesta descrição.

## R-016 — Erros distribuídos e rotas inexistentes

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: backend/src/app.js; backend/src/controllers; backend/src/middleware.
- Descrição/evidência ou hipótese: Inspeção estática: respostas/catches dispersos; comprovar por teste.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Inspeção estática: respostas/catches dispersos; comprovar por teste.
- Etapa prevista: 23.
- Status: resolvida (escopo local da Etapa 23).
- Teste de comprovação: Matriz HTTP 285, errosGlobais.test.js, inventário real dos 43 contratos, 404 JSON, erros sync/async e teste de resposta já iniciada. Logs/respostas não contêm sentinelas.
- Resultado da correção: Resolvida localmente na Etapa 23: handler global, erros tipados esperados, correlação X-Request-ID e eliminação dos catches de resposta repetidos. Atualização em 13/10/2026; registro inicial e ordem preservados nesta descrição.

## R-017 — Timeout/sessão/recuperação HTTP React

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: frontend/src/services/api.js; frontend/src/pages/Checkout.jsx.
- Descrição/evidência ou hipótese: Cobertura adicional requerida; separar falhas comprovadas de hipóteses.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Cobertura adicional requerida; separar falhas comprovadas de hipóteses.
- Etapa prevista: 23/24.
- Status: resolvida (escopo local da Etapa 23).
- Teste de comprovação: 65 testes React, incluindo timeout em sessão/token/fetch/JSON, cancelamento, respostas incompatíveis, UID trocado, 401/403/429/500/503 e checkout 503/409 com mesmo nonce.
- Resultado da correção: Resolvida no escopo automatizado da Etapa 23. Homologação manual continua em R-010 e revisão final de navegação em R-013. Atualização em 13/10/2026; registro inicial e ordem preservados nesta descrição.


## Política de manutenção do registro

A abertura das 17 ressalvas precedeu o checkpoint 22. Em 13/10/2026, R-015–R-017 foram tratadas no escopo local 23; os demais 14 itens permanecem pendentes. Resolução local não implica homologação de produção. Toda nova etapa deve registrar novos achados, atualizar evidência/teste/resultado e manter os identificadores anteriores. A revisão da Etapa 26 deve conferir individualmente todos os itens abertos.

R-009: código atual grava assinatura/pedidoId, sem TTL/data de expiração. Não remover nonces nesta etapa: perder a associação de uma tentativa ainda recuperável pode produzir outro pedido. Antes da produção, definir janela comercial de recuperação, retenção conjunta de pedidos/nonces, dados mínimos e resposta para chave expirada; testar retries após a janela e perda de resposta antes de autorizar TTL/migração. Sem implantação ou expiração real automática nesta ordem.

R-012 e R-013 permanecem hipóteses de impacto a validar: custo crescente e uso de window.location.pathname são observações de estrutura, sem defeito de desempenho/navegação comprovado nesta etapa. R-014 permanece decisão documental de distribuição/licença, sem alteração automática.


## Atualização Etapa 24 — 13/10/2026

Histórico inicial preservado. R-001–R-009, R-011 e R-014 continuam pendentes (11). R-010, R-012 e R-013 continuam abertas, agora em análise (3). R-015–R-017 permanecem resolvidas apenas localmente; regressões 23 reproduzidas. Os cinco achados abaixo foram comprovados e corrigidos localmente. Total: 22 itens, 14 abertos, 8 resolvidos localmente. Nenhum item homologado comercialmente.

- R-010: Chrome headless real, desktop 1440×900/mobile emulado 390×844; screenshots e 12 fluxos automatizados. Não foram realizados testes manuais em celulares, Firefox ou Safari. Roteiro 24 preparado.
- R-012: benchmark serial com dados fictícios no Emulator, três aquecimentos/20 amostras, volumes 100/1.000, quatro endpoints. Métricas em evidencias-etapa24/resultados.json e relatório 24; chamadas SDK/resultados não equivalem à fatura. Produção, índices, custos e capacidade concorrente ainda pendentes.
- R-013: URL direta, reload, navegação entre páginas e histórico/back passaram no Chrome/Vite. Não houve defeito comprovado do uso de pathname que justificasse reescrever roteamento. Fallback de servidor de produção/outros navegadores pendentes. Falhas comprovadas de sidebar registradas em R-021/R-022.
- R-015–R-017: testes globais, matriz HTTP e React mais suíte 23 foram reexecutados; continuam resolvidos no mesmo escopo local, sem alegação de homologação real.

## R-018 — Resposta antiga sobrescreve catálogo recente

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: frontend/src/contexts/LojaContext.jsx; demo/test/catalogo.test.jsx.
- Descrição/evidência: Reprodução React: resposta antiga de preço 20 substituía atualização de preço 33.
- Gravidade/prioridade: Média.
- Impacto: Catálogo podia exibir informação antiga após refresh concorrente.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste dirigido falhou antes e passou após correção.
- Resultado da correção: Versionar requisições e descartar respostas obsoletas, inclusive após unmount. Não implica homologação comercial.

## R-019 — Carrinho corrompido ou duplicado no cache

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: frontend/src/lib/compras.js; frontend/src/contexts/LojaContext.jsx; demo/test/catalogo.test.jsx.
- Descrição/evidência: Uma entrada null descartava também itens válidos; IDs duplicados eram aceitos.
- Gravidade/prioridade: Média.
- Impacto: Perda local de carrinho válido e representação duplicada.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste dirigido cache null/duplicado falhou antes; máximo, remoção e separação por loja passaram.
- Resultado da correção: Sanitização por entrada, IDs/quantidades válidos, deduplicação e apenas id/quantidade persistidos. Não implica homologação comercial.

## R-020 — Aviso npm transitive uuid/gaxios

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: backend/package.json; backend/package-lock.json; quality/backend/test/dependenciasCompatibilidade.test.js.
- Descrição/evidência: npm audit apontou duas ocorrências moderadas (uuid e gaxios), GHSA-w5hq-g745-h8pq. Gaxios utiliza v4; não foi demonstrada exploração na aplicação.
- Gravidade/prioridade: Média.
- Impacto: Dependência transitiva com alerta conhecido; manter acompanhamento.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Audit final zero nas duas árvores; multipart gaxios/v4 testado sem rede e Firebase Emulator passou.
- Resultado da correção: Override restrito a gaxios6.7.1 usando uuid11.1.1, sem atualizar frameworks maiores. Não implica homologação comercial.

## R-021 — Sidebar administrativa impede renderização

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: frontend/src/components/admin/AdminSidebar.jsx; demo/test/sidebar.test.jsx.
- Descrição/evidência: Chrome após login apresentou painel vazio; React reproduziu ReferenceError sessao is not defined. Hook estava no helper isActive.
- Gravidade/prioridade: Alta.
- Impacto: Administrador não conseguia usar painel.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste de renderização falhou antes e passou após; Chrome login e páginas administrativas passaram.
- Resultado da correção: Mover useAdminSessao para o componente, helper de rota puro; preservar visual. Não implica homologação comercial.

## R-022 — Sair da sidebar mantém sessão autenticada

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: frontend/src/components/admin/AdminSidebar.jsx; demo/test/sidebar.test.jsx.
- Descrição/evidência: Teste reproduziu zero chamadas a sessao.sair; link somente navegava a /login.
- Gravidade/prioridade: Alta.
- Impacto: Sessão administrativa continuava disponível após intenção explícita de sair.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste de logout falhou antes e passou após; Chrome confirmou painel fechado e formulário de login.
- Resultado da correção: Botão/link Sair chama o encerramento da sessão compartilhada, mantendo callback de navegação. Não implica homologação comercial.


## Atualização Etapa 25 — 13–14/10/2026

Ordem12: preparação local, sem implantação. Todos os22identificadores anteriores preservados. Planejamento não resolve pendências externas. R-007 passa a em análise pela implementação/testes locais de429; nenhuma das14ressalvas anteriores abertas foi encerrada. Com R-023 nova:23itens,15abertos (11pendentes/4em análise),8resolvidos localmente23/24. Nenhum homologado comercialmente.

| ID | Preparado localmente / nova evidência25 | Dependência e situação atual |
| --- | --- | --- |
| R-001 | Validação Web/build externo/projeto esperado e exemplos fictícios | Configuração Firebase real e homologação pendentes |
| R-002 | Estratégia Anonymous/EmailPassword, domínios/recuperação/vínculoUID | Console/provedores/domínios e contas reais dependem de ordem externa |
| R-003 | Checklist comerciais/mínimo/taxa/WhatsApp/opcionais | Dados reais dependem do proprietário/restaurante e homologação |
| R-004 | Manifesto de identidade comprovada, backup/dry-run/precondições/rollback | Aprovação e verificação de vínculos; nenhuma migração real ou inferência por email |
| R-005 | Deny-all preservada,7índices preparados e queries/rules no Emulator | Publicação/estado READY/QueryExplain pendentes; Emulator não valida índices compostos |
| R-006 | ADC gerenciada, Docker sem env/não root, IAM mínimo proposto | IAM/identidade do serviço e papéis devem ser configurados e testados externamente |
| R-007 | Limiter por processo/IPpeer/UID verificado,429/Retry-After/testes; recuperação GET e um pedido | Em análise; auth direto/proxy/edge/distribuição/NAT/cotas comerciais ainda pendentes |
| R-008 | Inventário PII, retenção/exclusão/exportação e backups propostos | Decisão proprietário e validação jurídica; nenhuma exclusão ou texto legal publicado |
| R-009 | Política sem TTL, janela7dias para discussão e tombstone/envelope futuro | Não aprovada/implementada janela; retenção conjunta/contrato expiração ainda pendentes |
| R-010 | Chrome novamente12fluxos, preservadas evidências24 | Dispositivos físicos/outros navegadores/ambiente real pendentes |
| R-011 | Node24/.nvmrc, CI propõe Java21; Emulator local usa Java temporário | Instalação permanente do desenvolvedor e primeira execução CI ainda pendentes |
| R-012 | Modelo de custos1/10/50/100/150lojas, preços de referência/fontes/formulas/CSV | Região/plano/custos completos/capacidade real/índices a homologar |
| R-013 | Mapa explícito de host A/B e rejeição desconhecido; URL/reload/back Chrome; Hosting SPA/cache testados | Cloudflare/produção/domínios/proxy e dispositivos pendentes, permanece em análise |
| R-014 | Sem alteração automática de licença/metadados | Decisão do proprietário na26, ainda pendente |
| R-015 | Backend325 e regressões23: credencial401/infra503/autorização403 | Resolvida localmente23, não produção |
| R-016 | Handlers/requestId/erros sigilosos e contratos preservados | Resolvida localmente23, não produção |
| R-017 | React79 incluindo429/timeout/retry/sessão; nonce preservado | Resolvida localmente23, não produção |
| R-018 | Race de catálogo revalidado React/Chrome | Resolvida localmente24; resultado preservado |
| R-019 | Cache seguro/separação loja revalidado | Resolvida localmente24; resultado preservado |
| R-020 | Override mantido, audit final0 e instalação npmci/Docker | Resolvida localmente24 quanto a alertas conhecidos; revisões contínuas necessárias |
| R-021 | Painel/login/páginas novamente passados no Chrome | Resolvida localmente24; resultado preservado |
| R-022 | SidebarSair e logout novamente passados | Resolvida localmente24; resultado preservado |

R-001–006 eR-008–014 continuam abertos; R-007 também aberto em análise. Docs25 arquitetura/configuração/custos/segurança/checklist detalham responsáveis e evidências faltantes. FasesB–H não executadas.

## R-023 — Proteção distribuída e identidade de rede na implantação

- Data de identificação/registro:13/10/2026, Etapa25.
- Arquivos envolvidos: backend/src/middleware/operacao.js; docs/ETAPA_25_SEGURANCA_OPERACIONAL.md; infraestrutura de borda futura.
- Descrição/evidência: limiter local usa memória/peer TCP, não estado distribuído. Instâncias reiniciam limites e proxies podem concentrar tráfego; cabeçalho não verificado não é identidade segura. Limitação comprovada pela implementação/testes, impacto comercial ainda depende da topologia.
- Gravidade/prioridade: Alta para revisão antes da implantação; não exploração demonstrada nem bloqueador da preparação local.
- Impacto: evasão entre instâncias ou bloqueios de clientes legítimos/NAT se configuração externa não for revisada; ingress direto pode contornar proteção de borda.
- Etapa prevista: implantação autorizada/homologação.
- Status: pendente (decisão do proprietário, configuração externa e homologação).
- Teste de comprovação: unidade ignora X-Forwarded-For forjado, limite porUID/grupo/trailingSlash e memória limitada; Emulator21POST+1GET mantém um pedido e429. Falta teste real multi-instância/proxy normalizado/bypass/NAT/rajadas.
- Resultado da preparação: proposta de gateway/proxy confiável e ingresso restrito, quota distribuída/loja e telemetria com thresholds calibrados; Redis/LB/WAF somente após orçamento/aprovação. Não resolvida por documentação.


## Auditoria individual Etapa26 —14/10/2026

R-001–023 preservados;15abertos e8resolvidos locais25 continuam com omesmoestado. Nenhum encerrado por documentação. AcrescentadosR-024/025:25totais,17abertos e8resolvidos localmente.

| ID | Classificação de lançamento | Evidência/ação faltante26 |
| --- | --- | --- |
| R-001 | Bloqueadora/configuração+homologação | Webprojeto/API/CORS/Auth reais ainda sem evidência |
| R-002 | Bloqueadora/homologação | Provedores/domínios/recovery econtas administrativas reais |
| R-003 | Bloqueadora/decisão comercial | Aprovação dadoscomerciais/WhatsApp/taxa/mínimo/imagens |
| R-004 | Condicional:bloqueia lojascomlegados | Mapas inequívocos/backup/dry-run;nãoinferiridentity |
| R-005 | Bloqueadora/externa | Rules/índicesREADY/Explain;Emulatornão valida índices |
| R-006 | Bloqueadora/externa | IdentidadeADC/IAMmínimo/rotação/equipe responsáveis |
| R-007 | Bloqueadora/homologação | Limiterlocal aprovado;Authdireto,NAT/cotas/abusoreal faltam |
| R-008 | Bloqueadora/jurídico+comercial | Política PII/retencão/exclusão/termosaprovados |
| R-009 | Bloqueadora/decisão técnica | NãoTTL preservado;retençãoconjunta/recovery antes de expiração |
| R-010 | Bloqueadora/homologação | Dispositivosfísicos/outrosnavegadores/piloto não realizados |
| R-011 | Melhoria operacional,necessária para reprodução sustentada | Java21temporário;CIremoto/instalaçãopermanente faltam |
| R-012 | Bloqueadora/orçamento+homologação | Tarifas/modeloparcial/capacidade/índicesreais/monitoramentodecusto |
| R-013 | Dependente de homologação,gate de navegação | Chrome/Vite eHostingEmulator passados;domínios/provedorreal/SPA final |
| R-014 | Decisão proprietário antesde distribuição | Licença/metadados não alterados |
| R-015 | Resolvida localmente23 | Regressão26preserva401/403/503;nãohomologação real |
| R-016 | Resolvida localmente23 | Handlers/requestId/errossemsentinelas passados |
| R-017 | Resolvida localmente23 | Reacttimeout/UID/retry/nonce passados |
| R-018 | Resolvida localmente24 | Race catálogo emReact/Chrome reexecutado |
| R-019 | Resolvida localmente24 | Cache corrupto/separação por loja reexecutados |
| R-020 | Resolvida localmente24 | Override/compatibilidade mantidos;scan não equivale aaudit contínuo |
| R-021 | Resolvida localmente24 | Sidebar/adminrender passam |
| R-022 | Resolvida localmente24 | Logout encerra sessão no percursoChrome |
| R-023 | Bloqueadora/topologia+homologação | Memóriaporinstância/proxy/ingresso confiável/distribuição faltam |

## R-024 — Administração e suporte seguro por equipe da plataforma

- Identificação:14/10/2026,Etapa26;prioridadeAlta antes de suporte real.
- Evidência:authMiddleware.js limita rolescliente/admin;lojaMiddleware.js exigeumlojaId;nenhum nivelglobal ou painelcentral implementado. Documentos antigos prometiamglobal.
- Impacto:suporte commesmacontacompartilhada/acesso global improvisado pode comprometerisolation/auditoriadaequipe. Não exploração demonstrada.
- Estado:pendente,decisãocomercial/segurança e implementação específica futura.
- Ação:contasindividuais,aprovação/acessotemporário porloja,menosprivilégios,registrosde ações,MFAconformeprovedor eprocesso derevogação;projetar suporte antes de operar.
- Prova:inspeção deroles/guardas e testesmultiloja;falta fluxodeplataforma autorizado/homologado. Nãoresolvidopelo manual.

## R-025 — Credenciais em texto externo e distribuição de documentos

- Identificação:14/10/2026,Etapa26;prioridadeAlta secredenciaisforem válidas emserviço real.
- Evidência:arquivoexterno de credenciais de teste com7linhas ecampos de senha; nenhumvalor foi reproduzido emGit,logs oumanuais.
- Estado:pendente,deproveniência/ambiente/decisãodo proprietário. Nenhumlogin/rotação realexecutado.
- Preparação:backupprivado foraGit earquivo restrito600;conteúdo originalpreservado;não publicarZIP/código/backup semscan/revisão.
- Açãofutura:verificardestino/validade,rotacionarse necessário emordem específica,migrarpara armazenamento adequado eaprovarartefatos para distribuição.
- Resultado:medida local deacesso nãoresolve gestão/rotação,nem comprova credenciaisfictícias.


## R-025 — Encerramento local da segurança de credenciais — 14/10/2026

Estado atual: R-025 resolvida localmente, aguardando revisão do proprietário. Total preservado de 25 identificadores: 16 ressalvas abertas e 9 resolvidas localmente. Este registro posterior atualiza a situação da Etapa 26; os totais e as descrições anteriores permanecem como histórico. Não implica homologação de produção nem encerra outra ressalva.

Operações Firebase informadas pelo proprietário nesta rodada, sem repetição pelo agente: projeto `bancorestaurante`, conta de teste `XPN5…iw02`, senha nova aceita e refresh tokens revogados no terminal local; conta habilitada, papel `admin` e vínculo `loja-demo` preservados. Segundo o proprietário, a primeira tentativa foi recusada por senha inferior a 12 caracteres e a segunda concluiu a operação. A senha nova não foi fornecida ao agente. Não houve login nem qualquer operação Firebase nesta finalização; nenhuma outra conta foi modificada pela tarefa.

Evidências locais verificadas nesta rodada:

- TXT original sanitizado: `/home/lucas/Documentos/lojaDemoRestaurante/email se senhas teste.txt`.
- TXT do backup sanitizado: `/home/lucas/Documentos/lojaDemoRestaurante_BACKUPS/etapa26_2026-10-14_032948/email se senhas teste.txt`.
- ZIP sanitizado: `/home/lucas/.local/share/Trash/files/lojaDemoRestaurante_BACKUPS.zip`; alterada somente a entrada `lojaDemoRestaurante_BACKUPS/etapa26_2026-10-14_032948/email se senhas teste.txt`.
- Campo `Senha` substituído por `[CREDENCIAL REMOVIDA — ARMAZENADA FORA DA DOCUMENTAÇÃO]`, preservando os demais campos. As três cópias não contêm mais os valores antigos identificados; nenhum desses valores foi escrito em logs ou relatórios ou em novas cópias.
- ZIP: teste CRC aprovado em todas as 11 entradas, mesma lista e ordem, comentário preservado e SHA-256 do conteúdo das outras 10 entradas idêntico antes/depois. Reconstrução sem extração para disco, com arquivo intermediário contendo apenas dados já sanitizados. TXT original, TXT do backup e ZIP em modo `0600`.
- `.gitignore` reforçado para os documentos de senhas de teste, diretórios/pacotes privados conhecidos, ADC, credenciais e chaves privadas. Manuais públicos continuam elegíveis ao Git. `backend/.dockerignore` mantém inclusão restrita a package.json/package-lock.json, src e Dockerfile, com exclusões privadas adicionais.
- Verificados 254 arquivos rastreados ou não ignorados e o conteúdo do índice: nenhuma ocorrência dos valores antigos identificados nem dos padrões examinados de chaves privadas, refresh tokens JSON, tokens GitHub, chaves AWS e Google. Índice sem alterações preparadas para commit. A varredura não constitui prova universal de ausência de segredos nem exame integral do histórico Git.
- `git check-ignore` confirmou os exemplos privados protegidos e a preservação dos manuais públicos. `git diff --check` aprovado. Validador documental aprovado: 15 arquivos atuais, 42 links relativos e 43 contratos, além dos exemplos de portas. Sem alteração de código funcional.

Documentação oficial atualizada por acréscimo: este registro, `docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md`, `docs/REGISTRO_DE_TRABALHO.md`, `docs/GUIA_MESTRE.md` e o guia externo `GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt`. Históricos anteriores preservados. O backup e o ZIP foram deliberadamente sanitizados: verificações históricas de identidade desses artefatos descrevem o estado anterior à correção.

Riscos residuais: a sanitização cobre somente as três cópias conhecidas; não elimina possíveis cópias desconhecidas nem vestígios recuperáveis em disco. Access tokens já emitidos podem continuar válidos até expirar se a API não verificar revogação. A nova senha não foi recebida, usada nem escrita nesta tarefa; sua ausência absoluta em arquivos existentes não pode ser comprovada por comparação com um valor desconhecido. Proteções do Git não removem arquivos já rastreados nem substituem revisão contínua.

Nenhum commit, push, deploy, publicação de Rules/índices, alteração IAM, mudança comercial ou avanço para outra ressalva. Aguardar revisão do proprietário.


## Ordem de Implantação 01 — preparação Cloud Run — 14/10/2026

Preparação local concluída, sem implantação externa. Relatório corrente, custos, recursos, IAM, variáveis, testes, atualização e rollback: [Cloud Run homologação](IMPLANTACAO_CLOUD_RUN_HOMOLOGACAO.md). Branch inicial main/792b069, alterações anteriores preservadas. Único ajuste de execução: servidor escuta explicitamente em 0.0.0.0 e usa PORT fornecida pela plataforma. Dockerfile existente preservado; contexto backend sem credenciais.

Consultas somente de leitura encontraram oito projetos Cloud e seis Firebase acessíveis, nenhum identificado como homologação dedicada; listagem de billing vazia para a identidade atual e billingEnabled=false no projeto atual bancorestaurante. Esse projeto não foi selecionado para API pública. Proposta sujeita à aprovação: projeto Firebase/Cloud dedicado, us-central1 (banco na mesma região), serviço catalogos-api-homolog privado por IAM, identidade runtime dedicada sem JSON, 1 vCPU/512 MiB/concorrência10/min0/max1/timeout30s. Quotas/permissões efetivas e billing do novo projeto não confirmados.

Backend325/325, React79/79, infra3/3, build React1.624 módulos em /tmp, imagem Docker local e 8 checks HTTP sem rede externa aprovados; UID1000, SIGTERMexit0, logs mínimos e contexto restrito conferidos. Firebase real de homologação não testado. Java indisponível no PATH: Emulator não reexecutado nesta rodada (R-011). Evidências antigas continuam históricas.

A primeira fase proposta é privada para operadores aprovados. Firebase ID Token do React não substitui IAM do Cloud Run; prévia de navegador depende de gateway/acesso protegido ou autorização específica de exposição após revisão de rotas/abuso/custos. CORS não é autenticação; limiter por processo/peer não resolve proxy/distribuição. Não alterar automaticamente trust proxy ou tornar serviço público.

Frontend já usa VITE_API_URL, VITE_APP_ENV, projeto Firebase esperado e VITE_LOJAS_POR_HOST (ou VITE_LOJA_ID), com mapa explícito de hostname implementado no código; não há prova da configuração do site publicado. Cloudflare atual permanece sem alteração. Não usar conta R-025 nem dados reais para homologação.

Fluxos lógico/de dados do documento externo existente ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt atualizados, distinguindo código implementado, homologação não implantada e produção prevista. Histórico integral anterior preservado; snapshots e decisões comerciais mantidos. Recursos externos, billing, APIs, IAM, invocadores, dados fictícios e eventual acesso público exigem aprovação específica, conforme a Ordem 01 do proprietário.

R-001/002/005/006/007/010/011/012/013/023/024 continuam com pendências; nenhuma encerrada por esta ordem. R-025 permanece resolvida localmente: total25,16abertas,9resolvidaslocais. Sem push, deploy, escrita Firebase, publicação de Rules/índices ou mudanças comerciais. Commit restrito aos artefatos novos da ordem e server.js; acréscimos nestes documentos compartilhados permanecem em diff para não incorporar alterações anteriores.

## Decisão vigente — Render, Ordem de Hospedagem 02 — 15/10/2026

A primeira hospedagem de homologação passa a ser planejada no Render (Web Service Node, Free). Cloud Run permanece como alternativa histórica/futura; suas instruções de IAM privado não se aplicam ao Render. **Render não implantado; sem URL de API, push ou alteração no Cloudflare.** Frontend informado pelo proprietário: https://catalogo-demo-cz1.pages.dev/ (configuração publicada não auditada nesta ordem).

Fluxo previsto: navegador → Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controllers → services → Firebase Admin SDK → Firestore → API → React. Implementação local existente preservada; integração externa pendente de projeto Firebase fictício separado e identidade autorizada. Não usar bancorestaurante ou contas R-025. Não executar pedidos/WhatsApp reais.

Catálogo público: GET /publico/lojas/:lojaId/catalogo → validação e projeções públicas → Firestore da loja. Checkout: React coleta dados → token Firebase → validações da API → cálculo do servidor → transação/idempotência → pedido. Pedidos: consultas/status exigem titularidade ou administração conforme rota. Autenticação: Firebase Web obtém ID Token; API verifica token e revogação, consulta usuário ativo e determina role. Administração: /admin/lojas/:lojaId exige admin e loja correspondente. Multi-loja: hostname→loja explícito no React; parâmetros, middlewares e services validam escopo no servidor. Erros: JSON seguro, status e requestId; logs estruturados sem body, token ou identidade. Admin SDK ignora Rules Web: isolamento depende da API e IAM do ambiente separado.

Configuração proposta: LucasTech-Dev/Catalogos, main somente após revisão/sincronização; Root Directory backend; Node 24.x; npm ci; npm start; Free; instância única; health GET /; Auto Deploy Off; Virginia sugerida, disponibilidade na conta a confirmar. PORT fornecida pelo Render; escuta 0.0.0.0 já implementada.

Bloqueio: guardas externos rejeitam GOOGLE_APPLICATION_CREDENTIALS e exigem identidade gerenciada; Render não herda ADC local. OIDC gerenciado documentado requer workspace Pro e não lista Google. Não há integração Firebase externa validada. Chave de service account em Secret File seria alternativa sujeita a aprovação específica, IAM restrito e alteração revisada do guarda; não foi criada nem configurada. HTTP pode ser testado localmente sem dados, mas GET / não prova Firebase nem restringe outras rotas. Não publicar o app completo como se fosse somente health.

CORS proposto: https://catalogo-demo-cz1.pages.dev, sem barra final; não é autenticação. Limiter em memória usa peer TCP; proxy Render pode agrupar visitantes e gerar 429 coletivo. Não confiar arbitrariamente em X-Forwarded-For ou habilitar trust proxy irrestrito. R-007/R-023 seguem abertas até validação de borda/proxy. Nenhuma ressalva encerrada por esta preparação; R-025 preservada como resolvida localmente segundo o registro anterior, sem nova validação de rotação.

Free: 750 horas por workspace/mês, suspensão após esgotamento, repouso após 15 minutos e retomada em cerca de um minuto; banda/build têm limites separados. Não prometer custo zero total ou operação comercial. Fontes: https://render.com/docs/free ; https://render.com/docs/oidc .

## Estado vigente — Ordem de Preparação 03 — 15/10/2026

Render continua escolhido para a primeira homologação; Cloud Run permanece alternativa histórica/futura. **Somente preparação local; sem projeto/SA/chave/IAM/serviço real, commit, push ou deploy.** Firebase proposto: catalogos-homolog-2026 (nome Catálogos Homologação), existência/disponibilidade não verificadas. bancorestaurante não foi consultado nem alterado. Frontend visual informado: https://catalogo-demo-cz1.pages.dev/; configuração remota não auditada/republicada.

O bloqueio de código da Ordem 02 foi tratado localmente: FIREBASE_CREDENTIAL_MODE=render-secret-file, somente APP_ENV=homologacao e NODE_ENV=production, lê exclusivamente /etc/secrets/firebase-homologacao.json. GCLOUD_PROJECT, FIREBASE_EXPECTED_PROJECT_ID e FIREBASE_HOMOLOG_PROJECT_ID devem ser iguais ao ID dedicado permitido; FIREBASE_SERVICE_ACCOUNT_EMAIL exige conta de serviço do mesmo projeto e o JSON deve corresponder exatamente a ambos. Arquivo ausente/irregular, symlink final, excesso de tamanho, JSON/credencial inválidos, projeto/conta divergentes falham antes do listen, sem imprimir segredo. Sem ADC pessoal/Git/VITE_*. Modo managed é explícito para alternativa com identidade gerenciada; não é promessa de ADC automático no Render. Produção comercial recusa configuração homolog. Desenvolvimento/Emulator preservados; homologação nunca cai no fallback bancorestaurante.

Estratégia recomendada posterior: conta de serviço restrita e exclusiva, Secret File privado Render; nenhuma chave foi gerada nesta ordem. O recurso é documentado em https://render.com/docs/configure-environment-variables sem restrição paga indicada; conta/montagem real ainda não verificadas. Render OIDC gerenciado requer Pro e não lista Google como provedor suportado: https://render.com/docs/oidc . Secret é plaintext acessível ao processo e pessoas com poder de deploy; não presumir isolamento de build. Restringir permissões do workspace, revisar dependências, não imprimir env/arquivo, rotacionar substituindo secret e revogando chave anterior; remover secret não revoga chave no Google. IAM proposto (não aplicado): datastore.user no novo projeto e firebaseauth.users.get para verificação de revogação; operador/provisionamento separado do runtime. Política que proíbe chave deve ser respeitada.

Fluxo preparado: navegador → Cloudflare Pages → React → HTTPS → Render → Express → middlewares → controller → service → Admin SDK → Authentication/Firestore de homologação → API → React. Catálogo: hostname explícito seleciona loja e API pública devolve projeções. Autenticação: Web SDK obtém ID Token e API verifica token/revogação e usuário. Administração: role admin, ativo e vínculo loja; CORS/domínio não concedem role. Carrinho no React; checkout envia IDs/quantidades, servidor recalcula valores e persiste transação/idempotência e snapshots; link WhatsApp deriva do pedido sob autorização, gerar link não envia mensagem nem comprova pagamento. Isolamento multi-loja fica nos middlewares/services e titularidade; Admin SDK ignora Rules Web. Erros JSON seguros e logs mínimos com requestId preservados.

Fixtures locais: duas lojas (loja-homolog e loja-homolog-b), usuários fictícios, categorias, produtos, clientes e endereços; 14 documentos, sem senhas/telefones/WhatsApp/pedidos reais. UIDs placeholders devem ser mapeados aos Auth UIDs aprovados posteriormente. Script quality/backend/scripts/homologacao-dry-run.js --project catalogos-homolog-2026 somente simula: sem SDK, rede, escrita ou opção --write. Dados/preços fictícios não modificam planos comerciais.

Render proposto: catalogos-api-homolog; Git interno LucasTech-Dev/Catalogos, main após revisão/push autorizado; raiz backend; Node 24; npm ci; npm start; Free; instância única; health /; Auto Deploy Off; Virginia sugerida, disponibilidade a verificar. PORT da plataforma; CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev. Secret e configuração podem iniciar deploy ao salvar: autorização deve preceder ação no painel. Não existe URL da API. VITE_API_URL só receberá URL real validada em etapa posterior; VITE_FIREBASE_PROJECT_ID/EXPECTED_PROJECT_ID/HOMOLOG_PROJECT_ID devem corresponder ao Firebase dedicado. Configuração Web é pública, chave Admin jamais VITE_. Hostname→loja continua explícito e backend confirma escopo. Authorized Domains e CORS são controles distintos.

Testes antes/depois: backend 325→334 aprovados; React 79→80; infra 3→4; ambos builds aprovados (1.624 módulos). Emulator 19–23 concluído, exit 0, com Java 21 e JAR temporários já disponíveis, projeto demo- e Auth/Firestore locais; sem instalação permanente ou dados reais. Inclui tokens/sessões, Rules deny-all, autorização A/B, concorrência, validações, erros e pedidos fictícios. Logs brutos Emulator não distribuídos por poderem conter tokens locais; evidência sanitizada preservada. Teste novo de admin de outra loja retorna 403 e não altera dados. Integração Render, Secret File real, IAM, índices READY e queries reais não comprovados.

Estados: contratos/fluxos existentes implementados; loader/guardas/exemplos/fixtures preparados localmente; projeto/Auth/Firestore/SA/IAM/Rules/índices dependem de criação externa; Render/Firebase dedicado não implantados. Roteiro Console, IAM, rotação, matriz de gates e relatório completo: docs/FIREBASE_HOMOLOGACAO_RENDER.md no repositório. Somente após aprovação: escolher ID/plano/localização, criar Firebase dedicado, configurar Auth/Firestore/Rules/índices e IAM/credencial; depois autorizar push e publicação Render; por último integrar Cloudflare com nova aprovação.

Ressalvas preservadas: 25 IDs, 16 abertas, nove resolvidas localmente; R-025 mantém estado anterior. R-023 e R-007 continuam abertas: limiter em memória usa peer TCP e pode agrupar clientes no proxy; sem proteção distribuída comprovada. R-006 aguarda IAM/credencial real; Java temporário não encerra R-011. Sem encerramento por documentação. Free tem repouso de 15 min e retomada de cerca de um minuto, potencialmente além do timeout Web atual de 20 s; 750 horas/workspace/mês e limites de banda/build/tráfego externo, sem garantia de custo total zero. Spark deve ser verificado para o escopo básico; billing/Blaze, recursos adicionais e custos exigem aprovação própria. Produção comercial segue NO-GO.

## Decisão vigente — Render com Firebase existente — 15/10/2026

Por instrução posterior do proprietário, usar bancorestaurante e loja-demo na primeira implantação de demonstração; não criar catalogos-homolog-2026, banco novo, migração ou cópia. Esta decisão substitui a Ordem 04 anterior de criação de projeto vazio. Cloud Run e Firebase separado ficam como alternativas históricas/futuras. **Somente preparo local, sem conexão real, chaves, IAM, dados, push ou deploy.** Relatório/configuração atual: docs/PREPARACAO_RENDER_BANCORESTAURANTE.md.

Backend mantém APP_ENV=homologacao e NODE_ENV=production. Para o projeto existente, exige FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante além de GCLOUD_PROJECT, FIREBASE_EXPECTED_PROJECT_ID e FIREBASE_HOMOLOG_PROJECT_ID iguais ao mesmo ID. Somente FIREBASE_CREDENTIAL_MODE=render-secret-file é aceito nessa exceção; managed/ADC pessoal/Emulator/produção comercial são recusados. Conta de serviço deve ser explícita do mesmo projeto e o JSON corresponder exatamente ao projeto/email; arquivo fixo /etc/secrets/firebase-homologacao.json, nenhum segredo no Git/VITE_*/logs. Modelo vigente infra/render/bancorestaurante.backend.env.example. Nome de conta sugerido [identidade técnica histórica; referência integral preservada localmente], ainda não criado/verificado; IAM/geração/upload precisam de aprovação específica.

Frontend tem opt-in equivalente VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante, três IDs públicos correspondentes e mapa catalogo-demo-cz1.pages.dev→loja-demo; modelo infra/render/bancorestaurante.web.env.example. VITE_API_URL segue placeholder até existir URL real validada. Nenhuma publicação Cloudflare feita. Authorized Domains, Rules/índices/IAM e dados do Firebase atual não consultados nesta rodada; arquivos locais não provam estado remoto.

Fluxo preparado: Cloudflare Pages → React → HTTPS → Render → Express → autenticação/loja → controllers → services → Admin SDK → Firebase bancorestaurante (Authentication/Firestore) → API → React. Catálogo público usa projeções; token/revogação, usuário ativo, role e vínculo preservados; cliente/pedido/endereço mantêm titularidade/escopo. Checkout recalcula/transaciona/idempotência no servidor; link WhatsApp não envia mensagem. API continua compartilhada para restaurantes, sem superadmin. Nenhum pedido/usuário real alterado.

Banco persistente não é descartável: opt-in de configuração não autoriza escrita/publicação e não concede IAM. Uma API pública completa com identidade de escrita poderá afetar dados reais; revisar dados publicáveis, alcance de IAM, recuperação e operações permitidas antes de expor. Admin SDK ignora Rules Web; autorização da API continua essencial. CORS HTTPS exato não autentica; limiter local/peer TCP pode agrupar visitantes atrás do proxy. trust proxy não foi ampliado. R-007/R-023 e demais gates reais seguem abertos; 25 ressalvas, 16 abertas e nove resolvidas localmente preservadas. Vendas comerciais não liberadas.

Render proposto catalogos-api-homolog, Node 24, Free, raiz backend no Git interno, npm ci, npm start, health /, Auto Deploy Off, uma instância, PORT da plataforma. Salvar secret pode iniciar deploy; só fazer após autorização. Integração Render–Firebase existente não comprovada. Fixtures/Emulator permanecem fictícios; script de simulação continua recusando bancorestaurante. Resultados reais de testes e limites constam no relatório/evidências desta decisão.

## Ordem 05 — auditoria pré-publicação local — 15/10/2026

Preparação 04 aprovada documentalmente com ressalvas pelo proprietário; isso não é inspeção independente nem autorização de operações externas. Auditoria 05 restrita aos arquivos locais, sem Firebase/GitHub/Render/web, credenciais ou testes externos. Relatório completo: docs/AUDITORIA_PRE_PUBLICACAO_RENDER.md; inventário individual: docs/evidencias-ordem05/ROTAS.md.

Resultado: 43 contratos, 28 GET e 15 mutações Firestore. Não há modo global somente leitura: pedidos/perfis/endereços/configuração/produtos/categorias continuam montados com suas autorizações. Catálogo público aceita qualquer lojaId existente não explicitamente inativo, não só loja-demo; loja/categoria sem ativo passam no comportamento legado. Campos projetados precisam de aprovação de valores concretos: allowlist não remove PII dentro de texto/contatos/URL. Listagens legacy e catálogo podem ler coleções inteiras; filtro de status/cursor em listagem administrativa de pedidos depende do ramo paginado com limite. Esses achados não foram alterados nesta auditoria.

Primeira liberação proposta: somente health e catálogo de loja-demo previamente aprovado, com restrição no backend ou borda sem bypass e identidade efetivamente sem escrita (viewer como candidato, IAM herdado a conferir). Isso é plano, não funcionalidade pronta. CORS, esconder botões ou usar token de teste não bloqueiam as mutações. Não conectar cadastro/login anônimo/checkout do frontend nessa fase, pois Web SDK pode criar/alterar contas Auth independentemente da escrita Firestore na API. Não testar POST no Firebase real para comprovar negação sem autorização específica.

Runtime exclusivo proposto [identidade técnica histórica; referência integral preservada localmente], ainda não criado/verificado. Auth com verifyIdToken(token,true) consulta getUser para revogação/disabled; firebaseauth.users.get é candidato de permissão, não users.create/update/delete/list ou Auth Admin. Para leitura Firestore, viewer é candidato; escrita futura exige concessão específica de create/update/delete conforme operações, nunca Owner/Editor por conveniência. Permissões efetivas/Secret File/montagem/rotação não comprovadas. Nenhuma chave lida/gerada/baixada nesta ordem. Ignores, loader restrito e logs seguros preservados; Admin SDK ignora Rules Web.

Rules locais deny-all e sete índices COLLECTION comparados com queries reais dos services; estado publicado/READY e exemptions desconhecidos. Emulator anterior não comprova índices reais. Checklist de consulta futura exige autorização específica e metadados/campos mínimos, sem clientes/endereços/pedidos/usuários reais por conveniência. Não criar banco/projeto, migrar dados ou publicar Rules/índices.

Fluxo vigente preparado: Cloudflare Pages → React → HTTPS → Render → Express/middlewares/controllers/services → Admin SDK → Firebase bancorestaurante → API → React. Render permanece proposto catalogos-api-homolog, Node 24, backend, npm ci/npm start, Free/uma instância, health /, Auto Deploy Off, PORT da plataforma; CORS exato https://catalogo-demo-cz1.pages.dev e secret fixo /etc/secrets/firebase-homologacao.json. Opt-in de ambiente bancorestaurante preservado. Limites/plano/conta Render e URL real não verificados nesta ordem. Salvar secret/criar serviço pode iniciar publicação; gate deve existir antes da primeira implantação.

Git main 19b554d, oito commits à frente da referência remota local; sem fetch/commit/push. Inventários rastreados/novos/commits preparados; sequência de commits proposta para revisão por hunks e conjunto executável, sem inclusão indiscriminada. Scanner textual local sem achados nos candidatos atuais; isso não certifica histórico completo, binários ou PII. Testes da Ordem 04 (backend335/React81/infra5/build/Emulator19–23) são históricos; não reexecutados nesta rodada estática, sem mudança de código. Validador documental e diff --check conferidos localmente.

Permanecem 25 ressalvas, 16 abertas e nove resolvidas localmente; R-025 preservada. A05-01 (alcance catálogo), A05-02 (volume/filtro listagens) e A05-03 (ausência de leitura restrita) são achados da auditoria, não novos IDs R. R-005/R-006/R-007/R-023 e integração/custos seguem pendentes. NO-GO para API completa com escrita ou vendas. Próxima ação: proprietário revisar escopo/gate de leitura e autorizar tarefas específicas; depois metadados/dados publicáveis, IAM/credencial, GitHub, Render e Cloudflare em fases aprovadas. Nenhuma operação externa ou modificação de dados/IAM/serviço realizada.

## Ordem 06 — demonstração pública somente leitura — 15/10/2026

Implementação local concluída, sem publicação. Relatório vigente: docs/RENDER_DEMO_SOMENTE_LEITURA.md. Modo CATALOGOS_RUNTIME_MODE=public-readonly-demo validado antes de iniciar HTTP; exige homologacao/production explícitos, projeto/opt-in bancorestaurante, credencial Secret File correspondente e CATALOGOS_DEMO_LOJA_ID=loja-demo. Config parcial, modo inválido, outro projeto/loja ou Emulator incompatível falham fechados. Opções CATALOGOS_DEMO_* sem seletor demo são recusadas. Aplicação completa com 43 contratos preservada fora desse modo.

Permitidos exclusivamente GET/HEAD / e /publico/lojas/loja-demo/catalogo; OPTIONS apenas nesses caminhos, com origem e método GET/HEAD aprovados. Outras 41 rotas, 15 mutações, admin, usuários, clientes, endereços, pedidos/WhatsApp, outras lojas, queries/aliases/traversal e métodos não listados são negados antes de controllers/services. Não monta routers privados nem importa Firebase Authentication no ramo demo. Resposta genérica de indisponibilidade, sem detalhes internos.

Dados reais ainda não revisados: exemplo mantém CATALOGOS_DEMO_CATALOG_APPROVED=0 e listas JSON CATALOGOS_DEMO_PRODUCT_IDS=[] / CATALOGOS_DEMO_CATEGORY_IDS=[]. Catálogo retorna 503 sem consultar Firestore; health não lê banco. Futuramente aprovação humana de valores concretos + flag 1 e listas explícitas (até 50 produtos/20 categorias) são obrigatórias. Nenhum ID real aprovado nesta ordem. Loja/categorias/produtos exigem ativo true, produtos vinculados às categorias aprovadas; DTO só loja id/nome, categorias id/nome e produto id/nome/descricao/preco/categoriaId/disponivel/imagem opcional HTTPS sem userinfo/query/hash. Sem contatos/endereços/clientes/pedidos/financeiro privado/usuários/metadados. Projeção não detecta toda PII em texto e aprovação por ID não congela documentos: alterações posteriores exigem suspender/revisar aprovação.

Leitura pontual por DocumentReference.get, sem varrer coleção ou chamar mutações/transações/Auth. Limite máximo 71 documentos por carga, resposta máxima 64 KiB, cache somente DTO 30 s e coalescência de concorrência. Limiter demo 60/min por peer/processo, 429/Retry-After; sem confiar em X-Forwarded-For/trust proxy aberto. Proxy pode agrupar usuários; cache/limite não são proteção distribuída ou teto de custo. R-023/R-007 permanecem abertas.

Frontend explícito VITE_CATALOGOS_RUNTIME_MODE=public-readonly-demo, VITE_CATALOGOS_DEMO_LOJA_ID=loja-demo, IDs/opt-in públicos bancorestaurante e mapa somente loja-demo. main carrega prévia separada; catálogo e filtro sem carrinho/checkout/Auth. Páginas privadas mostram indisponibilidade e não buscam dados; nunca aparentam pedido criado. Firebase Web Auth não inicializa mesmo com configuração pública presente; cliente API completo também tem gate defensivo. SDK Auth/API key não necessários à prévia. VITE_API_URL segue placeholder até existir URL real aprovada. Nenhum WhatsApp ou pedido real. Auth real por outros clientes é superfície independente, não desabilitada nesta ordem.

IAM: infra/render/iam-demo-readonly.proposta.json propõe papel personalizado somente datastore.entities.get, sem listagem/escrita/Auth/IAM; suficiência/permissões efetivas ainda precisam de validação autorizada, sem ampliar por conveniência. Identidade sugerida [identidade técnica histórica; referência integral preservada localmente] não criada/verificada. Secret fixo /etc/secrets/firebase-homologacao.json, nunca Git/VITE_*/logs; montagem real/rotação/políticas/IAM herdado pendentes. No modo demo, Firebaseauth.users.get não é necessário pelo caminho de execução; revogação do modo completo continua preservada.

Render proposto catalogos-api-homolog, Node24/Free/uma instância, raiz backend, npm ci/npm start, health /, Auto Deploy Off, PORT da plataforma; criar serviço/salvar secret pode iniciar deploy e exige autorização. CORS exato do exemplo https://catalogo-demo-cz1.pages.dev. Plano/região/limites da conta e URL API não comprovados. Nenhuma operação Firebase real/Rules/índices/Cloudflare/Render/IAM/chave/GitHub efetuada. Sem commit/push/deploy. Fluxo preparado: Cloudflare Pages → React demo sem Auth/checkout → HTTPS → Render → Express somente leitura → catálogo aprovado da loja-demo → Firestore bancorestaurante → DTO público → React.

Testes: backend342/342, React92/92, infraestrutura7/7; builds normal e demo aprovados. Teste novo Emulator aprovou catálogo, 41 contratos negados, outra loja, zero mutações pelo app e fixtures intactas; regressões 19–23 completas exit0. Fixtures foram escritas apenas em projeto demo- emulado com Java/JAR temporários; não no Firebase real. Logs brutos CLI podem conter env/tokens locais e não são distribuídos; evidências sanitizadas em docs/evidencias-ordem06. Fluxos completos anteriores continuam desenvolvidos para ambientes completos, indisponíveis na primeira demonstração.

Ressalvas preservadas: 25 IDs, 16 abertas e nove resolvidas localmente; R-025 conforme estado anterior. A05-01/A05-03 corrigidos localmente no modo restrito e cobertura de A05-02 reduzida no ramo demo, sem encerrar gates de IAM/dados/hosting/proxy/custos. Produção comercial permanece NO-GO. Próximo passo depende de revisão do proprietário: aprovar dados/IDs, validar IAM leitura/identidade e secret reais, depois revisar/sincronizar Git e autorizar publicação restrita/API/Cloudflare. Não alternar serviço demo para full por conveniência. Não criar projeto/banco nem alterar preços/planos comerciais.


## Ordem 07 — auditoria real de leitura — 15/10/2026

Relatório vigente: [VALIDACAO_DADOS_PUBLICOS_RENDER.md](VALIDACAO_DADOS_PUBLICOS_RENDER.md). Consulta autorizada ao projeto confirmado bancorestaurante, banco Native (default), região existente nam5, com ADC de usuário (e-mail nominal não identificado, impróprio como identidade Render). Foram 16 documentos únicos: loja-demo, quatro categorias e 11 produtos; 17 obtenções com releitura projetada de ativo da loja. Sem clientes/endereços/pedidos/ADM/usuários, outras lojas, escrita ou documentos completos nos relatórios.

Bloqueador crítico A07-01: Rules efetivamente publicadas diferem do deny-all local e permitem read sem autenticação também em clientes, endereços, pedidos e ADM da loja-demo; create/update têm apenas condições de campos, sem request.auth. Não foram exploradas permissões nem consultados documentos privados; isso não prova vazamento ocorrido. A API demo e IAM de leitura não corrigem acesso direto Firestore. Nenhuma Rule foi alterada.

Nove produtos e três categorias são candidatos técnicos, sem aprovação de publicação. A07-02: campo ativo ausente na loja impede catálogo (503). A07-03: seis URLs de imagem com query são omitidas pelo DTO, sem acesso remoto. A07-04: disponivel ausente nos 11 produtos é interpretado como true pelo código e requer confirmação. Listas preservadas vazias e CATALOGOS_DEMO_CATALOG_APPROVED=0.

SA proposta catalogos-api-demo-readonly não localizada (404); sem concessões diretas ao alvo na policy consultada, herança/permissões efetivas não comprovadas. datastore.entities.get atende à leitura pontual pela referência oficial, sem escrita/Auth; papel personalizado ainda é proposta, não isola por loja. Zero índices compostos nos grupos produtos/pedidos, sete locais ausentes; demo pontual dispensa esses índices. Evidências sanitizadas em evidencias-ordem07.

Fluxo preparado continua Cloudflare React demo → HTTPS/Render somente leitura → Admin SDK/IAM → catálogo aprovado loja-demo → DTO; o caminho direto do Web SDK obedece às Rules publicadas e apresenta risco independente. Nenhum push/deploy, credencial, IAM, alteração Firebase ou Cloudflare. Próxima fase exige autorização específica, priorizando correção/testes das Rules antes de liberar catálogo. Preservadas 25 ressalvas, 16 abertas/nove resolvidas localmente; R-005/R-006/R-007/R-023 abertas; vendas comerciais não liberadas. Os achados A07 não criam novos IDs R.


## Estratégia vigente — vitrine React original + Render — 15/10/2026

Vitrine permanente https://catalogo-demo-cz1.pages.dev, projeto Pages confirmado catalogo-demo, branch de produção main. Base original demo/src preservada; novo modo original-readonly-demo consome via HTTP os seis produtos/três categorias fictícios do Render e permite carrinho demonstrativo. Login/admin/checkout/pedidos reais bloqueados. Firebase não utilizado na nova integração e código completo preservado.

Implementação local: 110 testes React, build de produção e scanner textual aprovados. API real200/CORS oficial correto; origem exata de preview proposta recebeu403. Publicação interrompida pela divergência conforme instrução do proprietário: nenhum deploy, push, merge ou alteração CORS/Firebase/Cloudflare. Deployment anterior preservado para rollback. Nova integração ainda não demonstrativa publicada, não homologada online e não liberada comercialmente.

Relatório, configuração, limites dos testes, procedimento de rollback e plano das 16 ressalvas: [INTEGRACAO_VITRINE_ORIGINAL.md](INTEGRACAO_VITRINE_ORIGINAL.md). Este registro substitui a decisão de frontend simplificado como vitrine principal; histórico anterior preservado. Mantidos25IDs/16abertos/nove resolvidos localmente.


## Ordem 09 — definição permanente e organização — 15/10/2026

Demo formalizado como primeiro catálogo para cliente fictício, vitrine e base compartilhada. Fonte: demo/ React e backend/ Express do projeto completo; Firebase preservado. Inventário em [ORDEM_09_INVENTARIO.md](ORDEM_09_INVENTARIO.md), decisão em [DEFINICAO_OFICIAL_CATALOGO_DEMO.md](DEFINICAO_OFICIAL_CATALOGO_DEMO.md), resultados e próximos passos em [ORDEM_09_RELATORIO.md](ORDEM_09_RELATORIO.md). Alterações anteriores e histórico preservados. Sem exclusões, push, deploy ou alterações em infraestrutura remota. Mantidos 25 IDs, 16 ressalvas abertas e nove resolvidas localmente; esta ordem não resolve gates comerciais. Próximo: aprovar destinação dos artefatos, homologar publicação do React original e tratar ressalvas antes de liberação comercial.


### Ordem 09 — verificação final e continuidade — 15/10/2026

Definição oficial e inventário presentes foram revisados; oito documentos externos conferidos por hash e preservação integral do histórico. Removido somente import useState não utilizado de Carrinho.jsx; validador documental ampliado para AGENTS/definição/continuidade/Ordem09. Novos resultados: backend344, React110, infra8, carrinho focal9 (subconjunto), três scripts Emulator/HTTP/autorização aprovados com Java21 temporário; build final aprovado; instalação limpa dos dois lockfiles em /tmp sem lifecycle scripts; npm audit0 em ambos e scanner sem achados. git fsck exit0 com objetos dangling preservados, sem corrupção apontada. Nenhuma exclusão, push/deploy ou alteração Firebase/Render/Pages. Não encerrar R-011 por Java temporário nem os demais gates: 25IDs,16abertos,nove resolvidos localmente. Relatório final e função dos arquivos: [ORDEM_09_RELATORIO.md](ORDEM_09_RELATORIO.md). Próximo passo: revisão das exclusões propostas; publicação original/CORS e liberação comercial continuam etapas próprias.


## Ordem 10 — limpeza física e frontend renomeado — 15/10/2026

Decisão expressa do proprietário: `demo/` passa a `front-end/`; o esqueleto `frontend/` com sete .gitkeep foi excluído. Árvore completa movida, incluindo alterações locais anteriores; backend completo, Firebase, administração e jornadas preservados. CI, scripts de integração/emuladores e guias operacionais usam o caminho novo. Registros e evidências datadas mantêm caminhos antigos como histórico.

Limpeza executada: três logs locais, node_modules e dist do pacote frontend-demo-integrado e ZIP verificado contra esse dist. Fontes/evidências auxiliares e worktree Render preservados; não excluir sem decisão específica. Helper CDP consolidado e harness HTTP/Chrome existente ampliado para o React original. Workspace Catalogos.code-workspace abre somente a fonte oficial, sem esconder arquivos por configuração.

Sem alterações remotas, push ou deploy. Referência remota de build do Cloudflare ainda requer migração antes da publicação do novo caminho; não executar automaticamente. Render mantém branch de deploy própria, sem migração para o backend completo nesta ordem. Mantidos 25 IDs/16 ressalvas abertas/nove resolvidas localmente; testes locais não liberam o produto comercial.

Resultados atuais, arquivos alterados, resíduos removidos e candidatos pendentes: [ORDEM_10_RELATORIO.md](ORDEM_10_RELATORIO.md). Registros da Ordem 09 descrevem o estado anterior e não são a estrutura vigente.


Bloco C da Ordem 10 aprovado e executado: frontend-demo-integrado excluído apenas localmente após verificar backup e dependências. Fonte React permanece front-end/, Express permanece backend/, Render e Git preservados. Nenhuma ressalva encerrada, commit, push ou deploy. Ver [fechamento](ORDEM_10_RELATORIO.md#bloco-c-aprovado--exclusão-local-concluída).


Decisão final do proprietário no Bloco C: frontend oficial em frontend/, substituindo o nome transitório front-end/. Paths locais/CI corrigidos. Cloudflare ainda requer revisão futura do root demo → frontend. Nenhuma ressalva encerrada; sem implantação.


Ordem 12: o Catálogo Demo é nosso primeiro catálogo profissional, feito para um cliente fictício, utilizado como vitrine e como base reutilizável para os catálogos dos clientes reais. Frontend oficial em frontend/, backend completo preservado. Ambos os auxiliares foram removidos apenas localmente com backups; API mínima permanece recuperável pela branch de deploy. Docker agora inclui a fixture pública necessária; isso não resolve homologação real. Mantidos 25 IDs/16 ressalvas abertas/nove resolvidas localmente. Nenhum push/deploy ou alteração Firebase/Cloudflare/Render. Ver [auditoria e evidências atuais](ORDEM_12_RELATORIO.md).

## Plano vigente de correção — Ordem 11

Contagem preservada: 25 IDs; 16 abertos (R-001–R-014, R-023 e R-024); nove resolvidos localmente (R-015–R-022 e R-025). Nenhum encerramento nesta ordem. Resolução local não é homologação externa. Esforço abaixo é estimativa técnica preliminar (P: até 1 dia; M: 2–5 dias; G: mais de 5 dias), sem prazo contratual, incluindo dependência de operador/cliente.

| Sequência/ID | Criticidade/prioridade | Dependências | Risco aos dados | Impacto na publicação | Esforço | Evidência para validar |
| --- | --- | --- | --- | --- | --- | --- |
| 1 — R-011 Java/Emulator | Alta/P1 reprodutibilidade | Instalação Java 21 e CLI revisadas | Indireto; regressão não reexecutada | Gate de homologação completa, não desfaz vitrine fictícia | P | Java permanente/CI e suíte Emulator completa repetível |
| 2 — R-006 IAM/credenciais | Crítica/P0 | Operador, identidade, ambiente, backup | Acesso indevido/leitura/escrita ampla | Bloqueia backend completo no Firebase real | M | Permissões mínimas efetivas, negativas, montagem/rotação revisadas sem segredo nos logs |
| 3 — R-005 Rules/índices | Crítica/P0 | R-011, revisão modelo e autorização externa | SDK direto/consultas inadequadas | Bloqueia acesso real até publicação e comprovação | M | Rules negam acesso indevido, índices prontos e queries reais autorizadas |
| 4 — R-002 Auth/domínios | Alta/P0 | R-006 e domínio aprovado | Identidade e sessão | Bloqueia conta/admin/checkout real | M | Login, recuperação, revogação e origens em homologação autorizada |
| 5 — R-001 config Web | Alta/P1 | R-002 e ambientes/host definidos | Projeto errado/exposição de segredo | Bloqueia integração Firebase no React | P | IDs públicos coerentes, projeto esperado, sem segredo, ponta a ponta no domínio |
| 6 — R-003 dados loja-demo | Alta/P1 | Responsável pelos dados, R-006 | Publicação de PII/dados indevidos | Bloqueia leitura Firebase não revisada | M | Aprovação de DTO/IDs/textos e conjunto fictício sem PII |
| 7 — R-004 IDs legados | Alta/P1 se há legados | Inventário, backup, dono dos vínculos | Associação incorreta/perda de titularidade | Condicional à migração, sem inferir identidade | G | Dry-run, mapa comprovado, rollback e outra loja inalterada |
| 8 — R-008 PII/retenção | Alta/P0 | Proprietário/jurídico, inventário/backup | Exposição/retenção/exclusão indevida | Bloqueia operação comercial com dados pessoais | G | Política aprovada, acesso/retencão/exclusão e recuperação ensaiados |
| 9 — R-009 idempotência/retenção | Alta/P1 | R-008 e política de recuperação | Pedido duplicado/apagamento de vínculo | Bloqueia pedidos reais sem política validada | M | Reenvio, concorrência e recovery sem duplicação; TTL só após plano aprovado |
| 10 — R-024 suporte/equipe | Alta/P0 | R-006/R-002 e desenho aprovado | Acesso transversal privilegiado | Bloqueia suporte operacional irrestrito | G | Conta individual/escopo/tempo/aprovação/auditoria; sem superadmin implícito |
| 11 — R-007 abuso | Alta/P0 | R-023, provedor, limites Auth | Indisponibilidade/custo/abuso | Bloqueia exposição comercial sem proteção validada | G | Teste NAT/abuso/cotas e Auth direto, sem bypass |
| 12 — R-023 rede/proxy/distribuição | Alta/P0 | Borda/ingresso escolhidos, R-006 | Falsificação de origem/agrupamento/limites | Bloqueia garantia de proteção distribuída | G | Normalização de origem, ingress fechado e testes com múltiplos peers/instâncias |
| 13 — R-012 custo/capacidade | Alta/P1 | R-005/R-007/R-023, orçamento | Custo/indisponibilidade | Gate de SLA/comercial; não prometer escala/gratuidade | M/G | Carga autorizada, métricas/custo, alertas e recuperação medidos |
| 14 — R-010 dispositivos | Média/P1 | Fluxos integrados homologados | Erro de operação/checkout | Bloqueia aceite final de experiência | M | Chrome/Firefox/Safari e Android/iOS físicos, acessibilidade e rede adversa |
| 15 — R-013 rotas/hosting | Média/P1 | Build/configuração Pages e preview/CORS autorizados | Contexto incorreto por rota/host | Gate imediato da publicação da vitrine original | P/M | URL final, refresh profundo, host desconhecido, catálogo/detalhe/carrinho sem Firebase |
| 16 — R-014 licença/metadados | Média/P2 | Decisão do proprietário | Jurídico/distribuição | Resolver antes de distribuição contratada | P | Titular/licença/metadados aprovados e refletidos no pacote |

P0 designa bloqueio de segurança, não ordem rígida: dependências podem ser tratadas em paralelo por planejamento autorizado. A próxima publicação da vitrine fictícia tem escopo distinto da abertura do backend completo; não encerra essas ressalvas. Próxima prioridade imediata: revisar Pages root frontend/build e preview CORS com autorização, testar React original na URL oficial; depois promover funções completas gradualmente pelos gates do manual de implantação. Revalidar todas as decisões ao mudar de modo.


## MVP-00 — vínculo ao plano obrigatório — 16/10/2026

Conferidos 25 IDs únicos: 16 abertos (R-001–R-014/R-023/R-024) e nove resolvidos localmente (R-015–R-022/R-025). Status não alterados; registros históricos de R-025 não geram outro ID. Este arquivo permanece a fonte única dos status. [Plano pós-MVP](PLANO_POS_MVP_RESSALVAS.md) classifica todos os abertos e registra ambiente/impacto/dependências/correção/testes/horas/aceite/operação externa. [Plano MVP](PLANO_EXECUCAO_MVP.md) é a sequência vigente, substituindo a prioridade operacional anterior sem apagar evidência.

A07-01/R-005 continua bloqueador crítico documentado de Rules publicadas, sem nova verificação ou correção real nesta ordem. Nenhum dos 16 IDs é transferido integralmente ao pós-MVP por conveniência; R-004/014/024 têm gates condicionais ao legado/distribuição/suporte efetivamente habilitados. Migração, suporte transversal e escala não podem ser operados enquanto seu gate não for cumprido. Código aceita sessão anônima no checkout; contrato agora exige conta e-mail/senha, adequação e negativas em MVP-04/05/06, sem implementar nesta ordem. Comercial NO-GO.


## MVP-01 — evidências locais e bloqueios externos — 16/10/2026

Nenhum status alterado: 25 IDs,16 abertos,nove resolvidos localmente. R-013: SPA/rotas/refresh desktop/mobile aprovados localmente, root Pages ainda demo confirmado por GET; nova publicação e prova em URL final pendentes. R-010: Chrome com viewport mobile não substitui dispositivos físicos/homologação final. Origem oficial do Render GET200/OPTIONS204; preview proposta/localhost403; não ampliar CORS sem autorização. R-001/002 e demais funções privadas não foram habilitados. A07-01/R-005/006 permanecem gates do backend/Firebase, não corrigidos por vitrine de fixtures. [Relatório MVP-01](MVP_01_RELATORIO.md) e [manual](MANUAL_IMPLANTACAO.md) guardam evidências e próxima autorização. Sem mudança Firebase/Render/Cloudflare ou liberação comercial.


## Regra15 — responsabilidades sem alteração de status — 16/10/2026

[Plano pós-MVP](PLANO_POS_MVP_RESSALVAS.md) agora separa, para os16 abertos, investigação/correção/testes do Codex, atos manuais do proprietário, evidências, autenticação humana, impactos/autorizações e validação integrada. Aplicar [Regra15](../AGENTS.md#regra-oficial-15--divisão-de-execução-entre-codex-e-proprietário), sem transferir risco técnico ao proprietário ou adiar críticos. Nenhum item encerrado ou novo:25 IDs/16abertos/9locais preservados. Sem ação remota ou retomada MVP-01 nesta ordem.


## MVP-01-H1 verificada; upload da preview impedido — 16/10/2026

Proprietário confirmou nesta sessão: **Save and deploy concluído como Live** em catalogos-api-homolog, com as duas origens exatas aprovadas. Codex executou GET/OPTIONS no catálogo HTTPS real: oficial e vitrine-original retornaram 200/204 com Access-Control-Allow-Origin exato; origem https://origem-nao-autorizada.invalid retornou 403/403 sem ACAO. Evidência automatizada em [CORS pós-deploy](evidencias-mvp01/cors-pos-save-deploy.json). H1 concluída para aplicação/CORS; não repetir alteração no Render.

Candidato frontend/dist conferido integralmente contra os dez hashes do manifesto anterior, sem rebuild ou mudança de código. Cloudflare GET antes/depois confirmou produção 431180dc-3217-43ed-a93a-2da817437ad5, root demo, npm run build/dist, main automática e preview Git none preservados. Upload de assets pela conexão existente foi recusado com HTTP403/code8000013 Authorization failed, tanto na chamada autenticada direta quanto no fluxo com upload-token temporário obtido pelo endpoint do projeto. Token não registrado nem exibido. Nenhum POST de criação de deployment enviado; lista remota continua com somente a produção anterior. A falha é da autorização de upload nesta conexão, não do CORS do Render. Não houve rejeição do auto-review no upload: foi resposta da API Cloudflare. A tentativa HTTP inicial no sandbox falhou por DNS; reexecução com rede permitida aprovou os seis testes.

**Estado:** CORS aprovado; MVP-01-C1/H2 aguardam canal de upload autorizado e funcional; H3 (aceite visual do catálogo/carrinho) aguarda publicação e teste de navegador real. Não há URL nova publicada para homologar. Próxima ação: disponibilizar uma conexão Cloudflare capaz de concluir o upload de assets no projeto existente, preservando produção e sem enviar segredos no chat; retomar upload do mesmo candidato para branch vitrine-original, verificar alias/HTTP/navegador e só então solicitar H3. Autorização da preview já existe; não pedir novamente autorização de publicação isolada. Não alterar produção/root/build/automação, Firebase ou avançar MVP02. R-013 permanece aberta; demais riscos sem mudança.

Regra14: fontes/testes/artefato atual/backups/histórico preservados, sem exclusões ou resíduos próprios descartáveis. Somente documentação/evidências atualizadas; baseline/113 testes/build anteriores não repetidos porque não houve mudança do produto. Tempo técnico registrado nas evidências de sessão, sem atribuir tempo manual não informado. Sem stage/commit/push/deploy concluído; publicação e validação integrada permanecem pendentes.

## MVP-01-C1/H2 — diagnóstico de autenticação Cloudflare — 16/10/2026

A tentativa anterior usou o conector Cloudflare, não Wrangler local. Verificação mínima local sem valores privados: cf/cloudflare/wrangler ausentes no PATH; CLOUDFLARE_API_TOKEN/API_KEY/EMAIL/ACCOUNT_ID ausentes do processo; arquivos OAuth default.toml nos caminhos padrão/legado e default.enc no XDG padrão ausentes. Isso descreve o ambiente inspecionado, sem afirmar ausência de credenciais em todos os terminais/perfis. Conector não expõe se usa OAuth ou API Token nem sua policy. GET do projeto exato na conta e25a46a2984b821deefdef30785076e2 continua200: catalogo-demo, catalogo-demo-cz1.pages.dev, produção main/canônico431180dc-3217-43ed-a93a-2da817437ad5. Conta proprietária do recurso confirmada pelo endpoint. Não obtido nome público da conta.

Verificação /user/tokens/verify respondeu code1000 Invalid API Token, enquanto GET Pages permanece funcional. Não concluir expiração/revogação geral ou falta de Pages:Edit por esse endpoint: credencial do conector pode não ser compatível com verificação de token pessoal. Escopos de edição e causa exata da recusa de upload ainda não comprovados; possibilidades incluem permissões e limitação no encaminhamento do JWT de upload pelo conector. Nenhum upload repetido nesta rodada. CORS Render aprovado mantido sem chamadas/alterações. Sem mudança React/Firebase/produção, sem repetição dos113testes/baseline/build.

Decisão: preparar Wrangler fora das dependências do produto, em cache /tmp/catalogos-mvp01-npm-cache; proprietário estabelece login OAuth no terminal local pelo navegador. Não é renovação de login local existente comprovado. Comando de login final será registrado após conferir versão/ajuda. CLI autenticado permitirá whoami seguro e leitura do projeto/conta antes de qualquer upload; publicar depois somente frontend/dist identificado com --project-name catalogo-demo --branch vitrine-original --commit-dirty=true e conta explícita. Autorização da preview permanece válida; produção depende de aceite próprio.

Alternativa somente se OAuth não atender: painel Cloudflare → conta proprietária confirmada → Account API Tokens → Create Token → Custom Token; nome catalogos-mvp01-preview; única permissão Account / Cloudflare Pages / Edit e recurso somente a conta acima. Se painel de token de usuário oferecer Account Resources, Include / Specific account com a mesma conta; não selecionar todas as contas. Conferir campos vigentes antes de criar. Esse escopo é por conta e não deve ser apresentado como restrito apenas à preview/projeto. Não criar/revogar token nesta rodada. Proprietário preenche segredo diretamente em local seguro ignorado, nunca chat/Git/argumento. Fontes oficiais: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/ e https://developers.cloudflare.com/workers/wrangler/commands/general/.

Ação manual MVP-01-H2: autenticar Wrangler no navegador com a conta que contém catalogo-demo; login/2FA e consentimento pertencem ao proprietário (AGENTS, Regra15 item4). Estimativa2–5min; não publica/reinicia serviço nem muda custos. Confirmar somente “MVP-01-H2: login concluído” e horário, ou erro sanitizado. Não enviar token/código/URL de callback. Se campos/conta divergem, interromper somente login e informar. Sem revogar credenciais existentes. Codex retoma conferência técnica e preview após confirmação; H3 visual aguarda URL publicada/testada. R-013 e demais ressalvas permanecem abertas.

## MVP-01 — prévia publicada e navegador aprovado; aguarda H3 — 16/10/2026

MVP-01-H2: proprietário confirmou login OAuth concluído. whoami do Wrangler4.151.1 validou conta e25a46a2984b821deefdef30785076e2 e escopo pages(write); não foi necessário criar/revogar API Token. Identidade nominal/credenciais não copiadas para os registros. Falha inicial de whoami no sandbox foi rede, não auth; execução com rede permitida aprovou. O bloqueio anterior de upload foi superado pelo canal local OAuth; isso não comprova a causa interna exata do403 do conector.

Publicado exclusivamente o candidato de dez arquivos do manifesto anterior (hashes locais conferidos, sem rebuild) com `pages deploy frontend/dist --project-name catalogo-demo --branch vitrine-original --commit-hash 7ee32b469ff636e371897f7397cf19ecc5ae5ec7 --commit-dirty=true`, conta explícita. Wrangler enviou nove assets e _redirects, sucesso. Deployment **b44264f9-6ad7-4a4d-b7d1-acb33f2f45ac**, ambiente **preview**, alias **https://vitrine-original.catalogo-demo-cz1.pages.dev**. Não usar a URL hash como origem de teste Render: somente alias autorizado em CORS.

GET Cloudflare antes/depois confirmou produção **431180dc-3217-43ed-a93a-2da817437ad5**, branch main, root demo/build npm run build/dist, automação de produção e previews Git none preservados. Fonte/produção não promovidas. [Recibo remoto](evidencias-mvp01/preview-cloudflare.json). Nenhuma alteração Render/Firebase, stage/commit/push, nova permissão remota ou MVP02.

Chrome real na origem publicada, sem interceptação/bypass CORS: catálogo6produtos, filtro Bebidas2, detalhe Prato da casa, carrinho20→40→refresh40→20→vazio, checkout desabilitado e gates /admin,/checkout,/login,/perfil aprovados em1440×900 e390×844. GET200/OPTIONS204 Render observados; zero exceções JS/consoleErrors/requisições Firebase, apenas GET/OPTIONS para API pública e nenhuma escrita remota. [Recibo de navegador](evidencias-mvp01/preview-publicada/preview-navegador.json); quatro capturas preservadas. Capturas desktop e carrinho mobile inspecionadas; desktop registra revalidação transitória durante captura, fluxo funcional provado pelo JSON. Homologação visual pelo proprietário permanece separada.

Arquivo permanente novo `quality/frontend/scripts/preview-publicada.cjs` verifica o alias exato em navegador real e recusa operação fora dessa origem; integra helper Chrome que remove seu perfil próprio no finally. Registrado opt-in em quality/run.cjs e frontend/package.json (`test:preview:vitrine`), documentado em quality/README.md. Não entra no bundle publicado nem executa automaticamente junto aos113testes. Executado diretamente nesta rodada; cadastro do comando conferido sem repetir suíte. Testes históricos/build/baseline mantidos, sem alteração do produto.

Diagnóstico GET urllib recebeu403/error1010 nos endereços da preview; navegador real completou os fluxos. Não alterar proteções Cloudflare nem declarar esse cliente HTTP aprovado. Integridade dos arquivos publicados e rotas SPA verificada separadamente em Chrome; resultado no recibo HTTP quando concluído. Sem mascarar falhas ou tratar upload como prova de UI.

Estado: **prévia publicada e validação integrada do navegador aprovada; aguarda MVP-01-H3 (aceite visual)**. Próxima ação manual: abrir alias, conferir cardápio/filtro, detalhe, adicionar produto disponível e variar/remover quantidades do carrinho; confirmar aparência desktop/mobile. Restaurante fictício e carrinho demonstrativo; checkout/login/admin indisponíveis por modo. Responder “MVP-01-H3: prévia aprovada” ou descrever problema/rota/dispositivo, sem dados privados. Estimativa10–15min. Julgamento comercial pertence ao proprietário (Regra15 item4). Aceite da prévia não autoriza produção; publicação oficial exige ato próprio posterior. R-013 recebe prova da preview, mas permanece aberta até validação da URL oficial; demais ressalvas inalteradas. Não avançar MVP02.

Regra14: fontes/artefato/backups/credenciais/histórico preservados. Nenhuma exclusão de conteúdo existente; perfil Chrome temporário removido pelo helper após os ensaios. CLI/cache/atalho/logs privados mantidos para operação/diagnóstico, sem distribuí-los ou registrar segredo. Sem limpeza destrutiva ou pendente de aprovação. Documentos de continuidade e espelho externo atualizados; validação final/Git registrados nesta continuação.

## Evidência R-013 — publicação oficial MVP-01 — 16/10/2026

Produção ac720402 publicada com autorização e mesma versão da preview aprovada. URL oficial/cardápio/detalhe/carrinho/refresh/gates desktop e mobile aprovados em Chrome real, hashes/DTO Render6produtos3categorias conferidos. Rollback431180dc preservado. Prova técnica pública acrescentada: docs/evidencias-mvp01/oficial-publicado/preview-navegador.json e oficial-cloudflare.json. R-013 continua em análise até aceite visual final e gates pertinentes; R-010/dispositivos físicos e demais riscos não fechados por publicação de fixtures. Não alterar contagem/status dos demais IDs; sem liberação comercial.
