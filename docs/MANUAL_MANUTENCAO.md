# Manual de manutenção

14/10/2026. Operação de produção exige ordem própria; este manual não a autoriza.

## Diagnóstico

Identificar versão/ambiente/projeto,grupoHTTP,status e X-Request-ID. LogsHTTP mínimos, semtokens/body/IP/UID/PII. Health/ responde processo, não disponibilidadeFirestore/Auth. Diferenciar401credencial/403autorização/404recurso/409conflito/429limite/500interno/503infra. Confirmarsepedido persistiu antes de reenviar; usar recuperação pela mesmachave/UID/loja.

## Atualizações e testes

Branch/checkpoint/diff/scan antes de alterações; npm ci via locks, backend/React/infra/build e suite 25 Emulator com evidências em/tmp. npm audit e revisão de pinsSHA/digest, sem upgrades maiores automáticos. Não reinserir mock comercial no catálogo nem relaxarRules/IAM. Documentardefeito/reprodução/correção/regressão. Revisar [referênciaAPI](REFERENCIA_API.md) e modelo na mesma mudança.

## Segurança e suporte

Revogarcredenciais/ajustarIAM só medianteordem/autorização. R-024 descreve suporte por equipe: conta individual/loja/MFAquandoelegível,menosprivilegios,acessotemporário/aprovação,logs de açõesprivilegiadas emproposta; nãoexiste superadminpronto. Credenciaisexternas de teste têmorigemvalidade não comprovada; não usar como acesso produção/não publicarbackup.

Limiter é memória/processo, reinicia e pode concentrarNAT/proxy. R-023 pede borda normalizada/distribuição/ingresso sembypass antes de produção; não confiarX-Forwarded-For. AuthSDK direto precisa controles próprios. SemTTLnonces; retenção/exclusãopropostas dependem de jurídico/proprietário.

## Recuperação/rollback

Degradarcontido porloja/rota mediante autorização, preservar pedidos novos e estadofinanceiro. Restaurar primeiro emambienteisolado; filtrar prefixoLoja/manifesto/precondições, provar outra loja inalterada, reconciliar escritas posteriores. BackupFirestore não restauraAuthautomaticamente. Não aplicarimportcollectionGroupglobal sobrebase compartilhada para recuperar umaloja. RPO24h/RTO4h são propostas não comprovadas.

Reverterrelease/image/tráfego/configcompatível; dadossomente complano específico. Smokeapósrollback e alertasbaseline. [Checklist25](ETAPA_25_CHECKLIST_IMPLANTACAO.md),[homologação](PLANO_DE_HOMOLOGACAO_COMERCIAL.md). Incidentes não podem publicarPII/token emmensagens; comunicação jurídica/cliente porresponsável humano.
