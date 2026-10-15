> Registro histórico da etapa indicada no título. A referência corrente é [README](../README.md) e a documentação da Etapa26. Datas, testes e decisões abaixo pertencem ao seu momento; não comprovam implantação comercial.

# ETAPA 23 — AUDITORIA DE ERROS

Data: 13/10/2026, America/Sao_Paulo. Ordem 10. Escopo: backend Express 5, integração React e emuladores locais. Não inclui implantação, dados reais, migração, licenciamento, troca de roteador ou Etapa 24.

## Auditoria inicial e checkpoint

Registro permanente de 17 ressalvas criado antes do checkpoint/código 23. Branch main, HEAD inicial c2a0cbf. Diff completo 22 preservado e revisto; Guia Mestre, Registro, auditoria/relatório 22, auditoria 21, contratos 19/20 e guia externo consultados. Repositório interno distinto do Git pai; nenhum AGENTS.md aplicável encontrado. Arquivo Repomix mencionado pelo usuário não substitui a fonte local atual.

Scan de 37 candidatos (36 da 22 + registro 23) sem os padrões privados procurados; não garante ausência universal de segredo. Baseline: backend 6 arquivos, HTTP 253, React 38, build e suite 22 integrada 19/20/21 aprovados. Commit local exclusivo 22: 9122f01, 36 arquivos, mensagem solicitada. Registro permanente fica em diff 23. Sem push nem alteração de commits anteriores.

Examinados todos os controllers, routers, middlewares e serviços em backend/src, com especial atenção aos módulos de app/segurança/Auth/checkout/pagamento/WhatsApp e aos consumidores/hook/checkout/admin React. Tratamento repetido era concentrado nos controllers legados, wrappers de rotas públicas/admin, recuperação de pedido, Auth e guarda de validação. Serviços já utilizavam ErroDominio; regras e transações podiam ser preservadas.

## Achados confirmados e hipóteses

| Achado | Evidência | Prioridade | Correção |
| --- | --- | --- | --- |
| Infraestrutura durante Auth era 401 | Reprodução pré-correção em /tmp/etapa 23-reproducao.log: code 14, esperado 503, obtido 401 | Alta | Classificação por etapa: apenas erros conhecidos de verifyIdToken viram 401; consulta Firestore vai ao global |
| Controllers legados forçavam 500 | Catch hardcoded 500 observado; matriz dirigida injeta domínio 400/SDK 503 e confirma tratamento final por família | Alta | Exceções propagadas pelo Express 5; sem catch de resposta repetido |
| Erros de índices/SDK tinham critérios diferentes | Admin tratava code 9 como 503, restante não reconhecia falhas temporárias; code 14 no teste 20 era esperado 500 | Alta | Classificador comum mantém 503 para SDK temporário/precondição de consulta, sem mensagens SDK |
| Rota inexistente não tinha JSON explícito | App anterior não registrava fallback 404; teste final confirma JSON sem refletir URL privada | Alta | Fallback 404 tipado antes do error handler |
| Body inválido em sucesso podia virar null | api.js usava response.json().catch(()=>null), inclusive em 201; novos testes recusam sucesso inválido | Média | Falha de protocolo cliente 502, sem reenviar mutação |
| Timeout abrangia só fetch | Sessão/token/JSON estavam fora do timeout; testes deixam cada await pendente | Média | Prazo global 20 s com abort e limpeza, inclusive respostaJSON |
| Refresh inesperado era tratado como sessão inválida | Catch token invalidava painel para todo código exceto network-request-failed | Média | Somente credenciais conhecidas encerram acesso; infraestrutura é 503/500 segura |
| Resposta tardia podia ser devolvida pelo cliente HTTP | Conferência de UID antes de enviar, mas ausente depois do fetch/JSON; novos casos trocam UID | Média | Conferência após resposta/token/JSON e antes de eventos 401/403 |
| Retry 401 era indiscriminado | api.js repetia qualquer método; nova matriz PATCH confirma um envio | Média | Leitura ou POST /lojas/: lojaId/pedidos com chave; outras mutações não reenviadas |
| Mensagens refletiam valores de entrada | Forma/status/produtoID/campo sensível apareciam em mensagens de domínio | Baixa | Mensagens fixas para esses erros, sem refletir campos arbitrários |

Inspeção estática não foi convertida automaticamente em alegação de exploração/vulnerabilidade. Custo Firestore, histórico da navegação, homologação real e licenciamento permanecem ressalvas a avaliar. Primeira execução pós-mudança falhou porque o teste antigo classificava code 14 como 500; expectativa atualizada para 503 mantendo a prova de sigilo. Não se contabiliza essa execução falha como sucesso.

## Estrutura central

