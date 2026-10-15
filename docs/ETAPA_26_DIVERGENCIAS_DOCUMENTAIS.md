# ETAPA 26 — Divergências documentais

14/10/2026. Trechos originais públicos resumidos;originais integrais embackupprivado eGit. Não reproduzir credenciais. Correção de redação não implementa nem aprova o recurso.

## D-001

- Documento: DOCUMENTO_CONSOLIDADO_EscopoGeral_ProjetoCatalogoLoja.txt
- Seção/trecho anterior: Autenticaçãoobrigatória/cadastroopcional futuro
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Catálogo é público;checkout usa sessãoanônima e cadastroopcional
- Evidência: demo/src/lib/firebase.js;pages/Cadastro.jsx;backend/routes/publicoRoutes.js
- Correção: Zonaatual reescrita;original histórico preservado
- Data:14/10/2026
- Status: corrigida

## D-002

- Documento: ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt
- Seção/trecho anterior: nivel=global/tipo/status
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Somente role cliente/admin/lojaId/ativo
- Evidência: backend/src/middleware/authMiddleware.js;lojaMiddleware.js
- Correção: Modeloatual substitui normativo;global ficou histórico/pendente
- Data:14/10/2026
- Status: corrigida documentalmente;recurso globalnãoimplementado

## D-003

- Documento: ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt
- Seção/trecho anterior: dadosmock emdemo
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Páginas consomemAPI Express/Firebase
- Evidência: demo/src/services/api.js;contexts/LojaContext.jsx;components/admin/AdminGate.jsx
- Correção: Atualizadofluxo efonte corrente
- Data:14/10/2026
- Status: corrigida

## D-004

- Documento: ESCOPO DO CLIENTE.txt
- Seção/trecho anterior: pagamentosonline/variações/adicionais
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Financeiroinformativo,sem gateway/variantes/adicionais
- Evidência: backend/src/validators/pedidos.js;administracao.js;services/pagamentoService.js
- Correção: Proposta atual distingue futuro eprontolocal
- Data:14/10/2026
- Status: corrigida

## D-005

- Documento: DOCUMENTO_CONSOLIDADO_EscopoGeral_ProjetoCatalogoLoja.txt
- Seção/trecho anterior: copiar demo porcliente/hospedagemimplícita
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Sharedinfra 25 éproposta;mapahost oulojaId existe
- Evidência: demo/src/lib/ambienteAplicacao.js;docs/ETAPA_25_ARQUITETURA_PRODUCAO.md
- Correção: Separado proposta/alternativa histórica/implantação pendente
- Data:14/10/2026
- Status: dependenteaprovação comercial;redação corrigida

## D-006

- Documento: EtapasDeProducao_BaseFixo.txt
- Seção/trecho anterior: enviado_whatsapp/enviadoEm;HTMLmodal
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Estados reais não incluem enviodemensagem;AppReact/pathname
- Evidência: backend/src/services/pedidoStatusService.js;whatsappService.js;demo/src/App.jsx
- Correção: Sequência/estadoatual atualizados;plano-base 0–16 historicizado
- Data:14/10/2026
- Status: corrigida

## D-007

- Documento: ESCOPO DO CLIENTE.txt
- Seção/trecho anterior: taxasporregião/estoque/upload/QR
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Taxaúnica/flagdisponibilidade/imagemURL;semengine/gerador
- Evidência: backend/src/validators/administracao.js;services/pedidoService.js
- Correção: Limitações corrigidas emescopo ativo;serviços futuros não contratados
- Data:14/10/2026
- Status: corrigida

## D-008

- Documento: DOCUMENTO_CONSOLIDADO_EscopoGeral_ProjetoCatalogoLoja.txt;ESCOPO DO CLIENTE.txt
- Seção/trecho anterior: planos/ranges/exemplo e camposR$[VALOR]
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Não há prova de plano/preço/prazo assinado
- Evidência: docs/DECISOES_PENDENTES.md;infra/scripts/custos.cjs
- Correção: Preços históricos preservados;nenhummodelo definitivo escolhido
- Data:14/10/2026
- Status: pendenteaprovação do proprietário

