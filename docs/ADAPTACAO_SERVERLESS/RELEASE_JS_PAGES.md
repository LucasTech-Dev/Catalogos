# Release do Catálogo JS — Pages

Integração autorizada em24/10/2026 sobre LucasTech-Dev/Catalogos/main, sem substituir seu histórico. Produto publicado:frontend/ (React/Vite/JavaScript + Firebase Web SDK). Backend/demo/firebase originais deste repositório permanecem históricos e não serão hospedados/implantados por esta release. Software Biblioteca e outros projetos não são alvo.

## Build e configuração

Pages:catalogo-demo; branch main; root frontend; comando npm run build -- --mode homologacao; saída dist. Runtime full, VITE_APP_ENV=homologacao, loja-demo/bancorestaurante e flags explícitas homologadas. Apenas variáveis públicas no painel Pages; nenhuma credencial Admin, .env privado, backup ou dados pessoais no Git. Hostcatalogo-demo-cz1.pages.dev resolve loja-demo por VITE_LOJA_ID. SPA:public/_redirects contém /* /index.html 200.

Modo homologacao mantém as proteções para o projeto Firebase de demonstração; Vite gera build otimizado. O build foi comparado por SHA256 ao artefato homologado, sem alteração de funcionalidades.

## Qualidade e escopo

147 testes React em16 arquivos aprovados na árvore integrada. npm --prefix frontend test e npm --prefix frontend run docs:check permanecem executáveis; dependências pelo lockfile. Referências puras de contratos em quality/fixtures/contratos-originais evitam alterar/hospedar o backend antigo. Somente caminhos de referência de três testes foram adaptados, sem alterar asserções. Scripts de manutenção/migração e evidências privadas não fazem parte desta release e permanecem preservados na cópiaJS, sem exclusão das fontes.

A homologação real anterior aprovou32 verificações de cliente/admin/financeiro/isolamento e dez do artefato. Três contas de teste e dois pedidos identificados já existem; a autoridade do admin sintético foi revogada. Não reativar usuários nem repetir pedidos/migração para publicar. Nesta ordem, Rules/índices/IAM/Auth e57 documentos comerciais não são alterados.

## Coordenação e verificação

Primeiro commit com prefixo [CF-Pages-Skip] sincroniza o frontend sem compilar a pasta demo antiga. Depois, ajustar apenas root/comando/saída e variáveis públicas do Pages. Publicar main por solicitação explícita ao Pages ou commit documental de ativação, conforme integração disponível. Preservar ac720402 como referência de produção anterior, sem executar rollback não solicitado.

Validação online pendente após o deploy:home/categorias/produtos, sessão anônima, login cliente, carrinho/prévia checkout sem criar pedido, histórico/detalhe existentes, admin protegido, rotas SPA e ausência de páginas provisórias. Resultado/deployment serão registrados aqui após a publicação.
