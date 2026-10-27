# Ordem012 — resultado final da limpeza — 26/10/2026

Estado: LIMPEZA E REINÍCIO CONCLUÍDOS, com resultado real verificado. Publicação posterior expressamente autorizada pelo proprietário em preparação. As entradas abaixo deste adendo são evidência histórica; pendências012-H1/H2 nelas citadas foram atendidas pela confirmação posterior: todos os pedidos antigos eram testes, sem compromissos comerciais externos, e os18 anônimos estão incluídos desde que não compartilhados. Não houve repetição das64 exclusões Firestore/sete Auth anteriores.

## A — EXECUÇÃO PELO CODEX — adendo final

1. Inventário novo somente leitura:39 documentos e21Auth, exatamente o estado após a primeira limpeza; nenhuma conta/pedido/referência nova. Um banco Firestore, uma webApp inalterada, nenhum aplicativo Android/iOS, outra loja ou referência aos18anônimos nos documentos recursivos. Os18 não têm provedores/e-mail/telefone/claims ou privilégios. A API Auth não fornece loja de origem para anônimo sem vínculo; delimitação usa a confirmação expressa do proprietário, confronto com inventário anterior, ausência de referências e consumidores verificados. Não é prova universal sobre integrações externas desconhecidas. Nenhum indício concreto de outro consumidor apareceu.
2. Backup adicional privado private-backups/ordem012-finalizacao-20261026, diretório700/arquivos600, sem sobrescrever private-backups/ordem012-20261026. Snapshot39documentos/21Auth, hashes, configurações, manifesto e journal privados; integridade conferida antes da execução. ManifestoSHA256703aa295bbae1b9a0ea04c45f125aaf5103401e9cbfa28d6c11c7d51e8a4df7e: somente18Auth e atualização do contador, zero documentos para excluir. Todos os backups permanecem fora do Git.
3. Restauração e reversão em Emulator:170checks aprovados com39documentos/21identidades/2hashes de senha. Os18anônimos foram excluídos e reimportados, mantendo UIDs. Login administrativo com conta sintética e gate real do produto, negação ao cliente, cadastro e persistência de perfil, novo login cliente, bloqueio de numeração, tentativa direta de reset negada, concorrência#1/#2, pagamento pendente e idempotência aprovados. CreateTime/updateTime do servidor e sessões/tokens antigos não são restauráveis pela importação. Nenhum dado sintético foi gravado em produção.
4. Execução real:18Auth removidos individualmente com journal, após revalidar identidades, preservando três administradores. Contador técnico temporariamente pausado no limite das Rules existentes; nenhuma Rules foi alterada. Após comprovar novamente ausência de pedidos/pedidos_legado/clientes/idempotências/reservas e igualdade dos38documentos protegidos, contador reiniciado para0 em2026-10-27T00:28:45.504961Z (26/10 às21:28:45 Brasília). Leitura final00:28:57.595Z confirma somente três administradores,39documentos, zero pedidos/perfis/contasclientes e próximo número1. Produtos/categorias/imagens/preços/configurações/projeções/revisão comercial e permissões preservados. Rules/configuraçãoAuth/índices conferidos iguais; IAM não foi alterado.
5. Dez checks Chrome públicos aprovados: catálogo390/1366px sem transbordamento, carrinho apenas local, formulário de cadastro presente, admin protegido com entradaGoogle e nenhuma escritaFirestore/exceçãoJS. Endpoints de criaçãoAuth/Firestore e mensagens bloqueados no navegador efêmero. Cadastro/login/checkout integrado testados no Emulator; não foi feito login pessoal em produção nem uma compra/cadastro real só para testar, preservando a base limpa. Esses limites não equivalem a homologação comercial pessoal.

| Recurso | Resultado real final |
| --- | --- |
| Pedidos antigos e seus históricos | Zero restantes;64documentos da primeira execução não foram excluídos novamente |
| Perfis/endereços/contas antigas de clientes | Zero restantes |
| Contas Auth | Três administradores preservados;25clientes/anônimos removidos no total (7+18) |
| Contador | ultimo=0; próximo pedido válido será#1 |
| Catálogo e demais documentos protegidos |38 documentos iguais; contador é o39º documento |
| Recuperação | Dois backups privados preservados;319checks da primeira fase e170novos deste adendo, sem somar como nova execução única |

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

