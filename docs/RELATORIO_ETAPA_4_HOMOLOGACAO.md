# Etapa4 — Banco, segurança e homologação da matriz

Execução local autorizada pelo anexo atual “ETAPA4 — BANCO DE DADOS, SEGURANÇA E HOMOLOGAÇÃO FINAL”. Início28/10/2026 America/Sao_Paulo; recibos usam UTC e podem indicar29/10. [Plano oficial](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md). Estado: **CONCLUÍDA TECNICAMENTE NO AMBIENTE LOCAL/EMULATOR**; não confundir com implantação/aceite real.

## A — EXECUÇÃO PELO CODEX

### Contrato e escopo

Revisados os contratos do provisionador/serviços/Rules à luz das Etapas1–3 e Ordens012/013. Estrutura definitiva permanece a tabela de [PROVISIONAMENTO_LOJAS](PROVISIONAMENTO_LOJAS.md): raiz loja com configuração comercial, categorias/produtos e projeções públicas, clientes/endereços/tentativasCompra, pedidos/historicoAdministrativo, contadores/pedidos, numerosPedidos, idempotencia, controleCompra/versao e usuarios/UID explícito. Seed cria somente cinco documentos; demais nascem pelos serviços conforme uso. Não há coleção extra de financeiro/configurações. Nenhuma incompatibilidade concreta exigiu alterar código comercial, schema, Rules ou índices nesta etapa.

A mesma matriz React é compilada para duas configurações sintéticas e ligada ao Auth/Firestore Emulator, sem mock de serviços/contextos. Clientes, marcas, produtos, administradores, WhatsApp, pedidos e sequências são próprios. Simulação Google usa credencial fictícia aceita exclusivamente pelo Auth Emulator; não representa OAuth real. Link WhatsApp é conferido, sem envio.

### Tarefas e evidências

| ID | Objetivo / arquivos | Pré-requisito e dependência | Resultado / teste |
| --- | --- | --- | --- |
| E4-A1 | Preservar contrato/schema e isolamento, reutilizando servicos-multiloja-emulator.mjs e provisão da Etapa2 | Etapas1–3 locais, projetos demo-/loopback | Recibos novos separados dos anteriores |
| E4-A2 | homologacao-etapa4.mjs: ataques diretos SDK, B03, consultas/paginação e backup | Rules candidata local, atores sintéticos | APROVADO no recibo correspondente |
| E4-A3 | homologacao-etapa4-browser.mjs: Home/cardápio/marca/imagem/login/carrinho/observações/checkout/pedido/WhatsApp/admin de ambas lojas | Chrome local, React e SDK reais no Emulator | APROVADO no recibo correspondente |
| E4-A4 | backup-emulator.mjs e backup-emulator.test.jsx: tipos/integridade/restauração sem sobrescrita, alvos e limites | Loja sintética quiescente, projeto demo- distinto | APROVADO no recibo correspondente |
| E4-A5 | indices-consultas.json: oito índices e inventário dos16 formatos de consulta | Fontes de catálogo/pedidos/admin/perfil | Hash/definições conferidos automaticamente; produção pendente |
| E4-A6 | etapa4-rules-readonly.cjs: comparação GET-only | Credencial existente, autorização explícita de leitura do anexo |2GET aprovados; zero mutações/leituras de dados comerciais |
| E4-A7 | Guia de implantação, registros oficiais e inventário | Evidências e documentação de provedores | APROVADO no recibo correspondente |

### Rules, B-03 e B-04

Leitura atual em2026-10-29T00:54:03.627Z: publicado71ca854897cae61da43c880a9e6ced50fdc269a013f84d39fafec781bb661175; candidata local80d4a14ca316cd3ead0112d9ef9dca73c2e018da9f3da88cb04013f1db5fe147. Publicado continua igual à Ordem013. [Recibo GET-only](ADAPTACAO_SERVERLESS/ETAPA4_RULES_LEITURA.json). Diferença B-03 é funcional, não quebra de linha. Não houve publicação. A candidata local permite desativar/reativar categoria com origem/projeção/revisão; produtos e snapshots históricos são preservados, catálogo público oculta a categoria e seus produtos, exclusão física continua negada. Flag remota permanece false até ato autorizado/verificado.

