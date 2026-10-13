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
const app = require("../src/app");

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

function requisitarApp({ metodo, url, token }) {
  return new Promise((resolve) => {
    const req = new Readable({
      read() {
        this.push(null);
      },
    });

    req.method = metodo;
    req.url = url;
    req.headers = {};

    if (token) {
      req.headers.authorization = `Bearer ${token}`;
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
  const lojaId = "loja-whatsapp-emulator";
  const outraLojaId = "loja-whatsapp-outra";
  const clienteUid = "cliente-whatsapp-emulator";
  const outraLojaUid = "cliente-whatsapp-outra";
  const pedidoId = "pedido-whatsapp";

  await Promise.allSettled([
    auth.deleteUser(clienteUid),
    auth.deleteUser(outraLojaUid),
  ]);

  await auth.createUser({
    uid: clienteUid,
    email: "cliente.whatsapp@catalogo.local",
    password: senha,
  });

  await auth.createUser({
    uid: outraLojaUid,
    email: "outra.whatsapp@catalogo.local",
    password: senha,
  });

  await db.collection("lojas").doc(lojaId).set({
    nome: "Loja WhatsApp Emulator",
    whatsapp: "(51) 99531-0123",
    status: "ativa",
  });

  await db.collection("lojas").doc(outraLojaId).set({
    nome: "Outra Loja WhatsApp",
    whatsapp: "(51) 99999-9999",
    status: "ativa",
  });

  await db.collection("usuarios").doc(clienteUid).set({
    email: "cliente.whatsapp@catalogo.local",
    role: "cliente",
    lojaId,
    ativo: true,
  });

  await db.collection("usuarios").doc(outraLojaUid).set({
    email: "outra.whatsapp@catalogo.local",
    role: "cliente",
    lojaId: outraLojaId,
    ativo: true,
  });

  await db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc("cliente-doc-whatsapp")
    .collection("enderecos")
    .doc("endereco-whatsapp")
    .set({
      rua: "Rua WhatsApp",
      numero: "77",
      bairro: "Centro",
    });

  await db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc(pedidoId)
    .set({
      lojaId,
      clienteId: "cliente-doc-whatsapp",
      enderecoId: "endereco-whatsapp",
      tipoEntrega: "entrega",
      status: "recebido",
      itens: [
        {
          produtoId: "produto-whatsapp",
          nome: "Produto WhatsApp",
          precoUnitario: 14,
          quantidade: 2,
          subtotal: 28,
        },
      ],
      subtotal: 28,
      taxaEntrega: 4,
      desconto: 0,
      total: 32,
      observacao: "Enviar sem talheres",
      pagamento: {
        forma: "pix",
        status: "pendente",
        valor: 32,
      },
    });

  return {
    senha,
    lojaId,
    pedidoId,
    clienteEmail: "cliente.whatsapp@catalogo.local",
    outraLojaEmail: "outra.whatsapp@catalogo.local",
  };
}

async function main() {
  const dados = await prepararDados();

  const tokenCliente = await loginNoAuthEmulator(
    dados.clienteEmail,
    dados.senha
  );
  const tokenOutraLoja = await loginNoAuthEmulator(
    dados.outraLojaEmail,
    dados.senha
  );

  const resposta = await requisitarApp({
    metodo: "GET",
    url: `/lojas/${dados.lojaId}/pedidos/${dados.pedidoId}/whatsapp`,
    token: tokenCliente,
  });

  assert.equal(resposta.status, 200);
  assert.equal(resposta.dados.numero, "5551995310123");
  assert.match(resposta.dados.url, /^https:\/\/wa\.me\/5551995310123\?text=/);
  assert.match(resposta.dados.mensagem, /Produto WhatsApp/);
  assert.match(resposta.dados.mensagem, /Status do pagamento: Pendente/);

  const bloqueado = await requisitarApp({
    metodo: "GET",
    url: `/lojas/${dados.lojaId}/pedidos/${dados.pedidoId}/whatsapp`,
    token: tokenOutraLoja,
  });

  assert.equal(bloqueado.status, 403);

  const pedido = await getFirestore()
    .collection("lojas")
    .doc(dados.lojaId)
    .collection("pedidos")
    .doc(dados.pedidoId)
    .get();

  assert.equal(pedido.data().status, "recebido");
  assert.equal(pedido.data().pagamento.status, "pendente");

  console.log(
    JSON.stringify({
      tipo: "whatsappIntegration",
      projectId: process.env.GCLOUD_PROJECT,
      urlGerada: true,
      outraLojaBloqueada: true,
      semConfirmacaoAutomatica: true,
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
