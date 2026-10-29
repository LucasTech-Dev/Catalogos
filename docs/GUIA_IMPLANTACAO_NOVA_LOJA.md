# Implantação de um novo estabelecimento a partir da matriz JS

Guia técnico da Etapa4 do [plano oficial](PLANO_MESTRE_REPLICACAO_CATALOGO_CLIENTES.md). Preparação local autorizada; nenhuma implantação comercial foi iniciada. O [relatório da homologação](RELATORIO_ETAPA_4_HOMOLOGACAO.md) separa provas locais dos gates reais. Procedimento a executar somente após autorização específica por ato/alvo; não é solicitação atual de intervenção.

## A — EXECUÇÃO PELO CODEX

### 1. Pré-requisitos e ficha do cliente

Fixar release da matriz, identificador único da loja, proprietário das contas, estratégia Firebase dedicado/compartilhado, responsáveis pelo atendimento e recuperação, orçamento e domínio. Reutilizar fontes/componentes por release e configuração; nunca clonar .env privado, credenciais, Auth, administradores, clientes ou pedidos da Demo. Manter checklist e manifesto privado por instalação, vinculados à release/hash.

Receber conteúdo próprio: nome/descrição, logo/capa/fotos autorizadas, cores, categorias, produtos/ingredientes/preços/disponibilidade, endereço, sete dias/horários, WhatsApp com país/DDD, Instagram, prazo, mínimo, taxa/entrega/retirada e meios de pagamento. Confirmar responsabilidade pelo registro financeiro manual: não há gateway. Segredos são preenchidos pelo proprietário diretamente na plataforma; nunca enviados no chat/Git.

### 2. Firebase e autorização administrativa

Inventariar o projeto de destino antes de qualquer escrita. Escolher explicitamente projeto dedicado ou compartilhado: Auth é por projeto e `usuarios/{uid}` possui uma loja por administrador. Não reatribuir UID já vinculado. Conferir aplicativo Web, Firestore, provedores e políticas de identidade/domínios, Rules e os oito índices do [manifesto de consultas](../quality/fixtures/provisionamento/indices-consultas.json). Nenhuma Cloud Function/Express é necessária.

Preparar backup recuperável, regras/índices anteriores, migração/reversão e ensaio em Emulator antes de alterações. Publicação de Rules, índices, configuração Auth, criação de identidade e gravação de dados são atos distintos, com autorização específica. A leitura da Demo na Etapa4 não autoriza mudanças nela. B-03 exige candidata local validada e verificada no alvo antes de habilitar `VITE_CATEGORIAS_DESATIVACAO`; exclusão física continua bloqueada.

O administrador inicial deve ter UID confirmado, conta ativa/verificada, provedor apropriado e vínculo explícito `{role:'admin',ativo:true,lojaId}`. Nunca atribuir papel por correspondência de e-mail. Reutilizar o procedimento operacional de administrador existente apenas após revisar seu alvo/escopo; o provisionador desta replicação possui deliberadamente **somente modo Emulator**.

### 3. Ensaio e provisionamento

Seguir [PROVISIONAMENTO_LOJAS](PROVISIONAMENTO_LOJAS.md) para manifesto versionado/hash e cinco documentos atômicos. Exemplos Aurora/Boreal são exclusivamente sintéticos. Identidade Auth sintética deve existir antes do seed. Planejar offline, executar dry-run conectado e aplicar apenas num destino realmente vazio. Catálogo inicia sem produtos/categorias/pedidos/clientes; contador0 gera primeiro pedido#1. Recusar descendentes órfãos, documentos vazios existentes, troca de admin e loja em uso.

```bash
npm --prefix frontend run firebase:emulator:homologacao
node quality/firebase/executar-provisionamento.cjs --seed-etapa4
node quality/firebase/executar-provisionamento.cjs --b04-etapa4
```

