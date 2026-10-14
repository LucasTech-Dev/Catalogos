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

  async delete() {estado.documentos.delete(chave(this.segmentos));}

  async update(dados) {
    const dadosAtuais =
      estado.documentos.get(chave(this.segmentos)) || {};

    estado.documentos.set(chave(this.segmentos), {
      ...dadosAtuais,
      ...dados,
    });
  }
}

function campo(dados,nome) {return nome.split('.').reduce((v,k)=>v?.[k],dados);}
class ColecaoFake {
  constructor(segmentos,opcoes={}) {this.segmentos=segmentos;this.opcoes=opcoes;}
  doc(id) {return new DocumentoFake([...this.segmentos,id || require('node:crypto').randomUUID()]);}
  copiar(dados) {return new ColecaoFake(this.segmentos,{...this.opcoes,...dados});}
  where(nome,operador,valor) {return this.copiar({filtros:[...(this.opcoes.filtros || []),{nome,operador,valor}]});}
  orderBy(nome,direcao='asc') {return this.copiar({ordem:[...(this.opcoes.ordem || []),{nome,direcao}]});}
  limit(valor) {return this.copiar({limite:valor});}
  startAfter(doc) {return this.copiar({cursor:doc});}
  count() {return {get:async()=>({data:()=>({count:this.consultar().length})})};}
  aggregate(campos) {return {get:async()=>({data:()=>Object.fromEntries(Object.entries(campos).map(([nome,op])=>[nome,this.consultar().reduce((s,d)=>s+(Number(campo(d.data(),op.campo)) || 0),0)]))})};}
  consultar() {
    const prefixo=chave(this.segmentos)+'/';let docs=[];
    for(const [caminho,dados] of estado.documentos) {
      if(!caminho.startsWith(prefixo) || caminho.slice(prefixo.length).includes('/'))continue;
      if(!(this.opcoes.filtros || []).every(({nome,operador,valor})=>{const v=campo(dados,nome);if(operador==='==')return v===valor;if(operador==='!=')return v!==undefined&&v!==valor;if(operador==='>=')return v>=valor;if(operador==='<')return v<valor;throw new Error('Operador fake não suportado.');}))continue;
      docs.push(criarSnapshot(caminho.slice(prefixo.length),dados));
    }
    const comparar=(a,b)=>{for(const {nome,direcao} of this.opcoes.ordem || []) {const av=nome==='__name__'?a.id:campo(a.data(),nome),bv=nome==='__name__'?b.id:campo(b.data(),nome);if(av<bv)return direcao==='desc'?1:-1;if(av>bv)return direcao==='desc'?-1:1;}return a.id.localeCompare(b.id);};
    docs.sort(comparar);
    if(this.opcoes.cursor)docs=docs.filter(d=>comparar(d,this.opcoes.cursor)>0);
    return docs.slice(0,this.opcoes.limite ?? Infinity);
  }
  async get() {const docs=this.consultar();return {docs,empty:!docs.length,size:docs.length};}
}

const firestoreFake = {
  async runTransaction(fn) {return fn({get:ref => ref.get(),set:(ref,dados) => ref.set(dados),update:(ref,dados) => ref.update(dados),delete:ref => ref.delete()});},
  collection(nome) {
    return new ColecaoFake([nome]);
  },
};

const tokens = {
  "token-convidado": {uid:"convidado-1",firebase:{sign_in_provider:"anonymous"}},
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
          if(estado.falhaAuth)throw estado.falhaAuth;
          const decoded = tokens[token];

          if (!decoded) {
            throw Object.assign(new Error("Token inválido."),{code:"auth/argument-error"});
          }

          return decoded;
        },
      }),
    };
  }

  if (request === "firebase-admin/firestore") {
    return {
      getFirestore: () => firestoreFake,
      AggregateField: {sum:campo=>({campo})},
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
    entrega: {habilitada:true, taxa:5},
    pagamentos: {
      pix: true,
      dinheiro: true,
      cartao_credito: true,
      cartao_debito: true,
    },
  });

  definirDocumento(
    "lojas/loja-demo/clientes/cliente-1/enderecos/endereco-1",
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

function requisitarApp({ metodo, url, corpo, corpoRaw, headers = {} }) {
  return new Promise((resolve) => {
    const body = corpoRaw !== undefined ? corpoRaw : corpo !== undefined ? JSON.stringify(corpo) : "";
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
        requestId:res.getHeader('X-Request-ID'),
        dados: corpoResposta ? JSON.parse(corpoResposta) : null,
      });
    });

    app.handle(req, res);
  });
}

