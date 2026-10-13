const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarClientesPorLoja(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  const clientesRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes");

  const snapshot = await clientesRef.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}

async function buscarClientePorId(lojaId, clienteId) {
  require('../lib/identificadores').identificador(lojaId);
  require('../lib/identificadores').identificador(clienteId);

  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!clienteId || typeof clienteId !== "string") {
    throw new ErroDominio("clienteId é obrigatório.");
  }

  const clienteRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc(clienteId);

  const snapshot = await clienteRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

module.exports = {
  listarClientesPorLoja,
  buscarClientePorId,
};