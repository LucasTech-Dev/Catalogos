> Continuidade vigente: Etapas1–4 concluídas tecnicamente localmente. Seed permanece exclusivamente Emulator; implantação real e publicações não iniciadas. Histórico abaixo preservado.

# Provisionamento de lojas — Etapa2 comercial

Documento técnico,28/10/2026. Roteiro e estado no [plano mestre](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md). Execução atual somente no Emulator; não é autorização nem ferramenta habilitada para produção. A matriz oferece código/contratos, nunca cópia dos dados da Demo. Fontes verificadas: `frontend/src/services/{projecaoPublica,adminCatalogo,adminGestao,perfil,pedidos,pedidoIncremental,adminPedidos}.js`, Rules e índices locais. Nenhuma consulta ao banco real foi necessária. Relatórios012/013 são evidências históricas de limpeza/painel, não um inventário atual da produção.

## Contrato inicial definitivo desta versão

Cada manifesto cria exatamente cinco documentos numa operação atômica com precondição `exists:false`. Não existe documento `lojas/{lojaId}/loja`: a configuração está no próprio documento `lojas/{lojaId}`.

| Caminho | Campos / conteúdo | Criação e acesso |
| --- | --- | --- |
| `lojas/{lojaId}` | `nome, descricao, telefone, whatsapp, instagram, endereco, horarios, logo, imagem, corPrimaria, tempoMedio, pagamentos, entrega, retirada, pedidoMinimo, ativo` | Seed com dados informados pelo novo estabelecimento; leitura admin da própria loja |
| `catalogosPublicos/{lojaId}` | Projeção por allowlist de `projetarRegistro('loja',...)`, inclusive folhas dos mapas; sem UID, papel ou dados privados de clientes | Leitura pública da loja ativa; gravações normais acopladas à origem e revisão |
| `lojas/{lojaId}/controleCompra/versao` | `{revisao:0, alteracao:null}`; alterações comerciais posteriores incrementam revisão e indicam `{tipo,id}` | Admin e compradores leem; sem este documento o gravador bloqueia a compra |
| `lojas/{lojaId}/contadores/pedidos` | `{ultimo:0}`; significa próximo número1, sem reserva/pedido fictício | O contador não contém PII. Nas Rules atuais um comprador autorizado pode ler; alteração exige conclusão transacional válida, não ajuste arbitrário |
| `usuarios/{uid}` | `{role:'admin', ativo:true, lojaId}` | Autoridade global por UID. Apenas bootstrap local privilegiado; clientes/admins não alteram este vínculo pelo SDK |

`endereco`: mapa com `rua, numero, bairro, cidade, uf` obrigatórios no manifesto; opcionais `logradouro, complemento, cep`. Projeção preenche strings vazias das folhas ausentes. `horarios`: sete dias `segunda,terca,quarta,quinta,sexta,sabado,domingo`, cada um com `fechado:boolean` explícito e, quando aberto, `abertura/fechamento` HH:mm diferentes. Origem mantém mapas editáveis; projeção transforma cada dia em texto público. Não usar o texto público como origem de edição.

`pagamentos`: opções booleanas `pix,dinheiro,cartao_credito,cartao_debito`, ao menos uma verdadeira. A projeção inclui também `cartao:false` por compatibilidade do contrato atual, sem criar gateway ou chave Pix. `entrega:{habilitada:boolean,taxa:number}`, `retirada:{habilitada:boolean}`; ao menos uma modalidade habilitada. Taxa e pedido mínimo são valores finitos, não negativos, até1.000.000 e com no máximo dois decimais. Imagens de loja usam validação atual do serviço; preferir HTTPS. `ativo:true` publica somente a configuração local e um catálogo vazio, sem colocar produto/pedido no banco real.

## Coleções criadas pelos fluxos, nunca copiadas ou pré-preenchidas pelo seed

O Firestore não exige criar coleções vazias. Os caminhos abaixo surgem quando o usuário executa as funcionalidades correspondentes; ausência inicial é intencional.