async function requisitarPedido(corpo, token = "token-cliente") {
  const headers = {
    "idempotency-key": require("node:crypto").randomUUID(),
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
    clienteId: "cliente-1",
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
    clienteId: "cliente-1",
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
      entrega: {habilitada:true,taxa:5},
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

test('Etapa 19 — catálogo, convidados e isolamento', async t => {
  const get = (url,token = 'token-cliente') => requisitarApp({metodo:'GET',url,headers:token ? {authorization:`Bearer ${token}`} : {}});
  const post = (corpo, token = 'token-convidado', chave = 'etapa19-chave-0001') => requisitarApp({metodo:'POST',url:'/lojas/loja-demo/pedidos',corpo,headers:{'content-type':'application/json',authorization:`Bearer ${token}`,'idempotency-key':chave}});
  await t.test('catálogo público usa listas reais e não expõe campos privados', async() => {
    prepararDadosBase();
    const loja = estado.documentos.get('lojas/loja-demo');loja.chavePrivada = 'segredo';
    definirDocumento('lojas/loja-demo/categorias/burgers',{nome:'Burgers',ativo:true,segredo:'interno'});
    const resposta = await get('/publico/lojas/loja-demo/catalogo',null);
    assert.equal(resposta.status,200);assert.equal(resposta.dados.produtos.length,1);assert.equal(resposta.dados.categorias[0].nome,'Burgers');
    assert.equal(resposta.dados.loja.chavePrivada,undefined);assert.equal(resposta.dados.categorias[0].segredo,undefined);
  });
  await t.test('cliente lista somente pedidos próprios e admin mantém visão da loja', async() => {
    prepararDadosBase();definirPedidoExistente('meu');definirPedidoExistente('outro',{clienteId:'outro-cliente'});
    assert.deepEqual((await get('/lojas/loja-demo/pedidos')).dados.map(p => p.id),['meu']);
    assert.equal((await get('/lojas/loja-demo/pedidos','token-admin')).dados.length,2);
  });
  await t.test('consulta por ID e WhatsApp não revelam pedido alheio', async() => {
    prepararDadosBase();definirPedidoExistente('alheio',{clienteId:'outro-cliente'});
    assert.equal((await get('/lojas/loja-demo/pedidos/alheio')).status,404);
    assert.equal((await get('/lojas/loja-demo/pedidos/alheio/whatsapp')).status,404);
    assert.equal((await get('/lojas/loja-demo/pedidos/alheio','token-admin')).status,200);
  });
  await t.test('endereços e clientes privados são protegidos', async() => {
    prepararDadosBase();
    assert.equal((await get('/lojas/loja-demo/clientes')).status,403);
    assert.equal((await get('/lojas/loja-demo/clientes/alheio')).status,403);
    assert.equal((await get('/lojas/loja-demo/clientes/alheio/enderecos')).status,403);
    assert.equal((await get('/lojas/loja-demo/clientes/alheio/enderecos/id')).status,403);
    assert.equal((await get('/publico/lojas/loja-demo/me/enderecos',null)).status,401);
  });
  await t.test('convidado usa UID validado, pagamento pendente e nunca é admin', async() => {
    prepararDadosBase();assert.equal((await post({tipoEntrega:'retirada',role:'admin',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'pix'}})).status,400);assert.equal(estado.pedidosCriados.length,0);const resposta = await post({tipoEntrega:'retirada',clienteId:'cliente-1',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'pix'}});
    assert.equal(resposta.status,201);assert.equal(resposta.dados.clienteId,'convidado-1');assert.equal(resposta.dados.total,20);assert.equal(resposta.dados.pagamento.status,'pendente');
    assert.equal((await get('/lojas/loja-demo/pedidos/'+resposta.dados.id,'token-cliente')).status,404);
    assert.equal((await get('/lojas/loja-demo/pedidos/'+resposta.dados.id+'/whatsapp','token-convidado')).status,200);
    const admin = await requisitarApp({metodo:'PATCH',url:'/lojas/loja-demo/pedidos/'+resposta.dados.id+'/pagamento',corpo:{status:'confirmado'},headers:{'content-type':'application/json',authorization:'Bearer token-convidado'}});
    assert.equal(admin.status,403);
  });
  await t.test('taxa de entrega confiável e desconto do cliente bloqueado', async() => {
    prepararDadosBase();const resposta = await post(pedidoEntregaValido({taxaEntrega:0}),'token-cliente');
    assert.equal(resposta.status,201);assert.equal(resposta.dados.total,45);
    const desconto = await post(pedidoEntregaValido({desconto:10}),'token-cliente','etapa19-chave-0002');assert.equal(desconto.status,400);
  });
  await t.test('repetição após falha não duplica e preserva pedido com produto agora indisponível', async() => {
    prepararDadosBase();const corpo = {tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'dinheiro'}};
    const primeira = await post(corpo);assert.equal(primeira.status,201);
    estado.documentos.get('lojas/loja-demo/produtos/produto-ativo').ativo = false;
    const segunda = await post(corpo);assert.equal(segunda.status,201);assert.equal(segunda.dados.id,primeira.dados.id);assert.equal(estado.pedidosCriados.length,1);
    assert.equal((await post({...corpo,observacao:'mudou'})).status,409);
  });
  await t.test('convidado sem chave e com quantidade excessiva é rejeitado', async() => {
    prepararDadosBase();const corpo = {tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:100}],pagamento:{forma:'pix'}};
    assert.equal((await post(corpo)).status,400);
    assert.equal((await post({...corpo,itens:[{produtoId:'produto-ativo',quantidade:1}]},'token-convidado','')).status,400);
  });
  await t.test('CORS aceita somente origens explícitas', async() => {
    prepararDadosBase();
    assert.equal((await requisitarApp({metodo:'OPTIONS',url:'/publico/lojas/loja-demo/catalogo',headers:{origin:'https://site-malicioso.local'}})).status,403);
    assert.equal((await requisitarApp({metodo:'OPTIONS',url:'/publico/lojas/loja-demo/catalogo',headers:{origin:'http://localhost:5173'}})).status,204);
  });
});


test('Etapa 19 — validação de dados próprios', async () => {
  prepararDadosBase();
  const headers = {'content-type':'application/json',authorization:'Bearer token-cliente'};
  const perfil = await requisitarApp({metodo:'GET',url:'/publico/lojas/loja-demo/me',headers});
  assert.equal(perfil.status,200);assert.equal(perfil.dados.nome,'Cliente Teste');assert.equal(perfil.dados.role,undefined);
  const telefone = await requisitarApp({metodo:'PUT',url:'/publico/lojas/loja-demo/me',headers,corpo:{nome:'Cliente',telefone:'(          )'}});
  assert.equal(telefone.status,400);
  const endereco = await requisitarApp({metodo:'POST',url:'/publico/lojas/loja-demo/me/enderecos',headers,corpo:{rua:'Rua',numero:'10',bairro:'Centro',cidade:'Cidade',uf:'estado'}});
  assert.equal(endereco.status,400);
});

