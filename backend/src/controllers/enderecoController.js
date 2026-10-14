const {ErroHttp}=require('../lib/seguranca');
const {
  listarEnderecosPorCliente,
  buscarEnderecoPorId,
} = require("../services/enderecoService");

async function listarEnderecos(req, res) {
  const { lojaId, clienteId } = req.params;

  const enderecos = await listarEnderecosPorCliente(
    lojaId,
    clienteId
  );

  return res.status(200).json(enderecos.map(require("../lib/projecoes").endereco));
}

async function buscarEndereco(req, res) {
  const { lojaId, clienteId, enderecoId } = req.params;

  const endereco = await buscarEnderecoPorId(
    lojaId,
    clienteId,
    enderecoId
  );

  if (!endereco) {
    throw new ErroHttp("Endereço não encontrado.",404,'nao_encontrado');
  }

  return res.status(200).json(require("../lib/projecoes").endereco(endereco));
}

module.exports = {
  listarEnderecos,
  buscarEndereco,
};