012-H1 e012-H2 atendidas pela confirmação expressa, sem pedir autorização repetida. Identificação dos dois outros administradores e eventual exclusão são operações separadas, fora desta ordem.012-H3 (sessão pessoal/aceite comercial/primeira compra real) não foi automatizada; continua como uso/julgamento do proprietário, sem pendência técnica para a limpeza. Não é necessário criar pedido para comprovar contador0: leitura real e ensaio transacional no Emulator são evidências distintas. Uma próxima compra normal consumirá#1 e deixará a base de pedidos legitimamente não vazia.

## Arquivos e validação deste adendo

- quality/firebase/ordem012-finalizar.cjs: modos --prepare (somente leitura/backup), --apply (18UIDs exatos + contador, variável explícita de autorização) e --verify (leitura final). Precondições de versão do contador, hashes, recuperação, comparação integral de documentos/identidades/configurações, janela temporária de bloqueio, journal privado e liberação em erro. Não roda em CI/build nem exclui administradores/documentos comerciais.
- quality/frontend/scripts/ordem012-finalizacao-emulator.mjs e quality/firebase/executar-ordem012-finalizacao-emulator.cjs: ensaio local exclusivo, restauração/reversão dos18alvos e fluxos reais do serviço com identidades sintéticas.
- quality/frontend/scripts/ordem012-publico-readonly.cjs: --finalization grava recibo distinto e confere também formulário de cadastro; provas anteriores preservadas.
- ORDEM_012_FINALIZACAO_PREPARO/EMULATOR/EXECUCAO/PUBLICO.json: evidências sanitizadas da preparação,170checks, leitura real e10checks públicos. Nenhuma identidade privada, hash de senha ou chave foi publicada.

Comandos executados: node quality/firebase/ordem012-finalizar.cjs --prepare; node quality/firebase/executar-ordem012-finalizacao-emulator.cjs; node --test --test-isolation=none --test-reporter=spec quality/firebase/test/ordem012-core.test.cjs (3/3); execução --apply com CATALOGOS_ORDEM012_FINALIZAR preenchida no ambiente; node quality/frontend/scripts/ordem012-publico-readonly.cjs --finalization. A mensagem PERMISSION_DENIED do Emulator é o caso negativo esperado de reset direto pelo cliente, seguido de aprovação dos170checks. Nenhuma falha real na exclusão/reset. Tempo técnico desta retomada sem cronômetro integral; journal registra horários reais, sem inventar tempo. Nenhum novo plano/MVP ou mudança runtime. Publicação autorizada será registrada no fechamento abaixo.

---

# Histórico preservado da execução e publicação anteriores

# Ordem012 — limpeza controlada de dados de teste

Estado: LIMPEZA DELIMITADA EXECUTADA E VERIFICADA; ORDEM012 AINDA PENDENTE de classificação das18 contas e confirmação para reiniciar em#1. Não declarada concluída integralmente.

Autorização específica: pedido anexado pelo proprietário em26/10/2026, Firebase bancorestaurante/(default), loja-demo. Abrange pedidos/clientes antigos, dados técnicos exclusivamente associados e contas Auth comprovadamente exclusivas de clientes. Preservar administrador proprietário, demais contas administrativas/técnicas/compartilhadas, catálogo, configurações, revisão comercial, Rules, índices, IAM, frontend e Cloudflare. Sem commit/push/deploy nesta ordem. A limpeza antes adiada na Ordem011 foi retomada, com o escopo ampliado expressamente pelo proprietário.

## A — EXECUÇÃO PELO CODEX