| Caminho | Campos do contrato atual | Escritor / proteção |
| --- | --- | --- |
| `lojas/{L}/categorias/{id}` | `nome,descricao,icone,ordem,ativo`; `atualizadoEm` quando gerido pelo painel | Admin da loja; origem/projeção/revisão na mesma transação; desativaçãoB-03 conserva gate existente |
| `catalogosPublicos/{L}/categorias/{id}` | `nome,descricao,icone,ordem,ativo`, sem timestamps privados | Projeção canônica; apenas categorias ativas são públicas |
| `lojas/{L}/produtos/{id}` | `nome,descricao,categoriaId,preco,ativo,disponivel,imagem,ingredientes`; `criadoEm,atualizadoEm` geridos pelo painel | Admin; vínculo de categoria e revisão protegidos; exclusão lógica |
| `catalogosPublicos/{L}/produtos/{id}` | Mesmos campos comerciais públicos, sem timestamps ou campos exclusivos da origem | Leitura pública exige produto e categoria ativos; preço/disponibilidade são os da loja |
| `lojas/{L}/clientes/{uid}` | `nome,telefone,email,anonimo` nas gravações atuais; datas históricas, quando existentes, preservadas | Titular cria/edita; admin lê apenas da própria loja; nunca inferir role a partir desse perfil |
| `lojas/{L}/clientes/{uid}/enderecos/{id}` | `rua,numero,bairro,cidade,uf`; opcionais `apelido,complemento,cep` | Titular; admin tem get individual para detalhe autorizado, sem acesso cruzado |
| `lojas/{L}/clientes/{uid}/tentativasCompra/{chave}` | `lojaId,clienteId,revisao,dados,marcador,assinatura,itens,ids,unidades,centavos,criadoEm,expiraEm,estado` | Titular, protocolo incremental. `dados` contém `itens[{produtoId,quantidade}],tipoEntrega,pagamento{forma},cliente{nome,telefone},observacao,enderecoId`; valores/itens confirmados pelas Rules; sem excluir/reabrir chave |
| `lojas/{L}/pedidos/{id}` | `numeroPedido,lojaId,clienteId,enderecoId,endereco,itens,subtotal,taxaEntrega,desconto,total,pagamento,observacao,tipoEntrega,status,cliente,criadoEm,atualizadoEm,operacaoCompra` | Compra transacional validada; titular/admin da loja; sem seed, renumeração ou exclusão |
| `lojas/{L}/idempotencia/{hash}` | `clienteId,lojaId,pedidoId,assinatura`; hash derivado de UID/chave pelo serviço | Criado junto ao pedido; sem lista/edição/exclusão pelo cliente |
| `lojas/{L}/numerosPedidos/{numero}` | `numeroPedido,pedidoId,clienteId` | Reserva imutável criada junto com pedido/contador; primeiro número1 somente em loja vazia |
| `lojas/{L}/pedidos/{id}/historicoAdministrativo/{evento}` | `id,tipo,anterior,novo,uid,origem,revisao,criadoEm` | Admin da loja cria com a transição correspondente; histórico sem edição/exclusão |

Item confirmado do pedido: `produtoId,nome,precoUnitario,quantidade,subtotal`. Pagamento inicial: `{forma,status:'pendente',valor:total}`. Atualização manual acrescenta `atualizadoEm,registroManual:{uid,origem,criadoEm}` no pagamento, mais `revisaoAdministrativa,ultimaAlteracaoAdministrativa` no pedido. Origem do registro: `manual_estabelecimento`; isso não confirma liquidação bancária.

Não criar coleções `financeiro`, `configuracoes` ou `pedidos_legado` para imitar o histórico: o contrato atual usa configuração no documento da loja e financeiro dentro do pedido. Documentos históricos eventualmente existentes continuam preservados e são motivo para recusar seed. Outros caminhos estão negados por padrão nas Rules.

## Manifesto e validações

Exemplos sintéticos: [Aurora](../quality/fixtures/provisionamento/aurora.json) e [Boreal](../quality/fixtures/provisionamento/boreal.json). A primeira usa retirada; a segunda também permite entrega com taxa7,50. São dados fabricados, não exportações da Demo. Os UIDs nos exemplos são ilustrativos: antes de execução conectada devem corresponder a identidades sintéticas já existentes no Auth Emulator. O runner automatizado cria essas identidades e ajusta somente cópias em memória dos manifestos; não cria contas reais nem troca os exemplos por dados privados.

Formato: `versao:1, ambiente:'emulator', projetoId:'demo-...', lojaId, matrizVersao, administrador:{uid,confirmado:true}, loja:{...}`. Campos desconhecidos, listas de clientes/pedidos, `loja-demo`, projeto real, e-mail como autoridade, configurações inválidas e dados operacionais ausentes são recusados. UID deve ser explícito/confirmado; conta deve existir no Auth Emulator, estar ativa, ter e-mail verificado e provedor `google.com` ou `password`. Nenhuma promoção por correspondência de e-mail, importação de admins da Demo ou criação automática de conta. O processo não carrega `.env`, ADC, chaveAdmin ou credenciais de nuvem.

