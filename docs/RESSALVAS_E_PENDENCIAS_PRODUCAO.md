# Ressalvas e pendências de produção

Criado em 13/10/2026 (America/Sao_Paulo), Ordem 10. Registro permanente: toda etapa futura deve atualizá-lo. Não remover itens ao concluir uma etapa; preservar evidência, decisão e teste. Aprovação local não libera produção.

## R-001 — Configuração Firebase Web real

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: demo/.env.example; demo/src/lib/firebase.js.
- Descrição/evidência ou hipótese: Conexão e autenticação comerciais sem homologação.
- Gravidade/prioridade: Alta; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: Conexão e autenticação comerciais sem homologação.
- Etapa prevista: 19/25.
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-002 — Provedores e domínios Auth

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: demo/src/lib/firebase.js; backend/src/config/firebase.js.
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
- Arquivos envolvidos: demo/src/App.jsx.
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
- Arquivos envolvidos: demo/src/App.jsx.
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
- Arquivos envolvidos: demo/src/services/api.js; demo/src/pages/Checkout.jsx.
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
- Arquivos envolvidos: demo/src/contexts/LojaContext.jsx; demo/test/catalogo.test.jsx.
- Descrição/evidência: Reprodução React: resposta antiga de preço 20 substituía atualização de preço 33.
- Gravidade/prioridade: Média.
- Impacto: Catálogo podia exibir informação antiga após refresh concorrente.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste dirigido falhou antes e passou após correção.
- Resultado da correção: Versionar requisições e descartar respostas obsoletas, inclusive após unmount. Não implica homologação comercial.

## R-019 — Carrinho corrompido ou duplicado no cache

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: demo/src/lib/compras.js; demo/src/contexts/LojaContext.jsx; demo/test/catalogo.test.jsx.
- Descrição/evidência: Uma entrada null descartava também itens válidos; IDs duplicados eram aceitos.
- Gravidade/prioridade: Média.
- Impacto: Perda local de carrinho válido e representação duplicada.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste dirigido cache null/duplicado falhou antes; máximo, remoção e separação por loja passaram.
- Resultado da correção: Sanitização por entrada, IDs/quantidades válidos, deduplicação e apenas id/quantidade persistidos. Não implica homologação comercial.

## R-020 — Aviso npm transitive uuid/gaxios

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: backend/package.json; backend/package-lock.json; backend/test/dependenciasCompatibilidade.test.js.
- Descrição/evidência: npm audit apontou duas ocorrências moderadas (uuid e gaxios), GHSA-w5hq-g745-h8pq. Gaxios utiliza v4; não foi demonstrada exploração na aplicação.
- Gravidade/prioridade: Média.
- Impacto: Dependência transitiva com alerta conhecido; manter acompanhamento.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Audit final zero nas duas árvores; multipart gaxios/v4 testado sem rede e Firebase Emulator passou.
- Resultado da correção: Override restrito a gaxios6.7.1 usando uuid11.1.1, sem atualizar frameworks maiores. Não implica homologação comercial.

## R-021 — Sidebar administrativa impede renderização

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: demo/src/components/admin/AdminSidebar.jsx; demo/test/sidebar.test.jsx.
- Descrição/evidência: Chrome após login apresentou painel vazio; React reproduziu ReferenceError sessao is not defined. Hook estava no helper isActive.
- Gravidade/prioridade: Alta.
- Impacto: Administrador não conseguia usar painel.
- Etapa prevista: 24.
- Status: resolvida (escopo local da Etapa 24).
- Teste de comprovação: Teste de renderização falhou antes e passou após; Chrome login e páginas administrativas passaram.
- Resultado da correção: Mover useAdminSessao para o componente, helper de rota puro; preservar visual. Não implica homologação comercial.

## R-022 — Sair da sidebar mantém sessão autenticada

- Data de identificação/registro: 13/10/2026, Etapa 24.
- Arquivos envolvidos: demo/src/components/admin/AdminSidebar.jsx; demo/test/sidebar.test.jsx.
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

Fixtures locais: duas lojas (loja-homolog e loja-homolog-b), usuários fictícios, categorias, produtos, clientes e endereços; 14 documentos, sem senhas/telefones/WhatsApp/pedidos reais. UIDs placeholders devem ser mapeados aos Auth UIDs aprovados posteriormente. Script backend/scripts/homologacao-dry-run.js --project catalogos-homolog-2026 somente simula: sem SDK, rede, escrita ou opção --write. Dados/preços fictícios não modificam planos comerciais.