- 012-C1: inventário consistente e backup privado:103 documentos Firestore e28 contas Auth; arquivos modo600 em diretório700, fora do checkout Git publicado. Captura contém dados pessoais e material de recuperação Auth, nunca encaminhar ao Git/chat.
- 012-C2: identidade do proprietário confirmada em Auth e autorização atual da loja, confrontando UID histórico da concessão administrativa. UID completo somente no manifesto privado; resumo público usa SHA256. Foram localizados outros dois administradores (um ativo, um inativo), protegidos de exclusão.
- 012-C3: restauração testada em Emulator exclusivo:103 documentos,28 identidades e6 hashes de senha, com319 verificações aprovadas. IDs, tipos, referências, campos, UID, provedores e hashes recuperados; createTime/updateTime gerados pelo servidor e sessões/tokens antigos não são restauráveis por importação de dados. Reversão de exclusões Firestore/Auth exercitada localmente. Três testes adicionais da política de seleção/preservação aprovados.
- 012-C4: manifesto privado64 documentos:21 documentos de clientes (8 perfis, incluindo o perfil de cliente separado do proprietário),23 de pedidos (14 pedidos e9 descendentes),8 pedidos_legado,7 idempotências,3 reservas e2 documentos usuarios de clientes. Sete contas Auth com vínculo exclusivo comprovado;18 contas anônimas sem vínculo e2 administrativas preservadas como exceções. Produtos/categorias/projeções/revisão comercial/autorizações administrativas não entram no manifesto.
- 012-C5: bloqueio temporário de pedidos usa SOMENTE contador técnico ultimo=999999999. Rules efetivamente publicadas e gravador recusam novos números nesse estado; nenhuma Rules/configuração comercial é alterada. Testes confirmaram bloqueio, tentativa direta negada, reset local e concorrência #1/#2, idempotência e pagamento pendente. Reinício real em#1 depende da confirmação sobre compromissos externos; enquanto não houver, restabelecer ultimo=3, sem reutilizar números por presunção.
- 012-C6: primeira execução real interrompida por timeout em locked-preflight, antes de excluir documentos/contas. Contador pausado às20:31:05 e restabelecido em3 às21:01:43, Brasília. Journal confirma zero exclusões. Retomada solicitada pelo proprietário; leitura recursiva passou a usar lotes limitados de seis requisições e prazo explícito por requisição. Novos testes de política aprovados; revalidar estado inteiro e versões antes de retomar. Não repetir passos com recibo de sucesso.
- 012-C7: execução real CONFIRMADA. Em26/10 às21:09:43, Brasília, um commit Firestore atômico removeu64 documentos nas versões do manifesto. Sete contas Auth de clientes removidas individualmente com journal. Leitura final às21:10:18 confirmou39 documentos restantes,21 contas Auth, zero pedidos (incluindo legado), zero perfis de clientes e38 documentos protegidos idênticos. Sua identidade Google/UID/e-mail/provedores/autorização, os dois outros administradores, catálogo e configurações foram preservados. Contador pausado às21:09:22 e restabelecido em3 às21:10:06, janela de aproximadamente43,38s. Nenhum pedido real de teste criado. Nove verificações públicas aprovadas para catálogo390/1366px, carrinho local e entrada administrativa protegida/Google; autenticação pessoal e checkout real não foram automatizados.

### Quantidades e estado final

| Recurso | Resultado confirmado |
| --- | --- |
| Pedidos principais |14 removidos |
| Pedidos arquivados em pedidos_legado |8 removidos |
| Históricos de pedidos |9 documentos removidos |
| Perfis de clientes |8 removidos:7 de clientes e1 perfil separado do administrador, sem remover sua autorização |
| Endereços/tentativas dos clientes |13 documentos removidos |
| Idempotências |7 removidas |
| Reservas de numeração |3 removidas |
| Documentos usuarios de clientes |2 removidos; autorizações administrativas preservadas |
| Total Firestore |64 documentos removidos;39 preservados, incluindo contador |
| Auth |7 clientes removidos; proprietárioGoogle +2 administradores +18 contas anônimas incertas preservados |
| Contador |ultimo=3; próxima criação seria#4; NÃO foi reiniciado em#1 |

A reconciliação interna não encontrou reservas/pedidos sobreviventes nem referências Firestore preservadas aos documentos removidos. A ausência de compromissos EXTERNOS ainda precisa da declaração do proprietário. Não converter a autorização de limpeza em comprovação dessa informação. O estado atual não cumpre “apenas uma conta administrativa” porque outras duas contas administrativas estão protegidas pelo escopo da própria ordem. Sua exclusão intencional exigiria delimitação própria; não foi presumida.

O Dashboard encontra base de pedidos vazia, portanto não há valores de pedidos antigos para totalizar. O estado visual autenticado do Dashboard/pedidos/clientes não foi declarado homologado: depende da sessão pessoal do proprietário, embora os dados e as permissões tenham sido conferidos diretamente.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