test('Etapa 20 — API administrativa autenticada (Firestore/Auth simulados)',async t=>{
  const base='/admin/lojas/loja-demo';
  const req=(metodo,url,corpo,token='token-admin')=>requisitarApp({metodo,url,corpo,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})}});
  const preparar=()=>{prepararDadosBase();definirDocumento('lojas/loja-demo/categorias/cat',{nome:'Categoria real',ativo:true});};
  await t.test('todas as operações novas bloqueiam cliente, anônimo e admin de outra loja',async()=>{
    preparar();
    const rotas=[['GET','/sessao'],['GET','/dashboard'],['GET','/loja'],['PATCH','/loja'],['GET','/produtos'],['POST','/produtos'],['GET','/produtos/id'],['PATCH','/produtos/id'],['DELETE','/produtos/id'],['GET','/categorias'],['POST','/categorias'],['GET','/categorias/id'],['PATCH','/categorias/id'],['DELETE','/categorias/id'],['GET','/clientes'],['GET','/clientes/id'],['GET','/pedidos/id']];
    for(const [method,path] of rotas)for(const token of ['token-cliente','token-convidado','token-admin-outra-loja'])assert.equal((await req(method,base+path,undefined,token)).status,403,method+path+token);
    assert.equal((await req('GET',base+'/sessao',undefined,null)).status,401);
    assert.equal((await req('GET',base+'/sessao',undefined,'revogado')).status,401);
    const sessao=await req('GET',base+'/sessao');assert.equal(sessao.status,200);assert.equal(sessao.dados.role,'admin');assert.equal(sessao.dados.lojaId,'loja-demo');
  });
  await t.test('produto CRUD valida preço/categoria e desativa preservando documento',async()=>{
    preparar();
    const body={nome:'Produto admin',preco:19.5,categoriaId:'cat',ativo:true,disponivel:true};
    const criado=await req('POST',base+'/produtos',body);assert.equal(criado.status,201);
    const editado=await req('PATCH',base+'/produtos/'+criado.dados.id,{preco:25,disponivel:false});assert.equal(editado.status,200);assert.equal(editado.dados.preco,25);assert.equal(editado.dados.disponivel,false);
    assert.equal((await req('POST',base+'/produtos',{...body,preco:-1})).status,400);
    assert.equal((await req('POST',base+'/produtos',{...body,categoriaId:'inexistente'})).status,400);
    assert.equal((await req('PATCH',base+'/produtos/'+criado.dados.id,{lojaId:'outra',role:'admin'})).status,400);
    const removido=await req('DELETE',base+'/produtos/'+criado.dados.id);assert.equal(removido.status,200);assert.equal(removido.dados.ativo,false);
    assert.equal((await req('GET',base+'/produtos/'+criado.dados.id)).status,200);
  });
  await t.test('paginação e categoria vinculada mantêm integridade',async()=>{
    preparar();const nova=await req('POST',base+'/categorias',{nome:'Nova'});assert.equal(nova.status,201);
    const editada=await req('PATCH',base+'/categorias/'+nova.dados.id,{nome:'Editada'});assert.equal(editada.dados.nome,'Editada');
    const produto=await req('POST',base+'/produtos',{nome:'Vinculado',preco:10,categoriaId:nova.dados.id});assert.equal(produto.status,201);
    assert.equal((await req('DELETE',base+'/categorias/'+nova.dados.id)).status,409);
    assert.equal((await req('PATCH',base+'/categorias/'+nova.dados.id,{ativo:false})).status,409);
    await req('DELETE',base+'/produtos/'+produto.dados.id);
    assert.equal((await req('PATCH',base+'/categorias/'+nova.dados.id,{ativo:false})).status,200);
    assert.equal((await req('DELETE',base+'/categorias/'+nova.dados.id)).status,409);
    const lista=await req('GET',base+'/categorias?limite=1');assert.equal(lista.dados.itens.length,1);assert.ok(lista.dados.proximoCursor);
    const proxima=await req('GET',base+'/categorias?limite=1&cursor='+lista.dados.proximoCursor);assert.notEqual(proxima.dados.itens[0].id,lista.dados.itens[0].id);
    assert.equal((await req('GET',base+'/categorias?limite=500')).status,400);
  });
  await t.test('configuração validada reflete na API pública sem campos privados',async()=>{
    preparar();
    const dados={nome:'Nome atualizado',whatsapp:'11999999999',entrega:{habilitada:true,taxa:9},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:false,cartao_credito:true,cartao_debito:false},horarios:{segunda:{fechado:false,abertura:'10:00',fechamento:'20:00'}}};
    const salvo=await req('PATCH',base+'/loja',dados);assert.equal(salvo.status,200);assert.equal(salvo.dados.entrega.taxa,9);
    assert.equal((await req('PATCH',base+'/loja',{whatsapp:'abc'})).status,400);
    assert.equal((await req('PATCH',base+'/loja',{entrega:{habilitada:true,taxa:-5}})).status,400);
    assert.equal((await req('PATCH',base+'/loja',{horarios:{segunda:{fechado:false,abertura:'99:00',fechamento:'12:00'}}})).status,400);
    assert.equal((await req('PATCH',base+'/loja',{role:'admin'})).status,400);
    const publico=await req('GET','/publico/lojas/loja-demo/catalogo',undefined,null);assert.equal(publico.dados.loja.nome,'Nome atualizado');assert.equal(publico.dados.loja.entrega.taxa,9);assert.equal(publico.dados.loja.horarios.segunda.abertura,'10:00');
  });
  await t.test('dashboard agrega período e separa pagamentos confirmados',async()=>{
    preparar();
    for(const [id,status,financeiro,total] of [['p1','recebido','pendente',20],['p2','entregue','confirmado',30],['p3','cancelado','confirmado',40]])definirPedidoExistente(id,{status,pagamento:{forma:'pix',status:financeiro,valor:total},total,criadoEm:new Date('2026-10-13T12:00:00Z')});
    const resumo=await req('GET',base+'/dashboard?inicio=2026-10-13&fim=2026-10-13');assert.equal(resumo.status,200);assert.equal(resumo.dados.pedidos,3);assert.equal(resumo.dados.valorPedidos,90);assert.equal(resumo.dados.valorPagamentosConfirmados,30);assert.equal(resumo.dados.porStatus.cancelado,1);assert.equal(resumo.dados.produtos.disponiveis,1);
    assert.equal((await req('GET',base+'/dashboard?inicio=2026-02-30')).status,400);
  });
  await t.test('pedidos usam rotas existentes, pagamento explícito e transições válidas',async()=>{
    preparar();definirPedidoExistente('pedido-admin',{criadoEm:new Date()});
    const paginada=await req('GET','/lojas/loja-demo/pedidos?limite=25');assert.equal(paginada.status,200);assert.equal(paginada.dados.itens.length,1);
    assert.equal((await req('PATCH','/lojas/loja-demo/pedidos/pedido-admin/status',{status:'em_preparacao'})).status,400);
    assert.equal((await req('PATCH','/lojas/loja-demo/pedidos/pedido-admin/status',{status:'pagamento_confirmado'})).status,400);
    assert.equal((await req('PATCH','/lojas/loja-demo/pedidos/pedido-admin/pagamento',{status:'confirmado'})).status,200);
    assert.equal((await req('PATCH','/lojas/loja-demo/pedidos/pedido-admin/status',{status:'pagamento_confirmado'})).status,200);
    assert.equal((await req('PATCH','/lojas/loja-demo/pedidos/pedido-admin/status',{status:'em_preparacao'})).status,200);
    const detalhe=await req('GET',base+'/pedidos/pedido-admin');assert.deepEqual(detalhe.dados.transicoesStatus,['pronto','cancelado']);assert.ok(detalhe.dados.endereco);
  });
  await t.test('clientes associados têm projeção e não expõem dados sensíveis',async()=>{
    preparar();definirDocumento('lojas/loja-demo/clientes/convidado',{nome:'Visitante',anonimo:true,telefone:'11999999999',senha:'segredo',token:'segredo',role:'admin'});
    const lista=await req('GET',base+'/clientes');assert.equal(lista.status,200);assert.equal(lista.dados.itens[0].anonimo,true);assert.equal(lista.dados.itens[0].senha,undefined);assert.equal(lista.dados.itens[0].role,undefined);
    const detalhe=await req('GET',base+'/clientes/convidado');assert.equal(detalhe.dados.token,undefined);
    const legado=await req('GET','/lojas/loja-demo/clientes');assert.equal(legado.status,200);assert.equal(legado.dados[0].senha,undefined);assert.equal(legado.dados[0].token,undefined);
  });
});


