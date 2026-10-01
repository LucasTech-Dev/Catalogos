const { buscarUsuarioPorId } = require("../services/usuarioService");

async function buscarUsuarioAtual(req, res) {
  try {
    const uid = req.user.uid;

    const usuario = await buscarUsuarioPorId(uid);

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado.",
      });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar usuário.",
    });
  }
}

module.exports = {
  buscarUsuarioAtual,
};