# Qualidade e ferramentas de desenvolvimento

Esta área preserva a regressão e os ensaios; não compõe os artefatos publicados.

| Caminho | Função |
| --- | --- |
| backend/test | Testes Node de regras, HTTP, autorização, pedidos e modos de demonstração |
| backend/scripts | Integrações Emulator, dry-run e auditoria somente leitura; executar apenas no ambiente explicitamente autorizado |
| frontend/test | Testes React/Vitest, contrato público, carrinho, conta e administração |
| frontend/scripts | Integrações de navegador e SDK/Rules no Emulator; lib/chrome.cjs gerencia Chrome temporário |
| frontend/vitest.config.mjs | Descobre os testes externos ao diretório da aplicação |
| frontend/package.json | Limite de módulos ESM; não cria instalação de dependências |
| infra/test | Regressão de configuração, contexto Docker e scanner |
| infra/scripts | Smoke Docker e Hosting local |
| fixtures/homologacao.json | Dados de teste controlados; não são dados publicados nem seed de produção |
| run.cjs | Ponto de entrada para npm e CI; encaminha comandos e herda o hook nos subprocessos |
| register.cjs | Resolve dependências dos testes nos node_modules de cada aplicação, com escopo limitado a quality/backend e quality/frontend |

Instalar dependências pelos locks de backend e frontend. As ferramentas de frontend permanecem em devDependencies para compilar/testar a aplicação, sem duplicar instalações em quality. O hook usa Node 24 e não é carregado por npm start ou pelo Docker. Não inicializa Firebase, não concede permissões e não altera o runtime comercial.

Comandos, pré-requisitos e limites: [manual de desenvolvimento](../docs/MANUAL_DESENVOLVIMENTO.md). Procedimento permanente de encerramento: [Regra 14](../AGENTS.md#regra-oficial-14). Dados públicos necessários ao runtime ficam em backend/data/catalogo-publico.json, separados destas fixtures.


Ensaio remoto explícito da MVP-01, somente quando autorizado a consultar a API pública: gerar `npm run build:vitrine` em frontend/ e, na raiz, executar `CATALOGOS_BROWSER_EVIDENCIAS=docs/evidencias-mvp01 node quality/frontend/scripts/render-readonly.cjs`. Usa Chrome/porta loopback livre e HTTPS Render real sem interceptação; registra inclusive bloqueio CORS (não o declara sucesso de integração). Não é executado automaticamente por npm test/CI nem modifica CORS. O harness `fixtures-integracao.cjs --original` aceita a mesma variável para preservar capturas/recibo; sem ela remove evidência temporária com o build. Falhas 503/offline nesse harness são injetadas explicitamente para testar UI, nunca fallback do produto.

Prévia remota MVP-01 (opt-in, exige autorização de consulta): `CATALOGOS_BROWSER_EVIDENCIAS=../docs/evidencias-mvp01/preview-publicada npm run test:preview:vitrine` em frontend/. O script `preview-publicada.cjs` usa exclusivamente o alias vitrine-original, Chrome real e API pública Render; testa desktop/mobile, filtro, detalhe, carrinho/refresh e gates privados. Não altera CORS, não escreve dados remotos, não faz deploy ou build e não integra npm test automático.

Validação oficial autorizada (somente leitura, sem deploy): em frontend/, `CATALOGOS_BROWSER_EVIDENCIAS=../docs/evidencias-mvp01/oficial-publicado npm run test:preview:vitrine -- --oficial`. A flag escolhe somente https://catalogo-demo-cz1.pages.dev; sem flag mantém preview. Confere também hashes contra docs/evidencias-mvp01/artefato-candidato.json e DTO real Render6produtos/3categorias. Não recompila, não altera provedores e não integra automaticamente npm test/CI.

Smoke Docker full/Emulator (MVP-02, opt-in Linux): com imagem local construída e Auth/Firestore Emulator exclusivos em127.0.0.1, executar `APP_ENV=test GCLOUD_PROJECT=demo-catalogos-emulator FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 CATALOGOS_TEST_IMAGE=catalogos-mvp02:preparacao node quality/infra/scripts/docker-full-emulator-smoke.cjs`. Exige Docker local e usa rede host apenas para loopback do Emulator; não monta volumes/credenciais, não publica portas e recusa projeto real. Testa Firebase real da imagem contra Emulator, catálogo, Auth, admin da loja/negação cruzada, CORS e imagem sem quality/segredos. Dados fictícios exclusivos por execução; encerrar Emulator elimina seus dados em memória. Não executar sobre emuladores compartilhados com dados a preservar. Complementa o smoke fixtures sem rede e não integra npm test automaticamente.

MVP-02-H1, migração no serviço Render existente: `node --test quality/backend/test/catalogoMigracaoContrato.test.js` executa quatro regressões focadas entre service full e adaptador React real, com documentos fictícios em memória. Reproduz recusa por disponivel ausente/categoria órfã e prova DTO válido/projeção e ausência de fallback para loja desativada. Descoberto automaticamente pelo npm test backend; não acessa Firebase real, não publica produtos e não integra runtime/imagem.
