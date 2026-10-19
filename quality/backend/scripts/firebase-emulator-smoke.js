process.env.GCLOUD_PROJECT =
  process.env.GCLOUD_PROJECT || "demo-catalogos-emulator";

const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

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
    throw new Error("O smoke test exige um projeto demo- para isolamento local.");
  }

  for (const nome of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"]) {
    if (!/^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(process.env[nome])) {
      throw new Error(`${nome} deve apontar para um emulador local.`);
    }
  }
}

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

async function main() {
  exigirEmuladores();
  require("../../../backend/src/config/firebase");

  const auth = getAuth();
  const db = getFirestore();

  const lojaId = "loja-emulator-a";
  const outraLojaId = "loja-emulator-b";
  const clienteUid = "cliente-emulator";
  const adminUid = "admin-emulator";
  const outraLojaUid = "outra-loja-emulator";
  const senha = `Local-${crypto.randomUUID()}a1!`;

  await Promise.allSettled([
    auth.deleteUser(clienteUid),
    auth.deleteUser(adminUid),
    auth.deleteUser(outraLojaUid),
  ]);

  await auth.createUser({
    uid: clienteUid,
    email: "cliente.emulator@catalogo.local",
    password: senha,
  });

  await auth.createUser({
    uid: adminUid,
    email: "admin.emulator@catalogo.local",
    password: senha,
  });

  await auth.createUser({
    uid: outraLojaUid,
    email: "outra.loja.emulator@catalogo.local",
    password: senha,
  });

  await db.collection("lojas").doc(lojaId).set({
    nome: "Loja Emulator A",
    status: "ativa",
  });

  await db.collection("lojas").doc(outraLojaId).set({
    nome: "Loja Emulator B",
    status: "ativa",
  });

  await db.collection("usuarios").doc(clienteUid).set({
    email: "cliente.emulator@catalogo.local",
    role: "cliente",
    lojaId,
    ativo: true,
  });

  await db.collection("usuarios").doc(adminUid).set({
    email: "admin.emulator@catalogo.local",
    role: "admin",
    lojaId,
    ativo: true,
  });

  await db.collection("usuarios").doc(outraLojaUid).set({
    email: "outra.loja.emulator@catalogo.local",
    role: "cliente",
    lojaId: outraLojaId,
    ativo: true,
  });

  await db
    .collection("lojas")
    .doc(lojaId)
    .collection("produtos")
    .doc("produto-emulator")
    .set({
      nome: "Produto Emulator",
      preco: 10,
      ativo: true,
    });

  await db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc("cliente-emulator-doc")
    .collection("enderecos")
    .doc("endereco-emulator")
    .set({
      rua: "Rua Emulator",
      numero: "100",
    });

  const idToken = await loginNoAuthEmulator(
    "cliente.emulator@catalogo.local",
    senha
  );
  const tokenVerificado = await auth.verifyIdToken(idToken);

  const loja = await db.collection("lojas").doc(lojaId).get();
  const outraLoja = await db
    .collection("lojas")
    .doc(outraLojaId)
    .get();

  assert.equal(tokenVerificado.uid, clienteUid);
  assert.equal(loja.exists, true);
  assert.equal(outraLoja.exists, true);

  console.log(
    JSON.stringify({
      tipo: "emulatorSmoke",
      projectId: process.env.GCLOUD_PROJECT,
      auth: {
        clienteLoginOk: tokenVerificado.uid === clienteUid,
      },
      firestore: {
        lojaPrincipalExiste: loja.exists,
        outraLojaExiste: outraLoja.exists,
      },
      usuariosCriados: 3,
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
