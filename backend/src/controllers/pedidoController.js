const {ErroHttp}=require('../lib/seguranca');
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
    throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  }
  return true;
}

async function criarNovoPedido(req, res) {
  const { lojaId } = req.params;

  if (req.user.role !== "admin" && !req.get("Idempotency-Key")) throw new ErroHttp("Chave de idempotência obrigatória.",400,'validacao');
  const pedido = await criarPedido(
    lojaId,
    req.user.role === "admin" ? req.body : {...req.body, clienteId: req.user.uid},
    { uid: req.user.uid, chave: req.get("Idempotency-Key"), publico: req.user.role !== "admin", anonimo:req.user.anonimo === true,email:req.user.email || null }
  );

  return res.status(201).json(require("../lib/projecoes").pedido(pedido));
}

async function buscarPedido(req, res) {
  const { lojaId, pedidoId } = req.params;

  const pedido = await buscarPedidoPorId(
    lojaId,
    pedidoId
  );

  if (!pedido) {
    throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  }

  if (req.user.role !== "admin" && pedido.clienteId !== req.user.uid) throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  return res.status(200).json(require("../lib/projecoes").pedido(pedido));
}

async function listarPedidosDaLoja(req, res) {
  const { lojaId } = req.params;

  if (req.user.role === "admin" && req.query.limite) {
    return res.json(await require('../services/adminService').listar(lojaId,'pedidos',req.query));
  }
  const pedidos = await listarPedidos(lojaId, req.user.role === "admin" ? null : req.user.uid);

  return res.status(200).json(pedidos.map(require("../lib/projecoes").pedido));
}

async function atualizarStatusDoPedido(req, res) {
  const { lojaId, pedidoId } = req.params;
  const { status } = req.body;

  if (!status || typeof status !== "string") {
    throw new ErroHttp("Status é obrigatório.",400,'validacao');
  }

  const pedido = await atualizarStatusPedido(
    lojaId,
    pedidoId,
    status
  );

  if (!pedido) {
    throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  }

  if (req.user.role !== "admin" && pedido.clienteId !== req.user.uid) throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  return res.status(200).json(require("../lib/projecoes").pedido(pedido));
}

async function atualizarPagamentoDoPedido(req, res) {
  const { lojaId, pedidoId } = req.params;
  const { status } = req.body;

  if (!status || typeof status !== "string") {
    throw new ErroHttp("Status de pagamento é obrigatório.",400,'validacao');
  }

  const pedido = await atualizarPagamentoPedido(
    lojaId,
    pedidoId,
    status
  );

  if (!pedido) {
    throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  }

  if (req.user.role !== "admin" && pedido.clienteId !== req.user.uid) throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  return res.status(200).json(require("../lib/projecoes").pedido(pedido));
}

async function gerarWhatsappDoPedido(req, res) {
  const { lojaId, pedidoId } = req.params;

  if (!await podeLerPedido(req, res)) return;
  const finalizacao = await gerarFinalizacaoWhatsApp(
    lojaId,
    pedidoId
  );

  if (!finalizacao) {
    throw new ErroHttp("Pedido não encontrado.",404,'nao_encontrado');
  }

  return res.status(200).json(finalizacao);
}

module.exports = {
  criarNovoPedido,
  buscarPedido,
  listarPedidosDaLoja,
  atualizarStatusDoPedido,
  atualizarPagamentoDoPedido,
  gerarWhatsappDoPedido,
};
