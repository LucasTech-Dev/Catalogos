const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const {
  validarConfiguracaoPagamentos,
} = require("./pagamentoService");

const db = getFirestore();

async function buscarLojaPorId(lojaId) {
  require('../lib/identificadores').identificador(lojaId);

  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  const lojaRef = db.collection("lojas").doc(lojaId);
  const snapshot = await lojaRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

async function atualizarPagamentosDaLoja(lojaId, pagamentos) {
  require("../lib/identificadores").identificador(lojaId);
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  const pagamentosValidados =
    validarConfiguracaoPagamentos(pagamentos);

  const lojaRef = db.collection("lojas").doc(lojaId);
  const snapshot = await lojaRef.get();

  if (!snapshot.exists) {
    return null;
  }

  await lojaRef.update({
    pagamentos: pagamentosValidados,
    atualizadoEm: new Date(),
  });

  const lojaAtualizada = await lojaRef.get();

  return {
    id: lojaAtualizada.id,
    ...lojaAtualizada.data(),
  };
}

module.exports = {
  buscarLojaPorId,
  atualizarPagamentosDaLoja,
};
