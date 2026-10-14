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
