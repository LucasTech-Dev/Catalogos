# Plano de homologação do primeiro restaurante piloto

14/10/2026. **NO-GO para lançamento real.** Não implantação autorizada. Testeslocais não comprovam configuração/IAM/fatura/dispositivosprodução.

## Fases e aceite

1. Proprietário:aprovar público/região/pacote/preço/suporte/prazo,SLA,arquitetura/provedor/região/domínios/orçamento completo. Preços históricos não são contrato assinado.
2. Segurança+operador:projetoshomolog/prod separados,Web/Auth/ADC/IAM,adminindividualescopoLoja,R-024/R-025/credenciais,protectionedge/proxy/NAT/cotas/AppCheckse escolhido;bloquearbypass.
3. Dados:aprovarconfigcomercial,backup/restoredeensaioisolado,legados/mapas/financeiro;publicarRules/índices somentecomordem,READY/queryreal/Explain.
4. QA+restaurante:roteiro 24 preenchido emChromeFirefoxSafari/AndroidiOS físicos,slow/offline/UID/clienteA-B/carrinho/checkout/taxa/mínimo/um pedido/recovery,admin/financeiro/configurações. WhatsApp somenteaçãohumana;mensagem/recebimento/pagamentoverificados separadamente.
5. Operações:logs semPII/alertas/limites/budget/escala/teste rollback,baselinep95/erros/custo. RPO/RTOmedidos. Não prometer centenas de clientes simultâneos sem carga autorizada representativa.
6. Proprietário+restaurante:assinaraceite/homologação eordem de piloto controlado,versão/imagedigest/release/IDsambiente/janela/responsável/rollback.

## Matriz GO/NO-GO

| Gate | Evidência local 26 | Falta antes do GO | Estado |
| --- | --- | --- | --- |
| Código/contratos/regressões | Backend325/React79/infra/Emulator/Chrome/build | Teste noambiente escolhido egravações sintéticas autorizadas | GOlocal;NO-GOreal |
| Arquitetura/orçamento/plano | Proposta/modeloparcial | Aprovaçãodono/região/plano150/custo completo | NO-GO |
| Firebase/Auth/IAM/Rules/índices | Guardas/examples/denyEmulator | Configuração externa/READY/queries/revogação/permissões | NO-GO |
| Comércio/dados/WhatsApp | Fluxofictício eURL | Aprovaçãorestaurante,telefone/material/preços/conferência humana | NO-GO |
| Abuso/proxy/distribuição | Limiterlocal 429 | NAT/ingresssem bypass/cotas/AuthSDK/telemetria | NO-GO |
| Privacidade/retencão/nonce | Inventário/políticas propostas,semTTL | Decisãojurídica/proprietário/recoverysemduplicata | NO-GO |
| Backup/restore/legados | Plano/manifestsdoc | Ensaioisolado,outralojaintacta,RPO/RTO e vínculos | NO-GO |
| Dispositivos/acessibilidade | Chrome automatizado eviewportmobile | Dispositivosfísicos/navegadores/teclado/contraste/zoom | NO-GO |
| Equipe/credenciais | Manuais,R-024/R-025 | Acessoindividual/controle/aprovação/proveniência/rotação | NO-GO |
| Lançamento/rollback/alertas | ChecklistA–H/CIsem deploy | Ordemauditável,piloto/smoke/alertas/rollback | NO-GO |

GO final exige todos gates obrigatórios comprovados eaceites assinados. R-004 condicionalàexistênciadelegados;não bloqueiarglobalmente dadosnovosfictíciosporplanejamento,não migrar ambíguos. R-011 éreprodução operacional eR-014 decisãodedistribuição;avaliardisposição contratual antesdepiloto. Nenhuma ressalva éresolvida sópor esta matriz.

Registrofuturo:cadaitem aprovado/reprovado/nãoexecutado,data/dispositivo/ambiente/versão/responsável/evidência não sensível/ticket/ação. Semdocumentaçãoinventada ouenviodemensagemautomática. [Roteiromanual24](ETAPA_24_ROTEIRO_HOMOLOGACAO_MANUAL.md),[implantação](MANUAL_IMPLANTACAO.md),[ressalvas](RESSALVAS_E_PENDENCIAS_PRODUCAO.md).
