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

    return res.status(201).json(require("../lib/projecoes").pedido(pedido));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("pedidoController",error);

    return require("../lib/seguranca").responderErro(res,error);
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
    return res.status(200).json(require("../lib/projecoes").pedido(pedido));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("pedidoController",error);

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
      catch(e) {require('../lib/seguranca').registrarFalha('listagem-pedidos',e);return require('../lib/seguranca').responderErro(res,e);}
    }
    const pedidos = await listarPedidos(lojaId, req.user.role === "admin" ? null : req.user.uid);

    return res.status(200).json(pedidos.map(require("../lib/projecoes").pedido));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("pedidoController",error);

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
    return res.status(200).json(require("../lib/projecoes").pedido(pedido));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("pedidoController",error);

    return require("../lib/seguranca").responderErro(res,error);
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
    return res.status(200).json(require("../lib/projecoes").pedido(pedido));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("pedidoController",error);

    return require("../lib/seguranca").responderErro(res,error);
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
    require("../lib/seguranca").registrarFalha("pedidoController",error);

    return require("../lib/seguranca").responderErro(res,error);
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
