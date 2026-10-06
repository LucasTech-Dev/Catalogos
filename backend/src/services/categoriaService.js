const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarCategoriasPorLoja(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  const categoriasRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("categorias");

  const snapshot = await categoriasRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function buscarCategoriaPorId(lojaId, categoriaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!categoriaId || typeof categoriaId !== "string") {
    throw new Error("categoriaId é obrigatório.");
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
    id: snapshot.id,
    ...snapshot.data(),
  };
}

module.exports = {
  listarCategoriasPorLoja,
  buscarCategoriaPorId,
};