Render proposto: catalogos-api-homolog; Git interno LucasTech-Dev/Catalogos, main após revisão/push autorizado; raiz backend; Node 24; npm ci; npm start; Free; instância única; health /; Auto Deploy Off; Virginia sugerida, disponibilidade a verificar. PORT da plataforma; CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev. Secret e configuração podem iniciar deploy ao salvar: autorização deve preceder ação no painel. Não existe URL da API. VITE_API_URL só receberá URL real validada em etapa posterior; VITE_FIREBASE_PROJECT_ID/EXPECTED_PROJECT_ID/HOMOLOG_PROJECT_ID devem corresponder ao Firebase dedicado. Configuração Web é pública, chave Admin jamais VITE_. Hostname→loja continua explícito e backend confirma escopo. Authorized Domains e CORS são controles distintos.

Testes antes/depois: backend 325→334 aprovados; React 79→80; infra 3→4; ambos builds aprovados (1.624 módulos). Emulator 19–23 concluído, exit 0, com Java 21 e JAR temporários já disponíveis, projeto demo- e Auth/Firestore locais; sem instalação permanente ou dados reais. Inclui tokens/sessões, Rules deny-all, autorização A/B, concorrência, validações, erros e pedidos fictícios. Logs brutos Emulator não distribuídos por poderem conter tokens locais; evidência sanitizada preservada. Teste novo de admin de outra loja retorna 403 e não altera dados. Integração Render, Secret File real, IAM, índices READY e queries reais não comprovados.

Estados: contratos/fluxos existentes implementados; loader/guardas/exemplos/fixtures preparados localmente; projeto/Auth/Firestore/SA/IAM/Rules/índices dependem de criação externa; Render/Firebase dedicado não implantados. Roteiro Console, IAM, rotação, matriz de gates e relatório completo: docs/FIREBASE_HOMOLOGACAO_RENDER.md no repositório. Somente após aprovação: escolher ID/plano/localização, criar Firebase dedicado, configurar Auth/Firestore/Rules/índices e IAM/credencial; depois autorizar push e publicação Render; por último integrar Cloudflare com nova aprovação.

Ressalvas preservadas: 25 IDs, 16 abertas, nove resolvidas localmente; R-025 mantém estado anterior. R-023 e R-007 continuam abertas: limiter em memória usa peer TCP e pode agrupar clientes no proxy; sem proteção distribuída comprovada. R-006 aguarda IAM/credencial real; Java temporário não encerra R-011. Sem encerramento por documentação. Free tem repouso de 15 min e retomada de cerca de um minuto, potencialmente além do timeout Web atual de 20 s; 750 horas/workspace/mês e limites de banda/build/tráfego externo, sem garantia de custo total zero. Spark deve ser verificado para o escopo básico; billing/Blaze, recursos adicionais e custos exigem aprovação própria. Produção comercial segue NO-GO.

## Decisão vigente — Render com Firebase existente — 15/10/2026

Por instrução posterior do proprietário, usar bancorestaurante e loja-demo na primeira implantação de demonstração; não criar catalogos-homolog-2026, banco novo, migração ou cópia. Esta decisão substitui a Ordem 04 anterior de criação de projeto vazio. Cloud Run e Firebase separado ficam como alternativas históricas/futuras. **Somente preparo local, sem conexão real, chaves, IAM, dados, push ou deploy.** Relatório/configuração atual: docs/PREPARACAO_RENDER_BANCORESTAURANTE.md.

Backend mantém APP_ENV=homologacao e NODE_ENV=production. Para o projeto existente, exige FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante além de GCLOUD_PROJECT, FIREBASE_EXPECTED_PROJECT_ID e FIREBASE_HOMOLOG_PROJECT_ID iguais ao mesmo ID. Somente FIREBASE_CREDENTIAL_MODE=render-secret-file é aceito nessa exceção; managed/ADC pessoal/Emulator/produção comercial são recusados. Conta de serviço deve ser explícita do mesmo projeto e o JSON corresponder exatamente ao projeto/email; arquivo fixo /etc/secrets/firebase-homologacao.json, nenhum segredo no Git/VITE_*/logs. Modelo vigente infra/render/bancorestaurante.backend.env.example. Nome de conta sugerido catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com, ainda não criado/verificado; IAM/geração/upload precisam de aprovação específica.

Frontend tem opt-in equivalente VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID=bancorestaurante, três IDs públicos correspondentes e mapa catalogo-demo-cz1.pages.dev→loja-demo; modelo infra/render/bancorestaurante.web.env.example. VITE_API_URL segue placeholder até existir URL real validada. Nenhuma publicação Cloudflare feita. Authorized Domains, Rules/índices/IAM e dados do Firebase atual não consultados nesta rodada; arquivos locais não provam estado remoto.

