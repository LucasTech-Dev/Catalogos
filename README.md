# Catálogos — estado técnico atual

Revisão14/10/2026,Etapa26. Plataforma de catálogo/pedidos para negócios alimentícios. **Implementação validada localmente; lançamento comercial NO-GO.** Não houve implantação real.

## Funcionamento implementado

React/Vite em demo/src consulta API Expressbackend/src comFirebase Auth/Firestore/Admin SDK. Catálogo público, filtros/detalhes/carrinho,checkout entrega/retirada comcadastro opcional/sessãoanônima,idempotência epreçoscalculados pelo backend. Perfil/endereço/histórico próprios,financeiroinformativo/URL WhatsApp eadminloja/dashboard/CRUD/configurações. Semgateway/superadminglobal/variantes/adicionais/estoque/upload/cupons ouonboardingautomático.

Somente rolescliente/admin,escopoloja/titularidade,RulesdenySDK direto. Auth/token/entrada/erro/concorrência/PII são tratados naAPI. URLWhatsApp não envia/nãocomprova pagamento. InfraPages+CloudRun/sharedFirebase por ambiente é proposta 25,pendente. Docker/CI/limites/configurações são preparação local.

## Começar com segurança

Node 24.19.0,Java 21,FirebaseCLI 15.32.0 eChrome paraharness. npmci embackend e demo. Usar somente projeto demo/Emulator para testes;API 3000,Firestore 8080,Auth 9099,Vite 5173. Exemplos development/test corrigidos para não colidir3000/8080. Nenhum.env privado/contaAdmin nofrontend.

[Manual de desenvolvimento](docs/MANUAL_DESENVOLVIMENTO.md) contém comandos,pontos de configuração e diagnóstico. Backendnpmtest325/React79/infra3,suite25reexecutada na26com12Chrome/200HTTP;build1.624módulos. Números heterogêneos não somados; evidências 26 registram execuções reais e limitações.

## Documentação atual

- [Arquitetura do código e proposta](docs/ARQUITETURA_DEFINITIVA.md)
- [Referência43contratosAPI](docs/REFERENCIA_API.md)
- [ModeloFirestore](docs/MODELO_FIRESTORE.md)
- [Desenvolvimento](docs/MANUAL_DESENVOLVIMENTO.md)
- [Personalização/cliente](docs/MANUAL_PERSONALIZACAO_CLIENTE.md)
- [Administração](docs/MANUAL_ADMINISTRADOR.md)
- [Manutenção](docs/MANUAL_MANUTENCAO.md)
- [Implantação futura](docs/MANUAL_IMPLANTACAO.md)
- [Decisõespendentes](docs/DECISOES_PENDENTES.md)
- [Piloto eGO/NO-GO](docs/PLANO_DE_HOMOLOGACAO_COMERCIAL.md)
- [Auditoriafinal26](docs/ETAPA_26_AUDITORIA_FINAL.md)
- [Inventárioexterno](docs/ETAPA_26_INVENTARIO_DOCUMENTACAO_EXTERNA.md)
- [Divergências/correções](docs/ETAPA_26_DIVERGENCIAS_DOCUMENTAIS.md)
- [Relatório26](docs/ETAPA_26_RELATORIO_FINAL.md)
- [Registro permanentederessalvas](docs/RESSALVAS_E_PENDENCIAS_PRODUCAO.md)

## Histórico e confidencialidade

GUIA_MESTRE/REGISTRO_DE_TRABALHO e relatórios 19–25 são registros históricos comdata/escopo, não prova de implantação. A pasta externa foi inventariada/revisada;backupprivado foraGit,preços históricos eoriginais preservados. Snapshot Repomix contém 29 entradas.git e 42 diferenças; não executar/redistribuir como código atual. ZIP é arquivo da 25,documentação atual 26 está noTXT/índice. Credenciais externasnão publicadas ou usadas emserviço real.

R-001–023 mantidos; R-024/equipe eR-025/credenciaistexto novos,25ressalvas/17abertas/8resolvidaslocais. Implantação depende deaprovação específica e todosgatesobrigatórios;não fazerpush/deploy nem configurarreal comoefeito desteREADME.
