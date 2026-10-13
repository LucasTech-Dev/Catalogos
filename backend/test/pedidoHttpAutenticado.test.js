const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const Module = require("node:module");
const { Readable, Writable } = require("node:stream");

const estado = {
  documentos: new Map(),
  pedidosCriados: [],
};

function chave(segmentos) {
  return segmentos.join("/");
}

function criarSnapshot(id, dados) {
  return {
    id,
    exists: dados !== undefined,
    data: () => dados,
  };
}

class DocumentoFake {
  constructor(segmentos) {
    this.segmentos = segmentos;
    this.id = segmentos[segmentos.length - 1];
  }

  collection(nome) {
    return new ColecaoFake([...this.segmentos, nome]);
  }

  async get() {
    const dados = estado.documentos.get(chave(this.segmentos));
    return criarSnapshot(this.id, dados);
  }

  async set(dados) {
    estado.documentos.set(chave(this.segmentos), dados);

    if (
      this.segmentos.length === 4 &&
      this.segmentos[0] === "lojas" &&
      this.segmentos[2] === "pedidos"
    ) {
      estado.pedidosCriados.push({
        id: this.id,
        caminho: chave(this.segmentos),
        dados,
      });
    }
  }

  async update(dados) {
    const dadosAtuais =
      estado.documentos.get(chave(this.segmentos)) || {};

    estado.documentos.set(chave(this.segmentos), {
      ...dadosAtuais,
      ...dados,
    });
  }
}

class ColecaoFake {
  constructor(segmentos) {
    this.segmentos = segmentos;
  }

  doc(id) {
    const docId =
      id ||
      `pedido-${String(estado.pedidosCriados.length + 1).padStart(
        3,
        "0"
      )}`;

    return new DocumentoFake([...this.segmentos, docId]);
  }

  orderBy() {
    return this;
  }

  async get() {
    const prefixo = `${chave(this.segmentos)}/`;
    const docs = [];

    for (const [caminho, dados] of estado.documentos.entries()) {
      if (
        caminho.startsWith(prefixo) &&
        caminho.slice(prefixo.length).includes("/") === false
      ) {
        docs.push(
          criarSnapshot(caminho.slice(prefixo.length), dados)
        );
      }
    }

    return { docs };
  }
}

const firestoreFake = {
  collection(nome) {
    return new ColecaoFake([nome]);
  },
};

const tokens = {
  "token-cliente": {
    uid: "cliente-1",
    email: "cliente@teste.local",
  },
  "token-admin": {
    uid: "admin-1",
    email: "admin@teste.local",
  },
  "token-sem-permissao": {
    uid: "sem-permissao-1",
    email: "sem-permissao@teste.local",
  },
  "token-outra-loja": {
    uid: "outra-loja-1",
    email: "outra-loja@teste.local",
  },
  "token-admin-outra-loja": {
    uid: "admin-outra-loja-1",
    email: "admin-outra-loja@teste.local",
  },
  "token-inativo": {
    uid: "inativo-1",
    email: "inativo@teste.local",
  },
};

const originalLoad = Module._load;

