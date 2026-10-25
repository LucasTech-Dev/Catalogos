# Resultado da publicação de performance — INTERROMPIDA NO DEPLOY — 25/10/2026

**Commit/push concluídos; otimizações ainda não publicadas no site.** Commit `e6677c786c396e7eba3559121863c3ebae672d7d`, [GitHub/main](https://github.com/LucasTech-Dev/Catalogos/commit/e6677c786c396e7eba3559121863c3ebae672d7d), pai `fac54aabb70a6e9317114a06de37d3e87606a7d5`. Fast-forward pela conexão GitHub, `force=false`, precondição de head conferida; história integral preservada. Árvore `b92069c5b4e875d874683b4a017f33d065b6bad6`. Onze arquivos: quatro módulos de leitura, dois testes/roteiros em quality e cinco documentos/recibos. Sem backend, Firebase, configuração ou dependências alteradas.

A — EXECUÇÃO PELO CODEX: PERF-PUB-01. Nova suíte completa161/161 aprovada na cópia de trabalho (73,92s) e no checkout integrado que originou o commit (46,04s); quatro exemplos públicos e três builds aprovados, mais build final homologacao com configuração pública da release/oito saídas. Os diffs dos quatro módulos são exatamente as otimizações já implementadas; sem funcionalidade nova.

Cloudflare conferida repetidamente após o push, por cerca de dois minutos. Última consulta em25/10/2026 10:25:25 America/Sao_Paulo (13:25:25UTC): `production_deployments_enabled=true`, produção `main`, fonte LucasTech-Dev/Catalogos, mas **nenhum deployment para e6677c7**. Canônico permanece `440ebe2b-1073-4e1e-a23a-132e90f4f1b3`, success, código `030ec02229f74375db72178f551bc5d0a0c5ada6`. GET público confirmouHTTP200 e asset `/assets/index-BUigF6rR.js`, diferente do novo build local `/assets/index-D5xQKw6F.js`. Não atribuir a falha ao código/build: o deploy não foi criado. Causa da ausência de disparo automático não investigada nesta ordem.

Conforme a instrução explícita “Se houver falha, interrompa e informe a correção mínima”, **não foi acionado deployment alternativo/manualmente pela API**, nem alterada integração. Correção mínima para retomada: disparar buildGit/main no Pages catalogo-demo para o commit e6677c7, conferir hash e success, executar `CATALOGOS_PERFORMANCE_PAGES=AUTORIZADA node quality/frontend/scripts/medir-performance-pages.cjs depois`. Não corrigir webhook/configurações por associação. Não há falha funcional do site antigo; falta publicar a correção de performance.

## Tempos realmente medidos

Chrome headless desktop1440x1000, cacheHTTP desativado, rede/CPU sem throttling; mesma conta sintética existente; três navegações por tela. Valores são medianas do início da navegação até DOM utilizável com dados, incluindo HTML/JS/Auth/Firestore, não latência isolada de GET. Baseline capturado antes do push, recibo [PERFORMANCE_PAGES_ANTES.json](PERFORMANCE_PAGES_ANTES.json).

| Tela | Antes | Depois |
| --- | ---: | --- |
| Home |3498ms|não publicado|
| Catálogo/cardápio |3778ms|não publicado|
| Detalhe do produto |3735ms|não publicado|
| Histórico de pedidos do cliente |1718ms|não publicado|
| Painel — bloqueio a cliente |1498ms|não publicado|
| Produtos admin — bloqueio a cliente |1559ms|não publicado|
| Pedidos admin — bloqueio a cliente |1729ms|não publicado|

**Melhoria online: não mensurada.** Não criar comparação “depois” usando o código antigo. Ganho estrutural comprovado pelos testes locais: oito categorias em dois lotes de quatro, compartilhamento de leitura em andamento e uma leitura/etapa a menos por operação em pedidos/gestão. Isso não é prova de percentual ou tempo final de produção.

Admin autorizado: sem métrica de consulta interna. A autoridade da conta sintética foi desativada na homologação anterior e permanece assim. Não foi solicitado segredo nem alterado documento para habilitar esse teste. Proteção medida no bloqueio a cliente não deve ser apresentada como carregamento do dashboard/produtos/pedidos administrativos.

Validações online da versão anterior: nove produtos/preços renderizados; Classic Burger28,90; dois pedidos sintéticos existentes e detalhe de entrega33,90; ClienteB negado ao pedido de ClienteA; admin/produtos/pedidos administrativos negados a cliente. Zero criação de conta/pedido/tentativa de escritaFirestore/exceçãoJS/Render. Testes novos locais confirmam também isolamento por loja, revogação e troca de sessão. Sem alteração em Rules, índices, Auth/configuração, IAM ou documentos comerciais; sem auditoria privilegiada geral do banco ou alegação de homologação integrada da versão não publicada.

## Registro, limpeza e estado final

Primeira tentativa Chrome restrita falhou antes da navegação; o mesmo roteiro com permissão de navegador/rede passou. Primeiro `git fetch` restrito semDNS falhou; repetido com permissão de rede, aprovado. Essas falhas de ambiente não exigiram mudança no produto. Checkout local main alinhado a origin/main após comprovar igualdade da árvore integral; arquivos preservados, estado limpo. Git original permanece sem histórico/rastreados, sem stage próprio. Scanner dirigido sem achados de segredo; código/teste revisados; sem exclusões/limpeza pendentes. Recibos/testes permanentes preservados. Artefato atualdist e backups ignorados não foram apagados. Espelho externo ausente, não recriado.

Arquivos pós-push: este relatório, recibo PERFORMANCE_PUBLICACAO_EVIDENCIAS.json e entradas locais do Guia Mestre/TXT, plano único, diário, Registro e Continuidade; índice/inventário regenerados/conferidos. Essas evidências finais ficam na cópia de trabalho local; **não foi feito segundo push** após a interrupção. Matriz, posição dos nove MVPs e ressalvas comerciais anteriores inalteradas. Teste permanente de medição em quality/frontend/scripts/medir-performance-pages.cjs, separado do bundle.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: nenhuma senha/painel solicitado. Publicação principal foi autorizada, mas esta execução para no disparo automático ausente por instrução explícita do proprietário. Próxima ação exata: decidir a retomada pelo acionamento mínimo do buildPages existente e validação posterior, sem alterar Firebase ou abrir nova etapa. Não solicitar reativação de conta de teste para cumprir medição. Tempo técnico estimado15min, sem cronômetro integral; espera de disparo cerca2min, nenhum minuto manual. Não houve nova alteração de runtime após os testes finais.

---

# Publicação autorizada das otimizações — 25/10/2026

Autorização expressa do proprietário nesta sessão: somente otimizações já implementadas, testes/build, commit/push normal em LucasTech-Dev/Catalogos/main, acompanhamento Pages e validação/medição online. Nenhuma autorização de alteração de Rules, índices, Auth, IAM ou documentos comerciais. Sem funcionalidade nova.

A — EXECUÇÃO PELO CODEX: PERF-PUB-01. Base main confirmada pela conexão GitHub: `fac54aabb70a6e9317114a06de37d3e87606a7d5`, árvore `1581ac847eabc926394bd7f7e663b794c0e764cc`; checkout limpo antes de integrar. Diff de produção limitado aos quatro módulos de leitura já descritos abaixo. Novo teste de medição fica em quality, sem instrumentação no produto. Suíte local161/161 aprovada; builds test/homologacao/production aprovados. Build final do checkout integrado em homologacao, mesma configuração pública anteriormente aprovada, oito saídas em memória; hashes no recibo PERFORMANCE_BUILD_EVIDENCIAS.json. Checkout integrado também executa a suíte antes do commit.

Baseline online capturado **antes do push**, Chrome desktop1440x1000, cacheHTTP desativado, CPU/rede sem limitação artificial, três navegações por tela: home3498ms; catálogo3778ms; produto3735ms; pedidos cliente1718ms. Admin: apenas bloqueio de acesso ao cliente (painel1498ms/produtos1559ms/pedidos1729ms), sem medir consulta administrativa autorizada. A conta privilegiada sintética continua desativada; reativá-la alteraria documento protegido e foi descartado. Não confundir tempo de bloqueio com tempo do dashboard/listagem. Recibo completo PERFORMANCE_PAGES_ANTES.json com amostras, método, preços públicos e hashes dos dados; nenhum token/senha exportado.

Validação baseline: login nas duas contas sintéticas existentes, nove produtos/preços, Classic Burger28,90, dois pedidos existentes e detalhe33,90; pedido de ClienteA negado ao ClienteB; admin negado ao cliente. Zero cadastro/pedido novo/tentativa de escrita Firestore/exceção JS/Render. Testes locais cobrem outra loja, revogação e troca de sessão; não foi introduzido cache de autoridade. Configurações remotas não foram modificadas nem declara-se nova auditoria completa do Firebase.

Falha de ferramenta: primeira tentativa de navegador no sandbox não iniciou Chrome; recibo PERFORMANCE_PAGES_TENTATIVA_SANDBOX.json preservado. Correção mínima: executar exatamente o teste de leitura autorizado com permissão de navegador/rede; baseline aprovado. Sem alteração no produto para contornar esse bloqueio.

B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO: autorização de publicação recebida e válida; nenhuma credencial/intervenção solicitada. Medição interna de admin requer sessão administrativa ativa legítima; não solicitar senha pelo chat nem atribuir privilégio. A publicação não representa aceite comercial integral. Fotos pendentes e demais ressalvas existentes preservadas.

Estado antes do push: pronto para publicar sob autorização recebida; acompanhamento e resultado final registrados abaixo após deploy. Nenhum novo plano/etapa comercial. Histórico local anterior preservado a seguir.

---

# Otimização local das leituras Firestore — 25/10/2026

Pedido: investigar lentidão nas operações do banco e acelerar GETs. Escopo: código local React/Web SDK existente; nenhuma operação no Firebase real, publicação, stage, commit ou push autorizada por este pedido. A publicação anterior registrada permanece histórica e não inclui esta alteração.

## A — EXECUÇÃO PELO CODEX

**PERF-GET-01 — implementação e regressões locais.** Pré-requisitos: entradas vigentes do Guia Mestre/plano e código atual preservados. Identificados dois custos determinísticos no código: consultas públicas por categoria em série e leitura administrativa de `lojas/{lojaId}` usada apenas para obter UID antes da operação real. Dashboard já paraleliza suas agregações; transações e confirmação de gravação foram preservadas.

| Arquivo | Função nesta alteração |
| --- | --- |
| `frontend/src/services/catalogo.js` | Produtos consultados em lotes de até quatro categorias simultâneas; aguarda todo o lote em falha, sem devolver catálogo parcial. Chamadas simultâneas da mesma instância Firestore/loja compartilham a promessa pendente; removida ao concluir ou falhar, sem cache de resultados. |
| `frontend/src/services/adminCatalogo.js` | Método interno `autorizar()` reaproveita a validação atual da conta/loja no servidor e conferência de UID, sem buscar os dados da loja. `sessao()` continua fornecendo o DTO completo à interface. |
| `frontend/src/services/adminPedidos.js` | Gate passa a usar `autorizar()`, evitando uma leitura redundante por operação. |
| `frontend/src/services/adminGestao.js` | Mesmo gate para gestão/configurações/clientes/dashboard e rechecagem após recusa; leitura real das configurações permanece. |
| `quality/frontend/test/leiturasFirestore.test.js` | Nove regressões executáveis: concorrência limitada, filtros/ordenação/seleção pública, leituras simultâneas, atualização após conclusão, isolamento por loja/instância, erro/retry, loja indisponível, contagem administrativa, revogação e troca de sessão. |

A validação administrativa continua lendo `usuarios/{uid}` no servidor em cada operação; não foi introduzido cache de autoridade. Rules, filtros públicos, índices, transações, revisões, preços e históricos não mudaram. Somente o catálogo público compartilha promessas em andamento. Uma chamada posterior à conclusão sempre inicia nova leitura no servidor.

Referência técnica consultada: [boas práticas Firestore](https://firebase.google.com/docs/firestore/best-practices), recomendação de executar consultas independentes de forma assíncrona. Mantida a [origem servidor](https://firebase.google.com/docs/firestore/query-data/get-data), sem fallback de dados antigos para simular velocidade.

### Evidência e limite de desempenho

Evidência automatizada local com SDK simulado: oito consultas de produtos antes em oito rodadas passam a duas rodadas de quatro, após loja/categorias. Mantém a quantidade de consultas de um carregamento individual; reduz espera serial. Duas chamadas simultâneas da mesma loja fazem uma leitura completa compartilhada. Pedidos/clientes no admin passam de autoridade + loja + consulta (três etapas) a autoridade + consulta (duas); configurações passam de autoridade + loja + loja a autoridade + loja. Isso comprova redução estrutural, não percentual ou milissegundos no Firebase real.

Comandos/resultados:

- `npm --prefix frontend test -- leiturasFirestore`: 9/9 aprovados.
- `node quality/frontend/scripts/build-final.mjs`: quatro exemplos públicos validados; builds test/homologacao/production aprovados, oito saídas cada, em memória sem ler `.env` privado ou alterar `dist`.
- `npm --prefix frontend test`: 18 arquivos, 161/161 testes aprovados, 65,49s. Como o comando inicial não havia retornado saída ao consultar seu andamento, foi iniciada uma segunda execução com `--maxWorkers=2`: também 161/161 aprovados, 34,96s. Nenhuma falha funcional; repetição não era necessária em retrospecto.
- `node quality/docs/documentacao.cjs --write` e `--check`: 1827 documentos, caminhos/links do núcleo válidos e histórico preservado.
- Diagnóstico de portas com `ss` não pôde abrir socket netlink no sandbox; sem impacto nos testes unitários/builds, e sem presumir disponibilidade de Emulator por essa saída.

Não foram realizados testes novos no Emulator, medições de latência real nem operações remotas nesta tarefa. Sem mudança em Rules ou contratos de escrita; as evidências integradas anteriores conservam seu ambiente/versão, sem serem declaradas reexecutadas. Não foi identificada a latência geográfica do banco nem se declara que estas duas causas expliquem toda lentidão percebida.

### Documentação, Git, limpeza e recuperação

Entradas de continuidade: Guia Mestre Markdown/TXT, plano único, diário, Registro de Trabalho e Continuidade Codex. Relatório técnico classificado no gerador do Índice Geral/inventário; caminhos conferidos com `--write`/`--check`. Matriz e posição dos nove MVPs não alteradas porque contratos/estado comercial permanecem iguais; ressalvas existentes preservadas. Espelho externo `/home/lucas/Documentos/lojaDemoRestaurante/` ausente nesta sessão; não recriado.

Git original continua sem arquivos rastreados, conforme estado inicial; checkout histórico de publicação e backups preservados. Revisão limitada aos arquivos desta tarefa e nomes dos ignorados, sem imprimir segredos. Sem exclusão de fontes, histórico, dados ou builds necessários; nenhum descartável exclusivo planejado. Reversão: restaurar somente os quatro módulos anteriores a esta alteração a partir da release publicada preservada, sem tocar no Firebase. Testes permanentes ficam em `quality/`, fora do bundle.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

**PERF-GET-H1 — nenhuma ação de painel necessária para a correção local.** Nenhum segredo solicitado. Publicação desta correção depende de autorização específica futura para integrar/commit/push/deploy no alvo Pages existente; não executada. Após publicação autorizada, validar tempo percebido no mesmo dispositivo/rede nas telas catálogo, pedidos e clientes, sem criar pedidos ou alterar dados para medir GET. Evidência manual de desempenho deve indicar tela, horário e resultado; não substitui os testes de autorização.

Estado: CONCLUÍDA LOCALMENTE; nove regressões novas, suíte completa161/161, três builds e documentação aprovados; sem limpeza pendente. Próxima ação exata: revisar o resultado e autorizar especificamente a publicação desta correção se desejada. Não iniciar migração/novos recursos. Tempo técnico: aproximadamente10 minutos (estimativa, diagnóstico inicial sem cronômetro); espera externa0 e nenhum tempo manual solicitado. Tempo de testes está discriminado acima, sem confundir duração dos comandos com latência real do banco.