test('Etapa 20 — erros internos não são expostos',async()=>{
  prepararDadosBase();
  const original=ColecaoFake.prototype.get;
  ColecaoFake.prototype.get=async function(){if(this.segmentos.at(-1)==='produtos')throw Object.assign(new Error('credencial-interna-secreta'),{code:14});return original.call(this);};
  try {const resposta=await requisitarApp({metodo:'GET',url:'/admin/lojas/loja-demo/produtos',headers:{authorization:'Bearer token-admin'}});assert.equal(resposta.status,503);assert.doesNotMatch(resposta.dados.error,/secreta|credencial/);} finally {ColecaoFake.prototype.get=original;}

});


test('Etapa 20 — parser JSON retorna erros sem stack ou caminhos internos',async()=>{
  prepararDadosBase();const headers={'content-type':'application/json',authorization:'Bearer token-admin'};
  const invalido=await requisitarApp({metodo:'POST',url:'/admin/lojas/loja-demo/produtos',headers,corpo:'json-primitivo'});assert.equal(invalido.status,400);assert.equal(invalido.dados.error,'JSON inválido.');
  const grande=await requisitarApp({metodo:'POST',url:'/admin/lojas/loja-demo/produtos',headers,corpo:{nome:'x'.repeat(70000)}});assert.equal(grande.status,413);assert.equal(grande.dados.error,'Requisição excede o tamanho permitido.');
});

test('Etapa 21 — reproduções de segurança',async t=>{
  const get=(url,token='token-cliente')=>requisitarApp({metodo:'GET',url,headers:{authorization:`Bearer ${token}`}});
  await t.test('perfil interno inválido não habilita admin',async()=>{prepararDadosBase();estado.documentos.get('usuarios/admin-1').ativo='false';assert.equal((await get('/admin/lojas/loja-demo/sessao','token-admin')).status,403);});
  await t.test('projeção pública não transmite objetos privados em campos permitidos',async()=>{prepararDadosBase();estado.documentos.get('lojas/loja-demo').nome={token:'sentinela-privada'};estado.documentos.get('lojas/loja-demo/produtos/produto-ativo').ingredientes=[{token:'sentinela-privada'}];const res=await get('/publico/lojas/loja-demo/catalogo');assert.equal(res.status,200);assert.doesNotMatch(JSON.stringify(res.dados),/sentinela-privada/);});
  await t.test('documento próprio de usuário não expõe campos secretos legados',async()=>{prepararDadosBase();estado.documentos.get('usuarios/cliente-1').senha='sentinela-privada';const res=await get('/usuarios/me');assert.equal(res.status,200);assert.doesNotMatch(JSON.stringify(res.dados),/sentinela-privada/);});
  await t.test('pedido próprio não expõe campos financeiros privados legados',async()=>{prepararDadosBase();definirPedidoExistente('seguro',{pagamento:{forma:'pix',status:'pendente',valor:45,token:'sentinela-privada'},endereco:{rua:'Rua',senha:'sentinela-privada'}});const res=await get('/lojas/loja-demo/pedidos/seguro');assert.equal(res.status,200);assert.doesNotMatch(JSON.stringify(res.dados),/sentinela-privada/);});
  await t.test('preço no pedido usa leitura da transação, não leitura anterior',async()=>{prepararDadosBase();const original=firestoreFake.runTransaction;let alterado=false;firestoreFake.runTransaction=async function(fn){if(!alterado){alterado=true;estado.documentos.get('lojas/loja-demo/produtos/produto-ativo').preco=99;}return original.call(this,fn);};try{const res=await requisitarPedido({tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'pix'}});assert.equal(res.status,201);assert.equal(res.dados.total,99);}finally{firestoreFake.runTransaction=original;}});
});

