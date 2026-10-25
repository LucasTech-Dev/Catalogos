# Publicado na ordem geral — 25/10/2026

Loading/performance efetivamente publicados no código4f3c01fb47e71683521405a174917ca893562552, Pages3afef9fe-e047-4f18-ba4c-12b7ed2a5fbf/success. Resultado e limites no [relatório da publicação geral](RELATORIO_PUBLICACAO_GERAL.md). Os estados de publicação pendente/bloqueada abaixo são históricos, superados somente por esta autorização/execução. Firebase real preservado; fotos/ressalvas comerciais mantidas.

---

# Carregamento global por rota — 25/10/2026

**CONCLUÍDO LOCALMENTE.** Pedido do anexo “IMPLEMENTAÇÃO — SISTEMA GLOBAL DE CARREGAMENTO DO CATÁLOGO JS”. Implementação e validação locais, sem stage/commit/push/deploy ou alterações no Firebase real. Nenhum plano concorrente, nova rota ou MVP. A autorização de publicação da tarefa anterior não se aplica a esta, que proíbe publicação automática expressamente.

## A — EXECUÇÃO PELO CODEX

**LOAD-01 — entrada consistente nas rotas existentes.** Um loader CSS reutilizável, fundo claro, responsivo, centralizado na área principal, mensagem “Carregando...”, logo quando já disponível, status acessível e respeito a movimento reduzido. `PageBoundary` mostra somente loader/erro até as dependências essenciais terem uma resposta válida; lista vazia é sucesso, ausência/recusa gera erro orientado. Há retry no erro e preservação das mensagens dos serviços existentes para rede, ausência e permissão. Não há nova biblioteca nem Tailwind acrescentado: o projeto efetivamente usa CSS próprio.

Página já validada permanece durante atualizações secundárias; feedback e erros são locais. Não adicionar atraso artificial para mostrar loader. Limite de espera visual de leituras:20s, com mensagem e retry; a promessa do SDK pode continuar em andamento, mas seu resultado tardio não altera a tela após timeout/troca de recurso/sessão. Não cancelar nem repetir escritas por esse limite. Leituras simultâneas da mesma fonte no mesmo hook compartilham a promessa; catálogo mantém a otimização anterior por instância/loja. Nada de cache novo de dados privados/autoridade ou invalidação de Rules.

### Rotas e dependências essenciais

| Rotas reais | Condição de liberação |
| --- | --- |
| `/`, `/cardapio`, `/produto`, `/carrinho` | Contexto do catálogo pronto: loja/categorias/produtos. Sem preço zero, “produto removido” ou lista vazia transitória. Produto inexistente aparece depois da resposta válida. Informações da loja estão na Home; não existe rota nova de informações. |
| `/checkout` | Mesmo catálogo + perfil/endereços da sessão, carregados em paralelo pelas consultas existentes. Falha antes silenciada agora exibe erro/retry; totais e formulário só aparecem completos. Criação/retomada de pedido e WhatsApp mantêm sua trava/estado local. |
| `/perfil`, `/perfil/dados`, `/perfil/enderecos`, `/perfil/pedidos`, `/perfil/pedido` | Resolução inicial de Auth e recurso da sessão. Descartar resposta antiga, limpar conteúdo na troca de conta e não renderizar dados privados após recusa. Anônimo preservado. |
| `/admin` e produtos/categorias/pedidos/clientes/configurações, formulário/detalhe | Primeiro o AdminGate aguarda Auth/autoridade, depois os recursos essenciais. Produtos/formulário também aguardam categorias. Aparência e informações são seções das configurações existentes; não foram criadas páginas. Formulários controlados recebem os dados antes da pintura. |
| `/login`, `/cadastro` | Formulários estáticos, sem recurso essencial remoto para aguardar. Continuam imediatos e usam o estado local de envio/erro existente. Não bloquear por catálogo opcional do cabeçalho. |
| Inicialização do bundle | Mesmo loader enquanto o módulo da aplicação chega; falha/timeout permite recarregar. |

