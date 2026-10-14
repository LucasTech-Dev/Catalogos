const {ErroHttp}=require('../lib/seguranca');
const {
  buscarLojaPorId,
  atualizarPagamentosDaLoja,
} = require("../services/lojaService");

async function buscarLoja(req, res) {
  const { lojaId } = req.params;

  const loja = await buscarLojaPorId(lojaId);

  if (!loja) {
    throw new ErroHttp("Loja não encontrada.",404,'nao_encontrado');
  }

  return res.status(200).json(require("../lib/projecoes").loja(loja));
}

async function atualizarPagamentos(req, res) {
  const { lojaId } = req.params;

  const loja = await atualizarPagamentosDaLoja(
    lojaId,
    req.body
  );

  if (!loja) {
    throw new ErroHttp("Loja não encontrada.",404,'nao_encontrado');
  }

  return res.status(200).json(require("../lib/projecoes").loja(loja));
}

module.exports = {
  buscarLoja,
  atualizarPagamentos,
};