test('Etapa 21 — lojaId não pode apontar para documento privado aninhado',async()=>{
  prepararDadosBase();definirDocumento('lojas/loja-demo/clientes/vitima',{nome:'Sentinela cliente privado',telefone:'11999999999'});
  const res=await requisitarApp({metodo:'GET',url:'/publico/lojas/loja-demo%2Fclientes%2Fvitima/catalogo',headers:{}});
  assert.equal(res.status,400);assert.doesNotMatch(JSON.stringify(res.dados),/Sentinela cliente privado/);
});

test('Etapa 21 — falha interna não expõe segredo pela API ou logs',async()=>{
  prepararDadosBase();const original=firestoreFake.collection,logger=console.error;let logs='';
  firestoreFake.collection=()=>{throw new Error('token=sentinela-secreta credencial=sentinela-secreta');};console.error=valor=>{logs+=valor;};
  try{const r=await requisitarApp({metodo:'GET',url:'/publico/lojas/loja-demo/catalogo',headers:{}});assert.equal(r.status,500);assert.doesNotMatch(JSON.stringify(r.dados)+logs,/sentinela-secreta/);}
  finally{firestoreFake.collection=original;console.error=logger;}
});

const contratos22=require('../src/validators/contratos');
const caminho22=contrato=>contrato.caminho.replace(/:([A-Za-z]+)/g,(_,nome)=>({lojaId:'loja-demo',clienteId:'cliente-1',produtoId:'produto-ativo',categoriaId:'categoria-22',enderecoId:'endereco-1',pedidoId:'pedido-22',id:'recurso-22',chave:'etapa22-chave-0001'}[nome]));
const headers22=token=>({'content-type':'application/json',authorization:`Bearer ${token || 'token-admin'}`,'idempotency-key':'etapa22-chave-0001'});
const enviar22=(metodo,url,corpo,token='token-admin')=>requisitarApp({metodo,url,corpo,headers:headers22(token)});
function base22() {
  prepararDadosBase();definirDocumento('lojas/loja-demo/clientes/cliente-1',{nome:'Cliente Teste',telefone:'11999999999'});definirDocumento('lojas/loja-demo/categorias/categoria-22',{nome:'Categoria',ativo:true});
  estado.documentos.get('lojas/loja-demo/produtos/produto-ativo').categoriaId='categoria-22';
  definirPedidoExistente('pedido-22');
}
function inalterado22(antes) {assert.deepEqual([...estado.documentos],antes,'Dados inválidos não podem modificar documentos.');assert.equal(estado.pedidosCriados.length,0);}

test('Etapa 22 — todas as rotas rejeitam queries desconhecidas antes de operações',async t=>{
  for(const contrato of contratos22)await t.test(contrato.metodo+' '+contrato.caminho,async()=>{
    base22();const antes=structuredClone([...estado.documentos]);
    const r=await enviar22(contrato.metodo,caminho22(contrato)+'?inesperado=segredo',{interno:true});
    assert.equal(r.status,400);assert.equal(typeof r.dados.error,'string');assert.doesNotMatch(JSON.stringify(r.dados),/segredo|stack/);inalterado22(antes);
  });
});

test('Etapa 22 — toda mutação com schema rejeita corpos sem contrato',async t=>{
  for(const contrato of contratos22.filter(c=>c.corpo))await t.test(contrato.metodo+' '+contrato.caminho,async()=>{
    for(const corpo of [{},{interno:true},[],null,'texto',42]) {
      base22();const antes=structuredClone([...estado.documentos]);
      const r=await enviar22(contrato.metodo,caminho22(contrato),corpo);assert.equal(r.status,400,JSON.stringify(corpo));inalterado22(antes);
    }
  });
});

test('Etapa 22 — pedidos invalidam todo o payload antes de persistir',async t=>{
  const pedido={tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:1}],cliente:{nome:'João D’Ávila 🍕',telefone:'+55 (11) 99999-9999'},pagamento:{forma:'pix'}};
  const casos=[
    ['array vazio',{itens:[]}],['array excessivo',{itens:Array.from({length:51},(_,i)=>({produtoId:'produto-'+i,quantidade:1}))}],
    ['produto repetido',{itens:[pedido.itens[0],pedido.itens[0]]}],['quantidade fracionária',{itens:[{produtoId:'produto-ativo',quantidade:1.5}]}],
    ['quantidade textual',{itens:[{produtoId:'produto-ativo',quantidade:'1'}]}],['quantidade negativa',{itens:[{produtoId:'produto-ativo',quantidade:-1}]}],
    ['item desconhecido',{itens:[{produtoId:'produto-ativo',quantidade:1,total:0}]}],['item null',{itens:[null]}],
    ['excesso unidades',{itens:Array.from({length:6},(_,i)=>({produtoId:'produto-'+i,quantidade:99}))}],
    ['ID com barra',{itens:[{produtoId:'produto/privado',quantidade:1}]}],['observação grande',{observacao:'x'.repeat(1001)}],
    ['controle Unicode',{observacao:'x\u0000'}],['surrogate isolado',{observacao:'\ud800'}],['cliente administrativo',{cliente:{...pedido.cliente,role:'admin'}}],
    ['cliente tipo inválido',{cliente:[]}],['senha aninhada',{pagamento:{forma:'pix',complemento:{senha:'sentinela'}}}],
    ['confirmação',{pagamento:{forma:'pix',status:'confirmado'}}],['valor null',{pagamento:{forma:'pix',valor:null}}],
    ['pagamento extra',{pagamento:{forma:'pix',gateway:'sentinela'}}],['desconto indevido',{desconto:1}],['taxa indevida',{taxaEntrega:1}],
    ['monetário fracionado',{total:1.001}],['forma contraditória',{formaPagamento:'dinheiro'}],['campo interno',{criadoEm:'2026-10-13'}],
    ['número não finito JSON',{total:Infinity}],['objeto profundo',{extra:{a:{a:{a:{a:{a:{a:{a:{a:{a:1}}}}}}}}}}],
  ];
  for(const [nome,alteracoes] of casos)await t.test(nome,async()=>{
    base22();const antes=structuredClone([...estado.documentos]);const r=await enviar22('POST','/lojas/loja-demo/pedidos',{...pedido,...alteracoes},'token-cliente');
    assert.equal(r.status,400);inalterado22(antes);
  });
  await t.test('Unicode legítimo, observação multilinha e pedido anônimo válidos',async()=>{
    base22();const r=await enviar22('POST','/lojas/loja-demo/pedidos',{...pedido,observacao:'Sem cebola\nObrigado 🍕'},'token-convidado');
    assert.equal(r.status,201);assert.equal(r.dados.total,20);assert.equal(r.dados.clienteId,'convidado-1');
  });
  await t.test('item posterior inexistente não causa escrita parcial',async()=>{
    base22();const antes=structuredClone([...estado.documentos]);const r=await enviar22('POST','/lojas/loja-demo/pedidos',{...pedido,itens:[pedido.itens[0],{produtoId:'ausente',quantidade:1}]},'token-cliente');assert.equal(r.status,400);inalterado22(antes);
  });
});