- 012-H1: confirmar se todos os números antigos, inclusive pedidos enviados por WhatsApp, podem ser encerrados como testes sem entrega/cobrança/compromisso comercial pendente. Pergunta apresentada; resposta ainda não recebida. É condição factual da seção5 da ordem, não repetição da autorização de exclusão.
- 012-H2: classificar18 contas anônimas sem perfil/vínculo Firestore como testes exclusivos desta loja, ou mantê-las preservadas. Pergunta apresentada; resposta ainda não recebida. A seção6/9 manda preservar recursos de origem incerta. As duas outras contas administrativas continuam protegidas pelo próprio escopo.
- 012-H3: após encerrar a limpeza e resolver numeração, proprietário confere sua sessão Google no painel e faz a primeira compra real. Não automatizar login pessoal ou criar conta/pedido real nesta validação. Dados de login/2FA nunca são solicitados.

## Arquivos, comandos e evidências

quality/firebase/ordem012-inventario.cjs: exportação REST somente leitura, paginação recursiva inclusive pais ausentes, snapshot readTime, Auth e configurações de preservação. quality/firebase/ordem012-core.cjs: seleção pura, proteções, transformação de importação Auth e hashes. quality/firebase/ordem012-preparar.cjs: manifesto privado e resumo sanitizado. quality/firebase/ordem012-executar.cjs: execução delimitada, precondições de versão, pausa/reabertura do contador, exclusões atômicas Firestore, exclusões Auth individuais, retomada por journal e verificação direta. quality/frontend/scripts/ordem012-emulator.mjs e quality/firebase/executar-ordem012-emulator.cjs: recuperação, exclusão/reversão, contador e concorrência exclusivamente locais. quality/firebase/test/ordem012-core.test.cjs: negativos de identidade/escopo e preservação. Nenhum fonte runtime do frontend foi alterado.

Comandos: node quality/firebase/ordem012-inventario.cjs; --finish completa leituras sem repetir exportações; node quality/firebase/ordem012-preparar.cjs; node quality/firebase/executar-ordem012-emulator.cjs; node --test --test-isolation=none --test-reporter=spec quality/firebase/test/ordem012-core.test.cjs; execução administrativa limitada por CATALOGOS_ORDEM012_AUTORIZADA=bancorestaurante/loja-demo e manifesto/hash.

Falhas corrigidas: listagem de índices com parâmetro recusado, removido na conclusão somente leitura; resolução de exports do Admin SDK corrigida antes de qualquer exclusão; timeout da primeira execução acionou liberação do contador. Nenhum segredo foi impresso. Tempos técnicos integrais não foram cronometrados; timestamps de operação constam do journal; espera/interrupção não equivale a trabalho técnico efetivo. Estimativa30–60min do pedido não substitui gates.

Evidências sanitizadas: ORDEM_012_INVENTARIO_EVIDENCIAS.json, ORDEM_012_MANIFESTO_EVIDENCIAS.json, ORDEM_012_EMULATOR_EVIDENCIAS.json, ORDEM_012_EXECUCAO_EVIDENCIAS.json. Backup e journal privados: private-backups/ordem012-20261026/, excluídos de Git. integrity.json guarda checksums SHA256 e quantidades. Não apagar estes backups.

Próxima tarefa exata: receber012-H1 e012-H2. Se confirmada ausência de compromissos externos, revalidar pedidos/reservas/contador imediatamente antes de resetar somente o contador para0; se houver pedido novo ou referência sobrevivente, preservá-lo e interromper o reset. Para as18 contas, confirmar exclusividade e preparar adendo delimitado/revalidado, sem atingir os dois administradores protegidos. Não repetir exclusões com recibo de sucesso. Sem novo MVP, nova arquitetura, reset inseguro, exclusão de administradores/contas incertas, pedido real automático ou publicação. Atualizar estado com leituras reais antes de qualquer declaração de conclusão.

## Fechamento e preservação

A primeira tentativa de retomada foi impedida por expiração da revisão automática ANTES de iniciar o processo. A única repetição permitida foi aprovada e executada. Não houve nova autorização de exclusão pedida ao proprietário nem desvio do escopo. Backup/integridade conferidos novamente após as exclusões; arquivos privados permanecem modo600/diretório700 e ignorados pelo Git. O checksum de cada exportação consta de integrity.json e do resumo sanitizado ORDEM_012_ENCERRAMENTO_EVIDENCIAS.json. UID completo e dados pessoais ficam somente nos arquivos privados.

