const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarCategoriasPorLoja(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  const categoriasRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("categorias");

  const snapshot = await categoriasRef.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}

async function buscarCategoriaPorId(lojaId, categoriaId) {
  require('../lib/identificadores').identificador(lojaId);
  require('../lib/identificadores').identificador(categoriaId);

  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!categoriaId || typeof categoriaId !== "string") {
    throw new ErroDominio("categoriaId é obrigatório.");
  }

  const categoriaRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("categorias")
    .doc(categoriaId);

  const snapshot = await categoriaRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

module.exports = {
  listarCategoriasPorLoja,
  buscarCategoriaPorId,
};