O `usuarios/{uid}` atual só possui um `lojaId`: num projeto compartilhado, o mesmo UID administrativo não pode ser automaticamente reatribuído a outra loja. O seed recusa qualquer vínculo existente divergente. Antes de um cliente real, escolher projeto dedicado ou estratégia compartilhada com autorização explícita; esta etapa testa isolamento de duas lojas num projeto sintético compartilhado, sem decidir a política comercial de produção.

Clientes sem documento de autoridade global podem ser titulares dos próprios perfis em mais de uma loja, conforme Rules existentes; cada perfil/endereço permanece em seu caminho loja/UID. Isso não permite ler perfis de terceiros nem concede privilégios administrativos. Auth pertence ao projeto, não ao documento da loja; não afirmar separação de contas por loja sem escolher projetos separados.

## Continuidade na Etapa3

Serviços corrigidos na Etapa3 conservam este schema e o provisionador; a regressão de106checks tem recibo separado em `ADAPTACAO_SERVERLESS/ETAPA3_PROVISIONAMENTO_REGRESSAO.json`, sem sobrescrever a prova original da Etapa2. `node quality/firebase/executar-provisionamento.cjs --servicos` valida os serviços; `--regressao-provisionamento` repete este seed com recibo separado. Para a aplicação da loja, domínio não local/homologação/produção exigem mapa explícito de hosts; não há fallback para `loja-demo`. [Relatório](RELATORIO_ETAPA_3_SERVICOS_JS.md). Nenhuma operação real autorizada por esses comandos.

## Comandos reproduzíveis

Executar a partir da raiz. O planejamento offline não acessa rede nem grava Firestore/Auth:

```bash
node --require ./quality/register.cjs quality/frontend/scripts/provisionar-loja.mjs planejar quality/fixtures/provisionamento/aurora.json
npm --prefix frontend run firebase:emulator:provisionamento
```

O segundo comando inicia Auth9198/Firestore8188 exclusivos com projeto `demo-replicacao`, carrega **somente no Emulator** as Rules locais e executa provisionamento, duas lojas, fluxos SDK, isolamento e recuperação. Recusa portas já ocupadas, encerra os processos que criou e descarta o estado em memória ao encerrar. Não destrói um Emulator pré-existente e não usa backup/estado real. Evidência sanitizada em [recibo integrado](ADAPTACAO_SERVERLESS/REPLICACAO_ETAPA2_EMULATOR.json).

Para uma sessão de Emulator já preparada pelo executor técnico, com uma identidade sintética explícita e verificada, executar o mesmo mecanismo por CLI (o exemplo exige um manifesto local ajustado com o UID correto):

```bash
CATALOGOS_EMULATOR_EXCLUSIVO=1 node --require ./quality/register.cjs quality/frontend/scripts/provisionar-loja.mjs dry-run caminho/manifesto-local.json --firestore 127.0.0.1:8188 --auth 127.0.0.1:9198
CATALOGOS_EMULATOR_EXCLUSIVO=1 node --require ./quality/register.cjs quality/frontend/scripts/provisionar-loja.mjs aplicar caminho/manifesto-local.json --firestore 127.0.0.1:8188 --auth 127.0.0.1:9198
```

Aliases equivalentes em `frontend/package.json`: `loja:planejar`, `loja:dry-run`, `loja:aplicar:emulator`. Projeto sempre vem do manifesto validado; hosts devem ser `127.0.0.1:porta`, sem redirecionamentos. Não há modo de produção. Manter manifesto comercial real e recibos com UID fora do Git, em armazenamento privado; os exemplos versionados são exclusivamente sintéticos. Senhas/tokens não fazem parte da ficha e nunca devem ser enviados no chat.

## Pré-condições, recuperação e integridade

O dry-run conectado consulta a identidade por UID e inventaria recursivamente as três raízes afetadas, incluindo documentos ausentes com subcoleções órfãs. Mostra os cinco documentos planejados, hash determinístico, estado atual e ação prevista. Consulta Auth e `listCollectionIds` usam POST de leitura; não são gravações. Nenhum commit acontece no dry-run.

