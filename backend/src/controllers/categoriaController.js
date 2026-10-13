const {
  listarCategoriasPorLoja,
  buscarCategoriaPorId,
} = require("../services/categoriaService");

async function listarCategorias(req, res) {
  try {
    const { lojaId } = req.params;

    const categorias = await listarCategoriasPorLoja(lojaId);

    return res.status(200).json((req.user.role==="admin"?categorias:categorias.filter(c=>c.ativo!==false)).map(require("../lib/projecoes").categoria));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("categoriaController",error);

    return res.status(500).json({
      error: "Erro interno ao listar categorias.",
    });
  }
}

async function buscarCategoria(req, res) {
  try {
    const { lojaId, categoriaId } = req.params;

    const categoria = await buscarCategoriaPorId(
      lojaId,
      categoriaId
    );

    if (!categoria || (req.user.role!=="admin" && categoria.ativo===false)) {
      return res.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    return res.status(200).json(require("../lib/projecoes").categoria(categoria));
  } catch (error) {
    require("../lib/seguranca").registrarFalha("categoriaController",error);

    return res.status(500).json({
      error: "Erro interno ao buscar categoria.",
    });
  }
}

module.exports = {
  listarCategorias,
  buscarCategoria,
};