Código-fonte runtime e Cloudflare não foram alterados. Os únicos arquivos técnicos novos são ferramentas administrativas/testes em quality; documentação permanente atualizada localmente. Main de publicação permanece limpa emc46fa4e, sem stage/commit/push/deploy nesta ordem. NoveMVPs, B-03/B-04/fotos e demais gates não recebem baixa por associação. O espelho externo continua ausente, não recriado. Helpers encerraram seus próprios Emulators/Chrome; nove logs transitórios desta rodada foram removidos após os resumos, preservando provas estruturadas, scripts e backups. Varredura textual dos15 arquivos novos de ferramentas/evidências/relatório sem padrões sensíveis; fontes runtime conferidos byte a byte iguais à cópia publicada. A conferência documental posterior à limpeza foi aprovada. Sem limpeza importante aguardando aprovação. Inventário/índice são regenerados e conferidos por node quality/docs/documentacao.cjs --write e --check.

As duas perguntas factuais já apresentadas continuam sem resposta; nenhum prazo decorrido foi tratado como confirmação. Não há bloqueio técnico remanescente para o escopo64/sete já executado. Restam os gates humanos012-H1/H2 e o julgamento/autenticação pessoal012-H3; a primeira compra real cabe ao proprietário depois de definir a sequência.

## Publicação posterior autorizada pelo proprietário

A instrução expressa “publique tudo na main ... cloudflare”, posterior à limpeza, autoriza commit/push main LucasTech-Dev/Catalogos e Pages catalogo-demo. As menções anteriores “sem commit/push/deploy” descrevem o encerramento da limpeza antes desta nova autorização. Esta publicação não executa novamente os utilitários administrativos, não reinicia numeração, não exclui contas incertas e não altera Rules/IAM/dados.

Release contém oito ferramentas/testes, seis evidências sanitizadas, este relatório e entradas da etapa nos guias já presentes na main; backups/manifesto/journal/credenciais permanecem privados. Guias integrais históricos locais, inventário integral e espelho externo ausente não são incorporados em massa. Runtime frontend idêntico à release anterior. Scripts administrativos exigem backup privado, identidade autorizada e dependências locais backend; não rodam durante build/deploy. Provas de Emulator anteriores são reutilizadas com sua versão/ambiente; teste puro da política é reexecutado na integração. Verificador público aceita --publication para gravar recibo distinto e preservar a evidência anterior.

Rollback de código/documentação: main c46fa4e8f88abdaeb812420e4cdeda91fe25361b; a recuperação de dados é independente e exige o backup privado validado, nunca um rollback do frontend. Próxima tarefa012-H1/H2 permanece inalterada. Resultado do Pages e validação pública serão registrados após a publicação.

### Resultado da publicação

Commit16302429f3bc85b1e876cd69b88073d1283120ff na main; deployment automático630928da-8b6b-432d-9a9a-f548aaa3cf63 do Pages catalogo-demo success em2026-10-27T00:21:50.328955Z (26/10 às21:21:50 Brasília). Nove checks públicos Chrome aprovados após deploy em00:22:19Z, sem gravações/contas/pedidos reais. Build homologacao aprovado em9,61s (aviso de chunk grande existente), três testes puros aprovados na cópia integrada e sintaxe das oito ferramentas aprovada. Scanner oficial encontrou limitação spawnSync git EPERM no sandbox; mesma lista Git e mesmos padrões executados separadamente,393arquivos sem achados. Conferência documental integral local1925documentos e checker da release aprovados. Comparação de runtime confirma igualdade ignorando sete marcadores vazios.gitkeep presentes somente na main. Requisição HTTP auxiliar urllib recebeu403; navegação Chrome posterior efetiva aprovada, sem presumir sucesso HTTP do cliente recusado.

Recibos ORDEM_012_PUBLICACAO_EVIDENCIAS.json e ORDEM_012_PUBLICACAO_PUBLICO_EVIDENCIAS.json publicados no commit documental de fechamento. Este commit posterior não altera runtime; verificar seu deployment separadamente. Nenhuma nova escrita Firebase, exclusão, reset ou alteração Rules/IAM/Auth. Backup privado íntegro permanece preservado. Resultado da publicação concluído; pendências012-H1/H2/H3 e limites da limpeza permanecem abertos.