test('Etapa 22 — perfil e endereço brasileiros',async t=>{
  const endereco={rua:'Rua São José',numero:'s/n',bairro:'Centro',cidade:'São Paulo',uf:'sp',cep:'01001-000',complemento:'Fundos'};
  for(const [nome,corpo] of [['UF inexistente',{...endereco,uf:'XX'}],['CEP inválido',{...endereco,cep:'123'}],['endereço vazio',{...endereco,rua:' '}],['identidade injetada',{...endereco,clienteId:'alheio'}],['complemento null',{...endereco,complemento:null}]])await t.test(nome,async()=>{
    base22();const antes=structuredClone([...estado.documentos]);assert.equal((await enviar22('POST','/publico/lojas/loja-demo/me/enderecos',corpo,'token-cliente')).status,400);inalterado22(antes);
  });
  await t.test('salva endereço legítimo e normaliza UF',async()=>{base22();const r=await enviar22('POST','/publico/lojas/loja-demo/me/enderecos',endereco,'token-convidado');assert.equal(r.status,201);assert.equal(r.dados.uf,'SP');});
  for(const telefone of ['00000000000','telefone qualquer','123',null])await t.test('telefone inválido '+telefone,async()=>{base22();const antes=structuredClone([...estado.documentos]);assert.equal((await enviar22('PUT','/publico/lojas/loja-demo/me',{nome:'José',telefone},'token-cliente')).status,400);inalterado22(antes);});
});

test('Etapa 22 — contratos administrativos, precisão e PATCH parcial',async t=>{
  for(const preco of [-1,0.001,1000000.01,'12.50',null])await t.test('preço inválido '+preco,async()=>{
    base22();const antes=structuredClone([...estado.documentos]);assert.equal((await enviar22('POST','/admin/lojas/loja-demo/produtos',{nome:'Produto',preco,categoriaId:'categoria-22'})).status,400);inalterado22(antes);
  });
  await t.test('centavos não são arredondados inesperadamente',async()=>{base22();const r=await enviar22('POST','/admin/lojas/loja-demo/produtos',{nome:'Açaí 🍇',preco:19.99,categoriaId:'categoria-22',ingredientes:['Açaí','Leite']} );assert.equal(r.status,201);assert.equal(r.dados.preco,19.99);});
  const invalidos=[{ativo:'false'},{imagem:'javascript:alert(1)'},{imagem:'https://senha:token@example.com/a'},{ingredientes:Array(51).fill('x')},{categoriaId:'ausente'},{nome:'x'.repeat(201)}];
  for(const dados of invalidos)await t.test('produto parcial inválido '+Object.keys(dados)[0],async()=>{base22();const antes=structuredClone([...estado.documentos]);assert.equal((await enviar22('PATCH','/admin/lojas/loja-demo/produtos/produto-ativo',dados)).status,400);inalterado22(antes);});
  for(const dados of [{nome:' '},{ordem:-1},{ordem:1.5},{ordem:10001},{ativo:null},{icone:'x'.repeat(51)}])await t.test('categoria inválida '+JSON.stringify(dados),async()=>{base22();const antes=structuredClone([...estado.documentos]);assert.equal((await enviar22('POST','/admin/lojas/loja-demo/categorias',{nome:'Categoria',...dados})).status,400);inalterado22(antes);});
  await t.test('PATCH mantém taxa, pagamentos, endereço e dias omitidos',async()=>{
    base22();const loja=estado.documentos.get('lojas/loja-demo');loja.entrega={habilitada:true,taxa:5};loja.horarios={segunda:{fechado:false,abertura:'08:00',fechamento:'18:00'},terca:{fechado:true}};loja.endereco={rua:'Rua São José',cidade:'São Paulo',cep:'01001-000'};
    const r=await enviar22('PATCH','/admin/lojas/loja-demo/loja',{entrega:{habilitada:false},pagamentos:{pix:false},endereco:{numero:'s/n'},horarios:{segunda:{abertura:'09:00'}}});
    assert.equal(r.status,200);assert.equal(r.dados.entrega.taxa,5);assert.equal(r.dados.pagamentos.dinheiro,true);assert.equal(r.dados.endereco.rua,'Rua São José');assert.equal(r.dados.horarios.segunda.fechamento,'18:00');assert.equal(r.dados.horarios.terca.fechado,true);
  });
  for(const dados of [{entrega:{habilitada:false},retirada:{habilitada:false}},{pagamentos:{pix:false,dinheiro:false,cartao_credito:false,cartao_debito:false}},{horarios:{segunda:{fechado:false,abertura:'10:00',fechamento:'10:00'}}},{horarios:{segunda:{fechado:false,abertura:'25:00',fechamento:'18:00'}}},{entrega:{taxa:0.001}},{pagamentos:{token:'sentinela'}},{endereco:{uf:'XX'}},{corPrimaria:['#abcdef']}])await t.test('configuração inconsistente '+JSON.stringify(dados),async()=>{base22();const antes=structuredClone([...estado.documentos]);assert.equal((await enviar22('PATCH','/admin/lojas/loja-demo/loja',dados)).status,400);inalterado22(antes);});
});

