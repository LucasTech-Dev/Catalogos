process.env.GCLOUD_PROJECT =
  process.env.GCLOUD_PROJECT || "demo-catalogos-emulator";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const http = require("node:http");
const { Readable, Writable } = require("node:stream");

function exigirEmuladores() {
  const faltando = [];

  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    faltando.push("FIRESTORE_EMULATOR_HOST");
  }

  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    faltando.push("FIREBASE_AUTH_EMULATOR_HOST");
  }

  if (faltando.length > 0) {
    throw new Error(
      `Emuladores não configurados: ${faltando.join(", ")}.`
    );
  }

  if (!process.env.GCLOUD_PROJECT.startsWith("demo-")) {
    throw new Error(
      "O teste de integração exige um projeto demo-."
    );
  }
}

exigirEmuladores();

const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const app = require("../../../backend/src/app");

async function loginNoAuthEmulator(email, password) {
  const url = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;

  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      `Login no Auth Emulator falhou: ${dados.error?.message || resposta.status}`
    );
  }

  return dados.idToken;
}

function requisitarApp({ metodo, url, token, corpo }) {
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
      "content-type": "application/json",
    };

    if (metodo === "POST") req.headers["idempotency-key"] = crypto.randomUUID();
    if (token) {
      req.headers.authorization = `Bearer ${token}`;
    }

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

async function prepararDados() {
  const auth = getAuth();
  const db = getFirestore();

  const senha = `Local-${crypto.randomUUID()}a1!`;
  const lojaId = "loja-pagamento-emulator";
  const outraLojaId = "loja-pagamento-outra";
  const clienteUid = "cliente-pagamento-emulator";
  const adminUid = "admin-pagamento-emulator";
  const adminOutraLojaUid = "admin-pagamento-outra";

  await Promise.allSettled([
    auth.deleteUser(clienteUid),
    auth.deleteUser(adminUid),
    auth.deleteUser(adminOutraLojaUid),
  ]);

  await auth.createUser({
    uid: clienteUid,
    email: "cliente.pagamento@catalogo.local",
    password: senha,
  });

  await auth.createUser({
    uid: adminUid,
    email: "admin.pagamento@catalogo.local",
    password: senha,
  });

  await auth.createUser({
    uid: adminOutraLojaUid,
    email: "admin.outra.pagamento@catalogo.local",
    password: senha,
  });

  await db.collection("lojas").doc(lojaId).set({
    nome: "Loja Pagamento Emulator",
    entrega: {habilitada: true,taxa:3},
    status: "ativa",
    pagamentos: {
      pix: true,
      dinheiro: true,
      cartao_credito: true,
      cartao_debito: true,
    },
  });

  await db.collection("lojas").doc(outraLojaId).set({
    nome: "Outra Loja Pagamento",
    status: "ativa",
    pagamentos: {
      pix: true,
      dinheiro: true,
      cartao_credito: true,
      cartao_debito: true,
    },
  });

  await db.collection("usuarios").doc(clienteUid).set({
    email: "cliente.pagamento@catalogo.local",
    role: "cliente",
    lojaId,
    ativo: true,
  });

  await db.collection("usuarios").doc(adminUid).set({
    email: "admin.pagamento@catalogo.local",
    role: "admin",
    lojaId,
    ativo: true,
  });

  await db.collection("usuarios").doc(adminOutraLojaUid).set({
    email: "admin.outra.pagamento@catalogo.local",
    role: "admin",
    lojaId: outraLojaId,
    ativo: true,
  });

  await db
    .collection("lojas")
    .doc(lojaId)
    .collection("produtos")
    .doc("produto-pagamento")
    .set({
      nome: "Produto Pagamento",
      preco: 12.5,
      ativo: true,
    });

  await db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc("cliente-pagamento-emulator")
    .collection("enderecos")
    .doc("endereco-pagamento")
    .set({
      rua: "Rua Pagamento",
      numero: "17",
    });

  return {
    senha,
    lojaId,
    clienteEmail: "cliente.pagamento@catalogo.local",
    adminEmail: "admin.pagamento@catalogo.local",
    adminOutraLojaEmail: "admin.outra.pagamento@catalogo.local",
  };
}

async function main() {
  const dados = await prepararDados();

  const tokenCliente = await loginNoAuthEmulator(
    dados.clienteEmail,
    dados.senha
  );
  const tokenAdmin = await loginNoAuthEmulator(
    dados.adminEmail,
    dados.senha
  );
  const tokenAdminOutraLoja = await loginNoAuthEmulator(
    dados.adminOutraLojaEmail,
    dados.senha
  );

  const pedido = await requisitarApp({
    metodo: "POST",
    url: `/lojas/${dados.lojaId}/pedidos`,
    token: tokenCliente,
    corpo: {
      clienteId: "cliente-pagamento-emulator",
      enderecoId: "endereco-pagamento",
      tipoEntrega: "entrega",
      taxaEntrega: 3,
      itens: [
        {
          produtoId: "produto-pagamento",
          quantidade: 2,
          precoUnitario: 0.01,
        },
      ],
      pagamento: {
        forma: "pix",
      },
    },
  });

  assert.equal(pedido.status, 201);
  assert.equal(pedido.dados.total, 28);
  assert.equal(pedido.dados.pagamento.status, "pendente");
  assert.equal(pedido.dados.pagamento.valor, 28);
  assert.equal(pedido.dados.itens[0].precoUnitario, 12.5);

  const outraLoja = await requisitarApp({
    metodo: "PATCH",
    url: `/lojas/${dados.lojaId}/pedidos/${pedido.dados.id}/pagamento`,
    token: tokenAdminOutraLoja,
    corpo: {
      status: "confirmado",
    },
  });

  assert.equal(outraLoja.status, 403);

  const confirmado = await requisitarApp({
    metodo: "PATCH",
    url: `/lojas/${dados.lojaId}/pedidos/${pedido.dados.id}/pagamento`,
    token: tokenAdmin,
    corpo: {
      status: "confirmado",
    },
  });

  assert.equal(confirmado.status, 200);
  assert.equal(confirmado.dados.pagamento.status, "confirmado");

  console.log(
    JSON.stringify({
      tipo: "pagamentoIntegration",
      projectId: process.env.GCLOUD_PROJECT,
      pedidoCriado: true,
      pagamentoPendenteInicial: true,
      adminOutraLojaBloqueado: true,
      pagamentoConfirmadoPorAdmin: true,
    })
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      tipo: "erro",
      message: error.message,
    })
  );
  process.exitCode = 1;
});
