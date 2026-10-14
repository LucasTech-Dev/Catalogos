const {ErroHttp}=require('../lib/seguranca');
const {
  listarProdutosPorLoja,
  buscarProdutoPorId,
} = require("../services/produtoService");

async function listarProdutos(req, res) {
  const { lojaId } = req.params;

  const produtos = await listarProdutosPorLoja(lojaId);

  return res.status(200).json((req.user.role==="admin"?produtos:produtos.filter(p=>p.ativo===true)).map(require("../lib/projecoes").produto));
}

async function buscarProduto(req, res) {
  const { lojaId, produtoId } = req.params;

  const produto = await buscarProdutoPorId(
    lojaId,
    produtoId
  );

  if (!produto || (req.user.role!=="admin" && produto.ativo!==true)) {
    throw new ErroHttp("Produto não encontrado.",404,'nao_encontrado');
  }

  return res.status(200).json(require("../lib/projecoes").produto(produto));
}

module.exports = {
  listarProdutos,
  buscarProduto,
};