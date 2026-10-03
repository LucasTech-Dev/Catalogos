const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function buscarLojaPorId(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  const lojaRef = db.collection("lojas").doc(lojaId);
  const snapshot = await lojaRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

module.exports = {
  buscarLojaPorId,
};