Cabeçalho público continua visível durante carga da rota. Cabeçalho/sidebar do admin aparecem após autorização, antes de seus recursos. Antes da autorização, nenhum conteúdo administrativo é montado. Recusa preserva o formulário de login da rota administrativa existente; não foi inventada rota de login ou mecanismo de autorização. Imagens são independentes: dimensões/fallback atuais preservados e nenhum `onload` participa do estado pronto. Correções e pendências de fotos anteriores permanecem.

### Arquivos criados/modificados e função

| Arquivo/grupo | Função |
| --- | --- |
| `frontend/src/components/ui/PageLoader.jsx` — novo | `PageLoader` visual + `PageBoundary` para sucesso/erro/loading com retry. |
| `frontend/src/components/ui/PageLoader.css` — novo | Animação leve, dimensões responsivas e movimento reduzido. |
| `frontend/src/lib/carregamento.js` — novo | Timeout de leituras de20s, sem disparo automático de retry/escrita. |
| `frontend/src/main.jsx` | Loader no bootstrap e erro recuperável do carregamento do módulo. |
| `frontend/src/contexts/LojaContext.jsx` | Expõe catálogo pronto e boundary, timeout, preserva dados em atualização de rede e os oculta se a loja recusa acesso403/404. |
| `frontend/src/hooks/useRecurso.js`, `useAdmin.js` | Distinguem primeira carga e atualização; origem/versão, descarte de respostas antigas, timeout e promessa compartilhada em cliques repetidos. |
| `frontend/src/components/admin/AdminGate.jsx` | Visual único enquanto verifica Auth/autoridade; espera limitada e retry; continua sem conteúdo protegido antes da autorização. |
| Páginas públicas: `Home`, `Cardapio`, `Produto`, `Carrinho`, `Checkout` | Boundary de catálogo e, no checkout, dados essenciais da sessão. |
| Páginas cliente: `Perfil`, `DadosPessoais`, `Enderecos`, `Pedidos`, `PedidoDetalhes` | Reutilizam seus hooks sem consultas extras para o loader e protegem a primeira renderização. |
| Páginas admin: `Dashboard`, `Produtos`, `Categorias`, `Pedidos`, `Clientes`, `Configuracoes`, `PedidoDetalhes`, `ProdutoForm` | Boundary dos recursos já consultados; formulários adaptados antes da pintura. |
| `quality/frontend/test/carregamentoGlobal.test.jsx` — novo |13 regressões de carga lenta, Auth pendente, erro/retry, lista vazia, atualização local, sessão/rota/filtro, timeout, promessa compartilhada, acessibilidade e imagem opcional. |
| `quality/frontend/test/catalogoSdk.test.jsx`, `vitrine.test.jsx`, `compras.test.jsx` | Atualizam expectativas legítimas do novo loader e formulário oculto; adicionam regressão de catálogo revogado após carga. |
| `quality/frontend/scripts/catalogo-browser.js` | Instrumentação exclusiva do build de teste pausa leitura para comprovar loader, cabeçalho, mobile e movimento reduzido no Chrome. Não entra no produto. |

Lista exata dos arquivos e hashes no [recibo global](CARREGAMENTO_GLOBAL_EVIDENCIAS.json); comandos/resultados do [Emulator](CARREGAMENTO_EMULATOR_EVIDENCIAS.json). Os quatro módulos de otimização de GET da tarefa anterior e `lib/firebase.js` permanecem byte a byte iguais ao checkout main/e6677c7. `Login`/`Cadastro` já tinham diferenças locais anteriores em relação ao checkout de release: não modificados nesta tarefa.

### Testes e evidências

