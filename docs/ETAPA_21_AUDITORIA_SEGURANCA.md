# Etapa 21 — Auditoria de segurança do Firestore e dos acessos

Data: 13/10/2026. Ordem de Desenvolvimento 08. Escopo: implementação e validação local; produção não homologada. Referência: `main`, checkpoint `0b1ec3d`.

## Checkpoint obrigatório, antes das correções

Foram examinados status, branch, diff e documentação das Etapas 19/20, Guia Mestre, Registro de Trabalho e guia externo (seção 95). Regressões anteriores aprovadas: backend (4 arquivos), HTTP (61 testes/subtestes), React (28 testes), build e suíte completa Auth/Firestore Emulator da Etapa 20, que inclui a 19. A revisão de segredos dos 84 arquivos candidatos não encontrou os padrões privados procurados; ambientes locais e dependências não foram versionados. Nenhum segredo foi transcrito.

Commits exclusivamente locais:

- `2c06313` — implementação integrada das Etapas 19/20 (77 arquivos).
- `0b1ec3d` — documentação das Etapas 19/20 (6 arquivos).

As etapas compartilhavam serviços HTTP/backend e configuração; a separação artificial por etapa prejudicaria a consistência. Foram feitos commits coesos de implementação e documentação. Histórico anterior preservado; nenhum push, reset destrutivo ou rebase. Artefato `demo/dist/index.html` regenerado foi restaurado à versão do checkpoint após validação do build.

## Arquitetura e fronteiras auditadas

O frontend utiliza Firebase Auth e API Express; não necessita leitura/escrita direta no Firestore. `firebase.json` aponta para Rules/índices locais e emuladores Auth 9099/Firestore 8080, singleProjectMode. Rules negam toda leitura/escrita pelo SDK cliente, inclusive catálogo público, usuários e caminhos desconhecidos. A leitura pública prevista ocorre em `GET /publico/lojas/:lojaId/catalogo`.

Coleções usadas: `usuarios/{uid}`, `lojas/{lojaId}`, subcoleções `produtos`, `categorias`, `clientes/{uid}/enderecos`, `pedidos` e `idempotencia`. Configurações comerciais pertencem à loja; pagamento é snapshot do pedido. `financeiro/config` e coleção desconhecida entram como provas de negação futura, não como novas funcionalidades.

O Admin SDK ignora Rules e mantém privilégios. Autorização independente na API: ID Token verificado com revogação, documento interno com role conhecida/ativo estritamente booleano, vínculo de loja para admin, UID verificado para cliente e endereço. Usuários sem documento interno continuam clientes públicos; não ganham role administrativa. Clientes legados com vínculo interno são restringidos à loja registrada. Cliente público pode comprar em diferentes lojas, sempre sob seu próprio UID dentro de cada loja.

## Matriz de permissões efetivas

A tabela refere-se à loja A e seus recursos; administrador B é vinculado a outra loja. P = permitido, N = negado. Cliente inclui sessão anônima autenticada, exceto gestão de credenciais da conta.

| Ação | Visitante sem token | Cliente/anon próprio UID | Admin A ativo | Admin B ativo |
| --- | --- | --- | --- | --- |
| Catálogo público projetado via API | P | P | P | P |
| Firestore direto: get/list/create/update/delete, qualquer coleção | N | N | N | N |
| Perfil próprio/endereço próprio via API da loja A | N | P | P para seu UID | N |
| Dados/endereço de outro cliente | N | N | P conforme rota administrativa A | N |
| Listar pedidos da loja A | N | P somente seus pedidos | P | N |
| Detalhe/WhatsApp de pedido próprio | N | P | P | N |
| Detalhe/WhatsApp de pedido alheio | N | N (404) | P | N |
| Criar pedido pela API | N | P, identidade e valores confiáveis | P, regras de domínio | N |
| Recuperar checkout pela chave e UID | N | P somente própria chave | P somente própria chave | N |
| Dashboard/clientes/configuração administrativa A | N | N | P | N |
| CRUD produto/categoria e configuração da loja A | N | N | P | N |
| Status e confirmação/recusa financeira | N | N | P, transições e transações | N |
| Alterar role/UID/loja por perfil do navegador | N | N | N | N |
| Uso de token inválido/expirado/revogado/desativado | N | N | N | N |

A negação de escrita direta também abrange documento próprio e caminhos novos; não depende da existência do documento. Ausência de permissão de visitante no SDK é intencional. APIs não usam consultas globais de collectionGroup para contornar escopo.

## Achados e correções

