const { getFirestore } = require("firebase-admin/firestore");

const {
  validarItensDoPedido,
} = require("./pedidoItemService");

const {
  calcularValoresPedido,
} = require("./pedidoCalculoService");

const {
  validarTransicaoStatus,
} = require("./pedidoStatusService");

const {
  validarDadosIniciaisPedido,
} = require("./pedidoValidacaoService");

const {
  buscarEnderecoPorId,
} = require("./enderecoService");

const {
  buscarLojaPorId,
} = require("./lojaService");

const {
  validarPagamentoInicial,
  validarTransicaoPagamento,
} = require("./pagamentoService");

const db = getFirestore();

async function criarPedido(lojaId, dadosPedido) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!dadosPedido || typeof dadosPedido !== "object") {
    throw new Error("Dados do pedido são obrigatórios.");
  }

  const dadosValidados = validarDadosIniciaisPedido(
    lojaId,
    dadosPedido
  );

  const {
    clienteId = null,
    enderecoId,
    itens,
    taxaEntrega,
    desconto = 0,
    observacao = "",
    tipoEntrega,
    pagamento,
    formaPagamento,
  } = dadosValidados;

  const loja = await buscarLojaPorId(lojaId);

  if (!loja) {
    throw new Error("Loja não encontrada.");
  }

  const dadosEntrega = {
    enderecoId,
    taxaEntrega,
    tipoEntrega,
  };

  if (dadosEntrega.tipoEntrega === "entrega") {
    if (!clienteId || typeof clienteId !== "string") {
      throw new Error(
        "clienteId é obrigatório para pedidos com entrega."
      );
    }

    const endereco = await buscarEnderecoPorId(
      lojaId,
      clienteId,
      dadosEntrega.enderecoId
    );

    if (!endereco) {
      throw new Error(
        "Endereço não encontrado para este cliente e loja."
      );
    }
  }

  const itensValidados = await validarItensDoPedido(
    lojaId,
    itens
  );

  const valores = calcularValoresPedido(
    itensValidados,
    dadosEntrega.taxaEntrega,
    desconto
  );

  const pagamentoValidado = validarPagamentoInicial({
    dadosPagamento: pagamento || {
      forma: formaPagamento,
    },
    loja,
    valorCalculado: valores.total,
  });

  const pedidoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc();

  const pedido = {
    lojaId,

    clienteId,
    enderecoId: dadosEntrega.enderecoId,

    itens: itensValidados,

    subtotal: valores.subtotal,
    taxaEntrega: valores.taxaEntrega,
    desconto: valores.desconto,
    total: valores.total,
    pagamento: pagamentoValidado,

    observacao,
    tipoEntrega: dadosEntrega.tipoEntrega,

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

async function atualizarPagamentoPedido(
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

  if (pedidoAtual.status === "cancelado") {
    throw new Error(
      "Não é possível atualizar pagamento de pedido cancelado."
    );
  }

  if (!pedidoAtual.pagamento) {
    throw new Error("Pedido não possui dados de pagamento.");
  }

  const statusPagamento = validarTransicaoPagamento(
    pedidoAtual.pagamento.status,
    novoStatus
  );

  await pedidoRef.update({
    pagamento: {
      ...pedidoAtual.pagamento,
      status: statusPagamento,
      atualizadoEm: new Date(),
    },
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
  atualizarPagamentoPedido,
};
