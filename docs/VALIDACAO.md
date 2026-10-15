# Validação — 15/10/2026

## Artefato mínimo

- `npm ci`: 68 pacotes instalados, sem scripts próprios de instalação.
- `npm test`: três testes aprovados: validação de ambiente; contrato HTTP público/negativo, sem SDK externo e com sockets restritos ao loopback; `npm start` com ambiente mínimo de produção, health, catálogo e encerramento SIGTERM.
- Os testes percorrem o inventário de contratos privados do sistema anterior para comprovar HTTP 404. Esse inventário está somente em `backend/test/contratos-privados.cjs`; não contém handlers, serviços ou implementação de rotas privadas.
- Fonte em runtime: dois módulos próprios, JSON fictício, Express e módulos nativos de Node. Sem dependência indireta do SDK externo e sem capacidade de acessar armazenamento remoto. Dependências transitivas verificadas por `npm ls --all`; `npm audit` retornou zero vulnerabilidades.
- Fixture intacta após leituras, tentativas de escrita e requisições negadas. Categorias, seis produtos e detalhe compatíveis com o DTO do React existente.

## Frontend preservado

101 testes React aprovados em nove arquivos. Build Vite em modo homologação-fixtures aprovado. O harness existente `demo/scripts/fixtures-integracao.cjs` foi executado em Chrome com seu require do app apontando para o artefato mínimo (`criarApp()`). Sem modificação no frontend original.

O teste no navegador comprovou fetch HTTP do catálogo, navegação início/cardápio/detalhe, adicionar/aumentar/diminuir/remover no carrinho, bloqueio admin, CORS, viewport mobile e ausência de requisições de escrita ou recursos do SDK remoto. Nenhum erro de navegador. A URL de API usada nessa integração é loopback; não constitui publicação online.

## Segurança e publicação

Scanner textual de arquivos do snapshot e blobs do histórico pendente, com resultados em `evidencias/segredos.json`. Limites: padrões conhecidos, não uma garantia universal de ausência de segredos. Arquivos locais ignorados não foram incluídos no artefato nem lidos para o scanner.

A configuração Cloudflare foi confirmada pelo proprietário nesta sessão: produção `main`, automatic production deployments ativado, previews `None` salvo. Não houve consulta autenticada ou mudança automática no Pages. Nenhum serviço Render ou URL pública foi criado.

Os documentos completos de desenvolvimento permanecem na branch de preservação e no histórico anterior. O artefato mínimo não valida nem libera o sistema comercial completo.

Evidências: [backend](evidencias/backend.txt), [React](evidencias/react.txt), [build](evidencias/build.txt), [integração](evidencias/integracao.txt), [auditoria npm](evidencias/npm-audit.json).
