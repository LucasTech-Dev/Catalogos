# Catálogos — Ordem 04: criação controlada do projeto Firebase

> Decisão posterior vigente: preparar bancorestaurante, sem projeto/banco novo. Roteiro anterior preservado como histórico; consultar [PREPARACAO_RENDER_BANCORESTAURANTE.md](PREPARACAO_RENDER_BANCORESTAURANTE.md).

15/10/2026, America/Sao_Paulo. Preparação local da Ordem 03 aprovada documentalmente com ressalvas pelo proprietário, sem inspeção independente declarada. Esta ordem orienta o proprietário a criar somente o projeto vazio pelo Console. **Projeto ainda não confirmado como criado; ID efetivo e plano real pendentes.** Não avançar para Firestore, Authentication, credenciais, dados, Render ou publicação.

## Verificação local

Lidos FIREBASE_HOMOLOGACAO_RENDER.md e recibo evidencias-ordem03/resumo.json. Git interno main em 19b554d, oito commits à frente da referência origin/main local, com mudanças históricas e novas não commitadas. Nenhuma alteração descartada. git diff --check aprovado. Testes anteriores informados: backend 334, React 80, infra quatro, build e Emulator 19–23 aprovados; não reexecutados nesta ordem documental. Não foi realizada nova auditoria independente de todo o código nem consulta à branch remota.

## ID proposto e limites da verificação

Nome Catálogos Homologação; ID catalogos-homolog-2026. Tentativa somente leitura: gcloud projects describe catalogos-homolog-2026 --format='value(projectId,lifecycleState)' --quiet. Processo terminou com código 120, sem saída ou diagnóstico. Resultado inconclusivo: não confirma existência, ausência ou disponibilidade global. Nenhuma tentativa de criação por CLI/API foi executada. Acesso à sessão autenticada do Console não está disponível pelas ferramentas desta conversa.

Verificar o campo ID no formulário Firebase antes de confirmar criação. Não confundir um projeto ausente da lista acessível com ID globalmente livre; ID é único e imutável após criação. Se indisponível, interromper e apresentar alternativa para aprovação, pois exemplos/guardas dependem do ID aprovado. [Identificadores Firebase](https://firebase.google.com/docs/projects/learn-more#the-project-id).

## Plano e regiões: consulta oficial

Spark é suficiente para esta primeira fase de projeto vazio; não exige informação de pagamento. Não vincular Cloud Billing ou teste gratuito Cloud com billing: associação muda para Blaze. [Planos Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

Para fase futura, Firestore oferece uma base elegível por projeto com 1 GiB, 50 mil leituras/dia, 20 mil escritas/dia, 20 mil exclusões/dia e 10 GiB de saída/mês. Acima das cotas ou para recursos como backups/PITR/TTL/restore/clone, precisa de faturamento conforme recurso; não habilitar agora. Não há indicação na cota oficial de exigência de região dos EUA para a franquia. [Cotas](https://firebase.google.com/docs/firestore/quotas). Spark não é promessa de cobrir toda infraestrutura futura.

| Candidata para banco futuro Standard/Native | Situação documentada | Avaliação posterior |
| --- | --- | --- |
| southamerica-east1 — São Paulo | Região Firestore suportada | Proximidade geográfica com Brasil; medir caminho real via API Render |
| us-east4 — Northern Virginia | Região Firestore suportada | Coerência geográfica com Render Virginia proposto; não significa mesmo datacenter/rede |

Região ainda não escolhida. Proximidade de usuários não basta: navegador chama API e é a API que consulta Firestore. Comparar latência API→banco e tarifas de operações/armazenamento/saída se ultrapassar franquia, antes de qualquer escolha. Nenhuma cotação total ou desempenho real comprovado. [Localizações](https://firebase.google.com/docs/firestore/locations), [preços por localização](https://firebase.google.com/docs/firestore/pricing). Localização do banco não muda após provisionamento; App Engine/recursos antigos podem fixar localização padrão. Não provisionar esses recursos nem escolher localização de dados padrão incidentalmente nesta ordem.

## Procedimento para o proprietário — somente projeto vazio

1. Abrir https://console.firebase.google.com/ na conta proprietária e clicar em **Criar um projeto** ou **Adicionar projeto**. Criar projeto novo; não escolher adicionar Firebase a um projeto existente.
2. Informar nome **Catálogos Homologação**. Editar o ID gerado automaticamente para **catalogos-homolog-2026** e aguardar validação. Se o Console indicar indisponibilidade, parar sem criar com outro ID automaticamente. Conferir organização/pasta se essas opções aparecerem.
3. Revisar e aceitar os termos aplicáveis como proprietário. Desativar Google Analytics nesta etapa. Se oferecida assistência Gemini ou integrações opcionais, deixar desativadas. Não registrar app Web nem ativar produtos.
4. Manter **Spark**, sem associar conta de faturamento/cartão ou aceitar upgrade Blaze. Se houver exigência de billing ou seleção inesperada de localização para dados padrão, parar e registrar a tela/opções antes de confirmar; não escolher às cegas.
5. Conferir nome e ID e clicar em **Criar projeto**. A plataforma provisiona recursos/APIs básicos próprios do Firebase: projeto vazio significa sem produtos/dados configurados por nós, não literalmente sem recursos internos Google. Não criar manualmente service account ou chave.
6. Quando terminar, clicar em **Continuar** para a visão geral. Abrir engrenagem → **Configurações do projeto → Geral**; conferir nome e copiar o **ID do projeto** exibido. Número do projeto pode ser registrado opcionalmente; não enviar tokens, senhas ou JSON.
7. Conferir **Uso e faturamento → Detalhes e configurações** ou indicador de plano da interface: deve constar **Spark**. Apenas visualizar; não clicar em modificar plano.
8. **Parar.** Não clicar em Criar banco, começar Authentication, adicionar app, gerar chave, ativar Storage/Functions ou vincular Render. Não rodar firebase init/deploy ou alterar .firebaserc nesta etapa.

Base do fluxo: [criação pelo Firebase Console](https://firebase.google.com/docs/web/setup#console). Organização/políticas/quota de projetos da conta podem impedir criação; se isso ocorrer, registrar o impedimento sem habilitar faturamento ou ampliar IAM.

## Estado a confirmar após criação

| Item | Estado nesta entrega | Evidência necessária |
| --- | --- | --- |
| Nome e ID efetivos | Propostos, não confirmados | Configurações do projeto → Geral |
| Disponibilidade do ID | Não confirmada | Validação do formulário e criação concluída |
| Plano Spark | Adequado para esta fase, estado da conta pendente | Indicador de plano do projeto novo |
| Firestore e localização | Não criados/escolhidos por esta ordem | Manter sem banco; decisão posterior |
| Authentication e usuários | Não habilitados/criados por esta ordem | Manter sem configuração |
| Service account/chave próprias da API | Não criadas | Nenhuma ação manual de identidade nesta fase |
| bancorestaurante | Não consultado ou modificado nesta ordem | Limite preservado |
| Render, push, deploy e Cloudflare | Nenhuma operação | Fora do escopo |

Aguardar o proprietário informar o ID efetivo e o plano após a criação para confirmar o estado inicial. Não declarar criado com base apenas na proposta. Permanecem 25 ressalvas, 16 abertas, nove resolvidas localmente; sistema não liberado para vendas. Nenhuma ressalva encerrada nesta ordem.
