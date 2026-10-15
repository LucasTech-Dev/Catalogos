# CATÁLOGOS — VALIDAÇÃO REAL PARA DEMONSTRAÇÃO NO RENDER

Ordem 07 — 15/10/2026, America/Sao_Paulo. **Auditoria de leitura concluída; publicação bloqueada.** Nenhum dado foi alterado, nenhuma credencial criada e nenhuma lista publicável habilitada. A aprovação da implementação local anterior não equivale à aprovação dos valores reais.

## 1. Projeto Firebase confirmado

Firebase Management confirmou `bancorestaurante`, estado ACTIVE. Banco `(default)`, Firestore Native, localização existente `nam5`. Não houve criação ou mudança de banco/região, billing, Authentication, Rules ou índices. Ausentes variáveis de Emulator e de seleção alternativa de projeto na sessão de consulta. Evidência: [preflight](evidencias-ordem07/preflight.json).

## 2. Identidade de consulta

ADC existente funcional, cliente `UserRefreshClient`; token usado somente em memória, sem impressão. O mecanismo de credencial é de usuário, sem e-mail nominal recuperado pelo método disponível; identidade nominal não confirmada. Não é identidade aprovada para execução no Render, nem evidência de permissões efetivas somente leitura. Não foram geradas/baixadas chaves ou consultados usuários Authentication. Operações desta auditoria limitadas a leituras autorizadas, incluindo getIamPolicy, cujo verbo HTTP POST não modifica a política.

## 3. Coleções auditadas

Somente documento `lojas/loja-demo`, subcoleções `categorias` e `produtos` dessa loja. Projeções de campos e limites explícitos: categorias até 21, produtos até 51, ordenação por ID. Retornos 4 e 11, abaixo dos limites, sem truncamento observado. Não foram enumeradas outras lojas, coleções raiz, usuários, clientes, endereços, ADM ou pedidos. O script genérico de auditoria Firebase existente foi inspecionado e não executado por exceder esse escopo.

## 4. Quantidade de documentos consultados

| Alvo | Documentos únicos | Leituras de documentos realizadas |
| --- | ---: | ---: |
| Loja autorizada | 1 | 2 |
| Categorias da loja | 4 | 4 |
| Produtos da loja | 11 | 11 |
| Total | 16 | 17 |

A segunda leitura da loja projetou apenas `ativo`, para distinguir ausência de false. Contagens descrevem documentos retornados/obtidos, não constituem extrato de faturamento; metadados e eventual cobrança mínima de consultas são separados. Zero escritas e zero consultas de documentos privados. Evidências não armazenam documentos completos, textos reais, preços individuais ou URLs de imagens.

## 5. Campos públicos identificados

O DTO permite loja `id/nome`, categoria `id/nome`, produto `id/nome/descricao/preco/categoriaId/disponivel` e imagem opcional validada. Nomes e descrições presentes, preços numéricos válidos nos 11 produtos, inclusive representação compatível com centavos. Validação estrutural e detecção de padrões em memória não identificaram alertas óbvios de contato/CPF nos textos projetados; isso não comprova ausência de pessoas reais ou aprovação editorial. Nenhum valor está liberado para publicação nesta ordem.

## 6. Campos internos ou sensíveis

`ativo` controla elegibilidade, sem integrar o DTO. `categoriaId` é vínculo público projetado. A descrição da loja foi examinada como apresentação, mas não integra o DTO atual; ausência no DTO não a torna automaticamente sensível. Logo/imagem da loja ausentes. Campos desconhecidos e metadados não são repassados. Clientes, endereços pessoais, pedidos, ADM, usuários, contatos privados e financeiro interno permanecem fora do escopo e não foram lidos. Não há certificação de seu conteúdo ou existência.

## 7. Produtos candidatos à demonstração

