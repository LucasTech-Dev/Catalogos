const {
  listarProdutosPorLoja,
  buscarProdutoPorId,
} = require("../services/produtoService");

async function listarProdutos(req, res) {
  try {
    const { lojaId } = req.params;

    const produtos = await listarProdutosPorLoja(lojaId);

    return res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);

    return res.status(500).json({
      error: "Erro interno ao listar produtos.",
    });
  }
}

async function buscarProduto(req, res) {
  try {
    const { lojaId, produtoId } = req.params;

    const produto = await buscarProdutoPorId(
      lojaId,
      produtoId
    );

    if (!produto) {
      return res.status(404).json({
        error: "Produto não encontrado.",
      });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar produto.",
    });
  }
}

module.exports = {
  listarProdutos,
  buscarProduto,
};