Module._load = function carregarMock(request, parent, isMain) {
  if (request === "firebase-admin/app") {
    return {
      initializeApp: () => ({}),
      applicationDefault: () => ({}),
      getApps: () => [{}],
    };
  }

  if (request === "firebase-admin/auth") {
    return {
      getAuth: () => ({
        verifyIdToken: async (token) => {
          const decoded = tokens[token];

          if (!decoded) {
            throw new Error("Token inválido.");
          }

          return decoded;
        },
      }),
    };
  }

  if (request === "firebase-admin/firestore") {
    return {
      getFirestore: () => firestoreFake,
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const app = require("../src/app");

function definirDocumento(caminho, dados) {
  estado.documentos.set(caminho, dados);
}

function prepararDadosBase() {
  estado.documentos.clear();
  estado.pedidosCriados.length = 0;

  definirDocumento("usuarios/cliente-1", {
    nome: "Cliente Teste",
    email: "cliente@teste.local",
    role: "cliente",
    lojaId: "loja-demo",
    ativo: true,
  });

  definirDocumento("usuarios/admin-1", {
    nome: "Admin Teste",
    email: "admin@teste.local",
    role: "admin",
    lojaId: "loja-demo",
    ativo: true,
  });

  definirDocumento("usuarios/sem-permissao-1", {
    nome: "Sem Permissao",
    email: "sem-permissao@teste.local",
    role: "operador",
    lojaId: "loja-demo",
    ativo: true,
  });

  definirDocumento("usuarios/outra-loja-1", {
    nome: "Outra Loja",
    email: "outra-loja@teste.local",
    role: "cliente",
    lojaId: "loja-outra",
    ativo: true,
  });

  definirDocumento("usuarios/admin-outra-loja-1", {
    nome: "Admin Outra Loja",
    email: "admin-outra-loja@teste.local",
    role: "admin",
    lojaId: "loja-outra",
    ativo: true,
  });

  definirDocumento("usuarios/inativo-1", {
    nome: "Usuario Inativo",
    email: "inativo@teste.local",
    role: "cliente",
    lojaId: "loja-demo",
    ativo: false,
  });

  definirDocumento("lojas/loja-demo", {
    nome: "Loja Demo",
    whatsapp: "(51) 99531-0123",
    pagamentos: {
      pix: true,
      dinheiro: true,
      cartao_credito: true,
      cartao_debito: true,
    },
  });

  definirDocumento(
    "lojas/loja-demo/clientes/cliente-abc/enderecos/endereco-1",
    {
      rua: "Rua Teste",
      numero: "123",
    }
  );

  definirDocumento("lojas/loja-demo/produtos/produto-ativo", {
    nome: "Burger Teste",
    preco: 20,
    ativo: true,
  });

  definirDocumento("lojas/loja-demo/produtos/produto-inativo", {
    nome: "Produto Inativo",
    preco: 15,
    ativo: false,
  });
}

function requisitarApp({ metodo, url, corpo, headers = {} }) {
  return new Promise((resolve) => {
    const body = corpo ? JSON.stringify(corpo) : "";
    const req = new Readable({
      read() {
        this.push(body);
        this.push(null);
      },
    });

    req.method = metodo;
    req.url = url;
    req.headers = {
      ...headers,
    };

    if (body) {
      req.headers["content-length"] = Buffer.byteLength(body);
    }

    const res = new http.ServerResponse(req);
    const chunks = [];
    const socket = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });

    res.assignSocket(socket);
    res.on("finish", () => {
      const raw = Buffer.concat(chunks).toString();
      const [, corpoResposta = ""] = raw.split("\r\n\r\n");

      resolve({
        status: res.statusCode,
        dados: corpoResposta ? JSON.parse(corpoResposta) : null,
      });
    });

    app.handle(req, res);
  });
}

async function requisitarPedido(corpo, token = "token-cliente") {
  const headers = {
    "content-type": "application/json",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return requisitarApp({
    metodo: "POST",
    url: "/lojas/loja-demo/pedidos",
    headers,
    corpo,
  });
}

async function atualizarPagamento(
  pedidoId,
  corpo,
  token = "token-admin"
) {
  const headers = {
    "content-type": "application/json",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return requisitarApp({
    metodo: "PATCH",
    url: `/lojas/loja-demo/pedidos/${pedidoId}/pagamento`,
    headers,
    corpo,
  });
}

async function atualizarPagamentosDaLoja(
  corpo,
  token = "token-admin"
) {
  const headers = {
    "content-type": "application/json",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return requisitarApp({
    metodo: "PATCH",
    url: "/lojas/loja-demo/pagamentos",
    headers,
    corpo,
  });
}

async function gerarWhatsapp(pedidoId, token = "token-cliente") {
  const headers = {};

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return requisitarApp({
    metodo: "GET",
    url: `/lojas/loja-demo/pedidos/${pedidoId}/whatsapp`,
    headers,
  });
}

function pedidoEntregaValido(sobrescritas = {}) {
  return {
    clienteId: "cliente-abc",
    enderecoId: "endereco-1",
    tipoEntrega: "entrega",
    taxaEntrega: 5,
    itens: [
      {
        produtoId: "produto-ativo",
        quantidade: 2,
        precoUnitario: 1,
      },
    ],
    pagamento: {
      forma: "pix",
    },
    ...sobrescritas,
  };
}

function definirPedidoExistente(id, dados = {}) {
  definirDocumento(`lojas/loja-demo/pedidos/${id}`, {
    lojaId: "loja-demo",
    clienteId: "cliente-abc",
    enderecoId: "endereco-1",
    tipoEntrega: "entrega",
    status: "recebido",
    itens: [
      {
        produtoId: "produto-ativo",
        nome: "Burger Teste",
        precoUnitario: 20,
        quantidade: 2,
        subtotal: 40,
      },
    ],
    subtotal: 40,
    taxaEntrega: 5,
    desconto: 0,
    total: 45,
    observacao: "Sem cebola",
    pagamento: {
      forma: "pix",
      status: "pendente",
      valor: 45,
    },
    ...dados,
  });
}

test("Etapa 16.4 - API HTTP autenticada de pedidos", async (t) => {
  await t.test("cria pedido com entrega e endereço válido", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(pedidoEntregaValido());

    assert.equal(resposta.status, 201);
    assert.equal(resposta.dados.total, 45);
    assert.equal(resposta.dados.subtotal, 40);
    assert.equal(resposta.dados.taxaEntrega, 5);
    assert.equal(resposta.dados.itens[0].precoUnitario, 20);
    assert.deepEqual(resposta.dados.pagamento, {
      forma: "pix",
      status: "pendente",
      valor: 45,
    });
    assert.equal(estado.pedidosCriados.length, 1);
  });

  await t.test("rejeita entrega sem endereço", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({ enderecoId: null })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /enderecoId é obrigatório/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("cria pedido para retirada sem endereço e taxa zero", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido({
        tipoEntrega: "retirada",
        taxaEntrega: 0,
        itens: [
          {
            produtoId: "produto-ativo",
            quantidade: 1,
          },
        ],
        pagamento: {
          forma: "pix",
        },
      });

    assert.equal(resposta.status, 201);
    assert.equal(resposta.dados.total, 20);
    assert.equal(resposta.dados.enderecoId, null);
    assert.equal(estado.pedidosCriados.length, 1);
  });

  await t.test("rejeita retirada com taxa indevida", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido({
      tipoEntrega: "retirada",
      taxaEntrega: 5,
      itens: [
        {
          produtoId: "produto-ativo",
          quantidade: 1,
        },
      ],
    });

    assert.equal(resposta.status, 400);
    assert.match(
      resposta.dados.error,
      /retirada não podem possuir taxa/
    );
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita tipo de entrega inválido", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({ tipoEntrega: "delivery" })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /Tipo de entrega inválido/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita requisição sem autenticação", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(pedidoEntregaValido(), null);

    assert.equal(resposta.status, 401);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita token inválido ou expirado", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido(),
      "token-invalido"
    );

    assert.equal(resposta.status, 401);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita usuário sem permissão", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido(),
      "token-sem-permissao"
    );

    assert.equal(resposta.status, 403);
    assert.match(resposta.dados.error, /não possui permissão/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita usuário vinculado a outra loja", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido(),
      "token-outra-loja"
    );

    assert.equal(resposta.status, 403);
    assert.match(resposta.dados.error, /não possui acesso/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita usuário inativo", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido(),
      "token-inativo"
    );

    assert.equal(resposta.status, 403);
    assert.match(resposta.dados.error, /desativado/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita produto inexistente", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        itens: [
          {
            produtoId: "produto-inexistente",
            quantidade: 1,
          },
        ],
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /não encontrado/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita produto indisponível", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        itens: [
          {
            produtoId: "produto-inativo",
            quantidade: 1,
          },
        ],
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /não está disponível/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita quantidade inválida", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        itens: [
          {
            produtoId: "produto-ativo",
            quantidade: 0,
          },
        ],
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /quantidade/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita endereço de outro cliente ou loja", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({ enderecoId: "endereco-outra-loja" })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /Endereço não encontrado/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("ignora preço enviado pelo frontend", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        itens: [
          {
            produtoId: "produto-ativo",
            quantidade: 2,
            precoUnitario: 0.01,
          },
        ],
      })
    );

    assert.equal(resposta.status, 201);
    assert.equal(resposta.dados.itens[0].precoUnitario, 20);
    assert.equal(resposta.dados.subtotal, 40);
    assert.equal(resposta.dados.total, 45);
    assert.equal(estado.pedidosCriados.length, 1);
  });

  await t.test("aceita pagamento em dinheiro", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "dinheiro",
        },
      })
    );

    assert.equal(resposta.status, 201);
    assert.equal(resposta.dados.pagamento.forma, "dinheiro");
    assert.equal(resposta.dados.pagamento.status, "pendente");
  });

  await t.test("aceita cartão de crédito", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "cartao_credito",
        },
      })
    );

    assert.equal(resposta.status, 201);
    assert.equal(resposta.dados.pagamento.forma, "cartao_credito");
  });

  await t.test("aceita cartão de débito", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "cartao_debito",
        },
      })
    );

    assert.equal(resposta.status, 201);
    assert.equal(resposta.dados.pagamento.forma, "cartao_debito");
  });

  await t.test("rejeita método de pagamento inválido", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "vale-refeicao",
        },
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /Forma de pagamento inválida/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita método de pagamento desabilitado", async () => {
    prepararDadosBase();
    definirDocumento("lojas/loja-demo", {
      nome: "Loja Demo",
      pagamentos: {
        pix: true,
        dinheiro: false,
        cartao_credito: false,
        cartao_debito: false,
      },
    });

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "dinheiro",
        },
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /não está habilitada/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita valor de pagamento manipulado", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "pix",
          valor: 1,
        },
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /Valor de pagamento divergente/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita confirmação de pagamento pelo cliente", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "pix",
          status: "confirmado",
        },
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /cliente não pode confirmar/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("rejeita dados sensíveis de cartão", async () => {
    prepararDadosBase();

    const resposta = await requisitarPedido(
      pedidoEntregaValido({
        pagamento: {
          forma: "cartao_credito",
          numeroCartao: "nao-deve-ser-armazenado",
          cvv: "nao-deve-ser-armazenado",
        },
      })
    );

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /Dados sensíveis/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("confirma pagamento com admin autorizado", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const resposta = await atualizarPagamento("pedido-1", {
      status: "confirmado",
    });

    assert.equal(resposta.status, 200);
    assert.equal(resposta.dados.pagamento.status, "confirmado");
    assert.equal(resposta.dados.pagamento.valor, 45);
  });

  await t.test("rejeita atualização de pagamento por cliente", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const resposta = await atualizarPagamento(
      "pedido-1",
      {
        status: "confirmado",
      },
      "token-cliente"
    );

    assert.equal(resposta.status, 403);
    assert.match(resposta.dados.error, /não possui permissão/);
  });

  await t.test("rejeita admin de outra loja", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const resposta = await atualizarPagamento(
      "pedido-1",
      {
        status: "confirmado",
      },
      "token-admin-outra-loja"
    );

    assert.equal(resposta.status, 403);
    assert.match(resposta.dados.error, /não possui acesso/);
  });

  await t.test("rejeita atualização de pagamento sem autenticação", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const resposta = await atualizarPagamento(
      "pedido-1",
      {
        status: "confirmado",
      },
      null
    );

    assert.equal(resposta.status, 401);
  });

  await t.test("rejeita transição inválida de pagamento", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1", {
      pagamento: {
        forma: "pix",
        status: "confirmado",
        valor: 45,
      },
    });

    const resposta = await atualizarPagamento("pedido-1", {
      status: "recusado",
    });

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /Não é permitido/);
  });

  await t.test("rejeita pagamento de pedido cancelado", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1", {
      status: "cancelado",
    });

    const resposta = await atualizarPagamento("pedido-1", {
      status: "confirmado",
    });

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /pedido cancelado/);
  });

  await t.test("atualiza formas de pagamento da loja com admin", async () => {
    prepararDadosBase();

    const resposta = await atualizarPagamentosDaLoja({
      pix: true,
      dinheiro: false,
      cartao_credito: true,
      cartao_debito: false,
    });

    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.dados.pagamentos, {
      pix: true,
      dinheiro: false,
      cartao_credito: true,
      cartao_debito: false,
    });
  });

  await t.test("rejeita configuração de pagamentos por cliente", async () => {
    prepararDadosBase();

    const resposta = await atualizarPagamentosDaLoja(
      {
        pix: true,
        dinheiro: true,
        cartao_credito: true,
        cartao_debito: true,
      },
      "token-cliente"
    );

    assert.equal(resposta.status, 403);
  });

  await t.test("gera URL WhatsApp para pedido com um produto e entrega", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const resposta = await gerarWhatsapp("pedido-1");

    assert.equal(resposta.status, 200);
    assert.equal(resposta.dados.numero, "5551995310123");
    assert.match(resposta.dados.url, /^https:\/\/wa\.me\/5551995310123\?text=/);
    assert.match(resposta.dados.mensagem, /pedido #pedido-1/);
    assert.match(resposta.dados.mensagem, /Burger Teste/);
    assert.match(resposta.dados.mensagem, /R\$\s*45,00/);
    assert.match(resposta.dados.mensagem, /Endereço: Rua Teste, 123/);
    assert.match(resposta.dados.mensagem, /Pagamento: PIX/);
    assert.match(resposta.dados.observacao, /não confirma pedido/);
    assert.equal(estado.pedidosCriados.length, 0);
  });

  await t.test("gera mensagem WhatsApp com vários produtos e caracteres especiais", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-2", {
      itens: [
        {
          produtoId: "produto-ativo",
          nome: "Açaí & Granola",
          precoUnitario: 18.5,
          quantidade: 1,
          subtotal: 18.5,
        },
        {
          produtoId: "bebida-1",
          nome: "Suco de limão",
          precoUnitario: 7,
          quantidade: 2,
          subtotal: 14,
        },
      ],
      subtotal: 32.5,
      taxaEntrega: 5,
      total: 37.5,
      observacao: "Troco para R$ 50,00 & sem canudo",
      pagamento: {
        forma: "dinheiro",
        status: "pendente",
        valor: 37.5,
      },
    });

    const resposta = await gerarWhatsapp("pedido-2");

    assert.equal(resposta.status, 200);
    assert.match(resposta.dados.mensagem, /Açaí & Granola/);
    assert.match(resposta.dados.mensagem, /Suco de limão/);
    assert.match(resposta.dados.mensagem, /R\$\s*37,50/);
    assert.match(resposta.dados.mensagem, /Dinheiro/);
    assert.match(resposta.dados.url, /A%C3%A7a%C3%AD/);
    assert.match(resposta.dados.url, /%26/);
  });

  await t.test("gera WhatsApp para retirada sem endereço", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-retirada", {
      enderecoId: null,
      tipoEntrega: "retirada",
      taxaEntrega: 0,
      subtotal: 40,
      total: 40,
      pagamento: {
        forma: "cartao_debito",
        status: "pendente",
        valor: 40,
      },
    });

    const resposta = await gerarWhatsapp("pedido-retirada");

    assert.equal(resposta.status, 200);
    assert.match(resposta.dados.mensagem, /Tipo: Retirada/);
    assert.doesNotMatch(resposta.dados.mensagem, /Endereço:/);
    assert.match(resposta.dados.mensagem, /Cartão de débito/);
  });

  await t.test("rejeita WhatsApp ausente ou inválido na loja", async () => {
    prepararDadosBase();
    definirDocumento("lojas/loja-demo", {
      nome: "Loja Demo",
      whatsapp: "abc",
      pagamentos: {
        pix: true,
        dinheiro: true,
        cartao_credito: true,
        cartao_debito: true,
      },
    });
    definirPedidoExistente("pedido-1");

    const resposta = await gerarWhatsapp("pedido-1");

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /WhatsApp da loja/);
  });

  await t.test("rejeita WhatsApp de pedido de outra loja", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const resposta = await gerarWhatsapp(
      "pedido-1",
      "token-outra-loja"
    );

    assert.equal(resposta.status, 403);
    assert.match(resposta.dados.error, /não possui acesso/);
  });

  await t.test("retorna 404 para WhatsApp de pedido inexistente", async () => {
    prepararDadosBase();

    const resposta = await gerarWhatsapp("pedido-inexistente");

    assert.equal(resposta.status, 404);
  });

  await t.test("rejeita WhatsApp para pedido com status incompatível", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-cancelado", {
      status: "cancelado",
    });

    const resposta = await gerarWhatsapp("pedido-cancelado");

    assert.equal(resposta.status, 400);
    assert.match(resposta.dados.error, /não pode ser finalizado/);
  });

  await t.test("repetir geração de WhatsApp não duplica pedido nem confirma pagamento", async () => {
    prepararDadosBase();
    definirPedidoExistente("pedido-1");

    const primeira = await gerarWhatsapp("pedido-1");
    const segunda = await gerarWhatsapp("pedido-1");
    const pedidoSnapshot = await firestoreFake
      .collection("lojas")
      .doc("loja-demo")
      .collection("pedidos")
      .doc("pedido-1")
      .get();

    assert.equal(primeira.status, 200);
    assert.equal(segunda.status, 200);
    assert.equal(primeira.dados.url, segunda.dados.url);
    assert.equal(estado.pedidosCriados.length, 0);
    assert.equal(pedidoSnapshot.data().status, "recebido");
    assert.equal(pedidoSnapshot.data().pagamento.status, "pendente");
  });
});
