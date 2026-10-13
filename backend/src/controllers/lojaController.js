const {
  buscarLojaPorId,
  atualizarPagamentosDaLoja,
} = require("../services/lojaService");

async function buscarLoja(req, res) {
  try {
    const { lojaId } = req.params;

    const loja = await buscarLojaPorId(lojaId);

    if (!loja) {
      return res.status(404).json({
        error: "Loja não encontrada.",
      });
    }

    return res.status(200).json(require("../lib/projecoes").loja(loja));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("lojaController",error);

    return res.status(500).json({
      error: "Erro interno ao buscar loja.",
    });
  }
}

async function atualizarPagamentos(req, res) {
  try {
    const { lojaId } = req.params;

    const loja = await atualizarPagamentosDaLoja(
      lojaId,
      req.body
    );

    if (!loja) {
      return res.status(404).json({
        error: "Loja não encontrada.",
      });
    }

    return res.status(200).json(require("../lib/projecoes").loja(loja));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("lojaController",error);

    return require("../lib/seguranca").responderErro(res,error);
  }
}

module.exports = {
  buscarLoja,
  atualizarPagamentos,
};
