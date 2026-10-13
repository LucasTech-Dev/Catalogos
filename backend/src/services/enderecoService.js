const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function listarEnderecosPorCliente(lojaId, clienteId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!clienteId || typeof clienteId !== "string") {
    throw new ErroDominio("clienteId é obrigatório.");
  }

  const enderecosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("clientes")
    .doc(clienteId)
    .collection("enderecos");

  const snapshot = await enderecosRef.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}

async function buscarEnderecoPorId(
  lojaId,
  clienteId,
  enderecoId
) {
  for(const id of [lojaId,clienteId,enderecoId])require('../lib/identificadores').identificador(id);
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!clienteId || typeof clienteId !== "string") {
    throw new ErroDominio("clienteId é obrigatório.");
  }

  if (!enderecoId || typeof enderecoId !== "string") {
    throw new ErroDominio("enderecoId é obrigatório.");
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
    ...snapshot.data(),
    id: snapshot.id,
  };
}

module.exports = {
  listarEnderecosPorCliente,
  buscarEnderecoPorId,
};