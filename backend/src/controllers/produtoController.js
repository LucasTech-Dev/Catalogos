const {
  listarProdutosPorLoja,
  buscarProdutoPorId,
} = require("../services/produtoService");

async function listarProdutos(req, res) {
  try {
    const { lojaId } = req.params;

    const produtos = await listarProdutosPorLoja(lojaId);

    return res.status(200).json((req.user.role==="admin"?produtos:produtos.filter(p=>p.ativo===true)).map(require("../lib/projecoes").produto));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("produtoController",error);

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

    if (!produto || (req.user.role!=="admin" && produto.ativo!==true)) {
      return res.status(404).json({
        error: "Produto não encontrado.",
      });
    }

    return res.status(200).json(require("../lib/projecoes").produto(produto));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("produtoController",error);

    return res.status(500).json({
      error: "Erro interno ao buscar produto.",
    });
  }
}

module.exports = {
  listarProdutos,
  buscarProduto,
};