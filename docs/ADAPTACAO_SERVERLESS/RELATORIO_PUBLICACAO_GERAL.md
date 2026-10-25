# Publicação geral do Catálogo JS — 25/10/2026

Autorização expressa do proprietário para integrar todas as melhorias legítimas concluídas, commit/push normal em LucasTech-Dev/Catalogos/main e deployPages catalogo-demo, incluindo acionamento manual se automático não iniciar. Proibidas mudanças de Rules/índices/IAM/Auth/documentos comerciais; sem Render ou nova funcionalidade. Esta autorização supera somente o bloqueio de publicação das tarefas anteriores.

## A — EXECUÇÃO PELO CODEX

**PUB-GERAL-01.** main/origin e conexão GitHub confirmaram base `e6677c786c396e7eba3559121863c3ebae672d7d`, checkout inicialmente limpo. Código original preservado na cópiaJS sem commits/rastreados; integração feita no checkout com histórico `private-backups/publicacao-js-main`. Nenhuma exclusão de fontes ou sobreposição de branch sem histórico; sem force.

Melhorias reunidas: imagens/fallback/destaque já na main030ec02; performance de leitura já na maine6677c7 e ainda ausente do site; loading global e todos os ajustes de frontend concluídos localmente. Conferida toda árvore frontend/src/public/scripts: nenhum módulo funcional ficou fora da release e nenhum conteúdo remoto ausente localmente foi apagado. Login/Cadastro tinham apenas diferenças de whitespace; normalizados sem mudar comportamento. Lockfile/dependências/configuração Firebase e estilos existentes preservados, CSS do loader acrescentado. `frontend/package.json` mantém comandos próprios da release e acrescenta dois testes online; os comandos locais de migração/preparação não foram copiados para a release nem executados. Scripts/testes completos e histórico local continuam preservados.

Testes de contrato da release usam fixtures puras mantidas em quality/fixtures; import de fixture da vitrine foi ajustado para esse caminho. Primeiro ensaio:163 testes passaram e a suitevitrine não resolveu caminho do backend da árvore original. Correção mínima exclusivamente no import do teste; repetição da suíte antes do commit. Nenhuma correção de produto nova foi necessária.

Build final do checkout integrado: `npm run build -- --mode homologacao --outDir <artefato privado>`; configuração local foi comparada campo a campo às dez variáveis públicas do Pages e é idêntica. Rootfrontend, saída projetodist, AutoDeploy habilitado para main e repositório correto. **Nenhuma configuração Pages ou variável alterada.** Saída em private-backups/publicacao-geral-build para não sobrescrever builds anteriores; não entra no Git. Hashes em PUBLICACAO_GERAL_BUILD_EVIDENCIAS.json. Avisos Vite de chunkgrande/importe estático+dinâmico já conhecidos; compilação aprovada, sem refatoração fora de escopo.

Arquivo por função: fontes frontend e boundaries/hooks/loader da lista do relatório de carregamento; novos regressões e expectativas em quality/frontend/test; catalogo-browser.js mantém ensaio sintético de conexão lenta; novo validar-publicacao-geral.cjs verifica rotas/loader/imagens/carrinho/checkout/perfil/pedidos/admin sem submit comercial; medir-performance-pages.cjs compara baseline com mesmo método, sem dados privados no recibo. Documentação atual dos dois ajustes e evidências sanitizadas acompanham a release. Guias/Registro recebem ponte para este resultado, sem importar arquivos históricos redundantes ou privados. A fonte original de contratos/Emulators/planos permanece preservada localmente.

## Publicação e validação

Aguardar conclusão dos testes essenciais antes do commit/push. Após o push, acompanhar Pages; se não iniciar, usar POST de deploymentGit/main no projeto existente pela conexão autorizada, sem DirectUpload de fonte diferente ou mudança de configuração. Conferir commit_hash, branchmain, commit_dirty=false e canonicalsuccess. Na URL pública, comparar todos os hashes de build a fim de comprovar que o código mais recente está servido.

Validação online autorizada: GET de páginas/dados e login normal nas contas sintéticas já existentes; sem criar usuários/pedidos, atribuir privilégios ou gravar no Firestore. Cadastro somente formulário, checkout somente prévia, admin somente recusa ao cliente. Conta admin sintética segue desativada; fluxo positivo administrativo reutiliza os ensaios locais/Emulator da mesma lógica. Não reativar conta ou fazer julgamento comercial pelo proprietário. Medidas administrativas de bloqueio não representam latência do dashboard.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

Nenhuma ação/segredo indispensável neste ponto; publicação e métodoalternativo já autorizados. Não solicitar a mesma autorização novamente. Após concluir, relatar commit/deployment, tempos observados, limitações e posição exata. Autorizações não concedem alterações de banco/Rules/índices/Auth/IAM ou liberação comercial integral. Fotos ausentes e demais ressalvas continuam abertas.

Estado: integração/testes e build preparados; resultados de commit/deploy/online serão registrados após execução. Fonte de rollback: último deployment440ebe2b, cópia/históricoGit preservados; nenhuma reversão Firebase necessária. Sem limpeza de histórico/dados autorizada.
