> Continuidade após Etapa4: quatro etapas técnicas locais concluídas. Seguir o [guia de implantação por cliente](GUIA_IMPLANTACAO_NOVA_LOJA.md), mantendo guards Emulator-only, identidade e conteúdo próprios, permissões por UID e atos reais separados. [Provas e limites](RELATORIO_ETAPA_4_HOMOLOGACAO.md).

# Configuração dos serviços por loja — Etapa3 local,28/10/2026

O full runtime não assume mais `loja-demo`. Em localhost, definir `VITE_LOJA_ID` explicitamente ou mapa; homologação/produção e outros domínios exigem `VITE_LOJAS_POR_HOST` com os hosts exatos autorizados. A configuração explícita da Demo é preservada; não copiar sua identidade, projeto/contas ou conteúdo para cliente. Mesmo código, preços/configurações e vínculos próprios da loja. ID inválido/host desconhecido são recusados antes dos fluxos. Detalhes e testes no [relatório da Etapa3](RELATORIO_ETAPA_3_SERVICOS_JS.md); próxima fase somente pelo [plano mestre](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md). Sem publicação nesta ordem.

---

# Cadastro inicial comercial — Etapa2 local,28/10/2026

Manifesto, esquema real de coleções/campos, dry-run sem escrita e bootstrap exclusivo do Emulator em [Provisionamento de lojas](PROVISIONAMENTO_LOJAS.md); autorização/estado no [plano mestre](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md). Usar os exemplos sintéticos próprios, não exportar dados da Demo. Nome/marca visuais da Etapa1 e configuração comercial do banco têm contratos separados. Nenhuma fonte frontend da Etapa1 foi substituída nesta etapa; nenhuma publicação/provisão real executada. Etapa3 aguarda ordem específica.

---

# Personalização comercial por configuração — 28/10/2026

Roteiro vigente no [plano mestre](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md). Usar o mesmo release React para todas as instâncias. Nunca copiar `.env`, contas, credenciais, clientes, pedidos ou catálogo comercial da Demo para um cliente.

| Material / campo | Fonte e uso | Conferência |
| --- | --- | --- |
| Identificador da loja | `VITE_LOJA_ID` ou `VITE_LOJAS_POR_HOST`, já existentes | Host desconhecido rejeitado quando há mapa; conferir projeto Firebase público separado |
| Nome e descrição | Dados da própria loja; opcional `VITE_IDENTIDADES_LOJAS[lojaId]` | Cabeçalho/Home/admin, título e descrição |
| Logo e favicon | `logo`, `favicon`: HTTPS ou caminho local | Marca legível e fallback; arquivo na release da instância |
| Capa e foto institucional | `imagem`, `imagemSobre` | Propriedade/autorização das fotos, mobile e ausência de imagem |
| Cor principal | `corPrimaria`: `#RRGGBB` | Tokens derivados e texto automático preto/branco; sem CSS livre |
| Textos da abertura e chamada final | `tituloInicio`, `chamadaFinal` | Textos próprios do negócio sem alterar componentes |
| WhatsApp, telefone, Instagram, endereço e horários | Catálogo da própria loja, contratos atuais | Número/endereço reais fornecidos pelo cliente; Etapa2 prepara cadastro |
| Produtos, categorias, fotos, preços e operação | Conteúdo novo do estabelecimento | Não copiar clientes/pedidos/contadores/UIDs da Demo |
| Fonte tipográfica e cores semânticas | Base compartilhada | Sucesso/erro/WhatsApp preservam sentido; sem carregar fontes arbitrárias |

Exemplo público (uma linha no ambiente do build, sem segredos):

```dotenv
VITE_IDENTIDADES_LOJAS={"loja-a":{"nome":"Cozinha Aurora","descricao":"Receitas da casa","corPrimaria":"#125b45","logo":"/aurora.svg","imagem":"/capa.jpg","imagemSobre":"/sobre.jpg","favicon":"/icone.svg","tituloInicio":"Sabores da casa","chamadaFinal":"Escolha seu favorito"}}
```

Campos visuais não alteram preços, entrega, permissões ou Firebase. Modificar ambiente exige novo build da instância; dados atuais do catálogo continuam provenientes de sua loja. O painel preserva os campos comerciais atuais; não foi criado editor Firestore para campos visuais adicionais. Não marcar uma identidade incorreta com o ID de outra loja.