Fluxo preparado: Cloudflare Pages → React → HTTPS → Render → Express → autenticação/loja → controllers → services → Admin SDK → Firebase bancorestaurante (Authentication/Firestore) → API → React. Catálogo público usa projeções; token/revogação, usuário ativo, role e vínculo preservados; cliente/pedido/endereço mantêm titularidade/escopo. Checkout recalcula/transaciona/idempotência no servidor; link WhatsApp não envia mensagem. API continua compartilhada para restaurantes, sem superadmin. Nenhum pedido/usuário real alterado.

Banco persistente não é descartável: opt-in de configuração não autoriza escrita/publicação e não concede IAM. Uma API pública completa com identidade de escrita poderá afetar dados reais; revisar dados publicáveis, alcance de IAM, recuperação e operações permitidas antes de expor. Admin SDK ignora Rules Web; autorização da API continua essencial. CORS HTTPS exato não autentica; limiter local/peer TCP pode agrupar visitantes atrás do proxy. trust proxy não foi ampliado. R-007/R-023 e demais gates reais seguem abertos; 25 ressalvas, 16 abertas e nove resolvidas localmente preservadas. Vendas comerciais não liberadas.

Render proposto catalogos-api-homolog, Node 24, Free, raiz backend no Git interno, npm ci, npm start, health /, Auto Deploy Off, uma instância, PORT da plataforma. Salvar secret pode iniciar deploy; só fazer após autorização. Integração Render–Firebase existente não comprovada. Fixtures/Emulator permanecem fictícios; script de simulação continua recusando bancorestaurante. Resultados reais de testes e limites constam no relatório/evidências desta decisão.

## Ordem 05 — auditoria pré-publicação local — 15/10/2026

Preparação 04 aprovada documentalmente com ressalvas pelo proprietário; isso não é inspeção independente nem autorização de operações externas. Auditoria 05 restrita aos arquivos locais, sem Firebase/GitHub/Render/web, credenciais ou testes externos. Relatório completo: docs/AUDITORIA_PRE_PUBLICACAO_RENDER.md; inventário individual: docs/evidencias-ordem05/ROTAS.md.

Resultado: 43 contratos, 28 GET e 15 mutações Firestore. Não há modo global somente leitura: pedidos/perfis/endereços/configuração/produtos/categorias continuam montados com suas autorizações. Catálogo público aceita qualquer lojaId existente não explicitamente inativo, não só loja-demo; loja/categoria sem ativo passam no comportamento legado. Campos projetados precisam de aprovação de valores concretos: allowlist não remove PII dentro de texto/contatos/URL. Listagens legacy e catálogo podem ler coleções inteiras; filtro de status/cursor em listagem administrativa de pedidos depende do ramo paginado com limite. Esses achados não foram alterados nesta auditoria.

Primeira liberação proposta: somente health e catálogo de loja-demo previamente aprovado, com restrição no backend ou borda sem bypass e identidade efetivamente sem escrita (viewer como candidato, IAM herdado a conferir). Isso é plano, não funcionalidade pronta. CORS, esconder botões ou usar token de teste não bloqueiam as mutações. Não conectar cadastro/login anônimo/checkout do frontend nessa fase, pois Web SDK pode criar/alterar contas Auth independentemente da escrita Firestore na API. Não testar POST no Firebase real para comprovar negação sem autorização específica.

Runtime exclusivo proposto catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com, ainda não criado/verificado. Auth com verifyIdToken(token,true) consulta getUser para revogação/disabled; firebaseauth.users.get é candidato de permissão, não users.create/update/delete/list ou Auth Admin. Para leitura Firestore, viewer é candidato; escrita futura exige concessão específica de create/update/delete conforme operações, nunca Owner/Editor por conveniência. Permissões efetivas/Secret File/montagem/rotação não comprovadas. Nenhuma chave lida/gerada/baixada nesta ordem. Ignores, loader restrito e logs seguros preservados; Admin SDK ignora Rules Web.

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

IAM: infra/render/iam-demo-readonly.proposta.json propõe papel personalizado somente datastore.entities.get, sem listagem/escrita/Auth/IAM; suficiência/permissões efetivas ainda precisam de validação autorizada, sem ampliar por conveniência. Identidade sugerida catalogos-api-demo-readonly@bancorestaurante.iam.gserviceaccount.com não criada/verificada. Secret fixo /etc/secrets/firebase-homologacao.json, nunca Git/VITE_*/logs; montagem real/rotação/políticas/IAM herdado pendentes. No modo demo, Firebaseauth.users.get não é necessário pelo caminho de execução; revogação do modo completo continua preservada.

