# Guia Mestre

## Estado do projeto

### Front-end publico

Status: concluido por enquanto.

Inclui a interface publica do catalogo, fluxo visual do cliente, login, cadastro, perfil, dados pessoais, pedidos, detalhes do pedido, enderecos, carrinho, checkout e paginas principais do catalogo.

### Front-end ADM

Status: concluido por enquanto.

Inclui AdminLayout, AdminHeader, AdminSidebar, Dashboard, Pedidos, Detalhes do pedido, Produtos, Criar/Editar produto, Categorias, Clientes e Configuracoes.

Arquitetura registrada nesta etapa:

- separacao entre rotas publicas e `/admin`;
- layout administrativo proprio;
- navegacao administrativa;
- responsividade do painel;
- telas com dados mockados.

### Refinamento visual global

Status: concluido.

Foi concluida a melhoria visual global de contraste e hierarquia:

- fundo geral levemente acinzentado;
- superficies de conteudo brancas;
- bordas sutis;
- sombras discretas;
- inputs, selects e textareas mais distinguiveis;
- textos primarios, secundarios e auxiliares com hierarquia mais clara.

### Validacao

Build validado com sucesso:

```bash
npm run build
```

Commit realizado nesta etapa:

```text
feat(frontend): conclui interface publica e painel administrativo
```

### Proximas etapas

1. Firestore passa a ser a proxima etapa.
2. Backend continua depois do Firestore.
3. Nada do Firestore deve ser marcado como concluido antes de ser implementado e validado.

### Limites atuais

- dados ainda mockados;
- autenticacao real ainda nao integrada;
- persistencia ainda nao integrada;
- Firestore ainda nao integrado;
- backend ainda nao implementado nesta fase.
