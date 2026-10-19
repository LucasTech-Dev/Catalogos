# Candidata Express completa — Render homologação

Fonte oficial: backend compartilhado do Catálogos, acompanhado das regressões em quality/backend. Esta candidata não altera a configuração Render nem autoriza publicação, IAM ou geração de credenciais.

Destino proposto: serviço existente catalogos-api-homolog, workspace Hobby, Node 24. Root backend; build npm ci --omit=dev --ignore-scripts; start npm start; health /. PORT vem do Render; servidor escuta 0.0.0.0. O painel e o artefato de rollback devem ser conferidos antes da migração.

Configuração pública completa: ../infra/render/bancorestaurante.full.backend.env.example. Modo full usa Firebase Admin SDK/Firestore; fixture pública preservada serve ao modo separado de demonstração/recuperação. Nenhuma chave acompanha esta branch.

Secret File futuro: firebase-homologacao.json, montado em /etc/secrets/firebase-homologacao.json. FIREBASE_CREDENTIAL_MODE=render-secret-file; GOOGLE_APPLICATION_CREDENTIALS só aceita esse caminho. O loader usa cert(), valida tipo/projeto/email, não reutiliza ADC pessoal e falha antes do listen quando a credencial falta ou é inválida. A instalação exige autorização própria: salvar Secret File no Render dispara deploy.

Nesta candidata, CATALOGOS_PUBLIC_CATALOG_LOJAS=[] mantém o catálogo público real bloqueado com HTTP503, sem leitura do banco. Preencher a lista exige aprovação de publicação dos dados. A migração pode interromper a vitrine até a liberação autorizada dos produtos; escolher janela curta e rollback elegível. Auth, roles, loja/titularidade e rotas privadas permanecem no backend. IAM e Admin SDK não isolam lojas automaticamente; Rules deny-all não limitam o servidor.

FIREBASE_STARTUP_CHECK=1, no modelo full, executa uma leitura de lojas/loja-demo antes de abrir HTTP. O bootstrap exige existência do documento e registra apenas firebase_conexao/status200, sem campos. Falha ou prazo excedido impede o listen com erro sanitizado. É uma leitura por inicialização, inclusive cold starts, não uma leitura por health check. Esse acesso somente leitura deve integrar a autorização da migração; não realiza escrita ou consulta de usuários Auth.

Testes focados, após instalar backend/package-lock.json, na raiz do repositório:

    node --require ./quality/register.cjs --test quality/backend/test/credencialHomologacao.test.js quality/backend/test/publicacaoCatalogo.test.js

A suíte backend completa permanece executável por npm test em backend/. Integrações com Emulator ficam em quality/backend/scripts e usam somente projetos demo controlados quando explicitamente executadas. Teste local não comprova publicação ou acesso real ao Firebase no Render.

Branch de destino autorizada para código: deploy/render-backend-full-homolog. Não trocar a branch do serviço, disparar deploy ou gerar chave antes dos gates e autorizações correspondentes. A criação de uma única chave já tem autorização condicional, ainda dependente da janela preparada. main e deploy/render-demo-readonly permanecem preservadas.