Nove candidatos técnicos: `bacon-burger`, `bacon-supreme`, `batata-da-casa`, `batata-frita`, `chicken-crispy`, `classic-burger`, `coca-cola-lata`, `onion-rings`, `refrigerante`.

Excluídos pelo requisito estrito `ativo === true`: `combo-classic` e `guarana-lata`; o primeiro também aponta para categoria não elegível. Candidato técnico não significa dado aprovado: nenhum produto pode ser apresentado enquanto persistirem os bloqueadores gerais abaixo.

## 8. Categorias candidatas

Três categorias com ativo true: `bebidas`, `hamburgueres`, `porcoes`. `combos` não satisfaz ativo true e fica excluída. Não se inferiu se esse último valor é ausente ou false, pois isso não muda a exclusão.

## 9. IDs permitidos

Loja única do runtime: `loja-demo`. IDs candidatos nos itens 7 e 8 são referência para revisão, não uma allowlist autorizada. Configuração preservada: `CATALOGOS_DEMO_CATALOG_APPROVED=0`, `CATALOGOS_DEMO_PRODUCT_IDS=[]`, `CATALOGOS_DEMO_CATEGORY_IDS=[]`. Nenhum ID foi inserido nos exemplos ou habilitado no ambiente. Mudanças posteriores de documentos exigem revalidação, pois aprovação por ID não congela valores.

## 10. Incompatibilidades com o código

| Achado | Efeito no runtime atual | Correção ou decisão pendente |
| --- | --- | --- |
| A07-02: `ativo` ausente no documento da loja | Catálogo continua 503 mesmo com flag/listas futuramente preenchidas | Revisão e autorização específica para eventual `ativo=true`; preservar guarda estrita |
| A07-03: seis imagens contêm query na URL | DTO omite essas imagens; outros cinco produtos não possuem imagem | Aceitar catálogo sem fotos ou aprovar referências públicas adequadas em rodada própria |
| A07-04: `disponivel` ausente nos 11 produtos | DTO interpreta ausência como disponível | Proprietário confirmar essa semântica ou autorizar ajuste explícito dos dados/código |

Imagens omitidas: `bacon-supreme`, `batata-da-casa`, `chicken-crispy`, `classic-burger`, `onion-rings`, `refrigerante`. Query não prova segredo nem URL maliciosa; apenas viola o filtro atual. URLs não foram reproduzidas, acessadas, reescritas ou testadas remotamente; disponibilidade, licença e proveniência não confirmadas. No estado auditado não haverá imagem de produto no DTO.

## 11. Risco de exposição de dados — bloqueador crítico A07-01

A fonte das Rules efetivamente publicadas foi obtida somente como metadado e analisada em memória. Foi confirmado `allow read: if true` nos seguintes caminhos, inclusive dados potencialmente privados:

- `/lojas/loja-demo`
- `/lojas/loja-demo/ADM/{admId}`
- `/lojas/loja-demo/categorias/{categoriaId}`
- `/lojas/loja-demo/produtos/{produtoId}`
- `/lojas/loja-demo/clientes/{clienteId}`
- `/lojas/loja-demo/clientes/{clienteId}/enderecos/{enderecoId}`
- `/lojas/loja-demo/pedidos/{pedidoId}`

Essas Rules também concedem create/update sem verificar `request.auth`, condicionados apenas a tipos/valores de campos (nome, slug, preço, categoria, lojaId, apelido, número/status/total conforme o caminho). Não foi evidenciada concessão de delete. Trata-se de autorização insegura na configuração publicada, não de comprovação de existência desses documentos, exploração ou vazamento ocorrido. Não foram tentadas leituras privadas nem escritas para demonstrá-la.

Bloquear rotas Express, limitar CORS ou fornecer IAM somente leitura ao Render não corrige esse acesso independente pelo cliente Firestore. Correção das Rules requer planejamento, testes de regressão e autorização específica; nenhuma publicação foi realizada nesta ordem. Evidência estrutural sem conteúdo privado: [Rules sanitizadas](evidencias-ordem07/rules-estrutura-sanitizada.json).