## D-009

- Documento: codigoEestrutura.txt
- Seção/trecho anterior: merged representation entirecodebase
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Snapshot 190 entradas,comparação inicial119iguais/42diferentes/29.git
- Evidência: Árvore real no checkpoint 25;comparação porpaths/conteúdo
- Correção: Rotuladocomo histórico;orientação atual completa no início;semregeneraroriginal
- Data:14/10/2026
- Status: corrigida classificação documental

## D-010

- Documento: GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.zip
- Seção/trecho anterior: arquivo consolidado distribuição
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Arquivo contémTXT idênticoao originalaté 100;após 26 não inclui 101
- Evidência: ZIPCRC/entradaSHA e backup
- Correção: Preservadobinário;índiceatual apontaTXT e statusarquivo histórico
- Data:14/10/2026
- Status: revisada;mantida

## D-011

- Documento: docs/ETAPA_25_SEGURANCA_OPERACIONAL.md;ETAPA_25_RELATORIO_FINAL.md
- Seção/trecho anterior: assinatura contémPII
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: assinatura=SHA-256(JSON canônico),não JSONbruto
- Evidência: backend/src/services/pedidoService.js
- Correção: Redaçãoatualcorrigida;errata 26,origemnoGit 792 b 069 eguia 100 preservado
- Data:14/10/2026
- Status: corrigida

## D-012

- Documento: email se senhas teste.txt
- Seção/trecho anterior: campos de credenciais;valores omitidos
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Materialtexto reservadoprovávelteste,não validado real
- Evidência: Inspeçãolocal7linhas/metadata664;sem login
- Correção: Permissão600;conteúdomantido/backup privado;R-025
- Data:14/10/2026
- Status: pendente gestão/proveniência/rotação humana;permissão corrigida

## D-013

- Documento: infra/ambientes/development.*.env.example;test.*.env.example
- Seção/trecho anterior: PORT8080/FIRESTORE...8080
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Mesmo host/porta causaria colisãoseexemplocopiado
- Evidência: firebase.json;backend/src/server.js;exemplos
- Correção: Exemplos de documentação corrigidosAPI3000/Web3000;nenhum código funcional
- Data:14/10/2026
- Status: corrigida

## D-014

- Documento: docs/ETAPA_19–25*;READMEausente
- Seção/trecho anterior: status antigos lidoscomo atuais;sem índice principal
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Etapas datadas/não produção;documentaçãocorrente 26
- Evidência: Git/log/docs/src
- Correção: Prefixohistórico preservando corpo;README/manuaisnovos
- Data:14/10/2026
- Status: corrigida

## D-015

- Documento: docs/REFERENCIA_API.md criação 26
- Seção/trecho anterior: paginação universal/cartao novo poderia ser assumido
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Filtros de cliente 400;adminquery exige limite;PATCHpagamentos 4 chaves
- Evidência: backend/src/middleware/validacaoMiddleware.js;controllers/pedidoController.js
- Correção: Referênciagerada 43 rotas conferida emguardas/controllers;sem alegar cursor para todos
- Data:14/10/2026
- Status: corrigida antesdepublicação

## D-016

- Documento: Planejamento de administração global/suporte
- Seção/trecho anterior: equipegerenciaqualquerloja porglobal
- Problema: confusão entre planejamento/histórico e realidade ou falta deprecisão.
- Informação confirmada: Adminvinculadoauma loja,não suporte central auditável
- Evidência: authMiddleware.js;lojaMiddleware.js;AdminGate.jsx
- Correção: ManualmaisR-024;semampliar privilégios código
- Data:14/10/2026
- Status: pendente decisão/implementação específica;redação corrigida

São 16 registros,comstatus compostos explícitos. D-008/D-012/D-016 mantêm decisões/açõespendentes;D-005 depende deinfraaprovação ainda. Não declarar recurso/global/gateway/credenciais homologados.
