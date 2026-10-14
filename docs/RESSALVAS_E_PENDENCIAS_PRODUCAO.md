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
- Status: pendente.
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
- Status: pendente.
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
- Status: pendente.
- Teste de comprovação: homologação/medição autorizada na etapa prevista.
- Resultado da correção: não resolvida no registro inicial; atualização obrigatória com evidência.

## R-013 — Histórico e URLs da navegação React

- Data de identificação/registro: 13/10/2026; itens anteriores consolidados nesta data.
- Arquivos envolvidos: demo/src/App.jsx.
- Descrição/evidência ou hipótese: window.location.pathname observado; comportamento ainda a avaliar.
- Gravidade/prioridade: Média; prioridade de homologação, não vulnerabilidade presumida.
- Impacto: window.location.pathname observado; comportamento ainda a avaliar.
- Etapa prevista: 24.
- Status: pendente.
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
