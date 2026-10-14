# Etapa 25 — Checklist de implantação autorizada e rollback

13/10/2026. **Somente fase A local executada nesta ordem.** FasesB–H são roteiro e não autorização para ações externas. Marcar responsável, data, ambiente, versão e evidência por item. Sem credenciais reais neste documento.

| Fase | Pré-requisitos / operações | Evidência | Risco / critério de aprovação | Responsável sugerido |
| --- | --- | --- | --- | --- |
| A — preparação local | Checkpoint 949f992; separar envs; npm ci/test/build/audit/scan; Emulator/Chrome; Docker sem rede; revisar 22 ressalvas e novaR-023 | Relatório 25, logs/resumos, configs/manifestos e imagem local | Testes aprovados, nenhuma escrita real; artefatos fictícios não publicados | Desenvolvedor/revisor |
| B — homologação | Ordem específica, aprovar provedor/região/orçamento; criar projetos/serviços/identidades, Console Auth/domínios/HTTPS/CORS; injetar configurações públicas corretas | IDs não secretos, IAM revisado, hash do build/image e checklist Console | Projeto errado/custo; dupla revisão e ambiente totalmente separado | Proprietário + operador cloud |
| C — segurança | Configuração B; revisar IAM/ADC/contas admin, sem keys privadas; aplicar proteção de borda/proxy normalizado e impedir bypass; testar NAT/429/Auth/trocaUID/PII | Testes negativos/métricas; revisãoR-006/007/023 | Admin SDK bypassRules; nenhuma permissão cruzada, sem clientes legítimos bloqueados indiscriminadamente | Segurança + desenvolvedor |
| D — dados/índices | Backup autorizado e orçamento; publicar Rules/índices somente no projeto homolog; esperar READY; QueryExplain/queries reais; conferir loja/opcionais/IDs e dry-run legados | Inventário, estadosíndices, snapshots/contagens/somas; ensaio restore isolado | Emulator não garanteíndice; legados ambiguos bloqueiam migração; nenhum vínculo inferido por email | Operador dados + restaurante |
| E — implantação | Aprovação formal versão/projeto/domínios, C/D concluídas, janela/manutencão e rollback conhecido; publicar imagem e artefato validados com rollout piloto | Revisão/imagedigest/release, configuração, aprovação e percentuais tráfego | Falha compartilhada; schema compatível e plano de contenção | Proprietário autoriza; operador executa |
| F — smoke | E autorizada; conta/dados teste controlados; URLs diretas/reload/back, catálogo/cart/checkout/WhatsAppURL, admin e outra loja; dispositivos físicos | Roteiro 24 preenchido com resultados/screenshots sem PII | Link não prova envio/pagamento; sucesso crítico e nenhuma leitura/escrita cruzada | QA + restaurante |
| G — monitoramento | Smoke aprovado e orçamento/contatos de alerta; observar 5xx/429/p95/memória/leituras/MAU/custos e checkout durante piloto | Baseline e alertas/consumo; comparativo versão anterior | Alerta não corta cobrança; escala e margem validadas antes de expandir | Operações + proprietário |
| H — rollback | Trigger aprovado (erro/totais/isolamento/custo), release/image anterior e backup/manifesto disponíveis; reverter tráfego/estáticos e config compatível; dados só por plano revisado | Revisões antes/depois, smoke novamente, contagens e integridade dos pedidos novos | Não apagar pedidos para reverter código; sem overwrite de dados posteriores | Operador + revisor de dados |

## Sequência concreta para futura liberação

1. Aprovar arquitetura/provedor/plano/região, domínio(s), política de abuso/retencão/backup e orçamento completo com tarifas regionais. Aceitar 14 pendências anteriores individualmente, alémR-023, sem resolução só por documentação.
2. Configurar homologação sob ordem externa, conferir Firebase Web/API projeto esperado, AuthAnonymous/EmailPassword/domínios e conta admin verificada. Não usar builds fictícios 25.
3. Validar deployment scripts no projeto homolog, publicar somente após autorização por fase. Não adicionar auto-deploy em push/main; CI atual roda só validação.
4. Testar Rulesdeny diretamente e autorização Admin SDK, revogação/perfil/financeiro; registrar revisão IAM e ausência de JSON privado. Validar AppCheck/proxy/edge se adotados.
5. Conferir índices pelo estado/queries/Explain reais e legado por manifestoverificado, backup e ensaio de loja sem afetar B. Definir contrato de chave expirada antes de qualquer TTL.
6. Completar roteiro manual 24 nos dispositivos e rede escolhidos; resolver bloqueadores e assinar aprovação comercial por responsável.
7. Publicar piloto autorizado, smoke e monitorar janela; autorizar expansão por loja após evidência. Pré-executar rollback em homologação e registrartempo.

## CI/CD preparado

.github/workflows/validacao-local.yml: checkout/setupNode/setupJava fixados por SHA; Node24.19/Java21, contentsread, sem persistir credenciais de checkout, sem id-token/segredosFirebase. npm ciignore-scripts nas duas árvores, scan, infra/backend/React, build, audits, suite 25 Emulatordemo/Chrome; timeout 30 min e cancelamento de duplicatas. Sem upload/publicação/deploy. Hooks PagesGit que publiquem automaticamente devem permanecer desabilitados; usar entrega separada aprovada futuramente.

Workflow foi analisado como YAML local e seus comandos foram exercitados localmente, mas NÃO rodou no GitHub (sem push). Runner deve fornecer /usr/bin/google-chrome, Java21 e internet para instalarCLI/Emulator; validar disponibilidade antes da primeira execução remota. FirebaseCLI 15.32.0 fixa versão para esse workflow; revisar pins periodicamente. Minutos/cache/artefatos CI custam conforme plano e visibilidade do repo, não assumir execuções ilimitadas. [GitHubActionsbilling](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Comandos de validação local (não de deploy)

- node infra/scripts/verificar-segredos.cjs
- node --test infra/test/configuracoes.test.cjs
- backend: npm ci --ignore-scripts; npm test; npm audit
- demo: npm ci --ignore-scripts; npm test; npm run build; build:externo com envfictício/revisado; npm audit
- firebase emulators:exec --project demo-catalogos-emulator --only auth,firestore 'node backend/scripts/etapa25-emulator-suite.js'
- firebase emulators:exec --config infra/hosting/firebase.preparacao.json --project demo-catalogos-hosting --only hosting 'node infra/scripts/hosting-smoke.cjs'
- docker build -t catalogos-etapa 25-local:preparacao backend (imagem local; nenhum push)

Emulators precisam hosts/projeto demo e Java21; suite 25 guardada recusa Firebase real. Evidências 24 não são sobrescritas: suite 25 usa docs/evidencias-etapa25/homologacao, ou ETAPA 24_EVIDENCIAS explícito. Fonte temporária SVG é removida após percurso. Docker tests sem rede externa usam somente exemplos fictícios e containers --rm.

## Critério de passagem à Etapa 26

Preparação técnica revisada e autorizada pelo usuário. Etapa 26 não iniciada; não confundir sua autorização futura com liberação de produção. Manter pendências externas/proprietário/homologação identificadas até evidência real.