Render proposto catalogos-api-homolog, Node24/Free/uma instância, raiz backend, npm ci/npm start, health /, Auto Deploy Off, PORT da plataforma; criar serviço/salvar secret pode iniciar deploy e exige autorização. CORS exato do exemplo https://catalogo-demo-cz1.pages.dev. Plano/região/limites da conta e URL API não comprovados. Nenhuma operação Firebase real/Rules/índices/Cloudflare/Render/IAM/chave/GitHub efetuada. Sem commit/push/deploy. Fluxo preparado: Cloudflare Pages → React demo sem Auth/checkout → HTTPS → Render → Express somente leitura → catálogo aprovado da loja-demo → Firestore bancorestaurante → DTO público → React.

Testes: backend342/342, React92/92, infraestrutura7/7; builds normal e demo aprovados. Teste novo Emulator aprovou catálogo, 41 contratos negados, outra loja, zero mutações pelo app e fixtures intactas; regressões 19–23 completas exit0. Fixtures foram escritas apenas em projeto demo- emulado com Java/JAR temporários; não no Firebase real. Logs brutos CLI podem conter env/tokens locais e não são distribuídos; evidências sanitizadas em docs/evidencias-ordem06. Fluxos completos anteriores continuam desenvolvidos para ambientes completos, indisponíveis na primeira demonstração.

Ressalvas preservadas: 25 IDs, 16 abertas e nove resolvidas localmente; R-025 conforme estado anterior. A05-01/A05-03 corrigidos localmente no modo restrito e cobertura de A05-02 reduzida no ramo demo, sem encerrar gates de IAM/dados/hosting/proxy/custos. Produção comercial permanece NO-GO. Próximo passo depende de revisão do proprietário: aprovar dados/IDs, validar IAM leitura/identidade e secret reais, depois revisar/sincronizar Git e autorizar publicação restrita/API/Cloudflare. Não alternar serviço demo para full por conveniência. Não criar projeto/banco nem alterar preços/planos comerciais.


## Ordem 07 — auditoria real de leitura — 15/10/2026

Relatório vigente: [VALIDACAO_DADOS_PUBLICOS_RENDER.md](VALIDACAO_DADOS_PUBLICOS_RENDER.md). Consulta autorizada ao projeto confirmado bancorestaurante, banco Native (default), região existente nam5, com ADC de usuário (e-mail nominal não identificado, impróprio como identidade Render). Foram 16 documentos únicos: loja-demo, quatro categorias e 11 produtos; 17 obtenções com releitura projetada de ativo da loja. Sem clientes/endereços/pedidos/ADM/usuários, outras lojas, escrita ou documentos completos nos relatórios.

Bloqueador crítico A07-01: Rules efetivamente publicadas diferem do deny-all local e permitem read sem autenticação também em clientes, endereços, pedidos e ADM da loja-demo; create/update têm apenas condições de campos, sem request.auth. Não foram exploradas permissões nem consultados documentos privados; isso não prova vazamento ocorrido. A API demo e IAM de leitura não corrigem acesso direto Firestore. Nenhuma Rule foi alterada.

Nove produtos e três categorias são candidatos técnicos, sem aprovação de publicação. A07-02: campo ativo ausente na loja impede catálogo (503). A07-03: seis URLs de imagem com query são omitidas pelo DTO, sem acesso remoto. A07-04: disponivel ausente nos 11 produtos é interpretado como true pelo código e requer confirmação. Listas preservadas vazias e CATALOGOS_DEMO_CATALOG_APPROVED=0.

SA proposta catalogos-api-demo-readonly não localizada (404); sem concessões diretas ao alvo na policy consultada, herança/permissões efetivas não comprovadas. datastore.entities.get atende à leitura pontual pela referência oficial, sem escrita/Auth; papel personalizado ainda é proposta, não isola por loja. Zero índices compostos nos grupos produtos/pedidos, sete locais ausentes; demo pontual dispensa esses índices. Evidências sanitizadas em evidencias-ordem07.

Fluxo preparado continua Cloudflare React demo → HTTPS/Render somente leitura → Admin SDK/IAM → catálogo aprovado loja-demo → DTO; o caminho direto do Web SDK obedece às Rules publicadas e apresenta risco independente. Nenhum push/deploy, credencial, IAM, alteração Firebase ou Cloudflare. Próxima fase exige autorização específica, priorizando correção/testes das Rules antes de liberar catálogo. Preservadas 25 ressalvas, 16 abertas/nove resolvidas localmente; R-005/R-006/R-007/R-023 abertas; vendas comerciais não liberadas. Os achados A07 não criam novos IDs R.
