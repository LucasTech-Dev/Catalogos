# Criar o Web Service da demonstração

No [Render Dashboard](https://dashboard.render.com/), selecionar **New → Web Service**, conectar o GitHub e preencher:

| Campo | Valor |
| --- | --- |
| Repositório | `LucasTech-Dev/Catalogos` |
| Nome sugerido | `catalogos-api-demo` |
| Branch | `deploy/render-demo-readonly` |
| Root Directory | `backend` |
| Language | `Node` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | `Free` |
| Health Check Path | `/` |
| Auto-Deploy | `Off` |

Única variável específica obrigatória:

```dotenv
CORS_ORIGINS=https://catalogo-demo-cz1.pages.dev
```

`engines.node=24.x` no `backend/package.json` seleciona Node 24 com limite superior. Não sobrescrever com `NODE_VERSION` de outra versão. Render pode definir `NODE_ENV=production`; a API funciona com esse valor. `PORT` é injetada pelo Render e o servidor escuta em `0.0.0.0`. Não são necessários APP_ENV, CATALOGOS_RUNTIME_MODE, CATALOGOS_DEMO_LOJA_ID, RATE_LIMIT_MODE ou HTTP_LOG_ENABLED: loja, fixture, logs e bloqueios estão fixos no artefato.

Não adicionar Secret Files ou variáveis de banco/identidade. Não importar os exemplos de implantação antigos, que não existem neste snapshot. Não criar banco, disco ou add-ons para essa demonstração.

Antes de clicar **Create Web Service**, conferir branch, commit remoto, Free e Auto-Deploy Off. A criação inicia a primeira implantação. Nenhum serviço foi criado automaticamente pelo Codex.

Após status Live, copiar a URL HTTPS realmente fornecida pela plataforma. Verificar:

1. `GET /` → HTTP 200 e mensagem de health.
2. `GET /publico/lojas/loja-demo/catalogo` → HTTP 200, seis produtos e três categorias.
3. GET com Origin `https://catalogo-demo-cz1.pages.dev` e preflight GET → origem exata permitida.
4. Origem não autorizada → 403; POST, PUT, PATCH, DELETE e caminhos privados → 404.

Enviar essa URL ao Codex para validação real. Até lá, não há URL pública comprovada. A publicação da API não modifica o frontend já hospedado.

Para um futuro frontend demonstrativo, usar na versão React preservada: `VITE_APP_ENV=homologacao`, `VITE_CATALOGOS_RUNTIME_MODE=public-fixture-demo`, `VITE_CATALOGOS_DEMO_LOJA_ID=loja-demo`, `VITE_LOJA_ID=loja-demo` e `VITE_API_URL` igual à origem HTTPS real da API. Uma eventual origem de frontend adicional deve ser explicitamente acrescentada a CORS_ORIGINS, separada por vírgula. O Pages de produção permanece como está; uma nova publicação do React requer uma etapa específica.

Limitações: dados fixos, nenhuma venda ou sessão, carrinho volátil, limite local de 60 leituras de catálogo por minuto por peer TCP. Atrás do proxy, visitantes podem compartilhar esse limite; não se confia em X-Forwarded-For. Health não consome o limite. O Free pode suspender por inatividade e demorar na retomada; não representa prontidão comercial.

Referências: [Node no Render](https://render.com/docs/node-version), [Express](https://render.com/docs/deploy-node-express-app), [Free](https://render.com/docs/free).
