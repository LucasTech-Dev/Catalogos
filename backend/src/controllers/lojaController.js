const { buscarLojaPorId } = require("../services/lojaService");

async function buscarLoja(req, res) {
  try {
    const { lojaId } = req.params;

    const loja = await buscarLojaPorId(lojaId);

    if (!loja) {
      return res.status(404).json({
        error: "Loja não encontrada.",
      });
    }

    return res.status(200).json(loja);
  } catch (error) {
    console.error("Erro ao buscar loja:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar loja.",
    });
  }
}

module.exports = {
  buscarLoja,
};