- Suíte final: `npm --prefix frontend test -- --maxWorkers=2` → **175/175 testes,19 arquivos**,77,91s. Erros da primeira rodada: quatro expectativas antigas assumiam formulário parcialmente montado ou momento síncrono do mock; adequadas ao comportamento solicitado, sem remover testes de segurança/comércio. Rodada dirigida39/39 e intermediária174/174, depois regressão pública adicional e suíte final175/175.
- Build final: `node quality/frontend/scripts/build-final.mjs` → quatro exemplos públicos, três builds test/homologacao/production aprovados, oito saídas cada, em memória; nenhum `.env` privado lido e `dist` atual preservado. Build passa não significa publicação ou desempenho remoto aferido.
- Chrome + Web SDK/Auth/Firestore Emulators exclusivos em127.0.0.1:18980/18999, projeto `demo-loading-global` e projeto demo específico do admin. Catálogo94 checksSDK+17navegador; perfil72+25; gestão84+20. Total250SDK/Rules e62 verificações de navegador. Inclui recarga/navegação, convidado/cliente/admin, vazio, cadastro sintético, perfil/endereços, autorização, isolamento entre lojas/titulares, offline/retry, dados/valores e formulário de configurações. Operações e Rules usadas pelos ensaios são somente do Emulator; nenhuma regra/dado real modificado.
- No build de teste, primeira leitura foi suspensa até liberação explícita pelo teste: zero produtos parciais com cabeçalho e loader, mobile390px sem overflow, preferência reduzida sem animação. HTTPS externo bloqueado. Capturas desktop/mobile em `private-backups/carregamento-local/`, ignoradas; mobile inspecionado visualmente. Imagens opcionais quebradas não bloqueiam sucesso; fallbacks/dimensões existentes preservados.
- Após a limpeza do launcher temporário: `npm --prefix frontend test -- carregamentoGlobal catalogoSdk --maxWorkers=2` →19/19 aprovados; inventário/caminhos novamente conferidos. Scanner dirigido dos31 arquivos de código/qualidade: zero achados; hashes finais conferidos.
- As negativas `PERMISSION_DENIED` e o limite conhecido de expressões emitidos pelos ensaios são casos negativos esperados, aprovados; não houve relaxamento de segurança ou falsa baixa de B-03/B-04.

### Segurança, limpeza e limites

Sem consultas novas somente para obter estado visual; no checkout reaproveitadas as duas leituras existentes e sua execução paralela. O loader não tem duração mínima e não aguarda imagens/histórico extenso extra. Não se afirma ganho em milissegundos de produção: esta tarefa organiza apresentação/estados e preserva as otimizações anteriores. A navegação por links/recarregamento e o cache já existentes foram mantidos; sem novo roteador, cache persistente ou armazenamento de dados privados.

Fontes/testes/documentos, fixtures e dependências necessárias preservados; nenhum histórico excluído. Único descartável adicional: launcher pontual `/tmp/catalogos-loader-emulators.cjs`, sem referência em runtime/deploy/CI; hash/função registrados antes da remoção. Diretório temporário e processos dos Emulators encerrados pelo launcher; capturas/recibos necessários mantidos. Git original segue sem rastreados como no início; checkout de publicação e6677c7 permanece limpo, sem cópia/stage das alterações novas. Revisão dirigida de segredos sem achados. Espelho externo ausente, não recriado.

Guia Mestre/guiaTXT, plano único, diário, Registro, Continuidade e índice/inventário atualizados com referência a este resultado. Matriz/posição dos noveMVPs e registro de riscos comerciais sem mudança de estado; nenhum novo plano. A ausência de disparo automático do Pages documentada anteriormente continua fora desta implementação e não foi reavaliada. Fotos pendentes e ressalvas comerciais não recebem baixa.

## B — EXECUÇÃO MANUAL PELO PROPRIETÁRIO

**LOAD-H1 — nenhuma intervenção manual indispensável nesta implementação local.** Não pedir senha/2FA ou usar dados reais. A próxima ação é o proprietário revisar a experiência e, quando desejar, **autorizar especificamente a publicação do loading**. Não executar commit/push/deploy por autorização anterior. Depois, a validação online deverá usar a versão publicada e respeitar os gates já registrados; não disparada nesta tarefa.

Estado final: concluído localmente, sem limpeza pendente; produção não alterada. Tempo técnico aproximado20min, sem cronômetro integral; espera externa/manual0. Rollback local: retirar somente a integração dos boundaries/hooks e os três arquivos de runtime novos conforme lista/hash, preservando os quatro módulos de performance e todo trabalho anterior; nenhuma reversão de banco necessária.
