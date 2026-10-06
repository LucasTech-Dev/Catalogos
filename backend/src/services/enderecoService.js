const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarEnderecosPorCliente(lojaId, clienteId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!clienteId || typeof clienteId !== "string") {
    throw new Error("clienteId é obrigatório.");
  }

  const enderecosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc(clienteId)
    .collection("enderecos");

  const snapshot = await enderecosRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function buscarEnderecoPorId(
  lojaId,
  clienteId,
  enderecoId
) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!clienteId || typeof clienteId !== "string") {
    throw new Error("clienteId é obrigatório.");
  }

  if (!enderecoId || typeof enderecoId !== "string") {
    throw new Error("enderecoId é obrigatório.");
  }

  const enderecoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc(clienteId)
    .collection("enderecos")
    .doc(enderecoId);

  const snapshot = await enderecoRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

module.exports = {
  listarEnderecosPorCliente,
  buscarEnderecoPorId,
};