const {ErroHttp}=require('../lib/seguranca');
const {
  listarClientesPorLoja,
  buscarClientePorId,
} = require("../services/clienteService");

async function listarClientes(req, res) {
  const { lojaId } = req.params;

  const clientes = await listarClientesPorLoja(lojaId);

  return res.status(200).json(clientes.map(c=>require("../lib/projecoes").cliente(c)));
}

async function buscarCliente(req, res) {
  const { lojaId, clienteId } = req.params;

  const cliente = await buscarClientePorId(
    lojaId,
    clienteId
  );

  if (!cliente) {
    throw new ErroHttp("Cliente não encontrado.",404,'nao_encontrado');
  }

  return res.status(200).json(require("../lib/projecoes").cliente(cliente));
}

module.exports = {
  listarClientes,
  buscarCliente,
};