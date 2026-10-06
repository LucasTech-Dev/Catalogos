const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarProdutosPorLoja(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  const produtosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("produtos");

  const snapshot = await produtosRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function buscarProdutoPorId(lojaId, produtoId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!produtoId || typeof produtoId !== "string") {
    throw new Error("produtoId é obrigatório.");
  }

  const produtoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("produtos")
    .doc(produtoId);

  const snapshot = await produtoRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

module.exports = {
  listarProdutosPorLoja,
  buscarProdutoPorId,
};