Severidade contextual, sem pontuação CVSS ou declaração de exploração em produção. Os achados 1–5 tiveram reprodução por teste que falhava antes da correção; o 6 teve teste de caminho específico falhando. Os demais foram identificados na leitura e receberam testes de proteção posteriores.

| Achado | Severidade | Evidência/efeito | Correção e validação |
| --- | --- | --- | --- |
| `ativo: 'false'` habilitava admin | Alta | Flag textual truthy passava no middleware | `ativo === true`, roles conhecidas; HTTP + Emulator booleano/textual negados |
| Campos públicos permitiam objetos contendo segredo | Média | Nome/ingredientes retornavam objeto legado completo | Projeções de campos e tipos, objetos aninhados explícitos e URLs HTTP(S) sem credenciais; sentinelas ausentes |
| `/usuarios/me` devolvia documento interno completo | Alta | Campo legado `senha` retornado | Projeção própria; HTTP e Emulator sem campos extras |
| Pedido próprio/admin carregava extras privados de pagamento/endereço | Alta | `pagamento.token` e `endereco.senha` vazavam | Projeções em pedido, cliente, usuário, endereço e respostas administrativas/legadas |
| Criação calculava preço antes da transação | Alta | Mudança de 20 para 99 antes de runTransaction ainda produzia preço antigo | Loja/configuração, produto/categoria e endereço lidos dentro da mesma transação que grava pedido/nonce; teste usa 99 |
| `lojaId` com barras codificadas apontava para cliente privado | Alta | Catálogo consultava `lojas/A/clientes/vitima` como documento de loja e retornava nome/telefone | Identificador simples em parâmetros e referências, sem barras/controle; HTTP + Emulator retornam 400 |
| Mistura de Auth Emulator e Firestore real era possível por configuração | Alta | Inicialização anterior não exigia ambos os hosts nem projeto demo | Validação antes da inicialização SDK: dois hosts locais, portas válidas e demo; frontend rejeita emulador remoto/projeto real |
| Erros internos eram logados e alguns retornados integralmente | Média | `console.error(error)`/mensagens internas sem distinção de domínio | Logger só evento/código conhecido; erro de domínio explicitamente exposto, interno genérico 500; prova HTTP e logger sem sentinela |
| Checkout persistia nome/telefone/endereço/pedido em localStorage | Média | Snapshot privado permanente na tentativa | Marcador mínimo UID/nonce/ID permanente; payload só sessionStorage; limpeza/migração de legados e recuperação autenticada pela API |
| Troca de usuário aceitava respostas privadas atrasadas e arriscava enviar etapa seguinte sob outro UID | Alta | Hooks públicos sem versionamento de sessão; checkout com vários awaits | Versão de sessão/limpeza de formulários; API verifica UID antes/depois do token; checkout fixa UID e descarta respostas antigas; testes React |
| Índices de soma do dashboard não incluíam `total` | Operacional | Consulta usa soma em campo ausente da declaração composta | Dois índices declarados localmente, com campo da agregação; homologação real pendente |

Nenhuma vulnerabilidade crítica/alta identificada acima ficou sem correção no escopo local. Isso não atesta segurança integral de produção, IAM, infraestrutura, dependências ou dados reais.

## Contratos preservados e diferenças documentais

- Idempotência permanece por loja+UID+chave, assinatura canônica de corpo e escrita transacional. Repetição após indisponibilidade do produto recupera pedido existente; chave com outro corpo falha.
- Cliente não pode confirmar pagamento, alterar status ou definir desconto; preço unitário/total do navegador não são fonte de cálculo. UID do corpo não substitui identidade.
- Apenas produtos ativos publicáveis são retornados. Categoria inativa oculta seus produtos e impede novos pedidos; produtos ativos indisponíveis continuam sinalizados. Documentos legados sem categoria preservam compatibilidade, sujeitos a saneamento futuro.
- Campos legados extras deixam de aparecer, mesmo em respostas privadas/admin. Dados sensíveis não são removidos do banco por esta etapa; não houve migração.
- Endpoint adicional `GET /lojas/:lojaId/pedidos/finalizacao/:chave`: autenticação, scope de loja, chave derivada de UID, titularidade e projeção. Permite retomar após fechar a aba sem manter PII permanentemente. 404 não distingue pedido alheio.
- Fechar a aba perde o corpo privado ainda não confirmado, preservando a chave. Se o servidor não tiver pedido, usuário preenche novamente; conflito de corpo com commit tardio não cria duplicata e permite recuperação posterior.
- Checkout preserva snapshot de endereço no pedido. Alterar endereço posteriormente não altera WhatsApp de pedido antigo.
- Documentação 19/20 refletia projeções superficiais, transaction limitada à gravação idempotente e dados de tentativa permanentes. As ressalvas são substituídas pelos contratos acima.

