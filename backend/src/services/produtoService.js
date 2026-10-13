const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarProdutosPorLoja(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  const produtosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("produtos");

  const snapshot = await produtosRef.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}

async function buscarProdutoPorId(lojaId, produtoId) {
  require('../lib/identificadores').identificador(lojaId);
  require('../lib/identificadores').identificador(produtoId);

  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!produtoId || typeof produtoId !== "string") {
    throw new ErroDominio("produtoId é obrigatório.");
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
    ...snapshot.data(),
    id: snapshot.id,
  };
}

module.exports = {
  listarProdutosPorLoja,
  buscarProdutoPorId,
};