Checklist visual: conferir Home, Cardápio, Produto, Carrinho/Checkout, Login/Cadastro, conta/endereços/pedidos e acesso/painel admin; nome/logo/cores/fotos/metadados; ausência de imagem e telas vazias;320/390/768/1366px; foco/teclado/menu; textos longos; contraste; sem conteúdo da loja anterior. Prévia OpenGraph sem execução de JS exige metadados estáticos da instância na preparação da publicação. Conferir autorização separada para domínio/OAuth/Firebase/Pages. Não publicar nesta etapa.

---

# Decisão vigente010 — 24/10/2026

Catálogo JS é oficial/prioritário, vitrine e matriz reutilizável por duplicação de release e personalização, com isolamento por loja e sem cópia de credenciais/dados privados. Sistema antigo descontinuado operacionalmente; compatibilidade com backend/Rules/infraestrutura legados dispensada. Fontes/documentação arquivadas e dados úteis/contas/histórico protegidos. Norma em [AGENTS](../AGENTS.md); preparação e pendências no [plano único](ADAPTACAO_SERVERLESS/PLANO_EXECUCAO.md) e [relatório010](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_010.md).

Firebase bancorestaurante, React/Vite/ES6 + Web SDK/Auth/Firestore/Rules; sem Render, Express hospedado ou Functions.010 continua localmente, sem homologação real. Alteração Firebase, exclusão real, publicação/deploy e descontinuação remota somente011 especificamente autorizada.011 não iniciada. Inventário/backup e transformação verificável antes de operações destrutivas; nenhum gate fechado por esta decisão.

---

> Histórico anterior preservado; a entrada010 acima prevalece.

# Referência vigente — Ordem009 —24/10/2026

Integração final local e limites no [relatório009](ADAPTACAO_SERVERLESS/RELATORIO_ORDEM_009.md). Procedimento atual para homologação/publicação futura: [checklist009](ADAPTACAO_SERVERLESS/CHECKLIST_HOMOLOGACAO.md); personalização na base compartilhada: [guia de clientes](ADAPTACAO_SERVERLESS/GUIA_REPLICACAO_CLIENTES.md). Estes complementam os manuais existentes; instruções de Express/Render/Functions abaixo são históricas na cópiaJS. Não copiar backend/credenciais por cliente nem criar outro Firebase/serviço para o Demo.

Runtime full usa Web SDK sem VITE_API_URL; exemplos públicos corrigidos. Testes permanentes: quality/frontend/scripts/integracao-final.cjs (npm firebase:emulator:integracao-final), build-final.mjs e suites003–008; todos ficam fora de artefatos de produção. Inventário009 é gerado separadamente, preservando inventário008. Nenhum histórico0–26/001–008 reescrito.

Contrato dos nove MVPs mantido, sem extras; JS-08 conserva restriçãoB-03, JS-09 tem preparação local e aguarda gates remotos/aceite. B-04 salva por dia/grupos, sem atomicidade semanal. Estado dos riscos no registro oficial. Próxima ordem recomendada010, aguardando autorização; pós-MVP/011/publicação não iniciados. Sem operação remota/cliente real/commit/push/deploy. Posição exata no plano único e Continuidade.

---

> Histórico anterior preservado; a entrada009 acima prevalece.

# Continuação008/B-04 —24/10/2026

Na base reutilizável, configurar horários e identidade por loja no banco. Salvamento de vários dias é em etapas, com consistência por transação e informação explícita de falha parcial; conferir estado antes de retomar. Não copiar credenciais/sistema nem prometer atomicidade da semana. Base comercial e gates de homologação por cliente preservados.

Evidências e limites: [recibo008/B-04](ADAPTACAO_SERVERLESS/ORDEM_008_B04_EVIDENCIAS.json), [continuidade](ADAPTACAO_SERVERLESS/CONTINUIDADE_CODEX.md) e [riscos oficiais](RESSALVAS_E_PENDENCIAS_PRODUCAO.md). Sem009 ou atos remotos.

---

> Histórico anterior preservado; a entrada acima prevalece.

# Matriz comercial e personalização atual — Ordem008,23/10/2026