## Ambiente, credenciais, CORS e logs

Admin utiliza Application Default Credentials somente fora da emulação; nenhuma conta privada é enviada ao React. Configuração Web pública Vite não contém segredo Admin. `.gitignore` protege `.env*` (exceto exemplos), arquivos de conta de serviço, PEM, dependências, builds/logs e `.firebase`. As variáveis locais não foram copiadas aos relatórios.

CORS continua allowlist explícita, sem wildcard/credenciais de cookie; origens inesperadas recebem 403. Ausência de Origin permite cliente HTTP e não concede autorização. ID Token Bearer continua obrigatório nas rotas privadas; token de refresh tratado pela SDK Auth, sem armazenamento manual em checkout. JSON tem limite de 64 KB e resposta de parsing genérica.

Guarda local evita projeto real no modo Emulator. O modo real sem hosts continua disponível para o aplicativo normal; não foi executado nesta auditoria. Credenciais externas, IAM e política de retenção em produção dependem de homologação autorizada. UID/nonce/ID não são senha/token, mas continuam metadados locais a considerar em navegador compartilhado.

## Índices e consultas

Todos os índices possuem scope COLLECTION, sem abertura de Rules:

| Consulta | Índice/cobertura |
| --- | --- |
| Pedido por UID do cliente | `clienteId` simples automático, sem ordenar globalmente |
| Lista admin por data | `criadoEm` DESC simples |
| Status+período e paginação status/data | `status` ASC + `criadoEm` ASC e DESC |
| Financeiro confirmado, não cancelado, intervalo | `pagamento.status` ASC + `criadoEm` ASC + `status` ASC |
| Soma dos pedidos por intervalo | Novo: `criadoEm` ASC + `total` ASC |
| Soma confirmada por intervalo, não cancelada | Novo: `pagamento.status` ASC + `criadoEm` ASC + `status` ASC + `total` ASC |
| Integridade produto/categoria ativo | `categoriaId` ASC + `ativo` ASC |
| Produtos ativos/indisponíveis e contagens | Índices simples/equality merge padrão |

A inferência dos campos de soma segue as propriedades de índice documentadas pelo Firebase. Emulator não comprova existência/necessidade exata dos índices compostos em produção. Não houve publicação; será necessário homologar as consultas reais e eventuais índices sugeridos. Erro não deve liberar leitura global nem mascarar valor financeiro como zero.

## Evidências e limites dos testes

HTTP usa Express real e Firestore fake para provas dirigidas; Emulator usa Auth/Firestore reais locais, SDK Web e Admin separados. 300 negativas = 6 atores (visitante, cliente, outro cliente, anônimo, admin A, admin B) × 10 caminhos × 5 operações. Os dez caminhos incluem loja, produto, categoria, cliente, endereço, pedido, usuário, idempotência, configuração financeira e coleção desconhecida. Admin grava/lê fixture ignorando Rules, depois HTTP comprova os guardas.

Testes HTTP Emulator novos: 37 verificações, mais assertions de contagem/snapshot/preço/sigilo; criação concorrente 5x resulta em um único pedido. Revogação real de refresh token, confirmações simultâneas e corrida categoria/produto são cobertas pela regressão da Etapa 20. Token expirado testado no Emulator; tokens locais não comprovam assinatura criptográfica de produção. Não se alegou teste de token forjado contra Firebase real.

Logs completos locais em `/tmp/etapa21-*.log`, sem anexar credenciais. Resumo de resultados finais no relatório. A CLI pode emitir MetadataLookupWarning por tentativa de descoberta de metadados em ambiente sem rede; hosts explícitos e projeto demo foram mantidos e todas as operações de dados permaneceram nos emuladores. Java 21 temporário existente foi usado; instalação permanente permanece pendente.

## Fontes oficiais consultadas

- [Rules e condições; Admin SDK não se submete a Rules](https://firebase.google.com/docs/firestore/security/rules-conditions).
- [Firestore Emulator e diferenças de produção](https://firebase.google.com/docs/emulator-suite/connect_firestore).
- [Transações](https://firebase.google.com/docs/firestore/manage-data/transactions).
- [Propriedades dos índices, incluindo campos de agregação](https://firebase.google.com/docs/firestore/query-data/index-overview).
- [Agregações e limitações](https://firebase.google.com/docs/firestore/query-data/aggregation-queries).