B-04 conserva gravação transacional por dia e grupos, não atomicidade semanal. Ensaio permanente reaproveitado verifica um/sete dias, entrada inválida antes de qualquer escrita, ataques SDK, falha real provocada por restrição adicional somente local, estado parcial declarado, projeção consistente e retomada, além de conflito concorrente. Nenhuma proteção é afrouxada na candidata comercial.

### Consultas e índices

[Manifesto legível por máquina](../quality/fixtures/provisionamento/indices-consultas.json) relaciona coleções, filtros, ordenação, índices compostos e índices simples/merging. Índices1/2 status/data ASC/DESC;3/6 pagamento/data/status (6 inclui sum total);4 categoria/ativo preservado;5 data/total;7 ativo/disponível;8 ativo/categoria/preço. Nenhum índice por ID de loja ou collectionGroup global. Histórico cliente combina clienteId/lojaId sem ordenação; admin usa cursor/limit e filtro de cliente ou número; histórico administrativo revisaoDESC. Dashboard confirma count/sum/status/período/disponibilidade. Não se inventa índice para filtros locais.

Emulator valida consultas, Rules e resultados, mas não comprova índices reais. Antes da primeira entrega: publicar conjunto aprovado especificamente no projeto do cliente, aguardar READY e executar os formatos da aplicação no alvo; erro missing-index bloqueia entrega. Nenhum índice remoto foi consultado/criado nesta ordem.

### Backup e recuperação

Manifesto inicial, hash e seed imutável compõem a reprodução da instalação vazia. Backup adicional exporta recursivamente dados sintéticos da loja em uso e vínculo administrativo explícito, preserva fields REST incluindo timestampValue e restaura em outro projeto Emulator com commit único/precondição exists:false. Não contém credenciais Auth e não exporta identidades. Verifica hash integral, recusa adulteração, destino ocupado e escrita acima de450documentos, simula falha antes e perda real da resposta depois do commit; confirmação ocorre por nova exportação/hash, sem apagar/restaurar por cima.

Limites deliberados: exportação por leituras requer ausência de escritores concorrentes para consistência; até450documentos para uma restauração atômica; sem migração de referências, identidades Auth ou ferramenta de produção. [Guia de implantação](GUIA_IMPLANTACAO_NOVA_LOJA.md) exige exportação privada apropriada/ensaio isolado e autorização antes de restauração real, incluindo Auth/UIDs, Rules/índices/configuração e materiais. Não confundir rollback de código com redução de contador/remoção de pedidos.

### Comandos e resultados atuais

Resultados novos desta execução: **168checks SDK +32Chrome** em155,434s na homologação consolidada; **110checks de provisionamento** em24,902s (incluindo backup inicial/restauração das duas lojas); **91checks B-04**. **379testes/35arquivos** em215,86s, build19,48s, scanner e31checks pontuais posteriores aprovados. Não somar os31como testes novos: são subconjunto. [Homologação](ADAPTACAO_SERVERLESS/ETAPA4_HOMOLOGACAO_EMULATOR.json), [seed e backup inicial](ADAPTACAO_SERVERLESS/ETAPA4_PROVISIONAMENTO_EMULATOR.json), [B04](ADAPTACAO_SERVERLESS/ETAPA4_B04_EMULATOR.json), [validação final/versionamento](ADAPTACAO_SERVERLESS/ETAPA4_VALIDACAO_FINAL.json). Comandos reproduzíveis: `node quality/firebase/executar-provisionamento.cjs --homologacao`, `--seed-etapa4`, `--b04-etapa4`; `node quality/run.cjs frontend-test --maxWorkers=1 --testTimeout=15000`; build final, scanner e inventário descritos no fechamento. Contagens anteriores375/99/106 são referências históricas, não prova nova desta etapa.

Falhas do ensaio: primeira asserção Chrome buscava observação no innerText, mas o carrinho usa textarea; corrigida para valor do campo, sem alterar produto. Primeira regressão teve374passes/1timeout de5s no teste antigo com25cliques sob carga; repetida com um worker e limite15s sem remover asserts. Outras falhas do ensaio: sintaxe de seletor CDP do link WhatsApp corrigida; retorno UserCredential cíclico da simulação Google convertido para booleano antes de serializar pelo CDP. Nenhuma delas exigiu alterar o runtime. Regressão final:379/379 em35arquivos,215,86s (um worker,15s por teste); avisos jsdom de navegação não implementada permanecem esperados. Build final em /tmp/catalogo-etapa4-validado aprovado em19,48s, aviso preexistente de chunk>500kB. Scanner textual aprovado; inspeção do bundle não encontrou bootstrap privilegiado, fixtures sintéticas ou instrumentação Chrome. Hashes Rules/índices iguais à Etapa3. Total técnico integral não cronometrado desde o início; tempos de comandos/recibos são medidos, sem estimativa tratada como tempo efetivo. Espera humana0; nenhuma intervenção indispensável durante validação local.

