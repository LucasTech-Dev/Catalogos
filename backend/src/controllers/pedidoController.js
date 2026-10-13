const {
  criarPedido,
  buscarPedidoPorId,
  listarPedidos,
  atualizarStatusPedido,
  atualizarPagamentoPedido,
} = require("../services/pedidoService");

const {
  gerarFinalizacaoWhatsApp,
} = require("../services/whatsappService");

async function podeLerPedido(req, res) {
  const pedido = await buscarPedidoPorId(req.params.lojaId, req.params.pedidoId);
  if (!pedido || (req.user.role !== "admin" && pedido.clienteId !== req.user.uid)) {
    res.status(404).json({error: "Pedido não encontrado."});
    return false;
  }
  return true;
}

async function criarNovoPedido(req, res) {
  try {
    const { lojaId } = req.params;

    if (req.user.role !== "admin" && !req.get("Idempotency-Key")) return res.status(400).json({error:"Chave de idempotência obrigatória."});
    const pedido = await criarPedido(
      lojaId,
      req.user.role === "admin" ? req.body : {...req.body, clienteId: req.user.uid},
      { uid: req.user.uid, chave: req.get("Idempotency-Key"), publico: req.user.role !== "admin", anonimo:req.user.anonimo === true,email:req.user.email || null }
    );

    return res.status(201).json(pedido);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return res.status(error.code ? 500 : 400).json({
      error: error.code ? "Não foi possível concluir a operação." : error.message,
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

    if (req.user.role !== "admin" && pedido.clienteId !== req.user.uid) return res.status(404).json({error: "Pedido não encontrado."});
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

    if (req.user.role === "admin" && req.query.limite) {
      try {return res.json(await require('../services/adminService').listar(lojaId,'pedidos',req.query));}
      catch(e) {return res.status(e.status || 500).json({error:e.status ? e.message : 'Não foi possível consultar pedidos.'});}
    }
    const pedidos = await listarPedidos(lojaId, req.user.role === "admin" ? null : req.user.uid);

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

    if (req.user.role !== "admin" && pedido.clienteId !== req.user.uid) return res.status(404).json({error: "Pedido não encontrado."});
    return res.status(200).json(pedido);
  } catch (error) {
    console.error(
      "Erro ao atualizar status do pedido:",
      error
    );

    return res.status(error.code ? 500 : 400).json({
      error: error.code ? "Não foi possível concluir a operação." : error.message,
    });
  }
}

async function atualizarPagamentoDoPedido(req, res) {
  try {
    const { lojaId, pedidoId } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        error: "Status de pagamento é obrigatório.",
      });
    }

    const pedido = await atualizarPagamentoPedido(
      lojaId,
      pedidoId,
      status
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido não encontrado.",
      });
    }

    if (req.user.role !== "admin" && pedido.clienteId !== req.user.uid) return res.status(404).json({error: "Pedido não encontrado."});
    return res.status(200).json(pedido);
  } catch (error) {
    console.error(
      "Erro ao atualizar pagamento do pedido:",
      error
    );

    return res.status(error.code ? 500 : 400).json({
      error: error.code ? "Não foi possível concluir a operação." : error.message,
    });
  }
}

async function gerarWhatsappDoPedido(req, res) {
  try {
    const { lojaId, pedidoId } = req.params;

    if (!await podeLerPedido(req, res)) return;
    const finalizacao = await gerarFinalizacaoWhatsApp(
      lojaId,
      pedidoId
    );

    if (!finalizacao) {
      return res.status(404).json({
        error: "Pedido não encontrado.",
      });
    }

    return res.status(200).json(finalizacao);
  } catch (error) {
    console.error(
      "Erro ao gerar WhatsApp do pedido:",
      error
    );

    return res.status(error.code ? 500 : 400).json({
      error: error.code ? "Não foi possível concluir a operação." : error.message,
    });
  }
}

module.exports = {
  criarNovoPedido,
  buscarPedido,
  listarPedidosDaLoja,
  atualizarStatusDoPedido,
  atualizarPagamentoDoPedido,
  gerarWhatsappDoPedido,
};
