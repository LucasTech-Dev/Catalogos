const {ErroHttp}=require('../lib/seguranca');
const {
  listarCategoriasPorLoja,
  buscarCategoriaPorId,
} = require("../services/categoriaService");

async function listarCategorias(req, res) {
  const { lojaId } = req.params;

  const categorias = await listarCategoriasPorLoja(lojaId);

  return res.status(200).json((req.user.role==="admin"?categorias:categorias.filter(c=>c.ativo!==false)).map(require("../lib/projecoes").categoria));
}

async function buscarCategoria(req, res) {
  const { lojaId, categoriaId } = req.params;

  const categoria = await buscarCategoriaPorId(
    lojaId,
    categoriaId
  );

  if (!categoria || (req.user.role!=="admin" && categoria.ativo===false)) {
    throw new ErroHttp("Categoria não encontrada.",404,'nao_encontrado');
  }

  return res.status(200).json(require("../lib/projecoes").categoria(categoria));
}

module.exports = {
  listarCategorias,
  buscarCategoria,
};