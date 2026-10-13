require("../src/config/firebase");

const { getApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

function mascararEmail(email) {
  if (!email || !email.includes("@")) {
    return null;
  }

  const [nome, dominio] = email.split("@");
  return `${nome.slice(0, 2)}***@${dominio}`;
}

async function main() {
  const app = getApp();
  const db = getFirestore();
  const auth = getAuth();

  console.log(
    JSON.stringify({
      tipo: "project",
      projectId: app.options.projectId,
    })
  );

  const colecoes = await db.listCollections();

  console.log(
    JSON.stringify({
      tipo: "rootCollections",
      nomes: colecoes.map((colecao) => colecao.id).sort(),
    })
  );

  const lojaDemo = await db
    .collection("lojas")
    .doc("loja-demo")
    .get();

  console.log(
    JSON.stringify({
      tipo: "lojaDemo",
      existe: lojaDemo.exists,
      campos: lojaDemo.exists
        ? Object.keys(lojaDemo.data()).sort()
        : [],
    })
  );

  const authUsers = await auth.listUsers(100);
  const usuarios = [];

  for (const usuario of authUsers.users) {
    const doc = await db
      .collection("usuarios")
      .doc(usuario.uid)
      .get();
    const dados = doc.exists ? doc.data() : null;

    usuarios.push({
      uidPrefix: usuario.uid.slice(0, 8),
      emailMascarado: mascararEmail(usuario.email),
      authDesativado: usuario.disabled,
      firestoreExiste: doc.exists,
      role: dados?.role || null,
      lojaId: dados?.lojaId || null,
      ativo: dados?.ativo ?? null,
      emailConfere: Boolean(
        dados?.email &&
          usuario.email &&
          dados.email === usuario.email
      ),
    });
  }

  console.log(
    JSON.stringify({
      tipo: "authUsers",
      total: authUsers.users.length,
      usuarios,
    })
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      tipo: "erro",
      code: error.code || null,
      message: error.message,
    })
  );
  process.exitCode = 1;
});
