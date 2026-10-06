const {
  listarCategoriasPorLoja,
  buscarCategoriaPorId,
} = require("../services/categoriaService");

async function listarCategorias(req, res) {
  try {
    const { lojaId } = req.params;

    const categorias = await listarCategoriasPorLoja(lojaId);

    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);

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

    if (!categoria) {
      return res.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar categoria.",
    });
  }
}

module.exports = {
  listarCategorias,
  buscarCategoria,
};