Reutilizar a base React/serviços compartilhados; parametrizar lojaId/ambiente público, identidade/cores/imagens, produtos/categorias e informações comerciais. Cada loja tem seus dados e seu administrador individual autorizado. Não copiar credenciais, dados privados ou servidor/projeto por restaurante. Se houver cópia de entrega do código-base, preservar esse isolamento e não criar fork funcional a cada cliente. Configurações existentes: nome/descrição, telefone/WhatsApp, instagram, endereço/horários, logo/imagem/cor/tempo, pagamentos, entrega/retirada/taxa/pedido mínimo. adminGestao usa salvarComProjecao; nunca escrever projeção avulsa nem quebrar revisão comercial. B-03 continua bloqueado. Testar cliente/admin da própria e de outra loja, checkout até50, totais históricos/WhatsApp, Rules e build antes de publicação autorizada. Novos dados reais/admins/publicação não são autorizados pela personalização documental.

Consulta vigente: [Índice Geral](INDICE_GERAL_DOCUMENTACAO.md), [Continuidade Codex](ADAPTACAO_SERVERLESS/CONTINUIDADE_CODEX.md), [Guia Mestre](GUIA_MESTRE.md), [Matriz](ADAPTACAO_SERVERLESS/MATRIZ_MIGRACAO.md). Estado008 e evidências no diário; seção abaixo preservada como referência histórica, sem autorizar operações externas.


Limite vigente008 (retomada24/10/2026): salvar sete dias abertos juntos permanece bloqueado por1000expressões, sem gravação parcial. EstadoB-04 e decisão pendente exclusivamente no [registro oficial](RESSALVAS_E_PENDENCIAS_PRODUCAO.md);008 parcial e009 não iniciada.

---

> Histórico anterior preservado. A entrada vigente acima prevalece para a cópiaJS.

> Adaptação JS /005,23/10/2026: compras locais aprovadas até50 produtos com fonte original canônica e controleCompra/versao por loja. Reusar a mesma base e configurar loja, sem duplicar servidores/credenciais. Não habilitar compra real sem Rules/gravadores comerciais correspondentes, dados coerentes e autorização do alvo. Toda alteração comercial SDK deve usar salvarComProjecao(transação de origem/projeção/revisão); Console/Admin SDK requerem procedimento confiável equivalente. Estado e limites na matriz/registro oficial. Esta nota não autoriza painel, nova loja real, publicação ou personalização futura.

---

> Posições anteriores abaixo são histórico; não substituem o resultado de23/10/2026.

