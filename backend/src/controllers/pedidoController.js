const {
  criarPedido,
  buscarPedidoPorId,
  listarPedidos,
  atualizarStatusPedido,
} = require("../services/pedidoService");

async function criarNovoPedido(req, res) {
  try {
    const { lojaId } = req.params;

    const pedido = await criarPedido(
      lojaId,
      req.body
    );

    return res.status(201).json(pedido);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return res.status(400).json({
      error: error.message,
    });
  }
}

async function buscarPedido(req, res) {
  try {
    const { lojaId, pedidoId } = req.params;

    const pedido = await buscarPedidoPorId(
      lojaId,
      pedidoId
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido não encontrado.",
      });
    }

    return res.status(200).json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar pedido.",
    });
  }
}

async function listarPedidosDaLoja(req, res) {
  try {
    const { lojaId } = req.params;

    const pedidos = await listarPedidos(lojaId);

    return res.status(200).json(pedidos);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);

    return res.status(500).json({
      error: "Erro interno ao listar pedidos.",
    });
  }
}

async function atualizarStatusDoPedido(req, res) {
  try {
    const { lojaId, pedidoId } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        error: "Status é obrigatório.",
      });
    }

    const pedido = await atualizarStatusPedido(
      lojaId,
      pedidoId,
      status
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido não encontrado.",
      });
    }

    return res.status(200).json(pedido);
  } catch (error) {
    console.error(
      "Erro ao atualizar status do pedido:",
      error
    );

    return res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  criarNovoPedido,
  buscarPedido,
  listarPedidosDaLoja,
  atualizarStatusDoPedido,
};