`backend/src/lib/seguranca.js` contém ErroHttp, ErroDominio compatível, classificar, erroAutenticacao, responderErro, registrarFalha, correlacao, rotaInexistente e tratarErro. Erros tipados criados pelo aplicativo podem publicar mensagem conhecida 4xx; erro externo com apenas status/expor não é confiável e vira 500 seguro.5xx sempre mensagem genérica. Categorias: validação, domínio/regra comercial, autenticação, autorização, não encontrado, conflito, parsing, serviço externo e interno.

App adiciona correlação, mantém CORS/JSON 64 KiB/estrutura 22/rotas e encerra com fallback 404 + handler de quatro argumentos. Express 5 encaminha automaticamente throw/rejeição dos handlers async; wrappers executar mantêm exportações como identidade, sem catch de resposta. Guardas síncronos lançam ErroHttp; callbacks de parâmetro/validação usam next(error). Não há nova implementação de schemas.

Se headers já foram enviados, JSON de erro não pode substituir a resposta. O handler fecha a resposta sem passar a exceção bruta ao logger padrão; teste confirma fechamento e ausência de segunda resposta. O cliente interpreta falha de transporte e preserva o nonce de checkout. Não é tentativa de retomar uma resposta HTTP parcialmente enviada.

## Padrão HTTP e SDK

| HTTP | Origem e política |
| --- | --- |
|400|Entrada/schema/regra comercial/transição inválida; parsingJSON inválido/compactação; mesmos modelos 22|
|401|Token ausente/malformado; invalid-id-token, argument-error, id-token-expired, id-token-revoked, user-disabled ou user-not-found exclusivamente durante verificação|
|403|Role/vínculo/titularidade/inatividade interna, sessão anônima tentando admin e CORS negado|
|404|Documento/recurso ausente por regra de domínio, pedido alheio sem revelar sua existência; rota desconhecida JSON|
|409|Categoria vinculada já existente e mesma chave de pedido usada com outro corpo|
|413|JSON acima de 64 KiB|
|415|Charset/encoding ou formato não JSON em mutação com corpo|
|429|Erro tipado suportado e testado; não existe mecanismo de rate limiting novo|
|500|Exceção inesperada, código SDK desconhecido, erro interno/configuração/permissão do Admin; mensagem genérica|
|503|gRPC 1/4/8/9/10/14, aliases conhecidos, rede/DNS/timeout e Auth network; serviço indisponível, sem invalidar sessão|

Firestore PERMISSION_DENIED(7) é falha do backend/Admin, não prova de ausência de permissão do cliente: 500 seguro. NOT_FOUND(5) SDK bruto não é convertido automaticamente em recurso 404, porque pode indicar database/configuração; ausências de domínio são identificadas por snapshots/serviços. INTERNAL(13) é 500; ABORTED(10) após tentativas do SDK é 503. FAILED_PRECONDITION(9), incluindo consulta sem índice, é 503 genérico e requer diagnóstico por requestId; não publica nome de índice ou mensagem bruta ao visitante.

Auth mantém verifyIdToken(token, true), ativo estritamente booleano, roles conhecidas e isolamento de loja. Documento interno de usuário ausente continua identidade pública cliente; usuário inexistente no Auth durante verificação é 401. Falha Firestore ao consultar perfil nunca promove identidade nem assume visitante: 503/500, sem executar controller. Erros Auth de credencial Admin/permission/internal não são classificados como token inválido. Simulação utiliza códigos oficiais, sem depender de texto da exceção.

Dados legados incompatíveis continuam regras de domínio 400 com mensagem segura, sem migração. Documento ausente no fluxo de compra permanece erro comercial 400 quando o serviço já tinha esse contrato. Transições financeiras não mudaram; rejeição de transição é 400. Confirmação financeira continua somente admin autorizado e transacional; WhatsApp sem configuração/estado permitido retorna 400 sem gravar/confirmar.

## Contratos preservados/modificados

43 rotas explícitas, métodos/corpos/queries/limites 22 preservados e teste de inventário real aprovado. Novo fallback 404 não adiciona rota comercial ao inventário; HEAD continua leitura e OPTIONS preflight permitido 204.

Envelope continua `{error: mensagem}`. `X-Request-ID` UUID aleatório gerado no servidor em toda resposta, com exposição CORS; header recebido é ignorado. Headers permitem diagnóstico sem adicionar dados privados ao JSON. Frontend guarda requestId válido nos erros.

Mudanças intencionais: infraestrutura antes 401/500 agora 503 conforme código; conflito de idempotência 400→409; rota desconhecidaHTML→404 JSON; formato de body não JSON 415; erros de domínio antes 500 agora 4xx apropriado. Mensagens desconhecidas/5xx sempre genéricas. Nenhuma abertura de Rules, expansão de acesso ou mudança de preço/status/identidade.

