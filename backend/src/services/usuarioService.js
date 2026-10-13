const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

const ROLES_VALIDAS = ["cliente", "admin"];

function validarDadosUsuario(dados) {
  if (!dados || typeof dados !== "object") {
    throw new ErroDominio("Dados do usuário são obrigatórios.");
  }

  if (!dados.nome || typeof dados.nome !== "string") {
    throw new ErroDominio("Nome do usuário é obrigatório.");
  }

  if (!dados.email || typeof dados.email !== "string") {
    throw new ErroDominio("E-mail do usuário é obrigatório.");
  }

  const email = dados.email.trim().toLowerCase();

  if (!email.includes("@")) {
    throw new ErroDominio("E-mail do usuário inválido.");
  }

  if (dados.role && !ROLES_VALIDAS.includes(dados.role)) {
    throw new ErroDominio("Role de usuário inválida.");
  }

  if (
    dados.lojaId !== undefined &&
    dados.lojaId !== null &&
    typeof dados.lojaId !== "string"
  ) {
    throw new ErroDominio("lojaId deve ser uma string ou null.");
  }

  if (
    dados.ativo !== undefined &&
    typeof dados.ativo !== "boolean"
  ) {
    throw new ErroDominio("ativo deve ser boolean.");
  }

  return {
    nome: dados.nome.trim(),
    email,
    role: dados.role || "cliente",
    lojaId: dados.lojaId || null,
    ativo: dados.ativo ?? true,
  };
}

async function criarUsuario(uid, dados) {
  if (!uid || typeof uid !== "string") {
    throw new ErroDominio("UID do usuário é obrigatório.");
  }

  const dadosValidados = validarDadosUsuario(dados);

  const usuarioRef = db.collection("usuarios").doc(uid);

  const usuario = {
    ...dadosValidados,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  await usuarioRef.set(usuario);

  return {
    id: uid,
    ...usuario,
  };
}

async function buscarUsuarioPorId(uid) {
  require('../lib/identificadores').identificador(uid);

  if (!uid || typeof uid !== "string") {
    throw new ErroDominio("UID do usuário é obrigatório.");
  }

  const usuarioRef = db.collection("usuarios").doc(uid);
  const snapshot = await usuarioRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

module.exports = {
  criarUsuario,
  buscarUsuarioPorId,
  validarDadosUsuario,
  ROLES_VALIDAS,
};