test('Etapa 22 — queries, parsing, IDs e autorização',async t=>{
  for(const query of ['limite=1&limite=2','limite=1.5','limite=1e2','limite=','limite=101','cursor=x%2Fy','contagem=2','categoriaId[]=x'])await t.test(query,async()=>{base22();const path=query.startsWith('contagem')?'categorias':'produtos';assert.equal((await enviar22('GET','/admin/lojas/loja-demo/'+path+'?'+query)).status,400);});
  for(const query of ['inicio=2026-02-30','inicio=2026-10-13&fim=2026-10-12','inicio=2026-01-01&fim=2026-02-01','inicio=2026-01-01&inicio=2026-01-02'])await t.test(query,async()=>{base22();assert.equal((await enviar22('GET','/admin/lojas/loja-demo/dashboard?'+query)).status,400);});
  for(const id of ['x%2Fy','x%5Cy','%00','%20','x'.repeat(129),'%ED%A0%80'])await t.test('id '+id,async()=>{base22();assert.equal((await enviar22('GET','/publico/lojas/'+id+'/catalogo')).status,400);});
  for(const chave of ['curta','x'.repeat(101),'../admin'])await t.test('chave inválida '+chave,async()=>{base22();assert.equal((await requisitarApp({metodo:'POST',url:'/lojas/loja-demo/pedidos',corpo:{tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'pix'}},headers:{...headers22('token-cliente'),'idempotency-key':chave}})).status,400);});
  await t.test('JSON realmente inválido e excedente',async()=>{base22();for(const [raw,status] of [['{"nome":',400],['{"nome":"'+'x'.repeat(70000)+'"}',413]]){const r=await requisitarApp({metodo:'POST',url:'/admin/lojas/loja-demo/produtos',corpoRaw:raw,headers:headers22()});assert.equal(r.status,status);assert.doesNotMatch(JSON.stringify(r.dados),/SyntaxError|stack|backend/);}});
  await t.test('prototype e profundidade controlados sem persistência',async()=>{base22();const antes=structuredClone([...estado.documentos]);const r=await requisitarApp({metodo:'PUT',url:'/publico/lojas/loja-demo/me',corpoRaw:'{"nome":"Cliente","telefone":"11999999999","__proto__":{"role":"admin"}}',headers:headers22('token-cliente')});assert.equal(r.status,400);inalterado22(antes);assert.equal({}.role,undefined);});
  await t.test('validação não substitui autorização',async()=>{base22();for(const token of ['token-cliente','token-convidado','token-admin-outra-loja']){const r=await enviar22('PATCH','/admin/lojas/loja-demo/loja',{interno:true},token);assert.equal(r.status,403,token);}assert.equal((await requisitarApp({metodo:'POST',url:'/lojas/loja-demo/pedidos',corpo:{interno:true},headers:{'content-type':'application/json'}})).status,401);});
  await t.test('filtros não são silenciosamente ignorados',async()=>{base22();assert.equal((await enviar22('GET','/lojas/loja-demo/pedidos?limite=25',undefined,'token-cliente')).status,400);assert.equal((await enviar22('GET','/lojas/loja-demo/pedidos?status=recebido')).status,400);});
});

test('Etapa 22 — leitura válida de todos os contratos GET',async t=>{
  for(const contrato of contratos22.filter(c=>c.metodo==='GET'))await t.test(contrato.caminho,async()=>{
    base22();
    definirDocumento('lojas/loja-demo/produtos/recurso-22',{nome:'Produto',preco:20,categoriaId:'categoria-22',ativo:true});
    definirDocumento('lojas/loja-demo/categorias/recurso-22',{nome:'Categoria',ativo:true});
    definirDocumento('lojas/loja-demo/clientes/recurso-22',{nome:'Cliente'});
    definirPedidoExistente('recurso-22');
    const criacao=await enviar22('POST','/lojas/loja-demo/pedidos',{tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'pix'}});assert.equal(criacao.status,201);
    const r=await enviar22('GET',caminho22(contrato));assert.equal(r.status,200,JSON.stringify(r.dados));
  });
});
test('Etapa 22 — PATCH de pagamentos legados permite desabilitar cartões explicitamente',async()=>{
  base22();estado.documentos.get('lojas/loja-demo').pagamentos={pix:true,cartao:true};
  const r=await enviar22('PATCH','/admin/lojas/loja-demo/loja',{pagamentos:{cartao_credito:false,cartao_debito:false}});
  assert.equal(r.status,200);assert.equal(r.dados.pagamentos.pix,true);assert.equal(r.dados.pagamentos.cartao_credito,false);assert.equal(r.dados.pagamentos.cartao_debito,false);
});