## React e recuperação

Timeout padrão 20 s cobre sessão, token, fetch e leituraJSON. Timer/listener limpos em finally; abort externo resulta em AbortError seguro. Falha de conexão/timeouts recebem status de diagnóstico 503 no cliente e códigos NETWORK/TIMEOUT; não são novas respostas HTTP do backend. Sucesso inválido recebe 502/RESPONSE_INVALID no cliente; 204 continua null. JSON inválido em resposta de erro conserva o statusHTTP com mensagem segura.

Refresh automático de 401 no máximo uma vez para GET/HEAD/OPTIONS ou POST de pedido com chave no caminho suportado. POST endereço, PUT perfil e PATCH/DELETE não são reenviados automaticamente. Erros 429/500/503 não desencadeiam retries de escrita. UID é checado após token, resposta e JSON; uma falha 401/403 da sessão antiga não invalida nova identidade. Somente credenciais conhecidas, não infraestrutura, disparam admin: sessao-invalida.

Checkout conserva carrinho, nonce e corpo congelado para tentativa manual após 503/409/timeout/protocolo. Mesma chave recupera pedido mesmo se commit terminou mas resposta se perdeu. Sem mudança de design/roteador/storage sensível. Perda de resposta de escrita não significa ausência de commit; retorno de sucesso só após JSON válido. Falha de WhatsApp não confirma pedido/pagamento.

## Logs e limites

Somente 500/503 produzem log global mínimo com evento, categoria, status, código conhecido e requestId. Nenhuma mensagem bruta/stack/body/token/UID/loja/path/e-mail/telefone é registrada pelo tratamento da aplicação. Erros esperados 4xx não geram spam de log. Valores de entrada refletidos em mensagens comerciais foram reduzidos. Testes usam sentinelas privadas, código desconhecido e header de correlação malicioso.

Isso não é uma auditoria universal dos logs de SDK/proxy/infraestrutura. Emulator pode emitir warnings de descoberta de metadados e erros esperados das Rules do SDK Web. Não se utiliza esses avisos como prova de falha da suíte nem como aprovação de produção.

## Evidências de teste

Baseline aprovado antes do checkpoint: 6 arquivos backend, 253 HTTP, 38 React, build e Emulator 22→21→20→19. Resultado final: 7 arquivos backend, 285 HTTP, 3 testes globais, 65 React/4 arquivos, build 1.623 módulos, sintaxe 30 JS e diff--check aprovados.

Suite 23 completa exit 0, projeto demo-catalogos-emulator e ambos os hosts locais, Java 21 temporário e cache/tmp. Inclui integralmente 19/20/21/22: 300 negativas diretas SDK Web, 37 HTTP 21, 104 HTTP 22 e **22 verificaçõesHTTP reais novas 23**. Não somar execuções repetidas nem alegar que todas as falhas de infraestrutura foram provocadas no serviço real: Auth/Firestore transitórios foram injetados localmente; transações, persistência e tokens/regressões usam emuladores.

Novas provas reais locais: falha antes de commit, após enfileirar escritas, deixa zero pedidos/nonces; commit concluído com resposta perdida gera 503 e retry do mesmo nonce recupera um único pedido/nonce; financeiro abortado não confirma; erro WhatsApp deixa pendente; retorno à mesma sessão após indisponibilidade; cliente alheio 404/admin protegido 403; logs e respostas sem sentinela. Confirmações concorrentes e revogação real estão nas regressões 20/21, sem criar falsa evidência de gateway.

## Registro permanente e pendências

17 ressalvas preservadas em R-001–R-017. R-015/16/17 resolvidas apenas no escopo local 23; 14 pendentes e nenhuma apagada. Futuras etapas devem atualizar evidência/status/teste/resultado. R-009 confirma falta de TTL/data de expiração; não implementar descarte automático de nonce sem janela/retenção conjunta definida: pode permitir duplicata após uma recuperação tardia. Política prevista antes da produção, não bloqueia conclusão desta etapa se registrada.

Produção, IAM, credenciais, Rules/índices, provedores/domínios, dados/legados, retenção, rate limiting, custos, Java, navegador/celular, roteamento e metadados/licença permanecem no registro. Etapa 24 depende de nova autorização; nenhuma implantação/push/escrita real/migração executada.

Referências oficiais: [Express 5 e erros assíncronos](https://expressjs.com/en/guide/error-handling/), [códigos Firebase Admin Auth](https://firebase.google.com/docs/auth/admin/errors). Classificação conferida também contra os SDKs locais e testes de injeção; não há correspondência por mensagem bruta.
