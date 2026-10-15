> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# Etapa 25 — Segurança operacional, privacidade e recuperação

13/10/2026. Propostas técnicas; sem alteração IAM/Auth/dados reais, serviço pago ou texto legal publicado. A aprovação local não autoriza execução externa.

## Credenciais e IAM / R-006

Recomendação: service account dedicada por ambiente de API Cloud Run, ADC gerenciada, sem Owner/Editor e sem chave JSON exportada. Runtime precisa operações documentais Firestore e consulta do usuário Auth para checkRevoked; avaliar roles/datastore.user e roles/firebaseauth.viewer ou custom role mínimo compatível, em homologação autorizada. Não presumir que papel nominal satisfaz todas as chamadas; validar permissions de get/update sob identidade candidata e negar administração IAM/Auth não necessária.

Firebase Auth Web emite ID token público para API; Cloud Run IAM de invocação e Firebase Auth são camadas distintas. Endpoint cliente pode exigir invocação pública na camada Run, mas rotas privadas continuam verificando token/role/loja. Acesso público Run não concede dados privados. Identidade runtime não deve criar admins automaticamente. Operador de deploy separado (permissões necessárias de deploy e actAs apenas na SA alvo); backup e auditoria usam identidades separadas, jamais credencial runtime genérica com Owner.