test('Etapa 22 — inventário coincide com rotas reais e todas têm middleware',()=>{
  const validar=require('../src/middleware/validacaoMiddleware');
  const reais=[];
  const conjuntos=[['',app.router],['/usuarios',require('../src/routes/usuarioRoutes')],['/publico/lojas',require('../src/routes/publicoRoutes')],['/admin/lojas/:lojaId',require('../src/routes/adminRoutes')],...['loja','produto','categoria','cliente','endereco','pedido'].map(nome=>['/lojas',require('../src/routes/'+nome+'Routes')])];
  for(const [prefixo,router] of conjuntos)for(const layer of router.stack)if(layer.route) {
    assert.ok(layer.route.stack.some(handler=>handler.handle===validar),prefixo+layer.route.path+' sem middleware');
    for(const metodo of Object.keys(layer.route.methods))reais.push(metodo.toUpperCase()+' '+prefixo+layer.route.path);
  }
  assert.deepEqual(reais.sort(),contratos22.map(c=>c.metodo+' '+c.caminho).sort());
});
test('Etapa 22 — HEAD implícito mantém contrato de leitura',async()=>{
  base22();const r=await enviar22('HEAD','/publico/lojas/loja-demo/catalogo');assert.equal(r.status,200);
});

test('Etapa 22 — codificações HTTP inválidas são erros de entrada seguros',async()=>{
  base22();const antes=structuredClone([...estado.documentos]);
  for(const [headers,expected] of [[{'content-type':'application/json; charset=ascii'},415],[{'content-encoding':'nao-suportado'},415],[{'content-encoding':'gzip'},400]]) {
    const r=await requisitarApp({metodo:'POST',url:'/admin/lojas/loja-demo/produtos',corpoRaw:'{}',headers:{...headers22(),...headers}});
    assert.equal(r.status,expected);assert.doesNotMatch(JSON.stringify(r.dados),/Error|stack|backend/);inalterado22(antes);
  }
});

test('Etapa 23 — classificação de falhas Auth sem reduzir a verificação',async t=>{
  for(const [code,status] of [['auth/invalid-id-token',401],['auth/argument-error',401],['auth/id-token-expired',401],['auth/id-token-revoked',401],['auth/user-disabled',401],['auth/user-not-found',401],['auth/network-request-failed',503],['auth/internal-error',500],['auth/insufficient-permission',500],['auth/invalid-credential',500],['desconhecido',500]])await t.test(code,async()=>{
    base22();estado.falhaAuth=Object.assign(new Error('sentinela token=privado'),{code});
    try{const r=await enviar22('GET','/usuarios/me',undefined,'token-cliente');assert.equal(r.status,status);assert.doesNotMatch(JSON.stringify(r.dados),/sentinela|privado|backend/);}
    finally{delete estado.falhaAuth;}
  });
  await t.test('mesma sessão funciona após indisponibilidade do Firestore durante Auth',async()=>{
    base22();const original=firestoreFake.collection;
    firestoreFake.collection=()=>{throw Object.assign(new Error('sentinela interna'),{code:14});};
    try{assert.equal((await enviar22('GET','/usuarios/me',undefined,'token-cliente')).status,503);}finally{firestoreFake.collection=original;}
    assert.equal((await enviar22('GET','/usuarios/me',undefined,'token-cliente')).status,200);
  });
});
test('Etapa 23 — controllers legados preservam erros de domínio e Firestore',async t=>{
  for(const path of ['/lojas/loja-demo','/lojas/loja-demo/produtos','/lojas/loja-demo/categorias','/lojas/loja-demo/clientes','/lojas/loja-demo/clientes/cliente-1/enderecos','/lojas/loja-demo/pedidos','/admin/lojas/loja-demo/produtos','/publico/lojas/loja-demo/catalogo'])await t.test(path,async()=>{
    for(const [error,status] of [[new (require('../src/lib/seguranca').ErroDominio)('Regra inválida.'),400],[Object.assign(new Error('sentinela interna'),{code:14}),503],[new Error('senha=sentinela'),500]]) {
      base22();const original=firestoreFake.collection;firestoreFake.collection=function(nome){if(nome==='lojas')throw error;return original.call(this,nome);};
      try{const r=await enviar22('GET',path);assert.equal(r.status,status);assert.doesNotMatch(JSON.stringify(r.dados),/sentinela|senha|stack/);}finally{firestoreFake.collection=original;}
    }
  });
});
test('Etapa 23 — falhas de transação não deixam pedido, nonce ou pagamento parciais',async t=>{
  for(const code of [4,7,9,10,13,14,'ECONNRESET'])await t.test(String(code),async()=>{
    base22();const antes=structuredClone([...estado.documentos]);const original=firestoreFake.runTransaction;
    firestoreFake.runTransaction=async()=>{throw Object.assign(new Error('cliente privado sentinela'),{code});};
    try {
      const expected=[7,13].includes(code)?500:503;
      const r=await enviar22('POST','/lojas/loja-demo/pedidos',{tipoEntrega:'retirada',itens:[{produtoId:'produto-ativo',quantidade:1}],pagamento:{forma:'pix'}},'token-cliente');
      assert.equal(r.status,expected);inalterado22(antes);
      const pagamento=await enviar22('PATCH','/lojas/loja-demo/pedidos/pedido-22/pagamento',{status:'confirmado'});assert.equal(pagamento.status,expected);inalterado22(antes);
    }finally{firestoreFake.runTransaction=original;}
  });
});
test('Etapa 23 — 404 JSON e correlação não refletem rota ou headers privados',async()=>{
  base22();const r=await requisitarApp({metodo:'GET',url:'/inexistente/sentinela?token=privado',headers:{'x-request-id':'segredo-controlado'}});
  assert.equal(r.status,404);assert.deepEqual(r.dados,{error:'Rota não encontrada.'});assert.match(r.requestId,/^[\da-f-]{36}$/i);assert.notEqual(r.requestId,'segredo-controlado');
  const segundo=await enviar22('GET','/');assert.notEqual(segundo.requestId,r.requestId);
});
test('Etapa 23 — formato não JSON não vira 500',async()=>{
  base22();const r=await requisitarApp({metodo:'POST',url:'/admin/lojas/loja-demo/produtos',corpoRaw:'sentinela privada',headers:{authorization:'Bearer token-admin','content-type':'text/plain'}});assert.equal(r.status,415);assert.doesNotMatch(JSON.stringify(r.dados),/sentinela/);
});