> Decisão reutilizável19/10/2026: orçamento60min técnicos por MVP conforme [norma única](../AGENTS.md#execução-rápida--60-minutos-técnicos-por-mvp). Implantar cliente em aproximadamente uma hora é meta distinta, dependente da complexidade e automação. Reutilizar frontend/backend/Auth/admin/infra, configurar dados/identidade da loja; sem Render/backend por cliente, cópia de dados privados ou admin criado sem autorização. Não dispensa homologação, isolamento, recuperação ou autorizações.

> Atualização normativa MVP-00 — 16/10/2026: escopo comercial obrigatório em [MVP comercial](MVP_COMERCIAL.md); ordem vigente exclusiva em [Plano de execução MVP](PLANO_EXECUCAO_MVP.md); posição e autorização em [Guia Mestre](GUIA_MESTRE.md). Login cliente e admin são obrigatórios. Preparação/publicação de vitrine não equivale a liberação do MVP. Roteiros anteriores mantêm valor de evidência/referência técnica, sem autorizar execução. Pós-MVP somente após gate e autorização no [plano pós-MVP](PLANO_POS_MVP_RESSALVAS.md).

# Personalização e entrega de catálogos — vigente em 15/10/2026

Fonte principal da linha de produção. O [Demo](DEFINICAO_OFICIAL_CATALOGO_DEMO.md) é o primeiro cliente fictício, vitrine e base reutilizável. Preferir código compartilhado e configuração/dados isolados por loja. Contratos, contatos privados, credenciais, consentimentos e material sensível ficam em armazenamento controlado fora do Git.

A tabela define o procedimento assistido; não implica que onboarding automático, infraestrutura comercial ou publicação estejam prontos. Aceite local não substitui a ordem para alterar ambientes externos. Não copiar todo o projeto para cada restaurante por padrão.

| Etapa | Entradas | Operações e arquivos/áreas | Aceite | Autorização necessária |
| --- | --- | --- | --- | --- |
| 1. Contratação/escopo | Responsável, segmento, funções, prazo, orçamento, suporte | Preencher contrato privado; consultar DECISOES_PENDENTES e plano de homologação | Escopo, exclusões, preço/prazo e responsáveis assinados | Proprietário e cliente; exemplos de preço não são proposta aprovada |
| 2. Coleta | Nome, logo, cores, descrição, contatos, endereço, horários e direitos das imagens | Ficha privada validada; campos de lojas descritos no MODELO_FIRESTORE | Material completo, consentimentos e direitos confirmados | Cliente aprova dados publicáveis |
| 3. Design | Briefing e identidade aprovados | Ajustar configuração visual por loja; frontend/src/components, styles.css somente se recurso compartilhado exigir | Desktop/mobile, contraste, navegação e identidade aceitos sem regressão no Demo | Cliente aprova design; dono aprova extensão de escopo |
| 4. Configuração da loja | ID único válido, ambiente e hostname | Planejar lojas/{lojaId}, VITE_LOJA_ID ou VITE_LOJAS_POR_HOST e infra/ambientes; ensaiar em Emulator | Host desconhecido falha; ID sem slash/controles até 128 caracteres; outra loja intacta | Operador autorizado para criar dados/associar domínios; nada remoto implícito |
| 5. Produtos/categorias/imagens | Planilha de preços, descrições, disponibilidade e URLs licenciadas | Categorias antes de produtos; modelo Firestore e admin de produtos/categorias | Preços finitos com duas casas, vínculos íntegros, imagens HTTPS aprovadas | Cliente valida catálogo; escrita externa sob ordem própria |
| 6. Regras comerciais | Mínimo, horários, disponibilidade e políticas | Configurações da loja e services de validação/cálculo; manter regras gerais compartilhadas | Servidor recalcula totais; alterações não afetam outras lojas | Cliente aprova regras; recurso novo exige escopo/testes |
| 7. Entrega/retirada/pagamento | Taxa única, habilitação, Pix/dinheiro/crédito/débito e WhatsApp | Configuração por loja; backend/src/services/pedidoEntregaService.js e pagamentoService.js; páginas Checkout | Taxa/mínimo/retirada corretos; pagamento informativo/manual; link não comprova envio/recebimento | Cliente aprova dados; integração financeira/gateway exige contratação própria |
| 8. Usuários/admins | Operadores individuais e vínculos aprovados | Auth e usuarios/{uid}, role admin/lojaId/ativo por operador; cliente não pode se promover | Anônimo/cliente/outra loja negados; login/recuperação/logout homologados | Criação/alteração Auth e privilégios somente por ordem específica |
| 9. Firestore/permissões | Modelo, ambiente, dados e plano de recuperação | firebase/firestore.rules, índices, IAM mínimo; ensaio duas lojas e backup/restore | Consultas prontas e acesso cruzado negado; Admin SDK protegido pela API/IAM | Publicar Rules/índices/IAM e migrar dados exige revisão/autorização |
| 10. Integração | API HTTPS, hostname, configuração pública e modo | frontend/src/services/api.js, context, infra/render e mapa por host; secrets só servidor | API/loja corretos, CORS exato, nenhum segredo no bundle, erros seguros | Configuração hospedada/DNS/secret não autorizada apenas por ensaio local |
| 11. Segurança/funcionalidade | Base configurada e testes permanentes | quality/backend, quality/frontend, quality/infra; comandos no manual de desenvolvimento | Conta, carrinho, pedido idempotente, admin, isolamento A/B, HTTP, build e scanner; sem validações relaxadas | Ensaio local fictício; gravações externas apenas em plano aprovado |
| 12. Homologação | Versão/digest, checklist e materiais finais | PLANO_DE_HOMOLOGACAO_COMERCIAL e roteiro manual histórico como apoio | Cliente valida preços/textos/imagens/taxa e fluxo; dispositivos reais, segurança e ressalvas avaliadas | Aceite do cliente/proprietário registrado; NO-GO enquanto gates obrigatórios falharem |
| 13. Implantação | Aceites, versão revisada, rollback e orçamento aprovados | MANUAL_IMPLANTACAO; publicar só dist/artefato backend runtime, sem quality ou env privado | Preview e URL final verificadas em navegador, versão registrada, rollback disponível | Ordem explícita de publicação, push e mudanças externas aplicáveis |
| 14. Entrega/treinamento/manutenção | URL validada, operadores, documentação e suporte | MANUAL_ADMINISTRADOR, MANUAL_MANUTENCAO, Guia Mestre/Registro; Regra 14 | Treinamento/aceite, responsáveis, atualizações e recuperação definidos; limpeza e regressão final | Cliente aceita entrega; manutenção segue contrato e autorização por ação |

## A — EXECUÇÃO PELO CODEX — linha de produção com Regra15

Aplicar a [Regra15](../AGENTS.md#regra-oficial-15--divisão-de-execução-entre-codex-e-proprietário) a cada uma das 14 fases da tabela anterior e a toda manutenção. Receber apenas dados comerciais autorizados; preparar configuração/identidade por loja, produtos/categorias/visuais, integração, validações/negativas, build, instrução manual, documentação e limpeza. Escrita remota não é implicada por “cadastrar produtos”: preparar dados/usar Emulator; gravar no ambiente real somente em operação expressamente autorizada. Componentes/contratos/testes continuam compartilhados, sem copiar projetos ou segredos por restaurante.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO — linha de produção com Regra15

Negociar/contratar, coletar/aprovar conteúdo/direitos/consentimentos e identidade do cliente, aceitar planos/custos e escopo, realizar login/2FA/termos/operação protegida, preencher segredos diretamente, participar da homologação e autorizar/acompanhar entrega. Comando local técnico seguro permanece com Codex; dado privado do restaurante não deve entrar em artefato/Git/chat público.

| Fase existente / IDs por cliente | Codex: preparação, teste e evidência automatizada | Proprietário: ação e evidência manual | Dependência e aceite integrado |
| --- | --- | --- | --- |
| 1 — CLI-{loja}-01-C/H | Conferir escopo técnico/reuso/exclusões, preparar checklist sem contrato privado no Git | Negociar, confirmar identidade/consentimento, orçamento e assinar; informar escopo aprovado | Aceite de escopo antes de implementar; decisão comercial não é delegada ao agente |
| 2 — CLI-{loja}-02-C/H | Validar formatos e separar público/privado; preparar configuração/modelo | Aprovar dados/contatos/imagens e direitos; informar só o necessário | Dados aprovados antes de publicação; DTO confere conteúdo autorizado |
| 3 — CLI-{loja}-03-C/H | Configurar identidade/cores/visuais por loja, teste de responsividade/contraste | Conferir design no desktop/celular e aceitar versão | Preparação C → aceite H → correção/teste C só do afetado; Demo/outras lojas intactos |
| 4 — CLI-{loja}-04-C/H | Preparar lojaId/host/config e testar host desconhecido/lojaB no Emulator | Autorizar criar loja/domínio e executar painel protegido se necessário | Operação externa específica e depois teste de host/isolamento C |
| 5 — CLI-{loja}-05-C/H | Preparar categorias antes de produtos, preços/flags/imagens, validar schema/vínculos | Aprovar oferta/dados; escrita de catálogo real só autorizada | C compara catálogo final aprovado; não copiar seed/testes como dados reais |
| 6 — CLI-{loja}-06-C/H | Configurar regras aprovadas e testar cálculos/validações compartilhadas | Aprovar mínimo/horários/políticas/regras comerciais | Aceite H de valores e prova C de servidor/lojas sem regressão |
| 7 — CLI-{loja}-07-C/H | Preparar entrega/retirada/formas e WhatsApp, testar totais/URL | Aprovar taxa/contato/formas, conferir compra controlada; não enviar a terceiros | Pedido/cálculo/URL integrados; nenhuma liquidação alegada |
| 8 — CLI-{loja}-08-C/H | Preparar vínculo/role, testes cliente/admin/lojaB e recuperação/logout | Aprovar operador individual, configurar Auth/role diretamente com autorização; login sem compartilhar senha | C comprova negativas após H; nenhuma conta compartilhada/superadmin |
| 9 — CLI-{loja}-09-C/H | Preparar Rules/índices/IAM mínimo/backup e testar A/B | Publicar cada ato protegido após aprovação separada e preencher segredo direto | C confere release/queries/permissões efetivas; Emulator não comprova remoto |
| 10 — CLI-{loja}-10-C/H | Preparar HTTP/env/host/CORS e testar UI/serviços sem segredo | Configurar campos aprovados/DNS/secret em painel protegido, informar resultado seguro | C verifica domínio/origem/erro/isolamento no ambiente exato |
| 11 — CLI-{loja}-11-C/H | Executar somente regressão pertinente/segurança/build/scanner, preservar testes quality | Garantir acesso humano/ensaio autorizado e confirmar falhas visuais quando pedido | Prova técnica essencial permanece com C; não repetir auditoria geral sem motivo |
| 12 — CLI-{loja}-12-C/H | Preparar checklist/versão, validar técnico/integrado e corrigir falhas comprovadas | Cliente/proprietário homologam dados/desktop/mobile/jornadas e registram aceite | NO-GO com qualquer bloqueador do escopo; confirmação visual não substitui autorização |
| 13 — CLI-{loja}-13-C/H | Preparar artefato/config/rollback e smoke pós-ação | Autorizar/publicar pelos meios protegidos e confirmar estado/URL; push/deploy separados | Prévia aceita antes da produção; C confere versão/URL final/rollback |
| 14 — CLI-{loja}-14-C/H | Preparar manual/treinamento/registro/rotina de manutenção e limpar descartáveis | Cliente aceita entrega/suporte e aprova intervenções futuras/custos | C testa mudança afetada; H aceita impacto; aplicar Regra14/15 em cada manutenção |

Antes de iniciar cada fase para uma loja, preencher **no registro da própria entrega** os campos obrigatórios da Regra15: C com ID/objetivo/arquivos/comandos/pré-requisitos/resultado/testes/dependências/horas/estado; H com ID/plataforma/objetivo/momento/pré-requisitos/caminho atual/campos/valores públicos/preenchimento sensível/resultado/confirmação/evidência segura/erros/reversão/minutos/dependências/impacto/autorização. lojaId, domínio, preços, contato, versão, custos e responsável vêm de aprovação real; não inferir a partir do Demo. IDs {loja} são parâmetros, não arquivos ou lojas existentes.

Estimativa assistida inicial por cliente: Codex 8–24 h de configuração/integração/teste/reuso, proprietário 30–90 min de painéis/dados aprovados, homologação humana 30–90 min; contratação/coleta/esperas fora dessas faixas. Não é compromisso, nem autorização para cobrar ou configurar provedor. Se exigir função nova/migração/infra dedicada, estimar no escopo da entrega antes de agir. Reutilizar testes da versão-base dentro da validade e testar diferenças/isolamento em cada cliente. Preparação técnica de dados/design e coleta/aprovação humana podem ocorrer em paralelo, dentro do escopo aprovado; publicação espera os aceites/gates.

## Limites de reutilização e de oferta

Nome, marca, cores, logo/banner, categorias/produtos, preços, descrições, imagens, contatos, horários, pagamento, entrega/retirada e vínculos são configuráveis por loja. Componentes, contratos, autorização, cálculos e regressões ficam compartilhados. Exigência de instância dedicada deve ter justificativa, versão aprovada e plano de manutenção; jamais copiar segredos, IDs/UIDs privados ou pedidos do Demo.

Não prometer gateway, variantes/adicionais, cupons, fidelidade, estoque quantitativo, upload, raio/taxa regional, superadmin ou onboarding automático como funções prontas. URL de imagem não é upload gerenciado. Horários configurados não são calendário automático de delivery. Disponibilidade não mede estoque. Preços históricos não são contrato e suporte não é ilimitado.

Atender [ressalvas e prioridades](RESSALVAS_E_PENDENCIAS_PRODUCAO.md) e a [Regra 14](../AGENTS.md#regra-oficial-14) em cada etapa. Registros do cliente devem identificar versão, entradas aprovadas, testes/aceites, autorizações e evidências sem expor dados pessoais. O Demo e as demais lojas devem continuar funcionando após cada personalização.