[Identidade gerenciada Cloud Run](https://cloud.google.com/run/docs/securing/service-identity). Os exemplos externos recusam GOOGLE_APPLICATION_CREDENTIALS. Provedores alternativos exigem federação segura comprovada, não chave JSON por conveniência. Segredos futuros (se necessários) em Secret Manager com acesso específico, versão/rotação/rollback; não há segredo necessário no React. .env locais ignorados, Docker allowlist inclui só src/manifests; imagem não root testada sem env nem rede externa.

CI só contents:read, sem id-token/secrets de Firebase; actions fixadas por SHA e Docker base por digest. Revisar pins/dependências em janela controlada e scan da imagem antes de publicação; teste local não equivale a supply-chain audit completo. Chaves antigas, membros IAM e acesso Console exigem inventário externo autorizado, sem impressão de valores.

## Prevenção de abuso / R-007 e R-023

Implementado 25: middleware opt-in RATE_LIMIT_MODE=enforce, obrigatório nos ambientes externos. Janela 60 s por processo, categorias fixas sem URL/nonce no key, SHA-256 de identidade em memória, até 10 mil buckets; expiry/429 com Retry-After. Antes de Auth: socket.remoteAddress, ignorando X-Forwarded-For;600/min por catálogo/admin/API e 120/min POST pedido. Após token verificado:20/min checkout/UID,180/min admin/UID,120/min API/UID. Health/OPTIONS não consumem. Retries idempotentes contam; recuperação GET usa categoriaAPI, preservada após 429. Não usar nonce para criar buckets nem permitir sua rotação driblar limite.

Em development/test padrão off mantém regressões existentes; integração 25 liga enforce e comprova 20 chamadas aceitas (1 criação/19 replays)/um pedido; 21ª429 e recuperação GET. Validação de payload 64 KiB, tipos/IDs e autorização permanece. HTTP 429 já é tratado pelo React sem apagar tentativa; usuário deve aguardar e recuperar manualmente.

Limitações: janela fixa permite rajada na borda; memória reinicia por instância/deploy, sem quota distribuída ou loja. Não é controle de custo absoluto. NAT/IPv6, tráfego compartilhado e proxy Cloud Run podem concentrar IP no peer do balanceador. Não habilitar trust proxy genérico nem confiar no header para solucionar isso. Antes de implantação, escolher proxy de borda que normalize cadeia de IP, impedir bypass do endpoint direto e testar IP legítimo/forjado/NAT. R-023 permanece aberto; thresholds são ponto inicial que exige telemetria e piloto, não contrato.

Plano proporcional: limites de leitura maiores que checkout, cotas por identidade e loja no gateway/armazenamento compartilhado, detecção de novas contas/IP anormais e quotas Auth Console. Login/cadastro/anônimo chamam Firebase diretamente: middleware Express NÃO os limita. Monitorar MAU/erros/abuso, políticas de senha e recuperação; configurar proteções suportadas pelos provedores após aprovação. Avaliar App Check para API com verificação de token e rollout monitorado antes de enforce, sem confundir com autenticação ou segurança de navegador absoluto. [Backend App Check](https://firebase.google.com/docs/app-check/custom-resource-backend).

Redis/limiter distribuído, LB/WAF/Cloud Armor e plano Pages superior são alternativas com custo/ingress a aprovar; nenhum serviço provisionado. Orçamento envia alertas, não corta gastos. Revisar maxInstances e tráfego dos endpoints caros, cache/paginação sob novos testes/contratos.

## Observabilidade

HTTP_LOG_ENABLED=1 registra evento, X-Request-ID gerado pelo servidor, grupo fixo, status e duração inteira ms. Não registra path/query/IP/UID/token/email/password/body. Erros 500/503 continuam com classificador 23 mínimo e requestId. Cache-Control:no-store protege respostas API privadas; nosniff e ausência de x-powered-by preparados/testados. Usuário fornecerequestId jamais é aceito no lugar do UUID gerado.

Proposta de alertas: erro 5xx>2%por 5 min com mínimo 50 requests; checkout 5xx>1%/5 min;429>5%/10 min para revisão, sem bloquear automaticamente toda a loja; disponibilidade abaixo 99,5%em janela diária; p95 API>1 s por 10 min após baseline real; memória>80%/10 min; falhasAuth 503 persistentes; contagem de pedidos por nonce>1 (evento de integridade a investigar); desvios de confirmações financeiras. Critérios são iniciais e precisam calibragem/volume representativo.

Alertas orçamento 50/75/90/100%, tendência diária, leituras/egress/MAU e criação de contas. Painel agregado sem PII, logs com acesso operacional restrito e retenção proposta 30 dias (prazo técnico proposto, não jurídico). Health não mede dependências; smoke funcional sintético em homologação usa conta fictícia controlada e pedido claramente teste, somente após autorização. Não consultar/gravar Firebase real nesta ordem. Retenção/sampling de sucesso evita custo desnecessário, ainda pendente na infraestrutura.

## Dados pessoais / LGPD / R-008

| Dados / localização | Finalidade e acesso | Exclusão/exportação propostas |
| --- | --- | --- |
| UID/email/credenciais em Auth; usuarios/{uid} | Identidade/controle, cliente próprio e operadores privilegiados | Fluxo titular verificado; remover Auth só após preservar vínculo legítimo de histórico |
| Nome/telefone/email/anonimo em lojas/*/clientes | Atendimento e compra, próprio/admin da loja autorizado | Exportar por UID/loja, sem dados de terceiros; apagar/anonimizar segundo política aprovada |
| Endereço/CEP/complemento em clientes/*/enderecos | Entrega, titular/admin autorizado | Exclusão perfil não apaga automaticamente snapshot histórico do pedido |
| Pedido clienteId/endereco snapshot/itens/valores/status/pagamento/observações | Operação e histórico financeiro informativo | Tratar snapshot e notas como PII; retenção legal/comercial pendente |
| Hash/chave associada a assinatura/pedidoId em idempotencia | Recuperação sem duplicação | Nunca apagar associação isolada enquanto retry puder gerar outro pedido |
| Navegador: carrinho e nonce/ref permanentes; dados temporários sessionStorage | Continuidade e recuperação | Logout/trocaUID limpa dados temporários; orientar uso em dispositivo compartilhado |
| Logs mínimos / backups / exportação / WhatsApp | Diagnóstico, recuperação e comunicação | Acesso/retencão por categoria; WhatsApp é fluxo externo controlado pelo usuário |

Não há armazenamento de PAN/CVV ou processamento gateway nesta implementação; forma/status/valor de pagamento são informativos. Não inventar conformidade jurídica definitiva. Definir plataforma/estabelecimento como controlador/operador conforme contratos e fluxos reais, subprocessadores/regiões/transferências, base legal/finalidades, direitos do titular, contato e incidentes com assessoria. [LGPD, texto oficial](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm). Política de privacidade e termos precisam aprovação antes de publicação; nenhum texto legal foi publicado.

## Retenção e idempotência / R-008–009

Proposta técnica: pedidos e financeiro retidos pelo prazo comercial/legal a confirmar; endereços enquanto necessários e ativos, contas anônimas com associação a pedidos preservada até verificar política; logs por 30 dias, backups diários 30 dias e semanais 12 semanas como candidatos. Nenhum desses números é obrigação jurídica confirmada ou job ativado. Separar dados operacionais de prova financeira mínima, manter acesso restrito e workflow auditável para pedidos de exclusão.

No código atual nonce não tem expiry. Política segura inicial: não TTL e manter associação pelo mesmo período em que pedido pode ser recuperado. Propor janela de recuperação comercial de 7 dias para discussão, sem implementar pois cliente atual não envia data autenticada da tentativa. Dentro da janela: mesma chave/mesmo corpo retorna pedido existente; outro corpo 409; resposta perdida usa nonce→pedido; falha antes de commit permite retomada. Depois da janela proposta: recuperar referência existente ou recusar chave antiga explicitamente (410/409, contrato ainda a desenhar), jamais convertê-la automaticamente em novo pedido. Novo pedido exige nova ação/chave consciente.

Antes de expirar: token/envelope da tentativa emitido pelo servidor com tempo autenticado ou tombstone recuperável; transição testada na fronteira/relógio/retries offline, retenção conjunta do vínculo e snapshots, plano de exclusão do titular. Apagar nonce e permitir mesma chave como nova é inseguro; assinatura é SHA-256 do corpo canônico, sem armazenar o JSON bruto; o vínculo com pedido/UID continua exigindo proteção. Tentativas abandonadas sem persistência podem ser limpas no cliente sem apagar associações de pedidos gravados. R-009 não resolvido apenas pela proposta; nenhum TTL/delete/migração real 25.

## Backup, restauração e migração

Propor backup gerenciado diário/PITR conforme RPO 24h/RTO 4h iniciais e orçamento aprovado; RPO/RTO NÃO comprovados. Backup/restore/PITR exigem billing e custam fora das franquias. Criptografia/acesso mínimo por ambiente, localizações/retencão coerentes, inventário/checksum, auditoria e operador distinto; bucket nunca público. [Backups Firestore](https://firebase.google.com/docs/firestore/backups), [export/import](https://firebase.google.com/docs/firestore/manage-data/export-import).

Restauração global deve primeiro ocorrer em projeto/database temporário isolado, sem tocar dados de produção até validar contagens/somas/identidade/Rules. Restauração de loja NÃO deve importar collectionGroup global diretamente na base compartilhada: export/import por collectionGroup não seleciona lojaId. Restaurar backup isolado, extrair só prefixo lojas/{lojaId}, manifesto de documentos/subcoleções e dependências usuarios (globais), dry-run, validação de titularidade, pré-condições de versão e reconcile de escritas posteriores. Não sobrescrever pedidos/pagamentos recentes sem análise. Users Auth não são restaurados automaticamente por backup Firestore; credenciais e recuperação de contas têm procedimento separado.

Ensaio futuro: duas lojas A/B; deletar/alterar somente dados fictícios A em ambiente isolado, restaurar A e provar B byte/hash inalterado, contagem e totais financeiros antes/depois, recuperação nonce e Auth compatível, medirtempo/registrarresponsável. Nenhum backup/restore real nem ensaio de recuperação completo executado 25; plano não prova recuperabilidade. Migração R-004 usa o mesmo manifesto/backup/precondição e rollback do documento de ambientes.

## Incidentes/rollback operacional

Bloquear rota/loja afetada na borda autorizada; preservar evidência mínima e backup, revogar credencial comprometida por operador, reverter tráfego para revisão conhecida sem apagar pedidos recebidos. Compatibilidade de schema/transações deve ser verificada antes de rollback. Comunicações de incidente e obrigações legais exigem plano aprovado; agente não envia mensagens a terceiros. Rastrear cada ação por ticket/aprovação sem tokens/PII.


## Errata documental — Etapa 26,14/10/2026

A auditoria de pedidoService.js confirmou assinatura SHA-256, não corpo/PII em texto claro. A redação corrente foi corrigida; o texto anterior permanece no checkpoint792b069 e na seção100histórica do guia externo. Nenhuma alteração funcional.
