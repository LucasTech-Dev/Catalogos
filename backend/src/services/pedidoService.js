const { getFirestore } = require("firebase-admin/firestore");

const {
  validarItensDoPedido,
  calcularValoresPedido,
} = require("./pedidoItemService");

const {
  validarTransicaoStatus,
} = require("./pedidoStatusService");

const db = getFirestore();

async function criarPedido(lojaId, dadosPedido) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!dadosPedido || typeof dadosPedido !== "object") {
    throw new Error("Dados do pedido são obrigatórios.");
  }

  const {
    clienteId = null,
    enderecoId = null,
    itens,
    taxaEntrega = 0,
    desconto = 0,
    observacao = "",
    tipoEntrega = "entrega",
  } = dadosPedido;

  const itensValidados = await validarItensDoPedido(
    lojaId,
    itens
  );

  const valores = calcularValoresPedido(
    itensValidados,
    taxaEntrega,
    desconto
  );

  const pedidoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc();

  const pedido = {
    lojaId,

    clienteId,
    enderecoId,

    itens: itensValidados,

    subtotal: valores.subtotal,
    taxaEntrega: valores.taxaEntrega,
    desconto: valores.desconto,
    total: valores.total,

    observacao,
    tipoEntrega,

    status: "recebido",

    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  await pedidoRef.set(pedido);

  return {
    id: pedidoRef.id,
    ...pedido,
  };
}

async function buscarPedidoPorId(lojaId, pedidoId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!pedidoId || typeof pedidoId !== "string") {
    throw new Error("pedidoId é obrigatório.");
  }

  const pedidoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc(pedidoId);

  const snapshot = await pedidoRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function listarPedidos(lojaId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  const pedidosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .orderBy("criadoEm", "desc");

  const snapshot = await pedidosRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function atualizarStatusPedido(
  lojaId,
  pedidoId,
  novoStatus
) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!pedidoId || typeof pedidoId !== "string") {
    throw new Error("pedidoId é obrigatório.");
  }

  if (!novoStatus || typeof novoStatus !== "string") {
    throw new Error("Novo status é obrigatório.");
  }

  const pedidoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc(pedidoId);

  const snapshot = await pedidoRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const pedidoAtual = snapshot.data();

  validarTransicaoStatus(
    pedidoAtual.status,
    novoStatus
  );

  await pedidoRef.update({
    status: novoStatus,
    atualizadoEm: new Date(),
  });

  const pedidoAtualizado = await pedidoRef.get();

  return {
    id: pedidoAtualizado.id,
    ...pedidoAtualizado.data(),
  };
}

module.exports = {
  criarPedido,
  buscarPedidoPorId,
  listarPedidos,
  atualizarStatusPedido,
};