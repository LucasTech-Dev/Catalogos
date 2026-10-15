# Publicar a demonstração com fixtures

Decisão de 15/10/2026: primeira versão online usa exclusivamente catálogo fictício local no backend Express. Firebase real permanece desconectado. Esta preparação não cria uma loja pronta para vendas.

## O que está pronto

Modo explícito `CATALOGOS_RUNTIME_MODE=public-fixture-demo`, isolado dos modos full e public-readonly-demo com Firebase, que continuam preservados. Ramo fixtures não inicializa/importa Admin SDK, Firestore ou Authentication, não usa ADC nem Secret File, inclusive no encerramento. Configuração Firebase/Google de projeto/credencial/Emulator junto desse modo é recusada. Nenhuma alteração de IAM, chave, dados reais ou Rules foi feita.

Fonte exclusiva `backend/fixtures/catalogo-publico.json`: loja fictícia `loja-demo`, três categorias e seis produtos (um indisponível). Preparada a partir da proposta de catálogo fictício existente; não carrega fixtures de usuários/endereço nem consulta bancorestaurante. Map em memória, DTO público existente, máximo 50 produtos/20 categorias, resposta 64 KiB, cache 30s e limite local 60/min. Sem endpoints de mutação. Permite GET/HEAD health `/`, GET/HEAD `/publico/lojas/loja-demo/catalogo` e preflight restrito; outros caminhos/métodos retornam 404. CORS usa origens explícitas; HTTPS em homologação, loopback HTTP somente no modo local development.

React possui entrada separada `DemoFixtures`: início, cardápio, filtro de categorias, detalhe de produto e carrinho demonstrativo. Catálogo vem de fetch à API; erro mostra indisponibilidade/retry, sem fallback estático. Carrinho guarda somente IDs/quantidades em memória do React, máximo 20 unidades por produto; atualizar/fechar a página o esvazia. Não grava localStorage/sessionStorage, não chama APIs de escrita, não cria usuário/sessão/pedido/pagamento/WhatsApp. Login/admin/checkout mostram indisponibilidade sem fetch. A modalidade Firebase anterior permanece sem carrinho.

## GitHub: condição antes do push

Branch de trabalho `deploy/render-demo-readonly`; main preservada em 19b554d. O push dessa branch foi autorizado pelo proprietário se verificações/segredos forem aprovados **e após verificar o impacto dos previews Cloudflare**. Não há autorização de merge em main ou publicação de produção.

Consulta GitHub de checks/status de main não mostrou integração Cloudflare identificável; isso não prova que previews estejam desligados. Não há token/API Cloudflare disponível nem conexão adequada encontrada. A política real do projeto não pôde ser consultada. Pergunta enviada ao proprietário para informar Production branch e Preview deployments. **Push ainda não executado enquanto essa verificação estiver pendente.** Não se trata de nova auditoria de Firebase; é a condição explícita da ordem para evitar publicação involuntária.

No Cloudflare Dashboard → Workers & Pages → `catalogo-demo-cz1` → Settings → Builds & deployments, conferir Configure Production deployments e Preview deployments. Informar se produção é main e se previews estão em All non-Production branches, None ou Custom (incluindo/excluindo deploy/render-demo-readonly). Não mudar produção. Em projeto Direct Upload, informar isso: controles Git são diferentes. Um preview automático com variáveis antigas poderia executar o modo completo anterior, pois fixtures exigem ativação explícita. Não assumir que criar a branch desabilita esses efeitos.

Após confirmar impacto aceitável, concluir scanner/commit e executar somente o push desta branch, sem --force ou --all. A verificação remota anterior ainda mostrava main b8e2a4b e branch de deploy ausente. O pacote inclui os 11 commits já preparados e a adaptação atual, preservando histórico. Registrar hash remoto após envio, se realizado; não afirmar envio ou sucesso sem retorno do GitHub.

## Render: criar pelo painel

O proprietário escolheu criar pelo painel. A integração Render foi encontrada, mas não conectada/utilizada para criar recursos. Nenhum serviço ou plano pago ativado; URL pública ainda inexistente.