### Arquivos e limpeza

Novos: backup-emulator.mjs (ensaio tipado restrito), homologacao-etapa4.mjs (extensão SDK), homologacao-etapa4-browser.mjs (duas lojas React/SDK), backup-emulator.test.jsx (gates de alvo/escopo/índices), indices-consultas.json (mapeamento versionado), etapa4-rules-readonly.cjs (somente GET de Rules), relatório e guia desta etapa, recibosETAPA4_* separados. Alterados: executar-provisionamento.cjs (opções locais novas), servicos-multiloja-emulator.mjs (hook opcional/recibo separado), provisionamento-emulator.mjs (recibo opcional separado), horarios-b04-emulator.js (recibo opcional), frontend/package.json (alias), classificador/inventário/índice e registros oficiais afetados. Nenhuma fonte runtime comercial/Rules/índices alterada.

Limpeza limitada aos próprios temporários Etapa4 em /tmp: geradores de índice/documentação e logs de ensaios, depois de registrar resultados/falhas nos recibos e neste relatório. Build validado /tmp/catalogo-etapa4-validado preservado. Nenhuma exclusão de fonte/fixtures/backup/histórico/conteúdo anterior. Regra14: sintaxe das ferramentas, inventário/links e scanner reconferidos após a limpeza. Git raiz permanece com fontes não rastreadas desde antes desta etapa; sem stage/commit/push/deploy; dependências/builds/private-backups ignorados e preservados. Um check documental intermediário apontou inventário desatualizado após a criação de recibos; regenerado no fechamento, sem alterar histórico. Teste pontual posterior ao reforço do vínculo do backup:31/31 em2arquivos,17,19s; subconjunto da regressão, sem somar como testes adicionais. B-04:91checks novos aprovados no projeto demo-catalogos-horarios-b04,8189/9199, com sete dias em etapas, falhas reais locais e recuperação; negativas PERMISSION_DENIED/limite1000expressões são controles esperados, não falha da execução. Preservar testes/fontes/fixtures/receipts úteis, histórico, backups privados e alterações não publicadas. Não usar clean/reset nem apagar arquivos anteriores por associação.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

Nenhuma ação humana indispensável para encerrar a etapa local. Primeira implantação futura depende de escolha de loja/projeto/custos/domínio, UID real próprio, operação revisada de bootstrap real (seed atual não habilita produção), publicação/verificação específica de Rules/índices, configuração Auth/OAuth/domínios, release/push/deploy Pages autorizados e homologação com acesso administrativo e pedido completo consentido. Aceite pessoal/mobile/WhatsApp não é substituído por Chrome local. Ver guia para valores públicos e responsáveis; instruções de painel protegidas serão conferidas e emitidas só quando o ato for autorizado. Não iniciar cliente automaticamente, não consumir#1 da Demo e não resetar dados. B-03/B-04/demais riscos reais continuam no registro oficial.


## Estado final e próximo ato

As quatro etapas técnicas da matriz estão concluídas localmente: personalização, seed/dry-run, serviços isolados e homologação/recuperação. A implantação real não foi executada. Próxima ação exata: definir o primeiro cliente e sua estratégia Firebase/domínio/UID, preparar operação de bootstrap real por alvo e obter as autorizações específicas do [guia de implantação](GUIA_IMPLANTACAO_NOVA_LOJA.md). Não iniciar automaticamente. Guia Mestre, Registro, Diário, Plano único/MVP, Continuidade, riscos, manual de personalização, guia consolidado local e inventário/índice atualizados; schema/matriz HTTP→SDK e posição real dos noveMVPs não mudaram. Espelho /home/lucas/Documentos/lojaDemoRestaurante/ ausente, não recriado nem declarado atualizado.