Os comandos fixam projetos demo-/loopback e encerram seus próprios Emulators. Não aceitam projeto real. Para primeiro cliente real ainda falta preparar/revisar uma operação de bootstrap específica do alvo, com backup e precondições; não remover os bloqueios do seed local nem usar Bearer owner em produção. O contrato de cinco documentos já está testado. Não fingir que o procedimento comercial real foi executado.

Resposta perdida: reapresentar o mesmo manifesto/dry-run e comparar estado/hash; estado intacto significa noop. Falha ou destino divergente exige diagnóstico, nunca excluir a loja/reiniciar contador. Não inserir pedidos fictícios no banco do cliente para ajustar numeração.

### 4. Identidade, catálogo e administração

Configurar `VITE_IDENTIDADES_LOJAS` com somente campos públicos visuais, materiais próprios em frontend/public ou URLs HTTPS confiáveis. Configuração comercial vem do documento da própria loja. Seguir [manual de personalização](MANUAL_PERSONALIZACAO_CLIENTE.md); metadados dinâmicos no navegador não garantem prévia social sem JS. Preparar metadados estáticos por instância quando necessário à entrega.

Cadastrar categorias/produtos pelo painel autorizado, conferindo projeções públicas e revisão comercial após persistência. Validar produtos ativos, disponibilidade, categorias desativadas e reativadas, ingredientes/imagens, preço, meios de pagamento, entrega/retirada, mínimo e WhatsApp. Horários são gravados por dia e grupos: falha parcial mostra o confirmado e preserva formulário; recarregar/conferir estado antes de retomar. Não anunciar atomicidade semanal.

### 5. Cloudflare Pages — checklist de publicação futura

Arquitetura solicitada preservada: Pages com React/Vite e Firebase Web SDK. Não criar Worker/Function/backend ou serviço por restaurante. Skill consultada: [cloudflare](</home/lucas/.codex/skills/cloudflare/SKILL.md>); escolha explícita do proprietário por Pages prevalece sobre recomendações genéricas de novos produtos.

| Campo | Valor/procedimento preparado |
| --- | --- |
| Projeto | Nome exclusivo do cliente, a confirmar; não reutilizar automaticamente `catalogo-demo` |
| Origem | Release revisada do repositório matriz ou cópia de release sem dados privados; registrar SHA e branch autorizada |
| Integração Git | Workers & Pages → criar aplicação → Pages/importar repositório; conferir interface no momento da autorização. Conectar repositório pode disparar deploy: tratar como ato de publicação |
| Root | `frontend` (não os nomes históricos demo/front-end) |
| Build | `npm run build:externo`, com `VITE_APP_ENV=production`; npm instala conforme lockfile, Node24 conforme package.json |
| Saída | `dist`, relativa a frontend |
| Preview | Projeto/loja de homologação próprios; não apontar previews indiscriminados aos dados reais do cliente |
| Domínios | Associar domínio no projeto Pages antes do DNS; confirmar propriedade, TLS, canônico e aliases. Incluir host pages.dev somente se deliberadamente autorizado no mapa |
| Rotas | Conferir acesso direto/reload de /produto, /checkout, /perfil e /admin; manter assets/_headers existentes. Não copiar redirects que chamem backend legado |
| Publicação | Autorizações próprias para repositório/push, criação/projeto, domínio/DNS e deploy; não concedidas nesta Etapa4 |

Configuração pública no ambiente de build (não contém credencialAdmin):

```dotenv
VITE_APP_ENV=production
VITE_CATALOGOS_RUNTIME_MODE=full
VITE_LOJA_ID=loja-cliente
VITE_LOJAS_POR_HOST={"menu.cliente.example":"loja-cliente"}
VITE_FIREBASE_PROJECT_ID=projeto-do-cliente
VITE_FIREBASE_EXPECTED_PROJECT_ID=projeto-do-cliente
VITE_FIREBASE_AUTH_DOMAIN=projeto-do-cliente.firebaseapp.com
VITE_FIREBASE_API_KEY=preencher-config-publica-web-do-alvo
VITE_FIREBASE_APP_ID=preencher-app-web-do-alvo
VITE_CATEGORIAS_DESATIVACAO=false
VITE_IDENTIDADES_LOJAS={"loja-cliente":{"nome":"Nome próprio","corPrimaria":"#125b45","logo":"/logo.svg","imagem":"/capa.jpg"}}
```

