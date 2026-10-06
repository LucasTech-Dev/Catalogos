const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarClientesPorLoja(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  const clientesRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes");

  const snapshot = await clientesRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function buscarClientePorId(lojaId, clienteId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!clienteId || typeof clienteId !== "string") {
    throw new Error("clienteId é obrigatório.");
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
    id: snapshot.id,
    ...snapshot.data(),
  };
}

module.exports = {
  listarClientesPorLoja,
  buscarClientePorId,
};