Após a branch estar enviada, abrir [Render Dashboard](https://dashboard.render.com/) e:

1. Clicar **New → Web Service**.
2. Conectar GitHub e selecionar **LucasTech-Dev/Catalogos**.
3. Selecionar a branch **deploy/render-demo-readonly**, conferindo o commit novo com fixtures. Não selecionar main.
4. Preencher os campos abaixo.
5. Em Environment, inserir exatamente as sete variáveis do bloco seguinte. Não importar o exemplo antigo com Firebase.
6. Conferir **Free**, ausência de Secret Files/discos/bancos/add-ons pagos e **Auto Deploy Off**; então criar o Web Service autorizado por esta ordem.
7. Quando o deploy ficar Live, copiar a URL realmente fornecida pelo Render e enviar ao Codex para testar. Não presumir que o nome escolhido ficará disponível como hostname.

| Campo | Valor |
| --- | --- |
| Name | catalogos-api-homolog |
| Language | Node.js (package.json exige 24.x) |
| Branch | deploy/render-demo-readonly |
| Root Directory | backend |
| Build Command | npm ci |
| Start Command | npm start |
| Instance Type | Free |
| Health Check Path | / |
| Auto Deploy | Off |
| Secret Files | Nenhum |

Localização: escolher entre as opções Free disponíveis; não habilitar plano pago. O servidor já escuta em 0.0.0.0 e usa PORT da plataforma, sem fixá-la no painel. A implantação é Node nativa; Dockerfile não é utilizado nesse fluxo.

```dotenv
APP_ENV=homologacao
NODE_ENV=production
CATALOGOS_RUNTIME_MODE=public-fixture-demo
CATALOGOS_DEMO_LOJA_ID=loja-demo
CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev
RATE_LIMIT_MODE=enforce
HTTP_LOG_ENABLED=1
```

Exemplo exato: [fixtures.backend.env.example](../infra/render/fixtures.backend.env.example). Não adicionar GCLOUD_PROJECT, FIREBASE_*, FIRESTORE_*, GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLOUD_PROJECT, flags/listas CATALOGOS_DEMO_CATALOG_APPROVED/PRODUCT_IDS/CATEGORY_IDS ou Secret File. A ativação explícita do modo fixtures autoriza apenas os dados fictícios embutidos; não aprova o catálogo real. Não mudar o modo Firebase para fazê-lo iniciar sem chave.

A criação inicia o primeiro deploy mesmo com Auto Deploy Off. Instâncias Free podem repousar após 15 minutos sem tráfego; React fixtures usa timeout de 60s e retry manual. Isso não garante disponibilidade comercial ou todos os custos da conta.

## Validar URL real e conectar somente Preview

Quando existir URL real, abrir `/`: esperado 200 com mensagem da API. Abrir `/publico/lojas/loja-demo/catalogo`: esperado 200 com seis produtos/três categorias fictícios. `/admin` e `/publico/lojas/outra/catalogo`: esperado 404. Sem Firebase ou operação de escrita. O prefixo da URL será registrado apenas depois da criação; `https://api.example.com` nos exemplos é placeholder.

No Cloudflare, preparar **apenas Preview**, preservando Production:

- Root Directory `demo`, comando `npm run build`, output `dist` (estrutura confirmada do repo).
- Selecionar a branch deploy/render-demo-readonly para a prévia conforme os controles efetivos.
- Variáveis Preview: `VITE_APP_ENV=homologacao`, `VITE_CATALOGOS_RUNTIME_MODE=public-fixture-demo`, `VITE_CATALOGOS_DEMO_LOJA_ID=loja-demo`, `VITE_LOJA_ID=loja-demo` e **`VITE_API_URL=origem HTTPS real fornecida pelo Render`**, sem barra final/path.
- Não definir VITE_FIREBASE_* para esse Preview; configuração antiga é recusada. Não alterar variáveis Production.
- Copiar a URL efetiva da prévia e acrescentar sua origem exata a CORS_ORIGINS no Render, separada por vírgula da origem já aprovada. Não usar wildcard para pages.dev.
- Aplicar a nova configuração do backend com implantação consciente; testar catálogo/filtro/detalhe/carrinho na prévia. Refresh limpa o carrinho; não há botão de finalizar pedido.

Quando as duas URLs existirem, Codex deve conferir HTTPS, status/payload, preflight CORS e consumo real pelo navegador. Promoção para produção exige confirmação específica do proprietário; não foi feita nesta rodada. Se a configuração Preview do projeto existente for compartilhada com outras branches, verificar o impacto e preferir uma prévia isolada sem modificar a publicação atual.

## Testes e estado da entrega

344 testes backend, 101 React e oito infraestrutura aprovados. Build React em homologação-fixtures e integração React+Express em Chrome local aprovados. Testados health, catálogo, bloqueios dos contratos privados e de escrita, outra loja, CORS e limite; importação Firebase proibida pelo harness. Arquivo fixture permaneceu intacto. `npm start` com configuração equivalente ao Render iniciou sem Secret/SDK e encerrou com SIGTERM exit 0. Sem alteração de dependências.

Scanner e consistência documental: resultados finais em [verificações](evidencias-demo-fixtures/verificacoes.txt). Resultados completos/sanitizados em [resumo](evidencias-demo-fixtures/resumo.json). Testes locais não são prova de implantação.

| Resultado esperado | Estado nesta preparação |
| --- | --- |
| Branch enviada ao GitHub | Pendente confirmação da política Cloudflare antes do push |
| Backend Render Free | Código pronto; criação pelo proprietário no painel |
| URL pública e health 200 remoto | Ainda não existem/comprovados |
| Produtos e categorias pela API | Comprovados localmente via HTTP |
| React + API pela internet | Pendente URLs e Preview |
| Carrinho demonstrativo | Comprovado em React + API local |
| Nenhuma conexão Firebase | Comprovado nos testes do ramo fixtures, sem credencial/SDK |
| Nenhuma operação persistente/admin exposta | Rotas negadas e carrinho em memória nos testes |

Guias internos e fluxo lógico externo atualizados, preservando histórico. Mantidas 25 ressalvas, 16 abertas/nove resolvidas localmente; não encerrar gates Firebase/produção por este modo isolado. Sistema comercial não liberado.

Referências oficiais: [Node/Express no Render](https://render.com/docs/deploy-node-express-app), [porta e host](https://render.com/docs/web-services), [ambiente e Secret Files](https://render.com/docs/configure-environment-variables), [Free](https://render.com/docs/free), [controle de branches Cloudflare](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) e [build Cloudflare](https://developers.cloudflare.com/pages/configuration/build-configuration/).