Valores são exemplos não implantáveis; substituir pelos dados públicos aprovados e validar mapa completo. Ausência de host falha de forma fechada; não contornar com fallback da Demo. Remover variáveis Emulator/API de fixtures do ambiente externo. `bancorestaurante` não é alvo de produção comercial neste contrato. Homologação externa tem validação própria `catalogos-homolog-*` e `VITE_FIREBASE_HOMOLOG_PROJECT_ID`, não usar projeto demo- em nuvem.

Em Firebase Authentication, preparar domínios autorizados do catálogo; conferir provedor Google e domínio do aplicativo Web. `authDomain` é o domínio que atende o handler Firebase, não necessariamente o domínio Pages. Não trocá-lo para o catálogo sem preparar um handler compatível. Conferir URI OAuth `https://<authDomain>/__/auth/handler` e origens autorizadas quando necessário, diretamente no painel protegido. Google popup real, e-mail/reset e Safari/mobile são gates posteriores; token sintético local não os comprova.

Referências oficiais consultadas em29/10/2026UTC: [build Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/), [integração Git](https://developers.cloudflare.com/pages/get-started/git-integration/), [domínios Pages](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Google Auth](https://firebase.google.com/docs/auth/web/google-signin). Nomes de telas são referências e serão conferidos na execução futura.

### 6. Homologação e entrega real

Após publicação autorizada: confirmar projeto/loja/host/release, TLS e caminhos diretos; navegação pública sem Auth; Home/cardápio/fotos/categorias/preços/indisponibilidade e marca própria em celular/computador. Executar login e-mail, cadastro, Google pessoal, perfil/endereço, logout e isolamento contra outro cliente/admin com identidades de teste consentidas. Conferir Rules publicadas/hash, índices READY e consultas administrativas. O Emulator não exige índices compostos: [limites oficiais](https://firebase.google.com/docs/emulator-suite/connect_firestore#how_the_cloud_firestore_emulator_differs_from_production).

Somente com autorização de dados, executar um pedido completo, conferir número sequencial (primeiro#1 somente se banco realmente novo), total/taxa/meio de pagamento pendente, observações/WhatsApp correto, painel/status/histórico do cliente, ausência de duplicação e pagamento manual explícito. Não resetar contador nem apagar pedidos para ocultar a homologação. Conferir mensagens/recebimento e julgamento visual no aparelho do proprietário. Não liberar comercialmente com bloqueio crítico conhecido.

Entregar URLs/versão, acesso administrativo pelo próprio titular, materiais, orientação dos horários em etapas, registro financeiro manual, suporte/manutenção, backup e limites aceitos. Registrar evidência segura sem senha/token/PII e separar aceite automatizado, manual e integrado.

### 7. Backup, recuperação e manutenção

Antes de instalação real/alteração destrutiva, inventariar todos os escritores, dados e subcoleções, exportar em armazenamento privado com acesso mínimo, manifesto/hash e timestamps, conferir integridade e restaurar em ambiente isolado. Identidades Auth/UIDs, índices/Rules/configuração, materiais e dados Firestore têm mecanismos próprios: backup de documentos sozinho não recria contas, senhas ou OAuth. Definir retenção e responsável com o cliente; não guardar dados pessoais em evidência pública.

Ensaio implementado em `quality/frontend/provisionamento/backup-emulator.mjs`: exportação recursiva de uma loja e UIDs explícitos, campos REST tipados (timestamps preservados), integridade por SHA256, restauração atômica até450documentos em destino sintético vazio, precondição exists:false. Recusa loja-demo, projeto real e sobrescrita. Não migra IDs/referências, não exporta Auth e não é ferramenta operacional de produção. Acima do limite exige procedimento específico com staging/journal e restauração validada antes da autorização; não dividir silenciosamente em lotes sem recuperação.

Resposta de restauração perdida: inventariar destino e comparar hash integral; não reaplicar para substituir registros. Falha antes do commit mantém destino vazio; concorrência/precondição recusa o commit inteiro. Em produção, congelamento de escritores exige autorização, pois exportação em múltiplas leituras de uma loja ativa não é snapshot consistente. Após restauração verificar contas/UIDs, vínculos, projeções, revisão, pedidos/histórico, reservas/idempotência e contador sem reduzir numeração. Rollback de código Pages é separado da recuperação de dados: nunca restaurar snapshot antigo sobre pedidos novos.

Atualizações partem de releases da mesma matriz, com teste sintético por configuração e changelog; promover por cliente após gates e autorização. Preservar histórico/versão anterior para reversão. Nenhuma cópia privada de cliente deve virar fixture da matriz.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

Nenhuma ação indispensável para finalizar a homologação local. Para a primeira instalação, ainda sem execução autorizada: decidir cliente/projeto/custos/domínio; confirmar titular/UID e provedores; autorizar separadamente bootstrap de dados, Rules, índices, Auth, publicação e domínio; realizar login/2FA/segredos diretamente nas plataformas e aceite físico/comercial. Minutos manuais e datas serão registrados no ato real, sem estimativa tratada como execução. Codex prepara operações/validações e só solicita intervenção humana indispensável, com IDs específicos e valores públicos revisáveis conforme AGENTS. Este guia não inicia essas ações automaticamente.

## Checklist reutilizável — primeira venda e próximas instalações

Ficha por cliente, sem preencher com dados da Demo. Registrar responsável, versão da matriz e evidência segura de cada confirmação. Itens reais só são executados após os atos correspondentes autorizados; esta ficha não inicia uma instalação.

| Item | Informação / verificação | Estado por cliente |
| --- | --- | --- |
|1. Nome comercial | Grafia aprovada, descrição e titular | A preencher |
|2. Logotipo | Arquivo autorizado, variantes e favicon | A preencher |
|3. Cor principal | Hexadecimal, contraste e aceite visual | A preencher |
|4. Produtos/categorias | Conteúdo próprio, ingredientes e disponibilidade | A preencher |
|5. Fotos/preços | Direitos de uso, URLs/arquivos e valores aprovados | A preencher |
|6. WhatsApp | País/DDD/número, destinatário e mensagem conferidos | A preencher |
|7. Endereço | Rua/número/bairro/cidade/UF e área atendida | A preencher |
|8. Horários | Sete dias e exceções; gravação em etapas compreendida | A preencher |
|9. Entrega/retirada | Modalidades, taxa, mínimo e prazo | A preencher |
|10. Pagamentos | Opções habilitadas; confirmação financeira manual | A preencher |
|11. Domínio | Titular, canônico/aliases, DNS/TLS autorizados | A preencher |
|12. Firebase | Projeto/estratégia, backup, Rules, índicesREADY e Auth aprovados | A preencher |
|13. Administrador | Titular e UID verificado, vínculo explícito sem promoção por e-mail | A preencher |
|14. Cloudflare | Projeto, release/branch, rootfrontend/dist, variáveis públicas e mapa de hosts | A preencher |
|15. Funcionamento | Regressão sintética, segurança, domínio/OAuth pessoal e pedido integrado autorizado | A preencher |
|16. Entrega administrativa | Acesso pelo próprio titular, orientação, suporte/backup/aceite registrados | A preencher |

### Matriz candidata da Etapa5

A consolidação preserva o catálogo Demo como vitrine permanente; nunca substituí-lo pelos dados de cliente. Commits preparados, SHA oficial publicado, deployment e verificação online são estados distintos, registrados no [relatório5](RELATORIO_ETAPA_5_CONSOLIDACAO.md). Antes da confirmação final, a versão consolidada continua local. Instalações comerciais devem fixar a release efetivamente publicada/aprovada, não presumir que a main ou um teste sintético representa aceite real.
