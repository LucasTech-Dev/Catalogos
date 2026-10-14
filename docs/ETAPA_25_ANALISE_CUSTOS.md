# Etapa 25 — Custos: modelo reproduzível, não orçamento contratado

Data 13/10/2026. USD, sem conversão/impostos; região final pendente. Fontes oficiais consultadas nessa data. Modelo: node infra/scripts/custos.cjs docs/evidencias-etapa25/custos.json. Nunca consulta Firebase real. Não inferir preço de mensalidade de um subtotal parcial.

## Tarifas de referência e variáveis

Firestore Standard/us-central1: USD 0,03/100 mil leituras;0,09/100 mil escritas;0,01/100 mil exclusões. Quota diária de leitura/escrita aplicada uma vez por projeto/database elegível (50 mil/20 mil), NÃO por loja; custos de índices e agregações podem elevar leituras. Preços de outras regiões/moedas devem ser substituídos antes de contratação. [Preço oficial](https://cloud.google.com/firestore/pricing).

Cloud Run request-based/Tier1 de referência: USD 0,000024/vCPU-s,0,0000025/GiB-s,0,40/milhão requests. Modelo conservador bruto sem créditos gratuitos, sem instância mínima; minInstances, concorrência/overlap, cold start e tempo faturável real alteram o resultado. [Preço oficial](https://cloud.google.com/run/pricing).

Firebase Hosting alternativa: transferência USD 0,15/GB acima de 360 MB/dia e armazenamento 0,026/GB-mês acima de 10 GB. [Tabela oficial](https://firebase.google.com/pricing). Cloudflare Pages: confirmar plano que acomode domínios/builds; funções/API/proteção paga não são incluídas pelo fato de estáticos poderem usar Free. [Limites](https://developers.cloudflare.com/pages/platform/limits/). Render: custo de instância/workspace/banda deve vir de cotação oficial; alternativa não calculada como se tivesse ADC gerenciada disponível. [Tabela](https://render.com/pricing).

## Premissas explícitas

30 dias uniformes, por loja:300 consultas catálogo/dia,20 pedidos/dia,30 páginas admin/dia,24 dashboards/dia;10 mil outras leituras/mês,2 mil outras escritas/mês;131 leituras/catálogo (120 produtos totais+10 categorias+loja),10 leituras/checkout,3 escritas/pedido,28 leituras/página,21 leituras equivalentes/dashboard como aproximação 7 docs+14 agregações de até 1.000 entradas. Não são dados de uso comercial observados. Checkout com 1,2 tentativas influencia requests; retries transacionais/leituras adicionais não medidos devem ser acrescentados.

API computada em 0,15 vCPU-s/request e 1 GiB: premissa ilustrativa de CPU faturável, NÃO derivada da latência Emulator. API bytes catálogo 15 KB, frontend 800 KB por acesso (incluindo estimativa de assets, sem imagens pesadas); cache/CDN/browser variam. Cenário grande troca catálogo por 1.006 leituras/106.726 bytes como etapa 24. Demais parâmetros iguais; não supõe 1.000 pedidos novos/dia.

## Cenários mensais

| Lojas | Reads normais/mês | Writes/mês | Firestore reads USD | Run bruto USD | Subtotal parcial normal USD | Parcial catálogo grande USD | Hosting Firebase estimado adicional USD |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,235,320 | 3,800 | 0.00 | 0.05 | 0.05 | 2.33 | 0.00 |
| 10 | 12,353,200 | 38,000 | 3.26 | 0.50 | 3.75 | 27.38 | 9.18 |
| 50 | 61,766,000 | 190,000 | 18.08 | 2.48 | 20.56 | 138.69 | 52.38 |
| 100 | 123,532,000 | 380,000 | 36.61 | 4.96 | 41.57 | 277.82 | 106.38 |
| 150 | 185,298,000 | 570,000 | 55.14 | 7.44 | 62.58 | 416.96 | 160.38 |

Writes do cenário ficam na franquia diária global sob distribuição uniforme; não significa writes gratuitos para qualquer uso. Horários concentrados/dias irregulares e outros serviços do mesmo projeto mudam as franquias. Hosting é alternativa adicional calculada em GB decimal, com tráfego uniforme e quota diária; não somar ao plano Pages sem escolher provedor. Valores arredondados por componente podem diferir um centavo do subtotal não arredondado.

## Fórmulas para orçamento completo

| Componente | Fórmula / preço a confirmar |
| --- | --- |
| Reads | soma diária max(0,readsDia-quotaDia) × preçoReads100k/100000; adicionar entradas de índice/transaction retries |
| Writes/deletes | quantidade faturada × tarifa/100000; preçoDeletes ref 0,01, nenhum TTL/exclusão ativado |
| Armazenamento Firestore | GiB-mês documentos+metadata+índices × preçoStorage da região; revisar crescimento histórico |
| Egress Firestore/API | GiB por destino/rota × tarifa oficial; tráfego interno entre regiões pode diferir; evitar contar bytes duas vezes |
| Backend | vCPU-s×tarifaCPU + GiB-s×tarifaRAM + requests×tarifaReq + mínimos/egress; incluir Artifact Registry/Cloud Build |
| Logs | GiB ingeridos/retidos/exportados × tarifas; considerar health e sampling de sucesso |
| Backup/PITR/restore | GiB-dia/mês e operações × tarifa escolhida, fora da franquia; proposta precisa orçamento |
| Hosting/images | GB transferidos acima da quota diária + GB-mês/release retention; imagens podem dominar |
| Auth | MAU por provedores/Identity Platform, SMS se escolhido; Anonymous/email não implica custo universal zero |
| Domínios | custo anual/apex e renovação /12; personalizados por cliente, certificados/limites de plano |
| CI | minutos e storage acima de franquia do plano; Emulator/Chrome custam tempo, não multiplicar por loja automaticamente |
| Adicionais | Pages plano superior, proteção de borda/LB/Redis, monitoramento, suporte humano, tributos/câmbio |

PreçoStorage, egress, logs, backup e MAU permanecem variáveis por região/plano, não inventados. Planilha CSV em evidencias-etapa25/variaveis-custos.csv permite preencher cotação. Fórmula final Ctotal=Cparcial+storage+egress+hosting+logs+backup+Auth+dominios+CI+servicos+tributos+reserva; rateio fixo/N mais consumo atribuído, não divisão cega de todos os custos. Decisão sobre plano/FX deve ficar registrada com data. Crédito gratuito não deve financiar promessa de SLA ou margem.

## Desempenho e otimizações futuras

Medições 24: catálogo 1.000 median 166,14 ms, dashboard 202,51 ms; serial no Emulator, sem capacidade concorrente validada. A diferença de custo entre 131 e 1.006 reads mostra prioridade para paginação pública/catálogo cacheado com invalidação e DTO limitado, após contrato/testes específicos. Imagens/CDN/cache, intervalo dashboard e agregados pré-calculados são opções, não implementações especulativas nesta etapa. Clientes têm histórico atualmente sem paginação no caminho próprio: revisar crescimento no âmbito R-012 antes de uso prolongado. Confirmar índices com Query Explain autorizado e métricas por período/loja sem PII.

Orçamento/alertas não bloqueiam cobranças automaticamente. Proposta de alerta 50/75/90/100%do orçamento e picos diários; limite de escala e proteção de borda complementam. Nenhum faturamento/provisionamento pago ou carga real ocorreu.