## 12. Permissões mínimas necessárias

No modo demo o código usa somente leituras pontuais Firestore (`DocumentReference.get`/batchGet), sem consultas de coleções, Auth, transações ou mutações. A permissão de dados correspondente é `datastore.entities.get`, confirmada na [referência oficial IAM do Firestore](https://firebase.google.com/docs/firestore/security/iam). Listagens da auditoria usaram a credencial administrativa existente e não são exigência do servidor demo. O papel proposto em `infra/render/iam-demo-readonly.proposta.json` conserva apenas essa permissão; não foi criado nem concedido. O bootstrap exato em Render e permissões efetivas ainda precisam de validação sem ampliar privilégios por conveniência.

`roles/datastore.viewer` é candidato mais amplo, inclusive listagem, e não limita documentos à loja. `roles/datastore.user` permite escrita e não atende ao requisito. Owner/Editor/Auth Admin não são soluções para a demonstração. Sem necessidade de Firebase Authentication, getUser, verificação de token ou permissão firebaseauth.users.get nesse ramo.

## 13. Possibilidade real de identidade sem escrita

É tecnicamente viável atender as operações atuais com papel personalizado de leitura pontual. Porém a conta sugerida `catalogos-api-demo-readonly@bancorestaurante.iam.gserviceaccount.com` retornou 404 na consulta exata; não foi localizada. A política direta do projeto não contém concessões para esse alvo. Não foram verificadas heranças de organização/pasta, grupos, políticas deny ou permissões efetivas; nenhuma identidade está certificada como somente leitura.

A permissão proposta não confina por si só leituras à `loja-demo`: uma identidade com get no banco poderá ler outros documentos de IDs conhecidos se usada fora das guardas do aplicativo. Não afirmar isolamento por loja via IAM sem mecanismo e evidência adicionais. Não usar ADC pessoal no Render. Criação de identidade, revisão de política efetiva, credencial Secret File e teste real dependerão de nova autorização.

## 14. Limitações do Admin SDK

Admin SDK usa IAM e ignora Firestore Security Rules destinadas aos clientes. A projeção do DTO evita retornar campos adicionais, mas a leitura pontual atual pode obter o documento completo em memória do servidor. Logo, DTO e guardas de rota não equivalem a isolamento da credencial por campo/documento; autorização mínima IAM e proteção da credencial continuam necessárias. Secret não deve entrar no Git, VITE_*, logs ou navegador.

## 15. Rules e índices verificados

Release `cloud.firestore` encontrada. Arquivo publicado de 2.820 caracteres, SHA-256 `ea471f6e68be6199d75122c6a01a28bf8805b8d5aa052872bced317478d920fa`, divergente das Rules locais deny-all. Releitura confirmou o mesmo hash antes da classificação do item 11. A evidência estrutural complementa os indicadores textuais iniciais; não se concluiu segurança apenas por busca de strings.

Metadados de índices compostos de `produtos` e `pedidos`: listas completas para esses dois grupos retornaram zero. Nenhum dos sete índices compostos do manifesto local foi encontrado/READY. Não se consultaram documentos de pedidos, nem exemptions de índice de campo único. Tentativa inicial de metadados retornou 400; parâmetros corrigidos e GETs concluídos, sem erro de permissão ou divergência de projeto. Isso não é inventário global de todas as coleções.

Leitura pontual do modo demo dispensa esses índices compostos. A divergência afeta a homologação das consultas do sistema completo e deve ser tratada em fase própria; não publicar índices automaticamente. Consultas somente leitura seguiram as APIs oficiais de [release Rules](https://firebase.google.com/docs/reference/rules/rest/v1/projects.releases/get), [ruleset](https://firebase.google.com/docs/reference/rules/rest/v1/projects.rulesets/get) e [índices](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.collectionGroups.indexes/list). Evidência: [metadados](evidencias-ordem07/metadados.json).

## 16. Matriz de publicação e riscos residuais

| Superfície | Estado e requisito |
| --- | --- |
| Dados liberados | Nenhum valor/ID aprovado para exposição nesta ordem |
| Health GET/HEAD / | Permitido pelo ramo demo; não lê Firestore |
| GET/HEAD /publico/lojas/loja-demo/catalogo | Configuração permanece bloqueada; depende de Rules, conteúdo, loja ativa e identidade |
| OPTIONS | Apenas preflight dos dois caminhos, origem/método permitidos |
| Outras lojas/admin/clientes/endereços/pedidos/Auth/checkout e mutações da API | Bloqueados no modo demo antes dos serviços |
| Acesso direto Firestore | Rules publicadas inseguras; bloqueador crítico independente do ramo demo |
| IAM | Identidade não localizada, concessões efetivas e Secret File não validados |
| Abuso/custo | Cache 30s, coalescência e limiter local não são teto de custo ou proteção distribuída; proxy pode agrupar clientes |
| Conteúdo futuro | Alteração de documento pode invalidar revisão por ID; prever suspensão e nova revisão |
| Publicação real | Render, integração Cloudflare/API e montagem de Secret ainda não testados |

## 17. Correções necessárias

Primeiro revisar e testar a correção das Rules para fechar acesso indevido a dados privados e mutações sem autenticação, com análise do impacto no frontend atual; somente publicá-la mediante aprovação específica. Depois resolver ausência de ativo na loja, semântica de disponibilidade, decisão sobre imagens e aprovação humana dos valores candidatos. Em fase autorizada própria preparar identidade sem escrita, conferir herança/permissões efetivas e testar execução real. Não avançar para listas aprovadas, GitHub, deploy Render ou alteração Cloudflare automaticamente.

## 18. Estado das ressalvas e validação local

Preservados 25 IDs: 16 abertos e nove resolvidos localmente. A07-01 a A07-04 são achados desta auditoria, não novos IDs R. R-005 permanece aberta com divergência real comprovada; R-006 aguarda identidade/permissões efetivas; R-007/R-023 continuam abertas. Não encerrar R-023 por limiter/cache/documentação. Sistema não liberado para vendas comerciais.

Nenhum código de runtime foi modificado nesta ordem. Resultados anteriores backend342/React92/infra7/builds/Emulator são históricos e não comprovam a integração real ou a segurança das Rules publicadas. Nesta rodada conferir apenas consistência documental, links, JSON sanitizado, configuração bloqueada, diff e ausência de padrões de credenciais nos novos artefatos; resultados em `evidencias-ordem07/verificacao-local.txt`.

## 19. Arquivos documentais atualizados

Este relatório; `RENDER_DEMO_SOMENTE_LEITURA.md`, `IMPLANTACAO_RENDER_HOMOLOGACAO.md`, `RESSALVAS_E_PENDENCIAS_PRODUCAO.md`, `GUIA_MESTRE.md`, `REGISTRO_DE_TRABALHO.md`; evidências em `docs/evidencias-ordem07/`. Fora do repo: `ESCOPO_LOGICO_E_FLUXO_DE_DADOS_ATUALIZADO.txt` e `GUIA_CONSOLIDADO_EtapasDeProducao_06-10-2026_ATUALIZADO.txt`, preservando histórico. Diffs anteriores e arquivos novos preservados, sem commit/push/deploy.

## 20. Autorização necessária para a próxima fase

Entregar esta auditoria ao proprietário e aguardar aprovação. Recomenda-se como próxima ordem preparar a correção das Rules e seus testes de impacto; publicação depende de autorização específica. Alterar documentos, aprovar conteúdo/IDs, criar identidade/IAM/credencial ou publicar Render/Cloudflare são ações distintas ainda não autorizadas. Catálogo permanece fechado. Não houve modificação do Firebase real nesta ordem.