Aplicação usa um único commit atômico de cinco criações com `exists:false`. O acesso privilegiado `Bearer owner` é uma convenção do **Emulator**, restrita no código a projeto demo-/loopback/flag exclusiva; não é credencial nem rotina disponível ao React. Não alterar Rules para permitir que um cliente se nomeie administrador ou reinicie contador. Fluxos comerciais após bootstrap usam os serviços Web SDK existentes e suas Rules normais.

Se os cinco documentos são exatamente iguais e não há descendentes adicionais, reaplicar retorna `gravados:0`. Qualquer dado divergente, catálogo preenchido, tentativa, pedido, contador alterado ou vínculo de outro admin bloqueia a operação inteira. Não é sincronizador de configuração de lojas em uso.

Falha antes de commit não cria documentos. Precondição recusada preserva concorrência e não cria as outras partes. Resposta perdida gera resultado incerto: repetir **o mesmo dry-run**; se o estado está intacto, a confirmação é recuperada e reaplicar é noop. Nunca apagar a loja, mudar UID ou reiniciar contador para contornar erro. Manifesto+versão+hash permitem reproduzir o estado inicial num Emulator novo; restauração de uma loja já usada com dados comerciais exige inventário/backup/exportação/restauração próprios e autorização, fora deste seed.

## Índices e gates preservados

`firebase/firestore.indexes.json` contém oito índices de escopo COLLECTION, sem fieldOverrides: pedidos `(status↑,criadoEm↑)` e `(status↑,criadoEm↓)`; pedidos `(pagamento.status↑,criadoEm↑,status↑)`; pedidos `(criadoEm↑,total↑)`; pedidos `(pagamento.status↑,criadoEm↑,status↑,total↑)`; produtos `(categoriaId↑,ativo↑)`, `(ativo↑,disponivel↑)` e `(ativo↑,categoriaId↑,preco↑)`. Correspondem a listagem, agregações e filtros atuais. Arquivos de migração anteriores são referências, não autorização de aplicar outro conjunto.

Nenhuma alteração/publicação de Rules ou índices nesta etapa. O Emulator valida Rules e transações, mas não substitui a verificação dos índices compostos publicados. Hashes dos arquivos atuais ficam no recibo; a Etapa4 deverá conferir projeto/Rules/índices realmente publicados sob autorização específica. B-03/desativação e B-04/horários por etapas permanecem como registrados; os sete dias do seed são criados atomicamente por bootstrap e não significam que o painel ganhou gravação semanal atômica.

Antes de implantar cliente real: versão/release da matriz, decisão Firebase/contas/custos, materiais/conteúdo próprios, UID verificado, domínio/OAuth, backup/reversão e autorizações por ato/alvo. Publicação da Etapa1 continua pendente e separada. Etapa3 não começa automaticamente.


## Homologação final da matriz — Etapa4

168checks SDK/segurança/consultas/recuperação +32checks Chrome de duas lojas, 110checks de provisionamento/backup inicial e91checks B-04;379testes React em35arquivos; build19,48s e scanner aprovados. Evidências próprias em `ADAPTACAO_SERVERLESS/ETAPA4_HOMOLOGACAO_EMULATOR.json`, `ETAPA4_PROVISIONAMENTO_EMULATOR.json`, `ETAPA4_B04_EMULATOR.json` e `ETAPA4_RULES_LEITURA.json`. Nenhuma alteração de schema/Rules/índices/comércio da Demo.

Reproduzir pela raiz: `npm --prefix frontend run firebase:emulator:homologacao`; `node quality/firebase/executar-provisionamento.cjs --seed-etapa4`; `node quality/firebase/executar-provisionamento.cjs --b04-etapa4`. Homologação/seed usam8188/9198 e demo-replicacao, em sessões novas; B04 usa8189/9199 e demo-catalogos-horarios-b04. Portas ocupadas são recusadas; helpers encerram somente processos próprios.

[Manifesto de consultas/índices](../quality/fixtures/provisionamento/indices-consultas.json) confere hash/definições do arquivo atual, sem criar índices reais. Backup/restauração tipados sintéticos e limites estão no [relatório4](RELATORIO_ETAPA_4_HOMOLOGACAO.md). [Guia completo de implantação](GUIA_IMPLANTACAO_NOVA_LOJA.md) define o próximo procedimento: projeto/contas/domínio/UID, operação real de bootstrap revisada, autorização específica de Rules/índices/Auth/publicação e homologação comercial real. Não habilitar modo produção no seed nem atribuir administrador por e-mail.
